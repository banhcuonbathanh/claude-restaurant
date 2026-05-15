package service

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// ─── mockOrderRedis ───────────────────────────────────────────────────────────

type mockOrderRedis struct{}

func (m *mockOrderRedis) Incr(ctx context.Context, key string) *redis.IntCmd {
	cmd := redis.NewIntCmd(ctx, "incr", key)
	cmd.SetVal(1)
	return cmd
}

func (m *mockOrderRedis) Expire(ctx context.Context, key string, expiration time.Duration) *redis.BoolCmd {
	cmd := redis.NewBoolCmd(ctx, "expire", key, expiration)
	cmd.SetVal(true)
	return cmd
}

func (m *mockOrderRedis) Publish(ctx context.Context, channel string, message interface{}) *redis.IntCmd {
	cmd := redis.NewIntCmd(ctx, "publish", channel, message)
	cmd.SetVal(0)
	return cmd
}

var _ orderRedisClient = (*mockOrderRedis)(nil)

// ─── mockOrderRepo ────────────────────────────────────────────────────────────

type mockOrderRepo struct {
	createOrderFn              func(ctx context.Context, in repository.CreateOrderWithItemsInput) error
	getActiveOrderByTableFn    func(ctx context.Context, tableID sql.NullString) (db.Order, error)
	getOrderByIDFn             func(ctx context.Context, id string) (db.Order, error)
	sumQtyServedAndQuantityFn  func(ctx context.Context, orderID string) (int64, int64, error)
	softDeleteOrderFn          func(ctx context.Context, orderID string) error
	getOrderItemByIDFn         func(ctx context.Context, id string) (db.OrderItem, error)
	updateQtyServedFn          func(ctx context.Context, qty int32, itemID string) error
	updateOrderStatusFn        func(ctx context.Context, status db.OrdersStatus, orderID string) error
}

func (m *mockOrderRepo) CreateOrderWithItems(ctx context.Context, in repository.CreateOrderWithItemsInput) error {
	if m.createOrderFn != nil {
		return m.createOrderFn(ctx, in)
	}
	return nil
}

func (m *mockOrderRepo) GetActiveOrderByTable(ctx context.Context, tableID sql.NullString) (db.Order, error) {
	if m.getActiveOrderByTableFn != nil {
		return m.getActiveOrderByTableFn(ctx, tableID)
	}
	return db.Order{}, sql.ErrNoRows
}

func (m *mockOrderRepo) GetOrderByID(ctx context.Context, id string) (db.Order, error) {
	if m.getOrderByIDFn != nil {
		return m.getOrderByIDFn(ctx, id)
	}
	return db.Order{}, sql.ErrNoRows
}
func (m *mockOrderRepo) GetOrderItemsByOrderID(_ context.Context, _ string) ([]db.OrderItem, error) {
	return nil, nil
}
func (m *mockOrderRepo) GetOrderItemByID(ctx context.Context, id string) (db.OrderItem, error) {
	if m.getOrderItemByIDFn != nil {
		return m.getOrderItemByIDFn(ctx, id)
	}
	return db.OrderItem{}, sql.ErrNoRows
}
func (m *mockOrderRepo) ListAllOrders(_ context.Context, _, _ int32) ([]db.Order, error) {
	return nil, nil
}
func (m *mockOrderRepo) ListActiveOrders(_ context.Context) ([]db.Order, error) { return nil, nil }
func (m *mockOrderRepo) UpdateOrderStatus(ctx context.Context, status db.OrdersStatus, orderID string) error {
	if m.updateOrderStatusFn != nil {
		return m.updateOrderStatusFn(ctx, status, orderID)
	}
	return nil
}
func (m *mockOrderRepo) UpdateQtyServed(ctx context.Context, qty int32, itemID string) error {
	if m.updateQtyServedFn != nil {
		return m.updateQtyServedFn(ctx, qty, itemID)
	}
	return nil
}
func (m *mockOrderRepo) RecalculateTotalAmount(_ context.Context, _ string) error   { return nil }
func (m *mockOrderRepo) SoftDeleteOrder(ctx context.Context, orderID string) error {
	if m.softDeleteOrderFn != nil {
		return m.softDeleteOrderFn(ctx, orderID)
	}
	return nil
}
func (m *mockOrderRepo) SumQtyServedAndQuantity(ctx context.Context, orderID string) (int64, int64, error) {
	if m.sumQtyServedAndQuantityFn != nil {
		return m.sumQtyServedAndQuantityFn(ctx, orderID)
	}
	return 0, 0, nil
}
func (m *mockOrderRepo) SetOrderGroupID(_ context.Context, _, _ string) error  { return nil }
func (m *mockOrderRepo) ClearOrderGroupID(_ context.Context, _ string) error   { return nil }
func (m *mockOrderRepo) ListOrdersByGroupID(_ context.Context, _ string) ([]db.Order, error) {
	return nil, nil
}

