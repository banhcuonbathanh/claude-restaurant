package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

const productCacheTTL = 5 * time.Minute

// cache keys
const (
	cacheKeyProductsList = "products:list"
	cacheKeyTopping      = "toppings:list"
	cacheKeyCombos       = "combos:list"
	cacheKeyCategories   = "categories:list"
)

// ProductDetails is the enriched product view for API responses.
type ProductDetails struct {
	ID           string
	Name         string
	Description  string
	Price        int64
	ImagePath    string
	IsAvailable  bool
	SortOrder    int32
	CategoryID   string
	CategoryName string
	Toppings     []ToppingItem
}

// ToppingItem is the topping view embedded in product responses.
type ToppingItem struct {
	ID    string
	Name  string
	Price int64
}

// ComboDetails is the enriched combo view for API responses.
type ComboDetails struct {
	ID          string
	Name        string
	Description string
	Price       int64
	ImagePath   string
	IsAvailable bool
	SortOrder   int32
	CategoryID  string
	Items       []ComboItemDetails
}

// ComboItemDetails is one item inside a combo.
type ComboItemDetails struct {
	ID        string
	ProductID string
	Quantity  int32
}

// ProductService handles product/category/topping/combo business logic.
type ProductService struct {
	repo repository.ProductRepository
	rdb  *redis.Client
}

// NewProductService creates a ProductService.
func NewProductService(repo repository.ProductRepository, rdb *redis.Client) *ProductService {
	return &ProductService{repo: repo, rdb: rdb}
}

// ─── ProductLookup interface (used by OrderService) ──────────────────────────

// GetProductSnapshot returns a minimal product snapshot for order-item creation.
// Implements service.ProductLookup.
func (s *ProductService) GetProductSnapshot(ctx context.Context, productID string) (ProductSnapshot, error) {
	p, err := s.repo.GetProductByID(ctx, productID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ProductSnapshot{}, ErrNotFound
		}
		return ProductSnapshot{}, fmt.Errorf("product: get by id: %w", err)
	}
	if !p.IsAvailable {
		return ProductSnapshot{}, ErrNotFound
	}
	return ProductSnapshot{
		ID:        p.ID,
		Name:      p.Name,
		UnitPrice: parsePrice(p.Price),
	}, nil
}

// GetComboSnapshot returns a combo snapshot for order-item creation.
// Implements service.ProductLookup.
func (s *ProductService) GetComboSnapshot(ctx context.Context, comboID string) (ComboSnapshot, error) {
	combo, err := s.repo.GetComboByID(ctx, comboID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ComboSnapshot{}, ErrNotFound
		}
		return ComboSnapshot{}, fmt.Errorf("product: get combo: %w", err)
	}
	if !combo.IsAvailable {
		return ComboSnapshot{}, ErrNotFound
	}

	items, err := s.repo.GetComboItems(ctx, comboID)
	if err != nil {
		return ComboSnapshot{}, fmt.Errorf("product: get combo items: %w", err)
	}

	templates := make([]ComboItemTemplate, 0, len(items))
	for _, item := range items {
		p, err := s.repo.GetProductByID(ctx, item.ProductID)
		if err != nil {
			return ComboSnapshot{}, fmt.Errorf("product: combo item product %s: %w", item.ProductID, err)
		}
		templates = append(templates, ComboItemTemplate{
			ProductID: item.ProductID,
			Name:      p.Name,
			UnitPrice: parsePrice(p.Price),
			Quantity:  int(item.Quantity),
		})
	}

	return ComboSnapshot{
		ID:    combo.ID,
		Name:  combo.Name,
		Price: parsePrice(combo.Price),
		Items: templates,
	}, nil
}

// ─── Product CRUD ─────────────────────────────────────────────────────────────

