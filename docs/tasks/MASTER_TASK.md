# Master Task List — Hệ Thống Quản Lý Quán Bánh Cuốn

> **Single source of truth** for all tasks.
> **Rule:** Update status here after every completed task. Never let this go stale.
> **Status codes:** ⬜ not started · 🔄 in progress · ✅ done · 🔴 blocked
> **Active task:** `docs/tasks/CURRENT_TASK.md` · **Task rules:** `docs/tasks/GUIDE_TASK.md`
> **Completed phase detail:** `docs/tasks/ARCHIVE_TASKS.md`

---

## Phase Overview

| Phase | Owner | Status | Sessions Left | Next task |
|---|---|---|---|---|
| **OC — Order Consistency (menu preview = saved order)** ⭐ TOP PRIORITY | BE+FE | ✅ COMPLETE | 0 | — |
| P0 — Docs & Architecture | BA | ✅ COMPLETE | 0 | — |
| P1 — DB Migrations | DevOps | ✅ COMPLETE | 0 | — |
| P2 — Feature Specs | BA | ✅ COMPLETE | 0 | — |
| P3 — sqlc + Project Setup | BE | ✅ COMPLETE | 0 | — |
| P4 — Backend | BE | ✅ COMPLETE | 0 | — |
| P5 — Frontend | FE | ✅ COMPLETE | 0 | — |
| P6 — DevOps | DevOps | ✅ COMPLETE | 0 | — |
| P7 — Testing & Go-Live | BE+FE+QA | 🔄 IN PROGRESS | ~5 | P7-5.4 (Playwright E2E) |
| P8 — Admin Dashboard | BE+FE | ✅ COMPLETE | 0 | — |
| P9 — Overview Real API | FE | ✅ COMPLETE | 0 | — |
| P10 — Summary Dashboard | BE+FE | ✅ COMPLETE | 0 | — |
| P-UX — Customer Flow | FE | ✅ COMPLETE | 0 | — |
| P-PD — Product Detail Page | FE | ✅ COMPLETE | 0 | — |
| P-UX2 — Customer UX Enhancements | FE | ✅ COMPLETE | 0 | — |
| P-DIAGRAM — Full System Interaction Map | Docs | ✅ COMPLETE | 0 | — |
| P-MENU — Menu Page Wireframe + Grid Redesign | FE | ✅ COMPLETE | 0 | — |
| P11 — Add Items to Existing Order | Full | ✅ COMPLETE | 0 | — |
| P-ORDER-TOPPING — Order Page Topping Display | FE+BE | ✅ COMPLETE | 0 | — |
| P-FIX-MOCK — Fix order_service_test mockOrderRepo | BE | ✅ COMPLETE | 0 | — |
| P-ARCH — FE Architecture Groundwork | FE+Docs | ✅ COMPLETE | 0 | — |
| P-TRAINING — Admin Staff Training Page | BE+FE | ✅ COMPLETE | 0 | — |
| P-WIRE-ORDER — Client Order Page Wireframe | Docs | ✅ COMPLETE | 0 | — |
| P-GRAPH-ENRICH — Enrich Codebase Graphs for /dev-page | Docs | ✅ COMPLETE | 2 | — |
| P-MON — Client Order Monitoring Page | BE+FE | ✅ COMPLETE | 0 | — |
| P-FIX-CANH — Stale canh count in cart | FE | ✅ COMPLETE | 0 | — |
| P-PREP-3COL — WaitingSection prep list → 3 columns (Title · Topping · Quantity) | FE | ✅ COMPLETE | 0 | — |
| **TOP — Topping Unification (nhân/rau = topping, drop `filling`)** | BE+FE | 🔄 IN PROGRESS | 5 | TOP-1 |

---

## Completed Phases Summary

