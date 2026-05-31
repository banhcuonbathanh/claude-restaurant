package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// orderRedisClient covers the subset of *redis.Client methods used by OrderService.
// Defined here so tests can inject a stub without a real Redis server.
type orderRedisClient interface {
	Incr(ctx context.Context, key string) *redis.IntCmd
	Expire(ctx context.Context, key string, expiration time.Duration) *redis.BoolCmd
	Publish(ctx context.Context, channel string, message interface{}) *redis.IntCmd
}

// OrderService handles all order lifecycle business logic.
type OrderService struct {
	repo          repository.OrderRepository
	tableRepo     repository.TableRepository
	rdb           orderRedisClient
	productLookup ProductLookup
}

// NewOrderService creates an OrderService.
func NewOrderService(repo repository.OrderRepository, tableRepo repository.TableRepository, rdb orderRedisClient, products ProductLookup) *OrderService {
	return &OrderService{repo: repo, tableRepo: tableRepo, rdb: rdb, productLookup: products}
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
	TableName string             `json:"table_name"`
	Items     []OrderItemDetails
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

	var tableName string
	if o.TableID.Valid {
		if t, err := s.tableRepo.GetTableByID(ctx, o.TableID.String); err == nil {
			tableName = t.Name
		}
	}

	return OrderDetails{Order: o, TableName: tableName, Items: enriched}, nil
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
		var tableName string
		if o.TableID.Valid {
			if t, err := s.tableRepo.GetTableByID(ctx, o.TableID.String); err == nil {
				tableName = t.Name
			}
		}
		result = append(result, OrderDetails{Order: o, TableName: tableName, Items: enriched})
	}
	return result, nil
}

// SearchActiveOrders filters active orders by q (order_number, id, customer_name, table_name).
// Empty q returns all active orders.
func (s *OrderService) SearchActiveOrders(ctx context.Context, q string) ([]OrderDetails, error) {
	all, err := s.ListActiveOrders(ctx)
	if err != nil {
		return nil, err
	}
	if q == "" {
		return all, nil
	}
	q = strings.ToLower(q)
	var out []OrderDetails
	for _, o := range all {
		if strings.Contains(strings.ToLower(o.OrderNumber), q) ||
			strings.Contains(strings.ToLower(o.ID), q) ||
			(o.CustomerName.Valid && strings.Contains(strings.ToLower(o.CustomerName.String), q)) ||
			strings.Contains(strings.ToLower(o.TableName), q) {
			out = append(out, o)
		}
	}
	return out, nil
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

	for attempt := 0; attempt < 3; attempt++ {
		repoInput.OrderNumber = orderNumber
		err := s.repo.CreateOrderWithItems(ctx, repoInput)
		if err == nil {
			break
		}
		if attempt < 2 && strings.Contains(err.Error(), "uq_orders_order_number") {
			orderNumber, err = s.generateOrderNumber(ctx)
			if err != nil {
				return "", fmt.Errorf("order: generate number retry: %w", err)
			}
			continue
		}
		return "", fmt.Errorf("order: create with items: %w", err)
	}

	s.publishOrderEvent(ctx, "new_order", orderID)
	s.publishAdminOrderEvent(ctx, orderID, orderNumber, in.TableID)
	go s.publishMonitorBroadcast(context.Background())

	return orderID, nil
}

