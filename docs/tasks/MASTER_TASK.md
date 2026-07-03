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
| **TOP — Topping Unification (nhân/rau = topping, drop `filling`)** | BE+FE | ✅ COMPLETE | 0 | — |
| **CANH — Canh as Normal Cart Item (FE/BE model unification)** | FE | ✅ COMPLETE | 0 | — |
| **DEPLOY — Server Deployment (Mac test server → VPS go-live)** | DevOps | 🔄 Stage A ✅ (D-1→D-5) · Stage B blocked on owner | ~2 | D-6 (owner: buy VPS + domain) |
| P-FEQA — FE Code Quality Audit | FE | 🔄 IN PROGRESS | TBD | P-FEQA-2 (apply findings from `docs/fe/quality_audit/SUMMARY.md`) |
| **GAP-8 — Combo Card Multi-Nhân + Orange Hearts** | FE | ✅ COMPLETE | 0 | — |
| **P-MERGE — Merge /order + /tracking → unified /orders page** | FE | ✅ CORE DONE (A·B·D) · C deferred | ~1 | P-MERGE-C (TỔNG SỐ MÓN aggregated rollup — design polish) |

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
> **Status:** ✅ COMPLETE (2026-06-07)
> **Added:** 2026-06-07
> **Problem:** `nhân` (Thịt/Mộc nhĩ) and canh `rau` are modeled **twice** — the DB seed (`scripts/seed_real_menu.sql`) defines them as **toppings** (`bbbbbbbb-…0001/0002/0003`, price 0, linked via `product_toppings`), but the FE menu cards use a bespoke `filling` field + `drinkConfig` veg/noveg note. Result: (1) toppings unselectable from the menu list (`ProductCard hasToppings=false`); (2) toppings never rendered in "Tóm tắt đơn hàng" (`OrderSummary` ignores `item.toppings`); (3) the menu card and product detail page record nhân two different ways (filling vs topping) → divergent cart lines.
> **Decision (owner, 2026-06-07):** Toppings become the single model. Drop the `filling` field/column; nhân = a **required single-select** topping group; canh rau = the "Rau mùi tàu" topping. Enable the topping picker on menu cards.
> **Order:** TOP-1 → TOP-2 → TOP-3 → TOP-4 → TOP-5 (strict; BE contract first)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| TOP-1 | BE | Migration to backfill `order_items.filling` → topping snapshot then drop `filling` col + `chk_oi_filling`; order-create contract accepts nhân via `topping_ids` (remove `filling` from DTO/`CreateOrderItemInput`/`buildProductRow`/`expandCombo`/`orderJSON`/overview JSON); update `query/orders.sql` + `sqlc generate`. Files: `be/migrations/`, `be/query/orders.sql`, `order_service.go`, `group_service.go`, `order_handler.go`, `order_service_test.go`, regenerated `db/*.go`. | OC ✅ | 1 | ✅ | `sqlc generate` + `go build ./...` clean; BE suite green; new order stores nhân as topping snapshot; existing orders still read. Migration `017_drop_order_item_filling.sql` (backfill→drop); combo override now uses `topping_ids` (contract for TOP-3) |
| TOP-2 | FE | Drop `filling` from `CartItem` (`types/cart.ts`) + `types/order.ts`; `order-payload.ts` emits nhân as `topping_ids` only; fix `order-payload.test.ts`. | TOP-1 | 1 | ✅ | `order-payload.ts` emits nhân via `topping_ids` (standalone + combo overrides); 5/5 builder tests green; tsc clean. **Type-field deletion (cart.ts/order.ts) deferred to final cleanup step** (owner decision — TOP-3/4 consumers must keep compiling) |
| TOP-3 | FE | ProductCard: `+` opens `ToppingModal` with nhân as **required single-select** group; ComboCard: nhân as combo topping override; remove filling pill buttons from both. | TOP-2 | 1 | ✅ | ProductCard `+`→ToppingModal (`requireSingle`, confirm disabled until 1 nhân); ComboCard nhân pills data-driven from sub-item toppings → combo cartItem `toppings`; tsc clean. **Scope +3 files** (ToppingModal single-select mode, `ComboItem.toppings?`, `menu/page.tsx` enrichment passthrough) — orchestrator-approved, data-driven (no hardcoded UUIDs) |
| TOP-4 | FE | `OrderSummary` renders toppings (drop filling badge + `name\|filling` aggregation key → `name\|toppingIds`); read views `order/[id]` DishRow, `kds/page.tsx`, `PrepPanel.tsx`, `overview.helpers.ts` show toppings. | TOP-3 | 1 | ✅ | OrderSummary dishSummary keyed by `name\|toppingIds` + per-line topping pills; `order/[id]`/kds/overview.helpers read `toppings_snapshot` (filling reads removed, `fillingLabel` imports dropped); PrepPanel comment-only; tsc clean, 107 pass/2 known fail |
| TOP-5 | FE | Canh `rau`: replace `drinkConfig` veg/noveg **note** with "Rau mùi tàu" **topping** on canh rows (`OrderSummary` canh block + `order-payload.ts`). | TOP-4 | 1 | ✅ | `order-payload` canh rows emit `topping_ids:[rauId]` (có rau) / `[]` (không rau), no note; read views (overview.helpers, kds) detect rau via `toppings_snapshot` w/ legacy-note fallback; **orchestrator fix**: ComboCard now copies sub-item `toppings` into cart `combo_items` (+`ComboItemSummary.toppings?`) so combo-canh rau is captured live; OrderSummary unchanged (drinkConfig correct). tsc clean, 107 pass/2 known fail |
| TOP-6 | FE | **Final type cleanup** (deferred from TOP-2 per owner): delete `filling` from `types/cart.ts` (`CartItem`) + `types/order.ts` (`OrderItem`) and remove `fillingLabel()`; stale comment in `order/[id]` fixed. | TOP-5 | 0 | ✅ | No `filling` in FE/BE source except a harmless `globals.css` comment (running-border class still used); tsc + tests green |

