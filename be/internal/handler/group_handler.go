package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/service"
)

// GroupHandler handles /orders/group/* endpoints.
type GroupHandler struct {
	svc *service.GroupService
}

// NewGroupHandler creates a GroupHandler.
func NewGroupHandler(svc *service.GroupService) *GroupHandler {
	return &GroupHandler{svc: svc}
}

type createGroupReq struct {
	OrderIDs []string `json:"order_ids" binding:"required,min=2"`
}

// CreateGroup handles POST /orders/group (Staff+)
func (h *GroupHandler) CreateGroup(c *gin.Context) {
	var req createGroupReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Cần ít nhất 2 đơn hàng để tạo nhóm")
		return
	}
	groupID, err := h.svc.CreateGroup(c.Request.Context(), req.OrderIDs)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"group_id": groupID}})
}

// GetGroup handles GET /orders/group/:id (Staff+)
func (h *GroupHandler) GetGroup(c *gin.Context) {
	orders, err := h.svc.GetGroupOrders(c.Request.Context(), c.Param("id"))
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

// RemoveFromGroup handles DELETE /orders/group/:id/orders/:orderId (Staff+)
func (h *GroupHandler) RemoveFromGroup(c *gin.Context) {
	if err := h.svc.RemoveFromGroup(c.Request.Context(), c.Param("orderId")); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// DisbandGroup handles DELETE /orders/group/:id (Staff+)
func (h *GroupHandler) DisbandGroup(c *gin.Context) {
	if err := h.svc.DisbandGroup(c.Request.Context(), c.Param("id")); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
