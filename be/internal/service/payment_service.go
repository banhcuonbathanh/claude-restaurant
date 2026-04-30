package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// PaymentService handles payment creation and webhook processing.
type PaymentService struct {
	repo        repository.PaymentRepository
	orderReader OrderReader
	orderWriter OrderWriter
	rdb         *redis.Client
}

// NewPaymentService creates a PaymentService.
func NewPaymentService(
	repo repository.PaymentRepository,
	orderReader OrderReader,
	orderWriter OrderWriter,
	rdb *redis.Client,
) *PaymentService {
	return &PaymentService{
		repo:        repo,
		orderReader: orderReader,
		orderWriter: orderWriter,
		rdb:         rdb,
	}
}

// CreatePaymentInput holds the handler-validated payment creation request.
type CreatePaymentInput struct {
	OrderID string
	Method  string // vnpay | momo | zalopay | cash
}

// CreatePaymentResult is returned to the handler after payment creation.
type CreatePaymentResult struct {
	ID        string
	PayURL    string // redirect URL for online gateways
	QRCodeURL string // for QR-based gateways
}

// CreatePayment validates the order state and persists a new pending payment.
func (s *PaymentService) CreatePayment(ctx context.Context, in CreatePaymentInput) (CreatePaymentResult, error) {
	// Verify order is ready — MUST check before any DB write.
	order, err := s.orderReader.GetOrderForPayment(ctx, in.OrderID)
	if err != nil {
		return CreatePaymentResult{}, err
	}

	// Idempotency: reject if payment already exists for this order.
	if existing, err := s.repo.GetPaymentByOrderID(ctx, in.OrderID); err == nil {
		if existing.Status != db.PaymentsStatusFailed {
			return CreatePaymentResult{}, ErrPaymentAlreadyExists
		}
	}

	method := db.PaymentsMethod(in.Method)
	paymentID := newUUID()

	var expiresAt sql.NullTime
	if method != db.PaymentsMethodCash {
		expiresAt = sql.NullTime{Time: time.Now().Add(15 * time.Minute), Valid: true}
	}

	if err := s.repo.CreatePayment(ctx, db.CreatePaymentParams{
		ID:        paymentID,
		OrderID:   in.OrderID,
		Method:    method,
		Amount:    formatPrice(order.TotalAmount),
		ExpiresAt: expiresAt,
	}); err != nil {
		return CreatePaymentResult{}, fmt.Errorf("payment: create: %w", err)
	}

	result := CreatePaymentResult{ID: paymentID}

	// For cash: immediately mark completed.
	if method == db.PaymentsMethodCash {
		_ = s.completePayment(ctx, paymentID, in.OrderID, "", nil)
	}

	return result, nil
}

// GetPayment returns a payment by ID.
func (s *PaymentService) GetPayment(ctx context.Context, paymentID string) (db.Payment, error) {
	p, err := s.repo.GetPaymentByID(ctx, paymentID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Payment{}, ErrNotFound
		}
		return db.Payment{}, fmt.Errorf("payment: get: %w", err)
	}
	return p, nil
}

// HandleVNPayWebhook processes an incoming VNPay IPN callback.
// CRITICAL: signature verification is the FIRST operation — per spec.
func (s *PaymentService) HandleVNPayWebhook(ctx context.Context, params map[string]string, signatureValid bool) error {
	if !signatureValid {
		return NewAppError(400, "INVALID_SIGNATURE", "Chữ ký VNPay không hợp lệ")
	}

	txnRef := params["vnp_TxnRef"]   // our order_id
	responseCode := params["vnp_ResponseCode"]
	gatewayRef := params["vnp_TransactionNo"]

	rawJSON, _ := json.Marshal(params)
	return s.processWebhookResult(ctx, txnRef, gatewayRef, responseCode == "00", rawPayload(rawJSON))
}

