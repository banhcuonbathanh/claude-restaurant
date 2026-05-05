package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"banhcuon/be/internal/db"
)

// Ingredient represents one row in the ingredients table.
type Ingredient struct {
	ID           string
	Name         string
	Unit         string
	CurrentStock float64
	MinStock     float64
	CostPerUnit  int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// StockMovement represents one row in the stock_movements table.
type StockMovement struct {
	ID           string
	IngredientID string
	Type         string
	Quantity     float64
	Note         sql.NullString
	CreatedBy    sql.NullString
	CreatedAt    time.Time
}

// CreateIngredientParams holds fields for INSERT.
type CreateIngredientParams struct {
	ID           string
	Name         string
	Unit         string
	CurrentStock float64
	MinStock     float64
	CostPerUnit  int64
}

// UpdateIngredientParams holds optional fields for UPDATE.
type UpdateIngredientParams struct {
	ID           string
	Name         *string
	Unit         *string
	MinStock     *float64
	CostPerUnit  *int64
}

// CreateStockMovementParams holds fields for a stock movement INSERT.
type CreateStockMovementParams struct {
	ID           string
	IngredientID string
	Type         string // "in" | "out" | "adjustment"
	Quantity     float64
	Note         sql.NullString
	CreatedBy    sql.NullString
}

// IngredientRepository provides CRUD + stock movement access.
type IngredientRepository interface {
	ListIngredients(ctx context.Context) ([]Ingredient, error)
	ListLowStock(ctx context.Context) ([]Ingredient, error)
	GetIngredientByID(ctx context.Context, id string) (Ingredient, error)
	CreateIngredient(ctx context.Context, arg CreateIngredientParams) (Ingredient, error)
	UpdateIngredient(ctx context.Context, arg UpdateIngredientParams) (Ingredient, error)
	SoftDeleteIngredient(ctx context.Context, id string) error
	CreateStockMovement(ctx context.Context, arg CreateStockMovementParams) (StockMovement, error)
	ListStockMovements(ctx context.Context, ingredientID string, limit int) ([]StockMovement, error)
}

type ingredientRepo struct {
	dbtx db.DBTX
}

// NewIngredientRepo creates an IngredientRepository.
func NewIngredientRepo(dbtx db.DBTX) IngredientRepository {
	return &ingredientRepo{dbtx: dbtx}
}

const ingredientCols = `id, name, unit, current_stock, min_stock, cost_per_unit, created_at, updated_at`

func scanIngredient(row interface {
	Scan(dest ...any) error
}) (Ingredient, error) {
	var ing Ingredient
	err := row.Scan(&ing.ID, &ing.Name, &ing.Unit, &ing.CurrentStock,
		&ing.MinStock, &ing.CostPerUnit, &ing.CreatedAt, &ing.UpdatedAt)
	return ing, err
}

func (r *ingredientRepo) ListIngredients(ctx context.Context) ([]Ingredient, error) {
	q := `SELECT ` + ingredientCols + ` FROM ingredients WHERE deleted_at IS NULL ORDER BY name ASC`
	rows, err := r.dbtx.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("ingredient: list: %w", err)
	}
	defer rows.Close()
	var list []Ingredient
	for rows.Next() {
		ing, err := scanIngredient(rows)
		if err != nil {
			return nil, fmt.Errorf("ingredient: list scan: %w", err)
		}
		list = append(list, ing)
	}
	return list, rows.Err()
}

func (r *ingredientRepo) ListLowStock(ctx context.Context) ([]Ingredient, error) {
	// Return ingredients where current_stock <= min_stock * 1.2
	q := `SELECT ` + ingredientCols + `
	      FROM ingredients
	      WHERE deleted_at IS NULL
	        AND current_stock <= min_stock * 1.2
	      ORDER BY (current_stock / GREATEST(min_stock, 0.001)) ASC`
	rows, err := r.dbtx.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("ingredient: low-stock: %w", err)
	}
	defer rows.Close()
	var list []Ingredient
	for rows.Next() {
		ing, err := scanIngredient(rows)
		if err != nil {
			return nil, fmt.Errorf("ingredient: low-stock scan: %w", err)
		}
		list = append(list, ing)
	}
	return list, rows.Err()
}

func (r *ingredientRepo) GetIngredientByID(ctx context.Context, id string) (Ingredient, error) {
	q := `SELECT ` + ingredientCols + ` FROM ingredients WHERE id = ? AND deleted_at IS NULL LIMIT 1`
	ing, err := scanIngredient(r.dbtx.QueryRowContext(ctx, q, id))
	if err != nil {
		return Ingredient{}, fmt.Errorf("ingredient: get: %w", err)
	}
	return ing, nil
}

