# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** Per `docs/base/LESSONS_LEARNED_v3.md`, CLAUDE.md should be a map (<150 lines), not a territory. Because most source docs are `.docx` files Claude cannot auto-read, critical rules are kept inline here. When `be/` and `fe/` folders exist, trim this file to pointers only.

---

## Claude Workflow

**Session commands:** `/start [feature]` to begin, `/handoff` to close.

**Prefix system** — read the prefix before the content:

| Prefix | Level | Means |
|---|---|---|
| 💡 SUGGESTION: | Info | Optional improvement — you decide |
| ⚠️ FLAG: | Warning | Doc conflict or ambiguity — must resolve before continuing |
| 🚨 RISK: | High | Latent bug / security hole / data loss potential — stop and read |
| 🔴 STOP: | Critical | Will cause production bug — Claude refuses to proceed until resolved |
| ❓ CLARIFY: | Question | Spec not clear enough — answer to unblock |
| 🔄 REDIRECT: | Change | Wrong direction — Claude proposes better path |

**Workflow:** Read spec + MASTER before coding → clarify DoD → implement → self-review (happy path, error path, race condition, security) → flag risks → `/handoff`.

Full workflow guide: [docs/base/LESSONS_LEARNED_v3.md](docs/base/LESSONS_LEARNED_v3.md)

---

## Project Overview

**Hệ Thống Quản Lý Quán Bánh Cuốn** — online ordering (QR table scan, web) + offline POS (cashier, kitchen display).

- **Backend:** Go 1.22, Gin, sqlc, MySQL 8.0, Redis Stack, Goose
- **Frontend:** Next.js 14 App Router, TypeScript strict, Tailwind v3, Zustand v4, TanStack Query v5, React Hook Form + Zod, shadcn/ui
- **Infra:** Docker Compose, Caddy, GitHub Actions

## Phase Status (April 2026)

| Phase | Status |
|---|---|
| Phase 0 — Architecture & Docs | 95% — API_CONTRACT v1.2 exists ✅; Spec 6+7 still missing |
| Phase 1 — DB Migrations (001–007) | ✅ COMPLETE — `be/migrations/*.sql` on disk |
| Phase 2 — Feature Specs | 71% — Spec 6 (QR/POS) + Spec 7 (Staff) missing |
| Phase 3 — sqlc + Project Setup | 🔄 IN PROGRESS — scaffold done, sqlc generate pending |
| Phase 4 — Backend | ⬜ NOT STARTED |
| Phase 5 — Frontend | ⬜ NOT STARTED |
| Phase 6 — DevOps | 🔄 IN PROGRESS — Dockerfiles + docker-compose.yml done; Caddy + CI pending |
| Phase 7 — Testing + Go-Live | ⬜ NOT STARTED |

**Blockers:**
- **Issue #5:** ✅ RESOLVED → Approach B (derive from `qty_served`, no migration 008)
- **Issue #7:** `POST /api/v1/auth/guest` — token TTL, storage, rate limit still undefined. Blocks `fe/app/table/[tableId]/page.tsx`

## Document Map

Always include in every session: `CLAUDE.md` + `docs/MASTER_v1.2.docx §4` + `docs/contract/ERROR_CONTRACT_v1.1.docx`. Then add task-specific docs from `docs/BanhCuon_ClaudeCode_SessionGuide.docx`.

```
docs/BanhCuon_ClaudeCode_SessionGuide.docx  ← task order + which docs per session
docs/MASTER_v1.2.docx                       ← RBAC, business rules, Redis keys, env vars, design tokens
docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md     ← DB schema source of truth (readable)
docs/qui_trinh/BanhCuon_Project_Checklist.md ← checklist with AC per task (readable)
docs/contract/API_CONTRACT_v1.1.docx        ← API contract (v1.2 not yet written)
docs/contract/ERROR_CONTRACT_v1.1.docx      ← error codes + response format
docs/spec/Spec1_Auth_Updated_v2.docx        ← auth spec (BE + FE)
docs/spec/Spec_2_Products_API_v2_CORRECTED.docx
docs/spec/Spec_3_Menu_Checkout_UI_v2.docx
docs/spec/Spec_4_Orders_API.docx
docs/spec/Spec_5_Payment_Webhooks.docx
docs/claude/CLAUDE_BE.docx                  ← BE Dev role + package conventions
docs/claude/CLAUDE_FE.docx                  ← FE Dev role + folder structure
docs/claude/CLAUDE_DEVOPS.docx              ← DevOps role + docker-compose config
docs/base/LESSONS_LEARNED_v3.md            ← Claude workflow guide (readable)
```

## Commands

```bash
# Backend (run from be/ or project root)
cd be && sqlc generate && cd .. && go build ./...   # always run together
go test ./be/internal/service/... -run TestLogin
goose -dir be/migrations mysql "$DB_DSN" up

# Frontend
cd fe && npm run dev                   # :3000
npx tsc --noEmit                       # type check

# Docker (compose covers MySQL + Redis + migrate + BE + FE)
cp .env.example .env && nano .env   # set JWT_SECRET at minimum (first time)
docker-compose up -d                # starts everything
docker-compose up -d --build        # rebuild images after code changes
docker-compose logs -f be           # tail backend logs
docker-compose down                 # stop (keep volumes)
docker-compose down -v              # stop + wipe volumes
```

## Architecture

**Backend layers** (strict — no cross-layer calls):
`handler` (gin.Context only) → `service` (business logic, testable) → `repository` (sqlc wrappers) → `db` (generated)

