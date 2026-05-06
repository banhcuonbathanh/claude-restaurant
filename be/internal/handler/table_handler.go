package handler

import (
	"database/sql"
	"encoding/hex"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/repository"
	"banhcuon/be/internal/service"
)


// TableHandler handles /tables/* endpoints.
type TableHandler struct {
	repo repository.TableRepository
}

// NewTableHandler creates a TableHandler.
// Table operations are simple enough not to need a dedicated service layer.
func NewTableHandler(repo repository.TableRepository) *TableHandler {
	return &TableHandler{repo: repo}
}

// ListTables handles GET /tables (Staff+)
func (h *TableHandler) ListTables(c *gin.Context) {
	tables, err := h.repo.ListTables(c.Request.Context())
	if err != nil {
		respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ")
		return
	}
	data := make([]gin.H, 0, len(tables))
	for _, t := range tables {
		data = append(data, gin.H{
			"id":        t.ID,
			"name":      t.Name,
			"capacity":  t.Capacity,
			"status":    t.Status,
			"is_active": t.IsActive,
			"qr_token":  t.QrToken,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

type createTableReq struct {
	Name     string `json:"name" binding:"required"`
	Capacity int32  `json:"capacity" binding:"required,min=1"`
}

// CreateTable handles POST /tables (Manager+)
func (h *TableHandler) CreateTable(c *gin.Context) {
	var req createTableReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}

	id := service.NewPublicUUID()
	qrToken := hex.EncodeToString(service.NewRandomBytes(32))

	if err := h.repo.CreateTable(c.Request.Context(), id, req.Name, qrToken, req.Capacity); err != nil {
		respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ")
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": id, "qr_token": qrToken}})
}

type updateTableReq struct {
	Name     string `json:"name" binding:"required"`
	Capacity int32  `json:"capacity" binding:"required,min=1"`
	IsActive *bool  `json:"is_active"`
}

// UpdateTable handles PATCH /tables/:id (Manager+)
func (h *TableHandler) UpdateTable(c *gin.Context) {
	var req updateTableReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	if err := h.repo.UpdateTable(c.Request.Context(), c.Param("id"), req.Name, req.Capacity, isActive); err != nil {
		respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ")
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật bàn thành công"})
}

// DecodeQR handles GET /tables/qr/:token (Public, rate-limited)
func (h *TableHandler) DecodeQR(c *gin.Context) {
	token := c.Param("token")
	t, err := h.repo.GetTableByQRToken(c.Request.Context(), token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(c, http.StatusNotFound, "NOT_FOUND", "Không tìm thấy bàn")
			return
		}
		respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ")
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"id":       t.ID,
		"name":     t.Name,
		"capacity": t.Capacity,
		"status":   string(t.Status),
	}})
}
