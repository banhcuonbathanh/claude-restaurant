package repository

import (
	"context"
	"database/sql"

	"banhcuon/be/internal/db"
)

// ProductRepository wraps all sqlc product/category/topping/combo queries.
type ProductRepository interface {
	// Products
	CreateProduct(ctx context.Context, arg db.CreateProductParams) error
	GetProductByID(ctx context.Context, id string) (db.Product, error)
	UpdateProduct(ctx context.Context, arg db.UpdateProductParams) error
	SoftDeleteProduct(ctx context.Context, id string) error
	ToggleProductAvailability(ctx context.Context, isAvailable bool, id string) error
	ListProducts(ctx context.Context) ([]db.Product, error)
	ListProductsAvailable(ctx context.Context) ([]db.Product, error)

	// Toppings (per product)
	GetToppingsByProductID(ctx context.Context, productID string) ([]db.Topping, error)
	AttachToppingToProduct(ctx context.Context, productID, toppingID string) error
	ClearProductToppings(ctx context.Context, productID string) error

	// Categories
	CreateCategory(ctx context.Context, id, name string, description sql.NullString, sortOrder int32) error
	GetCategoryByID(ctx context.Context, id string) (db.Category, error)
	UpdateCategory(ctx context.Context, name string, description sql.NullString, sortOrder int32, id string) error
	SoftDeleteCategory(ctx context.Context, id string) error
	ListCategories(ctx context.Context) ([]db.Category, error)

	// Toppings (global)
	CreateTopping(ctx context.Context, id, name, price string) error
	GetToppingByID(ctx context.Context, id string) (db.Topping, error)
	UpdateTopping(ctx context.Context, name, price, id string) error
	SoftDeleteTopping(ctx context.Context, id string) error
	ListToppings(ctx context.Context) ([]db.Topping, error)
	ListToppingsAvailable(ctx context.Context) ([]db.Topping, error)

	// Combos
	CreateCombo(ctx context.Context, arg db.CreateComboParams) error
	GetComboByID(ctx context.Context, id string) (db.Combo, error)
	UpdateCombo(ctx context.Context, arg db.UpdateComboParams) error
	SoftDeleteCombo(ctx context.Context, id string) error
	ListCombos(ctx context.Context) ([]db.Combo, error)
	ListCombosAvailable(ctx context.Context) ([]db.Combo, error)
	CreateComboItem(ctx context.Context, id, comboID, productID string, quantity int32) error
	DeleteComboItemsByComboID(ctx context.Context, comboID string) error
	GetComboItems(ctx context.Context, comboID string) ([]db.ComboItem, error)
}

type productRepo struct {
	q    *db.Queries
	dbtx db.DBTX
}

// NewProductRepo creates a ProductRepository.
func NewProductRepo(dbtx db.DBTX) ProductRepository {
	return &productRepo{q: db.New(dbtx), dbtx: dbtx}
}

func (r *productRepo) CreateProduct(ctx context.Context, arg db.CreateProductParams) error {
	return r.q.CreateProduct(ctx, arg)
}

func (r *productRepo) GetProductByID(ctx context.Context, id string) (db.Product, error) {
	return r.q.GetProductByID(ctx, id)
}

func (r *productRepo) UpdateProduct(ctx context.Context, arg db.UpdateProductParams) error {
	return r.q.UpdateProduct(ctx, arg)
}

func (r *productRepo) SoftDeleteProduct(ctx context.Context, id string) error {
	return r.q.SoftDeleteProduct(ctx, id)
}

func (r *productRepo) ToggleProductAvailability(ctx context.Context, isAvailable bool, id string) error {
	return r.q.ToggleProductAvailability(ctx, isAvailable, id)
}

func (r *productRepo) ListProducts(ctx context.Context) ([]db.Product, error) {
	return r.q.ListProducts(ctx)
}

func (r *productRepo) ListProductsAvailable(ctx context.Context) ([]db.Product, error) {
	return r.q.ListProductsAvailable(ctx)
}

