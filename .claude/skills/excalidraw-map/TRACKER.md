# Excalidraw-Map Tracker

> Progress for `/excalidraw-map <page-folder>` — the multi-panel doc knowledge map.
> One row per page doc-set under `docs/system/08_pages/`. Update this after each page.
> Model / reference build: **customer_menu** (15 panels, 1661 elements — built before
> the Lens Mockups panel was dropped; new maps target the 14-panel catalog).

**Status legend:** ✅ done · 🔄 in progress · ⬜ not started · ⚠️ blocked (thin/missing docs)

**Progress: 5 / 29 done**

---

## Customer (4 / 10)

| Status | Page | Run | Findings |
|---|---|---|---|
| ✅ | customer_menu | — (reference build) | 15 panels, 1661 elements. Source for `excalib.py` + PANEL_CATALOG. |
| ✅ | customer_checkout | `/excalidraw-map customer_checkout` | 13 panels, 284 elements. Skipped catalog #2 Cross-Component (N/A — single widget, doc-stated). 3 code bugs surfaced (payment_method dead · TABLE_HAS_ACTIVE_ORDER dead branch · online 403). |
| ⬜ | customer_combo_detail | `/excalidraw-map customer_combo_detail` | |
| ⬜ | customer_favourites | `/excalidraw-map customer_favourites` | |
| ⬜ | customer_order_detail | `/excalidraw-map customer_order_detail` | |
| ✅ | customer_order_list | `/excalidraw-map customer_order_list` | 13 panels, 518 elements. Skipped catalog #4 Object Model (page `.md` has NO §Object Model — covered by Panels 9+11). ⚠️ doc-set MISSING `customer_order_list_crosscomponent_dataflow.md` → Panel 2 traced from SCENARIO §A + crosspage §4 instead. Surfaced 4 live bugs (already in TRACKING_BUGS.md): 🔴 404 wedges overlay spinner (`isNotFound` never read) · 🟠 list cards never refetch · 🟠 `item_cancelled` published-not-consumed · 🟡 SSE handler has no ownership check. |
| ⬜ | customer_product_detail | `/excalidraw-map customer_product_detail` | |
| ⬜ | customer_profile | `/excalidraw-map customer_profile` | |
| ⬜ | customer_table_qr | `/excalidraw-map customer_table_qr` | |
| ✅ | customer_tracking | `/excalidraw-map customer_tracking` | 14 panels, 463 elements. Panels 4/11/14 adapted to READ semantics (page is read-only, no writes). Panel 5 (Cross-Page) sourced from _crosscomponent §5 + SCENARIO §B — no `customer_tracking_crosspage_dataflow.md` (absent **by design**: read-only consumer hands nothing off). 4 live code bugs surfaced: 🔴 status badge dead (`order.status` vs `order_status_changed`) · 🟠 `item_progress` not consumed · 🟡 position/ETA FE-computed (BE sends 0) · 🟡 dead outputs (`tableStatuses`/`reconnect()`/`showBannerAfter`). |

## Staff (0 / 5)

| Status | Page | Run | Findings |
|---|---|---|---|
| ⬜ | staff_login | `/excalidraw-map staff_login` | |
| ⬜ | staff_register | `/excalidraw-map staff_register` | |
| ⬜ | staff_kds | `/excalidraw-map staff_kds` | |
| ⬜ | staff_pos | `/excalidraw-map staff_pos` | |
| ⬜ | staff_cashier_payment | `/excalidraw-map staff_cashier_payment` | |

## Admin (1 / 12)

| Status | Page | Run | Findings |
|---|---|---|---|
| ✅ | admin_overview | `/excalidraw-map admin_overview` | 14 panels, 643 elements. Full doc-set (SCENARIO file named `SCENARIO_OVERVIEW_FLOOR.md`). All 14 built — read-write live dashboard. Panel 4 (Object Model) sourced from traced `order.ts` types + be.md (page `.md` has NO §Object Model section). Surfaced the docs' 9 flags: ⚠ `delivered→cancelled` Huỷ button always 409s · optimistic update not rolled back on error · ⚠ WS `/ws/orders-live` has NO role gate (customer JWT can open live floor) · `POST /payments` ignores FE `amount` · WS dead cases `order_updated`/`order_completed` · `orders/history` returns `items:[]` · Zone B feed mislabelled `/orders` (is `/orders/live`). |
| ⬜ | admin_summary | `/excalidraw-map admin_summary` | |
| ⬜ | admin_products | `/excalidraw-map admin_products` | |
| ⬜ | admin_categories | `/excalidraw-map admin_categories` | |
| ⬜ | admin_combos | `/excalidraw-map admin_combos` | |
| ⬜ | admin_toppings | `/excalidraw-map admin_toppings` | |
| ⬜ | admin_ingredients | `/excalidraw-map admin_ingredients` | |
| ⬜ | admin_staff | `/excalidraw-map admin_staff` | |
| ⬜ | admin_marketing | `/excalidraw-map admin_marketing` | |
| ⬜ | admin_task_board | `/excalidraw-map admin_task_board` | |
| ⬜ | admin_todo_list | `/excalidraw-map admin_todo_list` | |
| ⬜ | admin_training | `/excalidraw-map admin_training` | |

