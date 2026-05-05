-- +goose Up
CREATE TABLE IF NOT EXISTS ingredients (
    id            CHAR(36)      NOT NULL DEFAULT (UUID()),
    name          VARCHAR(150)  NOT NULL,
    unit          VARCHAR(30)   NOT NULL,
    current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    min_stock     DECIMAL(10,3) NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(10,0) NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME      NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_ingredients_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_ingredients (
    product_id    CHAR(36)      NOT NULL,
    ingredient_id CHAR(36)      NOT NULL,
    qty_used      DECIMAL(10,3) NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, ingredient_id),
    KEY idx_pi_ingredient_id (ingredient_id),
    CONSTRAINT fk_pi_product    FOREIGN KEY (product_id)    REFERENCES products    (id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_movements (
    id            CHAR(36)      NOT NULL DEFAULT (UUID()),
    ingredient_id CHAR(36)      NOT NULL,
    type          ENUM('in','out','adjustment') NOT NULL,
    quantity      DECIMAL(10,3) NOT NULL,
    note          TEXT          NULL,
    created_by    CHAR(36)      NULL DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sm_ingredient_id (ingredient_id),
    KEY idx_sm_created_at (created_at),
    KEY idx_sm_created_by (created_by),
    CONSTRAINT fk_sm_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE,
    CONSTRAINT fk_sm_staff      FOREIGN KEY (created_by)    REFERENCES staff       (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS product_ingredients;
DROP TABLE IF EXISTS ingredients;