All individual tasks for completed phases are recorded in `docs/TASKS.md` (historical record).
Task-level detail for phases completed 2026-05 onward → `docs/tasks/ARCHIVE_TASKS.md`.

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
| P9 — Overview Real API | 2026-05 | Real WS + component extraction (P9-1→P9-8) |
| P-PD — Product Detail Page | 2026-05 | HeroImage + ToppingSelector + QtyStepper + CTA (P-PD-1→5) |
| P-UX2 — Customer UX | 2026-05 | Favourites · Combo detail · Settings page (P-UX2-1→3) |
| P11 — Add Items to Order | 2026-05 | `POST /orders/:id/items` BE+FE (P11-1→6) |
| P-ARCH — FE Arch Groundwork | 2026-05 | storage-keys.ts + wireframe path fixes (P-ARCH-1→2) |
| P-DIAGRAM — System Map | 2026-05 | 4-lane swimlane excalidraw |
| P-FIX — Modal Wiring | 2026-05 | ToppingModal + ComboModal wired (P-FIX-1→2) |
| P-ORDER-TOPPING | 2026-05 | Topping name/price in order page (P-ORDER-TOPPING-1→2) |
| P-FIX-MOCK | 2026-05 | mockOrderRepo AppendOrderItems stub |
| P-GRAPH-ENRICH | 2026-05 | BE + FE codebase graphs enriched |

---

## Phase OC — Order Consistency ⭐ TOP PRIORITY

> **Owner:** BE + FE
> **Dependency:** P4 ✅ · P5 ✅
> **Status:** ✅ COMPLETE (OC-1 → OC-4 all ✅, 2026-06-05)
> **Added:** 2026-06-05
> **Problem:** The menu "Tổng số món" preview promises customization that the backend never stores, so the saved order (order page + admin Overview + KDS) diverges from what the customer saw. Three drops at checkout: (1) `filling` (Thịt/Mộc nhĩ) never sent + no DB column; (2) edited combo contents ignored — `expandCombo` rebuilds from canonical `GetComboSnapshot`; (3) canh có rau/không rau split only applied to standalone canh, not combo canh.
> **Decision (owner, 2026-06-05):** Make the backend honor the preview. `filling` is a real, kitchen-visible per-order attribute (dedicated column, not `note`).
> **Order:** OC-1 → OC-2 → OC-3 → OC-4 (strict)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| OC-1 | BE | Add `filling` column to `order_items` (migration `016` + `query/*.sql` + `sqlc generate` + `OrderItemRow`/repo struct). Enum-style: `thit` · `moc_nhi` · NULL via `chk_oi_filling`. | — | 1 | ✅ | Column exists (verified in DB); `sqlc generate` + `go build ./...` clean; service tests green; both insert call sites pass `Filling` |
| OC-2 | BE | Order-create contract honors filling + custom combo contents. Added `filling` + `combo_items` overrides to order DTO + `CreateOrderItemInput` (both `POST /orders` and `POST /orders/:id/items`); `expandCombo` honors overrides (validate product ∈ combo, server-side prices, qty×comboQty, note, filling) with canonical fallback; `buildProductRow` sets filling; exposed `filling`+`note`+combo fields in `orderJSON` & overview `buildItemsJSON`. **Also fixed pre-existing combo double-count**: header `unit_price` now 0 (was bundle price) → `total_amount` no longer counts combo twice. `API_CONTRACT_v1.2.md` updated (openapi has no /orders paths — pre-existing gap, flagged). | OC-1 | 1 | ✅ | Live smoke test: filling persists, overrides honored, total 72k→42k (double-count fixed); 2 new unit tests green; full BE suite green |
| OC-3 | FE | Checkout payload sends filling + expanded combo contents + unified canh split. Created single `lib/order-payload.ts` builder; wired all 3 cart-driven paths (menu table-confirm, `/checkout`, CartDrawer add-to-order). Threaded `product_id` into cart `combo_items` (type + ComboCard + combo detail); added filling to ProductCard topping path. POS/TableGrid left as-is (staff UI, no combo/filling/canh selection). | OC-2 | 1 | ✅ | 5 builder unit tests green; FE typecheck clean (pre-existing AuthState test errors unrelated); BE accepts shape (OC-2 live smoke). **Note:** favourites quick-add combos carry no `combo_items` → BE canonical path (incl. their canh ×1) — flagged, secondary path |
| OC-4 | FE | Read views show filling + cross-page consistency. Added `filling` to `OrderItem` type + `fillingLabel()`; `toppingLabel` (admin WaitingSection + PrepPanel) now reads real `filling`+`note` instead of deriving from toppings; `order/[id]` DishRow shows filling badge; KDS shows nhân/rau variant. | OC-3 | 1 | ✅ | Live GET verified `filling` flows through read JSON ('thit'/'moc_nhi'); total 20k (no double-count); FE typecheck clean; admin/order/KDS render filling |