func (s *OrderService) buildProductRow(ctx context.Context, item CreateOrderItemInput) (repository.OrderItemRow, error) {
	snap, err := s.productLookup.GetProductSnapshot(ctx, item.ProductID)
	if err != nil {
		return repository.OrderItemRow{}, fmt.Errorf("order: product %s: %w", item.ProductID, err)
	}

	// Build toppings snapshot with name+price for display on the order page.
	toppingsJSON, _ := json.Marshal([]toppingSnapshotEntry{})
	if len(item.ToppingIDs) > 0 {
		entries := make([]toppingSnapshotEntry, 0, len(item.ToppingIDs))
		for _, tid := range item.ToppingIDs {
			snap, err := s.productLookup.GetToppingSnapshot(ctx, tid)
			if err != nil {
				continue // skip unknown/unavailable toppings gracefully
			}
			entries = append(entries, toppingSnapshotEntry{ID: snap.ID, Name: snap.Name, Price: snap.Price})
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

// ─── AddItemsToOrder ─────────────────────────────────────────────────────────

// AddItemsToOrderResult carries the service response for P11-4 handler use.
type AddItemsToOrderResult struct {
	AddedCount     int
	NewTotalAmount string
}

// AddItemsToOrder appends new items to an existing active order (Spec4 §5.2).
func (s *OrderService) AddItemsToOrder(ctx context.Context, orderID, callerID, callerRole string, items []CreateOrderItemInput) (AddItemsToOrderResult, error) {
	// 1. Fetch order
	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return AddItemsToOrderResult{}, ErrNotFound
		}
		return AddItemsToOrderResult{}, fmt.Errorf("addItems: get order: %w", err)
	}

	// 2. Ownership check — customers identify by table_id, not staff id
	if callerRole == "customer" {
		if !o.TableID.Valid || o.TableID.String != callerID {
			return AddItemsToOrderResult{}, ErrForbidden
		}
	}

	// 3. Status guard — only editable before kitchen finishes
	switch o.Status {
	case db.OrdersStatusPending, db.OrdersStatusConfirmed, db.OrdersStatusPreparing:
		// allowed
	default:
		return AddItemsToOrderResult{}, NewAppError(409, "ORDER_NOT_EDITABLE", "Đơn hàng không thể thêm món ở trạng thái hiện tại")
	}

	// 4. Build item rows (with combo expansion)
	var rows []repository.OrderItemRow
	for _, item := range items {
		if item.ComboID != "" {
			comboRows, err := s.expandCombo(ctx, orderID, item)
			if err != nil {
				return AddItemsToOrderResult{}, err
			}
			rows = append(rows, comboRows...)
		} else {
			row, err := s.buildProductRow(ctx, item)
			if err != nil {
				return AddItemsToOrderResult{}, err
			}
			rows = append(rows, row)
		}
	}

	// 5+6. Insert items + recalculate total atomically
	newTotal, err := s.repo.AppendOrderItems(ctx, orderID, rows)
	if err != nil {
		return AddItemsToOrderResult{}, fmt.Errorf("addItems: append: %w", err)
	}

	// 7. Publish events to SSE + KDS WS channels
	s.publishOrderEvent(ctx, "items_added", orderID)

	return AddItemsToOrderResult{AddedCount: len(items), NewTotalAmount: newTotal}, nil
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
	go s.publishMonitorBroadcast(context.Background())
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

// CancelOrderItem deletes a single order item if the order is still active and the item is not yet served.
func (s *OrderService) CancelOrderItem(ctx context.Context, itemID, callerID, callerRole string) error {
	item, err := s.repo.GetOrderItemByID(ctx, itemID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("order: get item for cancel: %w", err)
	}

	order, err := s.repo.GetOrderByID(ctx, item.OrderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("order: get order for item cancel: %w", err)
	}

	// Ownership check — guests identify by table_id
	if callerRole == "customer" {
		if !order.TableID.Valid || order.TableID.String != callerID {
			return ErrForbidden
		}
	}

	// Only cancel from active states
	switch order.Status {
	case db.OrdersStatusPending, db.OrdersStatusConfirmed, db.OrdersStatusPreparing:
	default:
		return ErrCancelThreshold
	}

	// Cannot cancel an already-served item
	if item.QtyServed >= item.Quantity {
		return ErrCancelThreshold
	}

	if err := s.repo.DeleteOrderItem(ctx, itemID); err != nil {
		return fmt.Errorf("order: delete item: %w", err)
	}

	if err := s.repo.RecalculateTotalAmount(ctx, item.OrderID); err != nil {
		return fmt.Errorf("order: recalculate after item cancel: %w", err)
	}

	s.publishOrderEvent(ctx, "item_cancelled", item.OrderID)
	return nil
}

// UpdateOrderItemQuantity changes the ordered quantity for an item that has not yet been served.
// Callers: guest customer (owns the table) or cashier+.
func (s *OrderService) UpdateOrderItemQuantity(ctx context.Context, itemID, callerID, callerRole string, qty int32) error {
	if qty < 1 {
		return ErrInvalidInput
	}

	item, err := s.repo.GetOrderItemByID(ctx, itemID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("order: get item for qty update: %w", err)
	}

	order, err := s.repo.GetOrderByID(ctx, item.OrderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("order: get order for qty update: %w", err)
	}

	// Ownership check — guests identify by table_id
	if callerRole == "customer" {
		if !order.TableID.Valid || order.TableID.String != callerID {
			return ErrForbidden
		}
	}

	// Only allowed on active orders
	switch order.Status {
	case db.OrdersStatusPending, db.OrdersStatusConfirmed, db.OrdersStatusPreparing:
	default:
		return ErrCancelThreshold
	}

	// Cannot change quantity after the item has started being served
	if item.QtyServed > 0 {
		return ErrCancelThreshold
	}

	if err := s.repo.UpdateItemQuantity(ctx, qty, itemID); err != nil {
		return fmt.Errorf("order: update item quantity: %w", err)
	}

	if err := s.repo.RecalculateTotalAmount(ctx, item.OrderID); err != nil {
		return fmt.Errorf("order: recalculate after qty update: %w", err)
	}

	s.publishOrderEvent(ctx, "item_updated", item.OrderID)
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

// publishMonitorBroadcast publishes queue and table status snapshots to the two
// broadcast channels consumed by StreamOrderMonitor. Runs in a goroutine so it
// never blocks the status-update call path.
func (s *OrderService) publishMonitorBroadcast(ctx context.Context) {
	orders, err := s.repo.ListActiveOrders(ctx)
	if err != nil {
		slog.WarnContext(ctx, "monitor: list active orders failed", "err", err)
		return
	}

	// Fetch tables first so we can resolve table names for the queue broadcast.
	tables, err := s.tableRepo.ListTables(ctx)
	if err != nil {
		slog.WarnContext(ctx, "monitor: list tables failed", "err", err)
		return
	}
	tableNames := make(map[string]string, len(tables))
	for _, t := range tables {
		tableNames[t.ID] = t.Name
	}

	// Single batch query — no N+1.
	itemCounts, err := s.repo.CountActiveOrderItems(ctx)
	if err != nil {
		slog.WarnContext(ctx, "monitor: count items failed", "err", err)
		itemCounts = map[string]int{}
	}

	// ── Queue broadcast ───────────────────────────────────────────────────────
	type queueItem struct {
		Type       string `json:"type"`
		OrderID    string `json:"orderId"`
		TableLabel string `json:"tableLabel"`
		Status     string `json:"status"`
		ItemCount  int    `json:"itemCount"`
	}
	type queuePayload struct {
		Type             string      `json:"type"`
		Queue            []queueItem `json:"queue"`
		Position         int         `json:"position"`
		Total            int         `json:"total"`
		EstimatedMinutes int         `json:"estimatedMinutes"`
	}

	queueItems := make([]queueItem, 0, len(orders))
	for _, o := range orders {
		label := ""
		if o.TableID.Valid {
			if name, ok := tableNames[o.TableID.String]; ok {
				label = name
			} else {
				label = o.TableID.String
			}
		}
		queueItems = append(queueItems, queueItem{
			OrderID:    o.ID,
			TableLabel: label,
			Status:     string(o.Status),
			ItemCount:  itemCounts[o.ID],
		})
	}

	qp, _ := json.Marshal(queuePayload{
		Type:  "queue.update",
		Queue: queueItems,
		Total: len(queueItems),
	})
	s.rdb.Publish(ctx, "queue:broadcast", string(qp))

	// Map table_id → order status (to derive serving/waiting/empty)
	tableStatus := make(map[string]string, len(orders))
	for _, o := range orders {
		if !o.TableID.Valid {
			continue
		}
		existing := tableStatus[o.TableID.String]
		// ready > preparing > confirmed > pending (priority for display)
		if existing == "" || o.Status == "ready" ||
			(o.Status == "preparing" && existing == "confirmed") ||
			(o.Status == "preparing" && existing == "pending") {
			tableStatus[o.TableID.String] = string(o.Status)
		}
	}

	type tableItem struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	}
	type tablesPayload struct {
		Type   string      `json:"type"`
		Tables []tableItem `json:"tables"`
	}

	tableItems := make([]tableItem, 0, len(tables))
	for _, t := range tables {
		status := "empty"
		if s, ok := tableStatus[t.ID]; ok {
			switch s {
			case "ready", "delivered":
				status = "serving"
			case "pending", "confirmed", "preparing":
				status = "waiting"
			}
		}
		tableItems = append(tableItems, tableItem{ID: t.Name, Status: status})
	}

	tp, _ := json.Marshal(tablesPayload{Type: "tables.status", Tables: tableItems})
	s.rdb.Publish(ctx, "tables:broadcast", string(tp))
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

// withDetail attaches a key-value pair to the error's Details map.
func (e *AppError) withDetail(key string, value any) *AppError {
	if e.Details == nil {
		e.Details = make(map[string]any)
	}
	e.Details[key] = value
	return e
}
