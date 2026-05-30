-- +goose Up
ALTER TABLE ingredients
  ADD COLUMN import_date DATE NOT NULL DEFAULT (CURDATE()) AFTER unit,
  ADD COLUMN shelf_days  INT  NOT NULL DEFAULT 90          AFTER import_date;

-- +goose Down
ALTER TABLE ingredients
  DROP COLUMN shelf_days,
  DROP COLUMN import_date;
