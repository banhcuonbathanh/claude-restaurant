package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
)

// OrderHandler handles all /orders/* endpoints.
type OrderHandler struct {
	svc *service.OrderService
}

// NewOrderHandler creates an OrderHandler.
func NewOrderHandler(svc *service.OrderService) *OrderHandler {
	return &OrderHandler{svc: svc}
}

// comboItemOverrideReq lets the client customize a combo's contents (quantity,
// per-dish note like "Có rau"/"Không rau", and filling). When present on a combo
// line, these replace the canonical combo template. product_id must belong to the
// combo — arbitrary products are rejected.
type comboItemOverrideReq struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int32  `json:"quantity" binding:"required,min=1"`
	Note      string `json:"note"`
	Filling   string `json:"filling"`
}

type createOrderItemReq struct {
	ProductID  string                 `json:"product_id"`
	ComboID    string                 `json:"combo_id"`
	Quantity   int32                  `json:"quantity" binding:"required,min=1"`
	ToppingIDs []string               `json:"topping_ids"`
	Note       string                 `json:"note"`
	Filling    string                 `json:"filling"`     // standalone product filling: ""|thit|moc_nhi
	ComboItems []comboItemOverrideReq `json:"combo_items"` // optional combo content overrides
}

// validFilling reports whether a filling value is allowed (empty = none).
func validFilling(s string) bool {
	return s == "" || s == "thit" || s == "moc_nhi"
}

// toComboOverrides maps request overrides to service inputs.
func toComboOverrides(in []comboItemOverrideReq) []service.ComboItemOverrideInput {
	if len(in) == 0 {
		return nil
	}
	out := make([]service.ComboItemOverrideInput, 0, len(in))
	for _, ci := range in {
		out = append(out, service.ComboItemOverrideInput{
			ProductID: ci.ProductID,
			Quantity:  ci.Quantity,
			Note:      ci.Note,
			Filling:   ci.Filling,
		})
	}
	return out
}

type createOrderReq struct {
	TableID       string               `json:"table_id"`
	Source        string               `json:"source" binding:"required,oneof=online qr pos"`
	CustomerName  string               `json:"customer_name"`
	CustomerPhone string               `json:"customer_phone"`
	Note          string               `json:"note"`
	Items         []createOrderItemReq `json:"items" binding:"required,min=1"`
}

// Create handles POST /orders
func (h *OrderHandler) Create(c *gin.Context) {
	var req createOrderReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}

	// Each item must have exactly one of product_id or combo_id
	for _, item := range req.Items {
		if item.ProductID == "" && item.ComboID == "" {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Mỗi món phải có product_id hoặc combo_id")
			return
		}
		if item.ProductID != "" && item.ComboID != "" {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Không thể có cả product_id và combo_id")
			return
		}
		if !validFilling(item.Filling) {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Nhân không hợp lệ")
			return
		}
		for _, ci := range item.ComboItems {
			if !validFilling(ci.Filling) {
				respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Nhân không hợp lệ")
				return
			}
		}
	}

	claims := middleware.ClaimsFromContext(c)
	callerID := claims.Subject
	if claims.Role == "customer" {
		callerID = "" // guests have no staff ID — store NULL in created_by
	}

	items := make([]service.CreateOrderItemInput, 0, len(req.Items))
	for _, it := range req.Items {
		items = append(items, service.CreateOrderItemInput{
			ProductID:  it.ProductID,
			ComboID:    it.ComboID,
			Quantity:   it.Quantity,
			ToppingIDs: it.ToppingIDs,
			Note:       it.Note,
			Filling:    it.Filling,
			ComboItems: toComboOverrides(it.ComboItems),
		})
	}

	orderID, err := h.svc.CreateOrder(c.Request.Context(), service.CreateOrderInput{
		TableID:       req.TableID,
		Source:        req.Source,
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
		Note:          req.Note,
		CreatedBy:     callerID,
		Items:         items,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": orderID}})
}

// Get handles GET /orders/:id
func (h *OrderHandler) Get(c *gin.Context) {
	claims := middleware.ClaimsFromContext(c)
	callerID := claims.Subject
	if claims.Role == "customer" {
		callerID = claims.TableID // guest ownership is by table, not staff ID
	}
	o, err := h.svc.GetOrder(c.Request.Context(), c.Param("id"), callerID, claims.Role)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orderJSON(o)})
}

