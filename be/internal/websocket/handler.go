package websocket

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"

	jwtpkg "banhcuon/be/pkg/jwt"
)

// KDSHandler upgrades the connection for the kitchen display (Chef+).
// Auth is via ?token=<access_token> query param (browser WS cannot set headers).
func KDSHandler(hub *Hub, rdb *redis.Client) gin.HandlerFunc {
	return wsHandler(hub, rdb, "orders:kds")
}

// LiveHandler upgrades the connection for the live orders monitor (Cashier+).
func LiveHandler(hub *Hub, rdb *redis.Client) gin.HandlerFunc {
	return wsHandler(hub, rdb, "orders:kds")
}

// wsHandler is the shared upgrade + Redis fan-out logic.
// It subscribes to the given Redis channel and forwards all events to the client.
func wsHandler(hub *Hub, rdb *redis.Client, channel string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Auth via query param (browser WS limitation — cannot set custom headers)
		token := c.Query("token")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "MISSING_TOKEN",
				"message": "token query param required",
			})
			return
		}

		_, err := jwtpkg.ParseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "TOKEN_INVALID",
				"message": "Token không hợp lệ",
			})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			slog.Warn("ws: upgrade failed", "err", err)
			return
		}

		client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
		hub.register <- client

		// Subscribe to Redis channel and forward to this client.
		ctx, cancel := context.WithCancel(c.Request.Context())
		go func() {
			defer cancel()
			pubsub := rdb.Subscribe(ctx, channel)
			defer pubsub.Close()

			for msg := range pubsub.Channel() {
				// Wrap as JSON event object so FE can distinguish event types.
				var raw map[string]any
				if err := json.Unmarshal([]byte(msg.Payload), &raw); err == nil {
					if b, err := json.Marshal(raw); err == nil {
						select {
						case client.send <- b:
						default:
						}
					}
				}
			}
		}()

		go client.writePump()
		client.readPump() // blocks until disconnected
		cancel()
	}
}
