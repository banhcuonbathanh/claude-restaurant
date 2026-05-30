package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

// StaffTask is the row shape returned by task queries.
type StaffTask struct {
	ID              string
	Title           string
	Description     sql.NullString
	AssignedTo      string
	AssignedToName  string
	AssignedBy      string
	AssignedByName  string
	Status          string
	DueAt           time.Time
	CompletedAt     sql.NullTime
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// CreateTaskParams holds data for inserting a new task.
type CreateTaskParams struct {
	ID          string
	Title       string
	Description sql.NullString
	AssignedTo  string
	AssignedBy  string
	DueAt       time.Time
}

// UpdateTaskParams holds optional fields for a task edit.
type UpdateTaskParams struct {
	ID          string
	Title       *string
	Description *string
	AssignedTo  *string
	DueAt       *time.Time
}

// ListTasksFilter drives the paginated task list query.
type ListTasksFilter struct {
	AssignedTo *string
	StartDate  *time.Time
	EndDate    *time.Time
	Status     string // "" or "pending" or "completed" or "overdue"
	Page       int
	PageSize   int
}

// TaskRepository provides CRUD access to staff_tasks.
type TaskRepository interface {
	CreateTask(ctx context.Context, arg CreateTaskParams) (StaffTask, error)
	GetTaskByID(ctx context.Context, id string) (StaffTask, error)
	ListTasks(ctx context.Context, f ListTasksFilter) ([]StaffTask, int64, error)
	UpdateTask(ctx context.Context, arg UpdateTaskParams) (StaffTask, error)
	UpdateTaskStatus(ctx context.Context, id, status string, completedAt sql.NullTime) error
	SoftDeleteTask(ctx context.Context, id string) error
}

type taskRepo struct {
	dbtx *sql.DB
}

// NewTaskRepo creates a TaskRepository.
func NewTaskRepo(dbtx *sql.DB) TaskRepository {
	return &taskRepo{dbtx: dbtx}
}

const taskSelectCols = `
	t.id, t.title, t.description,
	t.assigned_to, s1.full_name,
	t.assigned_by, s2.full_name,
	t.status, t.due_at, t.completed_at, t.created_at, t.updated_at`

const taskJoins = `
	FROM staff_tasks t
	JOIN staff s1 ON s1.id = t.assigned_to
	JOIN staff s2 ON s2.id = t.assigned_by`

func scanTask(row interface {
	Scan(...any) error
}) (StaffTask, error) {
	var t StaffTask
	err := row.Scan(
		&t.ID, &t.Title, &t.Description,
		&t.AssignedTo, &t.AssignedToName,
		&t.AssignedBy, &t.AssignedByName,
		&t.Status, &t.DueAt, &t.CompletedAt, &t.CreatedAt, &t.UpdatedAt,
	)
	return t, err
}

func (r *taskRepo) CreateTask(ctx context.Context, arg CreateTaskParams) (StaffTask, error) {
	const ins = `INSERT INTO staff_tasks
		(id, title, description, assigned_to, assigned_by, due_at)
		VALUES (?, ?, ?, ?, ?, ?)`
	if _, err := r.dbtx.ExecContext(ctx, ins,
		arg.ID, arg.Title, arg.Description, arg.AssignedTo, arg.AssignedBy, arg.DueAt,
	); err != nil {
		return StaffTask{}, fmt.Errorf("task: create: %w", err)
	}
	return r.GetTaskByID(ctx, arg.ID)
}

func (r *taskRepo) GetTaskByID(ctx context.Context, id string) (StaffTask, error) {
	q := `SELECT` + taskSelectCols + taskJoins + `
		WHERE t.id = ? AND t.deleted_at IS NULL LIMIT 1`
	row := r.dbtx.QueryRowContext(ctx, q, id)
	t, err := scanTask(row)
	if err == sql.ErrNoRows {
		return StaffTask{}, sql.ErrNoRows
	}
	if err != nil {
		return StaffTask{}, fmt.Errorf("task: get: %w", err)
	}
	return t, nil
}

func (r *taskRepo) ListTasks(ctx context.Context, f ListTasksFilter) ([]StaffTask, int64, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.PageSize < 1 || f.PageSize > 100 {
		f.PageSize = 15
	}

	where := []string{"t.deleted_at IS NULL"}
	args := []any{}

	if f.AssignedTo != nil {
		where = append(where, "t.assigned_to = ?")
		args = append(args, *f.AssignedTo)
	}
	if f.StartDate != nil {
		where = append(where, "t.due_at >= ?")
		args = append(args, *f.StartDate)
	}
	if f.EndDate != nil {
		endOfDay := f.EndDate.Add(24*time.Hour - time.Second)
		where = append(where, "t.due_at <= ?")
		args = append(args, endOfDay)
	}
	if f.Status != "" && f.Status != "all" {
		where = append(where, "t.status = ?")
		args = append(args, f.Status)
	}

	cond := strings.Join(where, " AND ")

	var total int64
	countQ := `SELECT COUNT(*) FROM staff_tasks t` + taskJoins[len("FROM staff_tasks t"):] +
		" WHERE " + cond
	if err := r.dbtx.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("task: count: %w", err)
	}

	offset := (f.Page - 1) * f.PageSize
	listQ := fmt.Sprintf(`SELECT%s%s WHERE %s ORDER BY t.due_at ASC LIMIT ? OFFSET ?`,
		taskSelectCols, taskJoins, cond)
	rows, err := r.dbtx.QueryContext(ctx, listQ, append(args, f.PageSize, offset)...)
	if err != nil {
		return nil, 0, fmt.Errorf("task: list: %w", err)
	}
	defer rows.Close()

	var list []StaffTask
	for rows.Next() {
		t, err := scanTask(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("task: scan: %w", err)
		}
		list = append(list, t)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("task: rows: %w", err)
	}
	return list, total, nil
}

