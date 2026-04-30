package repository

import (
	"context"
	"database/sql"
	"fmt"

	"banhcuon/be/internal/db"
)

// OrderItemRow is the input for inserting a single order_item (service builds these).
type OrderItemRow struct {
	ID               string
	ProductID        sql.NullString
	ComboID          sql.NullString
	ComboRefID       sql.NullString
	Name             string
	UnitPrice        string
	Quantity         int32
	ToppingsSnapshot []byte
	Note             sql.NullString
}

// CreateOrderWithItemsInput is the full order + items passed to the transaction helper.
type CreateOrderWithItemsInput struct {
	ID            string
	OrderNumber   string
	TableID       sql.NullString
	Source        db.OrdersSource
	CustomerName  sql.NullString
	CustomerPhone sql.NullString
	Note          sql.NullString
	CreatedBy     sql.NullString
	Items         []OrderItemRow
}

// OrderRepository wraps all sqlc order queries.
type OrderRepository interface {
	// CreateOrderWithItems runs an atomic transaction: insert order + items + recalculate total.
	CreateOrderWithItems(ctx context.Context, in CreateOrderWithItemsInput) error
	GetOrderByID(ctx context.Context, id string) (db.Order, error)
	GetOrderItemsByOrderID(ctx context.Context, orderID string) ([]db.OrderItem, error)
	GetOrderItemByID(ctx context.Context, id string) (db.OrderItem, error)
	GetActiveOrderByTable(ctx context.Context, tableID sql.NullString) (db.Order, error)
	ListAllOrders(ctx context.Context, limit, offset int32) ([]db.Order, error)
	ListActiveOrders(ctx context.Context) ([]db.Order, error)
	UpdateOrderStatus(ctx context.Context, status db.OrdersStatus, id string) error
	UpdateQtyServed(ctx context.Context, qtyServed int32, id string) error
	RecalculateTotalAmount(ctx context.Context, id string) error
	SoftDeleteOrder(ctx context.Context, id string) error
	SumQtyServedAndQuantity(ctx context.Context, orderID string) (served, total int64, error)
}

type orderRepo struct {
	q    *db.Queries
	sqlDB *sql.DB
}

// NewOrderRepo creates an OrderRepository. Pass the *sql.DB for transaction support.
func NewOrderRepo(sqlDB *sql.DB) OrderRepository {
	return &orderRepo{q: db.New(sqlDB), sqlDB: sqlDB}
}

func (r *orderRepo) CreateOrderWithItems(ctx context.Context, in CreateOrderWithItemsInput) error {
	tx, err := r.sqlDB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("order: begin tx: %w", err)
	}
	defer tx.Rollback()

	qtx := db.New(tx)

	if err := qtx.CreateOrder(ctx, db.CreateOrderParams{
		ID:            in.ID,
		OrderNumber:   in.OrderNumber,
		TableID:       in.TableID,
		Source:        in.Source,
		CustomerName:  in.CustomerName,
		CustomerPhone: in.CustomerPhone,
		Note:          in.Note,
		CreatedBy:     in.CreatedBy,
	}); err != nil {
		return fmt.Errorf("order: insert order: %w", err)
	}

	for _, item := range in.Items {
		if err := qtx.CreateOrderItem(ctx, db.CreateOrderItemParams{
			ID:               item.ID,
			OrderID:          in.ID,
			ProductID:        item.ProductID,
			ComboID:          item.ComboID,
			ComboRefID:       item.ComboRefID,
			Name:             item.Name,
			UnitPrice:        item.UnitPrice,
			Quantity:         item.Quantity,
			ToppingsSnapshot: item.ToppingsSnapshot,
			Note:             item.Note,
		}); err != nil {
			return fmt.Errorf("order: insert order_item: %w", err)
		}
	}

	if err := qtx.RecalculateTotalAmount(ctx, in.ID); err != nil {
		return fmt.Errorf("order: recalculate total: %w", err)
	}

	return tx.Commit()
}

func (r *orderRepo) GetOrderByID(ctx context.Context, id string) (db.Order, error) {
	return r.q.GetOrderByID(ctx, id)
}

func (r *orderRepo) GetOrderItemsByOrderID(ctx context.Context, orderID string) ([]db.OrderItem, error) {
	return r.q.GetOrderItemsByOrderID(ctx, orderID)
}

func (r *orderRepo) GetOrderItemByID(ctx context.Context, id string) (db.OrderItem, error) {
	return r.q.GetOrderItemByID(ctx, id)
}

func (r *orderRepo) GetActiveOrderByTable(ctx context.Context, tableID sql.NullString) (db.Order, error) {
	return r.q.GetActiveOrderByTable(ctx, tableID)
}

func (r *orderRepo) ListAllOrders(ctx context.Context, limit, offset int32) ([]db.Order, error) {
	return r.q.ListAllOrders(ctx, limit, offset)
}

func (r *orderRepo) ListActiveOrders(ctx context.Context) ([]db.Order, error) {
	// Active = pending, confirmed, preparing, ready
	rows, err := r.sqlDB.QueryContext(ctx, `
		SELECT id, order_number, table_id, status, source, customer_name, customer_phone,
		       note, total_amount, created_by, created_at, updated_at, deleted_at
		FROM orders
		WHERE status IN ('pending','confirmed','preparing','ready') AND deleted_at IS NULL
		ORDER BY created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var orders []db.Order
	for rows.Next() {
		var o db.Order
		if err := rows.Scan(&o.ID, &o.OrderNumber, &o.TableID, &o.Status, &o.Source,
			&o.CustomerName, &o.CustomerPhone, &o.Note, &o.TotalAmount, &o.CreatedBy,
			&o.CreatedAt, &o.UpdatedAt, &o.DeletedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}

func (r *orderRepo) UpdateOrderStatus(ctx context.Context, status db.OrdersStatus, id string) error {
	return r.q.UpdateOrderStatus(ctx, status, id)
}

func (r *orderRepo) UpdateQtyServed(ctx context.Context, qtyServed int32, id string) error {
	return r.q.UpdateQtyServed(ctx, qtyServed, id)
}

func (r *orderRepo) RecalculateTotalAmount(ctx context.Context, id string) error {
	return r.q.RecalculateTotalAmount(ctx, id)
}

func (r *orderRepo) SoftDeleteOrder(ctx context.Context, id string) error {
	return r.q.SoftDeleteOrder(ctx, id)
}

func (r *orderRepo) SumQtyServedAndQuantity(ctx context.Context, orderID string) (served, total int64, error) {
	row, err := r.q.SumQtyServedAndQuantity(ctx, orderID)
	if err != nil {
		return 0, 0, err
	}
	served = toInt64(row.TotalServed)
	total = toInt64(row.TotalQuantity)
	return served, total, nil
}

func toInt64(v interface{}) int64 {
	switch val := v.(type) {
	case int64:
		return val
	case int32:
		return int64(val)
	case float64:
		return int64(val)
	case []byte:
		var n int64
		fmt.Sscan(string(val), &n)
		return n
	}
	return 0
}

var _ OrderRepository = (*orderRepo)(nil)
