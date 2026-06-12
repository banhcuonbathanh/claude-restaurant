// P-SYSTEST reference build — sqlc wrapper layer: DB calls only, no business logic.
// The sandbox has no generated internal/db package, so the db.Queries boundary is sketched —
// each method names the sqlc query it wraps (be/query/products.sql). Not compiled into the app.
package repository

import (
	"context"
	"database/sql"
	"errors"

	"example.local/menuref/service"
)

type ProductRepo struct {
	db *sql.DB // production: *db.Queries (sqlc) — never raw SQL in repo methods
}

func NewProductRepo(db *sql.DB) *ProductRepo {
	return &ProductRepo{db: db}
}

// wraps -- name: ListCategories :many  (WHERE deleted_at IS NULL ORDER BY sort_order)
func (r *ProductRepo) ListCategories(ctx context.Context) ([]service.Category, error) {
	// rows := q.ListCategories(ctx) → map db.Category → service.Category
	return nil, errSandbox
}

// wraps -- name: ListProducts :many  (filters: category_id, search LIKE, is_available;
// always WHERE deleted_at IS NULL) + -- name: ListToppingsForProducts :many (join table)
func (r *ProductRepo) ListProducts(ctx context.Context, f service.ProductFilter) ([]service.Product, error) {
	return nil, errSandbox
}

// wraps -- name: ListCombos :many + -- name: ListComboItems :many
func (r *ProductRepo) ListCombos(ctx context.Context) ([]service.Combo, error) {
	return nil, errSandbox
}

// wraps -- name: GetProduct :one — sql.ErrNoRows → (nil, nil) so service maps to NOT_FOUND
func (r *ProductRepo) GetProductSnapshot(ctx context.Context, id string) (*service.Product, error) {
	return nil, errSandbox
}

// wraps -- name: GetTopping :one
func (r *ProductRepo) GetToppingSnapshot(ctx context.Context, id string) (*service.Topping, error) {
	return nil, errSandbox
}

var errSandbox = errors.New("P-SYSTEST sandbox: repository bodies are sketched — see production be/internal/repository/product_repo.go")
