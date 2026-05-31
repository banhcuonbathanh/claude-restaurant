package repository

import (
	"context"
	"database/sql"
	"time"

	"banhcuon/be/internal/db"

	"github.com/google/uuid"
)

// DailyMetrics holds aggregated task counts for a given date.
type DailyMetrics struct {
	TotalTasks      int64
	CompletedTasks  int64
	InProgressTasks int64
	OverdueTasks    int64
}

// StaffTaskStat holds per-staff aggregated task stats.
type StaffTaskStat struct {
	StaffID        string
	StaffName      string
	Role           string
	AssignedCount  int64
	CompletedCount int64
	CompletionRate int64
	HasOverdue     bool
}

// CreateTaskInput holds the fields for inserting a new staff task.
type CreateTaskInput struct {
	AssignedTo   string
	AssignedBy   string
	Title        string
	Description  string
	Priority     string
	DueAt        time.Time
	DueTimeStart string
	DueTimeEnd   string
	Notes        string
}

// TaskRepository provides data access for staff_tasks.
type TaskRepository interface {
	GetDailyMetrics(ctx context.Context, date time.Time) (DailyMetrics, error)
	GetStaffStats(ctx context.Context, date time.Time) ([]StaffTaskStat, error)
	GetTasksByStaffDate(ctx context.Context, staffID string, date time.Time) ([]db.StaffTask, error)
	CreateTask(ctx context.Context, arg CreateTaskInput) (db.StaffTask, error)
}

type taskRepo struct {
	dbtx db.DBTX
}

// NewTaskRepo creates a TaskRepository backed by sqlc.
func NewTaskRepo(dbtx db.DBTX) TaskRepository {
	return &taskRepo{dbtx: dbtx}
}

func (r *taskRepo) GetDailyMetrics(ctx context.Context, date time.Time) (DailyMetrics, error) {
	q := db.New(r.dbtx)
	row, err := q.GetDailyTaskMetrics(ctx, date)
	if err != nil {
		return DailyMetrics{}, err
	}
	return DailyMetrics{
		TotalTasks:      row.TotalTasks,
		CompletedTasks:  toInt64(row.CompletedTasks),
		InProgressTasks: toInt64(row.InProgressTasks),
		OverdueTasks:    toInt64(row.OverdueTasks),
	}, nil
}

func (r *taskRepo) GetStaffStats(ctx context.Context, date time.Time) ([]StaffTaskStat, error) {
	q := db.New(r.dbtx)
	rows, err := q.GetStaffTaskStats(ctx, date)
	if err != nil {
		return nil, err
	}
	stats := make([]StaffTaskStat, 0, len(rows))
	for _, row := range rows {
		stats = append(stats, StaffTaskStat{
			StaffID:        row.StaffID,
			StaffName:      row.StaffName,
			Role:           string(row.Role),
			AssignedCount:  row.AssignedCount,
			CompletedCount: row.CompletedCount,
			CompletionRate: row.CompletionRate,
			HasOverdue:     row.HasOverdue > 0,
		})
	}
	return stats, nil
}

func (r *taskRepo) GetTasksByStaffDate(ctx context.Context, staffID string, date time.Time) ([]db.StaffTask, error) {
	q := db.New(r.dbtx)
	return q.GetStaffTasksByDate(ctx, staffID, date)
}

func (r *taskRepo) CreateTask(ctx context.Context, arg CreateTaskInput) (db.StaffTask, error) {
	q := db.New(r.dbtx)
	id := uuid.New().String()
	err := q.CreateStaffTask(ctx, db.CreateStaffTaskParams{
		ID:           id,
		Title:        arg.Title,
		Description:  sql.NullString{String: arg.Description, Valid: arg.Description != ""},
		AssignedTo:   arg.AssignedTo,
		AssignedBy:   arg.AssignedBy,
		Priority:     db.StaffTasksPriority(arg.Priority),
		DueAt:        arg.DueAt,
		DueTimeStart: sql.NullString{String: arg.DueTimeStart, Valid: arg.DueTimeStart != ""},
		DueTimeEnd:   sql.NullString{String: arg.DueTimeEnd, Valid: arg.DueTimeEnd != ""},
		Notes:        sql.NullString{String: arg.Notes, Valid: arg.Notes != ""},
	})
	if err != nil {
		return db.StaffTask{}, err
	}
	return q.GetStaffTaskByID(ctx, id)
}