var _ repository.OrderRepository = (*mockOrderRepo)(nil)

// ─── mockTableRepo ────────────────────────────────────────────────────────────

type mockTableRepo struct{}

func (m *mockTableRepo) ListTables(_ context.Context) ([]repository.TableRow, error) { return nil, nil }
func (m *mockTableRepo) GetTableByID(_ context.Context, _ string) (db.Table, error) {
	return db.Table{}, sql.ErrNoRows
}
func (m *mockTableRepo) GetTableByQRToken(_ context.Context, _ string) (db.Table, error) {
	return db.Table{}, sql.ErrNoRows
}
func (m *mockTableRepo) CreateTable(_ context.Context, _, _, _ string, _ int32) error { return nil }
func (m *mockTableRepo) UpdateTable(_ context.Context, _ string, _ string, _ int32, _ bool) error {
	return nil
}

var _ repository.TableRepository = (*mockTableRepo)(nil)

// ─── mockProductLookup ────────────────────────────────────────────────────────

type mockProductLookup struct {
	getProductSnapshotFn func(ctx context.Context, productID string) (ProductSnapshot, error)
	getComboSnapshotFn   func(ctx context.Context, comboID string) (ComboSnapshot, error)
}

func (m *mockProductLookup) GetProductSnapshot(ctx context.Context, productID string) (ProductSnapshot, error) {
	if m.getProductSnapshotFn != nil {
		return m.getProductSnapshotFn(ctx, productID)
	}
	return ProductSnapshot{ID: productID, Name: "Product", UnitPrice: 50000}, nil
}

func (m *mockProductLookup) GetComboSnapshot(ctx context.Context, comboID string) (ComboSnapshot, error) {
	if m.getComboSnapshotFn != nil {
		return m.getComboSnapshotFn(ctx, comboID)
	}
	return ComboSnapshot{}, ErrNotFound
}

var _ ProductLookup = (*mockProductLookup)(nil)

// ─── helpers ──────────────────────────────────────────────────────────────────

func newTestOrderService(repo repository.OrderRepository, lookup ProductLookup) *OrderService {
	return &OrderService{
		repo:          repo,
		tableRepo:     &mockTableRepo{},
		rdb:           &mockOrderRedis{},
		productLookup: lookup,
	}
}

// ─── Tests ────────────────────────────────────────────────────────────────────

// TestCreateOrder_ComboExpand verifies that a combo item is expanded into:
//   - 1 header row  (combo_id set, combo_ref_id null)
//   - N sub-item rows (product_id set, combo_ref_id = header.id)
//
// per Spec4 §5 "Combo expand (trong transaction)".
func TestCreateOrder_ComboExpand(t *testing.T) {
	const comboID = "combo-uuid-1"

	comboSnap := ComboSnapshot{
		ID:    comboID,
		Name:  "Combo Gia Đình",
		Price: 180000,
		Items: []ComboItemTemplate{
			{ProductID: "prod-1", Name: "Bánh Cuốn Thịt", UnitPrice: 55000, Quantity: 2},
			{ProductID: "prod-2", Name: "Chả Lụa", UnitPrice: 30000, Quantity: 1},
		},
	}

	var captured repository.CreateOrderWithItemsInput
	repo := &mockOrderRepo{
		createOrderFn: func(_ context.Context, in repository.CreateOrderWithItemsInput) error {
			captured = in
			return nil
		},
	}
	lookup := &mockProductLookup{
		getComboSnapshotFn: func(_ context.Context, _ string) (ComboSnapshot, error) {
			return comboSnap, nil
		},
	}
	svc := newTestOrderService(repo, lookup)

	_, err := svc.CreateOrder(context.Background(), CreateOrderInput{
		CustomerName:  "Test",
		CustomerPhone: "0901234567",
		Items: []CreateOrderItemInput{
			{ComboID: comboID, Quantity: 1},
		},
	})
	if err != nil {
		t.Fatalf("CreateOrder failed: %v", err)
	}

	// 1 header + 2 sub-items = 3 rows total
	wantRows := 1 + len(comboSnap.Items)
	if got := len(captured.Items); got != wantRows {
		t.Fatalf("expected %d order_item rows, got %d", wantRows, got)
	}

	header := captured.Items[0]
	if !header.ComboID.Valid {
		t.Fatal("header row: expected combo_id to be set")
	}
	if header.ComboID.String != comboID {
		t.Fatalf("header row: combo_id = %q, want %q", header.ComboID.String, comboID)
	}
	if header.ComboRefID.Valid {
		t.Fatal("header row: expected combo_ref_id to be NULL")
	}

	headerID := header.ID
	for i, sub := range captured.Items[1:] {
		if !sub.ProductID.Valid {
			t.Errorf("sub-item[%d]: expected product_id to be set", i)
		}
		if !sub.ComboRefID.Valid {
			t.Errorf("sub-item[%d]: expected combo_ref_id to be set", i)
		}
		if sub.ComboRefID.String != headerID {
			t.Errorf("sub-item[%d]: combo_ref_id = %q, want header id %q", i, sub.ComboRefID.String, headerID)
		}
	}
}

