package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
	bcryptpkg "banhcuon/be/pkg/bcrypt"
	jwtpkg "banhcuon/be/pkg/jwt"
)

const (
	maxSessions     = 5
	rateLimitMax    = 5
	rateLimitWindow = 60 * time.Second
	isActiveTTL     = 5 * time.Minute
)

// AuthService handles authentication business logic.
type AuthService struct {
	repo repository.AuthRepository
	rdb  *redis.Client
}

// NewAuthService creates an AuthService.
func NewAuthService(repo repository.AuthRepository, rdb *redis.Client) *AuthService {
	return &AuthService{repo: repo, rdb: rdb}
}

// LoginResult holds the tokens issued after a successful login.
type LoginResult struct {
	AccessToken  string
	RefreshToken string // raw token — caller writes this to httpOnly cookie
	Staff        db.Staff
}

// Login authenticates a staff member by username and password.
//   - Enforces 5 req/min rate limit per IP (Redis INCR).
//   - Enforces max 5 concurrent sessions (deletes oldest if at limit).
//   - Returns ErrInvalidCredentials for wrong username OR wrong password (same error, no oracle).
func (s *AuthService) Login(ctx context.Context, username, password, ipAddr, userAgent string) (LoginResult, error) {
	// 1. Rate limit: 5 req/min per IP
	if err := s.checkLoginRateLimit(ctx, ipAddr); err != nil {
		return LoginResult{}, err
	}

	// 2. Fetch staff — use same error for not found vs wrong password (no oracle)
	staff, err := s.repo.GetStaffByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return LoginResult{}, ErrInvalidCredentials
		}
		return LoginResult{}, fmt.Errorf("auth: get staff: %w", err)
	}

	// 3. Verify password
	if err := bcryptpkg.Verify(staff.PasswordHash, password); err != nil {
		return LoginResult{}, ErrInvalidCredentials
	}

	// 4. Check is_active AFTER bcrypt (prevents timing oracle on disabled accounts)
	if !staff.IsActive {
		return LoginResult{}, ErrAccountDisabled
	}

	// 5. Issue access token
	accessToken, err := jwtpkg.GenerateAccessToken(staff.ID, string(staff.Role))
	if err != nil {
		return LoginResult{}, fmt.Errorf("auth: generate access token: %w", err)
	}

	// 6. Generate refresh token
	rawToken, tokenHash := newRefreshToken()

	// 7. Enforce max 5 sessions — delete oldest if at limit
	count, err := s.repo.CountActiveSessionsByStaff(ctx, staff.ID)
	if err != nil {
		return LoginResult{}, fmt.Errorf("auth: count sessions: %w", err)
	}
	if count >= maxSessions {
		if err := s.repo.DeleteOldestSessionByStaff(ctx, staff.ID); err != nil {
			slog.WarnContext(ctx, "auth: delete oldest session failed", "err", err)
		}
	}

	// 8. Persist refresh token in DB
	ua := sql.NullString{}
	if userAgent != "" {
		ua = sql.NullString{String: userAgent, Valid: true}
	}
	ip := sql.NullString{}
	if ipAddr != "" {
		ip = sql.NullString{String: ipAddr, Valid: true}
	}
	if err := s.repo.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
		ID:        newUUID(),
		StaffID:   staff.ID,
		TokenHash: tokenHash,
		UserAgent: ua,
		IpAddress: ip,
		ExpiresAt: time.Now().Add(jwtpkg.RefreshTTL()),
	}); err != nil {
		return LoginResult{}, fmt.Errorf("auth: create refresh token: %w", err)
	}

	// 9. Proactively cache is_active=active so first request after login hits cache
	s.setIsActiveCache(ctx, staff.ID, true)

	return LoginResult{
		AccessToken:  accessToken,
		RefreshToken: rawToken,
		Staff:        staff,
	}, nil
}

// Refresh issues a new access token given a valid raw refresh token from the httpOnly cookie.
func (s *AuthService) Refresh(ctx context.Context, rawToken string) (string, error) {
	tokenHash := hashToken(rawToken)

	rt, err := s.repo.GetRefreshToken(ctx, tokenHash)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrRefreshTokenInvalid
		}
		return "", fmt.Errorf("auth: get refresh token: %w", err)
	}

	staff, err := s.repo.GetStaffByID(ctx, rt.StaffID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrRefreshTokenInvalid
		}
		return "", fmt.Errorf("auth: get staff: %w", err)
	}

	if !staff.IsActive {
		return "", ErrAccountDisabled
	}

	if err := s.repo.UpdateRefreshTokenLastUsed(ctx, tokenHash); err != nil {
		slog.WarnContext(ctx, "auth: update refresh token last_used failed", "err", err)
	}

	accessToken, err := jwtpkg.GenerateAccessToken(staff.ID, string(staff.Role))
	if err != nil {
		return "", fmt.Errorf("auth: generate access token: %w", err)
	}

	return accessToken, nil
}

