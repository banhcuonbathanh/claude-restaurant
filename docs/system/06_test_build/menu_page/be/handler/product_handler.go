// P-SYSTEST reference build — the 3 public catalog reads the menu page calls
// (GET /categories · GET /products · GET /combos). Mirrors be/internal/handler layer rules:
// parse request → call service → respond. Not compiled into the app.
package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"example.local/menuref/service"
)

type ProductHandler struct {
	svc *service.ProductService
}

func NewProductHandler(svc *service.ProductService) *ProductHandler {
	return &ProductHandler{svc: svc}
}

// GET /api/v1/categories — public
func (h *ProductHandler) ListCategories(c *gin.Context) {
	cats, err := h.svc.ListCategories(c.Request.Context())
	if err != nil {
		h.respondServiceError(c, err)
		return
	}
	respondJSON(c, http.StatusOK, gin.H{"data": cats})
}

// GET /api/v1/products?category_id=&search=&is_available= — public
// The menu page calls it twice: unfiltered (['products-all']) and filtered (['products',cat,q]).
func (h *ProductHandler) ListProducts(c *gin.Context) {
	filter := service.ProductFilter{
		CategoryID: c.Query("category_id"),
		Search:     c.Query("search"),
	}
	if v := c.Query("is_available"); v != "" {
		avail := v == "true"
		filter.IsAvailable = &avail
	}

	products, err := h.svc.ListProducts(c.Request.Context(), filter)
	if err != nil {
		h.respondServiceError(c, err)
		return
	}
	respondJSON(c, http.StatusOK, gin.H{"data": products})
}

// GET /api/v1/combos — public. combo_items carry only product_id + quantity
// (FE enriches names/prices client-side — IMP-2 notes this join belongs here).
func (h *ProductHandler) ListCombos(c *gin.Context) {
	combos, err := h.svc.ListCombos(c.Request.Context())
	if err != nil {
		h.respondServiceError(c, err)
		return
	}
	respondJSON(c, http.StatusOK, gin.H{"data": combos})
}

func (h *ProductHandler) respondServiceError(c *gin.Context, err error) {
	var appErr *service.AppError
	if errors.As(err, &appErr) {
		respondError(c, appErr.Status, appErr.Code, appErr.Message)
		return
	}
	respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ")
}
