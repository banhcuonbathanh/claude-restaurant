-- +goose Up
ALTER TABLE orders
    MODIFY COLUMN status ENUM('pending','confirmed','preparing','ready','delivered','cancelled','paid')
    NOT NULL DEFAULT 'pending';

-- +goose Down
-- Remove any paid orders before reverting (safe for dev; not for prod without manual review)
UPDATE orders SET status = 'delivered' WHERE status = 'paid';
ALTER TABLE orders
    MODIFY COLUMN status ENUM('pending','confirmed','preparing','ready','delivered','cancelled')
    NOT NULL DEFAULT 'pending';
