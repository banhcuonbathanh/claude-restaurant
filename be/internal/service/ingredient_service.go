package service

import (
	"context"
	"database/sql"
	"net/http"

	"github.com/google/uuid"

	"banhcuon/be/internal/repository"
)

var (
	ErrIngredientNotFound = NewAppError(http.StatusNotFound, "INGREDIENT_NOT_FOUND", "Nguyên liệu không tồn tại")
	ErrInvalidMovementType = NewAppError(http.StatusBadRequest, "INVALID_MOVEMENT_TYPE", "Loại nhập kho không hợp lệ: dùng 'in', 'out' hoặc 'adjustment'")
)

// IngredientService manages ingredient CRUD and stock movements.
type IngredientService struct {
	repo repository.IngredientRepository
}

// NewIngredientService creates an IngredientService.
func NewIngredientService(repo repository.IngredientRepository) *IngredientService {
	return &IngredientService{repo: repo}
}

// CreateIngredientInput holds validated input for creating an ingredient.
type CreateIngredientInput struct {
	Name         string
	Unit         string
	CurrentStock float64
	MinStock     float64
	CostPerUnit  int64
}

// UpdateIngredientInput holds optional update fields.
type UpdateIngredientInput struct {
	Name        *string
	Unit        *string
	MinStock    *float64
	CostPerUnit *int64
}

// CreateStockMovementInput holds input for recording a stock movement.
type CreateStockMovementInput struct {
	IngredientID string
	Type         string
	Quantity     float64
	Note         string
	CreatedBy    string
}

func (s *IngredientService) ListIngredients(ctx context.Context) ([]repository.Ingredient, error) {
	return s.repo.ListIngredients(ctx)
}

func (s *IngredientService) ListLowStock(ctx context.Context) ([]repository.Ingredient, error) {
	return s.repo.ListLowStock(ctx)
}

func (s *IngredientService) GetIngredient(ctx context.Context, id string) (repository.Ingredient, error) {
	ing, err := s.repo.GetIngredientByID(ctx, id)
	if err == sql.ErrNoRows {
		return repository.Ingredient{}, ErrIngredientNotFound
	}
	return ing, err
}

func (s *IngredientService) CreateIngredient(ctx context.Context, in CreateIngredientInput) (repository.Ingredient, error) {
	return s.repo.CreateIngredient(ctx, repository.CreateIngredientParams{
		ID:           uuid.New().String(),
		Name:         in.Name,
		Unit:         in.Unit,
		CurrentStock: in.CurrentStock,
		MinStock:     in.MinStock,
		CostPerUnit:  in.CostPerUnit,
	})
}

func (s *IngredientService) UpdateIngredient(ctx context.Context, id string, in UpdateIngredientInput) (repository.Ingredient, error) {
	if _, err := s.GetIngredient(ctx, id); err != nil {
		return repository.Ingredient{}, err
	}
	ing, err := s.repo.UpdateIngredient(ctx, repository.UpdateIngredientParams{
		ID:          id,
		Name:        in.Name,
		Unit:        in.Unit,
		MinStock:    in.MinStock,
		CostPerUnit: in.CostPerUnit,
	})
	if err == sql.ErrNoRows {
		return repository.Ingredient{}, ErrIngredientNotFound
	}
	return ing, err
}

func (s *IngredientService) DeleteIngredient(ctx context.Context, id string) error {
	if err := s.repo.SoftDeleteIngredient(ctx, id); err == sql.ErrNoRows {
		return ErrIngredientNotFound
	} else if err != nil {
		return err
	}
	return nil
}

func (s *IngredientService) CreateStockMovement(ctx context.Context, in CreateStockMovementInput) (repository.StockMovement, error) {
	if in.Type != "in" && in.Type != "out" && in.Type != "adjustment" {
		return repository.StockMovement{}, ErrInvalidMovementType
	}
	if _, err := s.GetIngredient(ctx, in.IngredientID); err != nil {
		return repository.StockMovement{}, err
	}
	return s.repo.CreateStockMovement(ctx, repository.CreateStockMovementParams{
		ID:           uuid.New().String(),
		IngredientID: in.IngredientID,
		Type:         in.Type,
		Quantity:     in.Quantity,
		Note:         sql.NullString{String: in.Note, Valid: in.Note != ""},
		CreatedBy:    sql.NullString{String: in.CreatedBy, Valid: in.CreatedBy != ""},
	})
}

func (s *IngredientService) ListStockMovements(ctx context.Context, ingredientID string) ([]repository.StockMovement, error) {
	return s.repo.ListStockMovements(ctx, ingredientID, 50)
}
