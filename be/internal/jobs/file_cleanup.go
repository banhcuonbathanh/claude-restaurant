package jobs

import (
	"context"
	"database/sql"
	"log/slog"
	"os"
	"path/filepath"
	"time"
)

// StartFileCleanup deletes orphan file_attachments older than 24h every 6 hours.
// Call in a goroutine: go StartFileCleanup(ctx, sqlDB).
func StartFileCleanup(ctx context.Context, sqlDB *sql.DB) {
	ticker := time.NewTicker(6 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			cleanOrphanFiles(ctx, sqlDB)
		}
	}
}

func cleanOrphanFiles(ctx context.Context, sqlDB *sql.DB) {
	defer func() {
		if r := recover(); r != nil {
			slog.ErrorContext(ctx, "jobs: file cleanup panic", "err", r)
		}
	}()

	storageBase := os.Getenv("STORAGE_BASE_PATH")

	rows, err := sqlDB.QueryContext(ctx,
		`SELECT id, object_path FROM file_attachments
		 WHERE is_orphan = 1
		   AND created_at < NOW() - INTERVAL 24 HOUR`)
	if err != nil {
		slog.WarnContext(ctx, "jobs: query orphan files failed", "err", err)
		return
	}
	defer rows.Close()

	var ids []string
	var paths []string
	for rows.Next() {
		var id, path string
		if err := rows.Scan(&id, &path); err != nil {
			continue
		}
		ids = append(ids, id)
		paths = append(paths, path)
	}
	rows.Close()

	for i, id := range ids {
		// Delete from disk
		if storageBase != "" && paths[i] != "" {
			fullPath := filepath.Join(storageBase, paths[i])
			if err := os.Remove(fullPath); err != nil && !os.IsNotExist(err) {
				slog.WarnContext(ctx, "jobs: remove file failed", "path", fullPath, "err", err)
			}
		}

		// Delete from DB
		sqlDB.ExecContext(ctx, `DELETE FROM file_attachments WHERE id = ?`, id)
	}

	if len(ids) > 0 {
		slog.InfoContext(ctx, "jobs: cleaned orphan files", "count", len(ids))
	}
}