---

## Phase CANH — Canh as Normal Cart Item (FE/BE Order Model Unification)

> **Owner:** FE
> **Dependency:** TOP ✅ (topping model is unified; canh rau = topping already)
> **Status:** ✅ COMPLETE (CANH-1 → CANH-4 all ✅, 2026-06-08)
> **Added:** 2026-06-08
> **Problem:** FE models canh via a separate `drinkConfig {bowls, vegBowls}` counter while BE stores canh as ordinary `order_items` rows. After TOP, canh có rau = canh product + Rau topping — the only remaining FE/BE divergence is the bespoke `drinkConfig` field. Removing it unifies the model: canh items live in `items[]` exactly like any other product.
> **Decision (owner, 2026-06-08, pre-approved):** Option A — canh becomes a normal `CartItem`. Two stable cart IDs: `canh_<canhProductId>_rau` (có rau) and `canh_<canhProductId>_plain` (không rau). Steppers in UI stay but now read/write those items. `drinkConfig` deleted entirely. BE: ZERO changes needed.
> **Order:** CANH-1 → CANH-2 → CANH-3 → CANH-4 (strict)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| CANH-1 | FE | Remove `DrinkConfig` type + `drinkConfig`/`setDrinkConfig`/`DEFAULT_DRINK_CONFIG` from `store/cart.ts` and `types/cart.ts`. Add `setCanhQty(productId, rauTopping\|null, kind, qty)` helper to write canh cart items with stable cartIds `canh_<id>_rau` / `canh_<id>_plain`. Bump persist version to 5; migrate: drop old drinkConfig. Build green. | TOP ✅ | 1 | ✅ | `DrinkConfig` type removed; `setCanhQty` added to cart store; persist v5 with migration cleanup; `npm run build` green |
| CANH-2 | FE | `order-payload.ts`: drop `drink: DrinkConfig` param, change signature to `buildOrderItemsPayload(items)`. Canh items pass through like any product (no reconciliation needed). KEEP combo canh-strip (`isSoupName`). Update `order-payload.test.ts` to use canh items in `items[]`. | CANH-1 | 1 | ✅ | 5 builder tests pass; combo canh-strip still works; canh CartItems emit identical rows to old drinkConfig output; `npm run build` green |
| CANH-3 | FE | `OrderSummary.tsx`: steppers read/write canh CartItems via `setCanhQty`; `discoverCanhInfo()` finds productId/rauTopping from items or combo sub-items; checkout gate = no `canh_*` items in cart; `Tổng số món` reads rauCount/plainCount from canh items. Amber warning + shake kept. | CANH-2 | 1 | ✅ | Steppers produce canh CartItems; gate uses `items.some(i => i.id.startsWith('canh_'))`; preview == payload; `npm run build` green |
| CANH-4 | FE | Wire callers + cleanup: updated `menu/page.tsx`, `checkout/page.tsx`, `TableConfirmModal.tsx`, `CartDrawer.tsx`, `DrinkCustomize.tsx`; updated 4 test files (fe/src/__tests__/ + docs/work_flow/); updated `menu_spec_v2_visual.md §4a/§4d/§5/§6b/§6f`. | CANH-3 | 1 | ✅ | Zero `drinkConfig`/`vegBowls` refs in fe/src (grep clean); `npm run build` green; 107 pass / 2 pre-existing failures (clearCart orderNote + CART_CONFIG key) unchanged |
| CANH-5 | FE | **Stepper-only canh (Model A — two real products).** Bug: standalone "Canh có rau/không rau" menu cards write `product_*` items disconnected from the OrderSummary stepper (which writes `canh_*`), and the stepper `+` is disabled (`!canhProductId`) when only individual dishes are in cart → individual buyers can't add canh. Fix: source the two real canh products from `allProducts` in `menu/page.tsx`, hide canh cards from sections+search, pass them to `OrderSummary`; stepper binds có rau→product008 / không rau→product009 via existing `setCanhQty`, always enabled. Verify KDS/admin có-rau/không-rau labels still render (now name-derived, not topping-derived). Files: `menu/page.tsx` · `OrderSummary.tsx` · `overview.helpers.ts` · `kds/page.tsx` (`toppingLabel`/`kdsVariant` now read variant from canh product name, topping/note kept as legacy fallback). cart.ts + order-payload.ts unchanged. | CANH-4 | 1 | ✅ | Stepper always enabled (bound to real có rau/không rau products); canh cards filtered from sections+search; có/không rau write distinct real product_ids via existing `setCanhQty`; checkout gate (`startsWith('canh_')`) + payload unchanged; `tsc --noEmit` 0 new errors (2 pre-existing AuthState test errors); lint clean on 4 files; vitest 107 pass / 2 pre-existing fail. Live screenshot pending (needs docker compose up) |

