package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/service"
)

// respondError writes a standardised error JSON per ERROR_CONTRACT_v1.1.
// Format: {"error": "CODE", "message": "...", "details": {...}} — details is optional.
func respondError(c *gin.Context, status int, code, message string, details ...any) {
	body := gin.H{"error": code, "message": message}
	if len(details) > 0 && details[0] != nil {
		body["details"] = details[0]
	}
	c.AbortWithStatusJSON(status, body)
}

// handleServiceError maps service.AppError to HTTP responses.
// Falls back to 500 for untyped errors — never exposes internal detail.
func handleServiceError(c *gin.Context, err error) {
	var appErr *service.AppError
	if errors.As(err, &appErr) {
		respondError(c, appErr.Status, appErr.Code, appErr.Message)
		return
	}
	c.Error(err)
	respondError(c, http.StatusInternalServerError, "COMMON_002", "Lỗi máy chủ nội bộ")
}
