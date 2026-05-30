package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/repository"
	"banhcuon/be/internal/service"
)

func ingredientStatus(ing repository.Ingredient, expiryDate time.Time) string {
	now := time.Now()
	if ing.CurrentStock == 0 {
		return "out_of_stock"
	}
	if expiryDate.Before(now.AddDate(0, 0, 7)) {
		return "expiring_soon"
	}
	if ing.CurrentStock <= ing.MinStock {
		return "low_stock"
	}
	return "in_stock"
}

func toIngredientJSON(ing repository.Ingredient) gin.H {
	expiryDate := ing.ImportDate.AddDate(0, 0, ing.ShelfDays)
	return gin.H{
		"id":               ing.ID,
		"name":             ing.Name,
		"unit":             ing.Unit,
		"quantity":         ing.CurrentStock,
		"warningThreshold": ing.MinStock,
		"importDate":       ing.ImportDate.Format("2006-01-02"),
		"shelfDays":        ing.ShelfDays,
		"expiryDate":       expiryDate.Format("2006-01-02"),
		"status":           ingredientStatus(ing, expiryDate),
		"createdAt":        ing.CreatedAt,
		"updatedAt":        ing.UpdatedAt,
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
		Name             string  `json:"name" binding:"required,max=150"`
		Unit             string  `json:"unit" binding:"required,max=30"`
		ImportDate       string  `json:"importDate" binding:"required"`
		ShelfDays        int     `json:"shelfDays" binding:"required,min=1"`
		InitialQuantity  float64 `json:"initialQuantity"`
		WarningThreshold float64 `json:"warningThreshold"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	importDate, err := time.Parse("2006-01-02", req.ImportDate)
	if err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "importDate must be YYYY-MM-DD")
		return
	}
	ing, err := h.svc.CreateIngredient(c.Request.Context(), service.CreateIngredientInput{
		Name:             req.Name,
		Unit:             req.Unit,
		ImportDate:       importDate,
		ShelfDays:        req.ShelfDays,
		InitialQuantity:  req.InitialQuantity,
		WarningThreshold: req.WarningThreshold,
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
		Name             *string  `json:"name"`
		Unit             *string  `json:"unit"`
		ImportDate       *string  `json:"importDate"`
		ShelfDays        *int     `json:"shelfDays"`
		WarningThreshold *float64 `json:"warningThreshold"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	in := service.UpdateIngredientInput{
		Name:             req.Name,
		Unit:             req.Unit,
		ShelfDays:        req.ShelfDays,
		WarningThreshold: req.WarningThreshold,
	}
	if req.ImportDate != nil {
		parsed, err := time.Parse("2006-01-02", *req.ImportDate)
		if err != nil {
			respondError(c, http.StatusBadRequest, "INVALID_INPUT", "importDate must be YYYY-MM-DD")
			return
		}
		in.ImportDate = &parsed
	}
	ing, err := h.svc.UpdateIngredient(c.Request.Context(), c.Param("id"), in)
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