---

## Phase DEPLOY — Server Deployment (Mac Test Server → VPS Go-Live)

> **Owner:** DevOps
> **Dependency:** P6 ✅ (compose/Caddy/CI-CD exist) · P7-10 ✅ (`docs/GOLIVE_RUNBOOK.md`)
> **Status:** 🔄 IN PROGRESS
> **Added:** 2026-06-11
> **Goal:** Stage A — production-like test server on the owner's Mac, clients access via LAN (`http://<mac-ip>` through Caddy). Stage B — real VPS + domain + auto-HTTPS, deploys driven by existing GitHub Actions (`deploy.yml`).
> **Plan:** approved 2026-06-11 (plan file `crispy-conjuring-valley`). Key gap found: BE container never runs migrations (ENTRYPOINT is bare `./server`).
> **Order:** D-1 → D-2 → D-3 → D-4 → D-5 (Stage A) → D-6 → D-7 → D-8 (Stage B; D-6/D-7 need owner: buy VPS+domain, set GitHub secrets, push)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| D-1 | DevOps | Migration auto-run: new `be/entrypoint.sh` (goose-retry loop → `goose up` → `exec ./server`) + goose installed in `be/Dockerfile`, ENTRYPOINT switched | — | 1 | ✅ | Verified 2026-06-11: fresh `mysql_data` → `goose: successfully migrated database to version: 17`, `/health` 200 |
| D-2 | DevOps | Production-like `.env` for Mac (real secrets, all URLs = `http://192.168.102.9`, `NEXT_PUBLIC_API_URL` **with `/api/v1`**). **Scope +3 (required, flagged):** compose mysql healthcheck `-p${MYSQL_PASSWORD}` (was hardcoded); Caddyfile `/uploads/*` → be:8080 (images 404'd through Caddy otherwise); caddy service now receives `CADDY_HOST`/`ACME_EMAIL` env (root cause of pre-existing caddy crash-loop: empty `email` directive = fatal parse error) | — | 1 | ✅ | No `CHANGE_ME`; old dev `.env` → `.env.bak.dev` |
| D-3 | DevOps | Full stack up behind Caddy on fresh DB + re-seed (`seed.sql` + `seed_real_menu.sql`). Also fixed pre-existing loki crash-loop (volume chown 10001 + WAL dir in `loki-config.yml`) and `smoke_test.sh` bugs (`curl -f` corrupted status capture; bad-creds password too short → 400 not 401) | D-1 · D-2 | 1 | ✅ | All 10 containers stable; `BASE_URL=http://192.168.102.9 ./scripts/smoke_test.sh` → **8/8 pass** |
| D-4 | DevOps | QR URLs for Mac IP + E2E smoke from Mac: browser opened `/table/<token>` → guest session → menu rendered; API: guest `POST /orders` (topping snapshot, server prices) → admin `GET /orders/:id` OK → cancelled. SSE streams through Caddy. **Owner to repeat once from a phone on shop Wi-Fi** (QR URL list in runbook §A1.6) | D-3 | 1 | ✅ | Guest order ORD-20260611-0001 created + visible to admin via `http://192.168.102.9`; full staff-UI click-through stays in P7-5.4 |
| D-5 | DevOps | `docs/devops/DEPLOY_RUNBOOK.md` — flow diagram, Mac checklist, gotcha table, VPS deltas. Also corrected `docs/GOLIVE_RUNBOOK.md`: `NEXT_PUBLIC_API_URL` must end `/api/v1` (×2) + migration log line now from `entrypoint.sh` | D-4 | 1 | ✅ | Owner can redo Stage A / execute Stage B from docs alone |
| D-6 | Owner | Buy VPS (Vultr/DO Singapore, Ubuntu 24.04, 2 vCPU/2 GB) + domain (~$10/yr); DNS A record → VPS IP | D-5 | 1 | ⬜ | `dig <domain>` resolves to VPS IP |
| D-7 | DevOps+Owner | VPS prep (deploy user, Docker, UFW 22/80/443 only, clone → `/opt/banhcuon`, prod `.env` with NEW secrets) + 5 GitHub secrets (`DEPLOY_HOST/USER/KEY/PATH`, `NEXT_PUBLIC_API_URL`) + first deploy via push to `main` | D-6 | 1 | ⬜ | `https://<domain>` valid LE cert; `/health` 200; pipeline rollback path proven once |
| D-8 | DevOps | Go-live ops: QR codes for `https://<domain>`; nightly `mysqldump` backup script + cron; Grafana/Prometheus only via SSH tunnel; unblocks P7-7 (real webhook URL) | D-7 | 1 | ⬜ | Backup file appears after cron; only 22/80/443 open in `ufw status` |

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

---

## Phase P-SYSDOC — System Handbook (`docs/system/`)

> **Owner:** Docs
> **Dependency:** none (read-only synthesis of existing docs + code)
> **Status:** ✅ COMPLETE (1→6) — 26 files; reusable folder template for other projects
> **Goal:** One self-contained entry point (`docs/system/README.md`) covering FE + BE: overview, flows, specs, tech/code summaries, state management (Zustand/local), loading, Redis cache, design system, data communication — so anyone can understand the system in 30 min, then dev a new page that fits.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-SYSDOC-1 | Docs | BE docs — `03_be/` (tech summary, code summary + route table, REDIS_CACHE, REALTIME_SSE) + `02_spec/` (API_SPEC, DB_SCHEMA, ERROR_SPEC) | — | 1 | ✅ | Verified against code; DB_SCHEMA reflects migration 017 (filling column dropped → toppings_snapshot) |
| P-SYSDOC-2 | Docs | FE docs — `04_fe/` (tech/code summary, STATE_MANAGEMENT, LOADING_PATTERNS, DESIGN_SYSTEM, DATA_COMMUNICATION) | — | 1 | ✅ | Store/hook/component inventory matches `fe/src/`; tokens from real `globals.css` |
| P-SYSDOC-3 | Docs | Overview + flows — `00_overview/` + `01_flow/` (client, staff, order state machine, payment) + `02_spec/BUSINESS_RULES.md` + `00_overview/system_data_flow.excalidraw` (whole-system: 3 entry points + 4 data channels) | — | 1 | ✅ | Mermaid sequence/state diagrams; links back to MASTER_v1.2 as authority; data-flow drawing endpoints verified against `main.go` (webhooks/SSE/WS) |
| P-SYSDOC-4 | Docs | Interface + dev guide — `README.md` (entry point, reading paths by role) + `05_dev_guide/` (NEW_PAGE_GUIDE, FOLDER_TEMPLATE for reuse in other projects) | 1–3 | 1 | ✅ | Every file ≤ ~250 lines with TL;DR + Deep Dive Sources footer |
| P-SYSDOC-5 | Docs | DevOps docs — `09_devops/` (DEVOPS_INDEX, GO_LIVE, MONITORING, MAC_TEST_SERVER_PLAN) summarizing existing `docs/devops/` + `GOLIVE_RUNBOOK.md` + `monitoring/` configs; plan to run owner's Mac as a real-operation test server (Stage A + GitHub-pull deploys + ops drills) | 1–4 | 1 | ✅ | Summaries verified against compose/runbooks; README folder map gains row 09; no duplication of runbook steps (link, don't copy) |
| P-SYSDOC-6 | Docs | Caching design — `10_caching/` (CACHING_INDEX layer map FE→BE→DB + CACHE_FLOW_E2E read/write/invalidation flows, staleness budgets, realtime bypass) + `caching_flow.excalidraw` (3 color-coded bands: read/write/realtime). Cross-layer view only — Redis key table stays in REDIS_CACHE.md, FE query keys stay in STATE_MANAGEMENT.md (one fact, one home) | 1–2 | 1 | ✅ | Diagrams match code (`productCacheTTL` 5 min, `providers.tsx` 60 s default, no Cache-Control in Caddyfile); README folder map gains row 10; excalidraw JSON validates (66 elements) |

