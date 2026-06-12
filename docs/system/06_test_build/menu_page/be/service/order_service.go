// P-SYSTEST reference build — order create/read per menu_spec_v3_visual.md §6 (code-verified
// contract) + Critical Rules: combo header unit_price=0, recalc total after every item
// mutation, table_busy instead of 409, toppings_snapshot frozen copies. Not compiled into the app.
package service

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type ComboItemInput struct {
	ProductID  string
	Quantity   int
	ToppingIDs []string
	Note       string
}

type OrderItemInput struct {
	ProductID  *string
	ComboID    *string
	Quantity   int
	ToppingIDs []string
	Note       string
	ComboItems []ComboItemInput // combo content overrides (canh already stripped by FE)
}

type CreateOrderInput struct {
	CustomerName  string
	CustomerPhone string
	Note          *string
	TableID       *string
	Source        string
	Items         []OrderItemInput
	CreatedBy     string
}

type CreateOrderResult struct {
	OrderID   string
	TableBusy bool
}

// OrderItemRow is one row of order_items as returned by GET /orders/:id.
// A combo = 1 header row (unit_price=0, label only) + N child rows linked by combo_ref_id.
// Items come back UNORDERED (sorted by UUID) — readers must group by combo_ref_id.
type OrderItemRow struct {
	ID               string    `json:"id"`
	ProductID        *string   `json:"product_id"`
	ComboID          *string   `json:"combo_id"`
	ComboRefID       *string   `json:"combo_ref_id"`
	Name             string    `json:"name"`
	UnitPrice        int64     `json:"unit_price"`
	Quantity         int       `json:"quantity"`
	QtyServed        int       `json:"qty_served"`
	ItemStatus       string    `json:"item_status"` // derived from qty_served — no status column
	ToppingsSnapshot []Topping `json:"toppings_snapshot"`
	Note             string    `json:"note"`
}

