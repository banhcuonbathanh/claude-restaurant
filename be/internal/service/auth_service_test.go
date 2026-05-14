package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
	bcryptpkg "banhcuon/be/pkg/bcrypt"
)

func TestMain(m *testing.M) {
	os.Setenv("JWT_SECRET", "test-secret-key-for-unit-tests")
	os.Exit(m.Run())
}

// ─── mockRedis ────────────────────────────────────────────────────────────────

type mockRedis struct {
	mu   sync.Mutex
	ints map[string]int64
	strs map[string]string
}

func newMockRedis() *mockRedis {
	return &mockRedis{
		ints: make(map[string]int64),
		strs: make(map[string]string),
	}
}

func (m *mockRedis) Incr(ctx context.Context, key string) *redis.IntCmd {
	m.mu.Lock()
	m.ints[key]++
	n := m.ints[key]
	m.mu.Unlock()
	cmd := redis.NewIntCmd(ctx, "incr", key)
	cmd.SetVal(n)
	return cmd
}

func (m *mockRedis) Expire(ctx context.Context, key string, expiration time.Duration) *redis.BoolCmd {
	cmd := redis.NewBoolCmd(ctx, "expire", key, expiration)
	cmd.SetVal(true)
	return cmd
}

func (m *mockRedis) Get(ctx context.Context, key string) *redis.StringCmd {
	m.mu.Lock()
	v, ok := m.strs[key]
	m.mu.Unlock()
	cmd := redis.NewStringCmd(ctx, "get", key)
	if !ok {
		cmd.SetErr(redis.Nil)
	} else {
		cmd.SetVal(v)
	}
	return cmd
}

func (m *mockRedis) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.StatusCmd {
	m.mu.Lock()
	m.strs[key] = fmt.Sprintf("%v", value)
	m.mu.Unlock()
	cmd := redis.NewStatusCmd(ctx, "set", key, value)
	cmd.SetVal("OK")
	return cmd
}

func (m *mockRedis) Del(ctx context.Context, keys ...string) *redis.IntCmd {
	m.mu.Lock()
	for _, k := range keys {
		delete(m.strs, k)
		delete(m.ints, k)
	}
	n := int64(len(keys))
	m.mu.Unlock()
	cmd := redis.NewIntCmd(ctx, "del")
	cmd.SetVal(n)
	return cmd
}

// compile-time interface check
var _ redisClient = (*mockRedis)(nil)

// ─── mockAuthRepo ─────────────────────────────────────────────────────────────

type mockAuthRepo struct {
	getByUsernameFn       func(ctx context.Context, username string) (db.Staff, error)
	getByIDFn             func(ctx context.Context, id string) (db.Staff, error)
	createRefreshTokenFn  func(ctx context.Context, arg db.CreateRefreshTokenParams) error
	getRefreshTokenFn     func(ctx context.Context, tokenHash string) (db.RefreshToken, error)
	deleteRefreshTokenFn  func(ctx context.Context, tokenHash string) error
	countActiveSessionsFn func(ctx context.Context, staffID string) (int64, error)
}

func (m *mockAuthRepo) GetStaffByUsername(ctx context.Context, username string) (db.Staff, error) {
	if m.getByUsernameFn != nil {
		return m.getByUsernameFn(ctx, username)
	}
	return db.Staff{}, sql.ErrNoRows
}

func (m *mockAuthRepo) GetStaffByID(ctx context.Context, id string) (db.Staff, error) {
	if m.getByIDFn != nil {
		return m.getByIDFn(ctx, id)
	}
	return db.Staff{}, sql.ErrNoRows
}