## Phase P-FIX-CANH — Stale canh count in cart

> **Owner:** FE
> **Dependency:** none
> **Status:** ✅ COMPLETE

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-FIX-CANH-1 | FE | `OrderSummary` CANH section showed leftover bowl counts (e.g. 2/2) on a fresh menu load. Root cause: `cart.ts` persisted `drinkConfig` but not `items`, so old canh counts resurfaced without their order. Fix: drop `drinkConfig` from `partialize`; bump persist `version` 3→4 with migrate that deletes stale `drinkConfig`. | — | 1 | ✅ | Canh starts at 0/0 on fresh load; existing stale localStorage value flushed on next load |

## Phase P-FEQA — FE Code Quality Audit

> **Owner:** FE
> **Dependency:** none
> **Status:** 🔄 IN PROGRESS

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-FEQA-1 | FE | Audit FE code quality across 8 aspects (structure · data fetching · loading states · client state · security · type safety · logic · performance). Output: `docs/fe/quality_audit/` folder — one report per aspect + prioritized SUMMARY. Read-only, no code changes. | — | 1 | ✅ | 55 findings (5 🔴 · 23 🟠 · 27 🟡), each with ID, severity, file:line, concrete fix; worklist in `SUMMARY.md` |
| P-FEQA-2 | FE | Apply audit findings one by one (owner-driven, picked from SUMMARY) | P-FEQA-1 | TBD | ⬜ | Each applied finding verified; report updated with ✅ |

---

## Phase P-SYSTEST — docs/system Structure Test (Menu Page Rebuild)

