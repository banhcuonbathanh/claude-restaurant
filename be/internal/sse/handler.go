// Package sse provides Server-Sent Events streaming for order tracking.
package sse

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

const heartbeatInterval = 15 * time.Second

// StreamOrder subscribes to the Redis pub/sub channel for the given orderID
// and streams events to the client. Sends a 15s heartbeat to keep the
// connection alive through proxies.
//
// Auth is validated upstream by middleware before this handler is called.
func StreamOrder(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderID := c.Param("id")
		if orderID == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error":   "INVALID_INPUT",
				"message": "order ID required",
			})
			return
		}

		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")
		c.Header("X-Accel-Buffering", "no")
		c.Status(http.StatusOK)

		ctx, cancel := context.WithCancel(c.Request.Context())
		defer cancel()

		channel := fmt.Sprintf("order:%s", orderID)
		pubsub := rdb.Subscribe(ctx, channel)
		defer pubsub.Close()

		msgCh := pubsub.Channel()
		ticker := time.NewTicker(heartbeatInterval)
		defer ticker.Stop()

		// Flush initial connection confirmation
		fmt.Fprintf(c.Writer, "event: connected\ndata: {\"order_id\":\"%s\"}\n\n", orderID)
		c.Writer.Flush()

		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-msgCh:
				if !ok {
					return
				}
				fmt.Fprintf(c.Writer, "data: %s\n\n", msg.Payload)
				c.Writer.Flush()
			case <-ticker.C:
				fmt.Fprintf(c.Writer, ": keep-alive\n\n")
				c.Writer.Flush()
			}
		}
	}
}