func (m *mockAuthRepo) CreateRefreshToken(ctx context.Context, arg db.CreateRefreshTokenParams) error {
	if m.createRefreshTokenFn != nil {
		return m.createRefreshTokenFn(ctx, arg)
	}
	return nil
}
func (m *mockAuthRepo) GetRefreshToken(ctx context.Context, tokenHash string) (db.RefreshToken, error) {
	if m.getRefreshTokenFn != nil {
		return m.getRefreshTokenFn(ctx, tokenHash)
	}
	return db.RefreshToken{}, sql.ErrNoRows
}
func (m *mockAuthRepo) DeleteRefreshToken(ctx context.Context, tokenHash string) error {
	if m.deleteRefreshTokenFn != nil {
		return m.deleteRefreshTokenFn(ctx, tokenHash)
	}
	return nil
}
func (m *mockAuthRepo) DeleteRefreshTokensByStaff(_ context.Context, _ string) error { return nil }
func (m *mockAuthRepo) SetStaffActive(_ context.Context, _ bool, _ string) error    { return nil }
func (m *mockAuthRepo) ListActiveSessionsByStaff(_ context.Context, _ string) ([]db.RefreshToken, error) {
	return nil, nil
}
func (m *mockAuthRepo) CountActiveSessionsByStaff(ctx context.Context, staffID string) (int64, error) {
	if m.countActiveSessionsFn != nil {
		return m.countActiveSessionsFn(ctx, staffID)
	}
	return 0, nil
}
func (m *mockAuthRepo) DeleteOldestSessionByStaff(_ context.Context, _ string) error { return nil }
func (m *mockAuthRepo) UpdateRefreshTokenLastUsed(_ context.Context, _ string) error { return nil }
func (m *mockAuthRepo) GetTableByQRToken(_ context.Context, _ string) (db.Table, error) {
	return db.Table{}, sql.ErrNoRows
}

// compile-time interface check
var _ repository.AuthRepository = (*mockAuthRepo)(nil)

// ─── helpers ──────────────────────────────────────────────────────────────────

func newTestAuthService(repo repository.AuthRepository, rdb *mockRedis) *AuthService {
	return &AuthService{repo: repo, rdb: rdb}
}

// mustHashPassword panics if bcrypt fails — only for test setup.
func mustHashPassword(plain string) string {
	h, err := bcryptpkg.Hash(plain)
	if err != nil {
		panic("test setup: bcrypt.Hash: " + err.Error())
	}
	return h
}

// ─── Tests ────────────────────────────────────────────────────────────────────

func TestLogin_WrongPassword(t *testing.T) {
	repo := &mockAuthRepo{
		getByUsernameFn: func(_ context.Context, _ string) (db.Staff, error) {
			return db.Staff{
				ID:           "staff-uuid-1",
				Username:     "admin",
				PasswordHash: mustHashPassword("correct"),
				Role:         db.StaffRoleAdmin,
				IsActive:     true,
			}, nil
		},
	}
	svc := newTestAuthService(repo, newMockRedis())

	_, err := svc.Login(context.Background(), "admin", "wrong", "1.2.3.4", "")
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials, got %v", err)
	}
}

func TestLogin_RateLimitAfter5Fails(t *testing.T) {
	// GetStaffByUsername returns not-found so each attempt exits quickly after the rate-limit check.
	repo := &mockAuthRepo{}
	rdb := newMockRedis()
	svc := newTestAuthService(repo, rdb)

	ctx := context.Background()
	ip := "10.0.0.1"

	// Attempts 1–5: rate limit passes, credential check fails.
	for i := 1; i <= 5; i++ {
		_, err := svc.Login(ctx, "admin", "pw", ip, "")
		if !errors.Is(err, ErrInvalidCredentials) {
			t.Fatalf("attempt %d: expected ErrInvalidCredentials, got %v", i, err)
		}
	}

	// Attempt 6: rate limit should trip.
	_, err := svc.Login(ctx, "admin", "pw", ip, "")
	if !errors.Is(err, ErrRateLimitExceeded) {
		t.Fatalf("attempt 6: expected ErrRateLimitExceeded, got %v", err)
	}
}

// tokenStore is a concurrency-safe in-memory refresh token store for tests.
type tokenStore struct {
	mu     sync.Mutex
	tokens map[string]db.RefreshToken // keyed by token_hash
}

func newTokenStore() *tokenStore {
	return &tokenStore{tokens: make(map[string]db.RefreshToken)}
}

func (s *tokenStore) create(_ context.Context, arg db.CreateRefreshTokenParams) error {
	s.mu.Lock()
	s.tokens[arg.TokenHash] = db.RefreshToken{
		ID:        arg.ID,
		StaffID:   arg.StaffID,
		TokenHash: arg.TokenHash,
		UserAgent: arg.UserAgent,
		IpAddress: arg.IpAddress,
		ExpiresAt: arg.ExpiresAt,
		CreatedAt: time.Now(),
	}
	s.mu.Unlock()
	return nil
}

