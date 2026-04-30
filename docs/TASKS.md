# Project Task Tracker — Hệ Thống Quản Lý Quán Bánh Cuốn

> **Version:** v1.0 · 2026-04-29
> **Rule:** Update status here after every task. ⬜ = not started · 🔄 = in progress · ✅ = done · 🔴 = blocked
> **Before starting any task:** `git checkout -b feature/<task-id>-<short-name>` (e.g. `feature/p1-8-order-groups`), then follow `docs/IMPLEMENTATION_WORKFLOW.md` — READ → PLAN → ALIGN → IMPLEMENT → REVIEW → TEST → DONE

---

## Phase Status Overview

| Phase | Status | Progress |
|---|---|---|
| Phase 0 — Docs & Architecture | ✅ COMPLETE | 100% |
| Phase 1 — DB Migrations (001–008) | ✅ COMPLETE | 100% |
| Phase 2 — Feature Specs | ✅ COMPLETE | 100% (7/7) |
| Phase 3 — sqlc + Project Setup | ✅ COMPLETE | 100% (sqlc generated + field names verified) |
| Phase 4 — Backend Implementation | ✅ COMPLETE | 100% (all domains coded + all AC verified and fixed) |
| Phase 5 — Frontend Implementation | ⬜ NOT STARTED | 0% (scaffold stubs only) |
| Phase 6 — DevOps / Infrastructure | 🔄 IN PROGRESS | 40% (Dockerfiles + compose done) |
| Phase 7 — Testing & Go-Live | ⬜ NOT STARTED | 0% |

---

## Phase 0 — Docs & Architecture (Addendum)

> **Doc Restructuring — 2026-04-30:** Replaced navigation-only index files with comprehensive system guides.

| ID | Status | Task | Notes |
|---|---|---|---|
| P0-A1 | ✅ | Create `docs/be/BE_SYSTEM_GUIDE.md` — comprehensive BE manual (8 epics · business rules · auth flow · error codes · DI pattern · code patterns · per-epic reading list) | Supersedes BE_DOC_INDEX.md as primary guide |
| P0-A2 | ✅ | Create `docs/fe/FE_SYSTEM_GUIDE.md` — comprehensive FE manual (8 epics · design tokens · TS conventions · auth/token rules · all code patterns · per-epic reading list) | Supersedes FE_DOC_INDEX.md as primary guide |

---

## Phase 1 — DB Migrations (Addendum)

> **Migration 008 — Multi-table Group support**

| ID | Status | Task | Notes |
|---|---|---|---|
| P1-8 | ✅ | Run migration `008_order_groups.sql` — adds `group_id CHAR(36) NULL` + index to `orders` table | See [008_order_groups.sql.md](task/task1_database/Ver%202/008_order_groups.sql.md) |

---

## Phase 2 — Feature Specs

> **Owner:** BA · **Dependency:** none · **Blocks:** Phase 4.6 (QR endpoint), Phase 5 (table page)

| ID | Status | Task | Spec Ref |
|---|---|---|---|
| P2-1 | ✅ | Write `docs/spec/Spec_6_QR_POS.md` — QR token decode flow, guest auth, table assignment, offline POS edge cases, active-order-on-scan conflict, multi-table group, staff-orders-for-customer, per-item toppings | Spec 6 |
| P2-2 | ✅ | Write `docs/spec/Spec_7_Staff_Management.md` — CRUD staff, deactivation, cache invalidation, manager cannot deactivate own account | Spec 7 |

---

## Phase 3 — sqlc + Project Setup

> **Owner:** DB Dev · **Dependency:** Phase 1 ✅ · **Blocks:** Phase 4 entirely

| ID | Status | Task | Notes |
|---|---|---|---|
| P3-1 | ✅ | Install sqlc CLI and run `sqlc generate` → creates `be/internal/db/` (models + querier) | `cd be && sqlc generate` |
| P3-2 | ✅ | Verify generated struct field names — must match schema: `price` not `base_price`, `image_path` not `image_url`, `created_by` not `staff_id`, `gateway_data` not `webhook_payload`, payment status `completed` not `success` | Read `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` |

---

## Phase 4 — Backend Implementation

> **Dependency:** Phase 3 ✅ · **Order is strict:** 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6
> **Spec refs:** Spec1 (Auth) · Spec2 (Products) · Spec4 (Orders) · Spec5 (Payments)

