-- name: ListCategories :many
SELECT * FROM categories
WHERE is_active = 1 AND deleted_at IS NULL
ORDER BY sort_order ASC, name ASC;

-- name: GetCategoryByID :one
SELECT * FROM categories
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: CreateCategory :exec
INSERT INTO categories (id, name, description, sort_order, is_active)
VALUES (?, ?, ?, ?, 1);

-- name: UpdateCategory :exec
UPDATE categories
SET name = ?, description = ?, sort_order = ?, updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: SoftDeleteCategory :exec
UPDATE categories
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: ListProducts :many
SELECT * FROM products
WHERE deleted_at IS NULL
ORDER BY sort_order ASC, name ASC;

-- name: ListProductsByCategoryAvailable :many
SELECT * FROM products
WHERE category_id = ? AND is_available = 1 AND deleted_at IS NULL
ORDER BY sort_order ASC, name ASC;

-- name: ListProductsAvailable :many
SELECT * FROM products
WHERE is_available = 1 AND deleted_at IS NULL
ORDER BY sort_order ASC, name ASC;

-- name: GetProductByID :one
SELECT * FROM products
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: CreateProduct :exec
INSERT INTO products (id, category_id, name, description, price, image_path, is_available, sort_order)
VALUES (?, ?, ?, ?, ?, ?, 1, ?);

-- name: UpdateProduct :exec
UPDATE products
SET category_id = ?, name = ?, description = ?, price = ?, image_path = ?, sort_order = ?, updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: SoftDeleteProduct :exec
UPDATE products
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: ToggleProductAvailability :exec
UPDATE products
SET is_available = ?, updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: ListToppings :many
SELECT * FROM toppings
WHERE deleted_at IS NULL
ORDER BY name ASC;

-- name: ListToppingsAvailable :many
SELECT * FROM toppings
WHERE is_available = 1 AND deleted_at IS NULL
ORDER BY name ASC;

-- name: GetToppingByID :one
SELECT * FROM toppings
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: CreateTopping :exec
INSERT INTO toppings (id, name, price, is_available)
VALUES (?, ?, ?, 1);

-- name: UpdateTopping :exec
UPDATE toppings
SET name = ?, price = ?, updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: SoftDeleteTopping :exec
UPDATE toppings
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: GetToppingsByProductID :many
SELECT t.* FROM toppings t
INNER JOIN product_toppings pt ON pt.topping_id = t.id
WHERE pt.product_id = ? AND t.deleted_at IS NULL
ORDER BY t.name ASC;

-- name: AttachToppingToProduct :exec
INSERT IGNORE INTO product_toppings (product_id, topping_id)
VALUES (?, ?);

-- name: DetachToppingFromProduct :exec
DELETE FROM product_toppings
WHERE product_id = ? AND topping_id = ?;

-- name: ListCombos :many
SELECT * FROM combos
WHERE deleted_at IS NULL
ORDER BY sort_order ASC, name ASC;

-- name: ListCombosAvailable :many
SELECT * FROM combos
WHERE is_available = 1 AND deleted_at IS NULL
ORDER BY sort_order ASC, name ASC;

-- name: GetComboByID :one
SELECT * FROM combos
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetComboItems :many
SELECT ci.id, ci.combo_id, ci.product_id, ci.quantity, ci.created_at, ci.updated_at
FROM combo_items ci
WHERE ci.combo_id = ?
ORDER BY ci.created_at ASC;

-- name: CreateCombo :exec
INSERT INTO combos (id, category_id, name, description, price, image_path, is_available, sort_order)
VALUES (?, ?, ?, ?, ?, ?, 1, ?);

-- name: UpdateCombo :exec
UPDATE combos
SET category_id = ?, name = ?, description = ?, price = ?, image_path = ?, sort_order = ?, updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: SoftDeleteCombo :exec
UPDATE combos
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: CreateComboItem :exec
INSERT INTO combo_items (id, combo_id, product_id, quantity)
VALUES (?, ?, ?, ?);

-- name: DeleteComboItemsByComboID :exec
DELETE FROM combo_items WHERE combo_id = ?;