// TestCreateOrder_DuplicateTable verifies that creating a second order for a table
// that already has an active order returns a 409 TABLE_HAS_ACTIVE_ORDER error (Spec4 §5).
func TestCreateOrder_DuplicateTable(t *testing.T) {
	const tableID = "table-uuid-A3"

	existing := db.Order{
		ID:     "existing-order-uuid",
		Status: db.OrdersStatusPending,
		TableID: sql.NullString{String: tableID, Valid: true},
	}

	repo := &mockOrderRepo{
		getActiveOrderByTableFn: func(_ context.Context, _ sql.NullString) (db.Order, error) {
			return existing, nil // signals: table already has an active order
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	_, err := svc.CreateOrder(context.Background(), CreateOrderInput{
		TableID:       tableID,
		CustomerName:  "Test",
		CustomerPhone: "0901234567",
		Items: []CreateOrderItemInput{
			{ProductID: "prod-1", Quantity: 1},
		},
	})
	if err == nil {
		t.Fatal("expected error for duplicate table order, got nil")
	}

	var appErr *AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected *AppError, got %T: %v", err, err)
	}
	if appErr.Code != "TABLE_HAS_ACTIVE_ORDER" {
		t.Fatalf("expected code TABLE_HAS_ACTIVE_ORDER, got %q", appErr.Code)
	}
	if appErr.Status != 409 {
		t.Fatalf("expected HTTP 409, got %d", appErr.Status)
	}
}

// TestCancelOrder_Under30Percent verifies that an order can be cancelled when
// fewer than 30% of items have been served (Spec4 §7).
func TestCancelOrder_Under30Percent(t *testing.T) {
	const orderID = "order-cancel-ok"

	softDeleteCalled := false
	repo := &mockOrderRepo{
		getOrderByIDFn: func(_ context.Context, _ string) (db.Order, error) {
			return db.Order{
				ID:     orderID,
				Status: db.OrdersStatusPreparing,
			}, nil
		},
		// 1 served out of 5 total = 20% — under threshold
		sumQtyServedAndQuantityFn: func(_ context.Context, _ string) (int64, int64, error) {
			return 1, 5, nil
		},
		softDeleteOrderFn: func(_ context.Context, _ string) error {
			softDeleteCalled = true
			return nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	err := svc.CancelOrder(context.Background(), orderID, "staff-id", "staff")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if !softDeleteCalled {
		t.Fatal("expected SoftDeleteOrder to be called, but it was not")
	}
}

// TestCancelOrder_Over30Percent verifies that cancellation is rejected when
// 30% or more of items have already been served (Spec4 §7).
func TestCancelOrder_Over30Percent(t *testing.T) {
	const orderID = "order-cancel-blocked"

	softDeleteCalled := false
	repo := &mockOrderRepo{
		getOrderByIDFn: func(_ context.Context, _ string) (db.Order, error) {
			return db.Order{
				ID:     orderID,
				Status: db.OrdersStatusPreparing,
			}, nil
		},
		// 3 served out of 8 total = 37.5% — over threshold
		sumQtyServedAndQuantityFn: func(_ context.Context, _ string) (int64, int64, error) {
			return 3, 8, nil
		},
		softDeleteOrderFn: func(_ context.Context, _ string) error {
			softDeleteCalled = true
			return nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	err := svc.CancelOrder(context.Background(), orderID, "staff-id", "staff")
	if err == nil {
		t.Fatal("expected CANCEL_THRESHOLD error, got nil")
	}

	var appErr *AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected *AppError, got %T: %v", err, err)
	}
	if appErr.Code != "CANCEL_THRESHOLD" {
		t.Fatalf("expected code CANCEL_THRESHOLD, got %q", appErr.Code)
	}
	if appErr.Status != 422 {
		t.Fatalf("expected HTTP 422, got %d", appErr.Status)
	}
	if softDeleteCalled {
		t.Fatal("SoftDeleteOrder must NOT be called when threshold exceeded")
	}
}

// TestItemStatusCycle verifies that UpdateItemServed correctly cycles qty_served
// through the pending → preparing → done progression for an item with qty=2 (Spec4 §8).
// It also verifies that newQtyServed > item.Quantity is rejected with ErrInvalidInput.
func TestItemStatusCycle(t *testing.T) {
	const (
		itemID  = "item-uuid-cycle"
		orderID = "order-uuid-cycle"
	)

	item := db.OrderItem{
		ID:       itemID,
		OrderID:  orderID,
		Quantity: 2,
	}

	var capturedQty int32
	repo := &mockOrderRepo{
		getOrderItemByIDFn: func(_ context.Context, _ string) (db.OrderItem, error) {
			return item, nil
		},
		updateQtyServedFn: func(_ context.Context, qty int32, _ string) error {
			capturedQty = qty
			return nil
		},
		// Always partial — auto-ready not expected in this test
		sumQtyServedAndQuantityFn: func(_ context.Context, _ string) (int64, int64, error) {
			return int64(capturedQty), 4, nil // served < total always
		},
		getOrderByIDFn: func(_ context.Context, _ string) (db.Order, error) {
			return db.Order{ID: orderID, Status: db.OrdersStatusPending}, nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	// pending → preparing: qty_served = 1
	if err := svc.UpdateItemServed(context.Background(), itemID, 1); err != nil {
		t.Fatalf("UpdateItemServed(1) failed: %v", err)
	}
	if capturedQty != 1 {
		t.Fatalf("expected UpdateQtyServed(1), got %d", capturedQty)
	}

	// preparing → done: qty_served = 2 (== quantity)
	if err := svc.UpdateItemServed(context.Background(), itemID, 2); err != nil {
		t.Fatalf("UpdateItemServed(2) failed: %v", err)
	}
	if capturedQty != 2 {
		t.Fatalf("expected UpdateQtyServed(2), got %d", capturedQty)
	}

	// over-quantity: must be rejected with ErrInvalidInput
	err := svc.UpdateItemServed(context.Background(), itemID, 3)
	if err == nil {
		t.Fatal("expected ErrInvalidInput for newQtyServed > quantity, got nil")
	}
	if !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("expected ErrInvalidInput, got %T: %v", err, err)
	}
}

// TestAutoReadyWhenAllItemsDone verifies that UpdateItemServed auto-transitions an order
// from 'preparing' to 'ready' when SumQtyServedAndQuantity reports served == total (Spec4 §8).
func TestAutoReadyWhenAllItemsDone(t *testing.T) {
	const (
		itemID  = "item-uuid-autoready"
		orderID = "order-uuid-autoready"
	)

	item := db.OrderItem{
		ID:       itemID,
		OrderID:  orderID,
		Quantity: 2,
	}

	var capturedStatus db.OrdersStatus
	repo := &mockOrderRepo{
		getOrderItemByIDFn: func(_ context.Context, _ string) (db.OrderItem, error) {
			return item, nil
		},
		// After update: all 2 of 2 served — triggers auto-ready
		sumQtyServedAndQuantityFn: func(_ context.Context, _ string) (int64, int64, error) {
			return 2, 2, nil
		},
		getOrderByIDFn: func(_ context.Context, _ string) (db.Order, error) {
			return db.Order{ID: orderID, Status: db.OrdersStatusPreparing}, nil
		},
		updateOrderStatusFn: func(_ context.Context, status db.OrdersStatus, _ string) error {
			capturedStatus = status
			return nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	if err := svc.UpdateItemServed(context.Background(), itemID, 2); err != nil {
		t.Fatalf("UpdateItemServed failed: %v", err)
	}
	if capturedStatus != db.OrdersStatusReady {
		t.Fatalf("expected order auto-transitioned to 'ready', got %q", capturedStatus)
	}
}
