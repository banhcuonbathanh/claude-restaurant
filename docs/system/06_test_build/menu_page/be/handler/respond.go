// P-SYSTEST reference build — mirrors be/internal/handler/respond.go pattern (ERROR_SPEC.md §1/§3).
// Not compiled into the app.
package handler

import "github.com/gin-gonic/gin"

// Success responses: {"data": ...} — no "success" field.
func respondJSON(c *gin.Context, status int, payload any) {
	c.JSON(status, payload)
}

// Error responses, without exception: {"error": CODE, "message": vi-VN, "details"?: {...}}.
// Never expose stack traces, DB error strings, or internal struct names.
func respondError(c *gin.Context, status int, code, message string, details ...gin.H) {
	body := gin.H{"error": code, "message": message}
	if len(details) > 0 {
		body["details"] = details[0]
	}
	c.JSON(status, body)
}
