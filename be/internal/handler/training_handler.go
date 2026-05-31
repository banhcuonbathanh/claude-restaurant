package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
)

// TrainingHandler handles staff training guide and progress endpoints.
type TrainingHandler struct {
	svc *service.TrainingService
}

func NewTrainingHandler(svc *service.TrainingService) *TrainingHandler {
	return &TrainingHandler{svc: svc}
}

// ListGuides handles GET /api/v1/admin/training/guides
// Optional query param: ?role=chef|cashier|staff|manager
func (h *TrainingHandler) ListGuides(c *gin.Context) {
	roleFilter := c.Query("role")
	guides, err := h.svc.ListGuides(c.Request.Context(), roleFilter)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	data := make([]gin.H, 0, len(guides))
	for _, g := range guides {
		data = append(data, guideToJSON(g))
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// CreateGuide handles POST /api/v1/admin/training/guides
func (h *TrainingHandler) CreateGuide(c *gin.Context) {
	var body struct {
		Title             string   `json:"title"              binding:"required"`
		Role              string   `json:"role"               binding:"required"`
		Description       string   `json:"description"`
		CoverImageURL     string   `json:"coverImageUrl"`
		YoutubeURL        string   `json:"youtubeUrl"`
		QualityKpiTarget  string   `json:"qualityKpiTarget"`
		QuantityKpiTarget string   `json:"quantityKpiTarget"`
		PassThreshold     int32    `json:"passThreshold"`
		MaxAttempts       int32    `json:"maxAttempts"`
		Published         bool     `json:"published"`
		ResponsibleRoles  []string `json:"responsibleRoles"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	if body.PassThreshold == 0 {
		body.PassThreshold = 75
	}
	if body.MaxAttempts == 0 {
		body.MaxAttempts = 3
	}

	staffID := middleware.StaffIDFromContext(c)
	guide, err := h.svc.CreateGuide(c.Request.Context(), service.CreateGuideInput{
		Title:             body.Title,
		Role:              body.Role,
		Description:       body.Description,
		CoverImageURL:     body.CoverImageURL,
		YoutubeURL:        body.YoutubeURL,
		QualityKpiTarget:  body.QualityKpiTarget,
		QuantityKpiTarget: body.QuantityKpiTarget,
		PassThreshold:     body.PassThreshold,
		MaxAttempts:       body.MaxAttempts,
		Published:         body.Published,
		ResponsibleRoles:  body.ResponsibleRoles,
		CreatedBy:         staffID,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": guideToJSON(guide)})
}

// UpdateGuide handles PATCH /api/v1/admin/training/guides/:id
func (h *TrainingHandler) UpdateGuide(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Title             string   `json:"title"              binding:"required"`
		Role              string   `json:"role"               binding:"required"`
		Description       string   `json:"description"`
		CoverImageURL     string   `json:"coverImageUrl"`
		YoutubeURL        string   `json:"youtubeUrl"`
		QualityKpiTarget  string   `json:"qualityKpiTarget"`
		QuantityKpiTarget string   `json:"quantityKpiTarget"`
		PassThreshold     int32    `json:"passThreshold"`
		MaxAttempts       int32    `json:"maxAttempts"`
		Published         bool     `json:"published"`
		ResponsibleRoles  []string `json:"responsibleRoles"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	if body.PassThreshold == 0 {
		body.PassThreshold = 75
	}
	if body.MaxAttempts == 0 {
		body.MaxAttempts = 3
	}

	guide, err := h.svc.UpdateGuide(c.Request.Context(), service.UpdateGuideInput{
		ID:                id,
		Title:             body.Title,
		Role:              body.Role,
		Description:       body.Description,
		CoverImageURL:     body.CoverImageURL,
		YoutubeURL:        body.YoutubeURL,
		QualityKpiTarget:  body.QualityKpiTarget,
		QuantityKpiTarget: body.QuantityKpiTarget,
		PassThreshold:     body.PassThreshold,
		MaxAttempts:       body.MaxAttempts,
		Published:         body.Published,
		ResponsibleRoles:  body.ResponsibleRoles,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": guideToJSON(guide)})
}

// DeleteGuide handles DELETE /api/v1/admin/training/guides/:id
func (h *TrainingHandler) DeleteGuide(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteGuide(c.Request.Context(), id); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Đã xoá hướng dẫn đào tạo"})
}

// ListGuideProgress handles GET /api/v1/admin/training/guides/:id/progress
// Query: ?page=1&pageSize=10
func (h *TrainingHandler) ListGuideProgress(c *gin.Context) {
	guideID := c.Param("id")
	page, _ := strconv.ParseInt(c.DefaultQuery("page", "1"), 10, 32)
	pageSize, _ := strconv.ParseInt(c.DefaultQuery("pageSize", "10"), 10, 32)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	result, err := h.svc.ListGuideProgress(c.Request.Context(), guideID, int32(page), int32(pageSize))
	if err != nil {
		handleServiceError(c, err)
		return
	}
	rows := make([]gin.H, 0, len(result.Rows))
	for _, r := range result.Rows {
		rows = append(rows, progressRowToJSON(r))
	}
	c.JSON(http.StatusOK, gin.H{
		"data":     rows,
		"total":    result.Total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// GetStaffProgressDetail handles GET /api/v1/admin/training/staff/:staffId/progress/:guideId
func (h *TrainingHandler) GetStaffProgressDetail(c *gin.Context) {
	staffID := c.Param("staffId")
	guideID := c.Param("guideId")
	detail, err := h.svc.GetStaffProgressDetail(c.Request.Context(), staffID, guideID)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": progressDetailToJSON(detail)})
}

// UpdateManagerNotes handles PATCH /api/v1/admin/training/staff/:staffId/progress/:guideId
func (h *TrainingHandler) UpdateManagerNotes(c *gin.Context) {
	staffID := c.Param("staffId")
	guideID := c.Param("guideId")
	var body struct {
		ManagerNotes string `json:"managerNotes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}
	if err := h.svc.UpdateManagerNotes(c.Request.Context(), staffID, guideID, body.ManagerNotes); err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Đã cập nhật ghi chú quản lý"})
}

func guideToJSON(g service.GuideWithRoles) gin.H {
	return gin.H{
		"id":                g.ID,
		"title":             g.Title,
		"role":              string(g.Role),
		"description":       g.Description.String,
		"coverImageUrl":     g.CoverImageUrl.String,
		"youtubeUrl":        g.YoutubeUrl.String,
		"qualityKpiTarget":  g.QualityKpiTarget.String,
		"quantityKpiTarget": g.QuantityKpiTarget.String,
		"passThreshold":     g.PassThreshold,
		"maxAttempts":       g.MaxAttempts,
		"published":         g.Published,
		"responsibleRoles":  g.ResponsibleRoles,
		"createdAt":         g.CreatedAt,
		"updatedAt":         g.UpdatedAt,
	}
}

func progressRowToJSON(r service.ProgressRow) gin.H {
	return gin.H{
		"id":             r.ID,
		"guideId":        r.GuideID,
		"staffId":        r.StaffID,
		"staffName":      r.StaffName,
		"staffRole":      string(r.StaffRole),
		"watchedPercent": r.WatchedPercent,
		"quizPassed":     r.QuizPassed,
		"lastActivity":   r.UpdatedAt,
	}
}

func progressDetailToJSON(d service.StaffProgressDetail) gin.H {
	attempts := make([]gin.H, 0, len(d.QuizAttempts))
	for i, a := range d.QuizAttempts {
		attempts = append(attempts, gin.H{
			"attemptNumber": i + 1,
			"date":          a.AttemptedAt.Format("2006-01-02"),
			"score":         a.Score,
			"passed":        a.Passed,
		})
	}

	attemptsUsed := int32(len(d.QuizAttempts))
	attemptsRemaining := d.MaxAttempts - attemptsUsed
	if attemptsRemaining < 0 {
		attemptsRemaining = 0
	}

	var managerNotes string
	if d.ManagerNotes.Valid {
		managerNotes = d.ManagerNotes.String
	}

	return gin.H{
		"staffId":           d.StaffID,
		"guideId":           d.GuideID,
		"guideName":         d.GuideName,
		"watchedPercent":    d.WatchedPercent,
		"passThreshold":     d.PassThreshold,
		"maxAttempts":       d.MaxAttempts,
		"attemptsRemaining": attemptsRemaining,
		"managerNotes":      managerNotes,
		"quizAttempts":      attempts,
		"createdAt":         d.CreatedAt,
		"updatedAt":         d.UpdatedAt,
	}
}