### Task 4.1 — Auth Backend 🔴 MUST BE FIRST

| ID | Status | Task | AC |
|---|---|---|---|
| 4.1-1 | ✅ | `be/pkg/redis/pubsub.go` — Publish, Subscribe, Unsubscribe wrappers | — |
| 4.1-2 | ✅ | `be/pkg/redis/bloom.go` — Add, Exists (for `bloom:order_exists`, `bloom:product_ids`) | — |
| 4.1-3 | ✅ | `be/internal/repository/auth_repo.go` — Wrap all sqlc auth queries (GetStaffByUsername, GetStaffByID, CreateRefreshToken, GetRefreshToken, DeleteRefreshToken, DeleteRefreshTokensByStaff, SetStaffActive, ListActiveSessionsByStaff) | — |
| 4.1-4 | ✅ | `be/internal/service/auth_service.go` — Login (rate limit check → bcrypt → access token → refresh token → max 5 sessions), Refresh, Logout, GetMe, GuestLogin, DeactivateStaff, ReactivateStaff | Spec1 AC |
| 4.1-5 | ✅ | `be/internal/middleware/auth.go` — parse Bearer, JWT validate, set claims/staff_id/role in context, httpOnly cookie helpers | Spec1 AC |
| 4.1-6 | ✅ | `be/internal/handler/auth_handler.go` — POST /login (httpOnly cookie), POST /refresh, POST /logout, GET /me, POST /guest | Spec1 AC |
| 4.1-AC | ✅ | Verify all Acceptance Criteria from Spec1: wrong-password same error, 6th login → 429, dual sessions, single logout, admin deactivate → 401, is_active Redis cache hit, error format `{"error":"AUTH_001","message":"..."}` | Spec1 |

### Task 4.2 — Products Backend

> **Dependency:** 4.1 auth middleware working

| ID | Status | Task | AC |
|---|---|---|---|
| 4.2-1 | ✅ | `be/internal/repository/product_repo.go` — Wrap all sqlc product/category/topping/combo queries | — |
| 4.2-2 | ✅ | `be/internal/service/product_service.go` — CRUD products/categories/toppings/combos + Redis cache (TTL 5min, invalidate on every write) | Spec2 AC |
| 4.2-3 | ✅ | `be/internal/handler/product_handler.go` — All 20+ endpoints: GET public endpoints, POST/PATCH/DELETE require Manager+ (RequireRole(4)) | Spec2 AC |
| 4.2-AC | ✅ | Verify: `price` field (not `price_delta`), `category_id`+`sort_order` in combos, soft delete, `is_available` filter, Redis invalidated on write, IDs are UUID strings, `image_path` is relative path | Spec2 |

### Task 4.3 — Orders Backend

> **Dependency:** 4.2 products working

| ID | Status | Task | AC |
|---|---|---|---|
| 4.3-1 | ✅ | `be/internal/repository/order_repo.go` — Wrap all sqlc order queries | — |
| 4.3-2 | ✅ | `be/internal/service/order_service.go` — CreateOrder (1-table-1-active check, combo expansion in TX, order_seq from Redis, WS publish), CancelOrder (30% rule, SSE publish), UpdateItemStatus (qty_served cycle, auto-ready), GetOrder (customer visibility check), UpdateOrderStatus (state machine validation) | Spec4 AC |
| 4.3-3 | ✅ | `be/internal/sse/handler.go` — SSE headers (`text/event-stream`, `X-Accel-Buffering: no`), Redis pub/sub subscribe, initial state event, 15s heartbeat | Spec4 AC |
| 4.3-4 | ✅ | `be/internal/handler/order_handler.go` — POST /orders, GET /orders, GET /orders/:id, PATCH /orders/:id/status, DELETE /orders/:id, PATCH items/:itemId/status, PATCH items/:itemId/flag, GET /orders/:id/events (SSE) | Spec4 AC |
| 4.3-5 | ✅ | `be/internal/service/group_service.go` — full implementation: CreateGroup, AddToGroup, GetGroupOrders, RemoveFromGroup, DisbandGroup, HasOrderInGroup; ErrAlreadyGrouped sentinel added | Spec4 §12 |
| 4.3-6 | ✅ | `be/internal/handler/group_handler.go` — full handlers: CreateGroup, GetGroup, AddToGroup, RemoveFromGroup, DisbandGroup; routes wired in main.go with correct RBAC (Cashier+ create/add/remove, Manager+ disband) | Spec4 §12 |
| 4.3-7 | ✅ | `be/internal/sse/group_handler.go` — StreamGroup: subscribes to Redis `group:{id}`, sends full snapshot on connect + on every event, 15s heartbeat | Spec4 §12.4 |
| 4.3-AC | ✅ | Verify: combo expansion creates parent+sub-items, 1-table-1-active → 409, invalid state transition rejected, chef click → SSE to customer, cancel <30% success, cancel ≥30% → 422, customer cannot see other orders, WS `new_order` on create, SSE heartbeat 15s, group AC-G1 through AC-G8 | Spec4 |

