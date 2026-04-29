package service

import "context"

// ─── Cross-domain interfaces ────────────────────────────────────────────────
//
// Each interface is defined by its *consumer* (the service that needs it),
// not its provider. This follows the Dependency Inversion Principle and keeps
// interfaces small — only the methods the consumer actually calls.
//
// Wiring in main.go:
//   productSvc := NewProductService(productRepo)
//   orderSvc   := NewOrderService(orderRepo, rdb, productSvc)   // productSvc → ProductLookup
//   paymentSvc := NewPaymentService(paymentRepo, orderSvc, orderSvc) // orderSvc → OrderReader + OrderWriter

// ─── OrderService depends on ─────────────────────────────────────────────────

// ProductLookup is called by OrderService at order-creation time to build
// name+price snapshots stored in order_items.
type ProductLookup interface {
	// GetProductSnapshot returns a pricing snapshot for a single product.
	// Returns ErrNotFound if the product does not exist or is unavailable.
	GetProductSnapshot(ctx context.Context, productID string) (ProductSnapshot, error)

	// GetComboSnapshot returns the combo header and its static item template.
	// Returns ErrNotFound if the combo does not exist or is unavailable.
	GetComboSnapshot(ctx context.Context, comboID string) (ComboSnapshot, error)
}

// ─── PaymentService depends on ───────────────────────────────────────────────

// OrderReader is called by PaymentService before charging to verify the order
// is in the correct state and to read the authoritative total_amount.
type OrderReader interface {
	// GetOrderForPayment returns the minimal order view needed to create a payment.
	// Returns ErrNotFound if the order does not exist.
	// Returns ErrOrderNotReady if order.status != 'ready'.
	GetOrderForPayment(ctx context.Context, orderID string) (OrderPaymentView, error)
}

// OrderWriter is called by PaymentService after a payment is confirmed to
// advance the order to 'delivered'.
type OrderWriter interface {
	// MarkOrderDelivered transitions order.status from 'ready' → 'delivered'.
	// No-op (returns nil) if already delivered; returns error for any other status.
	MarkOrderDelivered(ctx context.Context, orderID string) error
}

// ─── Shared value types ──────────────────────────────────────────────────────

// ProductSnapshot is captured at order time; stored as order_items.name and
// order_items.unit_price. Do NOT use live product data after the order is placed.
type ProductSnapshot struct {
	ID        string
	Name      string
	UnitPrice int64 // VND — DECIMAL(10,0) maps to int64
}

// ComboItemTemplate is one row of the static combo template from combo_items.
type ComboItemTemplate struct {
	ProductID string
	Name      string
	UnitPrice int64
	Quantity  int
}

// ComboSnapshot is captured at order time. OrderService expands this into:
//   - 1 combo header row  (product_id=NULL, combo_id=<id>, combo_ref_id=NULL)
//   - N sub-item rows     (product_id=<id>, combo_id=NULL, combo_ref_id=<header.id>)
type ComboSnapshot struct {
	ID    string
	Name  string
	Price int64 // combo-level price shown on the receipt header line
	Items []ComboItemTemplate
}

// OrderPaymentView carries the fields PaymentService needs from an order.
// Intentionally minimal — do not add fields "just in case".
type OrderPaymentView struct {
	ID          string
	Status      string // ENUM: pending|confirmed|preparing|ready|delivered|cancelled
	TotalAmount int64  // VND — must equal SUM of order_items at charge time
	Source      string // ENUM: online|qr|pos — used to pick gateway defaults
}
