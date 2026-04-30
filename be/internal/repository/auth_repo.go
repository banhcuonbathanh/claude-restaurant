// Package repository provides database access wrappers around sqlc-generated code.
package repository

import (
	"context"

	"banhcuon/be/internal/db"
)

// AuthRepository wraps all sqlc auth queries used by the auth service.
type AuthRepository interface {
	GetStaffByUsername(ctx context.Context, username string) (db.Staff, error)
	GetStaffByID(ctx context.Context, id string) (db.Staff, error)
	CreateRefreshToken(ctx context.Context, arg db.CreateRefreshTokenParams) error
	GetRefreshToken(ctx context.Context, tokenHash string) (db.RefreshToken, error)
	DeleteRefreshToken(ctx context.Context, tokenHash string) error
	DeleteRefreshTokensByStaff(ctx context.Context, staffID string) error
	SetStaffActive(ctx context.Context, isActive bool, id string) error
	ListActiveSessionsByStaff(ctx context.Context, staffID string) ([]db.RefreshToken, error)
	CountActiveSessionsByStaff(ctx context.Context, staffID string) (int64, error)
	DeleteOldestSessionByStaff(ctx context.Context, staffID string) error
	UpdateRefreshTokenLastUsed(ctx context.Context, tokenHash string) error
	// GetTableByQRToken returns the full table row for a given QR token.
	// Returns sql.ErrNoRows if the table is not found, inactive, or deleted.
	GetTableByQRToken(ctx context.Context, qrToken string) (db.Table, error)
}

type authRepo struct {
	q    *db.Queries
	dbtx db.DBTX
}

// NewAuthRepo creates an AuthRepository. dbtx is typically *sql.DB.
func NewAuthRepo(dbtx db.DBTX) AuthRepository {
	return &authRepo{
		q:    db.New(dbtx),
		dbtx: dbtx,
	}
}

func (r *authRepo) GetStaffByUsername(ctx context.Context, username string) (db.Staff, error) {
	return r.q.GetStaffByUsername(ctx, username)
}

func (r *authRepo) GetStaffByID(ctx context.Context, id string) (db.Staff, error) {
	return r.q.GetStaffByID(ctx, id)
}

func (r *authRepo) CreateRefreshToken(ctx context.Context, arg db.CreateRefreshTokenParams) error {
	return r.q.CreateRefreshToken(ctx, arg)
}

func (r *authRepo) GetRefreshToken(ctx context.Context, tokenHash string) (db.RefreshToken, error) {
	return r.q.GetRefreshToken(ctx, tokenHash)
}

func (r *authRepo) DeleteRefreshToken(ctx context.Context, tokenHash string) error {
	return r.q.DeleteRefreshToken(ctx, tokenHash)
}

func (r *authRepo) DeleteRefreshTokensByStaff(ctx context.Context, staffID string) error {
	return r.q.DeleteRefreshTokensByStaff(ctx, staffID)
}

func (r *authRepo) SetStaffActive(ctx context.Context, isActive bool, id string) error {
	return r.q.SetStaffActive(ctx, isActive, id)
}

func (r *authRepo) ListActiveSessionsByStaff(ctx context.Context, staffID string) ([]db.RefreshToken, error) {
	return r.q.ListActiveSessionsByStaff(ctx, staffID)
}

func (r *authRepo) CountActiveSessionsByStaff(ctx context.Context, staffID string) (int64, error) {
	return r.q.CountActiveSessionsByStaff(ctx, staffID)
}

func (r *authRepo) DeleteOldestSessionByStaff(ctx context.Context, staffID string) error {
	return r.q.DeleteOldestSessionByStaff(ctx, staffID)
}

func (r *authRepo) UpdateRefreshTokenLastUsed(ctx context.Context, tokenHash string) error {
	return r.q.UpdateRefreshTokenLastUsed(ctx, tokenHash)
}

// GetTableByQRToken returns the full table row for a given QR token.
func (r *authRepo) GetTableByQRToken(ctx context.Context, qrToken string) (db.Table, error) {
	const query = `SELECT id, name, qr_token, capacity, status, is_active, created_at, updated_at, deleted_at
		FROM tables WHERE qr_token = ? AND is_active = 1 AND deleted_at IS NULL LIMIT 1`
	row := r.dbtx.QueryRowContext(ctx, query, qrToken)
	var t db.Table
	if err := row.Scan(&t.ID, &t.Name, &t.QrToken, &t.Capacity, &t.Status, &t.IsActive,
		&t.CreatedAt, &t.UpdatedAt, &t.DeletedAt); err != nil {
		return db.Table{}, err
	}
	return t, nil
}

// compile-time interface check
var _ AuthRepository = (*authRepo)(nil)
