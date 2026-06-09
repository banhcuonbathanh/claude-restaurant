package service

// order_payment_extra_test.go — additional order & payment test cases
// Run with: cd be && go test ./internal/service/... -v

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// ──────────────────────────── ORDER TESTS ────────────────────────────────────

// TestCreateOrder_EmptyItems verifies that an order with zero items is rejected
// with ErrInvalidInput — the service must not persist an empty order (Spec4 §5).
func TestCreateOrder_EmptyItems(t *testing.T) {
	svc := newTestOrderService(&mockOrderRepo{}, &mockProductLookup{})

	_, _, err := svc.CreateOrder(context.Background(), CreateOrderInput{
		CustomerName:  "Test",
		CustomerPhone: "0901234567",
		Items:         []CreateOrderItemInput{}, // zero items
	})
	if err == nil {
		t.Fatal("expected error for empty items list, got nil")
	}
	var appErr *AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected *AppError, got %T: %v", err, err)
	}
	if appErr.Status != 400 {
		t.Fatalf("expected HTTP 400, got %d", appErr.Status)
	}
}

// TestCreateOrder_ProductNotFound verifies that referencing a non-existent product
// returns an error and does NOT call CreateOrderWithItems in the repo (Spec4 §5).
func TestCreateOrder_ProductNotFound(t *testing.T) {
	createCalled := false
	repo := &mockOrderRepo{
		createOrderFn: func(_ context.Context, _ repository.CreateOrderWithItemsInput) error {
			createCalled = true
			return nil
		},
	}
	lookup := &mockProductLookup{
		getProductSnapshotFn: func(_ context.Context, _ string) (ProductSnapshot, error) {
			return ProductSnapshot{}, ErrNotFound // product does not exist
		},
	}
	svc := newTestOrderService(repo, lookup)

	_, _, err := svc.CreateOrder(context.Background(), CreateOrderInput{
		Items: []CreateOrderItemInput{
			{ProductID: "non-existent-prod", Quantity: 1},
		},
	})
	if err == nil {
		t.Fatal("expected error for non-existent product, got nil")
	}
	if createCalled {
		t.Fatal("CreateOrderWithItems must NOT be called when product lookup fails")
	}
}

