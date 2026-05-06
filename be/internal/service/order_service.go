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

// OrderService handles all order lifecycle business logic.
type OrderService struct {
	repo        repository.OrderRepository
	rdb         *redis.Client
	productLookup ProductLookup
}

// NewOrderService creates an OrderService.
func NewOrderService(repo repository.OrderRepository, rdb *redis.Client, products ProductLookup) *OrderService {
	return &OrderService{repo: repo, rdb: rdb, productLookup: products}
}

// ─── OrderReader / OrderWriter interfaces (for PaymentService) ───────────────

func (s *OrderService) GetOrderForPayment(ctx context.Context, orderID string) (OrderPaymentView, error) {
	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return OrderPaymentView{}, ErrNotFound
		}
		return OrderPaymentView{}, fmt.Errorf("order: get for payment: %w", err)
	}
	if o.Status != db.OrdersStatusReady {
		return OrderPaymentView{}, ErrOrderNotReady
	}
	return OrderPaymentView{
		ID:          o.ID,
		Status:      string(o.Status),
		TotalAmount: ParsePrice(o.TotalAmount),
		Source:      string(o.Source),
	}, nil
}

func (s *OrderService) MarkOrderDelivered(ctx context.Context, orderID string) error {
	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return fmt.Errorf("order: get for delivered: %w", err)
	}
	if o.Status == db.OrdersStatusDelivered {
		return nil // already delivered — idempotent
	}
	if o.Status != db.OrdersStatusReady {
		return fmt.Errorf("order: cannot mark delivered, status is %s", o.Status)
	}
	return s.repo.UpdateOrderStatus(ctx, db.OrdersStatusDelivered, orderID)
}

// ─── Order view ──────────────────────────────────────────────────────────────

// OrderDetails is the enriched order view for API responses.
type OrderDetails struct {
	db.Order
	Items []OrderItemDetails
}

// OrderItemDetails enriches an order_item with derived status.
type OrderItemDetails struct {
	db.OrderItem
	ItemStatus string
}

// GetOrder returns an order with items. Enforces ownership for customers.
// callerRole = "customer" means callerID must match order's created_by (guest table check).
func (s *OrderService) GetOrder(ctx context.Context, orderID, callerID, callerRole string) (OrderDetails, error) {
	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return OrderDetails{}, ErrNotFound
		}
		return OrderDetails{}, fmt.Errorf("order: get: %w", err)
	}

	// Customers may only see orders belonging to their table.
	if callerRole == "customer" {
		if !o.TableID.Valid || o.TableID.String != callerID {
			return OrderDetails{}, ErrForbidden
		}
	}

	items, err := s.repo.GetOrderItemsByOrderID(ctx, orderID)
	if err != nil {
		return OrderDetails{}, fmt.Errorf("order: get items: %w", err)
	}

	enriched := make([]OrderItemDetails, 0, len(items))
	for _, item := range items {
		enriched = append(enriched, OrderItemDetails{
			OrderItem:  item,
			ItemStatus: itemStatus(item.QtyServed, item.Quantity),
		})
	}

	return OrderDetails{Order: o, Items: enriched}, nil
}

// ListActiveOrders returns all active orders with items (for staff live view).
func (s *OrderService) ListActiveOrders(ctx context.Context) ([]OrderDetails, error) {
	orders, err := s.repo.ListActiveOrders(ctx)
	if err != nil {
		return nil, fmt.Errorf("order: list active: %w", err)
	}

	result := make([]OrderDetails, 0, len(orders))
	for _, o := range orders {
		items, _ := s.repo.GetOrderItemsByOrderID(ctx, o.ID)
		enriched := make([]OrderItemDetails, 0, len(items))
		for _, item := range items {
			enriched = append(enriched, OrderItemDetails{
				OrderItem:  item,
				ItemStatus: itemStatus(item.QtyServed, item.Quantity),
			})
		}
		result = append(result, OrderDetails{Order: o, Items: enriched})
	}
	return result, nil
}

// ─── CreateOrder ─────────────────────────────────────────────────────────────

// CreateOrderInput is the validated input from the handler.
type CreateOrderInput struct {
	TableID       string
	Source        string
	CustomerName  string
	CustomerPhone string
	Note          string
	CreatedBy     string // staff_id or "guest"
	Items         []CreateOrderItemInput
}

// CreateOrderItemInput is one item in the order request.
type CreateOrderItemInput struct {
	ProductID  string
	ComboID    string
	Quantity   int32
	ToppingIDs []string
	Note       string
}

