package service

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// TaskService handles business logic for the staff task board.
type TaskService struct {
	repo repository.TaskRepository
}

// NewTaskService creates a TaskService.
func NewTaskService(repo repository.TaskRepository) *TaskService {
	return &TaskService{repo: repo}
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

type DailyMetricsDTO struct {
	Date            string `json:"date"`
	TotalTasks      int64  `json:"totalTasks"`
	CompletedTasks  int64  `json:"completedTasks"`
	InProgressTasks int64  `json:"inProgressTasks"`
	OverdueTasks    int64  `json:"overdueTasks"`
}

type StaffTaskStatDTO struct {
	StaffID        string  `json:"staffId"`
	StaffName      string  `json:"staffName"`
	Role           string  `json:"role"`
	AssignedCount  int64   `json:"assignedCount"`
	CompletedCount int64   `json:"completedCount"`
	CompletionRate float64 `json:"completionRate"`
	QualityScore   float64 `json:"qualityScore"`
	HasOverdue     bool    `json:"hasOverdue"`
}

type StaffTaskStatsResponse struct {
	Metrics   DailyMetricsDTO    `json:"metrics"`
	StaffStats []StaffTaskStatDTO `json:"staffStats"`
}

type TaskDTO struct {
	ID           string `json:"id"`
	StaffID      string `json:"staffId"`
	Name         string `json:"name"`
	Description  string `json:"description,omitempty"`
	Priority     string `json:"priority"`
	DueDate      string `json:"dueDate"`
	DueTimeStart string `json:"dueTimeStart"`
	DueTimeEnd   string `json:"dueTimeEnd"`
	Status       string `json:"status"`
	Notes        string `json:"notes,omitempty"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

type CreateTaskSvcInput struct {
	CallerID     string
	AssignedTo   string
	Name         string
	Description  string
	Priority     string
	DueDateTime  string // ISO 8601: "2006-01-02T15:04:05Z"
	DueTimeStart string // "HH:mm" — optional display window start
	DueTimeEnd   string // "HH:mm" — optional display window end
	Notes        string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func taskToDTO(t db.StaffTask) TaskDTO {
	dto := TaskDTO{
		ID:        t.ID,
		StaffID:   t.AssignedTo,
		Name:      t.Title,
		Priority:  string(t.Priority),
		DueDate:   t.DueAt.UTC().Format("2006-01-02"),
		Status:    string(t.Status),
		CreatedAt: t.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: t.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if t.Description.Valid {
		dto.Description = t.Description.String
	}
	if t.DueTimeStart.Valid {
		dto.DueTimeStart = t.DueTimeStart.String
	}
	if t.DueTimeEnd.Valid {
		dto.DueTimeEnd = t.DueTimeEnd.String
	}
	if t.Notes.Valid {
		dto.Notes = t.Notes.String
	}
	return dto
}

func validPriority(p string) bool {
	return p == "high" || p == "medium" || p == "low"
}

// ── Methods ───────────────────────────────────────────────────────────────────

// GetTaskStats returns daily metrics + per-staff stats for the given date.
func (s *TaskService) GetTaskStats(ctx context.Context, date string) (StaffTaskStatsResponse, error) {
	d, err := time.Parse("2006-01-02", date)
	if err != nil {
		return StaffTaskStatsResponse{}, NewAppError(http.StatusBadRequest, "INVALID_INPUT", "Định dạng ngày không hợp lệ (YYYY-MM-DD)")
	}

	metrics, err := s.repo.GetDailyMetrics(ctx, d)
	if err != nil {
		return StaffTaskStatsResponse{}, ErrInternalError
	}

	staffRows, err := s.repo.GetStaffStats(ctx, d)
	if err != nil {
		return StaffTaskStatsResponse{}, ErrInternalError
	}

	staffDTOs := make([]StaffTaskStatDTO, 0, len(staffRows))
	for _, row := range staffRows {
		rate := float64(row.CompletionRate)
		// Quality score derived from completion rate on a 0–5.0 scale.
		quality := rate / 20.0
		staffDTOs = append(staffDTOs, StaffTaskStatDTO{
			StaffID:        row.StaffID,
			StaffName:      row.StaffName,
			Role:           row.Role,
			AssignedCount:  row.AssignedCount,
			CompletedCount: row.CompletedCount,
			CompletionRate: rate,
			QualityScore:   quality,
			HasOverdue:     row.HasOverdue,
		})
	}

	return StaffTaskStatsResponse{
		Metrics: DailyMetricsDTO{
			Date:            date,
			TotalTasks:      metrics.TotalTasks,
			CompletedTasks:  metrics.CompletedTasks,
			InProgressTasks: metrics.InProgressTasks,
			OverdueTasks:    metrics.OverdueTasks,
		},
		StaffStats: staffDTOs,
	}, nil
}

// GetStaffTasks returns tasks for a specific staff member on a given date.
func (s *TaskService) GetStaffTasks(ctx context.Context, staffID, date string) ([]TaskDTO, error) {
	d, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, NewAppError(http.StatusBadRequest, "INVALID_INPUT", "Định dạng ngày không hợp lệ (YYYY-MM-DD)")
	}
	tasks, err := s.repo.GetTasksByStaffDate(ctx, staffID, d)
	if err != nil {
		return nil, ErrInternalError
	}
	dtos := make([]TaskDTO, 0, len(tasks))
	for _, t := range tasks {
		dtos = append(dtos, taskToDTO(t))
	}
	return dtos, nil
}

// CreateTask inserts a new staff task and returns its DTO.
func (s *TaskService) CreateTask(ctx context.Context, in CreateTaskSvcInput) (TaskDTO, error) {
	if !validPriority(in.Priority) {
		return TaskDTO{}, NewAppError(http.StatusBadRequest, "INVALID_INPUT", "Priority phải là high, medium hoặc low")
	}
	dueAt, err := time.Parse(time.RFC3339, in.DueDateTime)
	if err != nil {
		// Try without timezone.
		dueAt, err = time.Parse("2006-01-02T15:04", in.DueDateTime)
		if err != nil {
			return TaskDTO{}, NewAppError(http.StatusBadRequest, "INVALID_INPUT", "Định dạng dueDateTime không hợp lệ")
		}
	}

	arg := repository.CreateTaskInput{
		AssignedTo:   in.AssignedTo,
		AssignedBy:   in.CallerID,
		Title:        in.Name,
		Description:  in.Description,
		Priority:     in.Priority,
		DueAt:        dueAt,
		DueTimeStart: in.DueTimeStart,
		DueTimeEnd:   in.DueTimeEnd,
		Notes:        in.Notes,
	}
	task, err := s.repo.CreateTask(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			return TaskDTO{}, ErrNotFound
		}
		return TaskDTO{}, ErrInternalError
	}
	return taskToDTO(task), nil
}