### Task 4.4 — WebSocket Hub

> **Dependency:** 4.3 orders working

| ID | Status | Task | AC |
|---|---|---|---|
| 4.4-1 | ✅ | `be/internal/websocket/hub.go` — Hub struct with sync.RWMutex, Run() goroutine (register/unregister/broadcast), ping 30s/pong deadline 10s | — |
| 4.4-2 | ✅ | `be/internal/websocket/client.go` — Client struct, readPump (read deadline 60s), writePump (write deadline 10s) | — |
| 4.4-3 | ✅ | `be/internal/websocket/handler.go` — HTTP upgrade, JWT auth via `?token=` query param, register client with Hub | — |
| 4.4-4 | ✅ | Register WS routes in main.go: `WS /api/v1/ws/kds` (Chef+), `WS /api/v1/ws/orders-live` (Cashier+) | — |

### Task 4.5 — Payments Backend

> **Dependency:** 4.3 orders working · ⚠️ Always confirm before running payment code — real money

| ID | Status | Task | AC |
|---|---|---|---|
| 4.5-1 | ✅ | `be/internal/payment/vnpay.go` — CreatePaymentURL, VerifyWebhook (HMAC-SHA512: remove hash key → sort → concat → compare) | Spec5 AC |
| 4.5-2 | ✅ | `be/internal/payment/momo.go` — CreatePayment, VerifyCallback (HMAC-SHA256) | Spec5 AC |
| 4.5-3 | ✅ | `be/internal/payment/zalopay.go` — CreateOrder, VerifyCallback (HMAC-SHA256) | Spec5 AC |
| 4.5-4 | ✅ | `be/internal/repository/payment_repo.go` + `be/internal/service/payment_service.go` — create, get, update status, idempotency check | Spec5 AC |
| 4.5-5 | ✅ | `be/internal/handler/payment_handler.go` — POST /payments (verify order.status=ready), GET /payments/:id, POST /webhooks/vnpay (HMAC first, idempotent, VNPay response format), POST /webhooks/momo, POST /webhooks/zalopay | Spec5 AC |
| 4.5-6 | ✅ | `be/internal/jobs/payment_timeout.go` — polling ticker every 1min (⚠️ implemented as polling, NOT Redis keyspace notifications as spec said — simpler, no Redis config needed) | — |
| 4.5-AC | ✅ | Verify: payment rejected when order≠ready, COD immediate complete, QR returns qr_code_url, bad HMAC → rejected no DB change, duplicate webhook → no-op, amount mismatch → reject, raw webhook stored in gateway_data, WS broadcasts payment_success | Spec5 |

### Task 4.6 — Remaining Endpoints

> **Dependency:** 4.1 auth working · P2-1 Spec6 written

