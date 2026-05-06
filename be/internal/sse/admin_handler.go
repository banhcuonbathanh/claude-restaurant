package sse

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// StreamAdmin subscribes to the orders:admin Redis channel and streams
// new-order events to manager/admin dashboard clients.
func StreamAdmin(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")
		c.Header("X-Accel-Buffering", "no")
		c.Status(http.StatusOK)

		ctx, cancel := context.WithCancel(c.Request.Context())
		defer cancel()

		pubsub := rdb.Subscribe(ctx, "orders:admin")
		defer pubsub.Close()

		msgCh := pubsub.Channel()
		ticker := time.NewTicker(heartbeatInterval)
		defer ticker.Stop()

		fmt.Fprintf(c.Writer, "event: connected\ndata: {}\n\n")
		c.Writer.Flush()

		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-msgCh:
				if !ok {
					return
				}
				eventType := extractEventType(msg.Payload)
				fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", eventType, msg.Payload)
				c.Writer.Flush()
			case <-ticker.C:
				fmt.Fprintf(c.Writer, ": keep-alive\n\n")
				c.Writer.Flush()
			}
		}
	}
}
