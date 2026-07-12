---
tags: [architecture, be]
---

# Architecture — Backend

**Stack:** Go 1.25 · Gin · sqlc (generated queries) · MySQL 8.0 · Redis Stack · Goose migrations

## Strict layering

```
handler → service → repository → db (sqlc generated)
```

- `be/internal/handler/` — HTTP handlers, request binding, `respond.go` error envelope
- `be/internal/service/` — business rules (see [[Concept - Order Lifecycle]], [[Concept - RBAC]])
- `be/internal/repository/` — DB access wrapping sqlc
- `be/internal/db/` — sqlc-generated code (never hand-edited)
- `be/internal/middleware/` — auth (JWT), RBAC guards
- `be/migrations/` — Goose migrations · `be/queries/` — sqlc SQL sources

## Domains

[[BE - Auth]] · [[BE - Products & Menu]] · [[BE - Orders]] · [[BE - Payment]] · [[BE - Tables & QR]] · [[BE - Staff]] · [[BE - Analytics]] · [[BE - Ingredients]] · [[BE - Tasks & Todo]] · [[BE - Training]] · [[BE - Marketing]] · [[BE - Chat AI]] · [[BE - Realtime & Jobs]]

## Key commands

```bash
cd be && sqlc generate && cd .. && go build ./...
goose -dir be/migrations mysql "$DB_DSN" up
```

## Canonical docs

- `docs/be/BE_DOC_INDEX.md` — BE navigation map (start here for any BE task)
- `docs/be/be_code_summary/` — routes · DTOs · errors · schema · env (read instead of grepping source)
- `docs/be/BE_SYSTEM_GUIDE.md` — primary BE guide
- See [[Docs - Contracts]] for API + error contracts
