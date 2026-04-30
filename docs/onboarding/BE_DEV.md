# Onboarding — Backend Developer

> Read this first. Then open `docs/be/BE_SYSTEM_GUIDE.md` and go.

---

## Your Stack

Go 1.25 · Gin · sqlc · MySQL 8.0 · Redis Stack 7 · Goose · Docker Compose

## Your Entry Point

**`docs/be/BE_SYSTEM_GUIDE.md`** — start every session here. It has the full epic list, scaffold state, code patterns, and what to read per domain.

## Architecture (memorize this)

```
HTTP → handler → service → repository → db (sqlc-generated)
                               ↕
                            pkg/ (jwt · bcrypt · redis)
```

Never skip a layer. Handler calls service. Service calls repository. Repository calls sqlc.

## Your First 3 Tasks (in order)

1. **DO-4** — Create `.env.example` + `scripts/migrate.sh` (unblocks local dev)
2. **BE-1** — Run migration `008_order_groups.sql` (see `docs/TASKS.md` P1-8)
3. **BE-2** — Write `be/internal/handler/auth_handler.go` — 5 handlers (Login · Refresh · Logout · GetMe · GuestLogin)

> For BE-2: read `docs/spec/Spec1_Auth_Updated_v2.md` + `docs/contract/ERROR_CONTRACT_v1.1.md` before writing any code.

## What's Already Done (do not recreate)

- `be/internal/db/` — sqlc-generated (do not edit)
- `be/internal/service/auth_service.go` — all auth business logic done
- `be/internal/repository/auth_repo.go` — all auth DB queries done
- `be/internal/middleware/auth.go` + `rbac.go` — done
- `be/pkg/jwt/` · `bcrypt/` · `redis/` — done
- Migrations 001–007 — done

## Key Rules

| Rule | Why |
|---|---|
| Handler must NOT contain business logic | Put it in service |
| Service must NOT import gin | Keeps it testable |
| Always use `respondError()` from `handler/respond.go` | Error format contract |
| DB field names from `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` | Single source of truth |
| Error codes from `docs/contract/ERROR_CONTRACT_v1.1.md` | Never invent new codes |

## Branch Naming

`feature/spec-001-auth` · `fix/auth-refresh-token-null`

## Useful Commands

```bash
cd be && go build ./...
go test ./be/internal/service/... -run TestLogin
goose -dir be/migrations mysql "$DB_DSN" up
docker compose logs -f be
docker compose up -d --build be
```
