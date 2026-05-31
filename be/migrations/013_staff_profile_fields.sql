-- +goose Up
ALTER TABLE staff
    ADD COLUMN job_title        VARCHAR(100) NULL DEFAULT NULL AFTER full_name,
    ADD COLUMN shifts           JSON         NULL DEFAULT NULL AFTER job_title,
    ADD COLUMN responsibilities TEXT         NULL DEFAULT NULL AFTER shifts;

-- +goose Down
ALTER TABLE staff
    DROP COLUMN responsibilities,
    DROP COLUMN shifts,
    DROP COLUMN job_title;