// TestCreateOrder_TakeawayNoTable verifies that a takeaway order (no table) is
// accepted — table_id is optional per Spec4 §5 "dùng cho cả dine-in lẫn take-away".
func TestCreateOrder_TakeawayNoTable(t *testing.T) {
	createCalled := false
	repo := &mockOrderRepo{
		getActiveOrderByTableFn: func(_ context.Context, tableID sql.NullString) (db.Order, error) {
			// takeaway: tableID should be null — no conflict check needed
			if tableID.Valid {
				t.Errorf("expected null tableID for takeaway, got %q", tableID.String)
			}
			return db.Order{}, sql.ErrNoRows
		},
		createOrderFn: func(_ context.Context, _ repository.CreateOrderWithItemsInput) error {
			createCalled = true
			return nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	_, _, err := svc.CreateOrder(context.Background(), CreateOrderInput{
		TableID:      "", // no table — takeaway
		CustomerName: "Take Away",
		Items:        []CreateOrderItemInput{{ProductID: "prod-1", Quantity: 2}},
	})
	if err != nil {
		t.Fatalf("expected takeaway order to succeed, got: %v", err)
	}
	if !createCalled {
		t.Fatal("expected CreateOrderWithItems to be called for takeaway order")
	}
}

// TestCancelOrder_AlreadyCancelled verifies that cancelling a soft-deleted (cancelled)
// order returns an error — double-cancel must be rejected (Spec4 §7).
func TestCancelOrder_AlreadyCancelled(t *testing.T) {
	softDeleteCalled := false
	repo := &mockOrderRepo{
		getOrderByIDFn: func(_ context.Context, _ string) (db.Order, error) {
			return db.Order{
				ID:        "order-already-cancelled",
				Status:    db.OrdersStatusCancelled,
				DeletedAt: sql.NullTime{Valid: true}, // already cancelled
			}, nil
		},
		softDeleteOrderFn: func(_ context.Context, _ string) error {
			softDeleteCalled = true
			return nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	err := svc.CancelOrder(context.Background(), "order-already-cancelled", "staff-id", "staff")
	if err == nil {
		t.Fatal("expected error when cancelling already-cancelled order, got nil")
	}
	if softDeleteCalled {
		t.Fatal("SoftDeleteOrder must NOT be called for already-cancelled order")
	}
}

// TestCancelOrder_ExactlyAt30Percent verifies that cancellation is blocked at EXACTLY
// 30% served — the rule is "≥ 30%" (Spec4 §7 "đã phục vụ từ 30% trở lên").
func TestCancelOrder_ExactlyAt30Percent(t *testing.T) {
	softDeleteCalled := false
	repo := &mockOrderRepo{
		getOrderByIDFn: func(_ context.Context, _ string) (db.Order, error) {
			return db.Order{ID: "order-30pct", Status: db.OrdersStatusPreparing}, nil
		},
		// 3 served out of 10 = exactly 30%
		sumQtyServedAndQuantityFn: func(_ context.Context, _ string) (int64, int64, error) {
			return 3, 10, nil
		},
		softDeleteOrderFn: func(_ context.Context, _ string) error {
			softDeleteCalled = true
			return nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	err := svc.CancelOrder(context.Background(), "order-30pct", "staff-id", "staff")
	if err == nil {
		t.Fatal("expected CANCEL_THRESHOLD at exactly 30%, got nil")
	}
	var appErr *AppError
	if !errors.As(err, &appErr) || appErr.Code != "CANCEL_THRESHOLD" {
		t.Fatalf("expected CANCEL_THRESHOLD, got %v", err)
	}
	if softDeleteCalled {
		t.Fatal("SoftDeleteOrder must NOT be called when threshold is met")
	}
}

// TestAddItems_PaidOrder_Blocked verifies that AddItemsToOrder rejects adding items
// to a 'paid' order — paid is a terminal state (Spec4 §5.2).
func TestAddItems_PaidOrder_Blocked(t *testing.T) {
	repo := &mockOrderRepo{
		getOrderByIDFn: func(_ context.Context, _ string) (db.Order, error) {
			return db.Order{
				ID:     "order-paid",
				Status: db.OrdersStatusPaid,
			}, nil
		},
	}
	svc := newTestOrderService(repo, &mockProductLookup{})

	_, err := svc.AddItemsToOrder(context.Background(), "order-paid", "staff-id", "cashier",
		[]CreateOrderItemInput{{ProductID: "prod-1", Quantity: 1}},
	)
	if err == nil {
		t.Fatal("expected error adding items to paid order, got nil")
	}
	var appErr *AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected *AppError, got %T: %v", err, err)
	}
	// Paid is a non-editable state — expect ORDER_NOT_EDITABLE or similar 4xx
	if appErr.Status < 400 || appErr.Status >= 500 {
		t.Fatalf("expected 4xx error for paid order, got %d", appErr.Status)
	}
}

// ──────────────────────────── PAYMENT TESTS ──────────────────────────────────

// TestCreatePayment_DuplicatePayment verifies that creating a second payment for the
// same order returns ErrPaymentAlreadyExists (Spec5 §3 "idempotency").
func TestCreatePayment_DuplicatePayment(t *testing.T) {
	const orderID = "order-dup-pay"

	reader := &mockOrderReader{
		getForPaymentFn: func(_ context.Context, _ string) (OrderPaymentView, error) {
			return OrderPaymentView{
				ID:          orderID,
				Status:      "ready",
				TotalAmount: 100000,
			}, nil
		},
	}
	repo := &mockPaymentRepo{
		getByOrderIDFn: func(_ context.Context, _ string) (db.Payment, error) {
			// an existing payment already exists
			return pendingPayment(orderID, "100000"), nil
		},
	}
	svc := newTestPaymentService(repo, reader, &mockOrderWriter{}, &mockPaymentRedis{})

	_, err := svc.CreatePayment(context.Background(), CreatePaymentInput{
		OrderID: orderID,
		Method:  "cash",
	})
	if !errors.Is(err, ErrPaymentAlreadyExists) {
		t.Fatalf("expected ErrPaymentAlreadyExists for duplicate payment, got %v", err)
	}
}

// TestVNPayWebhook_FailedResponseCode verifies that a non-"00" VNPay response code
// marks the payment as failed and does NOT call MarkOrderPaid (Spec5 §11).
func TestVNPayWebhook_FailedResponseCode(t *testing.T) {
	const orderID = "order-vnpay-fail"

	var capturedStatus db.PaymentsStatus
	writer := &mockOrderWriter{}
	repo := &mockPaymentRepo{
		getByOrderIDFn: func(_ context.Context, _ string) (db.Payment, error) {
			return pendingPayment(orderID, "200000"), nil
		},
		updatePaymentStatusFn: func(_ context.Context, arg db.UpdatePaymentStatusParams) error {
			capturedStatus = arg.Status
			return nil
		},
	}
	svc := newTestPaymentService(repo, &mockOrderReader{}, writer, &mockPaymentRedis{})

	params := map[string]string{
		"vnp_TxnRef":        orderID,
		"vnp_ResponseCode":  "24", // user cancelled
		"vnp_TransactionNo": "GW-TX-FAIL",
		"vnp_Amount":        "20000000",
	}
	if err := svc.HandleVNPayWebhook(context.Background(), params, true); err != nil {
		t.Fatalf("HandleVNPayWebhook returned unexpected error: %v", err)
	}

	if capturedStatus != db.PaymentsStatusFailed {
		t.Errorf("expected payment status=failed for non-00 response code, got %s", capturedStatus)
	}

	writer.mu.Lock()
	paid := writer.paidIDs
	writer.mu.Unlock()
	if len(paid) > 0 {
		t.Errorf("MarkOrderPaid must NOT be called when VNPay response code is non-00, got %v", paid)
	}
}

// TestVNPayWebhook_OrderNotFound verifies that a webhook for an unknown order ID
// returns an error without panicking (Spec5 §11 defensive check).
func TestVNPayWebhook_OrderNotFound(t *testing.T) {
	repo := &mockPaymentRepo{
		getByOrderIDFn: func(_ context.Context, _ string) (db.Payment, error) {
			return db.Payment{}, ErrNotFound
		},
	}
	svc := newTestPaymentService(repo, &mockOrderReader{}, &mockOrderWriter{}, &mockPaymentRedis{})

	params := map[string]string{
		"vnp_TxnRef":        "ghost-order-id",
		"vnp_ResponseCode":  "00",
		"vnp_TransactionNo": "GW-TX-GHOST",
		"vnp_Amount":        "10000000",
	}
	err := svc.HandleVNPayWebhook(context.Background(), params, true)
	if err == nil {
		t.Fatal("expected error for unknown order in webhook, got nil")
	}
}
