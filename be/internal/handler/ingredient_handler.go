package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/repository"
	"banhcuon/be/internal/service"
)

func toIngredientJSON(ing repository.Ingredient) gin.H {
	return gin.H{
		"id":            ing.ID,
		"name":          ing.Name,
		"unit":          ing.Unit,
		"current_stock": ing.CurrentStock,
		"min_stock":     ing.MinStock,
		"cost_per_unit": ing.CostPerUnit,
		"created_at":    ing.CreatedAt,
		"updated_at":    ing.UpdatedAt,
	}
}

// IngredientHandler handles ingredient CRUD and stock movement endpoints.
type IngredientHandler struct {
	svc *service.IngredientService
}

// NewIngredientHandler creates an IngredientHandler.
func NewIngredientHandler(svc *service.IngredientService) *IngredientHandler {
	return &IngredientHandler{svc: svc}
}

// ListIngredients handles GET /api/v1/admin/ingredients
func (h *IngredientHandler) ListIngredients(c *gin.Context) {
	list, err := h.svc.ListIngredients(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(list))
	for _, ing := range list {
		data = append(data, toIngredientJSON(ing))
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// ListLowStock handles GET /api/v1/admin/ingredients/low-stock
func (h *IngredientHandler) ListLowStock(c *gin.Context) {
	list, err := h.svc.ListLowStock(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(list))
	for _, ing := range list {
		data = append(data, toIngredientJSON(ing))
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// GetIngredient handles GET /api/v1/admin/ingredients/:id
func (h *IngredientHandler) GetIngredient(c *gin.Context) {
	ing, err := h.svc.GetIngredient(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toIngredientJSON(ing)})
}

// CreateIngredient handles POST /api/v1/admin/ingredients
func (h *IngredientHandler) CreateIngredient(c *gin.Context) {
	var req struct {
		Name         string  `json:"name" binding:"required,max=150"`
		Unit         string  `json:"unit" binding:"required,max=30"`
		CurrentStock float64 `json:"current_stock"`
		MinStock     float64 `json:"min_stock"`
		CostPerUnit  int64   `json:"cost_per_unit"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	ing, err := h.svc.CreateIngredient(c.Request.Context(), service.CreateIngredientInput{
		Name:         req.Name,
		Unit:         req.Unit,
		CurrentStock: req.CurrentStock,
		MinStock:     req.MinStock,
		CostPerUnit:  req.CostPerUnit,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": toIngredientJSON(ing)})
}

// UpdateIngredient handles PATCH /api/v1/admin/ingredients/:id
func (h *IngredientHandler) UpdateIngredient(c *gin.Context) {
	var req struct {
		Name        *string  `json:"name"`
		Unit        *string  `json:"unit"`
		MinStock    *float64 `json:"min_stock"`
		CostPerUnit *int64   `json:"cost_per_unit"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	ing, err := h.svc.UpdateIngredient(c.Request.Context(), c.Param("id"), service.UpdateIngredientInput{
		Name:        req.Name,
		Unit:        req.Unit,
		MinStock:    req.MinStock,
		CostPerUnit: req.CostPerUnit,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toIngredientJSON(ing)})
}

// DeleteIngredient handles DELETE /api/v1/admin/ingredients/:id
func (h *IngredientHandler) DeleteIngredient(c *gin.Context) {
	if err := h.svc.DeleteIngredient(c.Request.Context(), c.Param("id")); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nguyên liệu đã được xóa"})
}

// CreateStockMovement handles POST /api/v1/admin/stock-movements
func (h *IngredientHandler) CreateStockMovement(c *gin.Context) {
	var req struct {
		IngredientID string  `json:"ingredient_id" binding:"required"`
		Type         string  `json:"type" binding:"required"`
		Quantity     float64 `json:"quantity" binding:"required,gt=0"`
		Note         string  `json:"note"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	callerID := middleware.StaffIDFromContext(c)
	sm, err := h.svc.CreateStockMovement(c.Request.Context(), service.CreateStockMovementInput{
		IngredientID: req.IngredientID,
		Type:         req.Type,
		Quantity:     req.Quantity,
		Note:         req.Note,
		CreatedBy:    callerID,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{
		"id":            sm.ID,
		"ingredient_id": sm.IngredientID,
		"type":          sm.Type,
		"quantity":      sm.Quantity,
		"note":          sm.Note.String,
		"created_at":    sm.CreatedAt,
	}})
}

// ListStockMovements handles GET /api/v1/admin/ingredients/:id/movements
func (h *IngredientHandler) ListStockMovements(c *gin.Context) {
	list, err := h.svc.ListStockMovements(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(list))
	for _, sm := range list {
		data = append(data, gin.H{
			"id":            sm.ID,
			"ingredient_id": sm.IngredientID,
			"type":          sm.Type,
			"quantity":      sm.Quantity,
			"note":          sm.Note.String,
			"created_at":    sm.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

