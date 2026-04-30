-- +goose Up
-- +goose StatementBegin

-- ============================================================
-- MIGRATION: 008_order_groups
-- Thêm group_id vào bảng orders để hỗ trợ nhóm bàn (Option A).
--
-- Thiết kế:
--   group_id CHAR(36) NULL — shared UUID cho tất cả orders cùng nhóm.
--   NULL = order độc lập (không thuộc nhóm nào).
--   Non-NULL = order là thành viên của nhóm group_id đó.
--
-- Không có FK vì group_id không trỏ tới bảng riêng —
-- application layer kiểm tra tính hợp lệ khi add/remove order.
--
-- Index: idx_orders_group_id — hỗ trợ:
--   SELECT * FROM orders WHERE group_id = ? (lấy tất cả orders trong group)
--
-- Không ảnh hưởng bất kỳ business rule hiện có (state machine,
-- 1-table-1-active, cancel 30% rule, payment flow).
-- ============================================================

ALTER TABLE orders
    ADD COLUMN group_id CHAR(36) NULL DEFAULT NULL
        COMMENT 'Shared UUID for multi-table group (Option A). NULL = standalone order.',
    ADD INDEX idx_orders_group_id (group_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

ALTER TABLE orders
    DROP INDEX idx_orders_group_id,
    DROP COLUMN group_id;

-- +goose StatementEnd