---

## Phase TOP — Topping Unification

> **Owner:** BE + FE
> **Dependency:** OC ✅ (this epic **reverses** the OC `filling` design)
> **Status:** 🔄 IN PROGRESS
> **Added:** 2026-06-07
> **Problem:** `nhân` (Thịt/Mộc nhĩ) and canh `rau` are modeled **twice** — the DB seed (`scripts/seed_real_menu.sql`) defines them as **toppings** (`bbbbbbbb-…0001/0002/0003`, price 0, linked via `product_toppings`), but the FE menu cards use a bespoke `filling` field + `drinkConfig` veg/noveg note. Result: (1) toppings unselectable from the menu list (`ProductCard hasToppings=false`); (2) toppings never rendered in "Tóm tắt đơn hàng" (`OrderSummary` ignores `item.toppings`); (3) the menu card and product detail page record nhân two different ways (filling vs topping) → divergent cart lines.
> **Decision (owner, 2026-06-07):** Toppings become the single model. Drop the `filling` field/column; nhân = a **required single-select** topping group; canh rau = the "Rau mùi tàu" topping. Enable the topping picker on menu cards.
> **Order:** TOP-1 → TOP-2 → TOP-3 → TOP-4 → TOP-5 (strict; BE contract first)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| TOP-1 | BE | Migration to backfill `order_items.filling` → topping snapshot then drop `filling` col + `chk_oi_filling`; order-create contract accepts nhân via `topping_ids` (remove `filling` from DTO/`CreateOrderItemInput`/`buildProductRow`/`expandCombo`/`orderJSON`/overview JSON); update `query/orders.sql` + `sqlc generate`. Files: `be/migrations/`, `be/query/orders.sql`, `order_service.go`, `group_service.go`, `order_handler.go`, `order_service_test.go`, regenerated `db/*.go`. | OC ✅ | 1 | ⬜ | `sqlc generate` + `go build ./...` clean; BE suite green; new order stores nhân as topping snapshot; existing orders still read |
| TOP-2 | FE | Drop `filling` from `CartItem` (`types/cart.ts`) + `types/order.ts`; `order-payload.ts` emits nhân as `topping_ids` only; fix `order-payload.test.ts`. | TOP-1 | 1 | ⬜ | Cart→payload carries nhân topping id; builder tests green; FE typecheck clean |
| TOP-3 | FE | ProductCard: `+` opens `ToppingModal` with nhân as **required single-select** group; ComboCard: nhân as combo topping override; remove filling pill buttons from both. | TOP-2 | 1 | ⬜ | Selecting nhân on a card adds correct topping id; can't add with 0/2 nhân |
| TOP-4 | FE | `OrderSummary` renders toppings (drop filling badge + `name\|filling` aggregation key → `name\|toppingIds`); read views `order/[id]` DishRow, `kds/page.tsx`, `PrepPanel.tsx`, `overview.helpers.ts` show toppings. | TOP-3 | 1 | ⬜ | "Tóm tắt đơn hàng" + KDS/admin show selected toppings faithfully |
| TOP-5 | FE | Canh `rau`: replace `drinkConfig` veg/noveg **note** with "Rau mùi tàu" **topping** on canh rows (`OrderSummary` canh block + `order-payload.ts`). | TOP-4 | 1 | ⬜ | Canh "có rau" = canh + Rau topping id, not a note string |

