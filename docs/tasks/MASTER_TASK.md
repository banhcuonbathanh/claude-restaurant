# Master Task List — Hệ Thống Quản Lý Quán Bánh Cuốn

> **Single source of truth** for all tasks.
> **Rule:** Update status here after every completed task. Never let this go stale.
> **Status codes:** ⬜ not started · 🔄 in progress · ✅ done · 🔴 blocked
> **Active task:** `docs/tasks/CURRENT_TASK.md` · **Task rules:** `docs/tasks/GUIDE_TASK.md`

---

## Phase Overview

| Phase | Owner | Status | Sessions Left | Next task |
|---|---|---|---|---|
| P0 — Docs & Architecture | BA | ✅ COMPLETE | 0 | — |
| P1 — DB Migrations | DevOps | ✅ COMPLETE | 0 | — |
| P2 — Feature Specs | BA | ✅ COMPLETE | 0 | — |
| P3 — sqlc + Project Setup | BE | ✅ COMPLETE | 0 | — |
| P4 — Backend | BE | ✅ COMPLETE | 0 | — |
| P5 — Frontend | FE | ✅ COMPLETE | 0 | — |
| P6 — DevOps | DevOps | ✅ COMPLETE | 0 | — |
| P7 — Testing & Go-Live | BE+FE+QA | ⬜ NOT STARTED | ~14 | P7-1.1 |
| P8 — Admin Dashboard | BE+FE | ✅ COMPLETE | 0 | — |
| P9 — Overview Real API | FE | ⬜ NOT STARTED | ~8 | P9-1 |
| P10 — Summary Dashboard | BE+FE | ✅ COMPLETE | 0 | — |
| P-UX — Customer Flow | FE | ✅ COMPLETE | 0 | — |
| P-PD — Product Detail Page | FE | ✅ COMPLETE | 0 | — |
| P-UX2 — Customer UX Enhancements | FE | ✅ COMPLETE | 0 | — |

---

## Completed Phases (P0 – P6, P8, P10, UX)

All individual tasks for completed phases are recorded in `docs/TASKS.md` (historical record).
The entries below are phase-level summaries only.

| Phase | Completed | Key deliverables |
|---|---|---|
| P0 — Docs & Architecture | 2026-04 | BE_SYSTEM_GUIDE, FE_SYSTEM_GUIDE, all index docs |
| P1 — DB Migrations | 2026-04 | Migrations 001–008, all tables + indexes |
| P2 — Feature Specs | 2026-04 | Spec1–Spec7, Spec9, Spec10 written |
| P3 — sqlc + Project Setup | 2026-04 | sqlc generated, field names verified |
| P4 — Backend | 2026-04 | Auth · Products · Orders · WS Hub · Payments · Remaining endpoints |
| P5 — Frontend | 2026-04 | Auth · Menu/Cart · Checkout/SSE · KDS · POS/Payment |
| P6 — DevOps | 2026-04 | .env.example · migrate.sh · Caddyfile · compose · CI/CD · README |
| P8 — Admin Dashboard | 2026-05 | FE admin pages (8-1→8-17) · BE staff endpoints (8-9→8-13) |
| P10 — Summary Dashboard | 2026-05 | BE analytics · FE components (10-1→10-14) |
| P-UX — Customer Flow | 2026-05 | Add-item flow · activeOrderId store · table_name display (UX-1→3) |

---

---

## Phase 7 — Testing & Go-Live

> **Owner:** BE (unit/integration) · FE (store tests) · QA (UAT) · DevOps (go-live)
> **Dependency:** P4 ✅ · P5 ✅
> **Spec:** No single spec — see individual AC refs per task
> **Order:** Unit tests (7-1→7-4) → Integration (7-5) → Sandbox (7-7) → UAT (7-8→7-9) → Go-live (7-10→7-12)

### P7-1 — Auth Service Unit Tests

> **File:** `be/internal/service/auth_service_test.go`
> **Deps:** P4 ✅ · Go test setup working
> **Why sub-tasks:** 6 distinct test scenarios, each needs isolated mocks — 3 sessions total

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-1.1 | BE | Test scaffolding setup + TestLogin_WrongPassword + TestLogin_RateLimitAfter5Fails | — | 1 | ✅ | Spec1 §4.1 |
| P7-1.2 | BE | TestMultiSessionLogin (dual active sessions) + TestLogoutSingleSession | P7-1.1 ✅ | 1 | ⬜ | Spec1 §4.2 |
| P7-1.3 | BE | TestAccountDisabledImmediate (deactivate → 401) + TestTokenRotation | P7-1.2 ✅ | 1 | ⬜ | Spec1 §4.3 |

### P7-2 — Order Service Unit Tests