**Frontend state** (strict — no mixing):
Server state → TanStack Query | Client state → Zustand | Forms → React Hook Form + Zod | All API calls → `lib/api-client.ts` (single axios instance)

## DB Conventions

Migration order: `001_auth → 002_products → 003_tables → 004_combos → 005_orders → 006_payments → 007_files`

- PKs: `CHAR(36) DEFAULT (UUID())` — never AUTO_INCREMENT, never integer
- Soft delete: `deleted_at DATETIME NULL` — always `WHERE deleted_at IS NULL`
- Currency: `DECIMAL(10,0)` — VND has no decimals

**Critical field names — wrong names cause silent bugs:**

| ❌ Wrong | ✅ Correct | Table |
|---|---|---|
| `base_price` | `price` | products |
| `price_delta` | `price` | toppings |
| `image_url` | `image_path` | products, combos |
| `staff_id` (on orders) | `created_by` | orders |
| `webhook_payload` | `gateway_data` | payments |
| `'success'` | `'completed'` | payments.status |
| `order_items.status` | ❌ does not exist — derive from `qty_served` | order_items |
| `order_items.flagged` | ❌ does not exist — pending Issue #5 | order_items |
| `slug` | ❌ does not exist in any migration | products, categories |

`qty_served` status derivation: `0` = pending · `0 < x < quantity` = preparing · `x == quantity` = done

## Critical Rules (Never Break)

**Auth & Security:**
- Access token: Zustand in-memory ONLY — never `localStorage` / `sessionStorage`
- Refresh token: httpOnly cookie scoped to `/api/v1/auth`
- JWT: verify `t.Method == jwt.SigningMethodHMAC` BEFORE parsing — prevents algorithm confusion attack
- Login: return identical error for wrong username AND wrong password — never reveal which

**Orders:**
- `total_amount` is DENORMALIZED — call `recalculateTotalAmount(orderId)` after EVERY `order_items` mutation
- 1 table = 1 active order — check before INSERT using `idx_orders_table_status`
- Cancel: only if `SUM(qty_served) / SUM(quantity) < 0.30` — else 422 `ORDER_002`
- State machine: `pending → confirmed → preparing → ready → delivered` — no skipping
- `POST /orders` payload: NO `payment_method` field; MUST have `source` (`qr`/`online`/`pos`)

**Payments:**
- Webhook: verify HMAC signature FIRST — before any DB access, before anything
- Idempotency: `payment.status == 'completed'` → return 200 immediately, no reprocessing
- `payments.order_id` is UNIQUE — retries must UPDATE, never INSERT
- VNPay webhook response must be exactly: `{"RspCode": "00", "Message": "Confirm Success"}`
- Never hard delete payments — soft delete only

**Frontend:**
- Never hardcode color hex in code — use Tailwind classes only
- All IDs are `string` (UUID) in TypeScript — never `number`
- SSE auth: `Authorization: Bearer` header | WebSocket auth: `?token=` query param

## Error Response Format

```json
{ "error": "AUTH_001", "message": "human readable" }
```

Use `respondError` helper — never construct error JSON manually. Full codes in `docs/contract/ERROR_CONTRACT_v1.1.docx`.

## RBAC

`customer=1 · chef=2 · cashier=2 · staff=3 · manager=4 · admin=5`

Manager+ = CRUD products/categories/combos/staff. Chef+ = KDS. Cashier+ = POS + payments.

## Realtime

- **SSE** `GET /api/v1/orders/:id/events`: Redis pub/sub `order:{id}:channel`, initial `order_init` event, heartbeat `": keep-alive\n\n"` every 15s, header `X-Accel-Buffering: no`
- **WS** `/ws/kds` `/ws/orders-live` `/ws/payments`: auth via `?token=`, ping 30s, close if no pong 10s
- **FE reconnect** (both SSE + WS): `maxAttempts: 5, baseDelay: 1000ms, maxDelay: 30000ms`, show `ConnectionErrorBanner` after 3 failures

## Design Tokens

```
Primary:    #FF7A1A   Background: #0A0F1E   Card:    #1F2937
Success:    #3DB870   Warning:    #FCD34D   Urgent:  #FC8181
Text:       #F9FAFB   Muted:      #9CA3AF
```
KDS cards: `<10min = #1F2937` · `10-20min = #FCD34D border` · `>20min or flagged = #FC8181 border`
Fonts: `Playfair Display` (headings) · `Be Vietnam Pro` (body)

## Branch Naming

`feature/spec-001-auth` · `fix/auth-refresh-token-null` · `chore/docker-compose-redis-stack`
Issue #5 = Approach B → no `db/008-order-item-status` branch needed.

## Current Work

> Update this section at every `/handoff`. Record: active branch, what was done, what is next.

- **Status:** Phase 3 scaffold complete (2026-04-29). `be/` and `fe/` initialized. Issue #5 resolved (Approach B).
- **Branch:** none yet — repo not initialized.
- **Done this session:** `be/migrations/001–007.sql`, `be/sqlc.yaml`, `be/query/*.sql`, Go module + `be/` scaffold (`go build ./be/... ✅`), Next.js 14 + `fe/src/` structure (`npm run build ✅`, `tsc --noEmit ✅`, `lint ✅`). Fixed code quality issues: error key `"code"` → `"error"`, RBAC levels corrected to 1–5. Reorganized project structure: all docs → `docs/`, BE files → `be/`.
- **Next:** (1) Run `cd be && sqlc generate` once sqlc CLI is installed. (2) Resolve Issue #7 (guest auth). (3) Write Spec 6 + 7. (4) Begin Phase 4 Task 4.1 — Auth backend (`prompts/phase4_1_auth.md`).
