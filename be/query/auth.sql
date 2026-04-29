-- name: GetStaffByUsername :one
SELECT * FROM staff
WHERE username = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetStaffByID :one
SELECT * FROM staff
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: CreateRefreshToken :exec
INSERT INTO refresh_tokens (id, staff_id, token_hash, user_agent, ip_address, expires_at, last_used_at)
VALUES (?, ?, ?, ?, ?, ?, NOW());

-- name: GetRefreshToken :one
SELECT * FROM refresh_tokens
WHERE token_hash = ? AND expires_at > NOW()
LIMIT 1;

-- name: DeleteRefreshToken :exec
DELETE FROM refresh_tokens WHERE token_hash = ?;

-- name: DeleteRefreshTokensByStaff :exec
DELETE FROM refresh_tokens WHERE staff_id = ?;

-- name: SetStaffActive :exec
UPDATE staff SET is_active = ?, updated_at = NOW() WHERE id = ?;

-- name: ListActiveSessionsByStaff :many
SELECT * FROM refresh_tokens
WHERE staff_id = ? AND expires_at > NOW()
ORDER BY last_used_at ASC;

-- name: UpdateRefreshTokenLastUsed :exec
UPDATE refresh_tokens SET last_used_at = NOW() WHERE token_hash = ?;

-- name: CountActiveSessionsByStaff :one
SELECT COUNT(*) AS count FROM refresh_tokens
WHERE staff_id = ? AND expires_at > NOW();

-- name: DeleteOldestSessionByStaff :exec
DELETE FROM refresh_tokens
WHERE id = (
    SELECT id FROM (
        SELECT id FROM refresh_tokens
        WHERE staff_id = ? AND expires_at > NOW()
        ORDER BY last_used_at ASC
        LIMIT 1
    ) AS oldest
);
