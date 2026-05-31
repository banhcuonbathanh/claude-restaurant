-- +goose Up
ALTER TABLE staff_tasks
  ADD COLUMN priority       ENUM('high','medium','low') NOT NULL DEFAULT 'medium' AFTER status,
  ADD COLUMN notes          TEXT                        NULL     AFTER priority,
  ADD COLUMN due_time_start VARCHAR(5)                  NULL     AFTER due_at,
  ADD COLUMN due_time_end   VARCHAR(5)                  NULL     AFTER due_time_start,
  MODIFY COLUMN status      ENUM('pending','in_progress','completed','overdue') NOT NULL DEFAULT 'pending';

-- +goose Down
ALTER TABLE staff_tasks
  DROP COLUMN priority,
  DROP COLUMN notes,
  DROP COLUMN due_time_start,
  DROP COLUMN due_time_end,
  MODIFY COLUMN status ENUM('pending','completed','overdue') NOT NULL DEFAULT 'pending';
