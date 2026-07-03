-- +goose Up
-- ONLINE-1: online orders (source='online', no table) need delivery/pickup info
-- so the admin Online Orders zone can show address + pickup time.
ALTER TABLE orders
  ADD COLUMN delivery_address VARCHAR(255) NULL AFTER customer_phone,
  ADD COLUMN pickup_at DATETIME NULL AFTER delivery_address;

-- +goose Down
ALTER TABLE orders
  DROP COLUMN pickup_at,
  DROP COLUMN delivery_address;