> **Owner:** FE + BE (sandbox — no production code touched)
> **Dependency:** docs/system handbook ✅ · client_menu_page_v2 spec ✅
> **Status:** ✅ COMPLETE (2026-06-12)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| P-SYSTEST-1 | FE+BE | Rebuild menu page as **reference code** (not runnable) in `docs/system/06_test_build/menu_page/` — fresh code derived from handbook + `client_menu_page_v2` spec, spec-exact as-built. Includes `DEV_PLAN.md` (visual build plan) + `DIFF_VS_CURRENT.md` (deviations vs production). Tests whether docs/system alone can drive a clean build. **Zero edits to `fe/` or `be/`.** | — | 1 | ✅ | Folder contains FE page+components+stores+lib, BE menu slice (handler/service/repo), 3 docs; production `fe/`+`be/` untouched; NEW_PAGE_GUIDE gains DEV_PLAN step. Test verdict + 4 handbook gaps → `DIFF_VS_CURRENT.md` |

---

## Phase STOR — Ingredient Storage: Daily Usage + Run-out Forecast

> **Owner:** BE + FE
> **Dependency:** existing ingredients feature (009/010 migrations, ingredient_handler/service/repo, admin/ingredients FE) ✅
> **Status:** 📄 SPEC'D in docs/system (code deferred) — owner asked for docs-only this session
> **Goal:** extend the existing storage feature so each ingredient shows total imported (tổng nhập),
> a manual daily-usage estimate (dùng/ngày), and a forecast run-out date (dự kiến hết). Daily usage =
> manual `avg_daily_usage` field; forecast = `current_stock ÷ avg_daily_usage`.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| STOR-0 | Docs | Document the whole feature in `docs/system` as a forward spec (markdown only, no code): object-model home [OBJECT_MODEL_INGREDIENT.md](../system/02_spec/object/OBJECT_MODEL_INGREDIENT.md) (incl. §4 STOR), backend-view [admin_ingredients_be.md](../system/08_pages/admin/admin_ingredients/admin_ingredients_be.md), extended [admin_storage.md](../system/08_pages/admin/admin_storage/admin_storage.md), and business logic in LOGIC_INDEX/BE/FE; indexes updated. CURRENT behavior marked live, forecast marked 🔮 PLANNED. | — | 1 | ✅ | All STOR fields/formula documented; forecast clearly labelled not-in-code; links resolve |
| STOR-1 | BE | Migration `018` add `ingredients.avg_daily_usage DECIMAL(10,3) DEFAULT 0`. Repo: thread `avg_daily_usage` through create/update + scan; add `total_imported` (correlated SUM of `type='in'` movements) to the ingredient SELECTs; on create, record an initial `in` stock_movement for `initialQuantity` so the ledger + total are complete. Handler `toIngredientJSON`: add `avgDailyUsage`, `totalImported`, `daysRemaining`, `runoutDate`; create/update reqs accept `avgDailyUsage`. | STOR-0 | 1 | ⬜ (deferred) | `GET /admin/ingredients` returns the 4 new fields; `runoutDate`/`daysRemaining` are `null` when `avgDailyUsage=0`; `total_imported` = Σ in-movements (incl. initial); `go build ./...` passes |
| STOR-2 | FE | `admin.api.ts`: add `avgDailyUsage`/`totalImported`/`daysRemaining`/`runoutDate` to `Ingredient` + `avgDailyUsage` to Create/Update inputs. `IngredientFormModal`: add "Sử dụng mỗi ngày" number input. `IngredientTable`: add columns **Tổng nhập**, **Dùng/ngày**, **Dự kiến hết** (date + days-left badge; "—" when not estimated). | STOR-1 | 1 | ⬜ (deferred) | Table shows total imported, daily usage, and forecast run-out date; "—" when `avgDailyUsage=0`; form can set daily usage; `npm run build` passes |

---

## Ops — Mac LAN Test Server

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| OPS-CORS-1 | BE | `main.go` CORS middleware: split `CORS_ORIGINS` on commas, echo back only the request's matching `Origin` (was emitting the whole string as one invalid header → browsers rejected multi-origin). | — | 0.2 | ✅ | `Access-Control-Allow-Origin` returns a single valid origin for each allowed entry (localhost + LAN both work); unknown origin gets no header; `go build ./...` passes |
| OPS-ENV-1 | DevOps | Refresh root `.env` Mac LAN IP `192.168.102.9 → 192.168.102.6` (stale after router change) across `NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`, `STORAGE_BASE_URL`, `WEBHOOK_BASE_URL`; access stays via Caddy :80 (same-origin). | OPS-CORS-1 | 0.2 | ✅ | `docker compose up -d --build fe be` (no shell env) serves the app at `http://192.168.102.6` reachable from a phone; menu data loads |
| COMPAT-IOS14-1 | FE | iOS 14 Safari compat: app crashed on iOS 14.8 ("client-side exception"). TWO root causes: (1) **PARSE error** — `@tanstack/react-query`/`query-core` + `@radix-ui/react-slot` ship **private class methods** (`#m()`, Safari 15+) in their dist; Next does NOT transpile `node_modules` → `SyntaxError`. Fix: `transpilePackages` in `next.config.js` + `browserslist` `Safari >= 14` so SWC down-levels them. (2) Missing ES2022 **runtime built-ins** (`Object.hasOwn`, `Array/String.prototype.at`, `findLast/findLastIndex`, `structuredClone`) → targeted feature-detected `core-js` polyfills in `'use client'` `polyfills.ts` loaded first in root layout. Files: `fe/next.config.js`, `fe/package.json`, `fe/src/app/polyfills.ts` (new), `fe/src/app/layout.tsx`. NB: WebKit/Playwright emulation can't catch (1) — only a real iOS 14 device does. | OPS-ENV-1 | 0.5 | ✅ | iPhone XS Max iOS 14.8 at `http://192.168.102.6` LOADS + renders menu + admin (owner-confirmed on device); built bundle has 0 private-method declarations + 0 other parse hazards; iPad/iOS 15+ still work; bundle delta +88KB raw / +26KB gzip |

