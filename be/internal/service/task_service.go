package service

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"

	"banhcuon/be/internal/repository"
)

// TaskService handles business logic for staff tasks.
type TaskService struct {
	repo repository.TaskRepository
}

// NewTaskService creates a TaskService.
func NewTaskService(repo repository.TaskRepository) *TaskService {
	return &TaskService{repo: repo}
}

// TodoTask is the service-layer DTO for a staff task.
type TodoTask struct {
	ID              string
	Title           string
	Description     string
	AssignedTo      string
	AssignedToName  string
	AssignedBy      string
	AssignedByName  string
	Status          string
	DueDate         string // "YYYY-MM-DD"
	DueTime         string // "HH:MM"
	CompletedAt     string // ISO 8601 or ""
	CreatedAt       string // ISO 8601
}

// TaskListResult is returned by ListTasks.
type TaskListResult struct {
	Tasks    []TodoTask
	Total    int64
	Page     int
	PageSize int
}

// CreateTaskInput holds the data for creating a new task.
type CreateTaskInput struct {
	Title       string
	Description string
	AssignedTo  string
	DueDate     string // "YYYY-MM-DD"
	DueTime     string // "HH:MM"
	CallerID    string
	CallerRole  string
}

// UpdateTaskInput holds the data for editing a task.
type UpdateTaskInput struct {
	ID          string
	Title       *string
	Description *string
	AssignedTo  *string
	DueDate     *string
	DueTime     *string
	CallerID    string
	CallerRole  string
}

// ListTasksInput holds filter params for listing tasks.
type ListTasksInput struct {
	CallerID   string
	CallerRole string
	AssignedTo string // "" = all (manager only)
	StartDate  string // "YYYY-MM-DD"
	EndDate    string // "YYYY-MM-DD"
	Status     string
	Page       int
	PageSize   int
}

// ToggleTaskInput holds params for toggling task status.
type ToggleTaskInput struct {
	ID         string
	Status     string // "completed" or "pending"
	CallerID   string
	CallerRole string
}

func toDTO(t repository.StaffTask) TodoTask {
	dto := TodoTask{
		ID:             t.ID,
		Title:          t.Title,
		AssignedTo:     t.AssignedTo,
		AssignedToName: t.AssignedToName,
		AssignedBy:     t.AssignedBy,
		AssignedByName: t.AssignedByName,
		Status:         t.Status,
		DueDate:        t.DueAt.UTC().Format("2006-01-02"),
		DueTime:        t.DueAt.UTC().Format("15:04"),
		CreatedAt:      t.CreatedAt.UTC().Format(time.RFC3339),
	}
	if t.Description.Valid {
		dto.Description = t.Description.String
	}
	if t.CompletedAt.Valid {
		dto.CompletedAt = t.CompletedAt.Time.UTC().Format(time.RFC3339)
	}
	return dto
}

func parseDueAt(date, timeStr string) (time.Time, error) {
	combined := date + "T" + timeStr + ":00Z"
	t, err := time.Parse("2006-01-02T15:04:05Z", combined)
	if err != nil {
		return time.Time{}, NewAppError(http.StatusBadRequest, "INVALID_INPUT", "Định dạng ngày giờ không hợp lệ")
	}
	return t, nil
}

func isManagerOrAdmin(role string) bool {
	return role == "manager" || role == "admin"
}

func (s *TaskService) CreateTask(ctx context.Context, in CreateTaskInput) (TodoTask, error) {
	if !isManagerOrAdmin(in.CallerRole) {
		return TodoTask{}, ErrForbidden
	}
	dueAt, err := parseDueAt(in.DueDate, in.DueTime)
	if err != nil {
		return TodoTask{}, err
	}
	arg := repository.CreateTaskParams{
		ID:         uuid.New().String(),
		Title:      in.Title,
		AssignedTo: in.AssignedTo,
		AssignedBy: in.CallerID,
		DueAt:      dueAt,
	}
	if in.Description != "" {
		arg.Description = sql.NullString{String: in.Description, Valid: true}
	}
	t, err := s.repo.CreateTask(ctx, arg)
	if err != nil {
		return TodoTask{}, ErrInternalError
	}
	return toDTO(t), nil
}

