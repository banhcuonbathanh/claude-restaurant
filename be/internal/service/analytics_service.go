package service

import (
	"context"

	"banhcuon/be/internal/repository"
)

// AnalyticsService provides business logic for dashboard aggregation.
type AnalyticsService struct {
	repo repository.AnalyticsRepository
}

// NewAnalyticsService creates an AnalyticsService.
func NewAnalyticsService(repo repository.AnalyticsRepository) *AnalyticsService {
	return &AnalyticsService{repo: repo}
}

func validRange(r string) string {
	switch r {
	case "week", "month":
		return r
	default:
		return "today"
	}
}

func (s *AnalyticsService) GetSummary(ctx context.Context, rangeParam string) (repository.SummaryResult, error) {
	return s.repo.GetSummary(ctx, validRange(rangeParam))
}

func (s *AnalyticsService) GetTopDishes(ctx context.Context, limit int, rangeParam string) ([]repository.TopDishRow, error) {
	return s.repo.GetTopDishes(ctx, limit, validRange(rangeParam))
}

func (s *AnalyticsService) GetStaffPerformance(ctx context.Context, rangeParam string) ([]repository.StaffPerfRow, error) {
	return s.repo.GetStaffPerformance(ctx, validRange(rangeParam))
}
