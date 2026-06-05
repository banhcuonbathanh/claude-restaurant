-- +goose Up
-- OC-1: per-order-item filling (nhân) — Thịt / Mộc nhĩ. NULL = no filling (e.g. canh).
-- Real kitchen-visible attribute (owner decision 2026-06-05), stored as its own column, not in `note`.
ALTER TABLE order_items
    ADD COLUMN filling VARCHAR(20) NULL DEFAULT NULL AFTER note,
    ADD CONSTRAINT chk_oi_filling CHECK (filling IS NULL OR filling IN ('thit', 'moc_nhi'));

-- +goose Down
ALTER TABLE order_items
    DROP CONSTRAINT chk_oi_filling,
    DROP COLUMN filling;
