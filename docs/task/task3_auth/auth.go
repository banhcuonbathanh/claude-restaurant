// internal/middleware/auth.go
// JWT authentication middleware for Gin.
// Extracts Bearer token → validates signature + expiry + Redis blacklist →
// sets staff claims in gin.Context for downstream handlers.
// Ref: MASTER.docx §6.3 — FE Interceptor Pattern (BE mirror).
// Ref: MASTER.docx §7   — AUTH_001 error code.
package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	jwtpkg "banhcuon/be/pkg/jwt"
	"banhcuon/be/internal/service"
)

// Context keys — typed to avoid collisions with other middleware.
type contextKey string

const (
	ContextKeyClaims  contextKey = "auth_claims"
	ContextKeyStaffID contextKey = "auth_staff_id"
	ContextKeyRole    contextKey = "auth_role"
)

// tokenValidator is the subset of AuthService used by middleware.
// Defined as interface so middleware can be unit-tested without a real Redis.
type tokenValidator interface {
	ValidateAccessToken(ctx context.Context, token string) (*jwtpkg.Claims, error)
}

// AuthRequired validates the Bearer token in Authorization header.
// On success, sets claims into gin.Context. On failure, aborts with AUTH_001.
//
// Usage:
//
//	r.GET("/api/v1/auth/me", middleware.AuthRequired(authSvc), handler.Me)
func AuthRequired(svc tokenValidator) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw := extractBearer(c.GetHeader("Authorization"))
		if raw == "" {
			abortAuth(c, http.StatusUnauthorized, "AUTH_001", "Authorization header missing hoặc không hợp lệ")
			return
		}

		claims, err := svc.ValidateAccessToken(c.Request.Context(), raw)
		if err != nil {
			switch err {
			case service.ErrTokenExpired:
				abortAuth(c, http.StatusUnauthorized, "AUTH_001", "Token đã hết hạn")
			case service.ErrTokenRevoked:
				abortAuth(c, http.StatusUnauthorized, "AUTH_001", "Token đã bị thu hồi")
			default:
				abortAuth(c, http.StatusUnauthorized, "AUTH_001", "Token không hợp lệ")
			}
			return
		}

		// Inject into gin.Context so handlers + RBAC middleware can read without re-parsing.
		c.Set(string(ContextKeyClaims), claims)
		c.Set(string(ContextKeyStaffID), claims.Subject)
		c.Set(string(ContextKeyRole), claims.Role)
		c.Next()
	}
}

// ClaimsFromContext retrieves the validated JWT claims set by AuthRequired.
// Panics if called on a route not protected by AuthRequired — intentional,
// as this is a programmer error, not a runtime error.
func ClaimsFromContext(c *gin.Context) *jwtpkg.Claims {
	v, exists := c.Get(string(ContextKeyClaims))
	if !exists {
		panic("middleware.ClaimsFromContext: no claims in context — route must use AuthRequired middleware")
	}
	return v.(*jwtpkg.Claims)
}

// StaffIDFromContext returns the authenticated staff ID string.
func StaffIDFromContext(c *gin.Context) string {
	return c.GetString(string(ContextKeyStaffID))
}

// RoleFromContext returns the authenticated staff role string.
func RoleFromContext(c *gin.Context) string {
	return c.GetString(string(ContextKeyRole))
}

// RefreshTokenFromCookie reads the raw refresh token from the httpOnly cookie.
// Cookie name: refresh_token.
func RefreshTokenFromCookie(c *gin.Context) (string, bool) {
	v, err := c.Cookie("refresh_token")
	if err != nil || v == "" {
		return "", false
	}
	return v, true
}

// SetRefreshCookie writes the refresh token as httpOnly, Secure, SameSite=Strict.
// TTL matches JWT_REFRESH_TTL (30d).
func SetRefreshCookie(c *gin.Context, rawToken string) {
	maxAge := int(jwtpkg.RefreshTTL() / time.Second)
	c.SetCookie(
		"refresh_token",
		rawToken,
		maxAge,
		"/api/v1/auth",  // Scoped to auth endpoints only — not sent on every API call.
		"",              // Domain: empty = current host.
		true,            // Secure: HTTPS only.
		true,            // HttpOnly: not accessible from JS.
	)
}

// ClearRefreshCookie expires the refresh_token cookie immediately.
func ClearRefreshCookie(c *gin.Context) {
	c.SetCookie("refresh_token", "", -1, "/api/v1/auth", "", true, true)
}

// extractBearer parses "Bearer <token>" and returns the token string.
func extractBearer(header string) string {
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	token := strings.TrimPrefix(header, "Bearer ")
	if token == "" {
		return ""
	}
	return token
}

// abortAuth halts the request with a standardised error JSON.
// Ref: MASTER.docx §7 — Error Response Format: {code, message}.
func abortAuth(c *gin.Context, status int, code, message string) {
	c.AbortWithStatusJSON(status, gin.H{
		"code":    code,
		"message": message,
	})
}
