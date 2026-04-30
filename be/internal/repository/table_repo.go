package repository

import (
	"context"
	"database/sql"
	"fmt"

	"banhcuon/be/internal/db"
)

// TableRow is a lightweight table record for non-sqlc queries.
type TableRow struct {
	ID       string
	Name     string
	QrToken  string
	Capacity int32
	Status   string
	IsActive bool
}

// TableRepository wraps table CRUD via raw SQL (no sqlc queries generated for tables).
type TableRepository interface {
	ListTables(ctx context.Context) ([]TableRow, error)
	GetTableByID(ctx context.Context, id string) (db.Table, error)
	GetTableByQRToken(ctx context.Context, qrToken string) (db.Table, error)
	CreateTable(ctx context.Context, id, name, qrToken string, capacity int32) error
	UpdateTable(ctx context.Context, id, name string, capacity int32, isActive bool) error
}

type tableRepo struct {
	dbtx db.DBTX
}

// NewTableRepo creates a TableRepository.
func NewTableRepo(dbtx db.DBTX) TableRepository {
	return &tableRepo{dbtx: dbtx}
}

func (r *tableRepo) ListTables(ctx context.Context) ([]TableRow, error) {
	rows, err := r.dbtx.QueryContext(ctx,
		`SELECT id, name, qr_token, capacity, status, is_active FROM tables WHERE deleted_at IS NULL ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []TableRow
	for rows.Next() {
		var t TableRow
		if err := rows.Scan(&t.ID, &t.Name, &t.QrToken, &t.Capacity, &t.Status, &t.IsActive); err != nil {
			return nil, err
		}
		tables = append(tables, t)
	}
	return tables, rows.Err()
}

func (r *tableRepo) GetTableByID(ctx context.Context, id string) (db.Table, error) {
	row := r.dbtx.QueryRowContext(ctx,
		`SELECT id, name, qr_token, capacity, status, is_active, created_at, updated_at, deleted_at
		 FROM tables WHERE id = ? AND deleted_at IS NULL LIMIT 1`, id)
	var t db.Table
	err := row.Scan(&t.ID, &t.Name, &t.QrToken, &t.Capacity, &t.Status, &t.IsActive,
		&t.CreatedAt, &t.UpdatedAt, &t.DeletedAt)
	if err != nil {
		return db.Table{}, err
	}
	return t, nil
}

func (r *tableRepo) GetTableByQRToken(ctx context.Context, qrToken string) (db.Table, error) {
	row := r.dbtx.QueryRowContext(ctx,
		`SELECT id, name, qr_token, capacity, status, is_active, created_at, updated_at, deleted_at
		 FROM tables WHERE qr_token = ? AND is_active = 1 AND deleted_at IS NULL LIMIT 1`, qrToken)
	var t db.Table
	err := row.Scan(&t.ID, &t.Name, &t.QrToken, &t.Capacity, &t.Status, &t.IsActive,
		&t.CreatedAt, &t.UpdatedAt, &t.DeletedAt)
	if err != nil {
		return db.Table{}, err
	}
	return t, nil
}

func (r *tableRepo) CreateTable(ctx context.Context, id, name, qrToken string, capacity int32) error {
	_, err := r.dbtx.ExecContext(ctx,
		`INSERT INTO tables (id, name, qr_token, capacity, status, is_active) VALUES (?, ?, ?, ?, 'available', 1)`,
		id, name, qrToken, capacity)
	if err != nil {
		return fmt.Errorf("table: create: %w", err)
	}
	return nil
}

func (r *tableRepo) UpdateTable(ctx context.Context, id, name string, capacity int32, isActive bool) error {
	_, err := r.dbtx.ExecContext(ctx,
		`UPDATE tables SET name = ?, capacity = ?, is_active = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
		name, capacity, isActive, id)
	if err != nil {
		return fmt.Errorf("table: update: %w", err)
	}
	return nil
}

// ensure interface satisfied
var _ TableRepository = (*tableRepo)(nil)

// sqlNullStr converts a possibly-empty string to sql.NullString.
func sqlNullStr(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}
