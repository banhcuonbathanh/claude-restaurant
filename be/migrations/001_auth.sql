-- +goose Up
CREATE TABLE IF NOT EXISTS staff (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    username      VARCHAR(50)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email         VARCHAR(100) NULL DEFAULT NULL,
    role          ENUM('customer','chef','cashier','staff','manager','admin') NOT NULL DEFAULT 'cashier',
    full_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(20)  NULL DEFAULT NULL,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME     NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_staff_username (username),
    KEY idx_staff_role (role),
    KEY idx_staff_is_active (is_active),
    KEY idx_staff_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- bcrypt cost=12; token_hash = SHA256(raw_token) stored as hex
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id           CHAR(36)     NOT NULL DEFAULT (UUID()),
    staff_id     CHAR(36)     NOT NULL,
    token_hash   CHAR(64)     NOT NULL,
    user_agent   VARCHAR(255) NULL DEFAULT NULL,
    ip_address   VARCHAR(45)  NULL DEFAULT NULL,
    expires_at   DATETIME     NOT NULL,
    last_used_at DATETIME     NULL DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
    KEY idx_refresh_tokens_staff_id (staff_id),
    KEY idx_refresh_tokens_expires_at (expires_at),
    KEY idx_refresh_tokens_last_used_at (last_used_at),
    CONSTRAINT fk_refresh_tokens_staff FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS staff;