func (s *TaskService) ListTasks(ctx context.Context, in ListTasksInput) (TaskListResult, error) {
	f := repository.ListTasksFilter{
		Status:   in.Status,
		Page:     in.Page,
		PageSize: in.PageSize,
	}

	// Staff can only see their own tasks; manager/admin can filter freely.
	if !isManagerOrAdmin(in.CallerRole) {
		f.AssignedTo = &in.CallerID
	} else if in.AssignedTo != "" {
		f.AssignedTo = &in.AssignedTo
	}

	if in.StartDate != "" {
		t, err := time.Parse("2006-01-02", in.StartDate)
		if err == nil {
			f.StartDate = &t
		}
	}
	if in.EndDate != "" {
		t, err := time.Parse("2006-01-02", in.EndDate)
		if err == nil {
			f.EndDate = &t
		}
	}

	list, total, err := s.repo.ListTasks(ctx, f)
	if err != nil {
		return TaskListResult{}, ErrInternalError
	}

	dtos := make([]TodoTask, len(list))
	for i, t := range list {
		dtos[i] = toDTO(t)
	}
	return TaskListResult{
		Tasks:    dtos,
		Total:    total,
		Page:     in.Page,
		PageSize: in.PageSize,
	}, nil
}

func (s *TaskService) GetTask(ctx context.Context, id, callerID, callerRole string) (TodoTask, error) {
	t, err := s.repo.GetTaskByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return TodoTask{}, ErrNotFound
		}
		return TodoTask{}, ErrInternalError
	}
	if !isManagerOrAdmin(callerRole) && t.AssignedTo != callerID {
		return TodoTask{}, ErrForbidden
	}
	return toDTO(t), nil
}

func (s *TaskService) UpdateTask(ctx context.Context, in UpdateTaskInput) (TodoTask, error) {
	if !isManagerOrAdmin(in.CallerRole) {
		return TodoTask{}, ErrForbidden
	}
	existing, err := s.repo.GetTaskByID(ctx, in.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return TodoTask{}, ErrNotFound
		}
		return TodoTask{}, ErrInternalError
	}
	// Only the creator or admin may edit.
	if existing.AssignedBy != in.CallerID && in.CallerRole != "admin" {
		return TodoTask{}, ErrForbidden
	}

	arg := repository.UpdateTaskParams{
		ID:         in.ID,
		Title:      in.Title,
		AssignedTo: in.AssignedTo,
	}
	if in.Description != nil {
		arg.Description = in.Description
	}
	// Recalculate due_at if either date or time changed.
	if in.DueDate != nil || in.DueTime != nil {
		dateStr := existing.DueAt.UTC().Format("2006-01-02")
		timeStr := existing.DueAt.UTC().Format("15:04")
		if in.DueDate != nil {
			dateStr = *in.DueDate
		}
		if in.DueTime != nil {
			timeStr = *in.DueTime
		}
		dueAt, err := parseDueAt(dateStr, timeStr)
		if err != nil {
			return TodoTask{}, err
		}
		arg.DueAt = &dueAt
	}

	t, err := s.repo.UpdateTask(ctx, arg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return TodoTask{}, ErrNotFound
		}
		return TodoTask{}, ErrInternalError
	}
	return toDTO(t), nil
}

func (s *TaskService) ToggleStatus(ctx context.Context, in ToggleTaskInput) error {
	t, err := s.repo.GetTaskByID(ctx, in.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return ErrInternalError
	}
	// Staff may only toggle their own tasks.
	if !isManagerOrAdmin(in.CallerRole) && t.AssignedTo != in.CallerID {
		return ErrForbidden
	}
	if in.Status != "completed" && in.Status != "pending" {
		return NewAppError(http.StatusBadRequest, "INVALID_INPUT", "Trạng thái không hợp lệ — chỉ cho phép: completed, pending")
	}

	var completedAt sql.NullTime
	if in.Status == "completed" {
		completedAt = sql.NullTime{Time: time.Now().UTC(), Valid: true}
	}
	if err := s.repo.UpdateTaskStatus(ctx, in.ID, in.Status, completedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return ErrInternalError
	}
	return nil
}

func (s *TaskService) DeleteTask(ctx context.Context, id, callerID, callerRole string) error {
	if !isManagerOrAdmin(callerRole) {
		return ErrForbidden
	}
	t, err := s.repo.GetTaskByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return ErrInternalError
	}
	// Only the creator or admin may delete.
	if t.AssignedBy != callerID && callerRole != "admin" {
		return ErrForbidden
	}
	if err := s.repo.SoftDeleteTask(ctx, id); err != nil {
		return ErrInternalError
	}
	return nil
}
