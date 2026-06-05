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
| C1 | Menu | `/status-routing-reference client_menu_page` | N/A | — | No entity status routing (catalog only) |
| C2 | Product Detail | `/status-routing-reference client_product_detail` | N/A | — | No entity status routing |
| C3 | Order | `/status-routing-reference client_order_page` | ⬜ | — | order status drives DishRow / Zone visibility |
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
| X2 | Vietnamese status labels must match across all references (no label drift) | C3, C4, A11, A13, A14 | 🔄 | Captured in A11. Re-confirm verbatim when each new reference is written. |
| X3 | Status transition rules (which button → which next status) consistent BE vs FE | A11, A13, A14 | 🔄 | A11 done. Cross-check against `order-flow` skill rules when A13/A14 run. |

---

## Session Log

> One row per `/status-routing-reference` session. Append, never edit old rows.

| Date | Page | Outcome | Key decisions / notes |
|------|------|---------|------------------------|
| 2026-06-05 | admin_main/admin_overview | ✅ | Seeded as the model reference (pre-existing file renamed from table_status.md → Admin_Overview_Status_Routing_Reference.md). All zones, statuses, buttons, and per-zone rules captured. |

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
