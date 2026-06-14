# /page-doc-set Progress Tracker

> One source of truth for all `/page-doc-set` runs.
> A Backend View (`<page>_be.md`) = the code-accurate map of every BE endpoint a page calls,
> traced handler → service → repository → SQL, with auth, caching, errors, and flags.
> Update status + concerns after each run. Never leave a row blank after a session.
> Model file: `docs/system/08_pages/customer/customer_menu/customer_menu_be.md`
> Skill: `.claude/skills/page-doc-set/SKILL.md`

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done — every cell traced to code, docs/system synced |
| ⚠️ | Done but has `❓ UNVERIFIED` cells / open concerns / drift to resolve |
| ❌ | Blocked — page not coded yet (🔮 PLANNED) |
| N/A | Page calls no BE endpoints (static / localStorage-only) |

---

## How to Use

1. Pick a page row below, copy its command, paste it into the prompt.
2. The skill writes `<page>_be.md`, then syncs `docs/system` (API_SPEC, DB_SCHEMA, REDIS_CACHE…),
   updates README + PAGES_INDEX, and logs any drift in the LOGIC Decision Log.
3. Update this row's **Status / Last Run / Concerns** after the run.

---

## Customer Pages

| # | Page | Route | Command | Status | Last Run | Concerns / Notes |
|---|------|-------|---------|--------|----------|-----------------|
| C1 | Menu | `/menu` | `/page-doc-set customer_menu` | ✅ | 2026-06-13 | Model file. 6 endpoints (3 GET catalog public + POST /orders + POST /orders/:id/items + GET /orders/:id). Refresh: re-traced all cells to code — handbook (REDIS_CACHE/CACHE_FLOW/API_SPEC) all match; fixed 3 service line-number offsets in _be.md (ListProducts 164, ListCategories 344, ListCombos 497). No unverified cells. |
| C2 | Welcome | `/welcome` | `/page-doc-set customer_welcome` | ⬜ | — | Signature dishes likely GET /products — confirm on run |
| C3 | Table QR landing | `/table/:tableId` | `/page-doc-set customer_table_qr` | ⬜ | — | QR token → guest JWT exchange |
| C4 | Product Detail | `/menu/product/:id` | `/page-doc-set customer_product_detail` | ✅ | 2026-06-14 | **1 endpoint** (read-only): `GET /products/:id` (public, no auth) → `productH.GetProduct` → `GetProductByID` + `GetToppingsByProductID` + category-name map, Redis `product:<id>` 5 min. Add-to-cart is **client-only** (Zustand `useCartStore`), no BE write; cart `items[]` is session-memory only (not persisted — F5 wipes it). Full 5-file set built (be/crosspage/loading/scenario + existing page doc); crosscomponent = N/A (widgets coordinate via local React state + props, no shared store). **Doc drift fixed:** page-doc Zone table said `GET /products` → corrected to `GET /products/:id`. No code bugs (no FE/BE event/ownership mismatch). 0 ❓ UNVERIFIED. ⚠️ Low-sev cache flag (logged, not a BUGS file): topping edit Dels `products:list` but **not** `product:<id>`, so a topping price/availability change is stale here up to 5 min. |
| C5 | Combo Detail | `/menu/combo/:id` | `/page-doc-set customer_combo_detail` | ⚠️ | 2026-06-14 | **Read-only page, 2 public cached GETs, zero BE write.** `GET /combos` (ListCombos→ListCombosAvailable, `combos:list`) + `GET /products` (ListProducts→ListProductsAvailable, `products:list`), both `is_available=1`-filtered, 5-min TTL. **No `GET /combos/:id`** — page over-fetches both whole lists and resolves combo + item names/prices client-side. Add-to-cart is pure Zustand (`addItem`); the combo cart item is **session-only — NOT persisted** (`partialize` keeps only orderNote/activeOrderId) → lost on F5. Full 6-file set built (be/crosspage/loading/scenario + existing page doc); crosscomponent = N/A (no ≥3 widgets sharing a store). **⚠️ 2 code bugs** → [COMBO_BUGS.md](customer/customer_combo_detail/COMBO_BUGS.md): (1) unavailable-combo UI unreachable (BE filters it out → "Không tìm thấy combo"); (2) unavailable sub-product shows raw UUID as name. No handbook drift — all docs matched code. Logged in LOGIC Decision Log 2026-06-14. |
| C6 | Favourites | `/menu/favourites` | `/page-doc-set customer_favourites` | ⬜ | — | Mostly localStorage — confirm whether saved-sets hit BE |
| C7 | Settings | `/menu/settings` | `/page-doc-set customer_settings` | N/A | — | Local display prefs only — no BE calls (verify on run) |
| C8 | Checkout | `/checkout` | `/page-doc-set customer_checkout` | ⬜ | — | POST /orders (online path), name/phone/payment method |
| C9 | Order List | `/order` | `/page-doc-set customer_order_list` | ⚠️ | 2026-06-14 | **List page itself calls NO BE** — renders cards from localStorage `order_cache_*` (stale until a card's detail sheet refetches). BE surface (4 endpoints) reached only via the `OrderDetailSheet` overlay, all `authMW` + table-ownership: GET /orders/:id · SSE GET /orders/:id/events · DELETE /orders/:id · DELETE /orders/items/:id. No Redis read-cache (Redis = pub/sub fan-out only). ⚠️ open code drift (logged): `item_cancelled` SSE event unhandled FE-side; 404 wedges sheet spinner (`isNotFound` never read); SSE handler does no ownership check. All 4 endpoints + overlay shared with C10 `/order/:id`. 6-file set: skipped crosscomponent (no shared store across ≥3 widgets); built be/crosspage/loading/scenario. |
| C10 | Order Detail | `/order/:id` | `/page-doc-set customer_order_detail` | ⬜ | — | GET /orders/:id + SSE + cancel + add-more (realtime) |
| C11 | Tracking | `/tracking` | `/page-doc-set customer_tracking` | ⚠️ | 2026-06-14 | 2 BE surfaces traced: `GET /orders/:id` (authMW, table-ownership guard, no Redis cache) + `GET /sse/order-monitor/:id` (authMW, subscribes `order:<id>`+`queue:broadcast`+`tables:broadcast`, initial snapshot via `MonitorSnapshot`→`buildMonitorPayloads`, 15s heartbeat). Read-only page, zero writes. Full 5-file set built (be/crosscomp/loading/scenario + existing page doc); crosspage = N/A (consumer, no handoff). **⚠️ Open code bugs (not doc drift):** (1) SSE status badge dead — BE emits `order_status_changed`, hook listens `order.status`; (2) `item_progress` published, not consumed; (3) queue position/ETA computed FE-side (BE sends 0); (4) `tables.status` + `reconnect()` + `showBannerAfter` are dead outputs. Logged in LOGIC Decision Log 2026-06-14. |
| C12 | Profile | `/profile` | `/page-doc-set customer_profile` | ⬜ | — | Confirm profile GET/PATCH vs local-only |
| C13 | Landing | `/` | `/page-doc-set public_landing` | ⬜ | — | Marketing/demo — staff quick login + table QR shortcuts |
| C14 | Introduction | `/introduction` | `/page-doc-set customer_introduction` | ❌ | — | 🔮 PLANNED — not coded; BE doc would be speculative |
| C15 | Legal | `/privacy-policy` · `/terms` | `/page-doc-set public_legal` | N/A | — | Static legal pages — no BE calls |

---

## Staff Pages

| # | Page | Route | Command | Status | Last Run | Concerns / Notes |
|---|------|-------|---------|--------|----------|-----------------|
| S1 | Login | `/login` | `/page-doc-set staff_login` | ⬜ | — | POST /auth/login + role redirect |
| S2 | Register | `/register` | `/page-doc-set staff_register` | ⬜ | — | POST /auth/register |
| S3 | KDS (Kitchen) | `/kds` | `/page-doc-set staff_kds` | ⬜ | — | Live cooking board — **WebSocket** + PATCH order/item status |
| S4 | POS | `/pos` | `/page-doc-set staff_pos` | ⬜ | — | Walk-in order build — POST /orders (note: bypasses order-payload.ts) |
| S5 | Cashier Payment | `/cashier/payment/:id` | `/page-doc-set staff_cashier_payment` | ⬜ | — | Bill + payment method + VNPay/MoMo + receipt |

---

## Admin Pages

| # | Page | Route | Command | Status | Last Run | Concerns / Notes |
|---|------|-------|---------|--------|----------|-----------------|
| A1 | Overview | `/admin/overview` | `/page-doc-set admin_overview` | ⚠️ | 2026-06-14 | Full 6-file set generated. 8 endpoints traced to code (6 REST + SSE `/sse/admin` + WS `/ws/orders-live`). **No Redis read cache** — every REST read hits MySQL; Redis is pub/sub only (`orders:admin`, `orders:kds`, `order:<id>`, `queue:`/`tables:`). Auth: reads `AtLeast("cashier")`, `GET /orders/:id` authMW-only, status PATCH `AtLeast("chef")`, payments `AtLeast("cashier")`, SSE `AtLeast("manager")`. Key flags: (1) feed is `GET /orders/live` not `GET /orders` (FE doc Zone B corrected); (2) **`delivered → cancelled` Huỷ button always 409s** (not a valid transition); (3) `POST /payments` ignores FE `amount` (uses order total); (4) WS `order_updated`/`order_completed` cases dead (BE never emits); (5) **WS `/ws/orders-live` has no role gate** — any JWT (incl. customer) can subscribe; (6) `orders/history` returns `items:[]`. 2 ❓ UNVERIFIED (FE-side, in x-comp doc): whether PATCH returns order body; whether StatCards counts drop on a pure status advance. |
| A2 | Summary | `/admin/summary` | `/page-doc-set admin_summary` | ⬜ | — | Reports — revenue KPIs, top dishes, staff perf, low-stock (analytics endpoints) |
| A3 | Products | `/admin/products` | `/page-doc-set admin_products` | ⬜ | — | Product CRUD (manager+ writes, admin deletes, cache invalidation) |
| A4 | Combos | `/admin/combos` | `/page-doc-set admin_combos` | ⬜ | — | Combo CRUD + combo_items |
| A5 | Categories | `/admin/categories` | `/page-doc-set admin_categories` | ⬜ | — | Category CRUD |
| A6 | Toppings | `/admin/toppings` | `/page-doc-set admin_toppings` | ⬜ | — | Topping CRUD |
| A7 | Staff | `/admin/staff` | `/page-doc-set admin_staff` | ⬜ | — | Staff account CRUD + activate/deactivate |
| A8 | Staff Task Board | `/admin/staff/task-board` | `/page-doc-set admin_task_board` | ⬜ | — | Per-staff KPIs + task list (staff_tasks) |
| A9 | Todo List | `/admin/todo-list` | `/page-doc-set admin_todo_list` | ⬜ | — | Team tasks — create/edit modal (staff_tasks) |
| A10 | Ingredients | `/admin/ingredients` | `/page-doc-set admin_ingredients` | ✅ | 2026-06-13 | 8 endpoints traced to code (handler/service/repo). RBAC: manager+ all except DELETE (admin only). No Redis caching. Key flags: no initial 'in' movement on create; stock update not transactional; cost_per_unit stored but not serialized; GET /:id and GET /:id/movements not called by current FE. 🔮 STOR forecast subsection added (migration 018 `avg_daily_usage`, totalImported subquery, daysRemaining/runoutDate derivation). |
| A11 | Marketing | `/admin/marketing` | `/page-doc-set admin_marketing` | ⬜ | — | Marketing spend dashboard |
| A12 | Training | `/admin/training` | `/page-doc-set admin_training` | ⬜ | — | Job guides + completion tracking |
| A13 | Storage | `/admin/storage` | `/page-doc-set admin_storage` | ❌ | — | 🔮 PLANNED — not coded; BE doc would be speculative |

---

## Copy-Paste — All Commands

> Run in dependency order or pick any. Skip ❌ (not coded) and N/A (no BE calls).

```
/page-doc-set customer_welcome
/page-doc-set customer_table_qr
/page-doc-set customer_product_detail
/page-doc-set customer_combo_detail
/page-doc-set customer_favourites
/page-doc-set customer_checkout
/page-doc-set customer_order_list
/page-doc-set customer_order_detail
/page-doc-set customer_tracking
/page-doc-set customer_profile
/page-doc-set public_landing
/page-doc-set staff_login
/page-doc-set staff_register
/page-doc-set staff_kds
/page-doc-set staff_pos
/page-doc-set staff_cashier_payment
/page-doc-set admin_overview
/page-doc-set admin_summary
/page-doc-set admin_products
/page-doc-set admin_combos
/page-doc-set admin_categories
/page-doc-set admin_toppings
/page-doc-set admin_staff
/page-doc-set admin_task_board
/page-doc-set admin_todo_list
/page-doc-set admin_ingredients
/page-doc-set admin_marketing
/page-doc-set admin_training
```

---

## Cross-Page Concerns

> BE facts that affect multiple pages — shared endpoints, cache keys, auth gates, drift found.
> Add a bullet when a run uncovers something that touches more than one page's BE doc.

- **SSE order-monitor event-type mismatch (`order.status` vs `order_status_changed`).** The
  `order:<id>` channel carries `order_status_changed` (`order_service.go:552,745`), but the FE
  `useOrderMonitorSSE` hook listens for `order.status` (`useOrderMonitorSSE.ts:67`) — so the live
  status badge never updates from SSE on **any** page using this hook (`/tracking` today; reused by
  the admin floor monitor route). `customer_menu_crosspage_dataflow.md:271,284` also lists
  `order.status` as a real wire event — it documents the broken FE expectation. Fix is code-side
  (align FE listener or BE publisher); flagged to owner, logged in LOGIC Decision Log 2026-06-14.
- **`OrderDetailSheet` + `useOrderSSE` = one shared BE surface for C9 `/order` and C10 `/order/:id`.**
  Both pages reach the identical 4 endpoints (GET /orders/:id · SSE /orders/:id/events ·
  DELETE /orders/:id · DELETE /orders/items/:id) through the same overlay + hook. The C9 trace
  (2026-06-14, [customer_order_list_be.md](customer/customer_order_list/customer_order_list_be.md))
  already covers C10's endpoint detail — when C10 runs, reuse it and zoom on the standalone-page
  differences (URL id vs tapped id, full-page vs overlay loading).
- **`item_cancelled` SSE event is published BE-side but unhandled by `useOrderSSE`**
  (`order_service.go:642` vs `useOrderSSE.ts:83-123`) — affects every page that renders live order
  detail via this hook (C9, C10). Logged in LOGIC Decision Log 2026-06-14.
- **Catalog GETs are "available-only" everywhere — no per-id combo endpoint.** Both
  `ListProductsAvailable` and `ListCombosAvailable` filter `WHERE is_available=1 AND deleted_at IS
  NULL` (`products.sql.go:469,387`), and there is **no `GET /products/:id` for combos** (combos
  group is GET-list + manager/admin writes only, `main.go:215-227`). Consequence shared by the
  catalog-detail pages: `/menu/combo/:id` (C5) over-fetches the whole list and finds by id
  client-side, and any FE code path for an *unavailable* product/combo or an unavailable combo
  sub-item is unreachable from the public catalog (C5 [COMBO_BUGS.md](customer/customer_combo_detail/COMBO_BUGS.md)
  bugs 1–2). When C8 `/checkout` / C2 `/welcome` / C4 product-detail are traced, expect the same
  available-only filter to shape their empty/edge states. Logged in LOGIC Decision Log 2026-06-14.
- **`orders:kds` Redis channel is shared by KDS + Overview WS.** Both `/ws/kds` and
  `/ws/orders-live` subscribe to the same `orders:kds` channel (`websocket/handler.go:18,23`), so
  every `order_status_changed` / `item_progress` / `new_order` event reaches the KDS board **and**
  the admin live floor. A change to the published `orderEvent`/`itemEvent` shape
  (`order_service.go:789-804`) breaks **both** S3 (staff_kds) and A1 (admin_overview) BE docs at
  once. Found during A1 run 2026-06-14.
- **WS `/ws/orders-live` and `/ws/kds` carry no `authMW` and no role gate** — auth is `?token=`
  parsed inside the handler (`main.go:337`, `websocket/handler.go:31-47`). Any authenticated JWT
  (incl. a `customer` guest token) can subscribe to either live feed. Affects every page consuming
  the orders WS (A1 Overview, S3 KDS). Contrast SSE `/sse/admin` = `AtLeast("manager")`. Logged in
  LOGIC Decision Log 2026-06-14.