---

## Phase 7 — Testing & Go-Live

> **Owner:** BE (unit/integration) · FE (store tests) · QA (UAT) · DevOps (go-live)
> **Dependency:** P4 ✅ · P5 ✅
> **Completed sub-tasks:** P7-1, P7-2, P7-3, P7-4, P7-5.1–5.3, P7-6, P7-E2E-0, P7-E2E-1, P7-9 → see `ARCHIVE_TASKS.md`

### P7-5.4 — Playwright E2E (Full Browser Flows)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-5.4 | FE+QA | Playwright E2E — full browser flows: QR scan→menu→checkout→KDS→payment for each role (guest/cashier/chef/manager) | P7-5.1 ✅ · P7-3 ✅ | 2 | ⬜ | Needs docker compose up (full stack); set BASE_URL=http://localhost:3000 |

### P7-7 — Payment Sandbox

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-7 | BE | VNPay + MoMo via ngrok: full QR flow + signature rejection + double-webhook idempotency + amount mismatch rejection | P7-3 ✅ | 1 | ⬜ | Spec5 §7 |

### P7-8 — UAT Plan

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-8 | QA | `docs/UAT_Plan.md` — test cases per spec, stakeholder sign-off checklist, bug severity P0/P1/P2 definitions | P7-5 ✅ | 1 | ⬜ | — |

### P7-10 — Go-Live

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-10 | DevOps | DNS A record → VPS IP · Caddy SSL auto-cert · prod env vars · `goose up` · seed · smoke test | P7-5 ✅ · P7-7 ✅ | 1 | ✅ | `docs/GOLIVE_RUNBOOK.md` |

### P7-11 — Monitoring

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-11 | DevOps | Error rate alert >5% · response time alert >500ms · log aggregation (Docker logs → Loki or CloudWatch) | P7-10 ✅ | 1 | ✅ | Prometheus middleware + /metrics · alert-rules.yml · Loki+Promtail+Grafana in compose |

### P7-12 — Rollback Plan

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P7-12 | DevOps | Document rollback: `docker pull {previous-tag} && docker compose up -d` · post-launch SLA: P0=4h, P1=24h, P2=72h | P7-10 ✅ | 1 | ✅ | `docs/devops/ROLLBACK_PLAN.md` |

---

## Phase P-MENU — Menu Page Wireframe + Grid Redesign

> **Owner:** FE
> **Dependency:** P5 ✅ · Spec_3 §4 verified
> **Spec:** `docs/spec/Spec_3_Menu_Checkout_UI_v2.md §4`
> **Wireframe:** `docs/fe/wireframes/menu.excalidraw` · `docs/fe/wireframes/menu.md`
> **Added:** 2026-05-17

| ID | Owner | Task | Deps | Sessions | Status | spec_ref | draw_ref |
|---|---|---|---|---|---|---|---|
| P-MENU-1 | FE | Wireframe + zone table (menu.excalidraw + menu.md) | — | 1 | ✅ | `Spec_3 §4` | `wireframes/menu.excalidraw` |
| P-MENU-2 | FE | `ProductGridCard` component + update menu/page.tsx to 2-col grid | P-MENU-1 ✅ | 1 | ✅ | `Spec_3 §4.1 §4.3` | `wireframes/menu.md Zone E` |

---

## Phase P-WIRE-ORDER — Client Order Page Wireframe

