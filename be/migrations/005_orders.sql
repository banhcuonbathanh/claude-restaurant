-- +goose Up
-- Primary path: Redis INCR order_seq:{YYYYMMDD} TTL 2d → ORD-YYYYMMDD-NNN
-- Fallback: INSERT...ON DUPLICATE KEY UPDATE last_seq = last_seq + 1
CREATE TABLE IF NOT EXISTS order_sequences (
    id       INT  NOT NULL AUTO_INCREMENT,
    date_key DATE NOT NULL,
    last_seq INT  NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_order_sequences_date_key (date_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- source: NOT payment_method. created_by: NOT staff_id.
-- total_amount is DENORMALIZED — recalculate after EVERY order_items mutation.
-- 1 table = 1 active order enforced via idx_orders_table_status.
CREATE TABLE IF NOT EXISTS orders (
    id             CHAR(36)      NOT NULL DEFAULT (UUID()),
    order_number   VARCHAR(30)   NOT NULL,
    table_id       CHAR(36)      NULL DEFAULT NULL,
    status         ENUM('pending','confirmed','preparing','ready','delivered','cancelled') NOT NULL DEFAULT 'pending',
    source         ENUM('online','qr','pos') NOT NULL DEFAULT 'online',
    customer_name  VARCHAR(100)  NULL DEFAULT NULL,
    customer_phone VARCHAR(20)   NULL DEFAULT NULL,
    note           TEXT          NULL,
    total_amount   DECIMAL(10,0) NOT NULL DEFAULT 0,
    created_by     CHAR(36)      NULL DEFAULT NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at     DATETIME      NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_orders_order_number (order_number),
    KEY idx_orders_table_status (table_id, status),
    KEY idx_orders_status (status),
    KEY idx_orders_source (source),
    KEY idx_orders_created_at (created_at),
    KEY idx_orders_created_by (created_by),
    KEY idx_orders_deleted_at (deleted_at),
    CONSTRAINT fk_orders_table      FOREIGN KEY (table_id)   REFERENCES `tables` (id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES staff    (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IMPORTANT: order_items has NO status column and NO flagged column.
-- Status is DERIVED from qty_served: 0=pending, 0<x<qty=preparing, x=qty=done.
-- 3 valid item types enforced by chk_oi_item_type (requires MySQL 8.0.16+):
--   standalone product: product_id NOT NULL, combo_id NULL,     combo_ref_id NULL
--   combo header line:  product_id NULL,     combo_id NOT NULL, combo_ref_id NULL
--   combo sub-item:     product_id NOT NULL, combo_id NULL,     combo_ref_id NOT NULL
CREATE TABLE IF NOT EXISTS order_items (
    id                CHAR(36)      NOT NULL DEFAULT (UUID()),
    order_id          CHAR(36)      NOT NULL,
    product_id        CHAR(36)      NULL DEFAULT NULL,
    combo_id          CHAR(36)      NULL DEFAULT NULL,
    combo_ref_id      CHAR(36)      NULL DEFAULT NULL,
    name              VARCHAR(200)  NOT NULL,
    unit_price        DECIMAL(10,0) NOT NULL,
    quantity          INT           NOT NULL DEFAULT 1 CHECK (quantity > 0),
    qty_served        INT           NOT NULL DEFAULT 0 CHECK (qty_served >= 0),
    toppings_snapshot JSON          NULL,
    note              TEXT          NULL,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_order_items_order_id (order_id),
    KEY idx_order_items_product_id (product_id),
    KEY idx_order_items_combo_id (combo_id),
    KEY idx_order_items_combo_ref_id (combo_ref_id),
    CONSTRAINT fk_order_items_order     FOREIGN KEY (order_id)     REFERENCES orders      (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product   FOREIGN KEY (product_id)   REFERENCES products    (id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_items_combo     FOREIGN KEY (combo_id)     REFERENCES combos      (id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_items_combo_ref FOREIGN KEY (combo_ref_id) REFERENCES order_items (id) ON DELETE CASCADE,
    CONSTRAINT chk_oi_item_type CHECK (
        (product_id IS NOT NULL AND combo_id IS NULL     AND combo_ref_id IS NULL    ) OR
        (product_id IS NULL     AND combo_id IS NOT NULL AND combo_ref_id IS NULL    ) OR
        (product_id IS NOT NULL AND combo_id IS NULL     AND combo_ref_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_sequences;
