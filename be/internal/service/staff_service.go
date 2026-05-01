package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
	bcryptpkg "banhcuon/be/pkg/bcrypt"
)

// roleLevels must match middleware/rbac.go — single source of truth is there.
var roleLevels = map[string]int{
	"customer": 1,
	"chef":     2,
	"cashier":  2,
	"staff":    3,
	"manager":  4,
	"admin":    5,
}

var validStaffRoles = map[string]bool{
	"chef": true, "cashier": true, "staff": true, "manager": true, "admin": true,
}

var (
	ErrUsernameTaken             = NewAppError(http.StatusConflict, "USERNAME_TAKEN", "Tên đăng nhập đã tồn tại")
	ErrStaffNotFound             = NewAppError(http.StatusNotFound, "STAFF_NOT_FOUND", "Nhân viên không tồn tại")
	ErrSelfDeactivationForbidden = NewAppError(http.StatusForbidden, "SELF_DEACTIVATION_FORBIDDEN", "Không thể vô hiệu hóa tài khoản của chính mình")
	ErrInsufficientRole          = NewAppError(http.StatusForbidden, "INSUFFICIENT_ROLE", "Không đủ quyền để thay đổi tài khoản này")
	ErrLastAdmin                 = NewAppError(http.StatusConflict, "LAST_ADMIN", "Không thể xóa admin cuối cùng của hệ thống")
	ErrInvalidRole               = NewAppError(http.StatusBadRequest, "INVALID_ROLE", "Role không hợp lệ")
)

// StaffService handles staff management business logic.
type StaffService struct {
	repo repository.StaffRepository
	rdb  *redis.Client
}

// NewStaffService creates a StaffService.
func NewStaffService(repo repository.StaffRepository, rdb *redis.Client) *StaffService {
	return &StaffService{repo: repo, rdb: rdb}
}

// ListStaffResult is the paginated response from ListStaff.
type ListStaffResult struct {
	Staff []db.Staff
	Total int64
	Page  int
	Limit int
}

// ListStaff returns a paginated list of staff.
func (s *StaffService) ListStaff(ctx context.Context, role string, isActive *bool, search string, page, limit int) (ListStaffResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	staff, total, err := s.repo.ListStaff(ctx, repository.ListStaffFilter{
		Role: role, IsActive: isActive, Search: search, Page: page, Limit: limit,
	})
	if err != nil {
		return ListStaffResult{}, fmt.Errorf("staff: list: %w", err)
	}
	return ListStaffResult{Staff: staff, Total: total, Page: page, Limit: limit}, nil
}

// GetStaff returns a single staff by ID.
func (s *StaffService) GetStaff(ctx context.Context, id string) (db.Staff, error) {
	staff, err := s.repo.GetStaffByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Staff{}, ErrStaffNotFound
		}
		return db.Staff{}, fmt.Errorf("staff: get: %w", err)
	}
	return staff, nil
}

// CreateStaffInput holds data for creating a new staff account.
type CreateStaffInput struct {
	Username string
	Password string
	FullName string
	Role     string
	Phone    string
	Email    string
}

// CreateStaff creates a new staff account, enforcing hierarchy rules.
func (s *StaffService) CreateStaff(ctx context.Context, callerRole string, input CreateStaffInput) (db.Staff, error) {
	if !validStaffRoles[input.Role] {
		return db.Staff{}, ErrInvalidRole
	}
	callerLevel := roleLevels[callerRole]
	targetLevel := roleLevels[input.Role]
	if targetLevel >= callerLevel {
		return db.Staff{}, ErrInsufficientRole
	}

	_, err := s.repo.GetStaffByUsername(ctx, input.Username)
	if err == nil {
		return db.Staff{}, ErrUsernameTaken
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return db.Staff{}, fmt.Errorf("staff: check username: %w", err)
	}

	hash, err := bcryptpkg.Hash(input.Password)
	if err != nil {
		return db.Staff{}, fmt.Errorf("staff: hash password: %w", err)
	}

	created, err := s.repo.CreateStaff(ctx, repository.CreateStaffParams{
		ID:           uuid.NewString(),
		Username:     input.Username,
		PasswordHash: hash,
		FullName:     input.FullName,
		Role:         input.Role,
		Phone:        sql.NullString{String: input.Phone, Valid: input.Phone != ""},
		Email:        sql.NullString{String: input.Email, Valid: input.Email != ""},
	})
	if err != nil {
		return db.Staff{}, fmt.Errorf("staff: create: %w", err)
	}
	return created, nil
}