---

## Phase TBL — Table Handling (FE)

> **Owner:** FE
> **Dependency:** existing QR-scan cart flow (cart.tableId/tableName) + admin overview data source (`GET /tables`, `GET /orders/live`) ✅
> **Backend:** NO change — `POST /orders` already accepts `source:'pos'` + optional `table_id`; a busy table is informational only (never blocks creation). Verified by owner.
> **Scope note:** "Đặt hộ" on Admin Overview is **list view only** (`TableList`) per owner decision — `TableGrid` (grid toggle) left untouched.
> **Status:** ✅ COMPLETE — `npx tsc --noEmit` clean on all 6 touched files (only pre-existing test-file errors remain)

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| TBL-A | FE | Client can NEVER type a table — QR scan is the only source (resolves GAP-1 in customer_menu/COMPARISON_DISCUSSION.md). Remove "Nhãn bàn" input + `table` state + `setTableLabel` call from `menu/settings/page.tsx` (KEEP "Tên hiển thị"); `MenuHeader.tsx` + `CartDrawer.tsx` read `useCartStore().tableName` instead of `useSettingsStore().tableLabel`; drop now-unused `tableLabel`/`setTableLabel` from `store/settings.ts` (store keeps only `customerName`). | — | 0.5 | ✅ | After QR scan, header + cart subtitle show the scanned table; customer has NO field to type a table anywhere; "Tên hiển thị" still works |
| TBL-B | FE | Staff "Đặt hộ" (book a table for a phone-less guest) from BOTH Admin Overview and POS. `TableList.tsx`: add "Đặt hộ" button on every row, DISABLED on occupied rows (occupancy via existing `orderByTable` map) → `router.push('/pos?table_id=<id>&table_name=<name>')`. `pos/page.tsx`: (a) read `table_id`/`table_name` from query → show in header, include `table_id` in POST body, `customer_name`=table name; no param = unchanged walk-in. (b) add an in-POS table picker (reuse `listTables` + `listLiveOrders` from admin.api — DISABLE occupied tables; no new endpoint). | TBL-A | 1 | ✅ | From Overview, "Đặt hộ" greyed out on occupied tables; clicking a free table opens POS scoped to it → add món → Tạo Đơn → order shows attached to that table on Overview; same works picking a free table inside POS; occupied tables unselectable on both surfaces |

---

## Phase GAP-7-FAV — Favourites Rail align to new design

> **Owner:** FE
> **Dependency:** FavouritesRail.tsx + favourites.ts already exist ✅
> **Status:** ✅ COMPLETE (2026-06-24)
> **Goal:** Close 3 new-design divergences in FavouritesRail (GAP-7 per COMPARISON_DISCUSSION.md). No new component needed — component existed.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| GAP-7-FAV | FE | FavouritesRail.tsx — 3 fixes: (1) card tap → `/menu/product/${id}` · `/menu/combo/${id}` (was `/menu/favourites`); (2) heart `fill-primary text-primary` (was `fill-red-500`); (3) section `<h2>` adds `<Heart size={12} className="fill-primary text-primary" />` icon. Doc sync: COMPARISON_DISCUSSION.md · COMPARISON_DOC_VS_CODE_DETAILED.md · ..._VI.md · COMPARISON_VISUAL_MOCKUP_VI.md · COMPARISON_TRACKER.md all updated. | — | 0.5 | ✅ | tsc --noEmit: 0 new errors (2 pre-existing in staff-order-flow.test.ts, unrelated); card-list heart color on ProductCard/ComboCard/ProductGridCard deferred to GAP-8 |

---

## Phase GAP-9-CHECKOUT — Customer Menu: Checkout Bottom Bar → Floating Pill Buttons

