package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

// BFAdd inserts item into the Bloom filter at key.
// Returns true if item was newly added (was not already present).
// Redis Stack creates the filter automatically on first call.
func BFAdd(ctx context.Context, rdb *redis.Client, key string, item any) (bool, error) {
	return rdb.BFAdd(ctx, key, item).Result()
}

// BFExists tests whether item may be present in the Bloom filter at key.
// Returns false = definitely not present; true = probably present (false positive possible).
func BFExists(ctx context.Context, rdb *redis.Client, key string, item any) (bool, error) {
	return rdb.BFExists(ctx, key, item).Result()
}