// ListProducts returns all products (with category + toppings) from cache or DB.
func (s *ProductService) ListProducts(ctx context.Context) ([]ProductDetails, error) {
	// Try cache
	if cached := s.getCacheJSON(ctx, cacheKeyProductsList); cached != "" {
		var result []ProductDetails
		if err := json.Unmarshal([]byte(cached), &result); err == nil {
			return result, nil
		}
	}

	products, err := s.repo.ListProducts(ctx)
	if err != nil {
		return nil, fmt.Errorf("product: list: %w", err)
	}

	cats, err := s.buildCategoryMap(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]ProductDetails, 0, len(products))
	for _, p := range products {
		toppings, _ := s.repo.GetToppingsByProductID(ctx, p.ID)
		result = append(result, s.enrichProduct(p, cats, toppings))
	}

	s.setCacheJSON(ctx, cacheKeyProductsList, result)
	return result, nil
}

// GetProduct returns a single enriched product.
func (s *ProductService) GetProduct(ctx context.Context, id string) (ProductDetails, error) {
	cacheKey := fmt.Sprintf("product:%s", id)
	if cached := s.getCacheJSON(ctx, cacheKey); cached != "" {
		var d ProductDetails
		if err := json.Unmarshal([]byte(cached), &d); err == nil {
			return d, nil
		}
	}

	p, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ProductDetails{}, ErrNotFound
		}
		return ProductDetails{}, fmt.Errorf("product: get: %w", err)
	}

	cats, _ := s.buildCategoryMap(ctx)
	toppings, _ := s.repo.GetToppingsByProductID(ctx, id)
	d := s.enrichProduct(p, cats, toppings)
	s.setCacheJSON(ctx, cacheKey, d)
	return d, nil
}

// CreateProductInput holds validated fields for product creation.
type CreateProductInput struct {
	Name        string
	Price       int64
	CategoryID  string
	Description string
	ImagePath   string
	ToppingIDs  []string
	IsAvailable bool
	SortOrder   int32
}

// CreateProduct creates a product and attaches toppings.
func (s *ProductService) CreateProduct(ctx context.Context, in CreateProductInput) (string, error) {
	id := newUUID()
	desc := sql.NullString{}
	if in.Description != "" {
		desc = sql.NullString{String: in.Description, Valid: true}
	}
	imgPath := sql.NullString{}
	if in.ImagePath != "" {
		imgPath = sql.NullString{String: in.ImagePath, Valid: true}
	}

	if err := s.repo.CreateProduct(ctx, db.CreateProductParams{
		ID:          id,
		CategoryID:  in.CategoryID,
		Name:        in.Name,
		Description: desc,
		Price:       formatPrice(in.Price),
		ImagePath:   imgPath,
		SortOrder:   in.SortOrder,
	}); err != nil {
		return "", fmt.Errorf("product: create: %w", err)
	}

	for _, tid := range in.ToppingIDs {
		_ = s.repo.AttachToppingToProduct(ctx, id, tid)
	}

	s.invalidateProductCaches(ctx, id)
	return id, nil
}

// UpdateProductInput holds validated fields for product update.
type UpdateProductInput struct {
	Name        string
	Price       int64
	CategoryID  string
	Description string
	ImagePath   string
	ToppingIDs  *[]string // nil = don't change
	SortOrder   int32
}

// UpdateProduct updates a product and optionally replaces its toppings.
func (s *ProductService) UpdateProduct(ctx context.Context, id string, in UpdateProductInput) error {
	if _, err := s.repo.GetProductByID(ctx, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("product: get for update: %w", err)
	}

	desc := sql.NullString{}
	if in.Description != "" {
		desc = sql.NullString{String: in.Description, Valid: true}
	}
	imgPath := sql.NullString{}
	if in.ImagePath != "" {
		imgPath = sql.NullString{String: in.ImagePath, Valid: true}
	}

	if err := s.repo.UpdateProduct(ctx, db.UpdateProductParams{
		CategoryID:  in.CategoryID,
		Name:        in.Name,
		Description: desc,
		Price:       formatPrice(in.Price),
		ImagePath:   imgPath,
		SortOrder:   in.SortOrder,
		ID:          id,
	}); err != nil {
		return fmt.Errorf("product: update: %w", err)
	}

	if in.ToppingIDs != nil {
		_ = s.repo.ClearProductToppings(ctx, id)
		for _, tid := range *in.ToppingIDs {
			_ = s.repo.AttachToppingToProduct(ctx, id, tid)
		}
	}

	s.invalidateProductCaches(ctx, id)
	return nil
}

