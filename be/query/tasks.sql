-- name: GetDailyTaskMetrics :one
SELECT
  COUNT(*)                                                            AS total_tasks,
  SUM(CASE WHEN status = 'completed'   THEN 1 ELSE 0 END)            AS completed_tasks,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)            AS in_progress_tasks,
  SUM(CASE WHEN status = 'overdue'     THEN 1 ELSE 0 END)            AS overdue_tasks
FROM staff_tasks
WHERE DATE(due_at) = ?
  AND deleted_at IS NULL;

-- name: GetStaffTaskStats :many
SELECT
  s.id                                                                    AS staff_id,
  s.full_name                                                             AS staff_name,
  s.role,
  COUNT(t.id)                                                             AS assigned_count,
  CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS SIGNED) AS completed_count,
  CASE
    WHEN COUNT(t.id) = 0 THEN 0
    ELSE CAST(ROUND(100.0 * SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(t.id)) AS SIGNED)
  END                                                                     AS completion_rate,
  CAST(MAX(CASE WHEN t.status = 'overdue' THEN 1 ELSE 0 END) AS SIGNED)  AS has_overdue
FROM staff s
LEFT JOIN staff_tasks t
  ON t.assigned_to = s.id
  AND DATE(t.due_at) = ?
  AND t.deleted_at IS NULL
WHERE s.deleted_at IS NULL
  AND s.is_active = 1
GROUP BY s.id, s.full_name, s.role
ORDER BY s.full_name ASC;

-- name: GetStaffTasksByDate :many
SELECT * FROM staff_tasks
WHERE assigned_to = ?
  AND DATE(due_at) = ?
  AND deleted_at IS NULL
ORDER BY
  CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
  due_at ASC;

-- name: GetStaffTaskByID :one
SELECT * FROM staff_tasks
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: CreateStaffTask :exec
INSERT INTO staff_tasks (id, title, description, assigned_to, assigned_by, priority, status, due_at, due_time_start, due_time_end, notes)
VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?);
