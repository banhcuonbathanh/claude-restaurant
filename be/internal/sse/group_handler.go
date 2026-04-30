package sse

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/service"
)

// StreamGroup subscribes to the Redis pub/sub channel for a group_id and
// multiplexes events from all member orders to the client (Spec4 §12.4).
// On connect it sends a full group snapshot; thereafter it re-fetches and
// re-sends the snapshot on every Redis event.
func StreamGroup(rdb *redis.Client, groupSvc *service.GroupService) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("id")
		if groupID == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error":   "INVALID_INPUT",
				"message": "group ID required",
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

		channel := fmt.Sprintf("group:%s", groupID)
		pubsub := rdb.Subscribe(ctx, channel)
		defer pubsub.Close()

		msgCh := pubsub.Channel()
		ticker := time.NewTicker(heartbeatInterval)
		defer ticker.Stop()

		sendGroupSnapshot(c, groupSvc, groupID, "group_init")

		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-msgCh:
				if !ok {
					return
				}
				// Extract event type from the Redis payload, default to group_updated.
				eventType := extractEventType(msg.Payload)
				sendGroupSnapshot(c, groupSvc, groupID, eventType)
			case <-ticker.C:
				fmt.Fprintf(c.Writer, ": keep-alive\n\n")
				c.Writer.Flush()
			}
		}
	}
}

func sendGroupSnapshot(c *gin.Context, svc *service.GroupService, groupID, eventType string) {
	orders, err := svc.GetGroupOrders(c.Request.Context(), groupID)
	if err != nil {
		return
	}
	payload := map[string]interface{}{
		"type":     eventType,
		"group_id": groupID,
		"orders":   service.GroupOrderJSON(orders),
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}
	fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", eventType, data)
	c.Writer.Flush()
}

func extractEventType(payload string) string {
	var m struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal([]byte(payload), &m); err == nil && m.Type != "" {
		return m.Type
	}
	return "group_updated"
}