func (r *taskRepo) UpdateTask(ctx context.Context, arg UpdateTaskParams) (StaffTask, error) {
	sets := []string{"updated_at = NOW()"}
	args := []any{}

	if arg.Title != nil {
		sets = append(sets, "title = ?")
		args = append(args, *arg.Title)
	}
	if arg.Description != nil {
		sets = append(sets, "description = ?")
		args = append(args, *arg.Description)
	}
	if arg.AssignedTo != nil {
		sets = append(sets, "assigned_to = ?")
		args = append(args, *arg.AssignedTo)
	}
	if arg.DueAt != nil {
		sets = append(sets, "due_at = ?")
		args = append(args, *arg.DueAt)
	}

	args = append(args, arg.ID)
	q := fmt.Sprintf("UPDATE staff_tasks SET %s WHERE id = ? AND deleted_at IS NULL",
		strings.Join(sets, ", "))
	res, err := r.dbtx.ExecContext(ctx, q, args...)
	if err != nil {
		return StaffTask{}, fmt.Errorf("task: update: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return StaffTask{}, sql.ErrNoRows
	}
	return r.GetTaskByID(ctx, arg.ID)
}

func (r *taskRepo) UpdateTaskStatus(ctx context.Context, id, status string, completedAt sql.NullTime) error {
	const q = `UPDATE staff_tasks SET status = ?, completed_at = ?, updated_at = NOW()
		WHERE id = ? AND deleted_at IS NULL`
	res, err := r.dbtx.ExecContext(ctx, q, status, completedAt, id)
	if err != nil {
		return fmt.Errorf("task: update status: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *taskRepo) SoftDeleteTask(ctx context.Context, id string) error {
	const q = `UPDATE staff_tasks SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`
	res, err := r.dbtx.ExecContext(ctx, q, id)
	if err != nil {
		return fmt.Errorf("task: delete: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return sql.ErrNoRows
	}
	return nil
}
