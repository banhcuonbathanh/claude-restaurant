// P-SYSTEST reference build — order repo: the ONLY layer that opens transactions.
// Pattern: BeginTx → INSERT order → INSERT each item row → RecalculateTotalAmount → Commit
// (any error → Rollback). Not compiled into the app.
package repository

import (
	"context"
	"database/sql"

	"example.local/menuref/service"
)

type OrderRepo struct {
	db *sql.DB // production: *sql.DB + *db.Queries (sqlc, be/query/orders.sql)
}

func NewOrderRepo(db *sql.DB) *OrderRepo {
	return &OrderRepo{db: db}
}

// wraps -- name: GetActiveOrderByTable :one
// (status NOT IN ('delivered','cancelled','paid') AND deleted_at IS NULL)
// Feeds the table_busy flag — does NOT block creation (post-TOP contract).
func (r *OrderRepo) HasActiveOrderForTable(ctx context.Context, tableID string) (bool, error) {
	return false, errSandbox
}

// One transaction:
//  1. -- name: CreateOrder :exec          (header row incl. order_number, status 'pending')
//  2. -- name: CreateOrderItem :exec ×N   (combo header rows keep unit_price = 0;
//                                          toppings_snapshot stored as JSON)
//  3. -- name: RecalculateTotalAmount :exec
//     UPDATE orders SET total_amount = (SELECT SUM(unit_price*quantity) FROM order_items …)
//     — MANDATORY after every order_items mutation; total_amount is denormalized.
func (r *OrderRepo) CreateOrderWithItems(ctx context.Context, order *service.Order) error {
	return errSandbox
}

// wraps -- name: GetOrder :one + -- name: ListOrderItems :many
// Items return UNORDERED (by item UUID) — combo grouping is reconstructed by readers
// via combo_ref_id; item_status derived from qty_served (no status column).
func (r *OrderRepo) GetOrder(ctx context.Context, id string) (*service.Order, error) {
	return nil, errSandbox
}
