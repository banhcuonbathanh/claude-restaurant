package sse

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// StreamOrderMonitor subscribes to the order-specific channel plus two broadcast
// channels (queue:broadcast and tables:broadcast) and streams all three event
// types to the guest client:
//
//   - order.status   — published on order/{id} when this order's status changes
//   - queue.update   — published on queue:broadcast after any order status change
//   - tables.status  — published on tables:broadcast after any order status change
//
// Auth is validated upstream by middleware before this handler is called.
func StreamOrderMonitor(rdb *redis.Client) gin.HandlerFunc {
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

		orderChannel   := fmt.Sprintf("order:%s", orderID)
		pubsub := rdb.Subscribe(ctx, orderChannel, "queue:broadcast", "tables:broadcast")
		defer pubsub.Close()

		msgCh  := pubsub.Channel()
		ticker := time.NewTicker(heartbeatInterval)
		defer ticker.Stop()

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