func (r *ingredientRepo) CreateIngredient(ctx context.Context, arg CreateIngredientParams) (Ingredient, error) {
	const q = `INSERT INTO ingredients (id, name, unit, current_stock, min_stock, cost_per_unit, created_at, updated_at)
	           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`
	if _, err := r.dbtx.ExecContext(ctx, q,
		arg.ID, arg.Name, arg.Unit, arg.CurrentStock, arg.MinStock, arg.CostPerUnit,
	); err != nil {
		return Ingredient{}, fmt.Errorf("ingredient: create: %w", err)
	}
	return r.GetIngredientByID(ctx, arg.ID)
}

func (r *ingredientRepo) UpdateIngredient(ctx context.Context, arg UpdateIngredientParams) (Ingredient, error) {
	sets := []string{"updated_at = NOW()"}
	args := []any{}
	if arg.Name != nil {
		sets = append(sets, "name = ?")
		args = append(args, *arg.Name)
	}
	if arg.Unit != nil {
		sets = append(sets, "unit = ?")
		args = append(args, *arg.Unit)
	}
	if arg.MinStock != nil {
		sets = append(sets, "min_stock = ?")
		args = append(args, *arg.MinStock)
	}
	if arg.CostPerUnit != nil {
		sets = append(sets, "cost_per_unit = ?")
		args = append(args, *arg.CostPerUnit)
	}
	if len(sets) == 1 {
		return r.GetIngredientByID(ctx, arg.ID)
	}
	args = append(args, arg.ID)
	q := fmt.Sprintf("UPDATE ingredients SET %s WHERE id = ? AND deleted_at IS NULL",
		joinComma(sets))
	res, err := r.dbtx.ExecContext(ctx, q, args...)
	if err != nil {
		return Ingredient{}, fmt.Errorf("ingredient: update: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return Ingredient{}, sql.ErrNoRows
	}
	return r.GetIngredientByID(ctx, arg.ID)
}

func (r *ingredientRepo) SoftDeleteIngredient(ctx context.Context, id string) error {
	res, err := r.dbtx.ExecContext(ctx,
		"UPDATE ingredients SET deleted_at = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
		time.Now(), id)
	if err != nil {
		return fmt.Errorf("ingredient: delete: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *ingredientRepo) CreateStockMovement(ctx context.Context, arg CreateStockMovementParams) (StockMovement, error) {
	const q = `INSERT INTO stock_movements (id, ingredient_id, type, quantity, note, created_by, created_at)
	           VALUES (?, ?, ?, ?, ?, ?, NOW())`
	if _, err := r.dbtx.ExecContext(ctx, q,
		arg.ID, arg.IngredientID, arg.Type, arg.Quantity, arg.Note, arg.CreatedBy,
	); err != nil {
		return StockMovement{}, fmt.Errorf("stock_movement: create: %w", err)
	}

	// Update current_stock: add for 'in', subtract for 'out', set delta for 'adjustment'
	var stockQ string
	switch arg.Type {
	case "out":
		stockQ = "UPDATE ingredients SET current_stock = GREATEST(0, current_stock - ?), updated_at = NOW() WHERE id = ?"
	default: // "in" and "adjustment" both add
		stockQ = "UPDATE ingredients SET current_stock = current_stock + ?, updated_at = NOW() WHERE id = ?"
	}
	if _, err := r.dbtx.ExecContext(ctx, stockQ, arg.Quantity, arg.IngredientID); err != nil {
		return StockMovement{}, fmt.Errorf("stock_movement: update stock: %w", err)
	}

	var sm StockMovement
	err := r.dbtx.QueryRowContext(ctx,
		`SELECT id, ingredient_id, type, quantity, note, created_by, created_at
		 FROM stock_movements WHERE id = ? LIMIT 1`, arg.ID,
	).Scan(&sm.ID, &sm.IngredientID, &sm.Type, &sm.Quantity, &sm.Note, &sm.CreatedBy, &sm.CreatedAt)
	return sm, err
}

func (r *ingredientRepo) ListStockMovements(ctx context.Context, ingredientID string, limit int) ([]StockMovement, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := r.dbtx.QueryContext(ctx,
		`SELECT id, ingredient_id, type, quantity, note, created_by, created_at
		 FROM stock_movements WHERE ingredient_id = ?
		 ORDER BY created_at DESC LIMIT ?`, ingredientID, limit)
	if err != nil {
		return nil, fmt.Errorf("stock_movement: list: %w", err)
	}
	defer rows.Close()
	var list []StockMovement
	for rows.Next() {
		var sm StockMovement
		if err := rows.Scan(&sm.ID, &sm.IngredientID, &sm.Type, &sm.Quantity,
			&sm.Note, &sm.CreatedBy, &sm.CreatedAt); err != nil {
			return nil, fmt.Errorf("stock_movement: scan: %w", err)
		}
		list = append(list, sm)
	}
	return list, rows.Err()
}

func joinComma(ss []string) string {
	out := ""
	for i, s := range ss {
		if i > 0 {
			out += ", "
		}
		out += s
	}
	return out
}

var _ IngredientRepository = (*ingredientRepo)(nil)
