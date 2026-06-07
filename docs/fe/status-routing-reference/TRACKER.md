# /status-routing-reference Progress Tracker

> One source of truth for all `/status-routing-reference` runs.
> A Status Routing Reference = the code-accurate table mapping every entity status to the
> zone/component that renders it (+ action buttons + per-zone rules).
> Update status + concerns after each run. Never leave a row blank after a session.
> Model file: `docs/fe/wireframes/admin_main/admin_overview/Admin_Overview_Status_Routing_Reference.md`

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done — every cell traced to code |
| ⚠️ | Done but has `❓ UNVERIFIED` cells / open concerns |
| ❌ | Blocked / page not coded yet |
| N/A | No entity statuses — a routing reference does not apply |

---

## Client Pages

| # | Page | Command | Status | Last Run | Concerns / Notes |
|---|------|---------|--------|----------|-----------------|
| C1 | Menu | `/status-routing-reference client_menu_page` | N/A | 2026-06-07 | No entity status routing (catalog only). Concerns: (1) banner.jpg 404; (2) Canh price 0₫; (3) 🚨 toppings unselectable from menu list (`ProductCard hasToppings=false`); (4) 🚨 toppings never shown in "Tóm tắt đơn hàng" (OrderSummary ignores `item.toppings`) — active, seed gives every bánh nhân toppings; (5) ⚠️ menu card uses `filling` field but DB models nhân/rau as toppings → 2 add paths disagree. |
| C2 | Product Detail | `/status-routing-reference client_product_detail` | N/A | — | No entity status routing |
| C3 | Order | `/status-routing-reference client_order_page` | ⚠️ | 2026-06-07 | Refreshed to new skill shape (Live Snapshot + FROM/TO/CROSS-PAGE headings). All code cells traced. Live snapshot NOT captured (Playwright profile locked + needs auth'd real order). ⚠️ `paid` treated as active. ⚠️ pending can't whole-order cancel. ⚠️ dead SSE branches `order_init`/`order_completed` never emitted by BE. Fixed: FE OrderItem has `flagged`, not `item_status`. |
| C4 | Monitoring / Servicing Table | `/status-routing-reference client_monitoring_servicing_table` | ⬜ | — | SSE-gated zones by order status |
| C5 | Favourites | `/status-routing-reference client_favourite_page` | N/A | — | No entity status routing |
| C6 | Info | `/status-routing-reference client_info_page` | N/A | — | No entity status routing |

---

## Admin Pages

| # | Page | Command | Status | Last Run | Concerns / Notes |
|---|------|---------|--------|----------|-----------------|
| A1 | Products | `/status-routing-reference admin_main/admin_main_product` | N/A | — | availability flag only, not a status flow |
| A2 | Categories | `/status-routing-reference admin_main/admin_main_categories` | N/A | — | No entity status routing |
| A3 | Toppings | `/status-routing-reference admin_main/admin_main_topping` | N/A | — | availability flag only |
| A4 | Combos | `/status-routing-reference admin_main/admin_main_combos` | N/A | — | No entity status routing |
| A5 | Staff | `/status-routing-reference admin_main/admin_main_staff` | ⬜ | — | staff active/shift status — confirm if status-routed |
| A6 | Marketing | `/status-routing-reference admin_main/admin_main_marketing` | N/A | — | No entity status routing |
| A7 | Storage | `/status-routing-reference admin_main/admin_main_storage` | ⬜ | — | ingredient status (ok/expiring_soon/expired) by row |
| A8 | Todo List | `/status-routing-reference admin_main/admin_main_todo_list` | ⬜ | — | task status routing |
| A9 | Staff Task Board | `/status-routing-reference admin_main/admin_main_staff_task_boad` | ⬜ | — | task status → board column |
| A10 | Training | `/status-routing-reference admin_main/admin_main_training` | ⬜ | — | completion status routing |
| A11 | Overview | `/status-routing-reference admin_main/admin_overview` | ✅ | 2026-06-05 | Model reference. order status × zone (B/C/D/E/F) + table.status + action buttons + per-zone rules. |
| A12 | Summary | `/status-routing-reference admin_main/admin_summary` | ⬜ | — | confirm if status-routed |
| A13 | KDS (Kitchen) | `/status-routing-reference kds` | ⬜ | — | order status → column; high-value reference |
| A14 | POS / Payment | `/status-routing-reference pos` | ⬜ | — | order + payment status routing |

---

## Cross-Page Concerns

> Things that affect multiple references — shared status enums, label drift, transition rules.

| # | Concern | Affects Pages | Status | Notes |
|---|---------|--------------|--------|-------|
| X1 | Order status enum is single-source — every reference must use the exact same 7 values | C3, C4, A11, A13, A14 | ✅ | Source: `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md` (`orders.status`). pending·confirmed·preparing·ready·delivered·cancelled·paid |
| X2 | Vietnamese status labels must match across all references (no label drift) | C3, C4, A11, A13, A14 | 🔄 | A11 + C3 use identical labels from `StatusBadge.tsx` (single source). `ready` label = "Sẵn sàng" (A11 had "Sẵn sàng phục vụ" — A11 text is descriptive, badge is "Sẵn sàng"). Re-confirm per page. |
| X3 | Status transition rules (which button → which next status) consistent BE vs FE | A11, A13, A14 | 🔄 | A11 done. C3 has no status-advance buttons (customer only cancels/adjusts qty; advances arrive via SSE). Cross-check against `order-flow` skill when A13/A14 run. |
| X4 | `isActive` semantics — `paid` counts as active on C3 (excludes only delivered/cancelled) | C3, C4, A13, A14 | ⚠️ | Found in C3 (`order/[id]/page.tsx:232`). Confirm whether `paid` should disable edit/cancel/add on all client+staff order surfaces. |

---

## Session Log

> One row per `/status-routing-reference` session. Append, never edit old rows.

| Date | Page | Outcome | Key decisions / notes |
|------|------|---------|------------------------|
| 2026-06-05 | admin_main/admin_overview | ✅ | Seeded as the model reference (pre-existing file renamed from table_status.md → Admin_Overview_Status_Routing_Reference.md). All zones, statuses, buttons, and per-zone rules captured. |
| 2026-06-05 | client_order_page | ⚠️ | Tracking page `order/[id]`. Reframed matrix: single order, status gates buttons/banners/modals (not zone routing). Found 2 BE inconsistencies: `paid` is active (X4), `pending` can't whole-order cancel. Notification modal = SSE-transition-driven, separate from stored status. |
| 2026-06-07 | client_menu_page | N/A | Confirmed N/A (catalog + cart, no entity-status read). Wrote `Menu_Status_Routing_Reference.md` reframed as a data-flow reference (zones · 4 GET queries · single POST /orders write · cross-page stores · OrderSummary rules) instead of a status matrix. 2 concerns logged: banner.jpg 404, Canh price 0₫. |
| 2026-06-07 | client_order_page | ⚠️ | Refresh to new skill structure. Added Live Page Snapshot (couldn't capture — browser profile locked + page needs auth'd real order id; documented why). Restructured Data Management into the 3 canonical headings (FROM BE reads / TO BE writes / CROSS-PAGE) + DishRow preview-math breakdown. Code re-verified against current `[id]/page.tsx` + `useOrderSSE.ts`. Accuracy fix: FE `OrderItem` carries `flagged`, not `item_status` (old §1 was wrong). 3 standing flags unchanged (paid-active, pending no whole-cancel, dead `order_init`/`order_completed` SSE branches). |
| 2026-06-07 | client_menu_page | N/A | Topping audit (selection → cart → "Tóm tắt đơn hàng"). Verdict: filling + combo items + canh/rau correct; toppings WRONG. Seed confirms nhân thịt/mộc nhĩ + rau mùi tàu are DB toppings on every bánh → gap is active. 3 concerns added (3/4/5): menu list can't pick toppings (hasToppings=false), OrderSummary never renders item.toppings, menu-card `filling` vs detail-page topping = 2 disagreeing add paths. Logic fix proposed, awaiting owner align (MASTER row + confirm before coding). |

---

## Quick-Run Order (Recommended)

Run the status-heavy pages first — they share the order status enum and surface label/transition drift early:

```
1. /status-routing-reference admin_main/admin_overview   ← model (done)
2. /status-routing-reference kds                          ← order status → column
3. /status-routing-reference pos                          ← order + payment status
4. /status-routing-reference client_order_page
5. /status-routing-reference client_monitoring_servicing_table
6. /status-routing-reference admin_main/admin_main_storage
7. /status-routing-reference admin_main/admin_main_todo_list
8. /status-routing-reference admin_main/admin_main_staff_task_boad
9. /status-routing-reference admin_main/admin_main_training
```