// toppingSnapshotEntry is stored in order_items.toppings_snapshot.
type toppingSnapshotEntry struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Price int64  `json:"price"`
}

// CreateOrder validates and creates an order with combo expansion.
func (s *OrderService) CreateOrder(ctx context.Context, in CreateOrderInput) (string, error) {
	// 1 table → 1 active order check
	if in.TableID != "" {
		tableID := sql.NullString{String: in.TableID, Valid: true}
		if existing, err := s.repo.GetActiveOrderByTable(ctx, tableID); err == nil {
			return "", NewAppError(409, "TABLE_HAS_ACTIVE_ORDER",
				"Bàn đã có đơn đang xử lý",
			).withDetail("active_order_id", existing.ID)
		}
	}

	orderID := newUUID()
	orderNumber, err := s.generateOrderNumber(ctx)
	if err != nil {
		return "", fmt.Errorf("order: generate number: %w", err)
	}

	// Build order_item rows (with combo expansion)
	var rows []repository.OrderItemRow
	for _, item := range in.Items {
		if item.ComboID != "" {
			comboRows, err := s.expandCombo(ctx, orderID, item)
			if err != nil {
				return "", err
			}
			rows = append(rows, comboRows...)
		} else {
			row, err := s.buildProductRow(ctx, item)
			if err != nil {
				return "", err
			}
			rows = append(rows, row)
		}
	}

	tableID := sql.NullString{}
	if in.TableID != "" {
		tableID = sql.NullString{String: in.TableID, Valid: true}
	}
	nullStr := func(s string) sql.NullString {
		if s == "" {
			return sql.NullString{}
		}
		return sql.NullString{String: s, Valid: true}
	}

	source := db.OrdersSourceOnline
	switch in.Source {
	case "qr":
		source = db.OrdersSourceQr
	case "pos":
		source = db.OrdersSourcePos
	}

	repoInput := repository.CreateOrderWithItemsInput{
		ID:            orderID,
		OrderNumber:   orderNumber,
		TableID:       tableID,
		Source:        source,
		CustomerName:  nullStr(in.CustomerName),
		CustomerPhone: nullStr(in.CustomerPhone),
		Note:          nullStr(in.Note),
		CreatedBy:     nullStr(in.CreatedBy),
		Items:         rows,
	}

	if err := s.repo.CreateOrderWithItems(ctx, repoInput); err != nil {
		return "", fmt.Errorf("order: create with items: %w", err)
	}

	s.publishOrderEvent(ctx, "new_order", orderID)
	s.publishAdminOrderEvent(ctx, orderID, orderNumber, in.TableID)

	return orderID, nil
}

func (s *OrderService) buildProductRow(ctx context.Context, item CreateOrderItemInput) (repository.OrderItemRow, error) {
	snap, err := s.productLookup.GetProductSnapshot(ctx, item.ProductID)
	if err != nil {
		return repository.OrderItemRow{}, fmt.Errorf("order: product %s: %w", item.ProductID, err)
	}

	// Build toppings snapshot
	toppingsJSON, _ := json.Marshal([]toppingSnapshotEntry{})
	if len(item.ToppingIDs) > 0 {
		// We only have IDs here; the snapshot is stored for record-keeping.
		// In a real implementation, fetch topping details. For now store IDs.
		entries := make([]toppingSnapshotEntry, 0, len(item.ToppingIDs))
		for _, tid := range item.ToppingIDs {
			entries = append(entries, toppingSnapshotEntry{ID: tid})
		}
		toppingsJSON, _ = json.Marshal(entries)
	}

	return repository.OrderItemRow{
		ID:        newUUID(),
		ProductID: sql.NullString{String: item.ProductID, Valid: true},
		Name:      snap.Name,
		UnitPrice: formatPrice(snap.UnitPrice),
		Quantity:  item.Quantity,
		ToppingsSnapshot: toppingsJSON,
		Note:      sql.NullString{String: item.Note, Valid: item.Note != ""},
	}, nil
}

