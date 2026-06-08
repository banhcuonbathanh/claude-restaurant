package service

// auth_extra_test.go — additional auth service test cases
// Run with: cd be && go test ./internal/service/... -run TestAuth -v

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"banhcuon/be/internal/db"
)

// TestLogin_InactiveAccount verifies that a disabled account returns ErrAccountDisabled
// even when the password is correct — an inactive staff must not obtain tokens (Spec1 §4.3 AC-10).
func TestLogin_InactiveAccount(t *testing.T) {
	repo := &mockAuthRepo{
		getByUsernameFn: func(_ context.Context, _ string) (db.Staff, error) {
			return db.Staff{
				ID:           "staff-inactive-1",
				Username:     "chef",
				PasswordHash: mustHashPassword("correct"),
				Role:         db.StaffRoleChef,
				IsActive:     false, // <-- disabled
			}, nil
		},
	}
	svc := newTestAuthService(repo, newMockRedis())

	_, err := svc.Login(context.Background(), "chef", "correct", "1.2.3.4", "")
	if !errors.Is(err, ErrAccountDisabled) {
		t.Fatalf("expected ErrAccountDisabled for inactive account, got %v", err)
	}
}

// TestLogin_UsernameNotFound verifies that a non-existent username returns
// ErrInvalidCredentials — not ErrNotFound — so callers cannot enumerate usernames.
func TestLogin_UsernameNotFound(t *testing.T) {
	repo := &mockAuthRepo{
		getByUsernameFn: func(_ context.Context, _ string) (db.Staff, error) {
			return db.Staff{}, sql.ErrNoRows // simulate no row
		},
	}
	svc := newTestAuthService(repo, newMockRedis())

	_, err := svc.Login(context.Background(), "nobody", "pw", "1.2.3.4", "")
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials for unknown username, got %v", err)
	}
}

// TestLogin_RateLimitResetPerIP verifies that the rate limit counter is per-IP:
// maxing out one IP does not block a different IP (Spec1 §4.1).
func TestLogin_RateLimitResetPerIP(t *testing.T) {
	repo := &mockAuthRepo{} // always returns sql.ErrNoRows → ErrInvalidCredentials
	rdb := newMockRedis()
	svc := newTestAuthService(repo, rdb)
	ctx := context.Background()

	// Exhaust rate limit on ip-A (6 attempts: 5 fails + 1 blocked).
	for i := 1; i <= 5; i++ {
		svc.Login(ctx, "admin", "pw", "ip-A", "") //nolint:errcheck
	}
	_, err := svc.Login(ctx, "admin", "pw", "ip-A", "")
	if !errors.Is(err, ErrRateLimitExceeded) {
		t.Fatalf("ip-A: expected rate limit on 6th attempt, got %v", err)
	}

	// A completely different IP must NOT be rate-limited.
	_, err = svc.Login(ctx, "admin", "pw", "ip-B", "")
	if errors.Is(err, ErrRateLimitExceeded) {
		t.Fatal("ip-B must not be rate-limited because of ip-A's failures")
	}
}

// TestDeactivateStaff_RefreshFails verifies that after DeactivateStaff the staff's
// refresh token is rejected — IsStaffActive returns false, so Refresh returns ErrAccountDisabled.
func TestDeactivateStaff_RefreshFails(t *testing.T) {
	store := newTokenStore()
	isActive := true
	staffID := "staff-deact-refresh"

	staff := db.Staff{
		ID:           staffID,
		Username:     "cashier2",
		PasswordHash: mustHashPassword("pass"),
		Role:         db.StaffRoleCashier,
		IsActive:     true,
	}
	repo := &mockAuthRepo{
		getByUsernameFn: func(_ context.Context, _ string) (db.Staff, error) { return staff, nil },
		getByIDFn: func(_ context.Context, _ string) (db.Staff, error) {
			return db.Staff{ID: staffID, IsActive: isActive}, nil
		},
		createRefreshTokenFn: store.create,
		getRefreshTokenFn:    store.get,
		setStaffActiveFn: func(_ context.Context, active bool, _ string) error {
			isActive = active
			return nil
		},
	}
	rdb := newMockRedis()
	svc := newTestAuthService(repo, rdb)
	ctx := context.Background()

	// Login → get refresh token.
	result, err := svc.Login(ctx, "cashier2", "pass", "1.2.3.4", "agent")
	if err != nil {
		t.Fatalf("login failed: %v", err)
	}

	// Deactivate the account.
	if err := svc.DeactivateStaff(ctx, staffID); err != nil {
		t.Fatalf("DeactivateStaff failed: %v", err)
	}

	// Refresh must now fail with ErrAccountDisabled.
	_, err = svc.Refresh(ctx, result.RefreshToken)
	if !errors.Is(err, ErrAccountDisabled) {
		t.Fatalf("expected ErrAccountDisabled after deactivation, got %v", err)
	}
}

// TestLogin_EmptyIPBypassesRateLimit verifies that an empty IP string skips
// rate-limit enforcement — fail-open behaviour documented in auth_service.go §346.
func TestLogin_EmptyIPBypassesRateLimit(t *testing.T) {
	repo := &mockAuthRepo{} // returns sql.ErrNoRows → ErrInvalidCredentials every time
	rdb := newMockRedis()
	svc := newTestAuthService(repo, rdb)
	ctx := context.Background()

	// Fire 10 attempts with empty IP — none should be rate-limited.
	for i := 1; i <= 10; i++ {
		_, err := svc.Login(ctx, "admin", "pw", "" /* empty IP */, "")
		if errors.Is(err, ErrRateLimitExceeded) {
			t.Fatalf("attempt %d: empty IP must not be rate-limited, got ErrRateLimitExceeded", i)
		}
	}
}
