package service

import (
	"context"
	"database/sql"
	"net/http"

	"github.com/google/uuid"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

var (
	ErrTrainingGuideNotFound    = NewAppError(http.StatusNotFound, "TRAINING_GUIDE_NOT_FOUND", "Không tìm thấy hướng dẫn đào tạo")
	ErrTrainingProgressNotFound = NewAppError(http.StatusNotFound, "TRAINING_PROGRESS_NOT_FOUND", "Không tìm thấy tiến trình đào tạo")
	ErrInvalidTrainingRole      = NewAppError(http.StatusBadRequest, "INVALID_TRAINING_ROLE", "Vai trò không hợp lệ: dùng chef, cashier, staff, hoặc manager")
)

// TrainingService manages training guide CRUD and progress tracking.
type TrainingService struct {
	repo repository.TrainingRepository
}

func NewTrainingService(repo repository.TrainingRepository) *TrainingService {
	return &TrainingService{repo: repo}
}

// CreateGuideInput holds validated input for creating a guide.
type CreateGuideInput struct {
	Title             string
	Role              string
	Description       string
	CoverImageURL     string
	YoutubeURL        string
	QualityKpiTarget  string
	QuantityKpiTarget string
	PassThreshold     int32
	MaxAttempts       int32
	Published         bool
	ResponsibleRoles  []string
	CreatedBy         string
}

// UpdateGuideInput holds validated input for updating a guide.
type UpdateGuideInput struct {
	ID                string
	Title             string
	Role              string
	Description       string
	CoverImageURL     string
	YoutubeURL        string
	QualityKpiTarget  string
	QuantityKpiTarget string
	PassThreshold     int32
	MaxAttempts       int32
	Published         bool
	ResponsibleRoles  []string
}

// GuideWithRoles combines a guide row with its responsible roles.
type GuideWithRoles struct {
	db.TrainingGuide
	ResponsibleRoles []string
}

// ProgressRow combines the joined progress row with quiz summary.
type ProgressRow struct {
	db.ListGuideProgressRow
	QuizPassed *bool
}

// StaffProgressDetail holds the full detail for Modal 2.
type StaffProgressDetail struct {
	db.TrainingProgress
	StaffName     string
	StaffRole     string
	GuideName     string
	PassThreshold int32
	MaxAttempts   int32
	QuizAttempts  []db.QuizAttempt
}

func toNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

func toRole(s string) (db.TrainingGuidesRole, error) {
	switch s {
	case "chef":
		return db.TrainingGuidesRoleChef, nil
	case "cashier":
		return db.TrainingGuidesRoleCashier, nil
	case "staff":
		return db.TrainingGuidesRoleStaff, nil
	case "manager":
		return db.TrainingGuidesRoleManager, nil
	}
	return "", ErrInvalidTrainingRole
}

func toResponsibleRole(s string) (db.TrainingGuideRolesRole, error) {
	switch s {
	case "chef":
		return db.TrainingGuideRolesRoleChef, nil
	case "cashier":
		return db.TrainingGuideRolesRoleCashier, nil
	case "staff":
		return db.TrainingGuideRolesRoleStaff, nil
	case "manager":
		return db.TrainingGuideRolesRoleManager, nil
	}
	return "", ErrInvalidTrainingRole
}

func (s *TrainingService) ListGuides(ctx context.Context, roleFilter string) ([]GuideWithRoles, error) {
	var guides []db.TrainingGuide
	var err error
	if roleFilter != "" && roleFilter != "all" {
		r, rerr := toRole(roleFilter)
		if rerr != nil {
			return nil, rerr
		}
		guides, err = s.repo.ListGuidesByRole(ctx, r)
	} else {
		guides, err = s.repo.ListGuides(ctx)
	}
	if err != nil {
		return nil, err
	}

	result := make([]GuideWithRoles, 0, len(guides))
	for _, g := range guides {
		roles, rerr := s.repo.GetGuideRoles(ctx, g.ID)
		if rerr != nil {
			return nil, rerr
		}
		strs := make([]string, len(roles))
		for i, r := range roles {
			strs[i] = string(r)
		}
		result = append(result, GuideWithRoles{TrainingGuide: g, ResponsibleRoles: strs})
	}
	return result, nil
}

func (s *TrainingService) GetGuide(ctx context.Context, id string) (GuideWithRoles, error) {
	g, err := s.repo.GetGuide(ctx, id)
	if err == sql.ErrNoRows {
		return GuideWithRoles{}, ErrTrainingGuideNotFound
	}
	if err != nil {
		return GuideWithRoles{}, err
	}
	roles, err := s.repo.GetGuideRoles(ctx, g.ID)
	if err != nil {
		return GuideWithRoles{}, err
	}
	strs := make([]string, len(roles))
	for i, r := range roles {
		strs[i] = string(r)
	}
	return GuideWithRoles{TrainingGuide: g, ResponsibleRoles: strs}, nil
}

func (s *TrainingService) CreateGuide(ctx context.Context, in CreateGuideInput) (GuideWithRoles, error) {
	role, err := toRole(in.Role)
	if err != nil {
		return GuideWithRoles{}, err
	}
	id := uuid.New().String()
	arg := db.CreateTrainingGuideParams{
		ID:                id,
		Title:             in.Title,
		Role:              role,
		Description:       toNullString(in.Description),
		CoverImageUrl:     toNullString(in.CoverImageURL),
		YoutubeUrl:        toNullString(in.YoutubeURL),
		QualityKpiTarget:  toNullString(in.QualityKpiTarget),
		QuantityKpiTarget: toNullString(in.QuantityKpiTarget),
		PassThreshold:     in.PassThreshold,
		MaxAttempts:       in.MaxAttempts,
		Published:         in.Published,
		CreatedBy:         toNullString(in.CreatedBy),
	}
	if err := s.repo.CreateGuide(ctx, arg); err != nil {
		return GuideWithRoles{}, err
	}
	if err := s.setGuideRoles(ctx, id, in.ResponsibleRoles); err != nil {
		return GuideWithRoles{}, err
	}
	return s.GetGuide(ctx, id)
}

func (s *TrainingService) UpdateGuide(ctx context.Context, in UpdateGuideInput) (GuideWithRoles, error) {
	if _, err := s.repo.GetGuide(ctx, in.ID); err == sql.ErrNoRows {
		return GuideWithRoles{}, ErrTrainingGuideNotFound
	} else if err != nil {
		return GuideWithRoles{}, err
	}
	role, err := toRole(in.Role)
	if err != nil {
		return GuideWithRoles{}, err
	}
	arg := db.UpdateTrainingGuideParams{
		ID:                in.ID,
		Title:             in.Title,
		Role:              role,
		Description:       toNullString(in.Description),
		CoverImageUrl:     toNullString(in.CoverImageURL),
		YoutubeUrl:        toNullString(in.YoutubeURL),
		QualityKpiTarget:  toNullString(in.QualityKpiTarget),
		QuantityKpiTarget: toNullString(in.QuantityKpiTarget),
		PassThreshold:     in.PassThreshold,
		MaxAttempts:       in.MaxAttempts,
		Published:         in.Published,
	}
	if err := s.repo.UpdateGuide(ctx, arg); err != nil {
		return GuideWithRoles{}, err
	}
	if in.ResponsibleRoles != nil {
		if err := s.setGuideRoles(ctx, in.ID, in.ResponsibleRoles); err != nil {
			return GuideWithRoles{}, err
		}
	}
	return s.GetGuide(ctx, in.ID)
}

func (s *TrainingService) DeleteGuide(ctx context.Context, id string) error {
	if _, err := s.repo.GetGuide(ctx, id); err == sql.ErrNoRows {
		return ErrTrainingGuideNotFound
	} else if err != nil {
		return err
	}
	return s.repo.SoftDeleteGuide(ctx, id)
}

func (s *TrainingService) setGuideRoles(ctx context.Context, guideID string, roles []string) error {
	if err := s.repo.DeleteGuideRoles(ctx, guideID); err != nil {
		return err
	}
	for _, r := range roles {
		role, err := toResponsibleRole(r)
		if err != nil {
			return err
		}
		if err := s.repo.InsertGuideRole(ctx, guideID, role); err != nil {
			return err
		}
	}
	return nil
}

type ListProgressResult struct {
	Rows  []ProgressRow
	Total int64
}

func (s *TrainingService) ListGuideProgress(ctx context.Context, guideID string, page, pageSize int32) (ListProgressResult, error) {
	if _, err := s.repo.GetGuide(ctx, guideID); err == sql.ErrNoRows {
		return ListProgressResult{}, ErrTrainingGuideNotFound
	} else if err != nil {
		return ListProgressResult{}, err
	}
	offset := (page - 1) * pageSize
	rows, err := s.repo.ListGuideProgress(ctx, guideID, pageSize, offset)
	if err != nil {
		return ListProgressResult{}, err
	}
	total, err := s.repo.CountGuideProgress(ctx, guideID)
	if err != nil {
		return ListProgressResult{}, err
	}

	result := make([]ProgressRow, 0, len(rows))
	for _, row := range rows {
		attempts, aerr := s.repo.ListQuizAttempts(ctx, row.ID)
		if aerr != nil {
			return ListProgressResult{}, aerr
		}
		var quizPassed *bool
		for _, a := range attempts {
			if a.Passed {
				t := true
				quizPassed = &t
				break
			}
		}
		if quizPassed == nil && len(attempts) > 0 {
			f := false
			quizPassed = &f
		}
		result = append(result, ProgressRow{ListGuideProgressRow: row, QuizPassed: quizPassed})
	}
	return ListProgressResult{Rows: result, Total: total}, nil
}

func (s *TrainingService) GetStaffProgressDetail(ctx context.Context, staffID, guideID string) (StaffProgressDetail, error) {
	guide, err := s.repo.GetGuide(ctx, guideID)
	if err == sql.ErrNoRows {
		return StaffProgressDetail{}, ErrTrainingGuideNotFound
	}
	if err != nil {
		return StaffProgressDetail{}, err
	}

	progress, err := s.repo.GetStaffProgress(ctx, guideID, staffID)
	if err == sql.ErrNoRows {
		return StaffProgressDetail{}, ErrTrainingProgressNotFound
	}
	if err != nil {
		return StaffProgressDetail{}, err
	}

	attempts, err := s.repo.ListQuizAttempts(ctx, progress.ID)
	if err != nil {
		return StaffProgressDetail{}, err
	}

	return StaffProgressDetail{
		TrainingProgress: progress,
		GuideName:        guide.Title,
		PassThreshold:    guide.PassThreshold,
		MaxAttempts:      guide.MaxAttempts,
		QuizAttempts:     attempts,
	}, nil
}

func (s *TrainingService) UpdateManagerNotes(ctx context.Context, staffID, guideID, notes string) error {
	if _, err := s.repo.GetStaffProgress(ctx, guideID, staffID); err == sql.ErrNoRows {
		return ErrTrainingProgressNotFound
	} else if err != nil {
		return err
	}
	return s.repo.UpdateManagerNotes(ctx, toNullString(notes), guideID, staffID)
}