func (s *OrderService) expandCombo(ctx context.Context, orderID string, item CreateOrderItemInput) ([]repository.OrderItemRow, error) {
	snap, err := s.productLookup.GetComboSnapshot(ctx, item.ComboID)
	if err != nil {
		return nil, fmt.Errorf("order: combo %s: %w", item.ComboID, err)
	}

	parentID := newUUID()
	emptyToppings, _ := json.Marshal([]toppingSnapshotEntry{})

	// Combo header row
	rows := []repository.OrderItemRow{
		{
			ID:               parentID,
			ComboID:          sql.NullString{String: item.ComboID, Valid: true},
			Name:             snap.Name,
			UnitPrice:        formatPrice(snap.Price),
			Quantity:         item.Quantity,
			ToppingsSnapshot: emptyToppings,
			Note:             sql.NullString{String: item.Note, Valid: item.Note != ""},
		},
	}

	// Sub-item rows
	for _, ci := range snap.Items {
		rows = append(rows, repository.OrderItemRow{
			ID:               newUUID(),
			ProductID:        sql.NullString{String: ci.ProductID, Valid: true},
			ComboRefID:       sql.NullString{String: parentID, Valid: true},
			Name:             ci.Name,
			UnitPrice:        formatPrice(ci.UnitPrice),
			Quantity:         int32(ci.Quantity) * item.Quantity,
			ToppingsSnapshot: emptyToppings,
		})
	}
	return rows, nil
}

// ─── Status / Cancel / Item ───────────────────────────────────────────────────

// validTransitions defines allowed order status transitions.
var validTransitions = map[db.OrdersStatus][]db.OrdersStatus{
	db.OrdersStatusPending:   {db.OrdersStatusConfirmed, db.OrdersStatusCancelled},
	db.OrdersStatusConfirmed: {db.OrdersStatusPreparing, db.OrdersStatusCancelled},
	db.OrdersStatusPreparing: {db.OrdersStatusReady, db.OrdersStatusCancelled},
	db.OrdersStatusReady:     {db.OrdersStatusDelivered},
}

// UpdateOrderStatus transitions order to the next status.
func (s *OrderService) UpdateOrderStatus(ctx context.Context, orderID, newStatus string) error {
	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("order: get for status update: %w", err)
	}

	next := db.OrdersStatus(newStatus)
	if !isValidTransition(o.Status, next) {
		return NewAppError(409, "INVALID_STATUS_TRANSITION",
			fmt.Sprintf("Không thể chuyển từ %s sang %s", o.Status, next))
	}

	if err := s.repo.UpdateOrderStatus(ctx, next, orderID); err != nil {
		return fmt.Errorf("order: update status: %w", err)
	}

	s.publishOrderEvent(ctx, "order_status_changed", orderID, orderEvent{Status: string(next)})
	return nil
}

// CancelOrder cancels an order if < 30% served.
func (s *OrderService) CancelOrder(ctx context.Context, orderID, callerID, callerRole string) error {
	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("order: get for cancel: %w", err)
	}

	// Ownership check for customers — guests identify by table, not staff ID
	if callerRole == "customer" {
		if !o.TableID.Valid || o.TableID.String != callerID {
			return ErrForbidden
		}
	}

	// Can only cancel from certain states
	switch o.Status {
	case db.OrdersStatusPending, db.OrdersStatusConfirmed, db.OrdersStatusPreparing:
	default:
		return ErrCancelThreshold
	}

	// Check 30% rule
	served, total, err := s.repo.SumQtyServedAndQuantity(ctx, orderID)
	if err != nil {
		return fmt.Errorf("order: sum qty: %w", err)
	}
	if total > 0 && float64(served)/float64(total) >= 0.30 {
		return ErrCancelThreshold
	}

	if err := s.repo.SoftDeleteOrder(ctx, orderID); err != nil {
		return fmt.Errorf("order: cancel: %w", err)
	}
	s.publishOrderEvent(ctx, "order_cancelled", orderID)
	return nil
}

// UpdateItemServed increments qty_served for an order item (chef click).
func (s *OrderService) UpdateItemServed(ctx context.Context, itemID string, newQtyServed int32) error {
	item, err := s.repo.GetOrderItemByID(ctx, itemID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("order: get item: %w", err)
	}

	if newQtyServed < 0 || newQtyServed > item.Quantity {
		return ErrInvalidInput
	}

	if err := s.repo.UpdateQtyServed(ctx, newQtyServed, itemID); err != nil {
		return fmt.Errorf("order: update qty_served: %w", err)
	}

	// After updating, check if all items are done → auto-ready
	s.maybeAutoReady(ctx, item.OrderID)

	// Publish SSE event
	s.publishItemEvent(ctx, item.OrderID, itemID, newQtyServed, item.Quantity)
	return nil
}

