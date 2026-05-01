package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"banhcuon/be/internal/db"
)

// ListStaffFilter holds optional filters for listing staff.
type ListStaffFilter struct {
	Role     string
	IsActive *bool
	Search   string
	Page     int
	Limit    int
}

// CreateStaffParams holds the data needed to insert a new staff row.
type CreateStaffParams struct {
	ID           string
	Username     string
	PasswordHash string
	FullName     string
	Role         string
	Phone        sql.NullString
	Email        sql.NullString
}

// UpdateStaffParams holds the data needed to update a staff row.
// Only non-nil pointer fields are applied.
type UpdateStaffParams struct {
	ID       string
	FullName *string
	Role     *string
	Phone    *string
	Email    *string
}

// StaffRepository provides CRUD access for the staff table.
type StaffRepository interface {
	ListStaff(ctx context.Context, filter ListStaffFilter) ([]db.Staff, int64, error)
	GetStaffByID(ctx context.Context, id string) (db.Staff, error)
	GetStaffByUsername(ctx context.Context, username string) (db.Staff, error)
	CreateStaff(ctx context.Context, arg CreateStaffParams) (db.Staff, error)
	UpdateStaff(ctx context.Context, arg UpdateStaffParams) (db.Staff, error)
	SetStaffActiveByID(ctx context.Context, id string, isActive bool) error
	SoftDeleteStaff(ctx context.Context, id string) error
	CountAdmins(ctx context.Context) (int64, error)
}

type staffRepo struct {
	dbtx db.DBTX
}

// NewStaffRepo creates a StaffRepository.
func NewStaffRepo(dbtx db.DBTX) StaffRepository {
	return &staffRepo{dbtx: dbtx}
}

func (r *staffRepo) ListStaff(ctx context.Context, f ListStaffFilter) ([]db.Staff, int64, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.Limit < 1 || f.Limit > 100 {
		f.Limit = 20
	}

	where := []string{"deleted_at IS NULL"}
	args := []interface{}{}

	if f.Role != "" {
		where = append(where, "role = ?")
		args = append(args, f.Role)
	}
	if f.IsActive != nil {
		where = append(where, "is_active = ?")
		args = append(args, *f.IsActive)
	}
	if f.Search != "" {
		where = append(where, "(username LIKE ? OR full_name LIKE ?)")
		like := "%" + f.Search + "%"
		args = append(args, like, like)
	}

	cond := strings.Join(where, " AND ")

	// Count total
	var total int64
	countArgs := append([]interface{}{}, args...)
	if err := r.dbtx.QueryRowContext(ctx, "SELECT COUNT(*) FROM staff WHERE "+cond, countArgs...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("staff: count: %w", err)
	}

	// Fetch page
	offset := (f.Page - 1) * f.Limit
	query := fmt.Sprintf(
		`SELECT id, username, password_hash, email, role, full_name, phone, is_active, created_at, updated_at, deleted_at
		 FROM staff WHERE %s ORDER BY created_at DESC LIMIT ? OFFSET ?`, cond)
	pageArgs := append(args, f.Limit, offset)
	rows, err := r.dbtx.QueryContext(ctx, query, pageArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("staff: list: %w", err)
	}
	defer rows.Close()

	var list []db.Staff
	for rows.Next() {
		var s db.Staff
		if err := rows.Scan(&s.ID, &s.Username, &s.PasswordHash, &s.Email, &s.Role,
			&s.FullName, &s.Phone, &s.IsActive, &s.CreatedAt, &s.UpdatedAt, &s.DeletedAt); err != nil {
			return nil, 0, fmt.Errorf("staff: scan: %w", err)
		}
		list = append(list, s)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("staff: rows: %w", err)
	}
	return list, total, nil
}

func (r *staffRepo) GetStaffByID(ctx context.Context, id string) (db.Staff, error) {
	const q = `SELECT id, username, password_hash, email, role, full_name, phone, is_active, created_at, updated_at, deleted_at
	           FROM staff WHERE id = ? AND deleted_at IS NULL LIMIT 1`
	var s db.Staff
	err := r.dbtx.QueryRowContext(ctx, q, id).Scan(
		&s.ID, &s.Username, &s.PasswordHash, &s.Email, &s.Role,
		&s.FullName, &s.Phone, &s.IsActive, &s.CreatedAt, &s.UpdatedAt, &s.DeletedAt)
	if err != nil {
		return db.Staff{}, err
	}
	return s, nil
}

