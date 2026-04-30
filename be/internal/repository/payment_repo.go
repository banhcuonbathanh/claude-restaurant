package repository

import (
	"context"

	"banhcuon/be/internal/db"
)

// PaymentRepository wraps all sqlc payment queries.
type PaymentRepository interface {
	CreatePayment(ctx context.Context, arg db.CreatePaymentParams) error
	GetPaymentByID(ctx context.Context, id string) (db.Payment, error)
	GetPaymentByOrderID(ctx context.Context, orderID string) (db.Payment, error)
	UpdatePaymentStatus(ctx context.Context, arg db.UpdatePaymentStatusParams) error
	IncrementPaymentAttempt(ctx context.Context, id string) error
	SoftDeletePayment(ctx context.Context, id string) error
}

type paymentRepo struct {
	q *db.Queries
}

// NewPaymentRepo creates a PaymentRepository.
func NewPaymentRepo(dbtx db.DBTX) PaymentRepository {
	return &paymentRepo{q: db.New(dbtx)}
}

func (r *paymentRepo) CreatePayment(ctx context.Context, arg db.CreatePaymentParams) error {
	return r.q.CreatePayment(ctx, arg)
}

func (r *paymentRepo) GetPaymentByID(ctx context.Context, id string) (db.Payment, error) {
	return r.q.GetPaymentByID(ctx, id)
}

func (r *paymentRepo) GetPaymentByOrderID(ctx context.Context, orderID string) (db.Payment, error) {
	return r.q.GetPaymentByOrderID(ctx, orderID)
}

func (r *paymentRepo) UpdatePaymentStatus(ctx context.Context, arg db.UpdatePaymentStatusParams) error {
	return r.q.UpdatePaymentStatus(ctx, arg)
}

func (r *paymentRepo) IncrementPaymentAttempt(ctx context.Context, id string) error {
	return r.q.IncrementPaymentAttempt(ctx, id)
}

func (r *paymentRepo) SoftDeletePayment(ctx context.Context, id string) error {
	return r.q.SoftDeletePayment(ctx, id)
}

var _ PaymentRepository = (*paymentRepo)(nil)