> **File:** `be/internal/service/order_service_test.go`
> **Deps:** P7-1 ✅ (test patterns established)
> **Why sub-tasks:** 6 test scenarios across different order lifecycles — 3 sessions total

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-2.1 | BE | TestCreateOrder_ComboExpand (parent+sub-items in TX) + TestCreateOrder_DuplicateTable (409) | P7-1 ✅ | 1 | ⬜ | Spec4 §5 |
| P7-2.2 | BE | TestCancelOrder_Under30Percent (success) + TestCancelOrder_Over30Percent (422) | P7-2.1 ✅ | 1 | ⬜ | Spec4 §7 |
| P7-2.3 | BE | TestItemStatusCycle (qty_served progression) + TestAutoReadyWhenAllItemsDone | P7-2.2 ✅ | 1 | ⬜ | Spec4 §8 |

### P7-3 — Payment Handler Tests

> **File:** `be/internal/handler/payment_handler_test.go`
> **Deps:** P7-1 ✅
> **Note:** 4 test cases, all webhook-related — fits in 1 session

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-3 | BE | TestVNPayWebhook_ValidSignature + TestVNPayWebhook_InvalidSignature + TestVNPayWebhook_Idempotent + TestCreatePayment_OrderNotReady | P7-1 ✅ | 1 | ⬜ | Spec5 §6 |

### P7-4 — Frontend Store Tests

> **Files:** `fe/src/store/cart.store.test.ts` · `fe/src/lib/utils.test.ts`
> **Deps:** P5 ✅

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-4 | FE | TestAddSameItemIncreasesQty + TestRemoveItem + TestClearCart + TestTotalCalculation + TestFormatVND + TestFormatPercent | — | 1 | ⬜ | — |

### P7-5 — Integration Tests

> **Why sub-tasks:** 3 distinct test areas — API endpoints, SSE behavior, WS behavior

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-5.1 | BE | Test setup (test DB, seed, teardown helpers) + all auth API endpoints against test DB | P7-1 ✅ | 1 | ⬜ | — |
| P7-5.2 | BE | Order + payment API endpoints integration tests | P7-5.1 ✅ | 1 | ⬜ | — |
| P7-5.3 | BE | SSE reconnect behavior (exponential backoff) + WS reconnect exponential backoff | P7-5.2 ✅ | 1 | ⬜ | — |

### P7-6 — Seed Data

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-6 | DevOps | `scripts/seed.sql` — 3+ categories, 10+ products, 5+ toppings, 2+ combos, 4 staff accounts (bcrypt), 5+ tables with qr_token | — | 1 | ✅ | — |

### P7-7 — Payment Sandbox

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-7 | BE | VNPay + MoMo via ngrok: full QR flow + signature rejection + double-webhook idempotency + amount mismatch rejection | P7-3 ✅ | 1 | ⬜ | Spec5 §7 |

### P7-8 — UAT Plan

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-8 | QA | `docs/UAT_Plan.md` — test cases per spec, stakeholder sign-off checklist, bug severity P0/P1/P2 definitions | P7-5 ✅ | 1 | ⬜ | — |

### P7-9 — Compliance Pages

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-9 | FE | `/privacy-policy` page + `/terms` page + cookie consent banner; verify PCI-DSS: no card numbers stored | — | 1 | ⬜ | — |

### P7-10 — Go-Live

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-10 | DevOps | DNS A record → VPS IP · Caddy SSL auto-cert · set all prod env vars · `goose up` on prod DB · run seed · smoke test: login + order + payment | P7-5 ✅ · P7-7 ✅ | 1 | ⬜ | — |

### P7-11 — Monitoring

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-11 | DevOps | Error rate alert >5% · response time alert >500ms · log aggregation (Docker logs → Loki or CloudWatch) | P7-10 ✅ | 1 | ⬜ | — |

### P7-12 — Rollback Plan

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-12 | DevOps | Document rollback: `docker pull {previous-tag} && docker compose up -d` · post-launch SLA: P0=4h, P1=24h, P2=72h | P7-10 ✅ | 1 | ⬜ | — |

---

## Phase 9 — Overview Page (Real API + Component Extraction)

> **Owner:** FE
> **Dependency:** P8 ✅ · P4 ✅ (BE endpoints live)
> **Spec:** `docs/spec/Spec_9_Admin_Dashboard_Pages.md §2`
> **Goal:** Replace `USE_MOCK = true` with real API + WS; extract inline components; verify all 6 zones match spec
> **Order is strict:** 9-1 → 9-2 → 9-3 through 9-7 (can parallelise) → 9-8

