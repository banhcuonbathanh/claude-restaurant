// Package middleware provides Gin middleware for JWT auth and RBAC.
package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	jwtpkg "banhcuon/be/pkg/jwt"
)

// contextKey is typed to avoid collisions with other middleware.
type contextKey string

const (
	ContextKeyClaims  contextKey = "auth_claims"
	ContextKeyStaffID contextKey = "auth_staff_id"
	ContextKeyRole    contextKey = "auth_role"
)

// IsActiveChecker is implemented by AuthService.IsStaffActive.
// Middleware receives this interface so it can check is_active without importing the service package.
type IsActiveChecker interface {
	IsStaffActive(ctx context.Context, staffID string) (bool, error)
}

// AuthRequired validates the Bearer token and checks is_active (Spec1 §10, step 4.5).
// On success it sets claims in gin.Context. On failure it aborts with AUTH_001/ACCOUNT_DISABLED.
func AuthRequired(checker IsActiveChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw := extractBearer(c.GetHeader("Authorization"))
		if raw == "" {
			abortAuth(c, http.StatusUnauthorized, "AUTH_001", "Authorization header missing hoặc không hợp lệ")
			return
		}

		claims, err := jwtpkg.ParseToken(raw)
		if err != nil {
			switch {
			case errors.Is(err, jwtpkg.ErrTokenExpired):
				abortAuth(c, http.StatusUnauthorized, "AUTH_001", "Token đã hết hạn")
			default:
				abortAuth(c, http.StatusUnauthorized, "AUTH_001", "Token không hợp lệ")
			}
			return
		}

		// Step 4.5 — is_active check (Redis cache, DB fallback). Spec1 §10.
		// Guests (role="customer") are stateless JWTs with no DB record — skip check.
		if claims.Role != "customer" {
			active, isErr := checker.IsStaffActive(c.Request.Context(), claims.Subject)
			if isErr != nil || !active {
				abortAuth(c, http.StatusUnauthorized, "ACCOUNT_DISABLED", "Tài khoản đã bị vô hiệu hóa")
				return
			}
		}

		c.Set(string(ContextKeyClaims), claims)
		c.Set(string(ContextKeyStaffID), claims.Subject)
		c.Set(string(ContextKeyRole), claims.Role)
		c.Next()
	}
}

// ClaimsFromContext retrieves validated JWT claims set by AuthRequired.
// Panics if called on a route not protected by AuthRequired.
func ClaimsFromContext(c *gin.Context) *jwtpkg.Claims {
	v, exists := c.Get(string(ContextKeyClaims))
	if !exists {
		panic("middleware: ClaimsFromContext called without AuthRequired middleware")
	}
	return v.(*jwtpkg.Claims)
}

// StaffIDFromContext returns the authenticated staff ID.
func StaffIDFromContext(c *gin.Context) string {
	return c.GetString(string(ContextKeyStaffID))
}

// RoleFromContext returns the authenticated staff role.
func RoleFromContext(c *gin.Context) string {
	return c.GetString(string(ContextKeyRole))
}

// RefreshTokenFromCookie reads the raw refresh token from the httpOnly cookie.
func RefreshTokenFromCookie(c *gin.Context) (string, bool) {
	v, err := c.Cookie("refresh_token")
	if err != nil || v == "" {
		return "", false
	}
	return v, true
}

// SetRefreshCookie writes the refresh token as httpOnly, Secure, SameSite=Strict.
// Scoped to /api/v1/auth so it is not sent on every API call.
func SetRefreshCookie(c *gin.Context, rawToken string) {
	maxAge := int(jwtpkg.RefreshTTL() / time.Second)
	c.SetCookie("refresh_token", rawToken, maxAge, "/api/v1/auth", "", true, true)
}

// ClearRefreshCookie immediately expires the refresh_token cookie.
func ClearRefreshCookie(c *gin.Context) {
	c.SetCookie("refresh_token", "", -1, "/api/v1/auth", "", true, true)
}

func extractBearer(header string) string {
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	t := strings.TrimPrefix(header, "Bearer ")
	if t == "" {
		return ""
	}
	return t
}

func abortAuth(c *gin.Context, status int, code, message string) {
	c.AbortWithStatusJSON(status, gin.H{
		"error":   code,
		"message": message,
	})
}