> **Owner:** Docs
> **Dependency:** excalidraw `order_ver2.excalidraw` ✅
> **Source:** `docs/fe/wireframes/client_order_page/order_ver2.excalidraw`
> **Order:** A1 → A2 → A3 → A4 (strict)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-WIRE-ORDER-1 | Docs | `client_order_page_wireframe_v1.md` — full zone tables from excalidraw; update WIREFRAME_INDEX.md | — | 1 | ✅ | All 8 zones + 2 modals documented |
| P-WIRE-ORDER-2 | Docs | `business_description.md` + `how_to_use.md` — Vietnamese copy, zone-by-zone user guide | P-WIRE-ORDER-1 ✅ | 1 | ✅ | Every zone covered; standard 4-step flow |
| P-WIRE-ORDER-3 | Docs | `tech_description.md` — RBAC, Pattern B, TypeScript interfaces, query hook stubs, file org tree | P-WIRE-ORDER-1 ✅ | 1 | ✅ | Pattern B declared; skeleton defined; query keys registered |
| P-WIRE-ORDER-4 | Docs | `conccern.md` + `recomment/recommend.md` + `recomment/recomment_claude.md`; update `_INDEX_SHARING_COMPONENT.md` | P-WIRE-ORDER-1 ✅ | 1 | ✅ | ≥ 5 open questions in conccern; UX recommendations table filled |

---

## Phase P-TRAINING — Admin Staff Training Page

> **Owner:** BE+FE
> **Dependency:** P8 ✅ · P-ARCH-1 ✅
> **Wireframe:** `docs/fe/wireframes/admin_main/admin_main_training/admin_staff_training_wireframe_v1.md`
> **Excalidraw:** `docs/fe/wireframes/admin_main/admin_main_training/admin-staff-training.excalidraw` ✅
> **Route:** `/admin/training/page.tsx`
> **Order:** P-TRAINING-1 ✅ → BE-1 → BE-2 → 2 → 3 → 4 → 5 → 6 → 7 (strict)
> **Added:** 2026-05-25

| ID | Owner | Task | Deps | Sessions | Status | spec_ref | draw_ref |
|----|-------|------|------|----------|--------|----------|----------|
| P-TRAINING-1 | FE | Wireframe + zone table + all scaffold files | — | 1 | ✅ | — | `admin_staff_training_wireframe_v1.md` |
| P-TRAINING-BE-1 | BE | `014_training.sql` migration (4 tables) + sqlc queries (`be/query/training.sql`) + `sqlc generate` | P-TRAINING-1 ✅ | 1 | ✅ | wireframe §Data Sources | — |
| P-TRAINING-BE-2 | BE | `training_handler.go` + `training_service.go` + `training_repo.go` + register routes in `main.go` | P-TRAINING-BE-1 ✅ | 1 | ✅ | wireframe §API endpoints | — |
| P-TRAINING-2 | FE | `types/training.ts` + `hooks/useTrainingQueries.ts` + `store/trainingStore.ts` + `RoleBadge.tsx` | P-TRAINING-BE-2 ✅ | 1 | ✅ | wireframe §TypeScript Contracts | Zone B |
| P-TRAINING-3 | FE | `JobGuideCard.tsx` + `JobGuideCardGrid.tsx` — cover img, role badge, KPI chips, YouTube link, 3-dot kebab, Draft overlay | P-TRAINING-2 ✅ | 1 | ✅ | wireframe §Zone C | Zone C |
| P-TRAINING-4 | FE | `RoleFilterTabs.tsx` (Zone B) + `CompletionTrackingTable.tsx` (Zone D) — paginated table, status badges | P-TRAINING-3 ✅ | 1 | ✅ | wireframe §Zone B §Zone D | Zone B + Zone D |
| P-TRAINING-5 | FE | `CreateEditGuideModal.tsx` — RHF + Zod, 10 fields, POST/PATCH mutation | P-TRAINING-4 ✅ | 1 | ✅ | wireframe §Modal 1 | Modal 1 |
| P-TRAINING-6 | FE | `TrainingProgressModal.tsx` — 3-step timeline, quiz attempts table, Manager Notes PATCH | P-TRAINING-5 ✅ | 1 | ✅ | wireframe §Modal 2 | Modal 2 |
| P-TRAINING-7 | FE | `app/admin/training/page.tsx` — assemble all zones, wire modals, RBAC gate, browser golden path test | P-TRAINING-6 ✅ | 1 | ✅ | wireframe all zones | all zones |

