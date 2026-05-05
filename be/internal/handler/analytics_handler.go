package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/service"
)

// AnalyticsHandler handles dashboard aggregation endpoints.
type AnalyticsHandler struct {
	svc *service.AnalyticsService
}

// NewAnalyticsHandler creates an AnalyticsHandler.
func NewAnalyticsHandler(svc *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{svc: svc}
}

// GetSummary handles GET /api/v1/admin/summary?range=today|week|month
func (h *AnalyticsHandler) GetSummary(c *gin.Context) {
	rangeParam := c.DefaultQuery("range", "today")
	result, err := h.svc.GetSummary(c.Request.Context(), rangeParam)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"customers":     result.Customers,
		"dishes_sold":   result.DishesSold,
		"revenue":       result.Revenue,
		"active_tables": result.ActiveTables,
	}})
}

// GetTopDishes handles GET /api/v1/admin/top-dishes?limit=5&range=today|week|month
func (h *AnalyticsHandler) GetTopDishes(c *gin.Context) {
	rangeParam := c.DefaultQuery("range", "today")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))

	rows, err := h.svc.GetTopDishes(c.Request.Context(), limit, rangeParam)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	data := make([]gin.H, 0, len(rows))
	for _, r := range rows {
		data = append(data, gin.H{
			"name":    r.Name,
			"qty":     r.Qty,
			"revenue": r.Revenue,
			"pct":     float64(r.PctTimes100) / 100.0,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// GetStaffPerformance handles GET /api/v1/admin/staff-performance?range=today|week|month
func (h *AnalyticsHandler) GetStaffPerformance(c *gin.Context) {
	rangeParam := c.DefaultQuery("range", "today")
	rows, err := h.svc.GetStaffPerformance(c.Request.Context(), rangeParam)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	data := make([]gin.H, 0, len(rows))
	for _, r := range rows {
		revenue := gin.H(nil)
		if r.Role != "chef" {
			revenue = gin.H{"revenue": r.Revenue}
		}
		row := gin.H{
			"staff_id":       r.StaffID,
			"full_name":      r.FullName,
			"role":           r.Role,
			"orders_handled": r.OrdersHandled,
		}
		if revenue != nil {
			row["revenue"] = r.Revenue
		}
		data = append(data, row)
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}
