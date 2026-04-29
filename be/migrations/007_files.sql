-- +goose Up
-- is_orphan=1 by default → file cleanup job deletes after 24h if not linked.
-- entity_type + entity_id are polymorphic (intentionally NOT hard FKs).
-- When is_orphan=0: both entity_type AND entity_id MUST be set.
CREATE TABLE IF NOT EXISTS file_attachments (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    object_path   VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type     VARCHAR(100) NOT NULL,
    size_bytes    BIGINT       NOT NULL DEFAULT 0,
    uploaded_by   CHAR(36)     NULL DEFAULT NULL,
    is_orphan     TINYINT(1)   NOT NULL DEFAULT 1,
    entity_type   VARCHAR(50)  NULL DEFAULT NULL,
    entity_id     CHAR(36)     NULL DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_file_attachments_uploaded_by (uploaded_by),
    KEY idx_file_attachments_is_orphan (is_orphan),
    KEY idx_file_attachments_entity (entity_type, entity_id),
    KEY idx_file_attachments_created_at (created_at),
    CONSTRAINT fk_file_attachments_staff FOREIGN KEY (uploaded_by) REFERENCES staff (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS file_attachments;
