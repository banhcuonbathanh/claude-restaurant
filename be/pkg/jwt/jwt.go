// Package jwt provides access token generation and validation.
// SECURITY: always verify t.Method == jwt.SigningMethodHMAC before parsing
// to prevent algorithm confusion attacks.
package jwt

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	gojwt "github.com/golang-jwt/jwt/v5"
)

var (
	ErrTokenExpired = errors.New("token expired")
	ErrTokenInvalid = errors.New("token invalid")
)

// Claims extends RegisteredClaims with staff-specific fields.
type Claims struct {
	gojwt.RegisteredClaims
	Role string `json:"role"`
}

// AccessTTL reads JWT_ACCESS_TTL env (seconds), defaults to 86400 (24h).
func AccessTTL() time.Duration {
	if s := os.Getenv("JWT_ACCESS_TTL"); s != "" {
		if n, err := strconv.Atoi(s); err == nil {
			return time.Duration(n) * time.Second
		}
	}
	return 24 * time.Hour
}

// RefreshTTL reads JWT_REFRESH_TTL env (seconds), defaults to 2592000 (30d).
func RefreshTTL() time.Duration {
	if s := os.Getenv("JWT_REFRESH_TTL"); s != "" {
		if n, err := strconv.Atoi(s); err == nil {
			return time.Duration(n) * time.Second
		}
	}
	return 30 * 24 * time.Hour
}

// GenerateAccessToken creates a signed JWT for the given staff.
func GenerateAccessToken(staffID, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", fmt.Errorf("jwt: JWT_SECRET env not set")
	}

	now := time.Now()
	claims := Claims{
		RegisteredClaims: gojwt.RegisteredClaims{
			Subject:   staffID,
			IssuedAt:  gojwt.NewNumericDate(now),
			ExpiresAt: gojwt.NewNumericDate(now.Add(AccessTTL())),
		},
		Role: role,
	}

	token := gojwt.NewWithClaims(gojwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseToken validates the token string and returns claims.
// Returns ErrTokenExpired or ErrTokenInvalid on failure.
func ParseToken(tokenStr string) (*Claims, error) {
	secret := os.Getenv("JWT_SECRET")

	token, err := gojwt.ParseWithClaims(tokenStr, &Claims{}, func(t *gojwt.Token) (any, error) {
		// Prevent algorithm confusion: reject non-HMAC signing methods.
		if _, ok := t.Method.(*gojwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		if errors.Is(err, gojwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrTokenInvalid
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrTokenInvalid
	}
	return claims, nil
}