// Logout revokes the current session's refresh token.
// Does NOT revoke other active sessions (multi-token policy — Spec1 §9.1).
func (s *AuthService) Logout(ctx context.Context, rawToken, staffID string) error {
	tokenHash := hashToken(rawToken)
	if err := s.repo.DeleteRefreshToken(ctx, tokenHash); err != nil {
		return fmt.Errorf("auth: delete refresh token: %w", err)
	}
	// Clear is_active cache so next request re-checks DB
	s.delIsActiveCache(ctx, staffID)
	return nil
}

// GetMe returns staff info for the authenticated staff ID.
func (s *AuthService) GetMe(ctx context.Context, staffID string) (db.Staff, error) {
	staff, err := s.repo.GetStaffByID(ctx, staffID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Staff{}, ErrNotFound
		}
		return db.Staff{}, fmt.Errorf("auth: get staff: %w", err)
	}
	return staff, nil
}

// GuestLoginResult holds the guest JWT and the table the QR code belongs to.
type GuestLoginResult struct {
	AccessToken string
	ExpiresIn   int // seconds
	TableID     string
	TableName   string
	Capacity    int32
	TableStatus string
}

// GuestLogin validates a QR token and returns a short-lived guest JWT (2h, stateless).
func (s *AuthService) GuestLogin(ctx context.Context, qrToken string) (GuestLoginResult, error) {
	table, err := s.repo.GetTableByQRToken(ctx, qrToken)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return GuestLoginResult{}, ErrNotFound
		}
		return GuestLoginResult{}, fmt.Errorf("auth: get table by qr token: %w", err)
	}

	accessToken, err := jwtpkg.GenerateGuestToken(table.ID)
	if err != nil {
		return GuestLoginResult{}, fmt.Errorf("auth: generate guest token: %w", err)
	}

	return GuestLoginResult{
		AccessToken: accessToken,
		ExpiresIn:   7200,
		TableID:     table.ID,
		TableName:   table.Name,
		Capacity:    table.Capacity,
		TableStatus: string(table.Status),
	}, nil
}

// DeactivateStaff sets is_active=false and immediately clears the Redis is_active cache.
// This ensures the staff is blocked within the same request cycle (no 5-min TTL lag).
func (s *AuthService) DeactivateStaff(ctx context.Context, staffID string) error {
	if err := s.repo.SetStaffActive(ctx, false, staffID); err != nil {
		return fmt.Errorf("auth: set staff inactive: %w", err)
	}
	s.delIsActiveCache(ctx, staffID)
	return nil
}

// ReactivateStaff sets is_active=true and clears the cached disabled status.
func (s *AuthService) ReactivateStaff(ctx context.Context, staffID string) error {
	if err := s.repo.SetStaffActive(ctx, true, staffID); err != nil {
		return fmt.Errorf("auth: set staff active: %w", err)
	}
	s.delIsActiveCache(ctx, staffID)
	return nil
}

// checkLoginRateLimit enforces max 5 login attempts per IP per 60 seconds.
func (s *AuthService) checkLoginRateLimit(ctx context.Context, ipAddr string) error {
	if ipAddr == "" {
		return nil
	}
	key := fmt.Sprintf("ratelimit:login:%s", ipAddr)
	count, err := s.rdb.Incr(ctx, key).Result()
	if err != nil {
		// Redis unavailable → allow login (fail open for rate limiting)
		slog.WarnContext(ctx, "auth: rate limit Redis error, allowing request", "err", err)
		return nil
	}
	if count == 1 {
		// First increment — set TTL so the window expires
		s.rdb.Expire(ctx, key, rateLimitWindow)
	}
	if count > rateLimitMax {
		return ErrRateLimitExceeded
	}
	return nil
}

func (s *AuthService) setIsActiveCache(ctx context.Context, staffID string, active bool) {
	val := "disabled"
	if active {
		val = "active"
	}
	key := fmt.Sprintf("auth:staff:%s", staffID)
	if err := s.rdb.Set(ctx, key, val, isActiveTTL).Err(); err != nil {
		slog.WarnContext(ctx, "auth: set is_active cache failed", "err", err)
	}
}

func (s *AuthService) delIsActiveCache(ctx context.Context, staffID string) {
	key := fmt.Sprintf("auth:staff:%s", staffID)
	if err := s.rdb.Del(ctx, key).Err(); err != nil {
		slog.WarnContext(ctx, "auth: del is_active cache failed", "err", err)
	}
}

// newRefreshToken generates a cryptographically random raw token and its SHA-256 hash.
// raw is sent to the client (httpOnly cookie); hash is stored in the DB.
func newRefreshToken() (raw, hash string) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic("auth: crypto/rand read failed: " + err.Error())
	}
	raw = base64.RawURLEncoding.EncodeToString(b)
	hash = hashToken(raw)
	return
}

func hashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}

// NewPublicUUID is the exported alias for use by handler/other packages.
func NewPublicUUID() string { return newUUID() }

// NewRandomBytes returns n cryptographically random bytes.
func NewRandomBytes(n int) []byte {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		panic("service: crypto/rand read failed: " + err.Error())
	}
	return b
}

// newUUID generates a UUID v4 string using crypto/rand.
func newUUID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic("auth: crypto/rand read failed: " + err.Error())
	}
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant bits
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