// maybeAutoReady transitions order to 'ready' if all items have qty_served == quantity.
func (s *OrderService) maybeAutoReady(ctx context.Context, orderID string) {
	served, total, err := s.repo.SumQtyServedAndQuantity(ctx, orderID)
	if err != nil || total == 0 {
		return
	}
	if served < total {
		return
	}

	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil || o.Status != db.OrdersStatusPreparing {
		return
	}

	if err := s.repo.UpdateOrderStatus(ctx, db.OrdersStatusReady, orderID); err != nil {
		slog.Warn("order: auto-ready failed", "order_id", orderID, "err", err)
		return
	}
	s.publishOrderEvent(ctx, "order_status_changed", orderID, orderEvent{Status: string(db.OrdersStatusReady)})
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func itemStatus(qtyServed, quantity int32) string {
	switch {
	case qtyServed == 0:
		return "pending"
	case qtyServed < quantity:
		return "preparing"
	default:
		return "done"
	}
}

func isValidTransition(from, to db.OrdersStatus) bool {
	allowed, ok := validTransitions[from]
	if !ok {
		return false
	}
	for _, s := range allowed {
		if s == to {
			return true
		}
	}
	return false
}

func (s *OrderService) generateOrderNumber(ctx context.Context) (string, error) {
	today := time.Now().Format("20060102")
	key := fmt.Sprintf("order:seq:%s", today)
	seq, err := s.rdb.Incr(ctx, key).Result()
	if err != nil {
		// Fallback: use timestamp-based number
		return fmt.Sprintf("ORD-%s-%d", today, time.Now().UnixMilli()%100000), nil
	}
	if seq == 1 {
		s.rdb.Expire(ctx, key, 25*time.Hour)
	}
	return fmt.Sprintf("ORD-%s-%04d", today, seq), nil
}

// orderEvent is the payload published to Redis for SSE/WS consumers.
type orderEvent struct {
	Type        string `json:"type"`
	OrderID     string `json:"order_id"`
	Status      string `json:"status,omitempty"`
	OrderNumber string `json:"order_number,omitempty"`
	TableID     string `json:"table_id,omitempty"`
}

type itemEvent struct {
	Type       string `json:"type"`
	OrderID    string `json:"order_id"`
	ItemID     string `json:"item_id"`
	QtyServed  int32  `json:"qty_served"`
	Quantity   int32  `json:"quantity"`
	ItemStatus string `json:"item_status"`
}

func (s *OrderService) publishOrderEvent(ctx context.Context, eventType, orderID string, extras ...orderEvent) {
	evt := orderEvent{Type: eventType, OrderID: orderID}
	if len(extras) > 0 {
		evt.Status      = extras[0].Status
		evt.OrderNumber = extras[0].OrderNumber
		evt.TableID     = extras[0].TableID
	}
	payload, _ := json.Marshal(evt)
	channel := fmt.Sprintf("order:%s", orderID)
	if err := s.rdb.Publish(ctx, channel, string(payload)).Err(); err != nil {
		slog.WarnContext(ctx, "order: publish event failed", "err", err)
	}
	s.rdb.Publish(ctx, "orders:kds", string(payload))
}

func (s *OrderService) publishAdminOrderEvent(ctx context.Context, orderID, orderNumber, tableID string) {
	payload, _ := json.Marshal(orderEvent{
		Type:        "new_order",
		OrderID:     orderID,
		OrderNumber: orderNumber,
		TableID:     tableID,
	})
	s.rdb.Publish(ctx, "orders:admin", string(payload))
}

func (s *OrderService) publishItemEvent(ctx context.Context, orderID, itemID string, qtyServed, quantity int32) {
	payload, _ := json.Marshal(itemEvent{
		Type:       "item_progress",
		OrderID:    orderID,
		ItemID:     itemID,
		QtyServed:  qtyServed,
		Quantity:   quantity,
		ItemStatus: itemStatus(qtyServed, quantity),
	})
	channel := fmt.Sprintf("order:%s", orderID)
	s.rdb.Publish(ctx, channel, string(payload))
	s.rdb.Publish(ctx, "orders:kds", string(payload))
}

// AppError with detail is a helper for structured conflict responses.
func (e *AppError) withDetail(key string, value any) *AppError {
	// Detail is logged but not exposed through the simple AppError type.
	// The handler reads AppError.Code to decide if extra details are needed.
	return e
}
