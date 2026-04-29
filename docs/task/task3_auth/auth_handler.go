// internal/handler/auth_handler.go
// HTTP handlers for auth endpoints:
//   POST /api/v1/auth/login
//   POST /api/v1/auth/refresh
//   POST /api/v1/auth/logout
//   GET  /api/v1/auth/me
//
// Ref: MASTER.docx §5, §7 — API endpoints + error codes.
// Ref: MASTER.docx §6.3  — FE Interceptor Pattern (cookie + bearer token flow).
package handler

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
	jwtpkg "banhcuon/be/pkg/jwt"
)

// authServiceIface is the subset of AuthService used by AuthHandler.
// Defined as interface for testability.
type authServiceIface interface {
	Login(ctx context.Context, input service.LoginInput) (*service.LoginOutput, error)
	Refresh(ctx context.Context, rawRefreshToken string) (*service.RefreshOutput, error)
	Logout(ctx context.Context, rawRefreshToken string, claims *jwtpkg.Claims) error
	Me(ctx context.Context, staffID string) (*service.StaffSummary, error)
}

// AuthHandler holds auth HTTP handlers.
type AuthHandler struct {
	svc authServiceIface
}

func NewAuthHandler(svc authServiceIface) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// RegisterRoutes wires all auth routes onto the provided RouterGroup.
// Call this from main.go after building the handler.
//
//	v1 := r.Group("/api/v1")
//	authHandler.RegisterRoutes(v1, authMiddleware)
func (h *AuthHandler) RegisterRoutes(v1 *gin.RouterGroup, authRequired gin.HandlerFunc) {
	auth := v1.Group("/auth")
	{
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.Refresh)
		auth.POST("/logout", authRequired, h.Logout)
		auth.GET("/me", authRequired, h.Me)
	}
}

// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────

type loginRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=8,max=100"`
}

type loginResponse struct {
	AccessToken string              `json:"access_token"`
	Staff       staffSummaryJSON    `json:"staff"`
}

type staffSummaryJSON struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	FullName string `json:"full_name"`
}

// Login godoc
// POST /api/v1/auth/login
// Body: { username, password }
// Response: { access_token, staff } + httpOnly refresh_token cookie.
//
// SECURITY:
//   - access_token in JSON body → FE stores in Zustand (NOT localStorage)
//   - refresh_token in httpOnly cookie → not accessible from JS (XSS safe)
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "COMMON_001", "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	out, err := h.svc.Login(c.Request.Context(), service.LoginInput{
		Username:  req.Username,
		Password:  req.Password,
		UserAgent: c.GetHeader("User-Agent"),
		IPAddress: c.ClientIP(),
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}

	// Set refresh token as httpOnly Secure cookie — never in JSON response.
	middleware.SetRefreshCookie(c, out.RefreshToken)

	c.JSON(http.StatusOK, loginResponse{
		AccessToken: out.AccessToken,
		Staff: staffSummaryJSON{
			ID:       out.Staff.ID,
			Username: out.Staff.Username,
			Role:     out.Staff.Role,
			FullName: out.Staff.FullName,
		},
	})
}

// ─── POST /api/v1/auth/refresh ───────────────────────────────────────────────

type refreshResponse struct {
	AccessToken string `json:"access_token"`
}

// Refresh godoc
// POST /api/v1/auth/refresh
// Reads refresh_token from httpOnly cookie.
// Response: { access_token }.
// FE Interceptor calls this automatically on 401 — no user interaction needed.
func (h *AuthHandler) Refresh(c *gin.Context) {
	rawToken, ok := middleware.RefreshTokenFromCookie(c)
	if !ok {
		respondError(c, http.StatusUnauthorized, "AUTH_002", "Refresh token không tìm thấy")
		return
	}

	out, err := h.svc.Refresh(c.Request.Context(), rawToken)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, refreshResponse{AccessToken: out.AccessToken})
}

// ─── POST /api/v1/auth/logout ────────────────────────────────────────────────

// Logout godoc
// POST /api/v1/auth/logout
// Requires: Authorization: Bearer <access_token>
// Revokes current session (DB row delete + JTI Redis blacklist).
// Clears refresh_token cookie.
func (h *AuthHandler) Logout(c *gin.Context) {
	claims := middleware.ClaimsFromContext(c) // set by AuthRequired middleware

	rawToken, ok := middleware.RefreshTokenFromCookie(c)
	if !ok {
		// Access token is present (AuthRequired passed) but no refresh cookie.
		// This can happen if cookie expired but access token is still valid.
		// Still blacklist the JTI to invalidate the access token.
		rawToken = "" // service handles empty rawToken gracefully
	}

	if err := h.svc.Logout(c.Request.Context(), rawToken, claims); err != nil {
		// Non-fatal for UX — clear cookie regardless and return success.
		// The JTI blacklist is the security guarantee; cookie clear is UX.
		c.Error(err) // log via Gin error handler
	}

	middleware.ClearRefreshCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "Đăng xuất thành công"})
}

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────

type meResponse struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	FullName string `json:"full_name"`
}

// Me godoc
// GET /api/v1/auth/me
// Requires: Authorization: Bearer <access_token>
// Returns the current staff profile. Loads fresh from DB (not just from claims)
// to reflect any role/status changes since the token was issued.
func (h *AuthHandler) Me(c *gin.Context) {
	staffID := middleware.StaffIDFromContext(c)

	staff, err := h.svc.Me(c.Request.Context(), staffID)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, meResponse{
		ID:       staff.ID,
		Username: staff.Username,
		Role:     staff.Role,
		FullName: staff.FullName,
	})
}

// ─── Error helpers ────────────────────────────────────────────────────────────

// handleServiceError maps service.AppError to HTTP responses.
// Falls back to 500 for untyped errors — never exposes internal detail.
func handleServiceError(c *gin.Context, err error) {
	var appErr *service.AppError
	if errors.As(err, &appErr) {
		respondError(c, appErr.Status, appErr.Code, appErr.Message)
		return
	}
	// Unexpected error — log internally, return generic 500.
	c.Error(err) // picked up by Gin error logger
	respondError(c, http.StatusInternalServerError, "COMMON_002", "Lỗi máy chủ nội bộ")
}

// respondError writes a standardised error JSON.
// Ref: MASTER.docx §7 — Error Response Format: { code, message }.
func respondError(c *gin.Context, status int, code, message string) {
	c.AbortWithStatusJSON(status, gin.H{
		"code":    code,
		"message": message,
	})
}
