package handler

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/service"
)

// ProductHandler handles all product/category/topping/combo endpoints.
type ProductHandler struct {
	svc *service.ProductService
}

// NewProductHandler creates a ProductHandler.
func NewProductHandler(svc *service.ProductService) *ProductHandler {
	return &ProductHandler{svc: svc}
}

// storageURL returns STORAGE_BASE_URL env var (trailing slash stripped).
func storageURL() string {
	u := os.Getenv("STORAGE_BASE_URL")
	if len(u) > 0 && u[len(u)-1] == '/' {
		u = u[:len(u)-1]
	}
	return u
}

// buildImageURL assembles the full image URL from a relative path.
func buildImageURL(path string) string {
	if path == "" {
		return ""
	}
	return storageURL() + "/" + path
}

// ─── Products ────────────────────────────────────────────────────────────────

// ListProducts handles GET /products (public — available only).
func (h *ProductHandler) ListProducts(c *gin.Context) {
	products, err := h.svc.ListProducts(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	data := make([]gin.H, 0, len(products))
	for _, p := range products {
		data = append(data, productJSON(p))
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// ListAllProducts handles GET /products/all (Manager+ — includes unavailable).
func (h *ProductHandler) ListAllProducts(c *gin.Context) {
	products, err := h.svc.ListAllProducts(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	data := make([]gin.H, 0, len(products))
	for _, p := range products {
		data = append(data, productJSON(p))
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// GetProduct handles GET /products/:id
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	p, err := h.svc.GetProduct(c.Request.Context(), id)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": productJSON(p)})
}

type createProductRequest struct {
	Name        string   `json:"name" binding:"required"`
	Price       int64    `json:"price" binding:"required,min=0"`
	CategoryID  string   `json:"category_id" binding:"required"`
	Description string   `json:"description"`
	ImagePath   string   `json:"image_path"`
	ToppingIDs  []string `json:"topping_ids"`
	IsAvailable *bool    `json:"is_available"`
	SortOrder   int32    `json:"sort_order"`
}

// CreateProduct handles POST /products (Manager+)
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req createProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}

	in := service.CreateProductInput{
		Name:        req.Name,
		Price:       req.Price,
		CategoryID:  req.CategoryID,
		Description: req.Description,
		ImagePath:   req.ImagePath,
		ToppingIDs:  req.ToppingIDs,
		IsAvailable: true,
		SortOrder:   req.SortOrder,
	}
	if req.IsAvailable != nil {
		in.IsAvailable = *req.IsAvailable
	}

	id, err := h.svc.CreateProduct(c.Request.Context(), in)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": id}})
}

type updateProductRequest struct {
	Name        string    `json:"name" binding:"required"`
	Price       int64     `json:"price" binding:"required,min=0"`
	CategoryID  string    `json:"category_id" binding:"required"`
	Description string    `json:"description"`
	ImagePath   string    `json:"image_path"`
	ToppingIDs  *[]string `json:"topping_ids"`
	SortOrder   int32     `json:"sort_order"`
}

// UpdateProduct handles PUT /products/:id (Manager+)
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	var req updateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}

	err := h.svc.UpdateProduct(c.Request.Context(), c.Param("id"), service.UpdateProductInput{
		Name:        req.Name,
		Price:       req.Price,
		CategoryID:  req.CategoryID,
		Description: req.Description,
		ImagePath:   req.ImagePath,
		ToppingIDs:  req.ToppingIDs,
		SortOrder:   req.SortOrder,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật sản phẩm thành công"})
}

// DeleteProduct handles DELETE /products/:id (Admin)
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	if err := h.svc.DeleteProduct(c.Request.Context(), c.Param("id")); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// ─── Categories ──────────────────────────────────────────────────────────────

// ListCategories handles GET /categories
func (h *ProductHandler) ListCategories(c *gin.Context) {
	cats, err := h.svc.ListCategories(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(cats))
	for _, cat := range cats {
		desc := ""
		if cat.Description.Valid {
			desc = cat.Description.String
		}
		data = append(data, gin.H{
			"id":          cat.ID,
			"name":        cat.Name,
			"description": desc,
			"sort_order":  cat.SortOrder,
			"is_active":   cat.IsActive,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

type createCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	SortOrder   int32  `json:"sort_order"`
}

// CreateCategory handles POST /categories (Manager+)
func (h *ProductHandler) CreateCategory(c *gin.Context) {
	var req createCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	id, err := h.svc.CreateCategory(c.Request.Context(), service.CreateCategoryInput{
		Name:        req.Name,
		Description: req.Description,
		SortOrder:   req.SortOrder,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": id}})
}

type updateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	SortOrder   int32  `json:"sort_order"`
}

// UpdateCategory handles PUT /categories/:id (Manager+)
func (h *ProductHandler) UpdateCategory(c *gin.Context) {
	var req updateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	if err := h.svc.UpdateCategory(c.Request.Context(), c.Param("id"), service.UpdateCategoryInput{
		Name:        req.Name,
		Description: req.Description,
		SortOrder:   req.SortOrder,
	}); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật danh mục thành công"})
}

// DeleteCategory handles DELETE /categories/:id (Admin)
func (h *ProductHandler) DeleteCategory(c *gin.Context) {
	if err := h.svc.DeleteCategory(c.Request.Context(), c.Param("id")); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// ─── Toppings ────────────────────────────────────────────────────────────────

// ListToppings handles GET /toppings
func (h *ProductHandler) ListToppings(c *gin.Context) {
	toppings, err := h.svc.ListToppings(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(toppings))
	for _, t := range toppings {
		data = append(data, gin.H{
			"id":           t.ID,
			"name":         t.Name,
			"price":        service.ParsePrice(t.Price),
			"is_available": t.IsAvailable,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

type createToppingRequest struct {
	Name  string `json:"name" binding:"required"`
	Price int64  `json:"price" binding:"required,min=0"`
}

// CreateTopping handles POST /toppings (Manager+)
func (h *ProductHandler) CreateTopping(c *gin.Context) {
	var req createToppingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	id, err := h.svc.CreateTopping(c.Request.Context(), service.CreateToppingInput{Name: req.Name, Price: req.Price})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": id}})
}

type updateToppingRequest struct {
	Name  string `json:"name" binding:"required"`
	Price int64  `json:"price" binding:"required,min=0"`
}

// UpdateTopping handles PUT /toppings/:id (Manager+)
func (h *ProductHandler) UpdateTopping(c *gin.Context) {
	var req updateToppingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	if err := h.svc.UpdateTopping(c.Request.Context(), c.Param("id"), service.UpdateToppingInput{Name: req.Name, Price: req.Price}); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật topping thành công"})
}

// DeleteTopping handles DELETE /toppings/:id (Admin)
func (h *ProductHandler) DeleteTopping(c *gin.Context) {
	if err := h.svc.DeleteTopping(c.Request.Context(), c.Param("id")); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// ─── Combos ──────────────────────────────────────────────────────────────────

// ListCombos handles GET /combos
func (h *ProductHandler) ListCombos(c *gin.Context) {
	combos, err := h.svc.ListCombos(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(combos))
	for _, combo := range combos {
		items := make([]gin.H, 0, len(combo.Items))
		for _, item := range combo.Items {
			items = append(items, gin.H{
				"id":         item.ID,
				"product_id": item.ProductID,
				"quantity":   item.Quantity,
			})
		}
		data = append(data, gin.H{
			"id":           combo.ID,
			"name":         combo.Name,
			"description":  combo.Description,
			"price":        combo.Price,
			"image_path":   combo.ImagePath,
			"is_available": combo.IsAvailable,
			"sort_order":   combo.SortOrder,
			"category_id":  combo.CategoryID,
			"combo_items":  items,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

type createComboRequest struct {
	Name        string              `json:"name" binding:"required"`
	Price       int64               `json:"price" binding:"required,min=0"`
	CategoryID  string              `json:"category_id"`
	Description string              `json:"description"`
	ImagePath   string              `json:"image_path"`
	SortOrder   int32               `json:"sort_order"`
	Items       []comboItemRequest  `json:"items"`
}

type comboItemRequest struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int32  `json:"quantity" binding:"required,min=1"`
}

// CreateCombo handles POST /combos (Manager+)
func (h *ProductHandler) CreateCombo(c *gin.Context) {
	var req createComboRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	items := make([]service.ComboItemInput, 0, len(req.Items))
	for _, item := range req.Items {
		items = append(items, service.ComboItemInput{ProductID: item.ProductID, Quantity: item.Quantity})
	}
	id, err := h.svc.CreateCombo(c.Request.Context(), service.CreateComboInput{
		Name:        req.Name,
		Price:       req.Price,
		CategoryID:  req.CategoryID,
		Description: req.Description,
		ImagePath:   req.ImagePath,
		SortOrder:   req.SortOrder,
		Items:       items,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": id}})
}

// DeleteCombo handles DELETE /combos/:id (Admin)
func (h *ProductHandler) DeleteCombo(c *gin.Context) {
	if err := h.svc.DeleteCombo(c.Request.Context(), c.Param("id")); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// ─── shared helpers ───────────────────────────────────────────────────────────

func productJSON(p service.ProductDetails) gin.H {
	toppings := make([]gin.H, 0, len(p.Toppings))
	for _, t := range p.Toppings {
		toppings = append(toppings, gin.H{"id": t.ID, "name": t.Name, "price": t.Price})
	}
	return gin.H{
		"id":           p.ID,
		"name":         p.Name,
		"price":        p.Price,
		"description":  p.Description,
		"image_path":   p.ImagePath,
		"is_available": p.IsAvailable,
		"sort_order":   p.SortOrder,
		"category": gin.H{
			"id":   p.CategoryID,
			"name": p.CategoryName,
		},
		"toppings": toppings,
	}
}