> **Owner:** FE
> **Dependency:** CartBottomBar.tsx + menu/page.tsx ✅
> **Status:** ✅ COMPLETE (2026-06-24)
> **Goal:** Replace full-width orange bottom bar with 2 floating pill buttons bottom-right (new design per DESIGN_PROMPT.md §8).

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| GAP-9-CHECKOUT | FE | Customer menu: checkout bottom bar → 2 floating pill buttons (new design). `CartBottomBar.tsx` rewritten: cart pill (🛒 icon + round orange count badge, taps → scroll to order summary) + "Thanh toán" pill (orange, dimmed when canh missing, no total shown). `menu/page.tsx`: added `id="order-summary"` anchor + `handleViewSummary` handler + passed `onViewSummary` prop. Files: `fe/src/features/menu/components/CartBottomBar.tsx` · `fe/src/app/(shop)/menu/page.tsx`. | — | 0.5 | ✅ | tsc --noEmit: 0 new errors (2 pre-existing in staff-order-flow.test.ts, unrelated); cart pill shows count badge; "Thanh toán" dims when canh missing; no total displayed; tap cart pill scrolls to order summary |

---

## Phase GAP-8 — Combo Card Multi-Nhân + Orange Hearts

> **Owner:** FE
> **Dependency:** TOP ✅ · CANH ✅ (topping model unified; nhân already in `item.toppings[]`)
> **Status:** ✅ COMPLETE (2026-06-24)
> **Goal:** Convert ComboCard nhân from single-select to multi-select (both default, ≥1 required); recolor hearts on ComboCard/ProductCard/ProductGridCard from red → orange token. FE-only, no BE changes.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| GAP-8 | FE | `ComboCard.tsx`: nhân pills → multi-select (`Set<string>`, default = ALL selected, toggleNhan guards ≥1); `cartId` encodes sorted id set (`combo_<id>_<id1>-<id2>`); `toppings[]` carries all selected Topping objects → `order-payload.ts` maps them automatically (no change to payload builder). `ProductCard.tsx` + `ProductGridCard.tsx`: heart `fill-red-500 text-red-500` → `fill-primary text-primary`. Verify `order-payload.ts` unchanged (already maps `item.toppings.map(t=>t.id)` onto every combo sub-item). Doc updates: COMPARISON_DISCUSSION.md GAP-8 section → ✅ xong + decision text; bottom summary table GAP-8 row → ✅; MASTER_TASK.md this row. | TOP ✅ · CANH ✅ | 0.5 | ✅ | tsc --noEmit: 0 new errors (2 pre-existing AuthState in staff-order-flow.test.ts unrelated); lint: 0 new errors/warnings in 3 files; 107 tests pass / 2 pre-existing fail (orderNote/clearCart + CART_CONFIG key); order-payload.ts unmodified |

---

## Phase OV-KIEMTRA — Admin Overview "Kiểm tra" What-If Preview

> **Owner:** FE
> **Dependency:** Admin Overview Zone B/C/D ✅
> **Status:** ✅ COMPLETE (2026-06-29)
> **Goal:** Clicking 🔍 Kiểm tra on a WaitingSection row lights that row's border (indigo), pulls that table's dishes OUT of the **Tổng món** base, and re-shows them as a separate `+N` delta on both the category chips and the per-table detail table — a what-if preview so staff can decide whether to fold more tables into the current prep batch, and back out freely.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| OV-KIEMTRA-DELTA | FE | `overview.helpers.ts`: `summarizeTableDishes` takes optional `checkedTableIds` → returns base `total`/`breakdown`/`details` PLUS `deltaTotal`, per-breakdown `delta`, and delta-flagged detail rows; checked tables excluded from base. `TableSection.tsx`: chips show `×base (+delta)`, detail table appends highlighted `(+N)` rows for checked tables, "Bỏ kiểm tra (n)" clear button. `overview/page.tsx`: derive `kiemTraTableIds` from `kiemTraIds`, pass + `clearKiemTra`. `WaitingSection.tsx`: indigo border+ring on checked rows. | — | 1 | ✅ | tsc 0 new errors (2 pre-existing AuthState in staff-order-flow.test.ts unrelated); lint 0; default (nothing checked) identical to today; checking a table removes it from base & shows `(+N)` on chips + highlighted detail rows; uncheck folds back; "Bỏ kiểm tra" clears all |
| OV-KIEMTRA-CANHGIO | FE | "Đơn hàng cần làm" (ConfirmedPrepList D4): ♨ Canh & Giò matrix splits base vs kiểm tra like the dish rows — `CanhGioEntry.preview?` flag, matrix cells/row/col/grand totals render amber `+N` beside base, header gains `⊕ +N kiểm tra`; `collectCanhGio(orders, preview)` called separately for confirmed vs previewOrders. PrepPanel (Zone C) passes no flag → unchanged. | OV-KIEMTRA-DELTA | 1 | ✅ | tsc 0 new errors (same 2 pre-existing); no kiểm tra active → matrix identical to before; kiểm tra active → canh/giò from pending orders show as amber `+N`, never merged into base |
| OV-ROW-BG-LEGEND | FE | WaitingSection (Zone B "Danh sách bàn cần chuẩn bị"): full row/card background tinted by state — wait-time urgency for pending rows (orange <10p · yellow 10–20p · red >20p, matching existing border-l colors) and indigo when 🔍 Kiểm tra active; add color legend bar under header explaining each background. Zone B only ever holds `pending` orders (per Status Routing Reference) so urgency is the state that varies. | OV-KIEMTRA-DELTA | 1 | ✅ | tsc 0 new errors; each row bg matches its border-l urgency color; kiểm tra row stays indigo; legend chips visible on desktop + mobile; hover/expand still readable |
| OV-XONG-FASTPAY | FE | `TableList.tsx` ("Danh sách bàn" list rows): add green **Xong** button beside "Đặt hộ" on every active-order row. Double-tap to fire (1st tap arms → "Chạm lần nữa", auto-reset 2.5s; 2nd tap runs). Fast-completes the order: FE chains remaining status transitions (BE only allows sequential pending→confirmed→preparing→ready→delivered) then `POST /payments` cash for `total_amount`; on success calls `onPaymentDone` (row leaves live list → PaidLog). No BE change. | — | 1 | ✅ | tsc 0 new errors; single tap does nothing but arm; double-tap on pending order lands it in Đơn đã thanh toán with correct total; delivered order pays directly; failure mid-chain shows toast, row stays with WS-synced status |

