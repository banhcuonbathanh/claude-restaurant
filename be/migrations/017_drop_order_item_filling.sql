-- +goose Up
-- TOP-1: nhân (Thịt / Mộc nhĩ) becomes a topping — the single model. The bespoke
-- `filling` column (added by migration 016, OC epic) is removed. Backfill existing
-- orders so nhân survives as a topping entry in toppings_snapshot, THEN drop the column.
UPDATE order_items
SET toppings_snapshot = JSON_ARRAY_APPEND(
    COALESCE(toppings_snapshot, JSON_ARRAY()), '$',
    JSON_OBJECT('id','bbbbbbbb-bbbb-bbbb-bbbb-000000000001','name','Nhân thịt','price',0))
WHERE filling = 'thit';

UPDATE order_items
SET toppings_snapshot = JSON_ARRAY_APPEND(
    COALESCE(toppings_snapshot, JSON_ARRAY()), '$',
    JSON_OBJECT('id','bbbbbbbb-bbbb-bbbb-bbbb-000000000002','name','Nhân mộc nhĩ','price',0))
WHERE filling = 'moc_nhi';

ALTER TABLE order_items
    DROP CONSTRAINT chk_oi_filling,
    DROP COLUMN filling;

-- +goose Down
-- Re-adds the schema only. The backfilled topping entries written by Up cannot be
-- perfectly un-merged on rollback — they remain inside toppings_snapshot and the
-- filling column comes back NULL for those rows.
ALTER TABLE order_items
    ADD COLUMN filling VARCHAR(20) NULL DEFAULT NULL AFTER note,
    ADD CONSTRAINT chk_oi_filling CHECK (filling IS NULL OR filling IN ('thit','moc_nhi'));