func (r *productRepo) GetToppingsByProductID(ctx context.Context, productID string) ([]db.Topping, error) {
	return r.q.GetToppingsByProductID(ctx, productID)
}

func (r *productRepo) AttachToppingToProduct(ctx context.Context, productID, toppingID string) error {
	return r.q.AttachToppingToProduct(ctx, productID, toppingID)
}

func (r *productRepo) ClearProductToppings(ctx context.Context, productID string) error {
	_, err := r.dbtx.ExecContext(ctx, `DELETE FROM product_toppings WHERE product_id = ?`, productID)
	return err
}

func (r *productRepo) CreateCategory(ctx context.Context, id, name string, description sql.NullString, sortOrder int32) error {
	return r.q.CreateCategory(ctx, id, name, description, sortOrder)
}

func (r *productRepo) GetCategoryByID(ctx context.Context, id string) (db.Category, error) {
	return r.q.GetCategoryByID(ctx, id)
}

func (r *productRepo) UpdateCategory(ctx context.Context, name string, description sql.NullString, sortOrder int32, id string) error {
	return r.q.UpdateCategory(ctx, name, description, sortOrder, id)
}

func (r *productRepo) SoftDeleteCategory(ctx context.Context, id string) error {
	return r.q.SoftDeleteCategory(ctx, id)
}

func (r *productRepo) ListCategories(ctx context.Context) ([]db.Category, error) {
	return r.q.ListCategories(ctx)
}

func (r *productRepo) CreateTopping(ctx context.Context, id, name, price string) error {
	return r.q.CreateTopping(ctx, id, name, price)
}

func (r *productRepo) GetToppingByID(ctx context.Context, id string) (db.Topping, error) {
	return r.q.GetToppingByID(ctx, id)
}

func (r *productRepo) UpdateTopping(ctx context.Context, name, price, id string) error {
	return r.q.UpdateTopping(ctx, name, price, id)
}

func (r *productRepo) SoftDeleteTopping(ctx context.Context, id string) error {
	return r.q.SoftDeleteTopping(ctx, id)
}

func (r *productRepo) ListToppings(ctx context.Context) ([]db.Topping, error) {
	return r.q.ListToppings(ctx)
}

func (r *productRepo) ListToppingsAvailable(ctx context.Context) ([]db.Topping, error) {
	return r.q.ListToppingsAvailable(ctx)
}

func (r *productRepo) CreateCombo(ctx context.Context, arg db.CreateComboParams) error {
	return r.q.CreateCombo(ctx, arg)
}

func (r *productRepo) GetComboByID(ctx context.Context, id string) (db.Combo, error) {
	return r.q.GetComboByID(ctx, id)
}

func (r *productRepo) UpdateCombo(ctx context.Context, arg db.UpdateComboParams) error {
	return r.q.UpdateCombo(ctx, arg)
}

func (r *productRepo) SoftDeleteCombo(ctx context.Context, id string) error {
	return r.q.SoftDeleteCombo(ctx, id)
}

func (r *productRepo) ListCombos(ctx context.Context) ([]db.Combo, error) {
	return r.q.ListCombos(ctx)
}

func (r *productRepo) ListCombosAvailable(ctx context.Context) ([]db.Combo, error) {
	return r.q.ListCombosAvailable(ctx)
}

func (r *productRepo) CreateComboItem(ctx context.Context, id, comboID, productID string, quantity int32) error {
	return r.q.CreateComboItem(ctx, id, comboID, productID, quantity)
}

func (r *productRepo) DeleteComboItemsByComboID(ctx context.Context, comboID string) error {
	return r.q.DeleteComboItemsByComboID(ctx, comboID)
}

func (r *productRepo) GetComboItems(ctx context.Context, comboID string) ([]db.ComboItem, error) {
	return r.q.GetComboItems(ctx, comboID)
}

var _ ProductRepository = (*productRepo)(nil)