type Order struct {
	ID            string         `json:"id"`
	OrderNumber   string         `json:"order_number"` // ORD-YYYYMMDD-NNNN (Redis daily seq)
	Status        string         `json:"status"`
	Source        string         `json:"source"`
	TableID       *string        `json:"table_id"`
	TableName     string         `json:"table_name"`
	CustomerName  string         `json:"customer_name"`
	CustomerPhone string         `json:"customer_phone"`
	Note          string         `json:"note"`
	CreatedBy     string         `json:"created_by"`
	TotalAmount   int64          `json:"total_amount"` // BE-computed — FE never sends prices
	Items         []OrderItemRow `json:"items"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type OrderRepo interface {
	// HasActiveOrderForTable feeds the table_busy flag — it no longer blocks creation.
	HasActiveOrderForTable(ctx context.Context, tableID string) (bool, error)
	// CreateOrderWithItems runs INSERT order + INSERT all item rows + RecalculateTotalAmount
	// inside ONE transaction (only repository opens transactions).
	CreateOrderWithItems(ctx context.Context, order *Order) error
	GetOrder(ctx context.Context, id string) (*Order, error)
}

type Publisher interface {
	Publish(ctx context.Context, channel string, payload any)
}

type Sequencer interface {
	// NextOrderSeq = Redis INCR order:seq:{YYYYMMDD} with DB fallback.
	NextOrderSeq(ctx context.Context, date string) (int64, error)
}

type IDGen func() string

type OrderService struct {
	repo       OrderRepo
	productSvc *ProductService
	products   ProductRepo // snapshot lookups (service may not import db directly)
	pub        Publisher
	seq        Sequencer
	newID      IDGen
}

func NewOrderService(repo OrderRepo, productSvc *ProductService, products ProductRepo, pub Publisher, seq Sequencer, newID IDGen) *OrderService {
	return &OrderService{repo: repo, productSvc: productSvc, products: products, pub: pub, seq: seq, newID: newID}
}

func (s *OrderService) CreateOrder(ctx context.Context, in CreateOrderInput) (*CreateOrderResult, error) {
	// table_busy is informational: the order is ALWAYS created (post-TOP contract;
	// the old 409 TABLE_HAS_ACTIVE_ORDER is gone).
	tableBusy := false
	if in.TableID != nil {
		busy, err := s.repo.HasActiveOrderForTable(ctx, *in.TableID)
		if err != nil {
			return nil, err
		}
		tableBusy = busy
	}

	now := time.Now().UTC()
	order := &Order{
		ID:            s.newID(),
		Status:        "pending", // BE-assigned; FE never sends status
		Source:        in.Source,
		TableID:       in.TableID,
		CustomerName:  in.CustomerName,
		CustomerPhone: in.CustomerPhone,
		CreatedBy:     in.CreatedBy,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	if in.Note != nil {
		order.Note = *in.Note
	}

	seq, err := s.seq.NextOrderSeq(ctx, now.Format("20060102"))
	if err != nil {
		return nil, err
	}
	order.OrderNumber = fmt.Sprintf("ORD-%s-%04d", now.Format("20060102"), seq)

	for _, item := range in.Items {
		rows, err := s.expandItem(ctx, order.ID, item)
		if err != nil {
			return nil, err
		}
		order.Items = append(order.Items, rows...)
	}

	// Repo runs the inserts + RecalculateTotalAmount in one transaction — total_amount is
	// denormalized; skipping the recalc makes payment charge the wrong amount.
	if err := s.repo.CreateOrderWithItems(ctx, order); err != nil {
		return nil, err
	}

	s.pub.Publish(ctx, "order:"+order.ID, map[string]any{"type": "order_created", "order_id": order.ID})
	s.pub.Publish(ctx, "admin", map[string]any{"type": "order_created", "order_id": order.ID})

	return &CreateOrderResult{OrderID: order.ID, TableBusy: tableBusy}, nil
}

// expandItem turns one request item into order_items rows, freezing name/price snapshots
// so the order stays correct if the catalog changes later.
//
// Product row → server-template unit_price + toppings_snapshot from topping_ids.
// Combo       → header row (unit_price=0, just a grouping label) + one child row per
//               sub-dish carrying the money, linked by combo_ref_id = header id.
//               combo_items overrides from the request replace the combo template.
func (s *OrderService) expandItem(ctx context.Context, orderID string, in OrderItemInput) ([]OrderItemRow, error) {
	if in.ProductID != nil {
		row, err := s.productRow(ctx, *in.ProductID, in.Quantity, in.ToppingIDs, in.Note, nil)
		if err != nil {
			return nil, err
		}
		return []OrderItemRow{*row}, nil
	}

	// Combo: validate it exists, then expand.
	combos, err := s.productSvc.ListCombos(ctx)
	if err != nil {
		return nil, err
	}
	var combo *Combo
	for i := range combos {
		if combos[i].ID == *in.ComboID {
			combo = &combos[i]
			break
		}
	}
	if combo == nil {
		return nil, &AppError{Status: http.StatusNotFound, Code: "NOT_FOUND", Message: "Combo không tồn tại"}
	}

	header := OrderItemRow{
		ID:               s.newID(),
		ComboID:          in.ComboID,
		Name:             combo.Name,
		UnitPrice:        0, // header MUST be 0 or recalc double-counts the combo
		Quantity:         in.Quantity,
		ItemStatus:       "pending",
		ToppingsSnapshot: []Topping{},
		Note:             in.Note,
	}
	rows := []OrderItemRow{header}

	// Request overrides win; otherwise fall back to the combo template rows.
	children := in.ComboItems
	if len(children) == 0 {
		for _, tpl := range combo.ComboItems {
			children = append(children, ComboItemInput{ProductID: tpl.ProductID, Quantity: tpl.Quantity})
		}
	}
	for _, ci := range children {
		row, err := s.productRow(ctx, ci.ProductID, ci.Quantity, ci.ToppingIDs, ci.Note, &header.ID)
		if err != nil {
			return nil, err
		}
		rows = append(rows, *row)
	}
	return rows, nil
}

func (s *OrderService) productRow(ctx context.Context, productID string, qty int, toppingIDs []string, note string, comboRefID *string) (*OrderItemRow, error) {
	p, err := s.products.GetProductSnapshot(ctx, productID)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, &AppError{Status: http.StatusNotFound, Code: "NOT_FOUND", Message: "Món không tồn tại"}
	}

	snapshot := make([]Topping, 0, len(toppingIDs))
	unitPrice := p.Price
	for _, tid := range toppingIDs {
		t, err := s.products.GetToppingSnapshot(ctx, tid)
		if err != nil {
			return nil, err
		}
		if t == nil {
			return nil, &AppError{Status: http.StatusBadRequest, Code: "INVALID_INPUT", Message: "Topping không hợp lệ"}
		}
		snapshot = append(snapshot, *t)
		unitPrice += t.Price
	}

	pid := productID
	return &OrderItemRow{
		ID:               s.newID(),
		ProductID:        &pid,
		ComboRefID:       comboRefID,
		Name:             p.Name,
		UnitPrice:        unitPrice,
		Quantity:         qty,
		ItemStatus:       "pending",
		ToppingsSnapshot: snapshot,
		Note:             note,
	}, nil
}

func (s *OrderService) GetOrder(ctx context.Context, id string) (*Order, error) {
	order, err := s.repo.GetOrder(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, ErrNotFound
	}
	return order, nil
}