| ID | Status | Task | AC |
|---|---|---|---|
| 4.6-1 | ✅ | `GET /api/v1/tables/qr/:token` — Query tables WHERE qr_token=? AND is_active=1 AND deleted_at IS NULL, return table_id/name/capacity | Spec6 |
| 4.6-2 | ✅ | `POST /api/v1/files/upload` — Multipart, validate size ≤10MB (FILE_001), mime = image/* or PDF (FILE_002), save file, create orphan record, return `{id, object_path}` | — |
| 4.6-3 | ✅ | `be/internal/jobs/file_cleanup.go` — Ticker every 6h, DELETE orphan files > 24h old, wrapped in goroutine with `defer recover()` | — |
| 4.6-4 | ✅ | Wire all routes + DI in `be/cmd/server/main.go` — graceful shutdown (SIGTERM), health check endpoint `/health` | — |

---

## Phase 5 — Frontend Implementation

> **Dependency:** Phase 4.1 auth ✅ + API_CONTRACT exists · **Order:** 5.1 → 5.2 → 5.3 → 5.4 → 5.5
> **Critical rules:** No localStorage for tokens · No hardcoded colors · All IDs are string (UUID) · Server state → TanStack Query · Client state → Zustand · Forms → RHF+Zod

### Task 5.1 — Auth Flow

| ID | Status | Task | AC |
|---|---|---|---|
| 5.1-1 | ⬜ | `fe/src/lib/api-client.ts` — Axios instance, request interceptor (attach Bearer from Zustand), response interceptor (401 → refresh → retry once, 2nd 401 → clear store → redirect /login), withCredentials: true | Spec1 FE AC |
| 5.1-2 | ⬜ | `fe/src/features/auth/auth.store.ts` — Zustand: `user`, `accessToken` (memory only, never localStorage), setAuth, clearAuth | Spec1 FE AC |
| 5.1-3 | ⬜ | `fe/src/features/auth/auth.api.ts` — login, logout, refreshToken, getMe | — |
| 5.1-4 | ⬜ | `fe/src/app/(auth)/login/page.tsx` — RHF + Zod (username min 3, password min 6), role-based redirect (chef→/kds, cashier→/pos, manager/admin→/dashboard, customer→/menu), inline error on wrong credentials | Spec1 FE AC |
| 5.1-5 | ⬜ | `fe/src/components/guards/AuthGuard.tsx` — On mount: if no token → try getMe() → if fails → redirect /login | — |
| 5.1-6 | ⬜ | `fe/src/components/guards/RoleGuard.tsx` — Role value compare, show 403 page (not redirect) if insufficient | — |
| 5.1-AC | ⬜ | Verify: token never in localStorage (DevTools check), F5 → silent session restore, 401 → auto refresh → retry, 2nd 401 → /login, wrong role → 403 page | Spec1 FE |

### Task 5.2 — Menu & Cart

> **Dependency:** 5.1 auth + 4.2 products API working

| ID | Status | Task | AC |
|---|---|---|---|
| 5.2-1 | ⬜ | `fe/src/types/product.ts` — Topping, Product, ComboItem, Combo interfaces (NO slug, NO base_price, NO image_url, NO price_delta) | Spec3 |
| 5.2-2 | ⬜ | `fe/src/types/order.ts` + `fe/src/types/cart.ts` — CartItem, Order, OrderItem, itemStatus derive function | Spec4 |
| 5.2-3 | ⬜ | `fe/src/store/cart.ts` — CartStore: items, tableId, paymentMethod, addItem (dedup same product+toppings → increment qty), removeItem, updateQty, clearCart, setTableId, setPaymentMethod, computed: total, itemCount | Spec3 |
| 5.2-4 | ⬜ | `fe/src/components/menu/CategoryTabs.tsx` — Sticky, horizontal scroll mobile, active = `border-b-2 border-orange-500` | Spec3 |
| 5.2-5 | ⬜ | `fe/src/components/menu/ProductCard.tsx` — image_path, name, formatVND(price) in orange, "+Thêm" button, "Hết" badge if !is_available | Spec3 |
| 5.2-6 | ⬜ | `fe/src/components/menu/ToppingModal.tsx` — Checkbox list, `+{price}₫` per topping, footer total = product.price + sum(selected topping prices) | Spec3 |
| 5.2-7 | ⬜ | `fe/src/components/menu/ComboModal.tsx` — Combo image, combo_items list with quantities, confirm button | Spec3 |
| 5.2-8 | ⬜ | `fe/src/components/menu/CartDrawer.tsx` — Slide-in from right, qty stepper, total, "Thanh toán" → /checkout | Spec3 |
| 5.2-9 | ⬜ | `fe/src/app/(shop)/menu/page.tsx` — TanStack Query for products, CategoryTabs, ProductCard grid, CartDrawer | Spec3 AC |
| 5.2-10 | ⬜ | `fe/src/app/table/[tableId]/page.tsx` — POST /auth/guest → store token in Zustand (not localStorage) → cartStore.setTableId() → redirect /menu | Spec6 |

### Task 5.3 — Checkout & Order Tracking

> **Dependency:** 5.2 cart + 4.3 orders API working

| ID | Status | Task | AC |
|---|---|---|---|
| 5.3-1 | ⬜ | `fe/src/app/(shop)/checkout/page.tsx` — Guard: empty cart → redirect /menu. RHF + Zod schema (customer_name, phone regex, note, payment_method enum). Submit: setPaymentMethod → POST /orders (NO payment_method in body, HAS source field) → clearCart → redirect `/order/${id}` | Spec3 AC |
| 5.3-2 | ⬜ | `fe/src/hooks/useOrderSSE.ts` — SSE to `/orders/:id/events`, Authorization Bearer header (not query param), exponential backoff (maxAttempts=5, base=1s, max=30s), set connectionError after 3 fails | Spec3 AC |
| 5.3-3 | ⬜ | `fe/src/app/(shop)/order/[id]/page.tsx` — useOrderSSE, progress bar `Math.round((totalServed/totalQty)*100)%`, item list with StatusBadge, cancel button only if `<30% && status!=='delivered'`, confirm modal before DELETE /orders/:id, ConnectionErrorBanner after 3 fails | Spec3 AC |
| 5.3-4 | ⬜ | `fe/src/components/shared/StatusBadge.tsx`, `ConnectionErrorBanner.tsx`, `EmptyState.tsx` | — |
| 5.3-AC | ⬜ | Verify: POST payload has no payment_method field + has source field, SSE uses Bearer not query param, token from Zustand (not localStorage), progress bar updates real-time, cancel button <30% only, banner after 3 SSE fails, all prices use formatVND() | Spec3 |

### Task 5.4 — KDS Screen

> **Dependency:** 4.4 WebSocket hub working

| ID | Status | Task | AC |
|---|---|---|---|
| 5.4-1 | ⬜ | `fe/src/app/(dashboard)/kds/page.tsx` — Full-screen bg `#0A0F1E`, WS `/ws/kds?token={accessToken}`, same WS_RECONNECT config as SSE. Cards: table+order number, timestamp, elapsed time, item list (sub-items only, not combo header). Color: <10min normal, 10-20min yellow border, >20min or flagged red border. Click item → PATCH status cycle. Flag → PATCH flag toggle. Sound alert on new_order (Web Audio API). | Spec4 FE |

### Task 5.5 — POS & Payment UI

> **Dependency:** 4.5 payments backend working

| ID | Status | Task | AC |
|---|---|---|---|
| 5.5-1 | ⬜ | `fe/src/app/(dashboard)/pos/page.tsx` — 2-column layout (menu browse left, order summary right), RoleGuard Cashier+, POST /orders with `customer_name="Khách tại quán"` / `customer_phone="0000000000"`, navigate to payment page when order.status = 'ready' | Spec5 FE |
| 5.5-2 | ⬜ | `fe/src/app/(dashboard)/cashier/payment/[id]/page.tsx` — Show order total, QR image from POST /payments response, subscribe WS `payment_success`, on success: toast → window.print() → redirect /pos. COD button → immediate. Optional proof upload via PATCH /payments/:id/proof. Print: `@media print { .no-print { display: none } }` | Spec5 FE AC |

---

## Phase 6 — DevOps / Infrastructure

> **Can run in parallel with Phase 4** · Owner: DevOps · Ref: `docs/claude/CLAUDE_DEVOPS.md`

| ID | Status | Task | Notes |
|---|---|---|---|
| 6-1 | ⬜ | `.env.example` — All vars from MASTER §9: DB_DSN, REDIS_URL, JWT_SECRET, JWT_ACCESS_TTL, JWT_REFRESH_TTL, STORAGE_*, VNPAY_*, MOMO_*, ZALOPAY_*, WEBHOOK_BASE_URL, CORS_ORIGINS, PORT | MASTER §9 |
| 6-2 | ⬜ | `scripts/migrate.sh` — Wait for MySQL (mysqladmin ping loop), run `goose -dir /migrations mysql "$DB_DSN" up`, exec server | — |
| 6-3 | ⬜ | `Caddyfile` — Route `/api/*` and `/webhooks/*` → backend:8080, everything else → frontend:3000 | — |
| 6-4 | ⬜ | Update `docker-compose.yml` — Add MySQL health check (`mysqladmin ping`), Redis health check (`redis-cli ping`), Caddy service (ports 80+443), correct depends_on ordering | — |
| 6-5 | ⬜ | `.github/workflows/deploy.yml` — Trigger: push to main. Steps: checkout → build images → push registry → SSH deploy (`docker compose pull && up -d`) + rollback step | — |
| 6-6 | ⬜ | `README.md` — Local dev setup (docker compose up), port map, migration commands, sqlc generate, env vars guide (link to .env.example) | — |

---

## Phase 7 — Testing & Go-Live

> **Dependency:** Phase 4 + Phase 5 substantially complete

### Unit Tests

| ID | Status | Task | Test Cases |
|---|---|---|---|
| 7-1 | ⬜ | `be/internal/service/auth_service_test.go` | TestLogin_WrongPassword, TestLogin_RateLimitAfter5Fails, TestMultiSessionLogin, TestLogoutSingleSession, TestAccountDisabledImmediate, TestTokenRotation |
| 7-2 | ⬜ | `be/internal/service/order_service_test.go` | TestCreateOrder_ComboExpand, TestCreateOrder_DuplicateTable, TestCancelOrder_Under30Percent, TestCancelOrder_Over30Percent, TestItemStatusCycle, TestAutoReadyWhenAllItemsDone |
| 7-3 | ⬜ | `be/internal/handler/payment_handler_test.go` | TestVNPayWebhook_ValidSignature, TestVNPayWebhook_InvalidSignature, TestVNPayWebhook_Idempotent, TestCreatePayment_OrderNotReady |
| 7-4 | ⬜ | `fe/src/store/cart.store.test.ts` + `fe/src/lib/utils.test.ts` | TestAddSameItemIncreasesQty, TestRemoveItem, TestClearCart, TestTotalCalculation, TestFormatVND, TestFormatPercent |

### Integration & Sandbox Tests

| ID | Status | Task |
|---|---|---|
| 7-5 | ⬜ | Integration test suite — all API endpoints against test DB, SSE reconnect behavior, WS reconnect exponential backoff |
| 7-6 | ⬜ | `scripts/seed.sql` — 3+ categories, 10+ products, 5+ toppings, 2+ combos, 4 staff accounts (chef/cashier/manager/admin, bcrypt hashed), 5+ tables with qr_token values |
| 7-7 | ⬜ | Payment sandbox — VNPay + MoMo via ngrok. Test: full QR flow, signature rejection, double-webhook idempotency, amount mismatch rejection |

### UAT & Compliance

| ID | Status | Task |
|---|---|---|
| 7-8 | ⬜ | `docs/UAT_Plan.md` — Test cases per spec, stakeholder sign-off checklist, bug severity P0/P1/P2 |
| 7-9 | ⬜ | Compliance: `/privacy-policy` page, `/terms` page, cookie consent banner. Verify PCI-DSS: card numbers never stored |

### Go-Live

| ID | Status | Task |
|---|---|---|
| 7-10 | ⬜ | DNS A record → VPS IP, Caddy SSL auto-cert, set all prod env vars (never commit .env), `goose up` on prod DB, run seed, test login + order + payment |
| 7-11 | ⬜ | Monitoring: error rate alert >5% → notify, response time alert >500ms → notify, log aggregation (Docker logs → Loki or CloudWatch) |
| 7-12 | ⬜ | Rollback plan documented: `docker pull {previous-image-tag} && docker compose up -d`. Post-launch SLA: P0=4h, P1=24h, P2=72h |

---

## Critical Rules (Never Forget)

| Rule | Detail |
|---|---|
| No localStorage for tokens | Access token in Zustand memory only. Refresh token in httpOnly cookie. |
| No hardcoded colors | Use Tailwind classes (`text-orange-500`) not `#FF7A1A` |
| No hardcoded env vars | Always `os.Getenv()` in Go, `process.env.` in Next.js |
| Verify HMAC first | Payment webhooks: signature check is FIRST operation, before any DB access |
| Idempotent webhooks | Check `payment.status` before updating — gateways call multiple times |
| UUID strings not integers | All IDs are `string` in TypeScript, `string` in Go (CHAR(36)) |
| Correct field names | `price` not `base_price` · `image_path` not `image_url` · `created_by` not `staff_id` · `gateway_data` not `webhook_payload` · payment status `completed` not `success` |
| total_amount drift | Call `recalculateTotalAmount()` after EVERY order_items mutation |
| No order_items.status column | Derive from `qty_served` (0=pending, 0<x<qty=preparing, x=qty=done) |
| Payment only when ready | POST /payments must reject if `order.status ≠ 'ready'` |
| 1 table 1 active order | Check before INSERT into orders |
| Soft delete everywhere | `deleted_at` — never hard DELETE. All queries: `WHERE deleted_at IS NULL` |
