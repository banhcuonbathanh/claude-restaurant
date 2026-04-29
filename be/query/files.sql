-- name: CreateFileAttachment :exec
INSERT INTO file_attachments (id, object_path, original_name, mime_type, size_bytes, uploaded_by, is_orphan)
VALUES (?, ?, ?, ?, ?, ?, 1);

-- name: GetFileAttachmentByID :one
SELECT * FROM file_attachments
WHERE id = ?
LIMIT 1;

-- name: LinkFileToEntity :exec
UPDATE file_attachments
SET is_orphan = 0, entity_type = ?, entity_id = ?, updated_at = NOW()
WHERE id = ?;

-- name: ListOrphanFilesOlderThan24h :many
SELECT * FROM file_attachments
WHERE is_orphan = 1
  AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- name: DeleteOrphanFilesOlderThan24h :exec
DELETE FROM file_attachments
WHERE is_orphan = 1
  AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
