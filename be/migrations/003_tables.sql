-- +goose Up
-- Phase 1: only 'available' and 'inactive' are used.
-- Do NOT build logic relying on 'occupied' being accurate until Phase 2.
CREATE TABLE IF NOT EXISTS `tables` (
    id         CHAR(36)    NOT NULL DEFAULT (UUID()),
    name       VARCHAR(50) NOT NULL,
    qr_token   CHAR(64)    NOT NULL,
    capacity   INT         NOT NULL DEFAULT 4,
    status     ENUM('available','occupied','reserved','inactive') NOT NULL DEFAULT 'available',
    is_active  TINYINT(1)  NOT NULL DEFAULT 1,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME    NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tables_name (name),
    UNIQUE KEY uq_tables_qr_token (qr_token),
    KEY idx_tables_status (status),
    KEY idx_tables_is_active (is_active),
    KEY idx_tables_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `tables`;
