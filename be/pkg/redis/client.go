// Package redis provides the Redis Stack client singleton.
package redis

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

// New creates a Redis client from REDIS_URL env var.
func New() (*redis.Client, error) {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		return nil, fmt.Errorf("redis: REDIS_URL env not set")
	}

	opt, err := redis.ParseURL(url)
	if err != nil {
		return nil, fmt.Errorf("redis: parse URL: %w", err)
	}

	return redis.NewClient(opt), nil
}

// HealthCheck pings Redis and returns an error if unreachable.
func HealthCheck(ctx context.Context, rdb *redis.Client) error {
	if err := rdb.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis: ping failed: %w", err)
	}
	return nil
}