---

## Phase P-MON — Client Order Monitoring Page

> **Owner:** BE + FE
> **Dependency:** P5 ✅ · P4 ✅
> **Status:** ✅ COMPLETE

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-MON-BE-1 | BE | `CountActiveOrderItems` batch query + `UpdateItemQuantity` SQL+repo+service+handler | — | 1 | ✅ | No N+1; PATCH /orders/items/:id/quantity works |
| P-MON-BE-2 | BE | `publishMonitorBroadcast` enhanced (table names + item counts); triggered on CreateOrder + UpdateOrderStatus | P-MON-BE-1 | 1 | ✅ | Queue/table broadcasts fire on order create + status change |
| P-MON-BE-3 | BE | SSE endpoint `/sse/order-monitor/:id` subscribed to `order:{id}` + `queue:broadcast` + `tables:broadcast` | P-MON-BE-2 | 1 | ✅ | 401/403 rejected; keep-alive heartbeat |
| P-MON-FE-1 | FE | `useOrderMonitorSSE` hook: reconnect + AuthError + `isUnauthorized` + `itemsChangedAt` | P-MON-BE-3 | 1 | ✅ | Auth failure stops retry; itemsChangedAt fires on items_added/updated/cancelled |
| P-MON-FE-2 | FE | Queue position derivation FE-side (`findIndex` on queue array); estimatedMinutes = position × 3 | P-MON-FE-1 | 1 | ✅ | TableInfoBanner shows correct position; ETA shown |
| P-MON-FE-3 | FE | Tracking page: all zones (A–F) + 401 error screen + order refetch on itemsChangedAt | P-MON-FE-2 | 1 | ✅ | Zone C refreshes when staff adds items from POS |

---

## Phase P-BEDOC — BE Code Summary Enrichment

> **Owner:** Docs
> **Dependency:** none (read-only audit of existing BE code)
> **Status:** ✅ COMPLETE (1→4) — added `BE_ENV_CONFIG.md`, `BE_API_DTO.md`, folder `README.md`; fixed Tasks/Training/route drift
> **Goal:** Keep `docs/be/be_code_summary/` in sync with code + add DTO/env references so future sessions read summaries, not source.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-BEDOC-1 | Docs | Drift fix — regenerate `BE_STRUCTURE.md` + `CODEBASE_GRAPH_BE.md`: add Tasks + Training domains, marketing in graph, all 87 routes (incl. order-monitor SSE, item quantity/cancel, /metrics, /register, /history) | — | 1 | ✅ | Tree + route table + service/repo indexes match `main.go` 1:1 |
| P-BEDOC-2 | Docs | New `BE_ENV_CONFIG.md` — all 23 env vars (name, purpose, default, used-by) grouped by concern | — | 1 | ✅ | Every `os.Getenv` in code has a row |
| P-BEDOC-3 | Docs | New `BE_API_DTO.md` — request/response shapes + per-endpoint error codes for auth · products · orders · payments · groups | P-BEDOC-1 | 1 | ✅ | Each endpoint shows JSON in/out + `ERR_*` codes |
| P-BEDOC-4 | Docs | Extend `BE_API_DTO.md` — staff · tables · analytics · ingredients · tasks · training · marketing · files | P-BEDOC-3 | 1 | ✅ | Same coverage for admin domains |

---

## Phase P-BEBLUEPRINT — BE Rebuild Blueprint (reusable starter)

