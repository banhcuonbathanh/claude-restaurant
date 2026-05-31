package repository

import (
	"context"
	"database/sql"

	"banhcuon/be/internal/db"
)

type TrainingRepository interface {
	ListGuides(ctx context.Context) ([]db.TrainingGuide, error)
	ListGuidesByRole(ctx context.Context, role db.TrainingGuidesRole) ([]db.TrainingGuide, error)
	GetGuide(ctx context.Context, id string) (db.TrainingGuide, error)
	CreateGuide(ctx context.Context, arg db.CreateTrainingGuideParams) error
	UpdateGuide(ctx context.Context, arg db.UpdateTrainingGuideParams) error
	SoftDeleteGuide(ctx context.Context, id string) error

	GetGuideRoles(ctx context.Context, guideID string) ([]db.TrainingGuideRolesRole, error)
	DeleteGuideRoles(ctx context.Context, guideID string) error
	InsertGuideRole(ctx context.Context, guideID string, role db.TrainingGuideRolesRole) error

	ListGuideProgress(ctx context.Context, guideID string, limit, offset int32) ([]db.ListGuideProgressRow, error)
	CountGuideProgress(ctx context.Context, guideID string) (int64, error)
	GetStaffProgress(ctx context.Context, guideID, staffID string) (db.TrainingProgress, error)
	UpsertStaffProgress(ctx context.Context, id, guideID, staffID string, watchedPercent int32) error
	UpdateManagerNotes(ctx context.Context, notes sql.NullString, guideID, staffID string) error

	ListQuizAttempts(ctx context.Context, progressID string) ([]db.QuizAttempt, error)
	CountQuizAttempts(ctx context.Context, progressID string) (int64, error)
	InsertQuizAttempt(ctx context.Context, id, progressID string, score int32, passed bool) error
}

type trainingRepo struct {
	q *db.Queries
}

func NewTrainingRepo(d *sql.DB) TrainingRepository {
	return &trainingRepo{q: db.New(d)}
}

func (r *trainingRepo) ListGuides(ctx context.Context) ([]db.TrainingGuide, error) {
	return r.q.ListTrainingGuides(ctx)
}

func (r *trainingRepo) ListGuidesByRole(ctx context.Context, role db.TrainingGuidesRole) ([]db.TrainingGuide, error) {
	return r.q.ListTrainingGuidesByRole(ctx, role)
}

func (r *trainingRepo) GetGuide(ctx context.Context, id string) (db.TrainingGuide, error) {
	return r.q.GetTrainingGuide(ctx, id)
}

func (r *trainingRepo) CreateGuide(ctx context.Context, arg db.CreateTrainingGuideParams) error {
	return r.q.CreateTrainingGuide(ctx, arg)
}

func (r *trainingRepo) UpdateGuide(ctx context.Context, arg db.UpdateTrainingGuideParams) error {
	return r.q.UpdateTrainingGuide(ctx, arg)
}

func (r *trainingRepo) SoftDeleteGuide(ctx context.Context, id string) error {
	return r.q.SoftDeleteTrainingGuide(ctx, id)
}

func (r *trainingRepo) GetGuideRoles(ctx context.Context, guideID string) ([]db.TrainingGuideRolesRole, error) {
	return r.q.GetGuideRoles(ctx, guideID)
}

func (r *trainingRepo) DeleteGuideRoles(ctx context.Context, guideID string) error {
	return r.q.DeleteGuideRoles(ctx, guideID)
}

func (r *trainingRepo) InsertGuideRole(ctx context.Context, guideID string, role db.TrainingGuideRolesRole) error {
	return r.q.InsertGuideRole(ctx, guideID, role)
}

func (r *trainingRepo) ListGuideProgress(ctx context.Context, guideID string, limit, offset int32) ([]db.ListGuideProgressRow, error) {
	return r.q.ListGuideProgress(ctx, guideID, limit, offset)
}

func (r *trainingRepo) CountGuideProgress(ctx context.Context, guideID string) (int64, error) {
	return r.q.CountGuideProgress(ctx, guideID)
}

func (r *trainingRepo) GetStaffProgress(ctx context.Context, guideID, staffID string) (db.TrainingProgress, error) {
	return r.q.GetStaffProgress(ctx, guideID, staffID)
}

func (r *trainingRepo) UpsertStaffProgress(ctx context.Context, id, guideID, staffID string, watchedPercent int32) error {
	return r.q.UpsertStaffProgress(ctx, id, guideID, staffID, watchedPercent)
}

func (r *trainingRepo) UpdateManagerNotes(ctx context.Context, notes sql.NullString, guideID, staffID string) error {
	return r.q.UpdateManagerNotes(ctx, notes, guideID, staffID)
}

func (r *trainingRepo) ListQuizAttempts(ctx context.Context, progressID string) ([]db.QuizAttempt, error) {
	return r.q.ListQuizAttempts(ctx, progressID)
}

func (r *trainingRepo) CountQuizAttempts(ctx context.Context, progressID string) (int64, error) {
	return r.q.CountQuizAttempts(ctx, progressID)
}

func (r *trainingRepo) InsertQuizAttempt(ctx context.Context, id, progressID string, score int32, passed bool) error {
	return r.q.InsertQuizAttempt(ctx, id, progressID, score, passed)
}
