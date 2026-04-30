package repository

import (
	"context"

	"banhcuon/be/internal/db"
)

// FileRepository wraps sqlc file_attachment queries.
type FileRepository interface {
	CreateFileAttachment(ctx context.Context, arg db.CreateFileAttachmentParams) error
	GetFileAttachmentByID(ctx context.Context, id string) (db.FileAttachment, error)
	DeleteOrphanFilesOlderThan24h(ctx context.Context) error
}

type fileRepo struct {
	q *db.Queries
}

// NewFileRepo creates a FileRepository.
func NewFileRepo(dbtx db.DBTX) FileRepository {
	return &fileRepo{q: db.New(dbtx)}
}

func (r *fileRepo) CreateFileAttachment(ctx context.Context, arg db.CreateFileAttachmentParams) error {
	return r.q.CreateFileAttachment(ctx, arg)
}

func (r *fileRepo) GetFileAttachmentByID(ctx context.Context, id string) (db.FileAttachment, error) {
	return r.q.GetFileAttachmentByID(ctx, id)
}

func (r *fileRepo) DeleteOrphanFilesOlderThan24h(ctx context.Context) error {
	return r.q.DeleteOrphanFilesOlderThan24h(ctx)
}

var _ FileRepository = (*fileRepo)(nil)
