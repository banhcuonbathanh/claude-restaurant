-- name: CreateOrder :exec
INSERT INTO orders (id, order_number, table_id, status, source, customer_name, customer_phone, note, total_amount, created_by)
VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, 0, ?);

-- name: GetOrderByID :one
SELECT * FROM orders
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetActiveOrderByTable :one
SELECT * FROM orders
WHERE table_id = ?
  AND status IN ('pending','confirmed','preparing','ready')
  AND deleted_at IS NULL
LIMIT 1;

-- name: ListAllOrders :many
SELECT * FROM orders
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: ListOrdersByStatus :many
SELECT * FROM orders
WHERE status = ? AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: UpdateOrderStatus :exec
UPDATE orders
SET status = ?, updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: SoftDeleteOrder :exec
UPDATE orders
SET deleted_at = NOW(), status = 'cancelled', updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- recalculateTotalAmount MUST be called after every order_items mutation.
-- Skipping this causes total_amount drift and wrong payment charges.
-- name: RecalculateTotalAmount :exec
UPDATE orders
SET total_amount = (
    SELECT COALESCE(SUM(unit_price * quantity), 0)
    FROM order_items
    WHERE order_id = orders.id
),
updated_at = NOW()
WHERE id = ?;

-- name: CreateOrderItem :exec
INSERT INTO order_items (id, order_id, product_id, combo_id, combo_ref_id, name, unit_price, quantity, qty_served, toppings_snapshot, note)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?);

-- name: GetOrderItemsByOrderID :many
SELECT * FROM order_items
WHERE order_id = ?
ORDER BY created_at ASC;

-- name: GetOrderItemByID :one
SELECT * FROM order_items
WHERE id = ?
LIMIT 1;

-- name: UpdateQtyServed :exec
UPDATE order_items
SET qty_served = ?, updated_at = NOW()
WHERE id = ?;

-- name: SumQtyServedAndQuantity :one
SELECT
    COALESCE(SUM(qty_served), 0) AS total_served,
    COALESCE(SUM(quantity), 0)   AS total_quantity
FROM order_items
WHERE order_id = ?;

-- name: UpsertOrderSequence :exec
INSERT INTO order_sequences (date_key, last_seq)
VALUES (?, 1)
ON DUPLICATE KEY UPDATE last_seq = last_seq + 1;

-- name: GetOrderSequence :one
SELECT last_seq FROM order_sequences
WHERE date_key = ?
LIMIT 1;