| ID | Owner | Task | Deps | Sessions | Status | spec_ref | draw_ref |
|---|---|---|---|---|---|---|---|
| P9-1 | FE | `admin.api.ts` — verify `listTables`, `listLiveOrders`, `updateOrderStatus` use real axios calls (remove any mock path) | — | 1 | ⬜ | `Spec_9 §2.1 §4` | `wireframes/overview.md ZoneF` |
| P9-2 | FE | `useOverviewWS` hook — WS connect/reconnect (exponential backoff) + 6 message type handlers → mutate TanStack Query cache | P9-1 ✅ | 1 | ⬜ | `Spec_9 §2.1` | `wireframes/overview.md ZoneF` |
| P9-3 | FE | `StatCards` component — 4 stat cards derived from live orders (tables served · pending · preparing · urgency >20min/10-20min) | P9-2 ✅ | 1 | ⬜ | `Spec_9 §2.2` | `wireframes/overview.md ZoneA` |
| P9-4 | FE | `WaitingCard` + `WaitingSection` — pending order cards with Kiểm tra toggle + 3 action buttons (disabled while loadingIds) | P9-2 ✅ | 1 | ⬜ | `Spec_9 §2.4` | `wireframes/overview.md ZoneB` |
| P9-5 | FE | `PrepPanel` — conditional panel (checkedTableIds.size > 0), collapsible per-table + Tổng cần làm summary sorted by remaining qty desc | P9-2 ✅ | 1 | ⬜ | `Spec_9 §2.5` | `wireframes/overview.md ZoneC` |
| P9-6 | FE | `OrderDetail` — progress bar + 3 mini counters + item list with status dots + Hoàn thành/Huỷ/Kiểm tra buttons | P9-2 ✅ | 1 | ⬜ | `Spec_9 §2.6` | `wireframes/overview.md ZoneE` |
| P9-7 | FE | `TableCard` + `TableGrid` — urgency border (gray/orange/yellow/red), occupied-first sort vi-VN locale, empty state icon | P9-2 ✅ | 1 | ⬜ | `Spec_9 §2.3 §2.6` | `wireframes/overview.md ZoneD` |
| P9-8 | FE | `overview/page.tsx` — assemble all zones, flip `USE_MOCK=false`, wire `useOverviewWS`, 30s timer tick for urgency recompute | P9-3 ✅ · P9-4 ✅ · P9-5 ✅ · P9-6 ✅ · P9-7 ✅ | 1 | ⬜ | `Spec_9 §2` | `wireframes/overview.md` |

---

## Phase P-PD — Product Detail Page

> **Owner:** FE
> **Dependency:** P5 ✅ (menu/cart exists) · P4 ✅ (GET /products/:id live)
> **Spec:** `docs/spec/Spec_3_Menu_Checkout_UI_v2.md §4`
> **Wireframe:** `docs/fe/wireframes/product-detail.excalidraw`
> **Route:** `fe/src/app/(shop)/menu/product/[id]/page.tsx`
> **Token budget:** each sub-task < 100k tokens

| ID | Owner | Task | Deps | Sessions | Status | spec_ref | draw_ref |
|---|---|---|---|---|---|---|---|
| P-PD-1 | FE | Read Spec_3 §4 + verify `GET /products/:id` response shape + cart store `addItem` signature | — | 1 | ✅ | `Spec_3 §4` | — |
| P-PD-2 | FE | Create route file + Zone A (HeroImage: next/image fill object-cover) + Zone B (name, availability badge, price, description) + loading skeleton (animate-pulse all zones) | P-PD-1 ✅ | 1 | ✅ | `Spec_3 §4` | `product-detail.excalidraw Zone A·B` |
| P-PD-3 | FE | Zone C — ToppingSelector: multi-select checkboxes, live running total (base + topping prices) | P-PD-2 ✅ | 1 | ✅ | `Spec_3 §4` | `product-detail.excalidraw Zone C` |
| P-PD-4 | FE | Zone D — QtyStepper (−/qty/+, min=1) + Zone E — sticky CTA footer ("Thêm vào giỏ hàng · {total} ₫") → add to Zustand cart store | P-PD-3 ✅ | 1 | ✅ | `Spec_3 §4` | `product-detail.excalidraw Zone D·E` |
| P-PD-5 | FE | Browser test: golden path (load → select topping → change qty → add to cart) + edge cases (no toppings, unavailable product) + fix regressions | P-PD-4 ✅ | 1 | ✅ | `Spec_3 §4` | — |

---

## Phase P-UX2 — Customer UX Enhancements

> **Owner:** FE
> **Dependency:** P-PD ✅ · P5 ✅
> **Spec:** none — UX improvements, no new backend needed
> **Order:** P-UX2-1 → P-UX2-2 → P-UX2-3 (each independent, but do in order)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-UX2-1 | FE | Favourites feature: `useFavouritesStore` (Zustand + localStorage persist) + heart toggle button on `ProductCard` + `ComboCard` | — | 1 | ✅ | Heart icon fills red when toggled; state survives page refresh; no backend call |
| P-UX2-2 | FE | Combo detail page `/menu/combo/[id]` (fetch via `GET /combos` list + filter by id) + explicit "Detail" link button on `ComboCard` + deduplicate detail affordance on `ProductCard` | P-UX2-1 ✅ | 1 | ✅ | Tapping detail on ComboCard navigates to combo detail; shows image, name, price, items list, qty stepper, add-to-cart CTA |
| P-UX2-3 | FE | Customer settings page `/menu/settings` accessible from menu header settings icon: customer display name + table label stored in localStorage; displayed in header/cart | P-UX2-2 ✅ | 1 | ✅ | Settings page renders; name/table persists across refresh; accessible from menu header |

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
