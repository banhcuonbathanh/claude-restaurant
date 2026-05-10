# be/CLAUDE.md

> Tầng 1 — BE map only. KHÔNG chứa: business rules, schema, error codes.
> Full BE dev guide → `docs/claude/CLAUDE_BE.md`

---

## Đọc Trước Khi Code (Tầng 2)

| Cần Gì | File | Section |
|---|---|---|
| Full BE dev guide (roles, protocol) | `docs/claude/CLAUDE_BE.md` | tất cả |
| Business rules (order, payment, cancel) | `docs/core/MASTER_v1.2.md` | §4 |
| RBAC + JWT config | `docs/core/MASTER_v1.2.md` | §3, §6 |
| DB field names (SINGLE SOURCE) | `docs/be/DB_SCHEMA_SUMMARY.md` | — |
| API request/response shape | `docs/contract/API_CONTRACT_v1.2.md` | §2–§10 |
| Error codes + respondError() | `docs/contract/ERROR_CONTRACT_v1.1.md` | — |
| Domain logic + sqlc queries | `docs/spec/Spec1_Auth_Updated_v2.md` … | per domain |

## Architecture (Strict — No Skipping Layers)

```
handler → service → repository → db (sqlc generated)
```

```
be/
├── cmd/server/main.go          ← entry point, DI wiring
├── internal/
│   ├── handler/                ← gin.Context only, no business logic
│   ├── service/                ← business logic (testable, no gin)
│   ├── repository/             ← sqlc wrappers only
│   ├── middleware/             ← auth.go · rbac.go · ratelimit.go
│   └── model/                  ← request/response DTOs
└── pkg/                        ← reusable (jwt, bcrypt) — no import cycle
```

## Commands

```bash
# từ repo root
go build ./...
go test ./be/internal/service/... -run TestLogin
goose -dir be/migrations mysql "$DB_DSN" up
sqlc generate                                  # chạy sau khi thay đổi .sql queries
docker compose up -d --build be               # rebuild BE container
docker compose logs -f be
```

## Critical Pointers

- Middleware order → `docs/core/MASTER_v1.2.md §7.1`
- Guest JWT (`sub='guest'`) vs staff JWT → `docs/core/MASTER_v1.2.md §6.4`
- `respondError()` pattern → `docs/contract/ERROR_CONTRACT_v1.1.md`
- `order_items.status` KHÔNG tồn tại (Issue #5 Approach B) → `docs/core/MASTER_v1.2.md §4`

## Root Context

Root map → `../CLAUDE.md` · Phase status + branch → root CLAUDE.md §Phase Status
