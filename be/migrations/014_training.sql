-- +goose Up
CREATE TABLE IF NOT EXISTS training_guides (
    id                   CHAR(36)      NOT NULL DEFAULT (UUID()),
    title                VARCHAR(200)  NOT NULL,
    role                 ENUM('chef','cashier','staff','manager') NOT NULL,
    description          TEXT          NULL,
    cover_image_url      VARCHAR(500)  NULL,
    youtube_url          VARCHAR(500)  NULL,
    quality_kpi_target   VARCHAR(200)  NULL,
    quantity_kpi_target  VARCHAR(200)  NULL,
    pass_threshold       INT           NOT NULL DEFAULT 75,
    max_attempts         INT           NOT NULL DEFAULT 3,
    published            TINYINT(1)   NOT NULL DEFAULT 0,
    created_by           CHAR(36)      NULL DEFAULT NULL,
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at           DATETIME      NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_tg_role       (role),
    KEY idx_tg_published  (published),
    KEY idx_tg_deleted_at (deleted_at),
    KEY idx_tg_created_by (created_by),
    CONSTRAINT fk_tg_created_by FOREIGN KEY (created_by) REFERENCES staff (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_guide_roles (
    guide_id  CHAR(36)     NOT NULL,
    role      ENUM('chef','cashier','staff','manager') NOT NULL,
    PRIMARY KEY (guide_id, role),
    KEY idx_tgr_role (role),
    CONSTRAINT fk_tgr_guide FOREIGN KEY (guide_id) REFERENCES training_guides (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_progress (
    id               CHAR(36)  NOT NULL DEFAULT (UUID()),
    guide_id         CHAR(36)  NOT NULL,
    staff_id         CHAR(36)  NOT NULL,
    watched_percent  INT       NOT NULL DEFAULT 0,
    manager_notes    TEXT      NULL,
    created_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tp_guide_staff (guide_id, staff_id),
    KEY idx_tp_guide_id (guide_id),
    KEY idx_tp_staff_id (staff_id),
    CONSTRAINT fk_tp_guide FOREIGN KEY (guide_id) REFERENCES training_guides (id) ON DELETE CASCADE,
    CONSTRAINT fk_tp_staff FOREIGN KEY (staff_id) REFERENCES staff           (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id           CHAR(36)  NOT NULL DEFAULT (UUID()),
    progress_id  CHAR(36)  NOT NULL,
    score        INT       NOT NULL,
    passed       TINYINT(1) NOT NULL DEFAULT 0,
    attempted_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_qa_progress_id (progress_id),
    KEY idx_qa_passed      (passed),
    CONSTRAINT fk_qa_progress FOREIGN KEY (progress_id) REFERENCES training_progress (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS training_progress;
DROP TABLE IF EXISTS training_guide_roles;
DROP TABLE IF EXISTS training_guides;
