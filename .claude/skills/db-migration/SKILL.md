---
description: Apply whenever writing a new DB migration, running goose, or running sqlc generate. Encodes the required sequence and common mistakes for this project's Goose + sqlc + MySQL workflow.
---

# DB Migration Skill — BanhCuon Project

## Required sequence (every time a migration touches columns)

```bash
# 1. Write/edit migration file in be/migrations/
# 2. Apply migration
goose -dir be/migrations mysql "$DB_DSN" up

# 3. Regenerate sqlc — MANDATORY after any ADD/DROP COLUMN
cd be && sqlc generate

# 4. Verify build compiles
go build ./...
```

**Why sqlc generate is mandatory:** sqlc generates Go structs from SQL. Without regenerating, `db.Model` structs miss new fields, `SELECT *` scans fail at runtime with silent data loss or compile errors. Run it immediately — before writing any code that references the new column.

---

## Migration file naming

```
be/migrations/NNN_description.sql
```

Example: `009_add_ingredients.sql` → next would be `010_add_table_notes.sql`

Current highest: migration `009` (ingredients).

---

## Goose SQL format

```sql
-- +goose Up
ALTER TABLE products ADD COLUMN notes TEXT;

-- +goose Down
ALTER TABLE products DROP COLUMN notes;
```

Always write the Down section — enables rollback.

---

## sqlc config location

```
be/sqlc.yaml
```

After any schema change, check that `sqlc.yaml` still points to the correct query files if you added a new `.sql` query file.

---

## Critical field name rules (sqlc will compile but produce wrong data if mismatched)

| Wrong | Correct |
|---|---|
| `base_price` | `price` |
| `image_url` | `image_path` |
| `webhook_payload` | `gateway_data` |
| `staff_id` | `created_by` |
| `id INT` | `id CHAR(36)` (UUID) |

All IDs are `CHAR(36)` UUID strings — never auto-increment integers.

---

## Soft deletes (all main tables use this pattern)

```sql
-- Most tables have deleted_at TIMESTAMP NULL or is_active TINYINT(1)
-- Every list query must filter:
WHERE deleted_at IS NULL
-- or
WHERE is_active = 1
```

---

## After migration checklist

- [ ] `goose up` ran without error
- [ ] `sqlc generate` ran without error
- [ ] `go build ./...` passes
- [ ] Any new query files added to `be/internal/db/` and referenced in service/repository
- [ ] `recalculateTotalAmount` still works if order_items was touched
