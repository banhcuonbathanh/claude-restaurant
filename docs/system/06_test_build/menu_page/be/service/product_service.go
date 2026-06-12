// P-SYSTEST reference build — catalog reads with the Redis list-cache pattern
// (REDIS_CACHE.md: cache the public list responses; invalidate on any catalog write).
// Not compiled into the app.
package service

import (
	"context"
	"encoding/json"
	"time"
)

type ProductFilter struct {
	CategoryID  string
	Search      string
	IsAvailable *bool
}

type Category struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	SortOrder int    `json:"sort_order"`
}

type Topping struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Price       int64  `json:"price"`
	IsAvailable bool   `json:"is_available"`
}

type Product struct {
	ID           string    `json:"id"`
	CategoryID   string    `json:"category_id"`
	CategoryName string    `json:"category_name"`
	Name         string    `json:"name"`
	Description  *string   `json:"description"`
	Price        int64     `json:"price"`        // DB field name is authoritative: price, not base_price
	ImagePath    *string   `json:"image_path"`   // image_path, not image_url
	IsAvailable  bool      `json:"is_available"`
	SortOrder    int       `json:"sort_order"`
	Toppings     []Topping `json:"toppings"`
}

type ComboItemRow struct {
	ID        string `json:"id"`
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type Combo struct {
	ID          string         `json:"id"`
	CategoryID  *string        `json:"category_id"`
	Name        string         `json:"name"`
	Description *string        `json:"description"`
	Price       int64          `json:"price"`
	ImagePath   *string        `json:"image_path"`
	SortOrder   int            `json:"sort_order"`
	IsAvailable bool           `json:"is_available"`
	ComboItems  []ComboItemRow `json:"combo_items"`
}

// ProductRepo / cache are interfaces so the service stays unit-testable (no gin, no db import).
type ProductRepo interface {
	ListCategories(ctx context.Context) ([]Category, error)
	ListProducts(ctx context.Context, f ProductFilter) ([]Product, error)
	ListCombos(ctx context.Context) ([]Combo, error)
	GetProductSnapshot(ctx context.Context, id string) (*Product, error)
	GetToppingSnapshot(ctx context.Context, id string) (*Topping, error)
}

type Cache interface {
	Get(ctx context.Context, key string) ([]byte, bool)
	Set(ctx context.Context, key string, val []byte, ttl time.Duration)
}

type ProductService struct {
	repo  ProductRepo
	cache Cache
}

func NewProductService(repo ProductRepo, cache Cache) *ProductService {
	return &ProductService{repo: repo, cache: cache}
}

const catalogCacheTTL = 5 * time.Minute

func (s *ProductService) ListCategories(ctx context.Context) ([]Category, error) {
	var cached []Category
	if hit(s.cache, ctx, "cache:categories", &cached) {
		return cached, nil
	}
	cats, err := s.repo.ListCategories(ctx)
	if err != nil {
		return nil, err
	}
	store(s.cache, ctx, "cache:categories", cats)
	return cats, nil
}

func (s *ProductService) ListProducts(ctx context.Context, f ProductFilter) ([]Product, error) {
	// Only the unfiltered public list is cached; filtered/search queries go to the DB.
	cacheable := f.CategoryID == "" && f.Search == "" && f.IsAvailable == nil
	if cacheable {
		var cached []Product
		if hit(s.cache, ctx, "cache:products", &cached) {
			return cached, nil
		}
	}
	products, err := s.repo.ListProducts(ctx, f)
	if err != nil {
		return nil, err
	}
	if cacheable {
		store(s.cache, ctx, "cache:products", products)
	}
	return products, nil
}

func (s *ProductService) ListCombos(ctx context.Context) ([]Combo, error) {
	var cached []Combo
	if hit(s.cache, ctx, "cache:combos", &cached) {
		return cached, nil
	}
	combos, err := s.repo.ListCombos(ctx)
	if err != nil {
		return nil, err
	}
	store(s.cache, ctx, "cache:combos", combos)
	return combos, nil
}

func hit[T any](c Cache, ctx context.Context, key string, out *T) bool {
	raw, ok := c.Get(ctx, key)
	if !ok {
		return false
	}
	return json.Unmarshal(raw, out) == nil
}

func store[T any](c Cache, ctx context.Context, key string, val T) {
	if raw, err := json.Marshal(val); err == nil {
		c.Set(ctx, key, raw, catalogCacheTTL)
	}
}
