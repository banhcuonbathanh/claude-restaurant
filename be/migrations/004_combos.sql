-- +goose Up
-- image_path = relative object_path. NOT image_url.
-- category_id = nullable FK (v1.1). sort_order added in v1.1.
CREATE TABLE IF NOT EXISTS combos (
    id           CHAR(36)      NOT NULL DEFAULT (UUID()),
    category_id  CHAR(36)      NULL DEFAULT NULL,
    name         VARCHAR(150)  NOT NULL,
    description  TEXT          NULL,
    price        DECIMAL(10,0) NOT NULL,
    image_path   VARCHAR(500)  NULL DEFAULT NULL,
    is_available TINYINT(1)    NOT NULL DEFAULT 1,
    sort_order   INT           NOT NULL DEFAULT 0,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at   DATETIME      NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_combos_category_id (category_id),
    KEY idx_combos_is_available (is_available),
    KEY idx_combos_sort_order (sort_order),
    KEY idx_combos_deleted_at (deleted_at),
    CONSTRAINT fk_combos_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- combo_items is a STATIC TEMPLATE. At order time, BE expands into individual order_items
-- rows linked by combo_ref_id. Kitchen sees individual dishes, not the combo label.
CREATE TABLE IF NOT EXISTS combo_items (
    id         CHAR(36) NOT NULL DEFAULT (UUID()),
    combo_id   CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity   INT      NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_combo_items_combo_id (combo_id),
    KEY idx_combo_items_product_id (product_id),
    CONSTRAINT fk_combo_items_combo   FOREIGN KEY (combo_id)   REFERENCES combos   (id) ON DELETE CASCADE,
    CONSTRAINT fk_combo_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS combo_items;
DROP TABLE IF EXISTS combos;
