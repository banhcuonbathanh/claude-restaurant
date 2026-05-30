-- +goose Up
CREATE TABLE staff_tasks (
    id           CHAR(36)     NOT NULL DEFAULT (UUID()),
    title        VARCHAR(200) NOT NULL,
    description  TEXT         NULL,
    assigned_to  CHAR(36)     NOT NULL,
    assigned_by  CHAR(36)     NOT NULL,
    status       ENUM('pending','completed','overdue') NOT NULL DEFAULT 'pending',
    due_at       DATETIME     NOT NULL,
    completed_at DATETIME     NULL,
    created_at   DATETIME     NOT NULL DEFAULT NOW(),
    updated_at   DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    deleted_at   DATETIME     NULL,
    PRIMARY KEY (id),
    INDEX idx_tasks_assigned_to (assigned_to),
    INDEX idx_tasks_assigned_by (assigned_by),
    INDEX idx_tasks_status     (status),
    INDEX idx_tasks_due_at     (due_at),
    INDEX idx_tasks_deleted_at (deleted_at),
    CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES staff (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_assigned_by FOREIGN KEY (assigned_by) REFERENCES staff (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS staff_tasks;
