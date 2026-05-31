-- name: ListTrainingGuides :many
SELECT * FROM training_guides
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: ListTrainingGuidesByRole :many
SELECT * FROM training_guides
WHERE role = ? AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetTrainingGuide :one
SELECT * FROM training_guides
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: CreateTrainingGuide :exec
INSERT INTO training_guides (
    id, title, role, description, cover_image_url, youtube_url,
    quality_kpi_target, quantity_kpi_target, pass_threshold, max_attempts,
    published, created_by
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: UpdateTrainingGuide :exec
UPDATE training_guides
SET title = ?, role = ?, description = ?, cover_image_url = ?, youtube_url = ?,
    quality_kpi_target = ?, quantity_kpi_target = ?, pass_threshold = ?,
    max_attempts = ?, published = ?, updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: SoftDeleteTrainingGuide :exec
UPDATE training_guides
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = ? AND deleted_at IS NULL;

-- name: GetGuideRoles :many
SELECT role FROM training_guide_roles
WHERE guide_id = ?;

-- name: InsertGuideRole :exec
INSERT IGNORE INTO training_guide_roles (guide_id, role)
VALUES (?, ?);

-- name: DeleteGuideRoles :exec
DELETE FROM training_guide_roles
WHERE guide_id = ?;

-- name: ListGuideProgress :many
SELECT
    tp.id,
    tp.guide_id,
    tp.staff_id,
    tp.watched_percent,
    tp.manager_notes,
    tp.created_at,
    tp.updated_at,
    s.full_name AS staff_name,
    s.role      AS staff_role
FROM training_progress tp
JOIN staff s ON s.id = tp.staff_id
WHERE tp.guide_id = ?
ORDER BY s.full_name ASC
LIMIT ? OFFSET ?;

-- name: CountGuideProgress :one
SELECT COUNT(*) FROM training_progress
WHERE guide_id = ?;

-- name: GetStaffProgress :one
SELECT * FROM training_progress
WHERE guide_id = ? AND staff_id = ?
LIMIT 1;

-- name: UpsertStaffProgress :exec
INSERT INTO training_progress (id, guide_id, staff_id, watched_percent)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
    watched_percent = VALUES(watched_percent),
    updated_at = NOW();

-- name: UpdateManagerNotes :exec
UPDATE training_progress
SET manager_notes = ?, updated_at = NOW()
WHERE guide_id = ? AND staff_id = ?;

-- name: ListQuizAttempts :many
SELECT * FROM quiz_attempts
WHERE progress_id = ?
ORDER BY attempted_at ASC;

-- name: CountQuizAttempts :one
SELECT COUNT(*) FROM quiz_attempts
WHERE progress_id = ?;

-- name: InsertQuizAttempt :exec
INSERT INTO quiz_attempts (id, progress_id, score, passed, attempted_at)
VALUES (?, ?, ?, ?, NOW());