// HandleMoMoWebhook processes an incoming MoMo IPN callback.
func (s *PaymentService) HandleMoMoWebhook(ctx context.Context, payload map[string]any, signatureValid bool) error {
	if !signatureValid {
		return NewAppError(400, "INVALID_SIGNATURE", "Chữ ký MoMo không hợp lệ")
	}

	orderID, _ := payload["orderId"].(string)
	gatewayRef, _ := payload["transId"].(string)
	resultCode, _ := payload["resultCode"].(float64)

	rawJSON, _ := json.Marshal(payload)
	return s.processWebhookResult(ctx, orderID, fmt.Sprintf("%v", gatewayRef), resultCode == 0, rawPayload(rawJSON))
}

// HandleZaloPayWebhook processes an incoming ZaloPay callback.
func (s *PaymentService) HandleZaloPayWebhook(ctx context.Context, payload map[string]any, signatureValid bool) error {
	if !signatureValid {
		return NewAppError(400, "INVALID_SIGNATURE", "Chữ ký ZaloPay không hợp lệ")
	}

	data, _ := payload["data"].(string)
	var dataMap map[string]any
	json.Unmarshal([]byte(data), &dataMap)

	appTransID, _ := dataMap["app_trans_id"].(string)
	zpTransID := fmt.Sprintf("%v", dataMap["zp_trans_id"])
	returnCode, _ := payload["return_code"].(float64)

	rawJSON, _ := json.Marshal(payload)
	return s.processWebhookResult(ctx, appTransID, zpTransID, returnCode == 1, rawPayload(rawJSON))
}

// processWebhookResult is the shared idempotent webhook handler.
// ALWAYS called AFTER signature verification.
func (s *PaymentService) processWebhookResult(ctx context.Context, orderID, gatewayRef string, success bool, raw json.RawMessage) error {
	payment, err := s.repo.GetPaymentByOrderID(ctx, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("payment: get for webhook: %w", err)
	}

	// Idempotency: if already completed, do nothing.
	if payment.Status == db.PaymentsStatusCompleted {
		return nil
	}

	_ = s.repo.IncrementPaymentAttempt(ctx, payment.ID)

	if success {
		return s.completePayment(ctx, payment.ID, orderID, gatewayRef, raw)
	}

	// Payment failed — mark as failed.
	return s.repo.UpdatePaymentStatus(ctx, db.UpdatePaymentStatusParams{
		Status:      db.PaymentsStatusFailed,
		GatewayRef:  sql.NullString{String: gatewayRef, Valid: gatewayRef != ""},
		GatewayData: raw,
		PaidAt:      sql.NullTime{},
		ID:          payment.ID,
	})
}

func (s *PaymentService) completePayment(ctx context.Context, paymentID, orderID, gatewayRef string, raw json.RawMessage) error {
	now := time.Now()
	if err := s.repo.UpdatePaymentStatus(ctx, db.UpdatePaymentStatusParams{
		Status:      db.PaymentsStatusCompleted,
		GatewayRef:  sql.NullString{String: gatewayRef, Valid: gatewayRef != ""},
		GatewayData: raw,
		PaidAt:      sql.NullTime{Time: now, Valid: true},
		ID:          paymentID,
	}); err != nil {
		return fmt.Errorf("payment: update completed: %w", err)
	}

	// Advance order to delivered.
	if err := s.orderWriter.MarkOrderDelivered(ctx, orderID); err != nil {
		slog.WarnContext(ctx, "payment: mark order delivered failed", "order_id", orderID, "err", err)
	}

	// Publish WS event for cashier screen.
	evt, _ := json.Marshal(map[string]string{"type": "payment_success", "order_id": orderID})
	s.rdb.Publish(ctx, "orders:kds", string(evt))

	return nil
}

// rawPayload is a helper alias to make it clear a []byte is treated as json.RawMessage.
func rawPayload(b []byte) json.RawMessage {
	if b == nil {
		return json.RawMessage(`{}`)
	}
	return b
}
