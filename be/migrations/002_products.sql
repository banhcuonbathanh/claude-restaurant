-- +goose Up
CREATE TABLE IF NOT EXISTS categories (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(100) NOT NULL,
    description TEXT         NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  DATETIME     NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_categories_is_active (is_active),
    KEY idx_categories_sort_order (sort_order),
    KEY idx_categories_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- price = DECIMAL(10,0): VND has no decimal places. NOT base_price.
-- image_path = relative object_path, NOT full URL. NOT image_url.
-- No slug column.
CREATE TABLE IF NOT EXISTS products (
    id           CHAR(36)      NOT NULL DEFAULT (UUID()),
    category_id  CHAR(36)      NOT NULL,
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
    KEY idx_products_category_id (category_id),
    KEY idx_products_is_available (is_available),
    KEY idx_products_sort_order (sort_order),
    KEY idx_products_deleted_at (deleted_at),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- price = DECIMAL(10,0). NOT price_delta.
CREATE TABLE IF NOT EXISTS toppings (
    id           CHAR(36)      NOT NULL DEFAULT (UUID()),
    name         VARCHAR(100)  NOT NULL,
    price        DECIMAL(10,0) NOT NULL DEFAULT 0,
    is_available TINYINT(1)    NOT NULL DEFAULT 1,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at   DATETIME      NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_toppings_is_available (is_available),
    KEY idx_toppings_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_toppings (
    product_id CHAR(36) NOT NULL,
    topping_id CHAR(36) NOT NULL,
    PRIMARY KEY (product_id, topping_id),
    KEY idx_product_toppings_topping_id (topping_id),
    CONSTRAINT fk_product_toppings_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_toppings_topping FOREIGN KEY (topping_id) REFERENCES toppings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS product_toppings;
DROP TABLE IF EXISTS toppings;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
