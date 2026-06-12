// P-SYSTEST reference build — the menu page's ONE write (POST /orders) + follow-up read
// (GET /orders/:id). Post-TOP contract: create ALWAYS succeeds when valid; the response
// carries table_busy instead of a 409 TABLE_HAS_ACTIVE_ORDER. Not compiled into the app.
package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"example.local/menuref/service"
)

type OrderHandler struct {
	svc *service.OrderService
}

func NewOrderHandler(svc *service.OrderService) *OrderHandler {
	return &OrderHandler{svc: svc}
}

// createOrderItemReq mirrors FE OrderItemPayload (lib/order-payload.ts).
// Exactly ONE of product_id / combo_id must be set. Nhân + rau arrive as topping_ids —
// no filling field exists (dropped by migration 017).
type createOrderItemReq struct {
	ProductID  *string  `json:"product_id"`
	ComboID    *string  `json:"combo_id"`
	Quantity   int      `json:"quantity" binding:"required,min=1"`
	ToppingIDs []string `json:"topping_ids"`
	Note       string   `json:"note"`
	ComboItems []struct {
		ProductID  string   `json:"product_id" binding:"required"`
		Quantity   int      `json:"quantity" binding:"required,min=1"`
		ToppingIDs []string `json:"topping_ids"`
		Note       string   `json:"note"`
	} `json:"combo_items"`
}

type createOrderReq struct {
	CustomerName  string               `json:"customer_name"`
	CustomerPhone string               `json:"customer_phone"`
	Note          *string              `json:"note"`
	TableID       *string              `json:"table_id"`
	Source        string               `json:"source" binding:"required,oneof=qr online pos"`
	Items         []createOrderItemReq `json:"items" binding:"required,min=1,dive"`
}

// POST /api/v1/orders — auth (guest JWT from QR scan is enough)
func (h *OrderHandler) Create(c *gin.Context) {
	var req createOrderReq
	if err := c.ShouldBindJSON(&req); err != nil {
		// Generic message — err.Error() would leak struct names (ERROR_SPEC rule).
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu không hợp lệ")
		return
	}
	for _, it := range req.Items {
		if (it.ProductID == nil) == (it.ComboID == nil) {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Mỗi món phải có đúng một trong product_id hoặc combo_id")
			return
		}
	}

	result, err := h.svc.CreateOrder(c.Request.Context(), service.CreateOrderInput{
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
		Note:          req.Note,
		TableID:       req.TableID,
		Source:        req.Source,
		Items:         toServiceItems(req.Items),
		CreatedBy:     c.GetString("staff_id"), // empty for guests
	})
	if err != nil {
		h.respondServiceError(c, err)
		return
	}

	// table_busy:true = the table already had an active order; THIS order is still created.
	respondJSON(c, http.StatusCreated, gin.H{"data": gin.H{
		"id":         result.OrderID,
		"table_busy": result.TableBusy,
	}})
}

// GET /api/v1/orders/:id — auth (guest may read own-table orders only)
func (h *OrderHandler) Get(c *gin.Context) {
	order, err := h.svc.GetOrder(c.Request.Context(), c.Param("id"))
	if err != nil {
		h.respondServiceError(c, err)
		return
	}
	respondJSON(c, http.StatusOK, gin.H{"data": order})
}

func toServiceItems(items []createOrderItemReq) []service.OrderItemInput {
	out := make([]service.OrderItemInput, 0, len(items))
	for _, it := range items {
		in := service.OrderItemInput{
			ProductID:  it.ProductID,
			ComboID:    it.ComboID,
			Quantity:   it.Quantity,
			ToppingIDs: it.ToppingIDs,
			Note:       it.Note,
		}
		for _, ci := range it.ComboItems {
			in.ComboItems = append(in.ComboItems, service.ComboItemInput{
				ProductID:  ci.ProductID,
				Quantity:   ci.Quantity,
				ToppingIDs: ci.ToppingIDs,
				Note:       ci.Note,
			})
		}
		out = append(out, in)
	}
	return out
}

func (h *OrderHandler) respondServiceError(c *gin.Context, err error) {
	var appErr *service.AppError
	if errors.As(err, &appErr) {
		respondError(c, appErr.Status, appErr.Code, appErr.Message)
		return
	}
	respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ")
}
