# Phase 4.6 — Remaining Backend Endpoints
> Dependency: Tasks 4.3 + 4.5 complete ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §4
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `Task/Task 1 data base/003_tables_sql_v1.2.docx`
- [ ] `Task/Task 1 data base/007_files_sql_v1.2.docx` (if exists)
- [ ] `contract/API_CONTRACT_v1.1.docx` §6 §7
- [ ] `fe/spec/Spec_6_QR_POS.docx` (write this in Phase 0 first)

---

## Prompt

```
You are the BE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §4, ERROR_CONTRACT, 003_tables.sql, 
007_files.sql, API_CONTRACT §6+§7, and Spec_6_QR_POS above.

## Task: Build remaining endpoints (Task 4.6)

### 1. GET /api/v1/tables/qr/:token
Query: SELECT * FROM tables WHERE qr_token=? AND is_active=1 AND deleted_at IS NULL
Return: { table_id, table_name, capacity }
Used by FE /table/[tableId] page to validate QR scan.
Not found or inactive → 404.

### 2. POST /api/v1/files/upload
Accept: multipart/form-data
Validate:
- File size <= 10MB → else 422 FILE_001
- mime type must start with image/ or be application/pdf → else 422 FILE_002
Save to storage (local disk or S3-compatible).
Create file_attachments record with is_orphan=1.
Return: { id: string, object_path: string }
🚨 Never return full URL — return object_path (relative). FE builds URL using STORAGE_BASE_URL.

### 3. be/internal/jobs/file_cleanup.go
Run every 6 hours using time.Ticker.
DELETE FROM file_attachments WHERE is_orphan=1 AND created_at < NOW() - INTERVAL 24 HOUR
Also delete actual files from storage.
🚨 Wrap in goroutine with defer recover() — panic MUST NOT crash the server.

Start the job in cmd/server/main.go: go fileCleanup.Run()

## Definition of Done
- [ ] GET /tables/qr/:token returns table info for valid active token
- [ ] GET /tables/qr/:token returns 404 for invalid or inactive token
- [ ] POST /files/upload rejects file > 10MB with FILE_001
- [ ] POST /files/upload rejects non-image/pdf with FILE_002
- [ ] POST /files/upload returns object_path (relative), NOT full URL
- [ ] Cleanup job runs every 6h, panics are caught by defer recover()
- [ ] go build ./... passes
```
