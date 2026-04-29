# Phase 3.1 — sqlc Setup + Auth Queries
> Dependency: Phase 1 complete ✅ + Issue #5 resolved

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §4
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `Task/Task 2 sqlc set up and auth queries/SQLC_SETUP.docx`
- [ ] `Task/Task 1 data base/001_auth_sql_v1.2.docx`
- [ ] `Task/BanhCuon_DB_SCHEMA_SUMMARY.md`

---

## Prompt

```
You are the DB Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §4, ERROR_CONTRACT, SQLC_SETUP.docx, 
001_auth.sql, and DB_SCHEMA_SUMMARY.md above.

## Task: Create sqlc.yaml + query/auth.sql

Create the following files:

1. `sqlc.yaml` in project root
   - engine: mysql
   - emit_json_tags: true
   - emit_prepared_queries: false
   - Input: migrations/*.sql
   - Output: be/internal/db/

2. `query/auth.sql` with these 8 queries (use SQLC_SETUP.docx annotations):
   - GetStaffByUsername — :one, WHERE deleted_at IS NULL
   - GetStaffByID — :one, used by middleware
   - CreateRefreshToken — :exec
   - GetRefreshToken — :one, by token_hash
   - DeleteRefreshToken — :exec, by token_hash (single logout)
   - DeleteRefreshTokensByStaff — :exec, by staff_id (revoke all)
   - SetStaffActive — :exec, update is_active + updated_at
   - ListActiveSessionsByStaff — :many, ORDER BY last_used_at ASC

After writing, run: sqlc generate && go build ./...
Fix any compile errors before declaring done.

## Definition of Done
- [ ] sqlc.yaml is valid, sqlc generate runs without error
- [ ] Generated structs in be/internal/db/ use correct field names:
      price (not base_price), image_path (not image_url), 
      created_by (not staff_id), gateway_data (not webhook_payload)
- [ ] go build ./... passes with no errors
- [ ] No raw SQL strings anywhere — all DB access through generated Querier interface
```