---

## Phase ONLINE-ORD — Admin Online Orders Zone + Online Checkout Fields

> **Owner:** BE + FE
> **Dependency:** Admin Overview ✅ · Checkout ✅
> **Status:** ✅ COMPLETE (2026-07-03)
> **Goal:** Đơn `source='online'` (không có bàn) hiện đang vô hình trên admin overview — WaitingSection lọc `table_id`, nên đơn online kẹt `pending` mãi và làm lệch count "Hàng chờ phục vụ" phía khách (2 vs 1). Sửa gốc: component riêng cho đơn online trên admin (SĐT · địa chỉ · chỉ đường Google Maps · thanh toán · topping/yêu cầu · giờ lấy) + checkout online thu thêm địa chỉ & giờ lấy.

| ID | Owner | Task | Deps | Sessions | Status | AC |
|---|---|---|---|---|---|---|
| ONLINE-1 | BE | Migration `018`: `orders.delivery_address VARCHAR(255) NULL` + `orders.pickup_at DATETIME NULL`; sqlc regen; `CreateOrder` DTO/service/repo thread 2 fields (handler parse RFC3339 → 400 nếu sai); `orderJSON` trả `delivery_address`/`pickup_at`/`payment_method`/`payment_status`; `ListActiveOrders` hydrate payment (GetPaymentByOrderID, chỉ đơn online, `SetPaymentRepo` optional wiring); 2 raw-SQL SELECT (ListActiveOrders/ListTodayHistory) thêm 2 cột mới | — | 1 | ✅ | `go build ./...` + `go vet` sạch; service tests pass; POST /orders với address+pickup lưu đúng (verify curl); GET /orders/live trả đủ field mới (verify curl) |
| ONLINE-2 | FE | Checkout: khi `!cart.tableId` (source online) thêm field **địa chỉ nhận hàng** (bắt buộc, zod ≥5 ký tự qua `onlineSchema`) + **giờ lấy** (select Sớm nhất/15'/30'/45'/1h → `pickup_at` RFC3339 = now+X); payload POST /orders gửi 2 field; đơn QR không đổi (baseSchema) | ONLINE-1 | 0.5 | ✅ | tsc 0 new errors; submit UI thật: order lưu addr="12 Phố Huế…", pickup_at = created+30' (verified); đơn QR không đổi |
| ONLINE-3 | FE | `OnlineOrdersSection.tsx` mới (features/admin/components) + wire vào `overview/page.tsx` (zone ONLINE trên Zone D, tự ẩn khi không có đơn online): card per đơn online active — SĐT (`tel:` link), địa chỉ + nút **Chỉ đường** (Google Maps dir link), badge thanh toán (method/status hoặc "Chưa thanh toán"), món + topping (`toppingLabel`) + note, giờ lấy + countdown (trễ → đỏ), elapsed urgency, nút chuyển trạng thái (Xác nhận→…→Đã giao) + Hủy (trước delivered); `types/order.ts` Order thêm `delivery_address`/`pickup_at`/`payment_method`/`payment_status`; routing reference thêm hàng Zone ONLINE | ONLINE-1 | 1 | ✅ | tsc 0 new errors, lint 0; vitest 107 pass / 2 fail pre-existing; đơn ma 28/06 hiện trên admin + Hủy hoạt động (test order cancelled qua UI); Chỉ đường link encode đúng; count khách = admin |
| ONLINE-4 | FE | `TableList.tsx` ("Danh sách bàn" list view): đơn `source='online'` (không có bàn) hiện thành row trong danh sách như các bàn khác — bàn ảo "🛵 Đơn online", 1 row/đơn, cùng layout (status badge, urgency time/border, Xong double-tap, expand, drawer); ẩn nút "Đặt hộ" (không có table_id); drawer subtitle bỏ capacity cho đơn online. Không sửa page.tsx/TableSection (orders prop đã chứa đơn online, chỉ bị skip do `!table_id`) | ONLINE-3 | 0.5 | ✅ | tsc 0 new errors; đơn online hiện trong Danh sách bàn cùng style row bàn; không có đơn online → list y như cũ; Xong/expand/drawer/search hoạt động trên row online |

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
