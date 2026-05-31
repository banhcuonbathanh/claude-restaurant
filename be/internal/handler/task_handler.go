package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
)

// TaskHandler handles staff task board endpoints.
type TaskHandler struct {
	svc *service.TaskService
}

// NewTaskHandler creates a TaskHandler.
func NewTaskHandler(svc *service.TaskService) *TaskHandler {
	return &TaskHandler{svc: svc}
}

// GetTaskStats handles GET /api/v1/admin/tasks/stats?date=YYYY-MM-DD
func (h *TaskHandler) GetTaskStats(c *gin.Context) {
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	result, err := h.svc.GetTaskStats(c.Request.Context(), date)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": result})
}

// GetStaffTasks handles GET /api/v1/admin/tasks?staffId=&date=YYYY-MM-DD
func (h *TaskHandler) GetStaffTasks(c *gin.Context) {
	staffID := c.Query("staffId")
	if staffID == "" {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "staffId là bắt buộc")
		return
	}
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	tasks, err := h.svc.GetStaffTasks(c.Request.Context(), staffID, date)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tasks})
}

// CreateTask handles POST /api/v1/admin/tasks
func (h *TaskHandler) CreateTask(c *gin.Context) {
	var req struct {
		StaffID      string `json:"staffId"      binding:"required"`
		Name         string `json:"name"         binding:"required,min=1,max=200"`
		Description  string `json:"description"`
		Priority     string `json:"priority"     binding:"required"`
		DueDateTime  string `json:"dueDateTime"  binding:"required"`
		DueTimeStart string `json:"dueTimeStart"`
		DueTimeEnd   string `json:"dueTimeEnd"`
		Notes        string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu không hợp lệ", err.Error())
		return
	}

	task, err := h.svc.CreateTask(c.Request.Context(), service.CreateTaskSvcInput{
		CallerID:     middleware.StaffIDFromContext(c),
		AssignedTo:   req.StaffID,
		Name:         req.Name,
		Description:  req.Description,
		Priority:     req.Priority,
		DueDateTime:  req.DueDateTime,
		DueTimeStart: req.DueTimeStart,
		DueTimeEnd:   req.DueTimeEnd,
		Notes:        req.Notes,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": task})
}