## Public (0 / 1)

| Status | Page | Run | Findings |
|---|---|---|---|
| ⬜ | public_landing | `/excalidraw-map public_landing` | |

---

## Findings log
> Note doc-vs-code drift, missing doc-set files, or panels skipped — discovered while building. One line per finding.

- _(none yet — reference page customer_menu was hand-built before the skill existed)_
- **customer_checkout** — `customer_checkout_crosscomponent_dataflow.md` is intentionally absent (N/A: one widget + a single cart read, no multi-writer shared store — stated in `_crosspage_dataflow.md:37` + `SCENARIO §A`). Cross-Component panel skipped; an N/A note folded into Panel 1. Doc-set otherwise rich (incl. extra `CHECKOUT_BUGS.md` with 3 code-level bugs).
- **customer_tracking** — `customer_tracking_crosspage_dataflow.md` intentionally absent (read-only consumer hands nothing off; stated in `_crosscomponent §5`). Panel 5 sourced from `_crosscomponent §5` + `SCENARIO §B` durability matrix. Panels 4/11/14 adapted to READ semantics (no writes). Doc-set rich incl. extra `TRACKING_BUGS.md`. 4 live code bugs (not stale docs): 🔴 status badge never updates from SSE (`order.status` vs published `order_status_changed`) · 🟠 `item_progress` published but no hook case · 🟡 queue position/ETA FE-computed while BE sends 0 placeholders · 🟡 dead outputs `tableStatuses`/`reconnect()`/`RECONNECT.showBannerAfter`.
- **admin_overview** — doc-set complete (6 files; SCENARIO is `SCENARIO_OVERVIEW_FLOOR.md`, not `SCENARIO_ADMIN_OVERVIEW.md`). No panels skipped — read-write live dashboard supports all 14. Panel 4 (Object Model) traced from `order.ts`/`admin.api.ts` type defs + `_be.md` read/write pipelines because `admin_overview.md` has no §Object Model section (only Zones + Business Logic). No stale-doc drift found; the docs already enumerate the code flags. Live code flags carried into Panel 8/13 (all source-traced, not stale docs): ⚠ `delivered→cancelled` Huỷ button on delivered orders → guaranteed 409 hidden by generic toast · optimistic status write never rolled back on error (heals via WS echo / 15s refetch) · 🔴 WS `/ws/orders-live` has no `authMW` role gate — any parseable JWT incl. `customer` can open the live floor (SSE is correctly manager+) · `POST /payments` DTO ignores FE `amount` (server uses `order.total_amount`) · `useOverviewWS` dead switch cases `order_updated`/`order_completed` (BE never emits) · `ListTodayHistory` returns `items:[]` · FE sibling mislabels Zone B source `GET /orders` (real = `/orders/live`).
- **customer_order_list** — doc-set MISSING the dedicated `customer_order_list_crosscomponent_dataflow.md` (the other 5 of the gold-standard 6 present, + extra `TRACKING_BUGS.md`). Panel 2 (Cross-Component) traced from `SCENARIO §A` (the `useOrderSSE → order → widgets` hub) + `_crosspage §4` instead. Panel 4 (Object Model) skipped — page `.md` has no §Object Model section (links out to `OBJECT_MODEL_ORDER.md`); entity shape covered by Panel 9 (live objects) + Panel 11 (DB rows). 4 live code bugs (already logged in `TRACKING_BUGS.md`, none stale-doc): 🔴 404/foreign order wedges overlay spinner (`isNotFound` returned but `OrderDetailSheet` never destructures it) · 🟠 list cards read cache once, never refetch → stale until overlay opened · 🟠 `item_cancelled` published (`order_service.go:642`) but no `useOrderSSE` case → cancel not live · 🟡 `StreamOrder` SSE behind `authMW` only, no `table_id` ownership check (REST paths do enforce it). Shared `OrderDetailSheet`/`useOrderSSE` pair ⇒ bugs also apply to `customer_order_detail` (C10).

## How to refresh this list
```bash
# pages that HAVE a full doc-set (one *_be.md = ready to map):
find docs/system/08_pages -name "*_be.md" | sort
# pages that already HAVE a map built:
find docs/system/08_pages -name "*.excalidraw" ! -name "* copy*" ! -name "*.bak" | sort
```
