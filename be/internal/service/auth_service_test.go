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
	getByUsernameFn func(ctx context.Context, username string) (db.Staff, error)
	getByIDFn       func(ctx context.Context, id string) (db.Staff, error)
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

func (m *mockAuthRepo) CreateRefreshToken(_ context.Context, _ db.CreateRefreshTokenParams) error {
	return nil
}
func (m *mockAuthRepo) GetRefreshToken(_ context.Context, _ string) (db.RefreshToken, error) {
	return db.RefreshToken{}, sql.ErrNoRows
}
func (m *mockAuthRepo) DeleteRefreshToken(_ context.Context, _ string) error        { return nil }
func (m *mockAuthRepo) DeleteRefreshTokensByStaff(_ context.Context, _ string) error { return nil }
func (m *mockAuthRepo) SetStaffActive(_ context.Context, _ bool, _ string) error    { return nil }
func (m *mockAuthRepo) ListActiveSessionsByStaff(_ context.Context, _ string) ([]db.RefreshToken, error) {
	return nil, nil
}
func (m *mockAuthRepo) CountActiveSessionsByStaff(_ context.Context, _ string) (int64, error) {
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
