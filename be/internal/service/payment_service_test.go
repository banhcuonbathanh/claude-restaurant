package service

import (
	"context"
	"database/sql"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// ─── mockPaymentRedis ─────────────────────────────────────────────────────────

type mockPaymentRedis struct {
	mu       sync.Mutex
	published []string // channel+message pairs recorded as "channel:message"
}

func (m *mockPaymentRedis) Publish(ctx context.Context, channel string, message interface{}) *redis.IntCmd {
	m.mu.Lock()
	m.published = append(m.published, channel)
	m.mu.Unlock()
	cmd := redis.NewIntCmd(ctx, "publish", channel, message)
	cmd.SetVal(1)
	return cmd
}

var _ paymentRedisClient = (*mockPaymentRedis)(nil)

// ─── mockPaymentRepo ──────────────────────────────────────────────────────────

type mockPaymentRepo struct {
	createPaymentFn       func(ctx context.Context, arg db.CreatePaymentParams) error
	getByIDFn             func(ctx context.Context, id string) (db.Payment, error)
	getByOrderIDFn        func(ctx context.Context, orderID string) (db.Payment, error)
	updatePaymentStatusFn func(ctx context.Context, arg db.UpdatePaymentStatusParams) error
	incrementAttemptFn    func(ctx context.Context, id string) error
}

func (m *mockPaymentRepo) CreatePayment(ctx context.Context, arg db.CreatePaymentParams) error {
	if m.createPaymentFn != nil {
		return m.createPaymentFn(ctx, arg)
	}
	return nil
}

func (m *mockPaymentRepo) GetPaymentByID(ctx context.Context, id string) (db.Payment, error) {
	if m.getByIDFn != nil {
		return m.getByIDFn(ctx, id)
	}
	return db.Payment{}, sql.ErrNoRows
}

func (m *mockPaymentRepo) GetPaymentByOrderID(ctx context.Context, orderID string) (db.Payment, error) {
	if m.getByOrderIDFn != nil {
		return m.getByOrderIDFn(ctx, orderID)
	}
	return db.Payment{}, sql.ErrNoRows
}

func (m *mockPaymentRepo) UpdatePaymentStatus(ctx context.Context, arg db.UpdatePaymentStatusParams) error {
	if m.updatePaymentStatusFn != nil {
		return m.updatePaymentStatusFn(ctx, arg)
	}
	return nil
}

func (m *mockPaymentRepo) IncrementPaymentAttempt(ctx context.Context, id string) error {
	if m.incrementAttemptFn != nil {
		return m.incrementAttemptFn(ctx, id)
	}
	return nil
}

func (m *mockPaymentRepo) SoftDeletePayment(_ context.Context, _ string) error { return nil }

var _ repository.PaymentRepository = (*mockPaymentRepo)(nil)

// ─── mockOrderReader / mockOrderWriter ────────────────────────────────────────

type mockOrderReader struct {
	getForPaymentFn func(ctx context.Context, orderID string) (OrderPaymentView, error)
}

func (m *mockOrderReader) GetOrderForPayment(ctx context.Context, orderID string) (OrderPaymentView, error) {
	if m.getForPaymentFn != nil {
		return m.getForPaymentFn(ctx, orderID)
	}
	return OrderPaymentView{}, ErrNotFound
}

var _ OrderReader = (*mockOrderReader)(nil)

type mockOrderWriter struct {
	markDeliveredFn func(ctx context.Context, orderID string) error
	deliveredIDs    []string
	mu              sync.Mutex
}

func (m *mockOrderWriter) MarkOrderDelivered(ctx context.Context, orderID string) error {
	m.mu.Lock()
	m.deliveredIDs = append(m.deliveredIDs, orderID)
	m.mu.Unlock()
	if m.markDeliveredFn != nil {
		return m.markDeliveredFn(ctx, orderID)
	}
	return nil
}

var _ OrderWriter = (*mockOrderWriter)(nil)

// ─── helpers ──────────────────────────────────────────────────────────────────

func newTestPaymentService(repo repository.PaymentRepository, reader OrderReader, writer OrderWriter, rdb paymentRedisClient) *PaymentService {
	return &PaymentService{repo: repo, orderReader: reader, orderWriter: writer, rdb: rdb}
}

// pendingPayment returns a Payment in pending state with the given orderID and amount (VND string).
func pendingPayment(orderID, amount string) db.Payment {
	return db.Payment{
		ID:        "pay-uuid-1",
		OrderID:   orderID,
		Method:    db.PaymentsMethodVnpay,
		Status:    db.PaymentsStatusPending,
		Amount:    amount,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

// ─── Tests ────────────────────────────────────────────────────────────────────

// TestCreatePayment_OrderNotReady verifies that CreatePayment returns ErrOrderNotReady
// when order.status ≠ "ready" — per Spec5 §3 "payment chỉ được tạo khi order.status = ready".
func TestCreatePayment_OrderNotReady(t *testing.T) {
	reader := &mockOrderReader{
		getForPaymentFn: func(_ context.Context, _ string) (OrderPaymentView, error) {
			return OrderPaymentView{}, ErrOrderNotReady
		},
	}
	svc := newTestPaymentService(&mockPaymentRepo{}, reader, &mockOrderWriter{}, &mockPaymentRedis{})

	_, err := svc.CreatePayment(context.Background(), CreatePaymentInput{
		OrderID: "order-uuid-1",
		Method:  "vnpay",
	})

	if !errors.Is(err, ErrOrderNotReady) {
		t.Fatalf("expected ErrOrderNotReady, got %v", err)
	}
}

// TestVNPayWebhook_ValidSignature verifies the happy path: valid HMAC + pending payment →
// payment status set to completed, order marked delivered, WS event published on "orders:kds".
func TestVNPayWebhook_ValidSignature(t *testing.T) {
	const orderID = "order-uuid-vnpay"
	const amountVND int64 = 290000
	// VNPay sends amount × 100
	vnpayAmountStr := "29000000"

	updatedStatus := db.PaymentsStatusPending // tracks what UpdatePaymentStatus was called with
	writer := &mockOrderWriter{}
	rdb := &mockPaymentRedis{}

	repo := &mockPaymentRepo{
		getByOrderIDFn: func(_ context.Context, _ string) (db.Payment, error) {
			return pendingPayment(orderID, "290000"), nil
		},
		updatePaymentStatusFn: func(_ context.Context, arg db.UpdatePaymentStatusParams) error {
			updatedStatus = arg.Status
			return nil
		},
	}

	svc := newTestPaymentService(repo, &mockOrderReader{}, writer, rdb)

	params := map[string]string{
		"vnp_TxnRef":       orderID,
		"vnp_ResponseCode": "00",
		"vnp_TransactionNo": "GW-TX-123",
		"vnp_Amount":        vnpayAmountStr,
	}

	if err := svc.HandleVNPayWebhook(context.Background(), params, true); err != nil {
		t.Fatalf("HandleVNPayWebhook returned unexpected error: %v", err)
	}

	if updatedStatus != db.PaymentsStatusCompleted {
		t.Errorf("expected payment status=completed, got %s", updatedStatus)
	}

	writer.mu.Lock()
	delivered := writer.deliveredIDs
	writer.mu.Unlock()
	if len(delivered) == 0 || delivered[0] != orderID {
		t.Errorf("expected MarkOrderDelivered(%q), got %v", orderID, delivered)
	}

	rdb.mu.Lock()
	published := rdb.published
	rdb.mu.Unlock()
	if len(published) == 0 || published[0] != "orders:kds" {
		t.Errorf("expected WS publish to orders:kds, got %v", published)
	}

	_ = amountVND // validated implicitly via amount-mismatch guard passing
}

// TestVNPayWebhook_InvalidSignature verifies that a webhook with signatureValid=false
// is rejected before any DB access — per Spec5 §11 "signature verification FIRST".
func TestVNPayWebhook_InvalidSignature(t *testing.T) {
	dbCalled := false
	repo := &mockPaymentRepo{
		getByOrderIDFn: func(_ context.Context, _ string) (db.Payment, error) {
			dbCalled = true
			return db.Payment{}, nil
		},
	}
	svc := newTestPaymentService(repo, &mockOrderReader{}, &mockOrderWriter{}, &mockPaymentRedis{})

	err := svc.HandleVNPayWebhook(context.Background(), map[string]string{
		"vnp_TxnRef":       "order-uuid-1",
		"vnp_ResponseCode": "00",
	}, false /* signatureValid */)

	var appErr *AppError
	if !errors.As(err, &appErr) || appErr.Code != "INVALID_SIGNATURE" {
		t.Fatalf("expected AppError INVALID_SIGNATURE, got %v", err)
	}
	if dbCalled {
		t.Fatal("DB must not be accessed before signature verification passes")
	}
}

// TestVNPayWebhook_Idempotent verifies that a second webhook call for an already-completed
// payment is a no-op — per Spec5 §11 "idempotency: check payment.status before update".
func TestVNPayWebhook_Idempotent(t *testing.T) {
	updateCalled := false
	repo := &mockPaymentRepo{
		getByOrderIDFn: func(_ context.Context, _ string) (db.Payment, error) {
			pmt := pendingPayment("order-uuid-idem", "100000")
			pmt.Status = db.PaymentsStatusCompleted // already completed
			return pmt, nil
		},
		updatePaymentStatusFn: func(_ context.Context, _ db.UpdatePaymentStatusParams) error {
			updateCalled = true
			return nil
		},
	}
	writer := &mockOrderWriter{}
	svc := newTestPaymentService(repo, &mockOrderReader{}, writer, &mockPaymentRedis{})

	params := map[string]string{
		"vnp_TxnRef":        "order-uuid-idem",
		"vnp_ResponseCode":  "00",
		"vnp_TransactionNo": "GW-TX-999",
		"vnp_Amount":        "10000000",
	}

	if err := svc.HandleVNPayWebhook(context.Background(), params, true); err != nil {
		t.Fatalf("expected nil on duplicate webhook, got %v", err)
	}
	if updateCalled {
		t.Fatal("UpdatePaymentStatus must not be called for already-completed payment")
	}

	writer.mu.Lock()
	delivered := writer.deliveredIDs
	writer.mu.Unlock()
	if len(delivered) > 0 {
		t.Fatal("MarkOrderDelivered must not be called for already-completed payment")
	}
}