// DeleteProduct soft-deletes a product.
func (s *ProductService) DeleteProduct(ctx context.Context, id string) error {
	if err := s.repo.SoftDeleteProduct(ctx, id); err != nil {
		return fmt.Errorf("product: delete: %w", err)
	}
	s.invalidateProductCaches(ctx, id)
	return nil
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

// ListCategories returns all active categories (cached).
func (s *ProductService) ListCategories(ctx context.Context) ([]db.Category, error) {
	if cached := s.getCacheJSON(ctx, cacheKeyCategories); cached != "" {
		var result []db.Category
		if err := json.Unmarshal([]byte(cached), &result); err == nil {
			return result, nil
		}
	}
	cats, err := s.repo.ListCategories(ctx)
	if err != nil {
		return nil, fmt.Errorf("category: list: %w", err)
	}
	s.setCacheJSON(ctx, cacheKeyCategories, cats)
	return cats, nil
}

type CreateCategoryInput struct {
	Name        string
	Description string
	SortOrder   int32
}

func (s *ProductService) CreateCategory(ctx context.Context, in CreateCategoryInput) (string, error) {
	id := newUUID()
	desc := sql.NullString{}
	if in.Description != "" {
		desc = sql.NullString{String: in.Description, Valid: true}
	}
	if err := s.repo.CreateCategory(ctx, id, in.Name, desc, in.SortOrder); err != nil {
		return "", fmt.Errorf("category: create: %w", err)
	}
	s.invalidateProductCaches(ctx, "")
	return id, nil
}

type UpdateCategoryInput struct {
	Name        string
	Description string
	SortOrder   int32
}

func (s *ProductService) UpdateCategory(ctx context.Context, id string, in UpdateCategoryInput) error {
	if _, err := s.repo.GetCategoryByID(ctx, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("category: get for update: %w", err)
	}
	desc := sql.NullString{}
	if in.Description != "" {
		desc = sql.NullString{String: in.Description, Valid: true}
	}
	if err := s.repo.UpdateCategory(ctx, in.Name, desc, in.SortOrder, id); err != nil {
		return fmt.Errorf("category: update: %w", err)
	}
	s.invalidateProductCaches(ctx, "")
	return nil
}

func (s *ProductService) DeleteCategory(ctx context.Context, id string) error {
	if err := s.repo.SoftDeleteCategory(ctx, id); err != nil {
		return fmt.Errorf("category: delete: %w", err)
	}
	s.invalidateProductCaches(ctx, "")
	return nil
}

// ─── Topping CRUD ─────────────────────────────────────────────────────────────

// ListToppings returns all toppings (cached).
func (s *ProductService) ListToppings(ctx context.Context) ([]db.Topping, error) {
	if cached := s.getCacheJSON(ctx, cacheKeyTopping); cached != "" {
		var result []db.Topping
		if err := json.Unmarshal([]byte(cached), &result); err == nil {
			return result, nil
		}
	}
	toppings, err := s.repo.ListToppings(ctx)
	if err != nil {
		return nil, fmt.Errorf("topping: list: %w", err)
	}
	s.setCacheJSON(ctx, cacheKeyTopping, toppings)
	return toppings, nil
}

type CreateToppingInput struct {
	Name  string
	Price int64
}

func (s *ProductService) CreateTopping(ctx context.Context, in CreateToppingInput) (string, error) {
	id := newUUID()
	if err := s.repo.CreateTopping(ctx, id, in.Name, formatPrice(in.Price)); err != nil {
		return "", fmt.Errorf("topping: create: %w", err)
	}
	s.invalidateToppingCaches(ctx)
	return id, nil
}

type UpdateToppingInput struct {
	Name  string
	Price int64
}

func (s *ProductService) UpdateTopping(ctx context.Context, id string, in UpdateToppingInput) error {
	if _, err := s.repo.GetToppingByID(ctx, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("topping: get for update: %w", err)
	}
	if err := s.repo.UpdateTopping(ctx, in.Name, formatPrice(in.Price), id); err != nil {
		return fmt.Errorf("topping: update: %w", err)
	}
	s.invalidateToppingCaches(ctx)
	return nil
}

func (s *ProductService) DeleteTopping(ctx context.Context, id string) error {
	if err := s.repo.SoftDeleteTopping(ctx, id); err != nil {
		return fmt.Errorf("topping: delete: %w", err)
	}
	s.invalidateToppingCaches(ctx)
	return nil
}

// ─── Combo CRUD ───────────────────────────────────────────────────────────────

// ListCombos returns all combos with their items (cached).
func (s *ProductService) ListCombos(ctx context.Context) ([]ComboDetails, error) {
	if cached := s.getCacheJSON(ctx, cacheKeyCombos); cached != "" {
		var result []ComboDetails
		if err := json.Unmarshal([]byte(cached), &result); err == nil {
			return result, nil
		}
	}

	combos, err := s.repo.ListCombos(ctx)
	if err != nil {
		return nil, fmt.Errorf("combo: list: %w", err)
	}

	result := make([]ComboDetails, 0, len(combos))
	for _, c := range combos {
		items, _ := s.repo.GetComboItems(ctx, c.ID)
		result = append(result, s.enrichCombo(c, items))
	}
	s.setCacheJSON(ctx, cacheKeyCombos, result)
	return result, nil
}

type CreateComboInput struct {
	Name        string
	Price       int64
	CategoryID  string
	Description string
	ImagePath   string
	SortOrder   int32
	Items       []ComboItemInput
}

type ComboItemInput struct {
	ProductID string
	Quantity  int32
}

func (s *ProductService) CreateCombo(ctx context.Context, in CreateComboInput) (string, error) {
	id := newUUID()
	catID := sql.NullString{}
	if in.CategoryID != "" {
		catID = sql.NullString{String: in.CategoryID, Valid: true}
	}
	desc := sql.NullString{}
	if in.Description != "" {
		desc = sql.NullString{String: in.Description, Valid: true}
	}
	imgPath := sql.NullString{}
	if in.ImagePath != "" {
		imgPath = sql.NullString{String: in.ImagePath, Valid: true}
	}

	if err := s.repo.CreateCombo(ctx, db.CreateComboParams{
		ID:          id,
		CategoryID:  catID,
		Name:        in.Name,
		Description: desc,
		Price:       formatPrice(in.Price),
		ImagePath:   imgPath,
		SortOrder:   in.SortOrder,
	}); err != nil {
		return "", fmt.Errorf("combo: create: %w", err)
	}

	for _, item := range in.Items {
		if err := s.repo.CreateComboItem(ctx, newUUID(), id, item.ProductID, item.Quantity); err != nil {
			slog.WarnContext(ctx, "combo: create item failed", "err", err)
		}
	}

	s.invalidateComboCaches(ctx)
	return id, nil
}

func (s *ProductService) DeleteCombo(ctx context.Context, id string) error {
	if err := s.repo.SoftDeleteCombo(ctx, id); err != nil {
		return fmt.Errorf("combo: delete: %w", err)
	}
	s.invalidateComboCaches(ctx)
	return nil
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func (s *ProductService) enrichProduct(p db.Product, cats map[string]db.Category, toppings []db.Topping) ProductDetails {
	desc := ""
	if p.Description.Valid {
		desc = p.Description.String
	}
	imgPath := ""
	if p.ImagePath.Valid {
		imgPath = p.ImagePath.String
	}
	catName := ""
	if cat, ok := cats[p.CategoryID]; ok {
		catName = cat.Name
	}
	items := make([]ToppingItem, 0, len(toppings))
	for _, t := range toppings {
		items = append(items, ToppingItem{
			ID:    t.ID,
			Name:  t.Name,
			Price: parsePrice(t.Price),
		})
	}
	return ProductDetails{
		ID:           p.ID,
		Name:         p.Name,
		Description:  desc,
		Price:        parsePrice(p.Price),
		ImagePath:    imgPath,
		IsAvailable:  p.IsAvailable,
		SortOrder:    p.SortOrder,
		CategoryID:   p.CategoryID,
		CategoryName: catName,
		Toppings:     items,
	}
}

func (s *ProductService) enrichCombo(c db.Combo, items []db.ComboItem) ComboDetails {
	desc := ""
	if c.Description.Valid {
		desc = c.Description.String
	}
	imgPath := ""
	if c.ImagePath.Valid {
		imgPath = c.ImagePath.String
	}
	catID := ""
	if c.CategoryID.Valid {
		catID = c.CategoryID.String
	}
	comboItems := make([]ComboItemDetails, 0, len(items))
	for _, item := range items {
		comboItems = append(comboItems, ComboItemDetails{
			ID:        item.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
		})
	}
	return ComboDetails{
		ID:          c.ID,
		Name:        c.Name,
		Description: desc,
		Price:       parsePrice(c.Price),
		ImagePath:   imgPath,
		IsAvailable: c.IsAvailable,
		SortOrder:   c.SortOrder,
		CategoryID:  catID,
		Items:       comboItems,
	}
}

func (s *ProductService) buildCategoryMap(ctx context.Context) (map[string]db.Category, error) {
	cats, err := s.repo.ListCategories(ctx)
	if err != nil {
		return nil, fmt.Errorf("product: list categories for map: %w", err)
	}
	m := make(map[string]db.Category, len(cats))
	for _, c := range cats {
		m[c.ID] = c
	}
	return m, nil
}

func (s *ProductService) invalidateProductCaches(ctx context.Context, id string) {
	keys := []string{cacheKeyProductsList, cacheKeyCategories}
	if id != "" {
		keys = append(keys, fmt.Sprintf("product:%s", id))
	}
	if err := s.rdb.Del(ctx, keys...).Err(); err != nil {
		slog.WarnContext(ctx, "product: cache invalidation failed", "err", err)
	}
}

func (s *ProductService) invalidateToppingCaches(ctx context.Context) {
	s.rdb.Del(ctx, cacheKeyTopping, cacheKeyProductsList)
}

func (s *ProductService) invalidateComboCaches(ctx context.Context) {
	s.rdb.Del(ctx, cacheKeyCombos)
}

func (s *ProductService) getCacheJSON(ctx context.Context, key string) string {
	v, err := s.rdb.Get(ctx, key).Result()
	if err != nil {
		return ""
	}
	return v
}

func (s *ProductService) setCacheJSON(ctx context.Context, key string, v any) {
	b, err := json.Marshal(v)
	if err != nil {
		return
	}
	if err := s.rdb.Set(ctx, key, string(b), productCacheTTL).Err(); err != nil {
		slog.WarnContext(ctx, "product: set cache failed", "key", key, "err", err)
	}
}

// ParsePrice converts a DECIMAL(10,0) string from MySQL to int64 VND.
func ParsePrice(s string) int64 {
	f, _ := strconv.ParseFloat(strings.TrimSpace(s), 64)
	return int64(math.Round(f))
}

// parsePrice is the unexported alias used within this package.
func parsePrice(s string) int64 { return ParsePrice(s) }

// formatPrice converts an int64 VND value to a DECIMAL string for MySQL.
func formatPrice(v int64) string {
	return strconv.FormatInt(v, 10)
}
