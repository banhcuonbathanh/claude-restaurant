package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
)

// StaffHandler handles all staff management endpoints.
type StaffHandler struct {
	svc *service.StaffService
}

// NewStaffHandler creates a StaffHandler.
func NewStaffHandler(svc *service.StaffService) *StaffHandler {
	return &StaffHandler{svc: svc}
}

// ListStaff handles GET /api/v1/staff
func (h *StaffHandler) ListStaff(c *gin.Context) {
	role := c.Query("role")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	var isActive *bool
	if raw := c.Query("is_active"); raw != "" {
		v := raw == "true" || raw == "1"
		isActive = &v
	}

	result, err := h.svc.ListStaff(c.Request.Context(), role, isActive, search, page, limit)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	data := make([]gin.H, 0, len(result.Staff))
	for _, s := range result.Staff {
		data = append(data, toStaffJSON(s))
	}
	c.JSON(http.StatusOK, gin.H{
		"data": data,
		"meta": gin.H{"page": result.Page, "limit": result.Limit, "total": result.Total},
	})
}

// GetStaff handles GET /api/v1/staff/:id
func (h *StaffHandler) GetStaff(c *gin.Context) {
	id := c.Param("id")
	callerID := middleware.StaffIDFromContext(c)
	callerRole := middleware.RoleFromContext(c)

	if id != callerID && !roleAtLeast(callerRole, "manager") {
		respondError(c, http.StatusForbidden, "AUTH_003", "Không đủ quyền truy cập")
		return
	}

	s, err := h.svc.GetStaff(c.Request.Context(), id)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toStaffDetailJSON(s)})
}

// CreateStaff handles POST /api/v1/staff
func (h *StaffHandler) CreateStaff(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required,min=3,max=50"`
		Password string `json:"password" binding:"required,min=8"`
		FullName string `json:"full_name" binding:"required,min=2,max=100"`
		Role     string `json:"role" binding:"required"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	callerRole := middleware.RoleFromContext(c)
	created, err := h.svc.CreateStaff(c.Request.Context(), callerRole, service.CreateStaffInput{
		Username: req.Username,
		Password: req.Password,
		FullName: req.FullName,
		Role:     req.Role,
		Phone:    req.Phone,
		Email:    req.Email,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": toStaffJSON(created)})
}

// UpdateStaff handles PATCH /api/v1/staff/:id
func (h *StaffHandler) UpdateStaff(c *gin.Context) {
	id := c.Param("id")
	callerID := middleware.StaffIDFromContext(c)
	callerRole := middleware.RoleFromContext(c)

	if id != callerID && !roleAtLeast(callerRole, "manager") {
		respondError(c, http.StatusForbidden, "AUTH_003", "Không đủ quyền truy cập")
		return
	}

	var req struct {
		FullName *string `json:"full_name"`
		Role     *string `json:"role"`
		Phone    *string `json:"phone"`
		Email    *string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	// Non-managers cannot change role
	if req.Role != nil && !roleAtLeast(callerRole, "manager") {
		req.Role = nil
	}

	updated, err := h.svc.UpdateStaff(c.Request.Context(), callerRole, id, service.UpdateStaffInput{
		FullName: req.FullName,
		Role:     req.Role,
		Phone:    req.Phone,
		Email:    req.Email,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toStaffDetailJSON(updated)})
}

// SetStaffStatus handles PATCH /api/v1/staff/:id/status
func (h *StaffHandler) SetStaffStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	callerID := middleware.StaffIDFromContext(c)
	callerRole := middleware.RoleFromContext(c)

	result, err := h.svc.SetStaffStatus(c.Request.Context(), callerID, callerRole, id, req.IsActive)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"id":         result.ID,
		"is_active":  result.IsActive,
		"updated_at": result.UpdatedAt,
	}})
}

// DeleteStaff handles DELETE /api/v1/staff/:id (Admin only)
func (h *StaffHandler) DeleteStaff(c *gin.Context) {
	id := c.Param("id")
	callerID := middleware.StaffIDFromContext(c)

	if err := h.svc.DeleteStaff(c.Request.Context(), callerID, id); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tài khoản đã bị xóa"})
}

// ─── helpers ─────────────────────────────────────────────────────────────────

var staffRoleLevels = map[string]int{
	"customer": 1, "chef": 2, "cashier": 2, "staff": 3, "manager": 4, "admin": 5,
}

func roleAtLeast(role, min string) bool {
	return staffRoleLevels[role] >= staffRoleLevels[min]
}

func toStaffJSON(s db.Staff) gin.H {
	return gin.H{
		"id":         s.ID,
		"username":   s.Username,
		"full_name":  s.FullName,
		"role":       string(s.Role),
		"phone":      s.Phone.String,
		"email":      s.Email.String,
		"is_active":  s.IsActive,
		"created_at": s.CreatedAt,
	}
}

func toStaffDetailJSON(s db.Staff) gin.H {
	m := toStaffJSON(s)
	m["updated_at"] = s.UpdatedAt
	return m
}
