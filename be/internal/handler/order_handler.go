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

type createOrderItemReq struct {
	ProductID  string   `json:"product_id"`
	ComboID    string   `json:"combo_id"`
	Quantity   int32    `json:"quantity" binding:"required,min=1"`
	ToppingIDs []string `json:"topping_ids"`
	Note       string   `json:"note"`
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

// ListLive handles GET /orders/live (Staff+)
func (h *OrderHandler) ListLive(c *gin.Context) {
	orders, err := h.svc.ListActiveOrders(c.Request.Context())
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
		productID := ""
		if item.ProductID.Valid {
			productID = item.ProductID.String
		}
		comboID := ""
		if item.ComboID.Valid {
			comboID = item.ComboID.String
		}
		comboRefID := ""
		if item.ComboRefID.Valid {
			comboRefID = item.ComboRefID.String
		}
		itemNote := ""
		if item.Note.Valid {
			itemNote = item.Note.String
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
		})
	}

	return gin.H{
		"id":             o.Order.ID,
		"order_number":   o.Order.OrderNumber,
		"table_id":       tableID,
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
