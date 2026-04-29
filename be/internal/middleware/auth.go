// Package middleware provides Gin middleware for JWT auth and RBAC.
package middleware

import (
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

// AuthRequired validates the Bearer token in the Authorization header.
// On success it sets claims in gin.Context. On failure it aborts with AUTH_001.
func AuthRequired() gin.HandlerFunc {
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
