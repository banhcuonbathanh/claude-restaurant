package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
)

// AuthHandler handles all /auth/* endpoints.
type AuthHandler struct {
	svc *service.AuthService
}

// NewAuthHandler creates an AuthHandler.
func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

type loginRequest struct {
	Username string `json:"username" binding:"required,min=3"`
	Password string `json:"password" binding:"required,min=8"`
}

// Login handles POST /auth/login.
// Sets httpOnly refresh cookie; returns access_token + user object.
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}

	ctx := c.Request.Context()
	result, err := h.svc.Login(ctx, req.Username, req.Password, c.ClientIP(), c.GetHeader("User-Agent"))
	if err != nil {
		handleServiceError(c, err)
		return
	}

	middleware.SetRefreshCookie(c, result.RefreshToken)

	email := ""
	if result.Staff.Email.Valid {
		email = result.Staff.Email.String
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token": result.AccessToken,
			"user": gin.H{
				"id":        result.Staff.ID,
				"username":  result.Staff.Username,
				"full_name": result.Staff.FullName,
				"role":      string(result.Staff.Role),
				"email":     email,
			},
		},
	})
}

// Refresh handles POST /auth/refresh.
// Reads refresh token from httpOnly cookie and issues a new access token.
func (h *AuthHandler) Refresh(c *gin.Context) {
	raw, ok := middleware.RefreshTokenFromCookie(c)
	if !ok {
		respondError(c, http.StatusUnauthorized, "REFRESH_TOKEN_INVALID", "Refresh token không hợp lệ hoặc đã hết hạn")
		return
	}

	accessToken, err := h.svc.Refresh(c.Request.Context(), raw)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{"access_token": accessToken},
	})
}

// Logout handles POST /auth/logout.
// Revokes only the current session's refresh token (multi-device policy).
func (h *AuthHandler) Logout(c *gin.Context) {
	raw, ok := middleware.RefreshTokenFromCookie(c)
	if !ok {
		// No cookie — treat as already logged out; still clear cookie.
		middleware.ClearRefreshCookie(c)
		c.Status(http.StatusNoContent)
		return
	}

	staffID := middleware.StaffIDFromContext(c)
	if err := h.svc.Logout(c.Request.Context(), raw, staffID); err != nil {
		handleServiceError(c, err)
		return
	}

	middleware.ClearRefreshCookie(c)
	c.Status(http.StatusNoContent)
}

// Me handles GET /auth/me.
// Returns profile of the authenticated staff member.
func (h *AuthHandler) Me(c *gin.Context) {
	staffID := middleware.StaffIDFromContext(c)
	staff, err := h.svc.GetMe(c.Request.Context(), staffID)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	email := ""
	if staff.Email.Valid {
		email = staff.Email.String
	}
	phone := ""
	if staff.Phone.Valid {
		phone = staff.Phone.String
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":        staff.ID,
			"username":  staff.Username,
			"full_name": staff.FullName,
			"role":      string(staff.Role),
			"email":     email,
			"phone":     phone,
			"is_active": staff.IsActive,
		},
	})
}

type guestRequest struct {
	QRToken string `json:"qr_token" binding:"required,len=64"`
}

// Guest handles POST /auth/guest.
// Validates a QR token and returns a stateless 2h guest JWT with table info.
func (h *AuthHandler) Guest(c *gin.Context) {
	var req guestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "qr_token không hợp lệ (yêu cầu 64 ký tự)")
		return
	}

	result, err := h.svc.GuestLogin(c.Request.Context(), req.QRToken)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token": result.AccessToken,
			"expires_in":   result.ExpiresIn,
			"table": gin.H{
				"id":       result.TableID,
				"name":     result.TableName,
				"capacity": result.Capacity,
				"status":   result.TableStatus,
			},
		},
	})
}
