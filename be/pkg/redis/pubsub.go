package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

// Publish sends payload to channel. Payload should be JSON-encodable.
func Publish(ctx context.Context, rdb *redis.Client, channel string, payload any) error {
	return rdb.Publish(ctx, channel, payload).Err()
}

// Subscribe returns a PubSub handle subscribed to the given channels.
// Caller must call ps.Close() when done.
func Subscribe(ctx context.Context, rdb *redis.Client, channels ...string) *redis.PubSub {
	return rdb.Subscribe(ctx, channels...)
}

// Unsubscribe removes the given channels from the PubSub handle.
func Unsubscribe(ctx context.Context, ps *redis.PubSub, channels ...string) error {
	return ps.Unsubscribe(ctx, channels...)
}
