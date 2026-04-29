-- name: CreatePayment :exec
INSERT INTO payments (id, order_id, method, status, amount, expires_at)
VALUES (?, ?, ?, 'pending', ?, ?);

-- name: GetPaymentByID :one
SELECT * FROM payments
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetPaymentByOrderID :one
SELECT * FROM payments
WHERE order_id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: UpdatePaymentStatus :exec
UPDATE payments
SET status = ?, gateway_ref = ?, gateway_data = ?, paid_at = ?, updated_at = NOW()
WHERE id = ?;

-- name: IncrementPaymentAttempt :exec
UPDATE payments
SET attempt_count = attempt_count + 1, updated_at = NOW()
WHERE id = ?;

-- name: SoftDeletePayment :exec
UPDATE payments
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = ?;

-- name: SetPaymentRefunded :exec
UPDATE payments
SET status = 'refunded', refunded_amount = ?, updated_at = NOW()
WHERE id = ?;
