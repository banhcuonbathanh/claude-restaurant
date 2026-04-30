// Package jobs contains background goroutines for cleanup and timeout tasks.
package jobs

import (
	"context"
	"database/sql"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"
)

// StartPaymentTimeoutWatcher polls every minute for pending payments whose
// expires_at has passed and marks them as failed.
// Call in a goroutine: go StartPaymentTimeoutWatcher(ctx, sqlDB, rdb).
func StartPaymentTimeoutWatcher(ctx context.Context, sqlDB *sql.DB, rdb *redis.Client) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			expirePayments(ctx, sqlDB, rdb)
		}
	}
}

func expirePayments(ctx context.Context, sqlDB *sql.DB, rdb *redis.Client) {
	defer func() {
		if r := recover(); r != nil {
			slog.ErrorContext(ctx, "jobs: payment timeout panic", "err", r)
		}
	}()

	result, err := sqlDB.ExecContext(ctx,
		`UPDATE payments
		 SET status = 'failed', updated_at = NOW()
		 WHERE status = 'pending'
		   AND expires_at IS NOT NULL
		   AND expires_at < NOW()
		   AND deleted_at IS NULL`)
	if err != nil {
		slog.WarnContext(ctx, "jobs: expire payments failed", "err", err)
		return
	}

	n, _ := result.RowsAffected()
	if n > 0 {
		slog.InfoContext(ctx, "jobs: expired pending payments", "count", n)
	}
}
