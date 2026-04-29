-- +goose Up
-- status: 'completed' NOT 'success'. gateway_data NOT webhook_payload.
-- UNIQUE(order_id): retries must UPDATE, never INSERT.
-- Hard delete is BLOCKED — use deleted_at only (audit compliance).
-- Payment created ONLY when order.status = 'ready'.
CREATE TABLE IF NOT EXISTS payments (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    order_id        CHAR(36)      NOT NULL,
    method          ENUM('vnpay','momo','zalopay','cash') NOT NULL,
    status          ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
    amount          DECIMAL(10,0) NOT NULL,
    attempt_count   INT           NOT NULL DEFAULT 1,
    gateway_ref     VARCHAR(150)  NULL DEFAULT NULL,
    gateway_data    JSON          NULL,
    refunded_amount DECIMAL(10,0) NULL DEFAULT NULL,
    expires_at      DATETIME      NULL DEFAULT NULL,
    paid_at         DATETIME      NULL DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME      NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payments_order_id (order_id),
    KEY idx_payments_status (status),
    KEY idx_payments_method (method),
    KEY idx_payments_created_at (created_at),
    KEY idx_payments_deleted_at (deleted_at),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS payments;