func (r *staffRepo) GetStaffByUsername(ctx context.Context, username string) (db.Staff, error) {
	const q = `SELECT id, username, password_hash, email, role, full_name, phone, is_active, created_at, updated_at, deleted_at
	           FROM staff WHERE username = ? AND deleted_at IS NULL LIMIT 1`
	var s db.Staff
	err := r.dbtx.QueryRowContext(ctx, q, username).Scan(
		&s.ID, &s.Username, &s.PasswordHash, &s.Email, &s.Role,
		&s.FullName, &s.Phone, &s.IsActive, &s.CreatedAt, &s.UpdatedAt, &s.DeletedAt)
	if err != nil {
		return db.Staff{}, err
	}
	return s, nil
}

func (r *staffRepo) CreateStaff(ctx context.Context, arg CreateStaffParams) (db.Staff, error) {
	const q = `INSERT INTO staff (id, username, password_hash, full_name, role, phone, email, is_active, created_at, updated_at)
	           VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`
	if _, err := r.dbtx.ExecContext(ctx, q,
		arg.ID, arg.Username, arg.PasswordHash, arg.FullName, arg.Role, arg.Phone, arg.Email,
	); err != nil {
		return db.Staff{}, fmt.Errorf("staff: insert: %w", err)
	}
	return r.GetStaffByID(ctx, arg.ID)
}

func (r *staffRepo) UpdateStaff(ctx context.Context, arg UpdateStaffParams) (db.Staff, error) {
	setClauses := []string{"updated_at = NOW()"}
	args := []interface{}{}

	if arg.FullName != nil {
		setClauses = append(setClauses, "full_name = ?")
		args = append(args, *arg.FullName)
	}
	if arg.Role != nil {
		setClauses = append(setClauses, "role = ?")
		args = append(args, *arg.Role)
	}
	if arg.Phone != nil {
		setClauses = append(setClauses, "phone = ?")
		args = append(args, nullableStr(*arg.Phone))
	}
	if arg.Email != nil {
		setClauses = append(setClauses, "email = ?")
		args = append(args, nullableStr(*arg.Email))
	}

	if len(setClauses) == 1 {
		// only updated_at — nothing changed
		return r.GetStaffByID(ctx, arg.ID)
	}

	args = append(args, arg.ID)
	q := "UPDATE staff SET " + strings.Join(setClauses, ", ") + " WHERE id = ? AND deleted_at IS NULL"
	res, err := r.dbtx.ExecContext(ctx, q, args...)
	if err != nil {
		return db.Staff{}, fmt.Errorf("staff: update: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return db.Staff{}, sql.ErrNoRows
	}
	return r.GetStaffByID(ctx, arg.ID)
}

func (r *staffRepo) SetStaffActiveByID(ctx context.Context, id string, isActive bool) error {
	const q = "UPDATE staff SET is_active = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL"
	res, err := r.dbtx.ExecContext(ctx, q, isActive, id)
	if err != nil {
		return fmt.Errorf("staff: set active: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *staffRepo) SoftDeleteStaff(ctx context.Context, id string) error {
	const q = "UPDATE staff SET deleted_at = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL"
	res, err := r.dbtx.ExecContext(ctx, q, time.Now(), id)
	if err != nil {
		return fmt.Errorf("staff: soft delete: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *staffRepo) CountAdmins(ctx context.Context) (int64, error) {
	const q = "SELECT COUNT(*) FROM staff WHERE role = 'admin' AND is_active = 1 AND deleted_at IS NULL"
	var count int64
	if err := r.dbtx.QueryRowContext(ctx, q).Scan(&count); err != nil {
		return 0, fmt.Errorf("staff: count admins: %w", err)
	}
	return count, nil
}

func nullableStr(s string) sql.NullString {
	return sql.NullString{String: s, Valid: s != ""}
}

var _ StaffRepository = (*staffRepo)(nil)