func (s *tokenStore) get(_ context.Context, hash string) (db.RefreshToken, error) {
	s.mu.Lock()
	rt, ok := s.tokens[hash]
	s.mu.Unlock()
	if !ok {
		return db.RefreshToken{}, sql.ErrNoRows
	}
	return rt, nil
}

func (s *tokenStore) del(_ context.Context, hash string) error {
	s.mu.Lock()
	delete(s.tokens, hash)
	s.mu.Unlock()
	return nil
}

// TestMultiSessionLogin verifies that two concurrent sessions get distinct refresh tokens
// and that both tokens remain independently valid for /auth/refresh (Spec1 §4.2).
func TestMultiSessionLogin(t *testing.T) {
	store := newTokenStore()
	staff := db.Staff{
		ID:           "staff-uuid-ms",
		Username:     "admin",
		PasswordHash: mustHashPassword("secret"),
		Role:         db.StaffRoleAdmin,
		IsActive:     true,
	}
	repo := &mockAuthRepo{
		getByUsernameFn:      func(_ context.Context, _ string) (db.Staff, error) { return staff, nil },
		getByIDFn:            func(_ context.Context, _ string) (db.Staff, error) { return staff, nil },
		createRefreshTokenFn: store.create,
		getRefreshTokenFn:    store.get,
	}
	svc := newTestAuthService(repo, newMockRedis())
	ctx := context.Background()

	r1, err := svc.Login(ctx, "admin", "secret", "192.168.1.1", "client-A")
	if err != nil {
		t.Fatalf("login 1 failed: %v", err)
	}
	r2, err := svc.Login(ctx, "admin", "secret", "192.168.1.2", "client-B")
	if err != nil {
		t.Fatalf("login 2 failed: %v", err)
	}

	if r1.RefreshToken == r2.RefreshToken {
		t.Fatal("expected distinct refresh tokens for two sessions")
	}

	at1, err := svc.Refresh(ctx, r1.RefreshToken)
	if err != nil {
		t.Fatalf("refresh session 1 failed: %v", err)
	}
	if at1 == "" {
		t.Fatal("expected non-empty access token from session 1 refresh")
	}

	at2, err := svc.Refresh(ctx, r2.RefreshToken)
	if err != nil {
		t.Fatalf("refresh session 2 failed: %v", err)
	}
	if at2 == "" {
		t.Fatal("expected non-empty access token from session 2 refresh")
	}
}

// TestLogoutSingleSession verifies that logging out one session revokes only that token
// while the other session's refresh token remains valid (Spec1 §4.2).
func TestLogoutSingleSession(t *testing.T) {
	store := newTokenStore()
	staff := db.Staff{
		ID:           "staff-uuid-ls",
		Username:     "cashier",
		PasswordHash: mustHashPassword("pass123"),
		Role:         db.StaffRoleCashier,
		IsActive:     true,
	}
	repo := &mockAuthRepo{
		getByUsernameFn:      func(_ context.Context, _ string) (db.Staff, error) { return staff, nil },
		getByIDFn:            func(_ context.Context, _ string) (db.Staff, error) { return staff, nil },
		createRefreshTokenFn: store.create,
		getRefreshTokenFn:    store.get,
		deleteRefreshTokenFn: store.del,
	}
	svc := newTestAuthService(repo, newMockRedis())
	ctx := context.Background()

	r1, err := svc.Login(ctx, "cashier", "pass123", "10.0.0.1", "client-X")
	if err != nil {
		t.Fatalf("login 1 failed: %v", err)
	}
	r2, err := svc.Login(ctx, "cashier", "pass123", "10.0.0.2", "client-Y")
	if err != nil {
		t.Fatalf("login 2 failed: %v", err)
	}

	if err := svc.Logout(ctx, r1.RefreshToken, staff.ID); err != nil {
		t.Fatalf("logout session 1 failed: %v", err)
	}

	// Session 1 token must now be invalid.
	if _, err := svc.Refresh(ctx, r1.RefreshToken); !errors.Is(err, ErrRefreshTokenInvalid) {
		t.Fatalf("after logout: expected ErrRefreshTokenInvalid for session 1, got %v", err)
	}

	// Session 2 must remain valid.
	at2, err := svc.Refresh(ctx, r2.RefreshToken)
	if err != nil {
		t.Fatalf("session 2 still active after session 1 logout, expected success, got %v", err)
	}
	if at2 == "" {
		t.Fatal("expected non-empty access token from session 2 after session 1 logout")
	}
}
