package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// MarketingHandler handles marketing dashboard endpoints.
type MarketingHandler struct{}

// NewMarketingHandler creates a MarketingHandler.
func NewMarketingHandler() *MarketingHandler {
	return &MarketingHandler{}
}

// GetSpend handles GET /api/v1/admin/marketing/spend
// Returns static campaign budget + spend data for the new restaurant launch.
func (h *MarketingHandler) GetSpend(c *gin.Context) {
	from := c.DefaultQuery("from", "2026-05-01")
	to := c.DefaultQuery("to", "2026-05-31")

	items := []gin.H{
		{
			"id": "social", "icon": "📱", "name": "Social Media Ads",
			"sub_items":    []string{"Facebook", "Instagram", "TikTok"},
			"budget":       15_000_000, "spent": 8_000_000, "remaining": 7_000_000,
			"progress_pct": 53, "color": "#6366f1",
		},
		{
			"id": "print", "icon": "🖨️", "name": "In ấn & Tờ rơi",
			"sub_items":    []string{"Tờ rơi", "Banner"},
			"budget":       5_000_000, "spent": 3_500_000, "remaining": 1_500_000,
			"progress_pct": 70, "color": "#f59e0b",
		},
		{
			"id": "kol", "icon": "🌟", "name": "Influencer/KOL",
			"sub_items":    []string{"Food blogger"},
			"budget":       10_000_000, "spent": 4_000_000, "remaining": 6_000_000,
			"progress_pct": 40, "color": "#ec4899",
		},
		{
			"id": "promo", "icon": "🎁", "name": "Khuyến mãi khai trương",
			"sub_items":    []string{"Giảm 20%", "Voucher"},
			"budget":       10_000_000, "spent": 2_000_000, "remaining": 8_000_000,
			"progress_pct": 20, "color": "#10b981",
		},
		{
			"id": "event", "icon": "🎊", "name": "Sự kiện khai trương",
			"sub_items":    []string{"Grand opening"},
			"budget":       10_000_000, "spent": 1_000_000, "remaining": 9_000_000,
			"progress_pct": 10, "color": "#f97316",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"date_range": gin.H{"from": from, "to": to},
			"summary": gin.H{
				"total_budget":    50_000_000,
				"total_spent":     18_500_000,
				"total_remaining": 31_500_000,
				"spent_pct":       37,
				"roi":             3.2,
				"roi_base":        "Dựa trên 2.000 khách/tháng",
			},
			"items": items,
			"love_score": gin.H{
				"cost_per_new_customer": 9250,
				"target_customers":      2000,
				"current_customers":     2000,
				"target_followers":      5000,
				"current_followers":     1500,
				"follower_progress_pct": 30,
				"satisfaction_score":    4.5,
				"satisfaction_max":      5.0,
			},
		},
	})
}