// ListLive handles GET /orders/live?q= (Staff+)
func (h *OrderHandler) ListLive(c *gin.Context) {
	orders, err := h.svc.SearchActiveOrders(c.Request.Context(), c.Query("q"))
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(orders))
	for _, o := range orders {
		data = append(data, orderJSON(o))
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// ListHistory handles GET /orders/history (Cashier+) — today's cancelled + paid orders.
func (h *OrderHandler) ListHistory(c *gin.Context) {
	orders, err := h.svc.ListTodayHistory(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(orders))
	for _, o := range orders {
		data = append(data, orderJSON(o))
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

type updateStatusReq struct {
	Status string `json:"status" binding:"required"`
}

// UpdateStatus handles PATCH /orders/:id/status (Chef+)
func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	var req updateStatusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	if err := h.svc.UpdateOrderStatus(c.Request.Context(), c.Param("id"), req.Status); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật trạng thái thành công"})
}

// Cancel handles DELETE /orders/:id
func (h *OrderHandler) Cancel(c *gin.Context) {
	claims := middleware.ClaimsFromContext(c)
	callerID := claims.Subject
	if claims.Role == "customer" {
		callerID = claims.TableID // guest ownership is by table, not staff ID
	}
	if err := h.svc.CancelOrder(c.Request.Context(), c.Param("id"), callerID, claims.Role); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// CancelItem handles DELETE /orders/items/:id (auth — guest or staff)
func (h *OrderHandler) CancelItem(c *gin.Context) {
	claims := middleware.ClaimsFromContext(c)
	callerID := claims.Subject
	if claims.Role == "customer" {
		callerID = claims.TableID
	}
	if err := h.svc.CancelOrderItem(c.Request.Context(), c.Param("id"), callerID, claims.Role); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

type updateItemQuantityReq struct {
	Quantity int32 `json:"quantity" binding:"required,min=1"`
}

// UpdateItemQuantity handles PATCH /orders/items/:id/quantity (auth — guest or cashier+)
func (h *OrderHandler) UpdateItemQuantity(c *gin.Context) {
	var req updateItemQuantityReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	claims := middleware.ClaimsFromContext(c)
	callerID := claims.Subject
	if claims.Role == "customer" {
		callerID = claims.TableID
	}
	if err := h.svc.UpdateOrderItemQuantity(c.Request.Context(), c.Param("id"), callerID, claims.Role, req.Quantity); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật số lượng thành công"})
}

type updateItemServedReq struct {
	QtyServed int32 `json:"qty_served" binding:"min=0"`
}

// UpdateItemServed handles PATCH /orders/items/:id (Chef+)
func (h *OrderHandler) UpdateItemServed(c *gin.Context) {
	var req updateItemServedReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	if err := h.svc.UpdateItemServed(c.Request.Context(), c.Param("id"), req.QtyServed); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật qty_served thành công"})
}

type addItemsReqItem struct {
	ProductID  string                 `json:"product_id"`
	ComboID    string                 `json:"combo_id"`
	Quantity   int32                  `json:"quantity" binding:"required,min=1"`
	ToppingIDs []string               `json:"topping_ids"`
	Note       string                 `json:"note"`
	Filling    string                 `json:"filling"`
	ComboItems []comboItemOverrideReq `json:"combo_items"`
}

type addItemsReq struct {
	Items []addItemsReqItem `json:"items" binding:"required,min=1"`
}

// AddItemsToOrder handles POST /orders/:id/items (Customer/Cashier+)
func (h *OrderHandler) AddItemsToOrder(c *gin.Context) {
	var req addItemsReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}

	for _, item := range req.Items {
		if item.ProductID == "" && item.ComboID == "" {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Mỗi món phải có product_id hoặc combo_id")
			return
		}
		if item.ProductID != "" && item.ComboID != "" {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Không thể có cả product_id và combo_id")
			return
		}
		if !validFilling(item.Filling) {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Nhân không hợp lệ")
			return
		}
		for _, ci := range item.ComboItems {
			if !validFilling(ci.Filling) {
				respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Nhân không hợp lệ")
				return
			}
		}
	}

	claims := middleware.ClaimsFromContext(c)
	callerID := claims.Subject
	if claims.Role == "customer" {
		callerID = claims.TableID
	}

	items := make([]service.CreateOrderItemInput, 0, len(req.Items))
	for _, it := range req.Items {
		items = append(items, service.CreateOrderItemInput{
			ProductID:  it.ProductID,
			ComboID:    it.ComboID,
			Quantity:   it.Quantity,
			ToppingIDs: it.ToppingIDs,
			Note:       it.Note,
			Filling:    it.Filling,
			ComboItems: toComboOverrides(it.ComboItems),
		})
	}

	result, err := h.svc.AddItemsToOrder(c.Request.Context(), c.Param("id"), callerID, claims.Role, items)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"order_id":          c.Param("id"),
		"added_items_count": result.AddedCount,
		"new_total_amount":  service.ParsePrice(result.NewTotalAmount),
	})
}

// ─── response builder ─────────────────────────────────────────────────────────

func orderJSON(o service.OrderDetails) gin.H {
	tableID := ""
	if o.Order.TableID.Valid {
		tableID = o.Order.TableID.String
	}
	customerName := ""
	if o.Order.CustomerName.Valid {
		customerName = o.Order.CustomerName.String
	}
	customerPhone := ""
	if o.Order.CustomerPhone.Valid {
		customerPhone = o.Order.CustomerPhone.String
	}
	note := ""
	if o.Order.Note.Valid {
		note = o.Order.Note.String
	}
	createdBy := ""
	if o.Order.CreatedBy.Valid {
		createdBy = o.Order.CreatedBy.String
	}

	items := make([]gin.H, 0, len(o.Items))
	for _, item := range o.Items {
		var productID interface{}
		if item.ProductID.Valid {
			productID = item.ProductID.String
		}
		var comboID interface{}
		if item.ComboID.Valid {
			comboID = item.ComboID.String
		}
		var comboRefID interface{}
		if item.ComboRefID.Valid {
			comboRefID = item.ComboRefID.String
		}
		itemNote := ""
		if item.Note.Valid {
			itemNote = item.Note.String
		}
		var filling interface{}
		if item.Filling.Valid {
			filling = item.Filling.String
		}
		items = append(items, gin.H{
			"id":                item.ID,
			"product_id":        productID,
			"combo_id":          comboID,
			"combo_ref_id":      comboRefID,
			"name":              item.Name,
			"unit_price":        service.ParsePrice(item.UnitPrice),
			"quantity":          item.Quantity,
			"qty_served":        item.QtyServed,
			"item_status":       item.ItemStatus,
			"toppings_snapshot": item.ToppingsSnapshot,
			"note":              itemNote,
			"filling":           filling,
		})
	}

	return gin.H{
		"id":             o.Order.ID,
		"order_number":   o.Order.OrderNumber,
		"table_id":       tableID,
		"table_name":     o.TableName,
		"status":         string(o.Order.Status),
		"source":         string(o.Order.Source),
		"customer_name":  customerName,
		"customer_phone": customerPhone,
		"note":           note,
		"total_amount":   service.ParsePrice(o.Order.TotalAmount),
		"created_by":     createdBy,
		"created_at":     o.Order.CreatedAt,
		"updated_at":     o.Order.UpdatedAt,
		"items":          items,
	}
}