// UpdateStaffInput holds the optional fields that can be updated.
type UpdateStaffInput struct {
	FullName *string
	Role     *string
	Phone    *string
	Email    *string
}

// UpdateStaff updates a staff record. callerRole enforces hierarchy on role changes.
func (s *StaffService) UpdateStaff(ctx context.Context, callerRole, targetID string, input UpdateStaffInput) (db.Staff, error) {
	target, err := s.repo.GetStaffByID(ctx, targetID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Staff{}, ErrStaffNotFound
		}
		return db.Staff{}, fmt.Errorf("staff: get for update: %w", err)
	}

	if input.Role != nil {
		if !validStaffRoles[*input.Role] {
			return db.Staff{}, ErrInvalidRole
		}
		callerLevel := roleLevels[callerRole]
		currentLevel := roleLevels[string(target.Role)]
		newLevel := roleLevels[*input.Role]
		// Cannot update target whose current or new role >= caller's level
		if currentLevel >= callerLevel || newLevel >= callerLevel {
			return db.Staff{}, ErrInsufficientRole
		}
	}

	updated, err := s.repo.UpdateStaff(ctx, repository.UpdateStaffParams{
		ID:       targetID,
		FullName: input.FullName,
		Role:     input.Role,
		Phone:    input.Phone,
		Email:    input.Email,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Staff{}, ErrStaffNotFound
		}
		return db.Staff{}, fmt.Errorf("staff: update: %w", err)
	}
	return updated, nil
}

// SetStaffStatus activates or deactivates a staff account.
// Invalidates the Redis is_active cache immediately (Spec7 §5).
func (s *StaffService) SetStaffStatus(ctx context.Context, callerID, callerRole, targetID string, isActive bool) (db.Staff, error) {
	if callerID == targetID {
		return db.Staff{}, ErrSelfDeactivationForbidden
	}

	target, err := s.repo.GetStaffByID(ctx, targetID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Staff{}, ErrStaffNotFound
		}
		return db.Staff{}, fmt.Errorf("staff: get for status: %w", err)
	}

	callerLevel := roleLevels[callerRole]
	targetLevel := roleLevels[string(target.Role)]
	if targetLevel >= callerLevel {
		return db.Staff{}, ErrInsufficientRole
	}

	if err := s.repo.SetStaffActiveByID(ctx, targetID, isActive); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Staff{}, ErrStaffNotFound
		}
		return db.Staff{}, fmt.Errorf("staff: set status: %w", err)
	}

	// Invalidate Redis cache so middleware re-checks DB immediately (Spec7 §5).
	_ = s.rdb.Del(ctx, "is_active:"+targetID)

	return s.GetStaff(ctx, targetID)
}

// DeleteStaff soft-deletes a staff account (Admin only, not last admin).
func (s *StaffService) DeleteStaff(ctx context.Context, callerID, targetID string) error {
	if callerID == targetID {
		return ErrInsufficientRole
	}

	target, err := s.repo.GetStaffByID(ctx, targetID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrStaffNotFound
		}
		return fmt.Errorf("staff: get for delete: %w", err)
	}

	// Protect last admin
	if string(target.Role) == "admin" {
		count, err := s.repo.CountAdmins(ctx)
		if err != nil {
			return fmt.Errorf("staff: count admins: %w", err)
		}
		if count <= 1 {
			return ErrLastAdmin
		}
	}

	if err := s.repo.SoftDeleteStaff(ctx, targetID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrStaffNotFound
		}
		return fmt.Errorf("staff: delete: %w", err)
	}

	// Invalidate active cache and revoke sessions
	_ = s.rdb.Del(ctx, "is_active:"+targetID)
	return nil
}
