package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
)

// TaskHandler handles staff task endpoints.
type TaskHandler struct {
	svc *service.TaskService
}

// NewTaskHandler creates a TaskHandler.
func NewTaskHandler(svc *service.TaskService) *TaskHandler {
	return &TaskHandler{svc: svc}
}

func toTaskJSON(t service.TodoTask) gin.H {
	return gin.H{
		"id":                t.ID,
		"title":             t.Title,
		"description":       t.Description,
		"assigned_to":       t.AssignedTo,
		"assigned_to_name":  t.AssignedToName,
		"assigned_by":       t.AssignedBy,
		"assigned_by_name":  t.AssignedByName,
		"status":            t.Status,
		"due_date":          t.DueDate,
		"due_time":          t.DueTime,
		"completed_at":      nilIfEmpty(t.CompletedAt),
		"created_at":        t.CreatedAt,
	}
}

func nilIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}

// ListTasks handles GET /api/v1/admin/tasks
func (h *TaskHandler) ListTasks(c *gin.Context) {
	callerID := middleware.StaffIDFromContext(c)
	callerRole := middleware.RoleFromContext(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "15"))

	in := service.ListTasksInput{
		CallerID:   callerID,
		CallerRole: callerRole,
		AssignedTo: c.Query("assigned_to"),
		StartDate:  c.Query("start_date"),
		EndDate:    c.Query("end_date"),
		Status:     c.Query("status"),
		Page:       page,
		PageSize:   pageSize,
	}

	result, err := h.svc.ListTasks(c.Request.Context(), in)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	data := make([]gin.H, len(result.Tasks))
	for i, t := range result.Tasks {
		data[i] = toTaskJSON(t)
	}
	c.JSON(http.StatusOK, gin.H{
		"data": data,
		"meta": gin.H{
			"total":     result.Total,
			"page":      result.Page,
			"page_size": result.PageSize,
		},
	})
}

// CreateTask handles POST /api/v1/admin/tasks
func (h *TaskHandler) CreateTask(c *gin.Context) {
	var req struct {
		Title       string `json:"title" binding:"required,min=1,max=200"`
		Description string `json:"description"`
		AssignedTo  string `json:"assigned_to" binding:"required"`
		DueDate     string `json:"due_date" binding:"required"`
		DueTime     string `json:"due_time" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu không hợp lệ", err.Error())
		return
	}

	t, err := h.svc.CreateTask(c.Request.Context(), service.CreateTaskInput{
		Title:       req.Title,
		Description: req.Description,
		AssignedTo:  req.AssignedTo,
		DueDate:     req.DueDate,
		DueTime:     req.DueTime,
		CallerID:    middleware.StaffIDFromContext(c),
		CallerRole:  middleware.RoleFromContext(c),
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": toTaskJSON(t)})
}

// UpdateTask handles PATCH /api/v1/admin/tasks/:id
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`
		AssignedTo  *string `json:"assigned_to"`
		DueDate     *string `json:"due_date"`
		DueTime     *string `json:"due_time"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu không hợp lệ", err.Error())
		return
	}

	t, err := h.svc.UpdateTask(c.Request.Context(), service.UpdateTaskInput{
		ID:          id,
		Title:       req.Title,
		Description: req.Description,
		AssignedTo:  req.AssignedTo,
		DueDate:     req.DueDate,
		DueTime:     req.DueTime,
		CallerID:    middleware.StaffIDFromContext(c),
		CallerRole:  middleware.RoleFromContext(c),
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toTaskJSON(t)})
}

// ToggleStatus handles PATCH /api/v1/admin/tasks/:id/status
func (h *TaskHandler) ToggleStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu không hợp lệ", err.Error())
		return
	}

	err := h.svc.ToggleStatus(c.Request.Context(), service.ToggleTaskInput{
		ID:         id,
		Status:     req.Status,
		CallerID:   middleware.StaffIDFromContext(c),
		CallerRole: middleware.RoleFromContext(c),
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật trạng thái thành công"})
}

// DeleteTask handles DELETE /api/v1/admin/tasks/:id
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	id := c.Param("id")
	err := h.svc.DeleteTask(
		c.Request.Context(),
		id,
		middleware.StaffIDFromContext(c),
		middleware.RoleFromContext(c),
	)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa công việc thành công"})
}