> **Owner:** Docs
> **Dependency:** none (read-only over existing BE code)
> **Status:** ✅ COMPLETE (1→2) — `BE_SQLC_GUIDE.md` + `BE_BUILD_FROM_ZERO.md` added; linked from `BE_DOC_INDEX.md`
> **Goal:** Close the two structural gaps that block rebuilding the BE from `docs/be` alone, so the doc set is reusable as a from-scratch BE blueprint on other projects.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-BEBLUEPRINT-1 | Docs | New `docs/be/BE_SQLC_GUIDE.md` — documents the sqlc data layer: `sqlc.yaml` config + overrides, `query/` file naming convention (`-- name: X :one/:many/:exec`), generation workflow, and representative query examples reverse-engineered from `be/query/*.sql`. Also documents `cmd/` CLI tools (seed · qr · demo_order). | — | 1 | ✅ | A reader can recreate `query/*.sql` + regenerate `internal/db/` without opening source |
| P-BEBLUEPRINT-2 | Docs | New `docs/be/BE_BUILD_FROM_ZERO.md` — ordered build checklist (init module → migrations → sqlc → pkg → repo → service → handler → main.go wiring → Docker), each step pointing at the doc that fills it. Includes one full goose migration file shown verbatim as a template. | P-BEBLUEPRINT-1 | 1 | ✅ | Checklist reproduces the BE scaffold end-to-end; every step links its source doc |
| P-BEBLUEPRINT-3 | Docs | New `docs/be/BE_CACHING_STRATEGY.md` — cache-aside pattern, delete-on-write invalidation, fail-open-on-Redis-down behavior, what is/isn't cached. Correct the drifted Redis Key Schema table in `DB_SCHEMA_SUMMARY.md` to match real keys/TTLs (remove 4 non-existent keys; add product/list caches). Flag (docs-only, no code change): `is_active` invalidation key mismatch in `staff_service.go`, and bloom filters defined but never called. | — | 1 | ✅ | Key table matches `grep` of code 1:1; strategy + fail-open documented; known gaps flagged |
| P-BEBLUEPRINT-4 | BE | Fix `is_active` cache-key mismatch — centralize via `staffActiveKey()` helper in `auth_service.go`; route all 5 call sites (auth read/write/del + staff SetStatus/Delete) through it. Also repair stale service-test mocks blocking compilation (`mockAuthRepo.CreateStaffForRegister`, `mockOrderRepo.{CountActiveOrderItems,ListTodayHistory,UpdateItemQuantity,DeleteOrderItem}`) and update stale VNPay webhook test assertion (`MarkOrderDelivered` → `MarkOrderPaid`, per migration 015). | P-BEBLUEPRINT-3 | 1 | ✅ | `go build ./...` clean; `go test ./be/internal/service/...` green; deactivation now invalidates the real cache |

## Phase P-FIX-CANH — Stale canh count in cart

> **Owner:** FE
> **Dependency:** none
> **Status:** ✅ COMPLETE

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-FIX-CANH-1 | FE | `OrderSummary` CANH section showed leftover bowl counts (e.g. 2/2) on a fresh menu load. Root cause: `cart.ts` persisted `drinkConfig` but not `items`, so old canh counts resurfaced without their order. Fix: drop `drinkConfig` from `partialize`; bump persist `version` 3→4 with migrate that deletes stale `drinkConfig`. | — | 1 | ✅ | Canh starts at 0/0 on fresh load; existing stale localStorage value flushed on next load |

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
| Combo header price = 0 | A combo = 1 header row (`unit_price=0`, label only) + N sub-item rows (real prices). Recalc sums ALL rows — header MUST be 0 or the combo double-counts. FE read views hide the header. `filling` on sub-items, never header. → `BE_API_DTO.md §Orders` |
| No order_items.status column | Derive from `qty_served` (0=pending, 0<x<qty=preparing, x=qty=done) |
| Payment only when ready | POST /payments must reject if `order.status ≠ 'ready'` |
| 1 table 1 active order | Check before INSERT into orders |
| Soft delete everywhere | `deleted_at` — never hard DELETE. All queries: `WHERE deleted_at IS NULL` |
