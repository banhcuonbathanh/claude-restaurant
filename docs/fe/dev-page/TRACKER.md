# /dev-page Progress Tracker

> One source of truth for all `/dev-page` runs.
> Update status + concerns after each run. Never leave a row blank after a session.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done — ACs verified |
| ❌ | Blocked / failed |
| ⚠️ | Done but has open concerns |

---

## Client Pages

| # | Page | Command | Status | Last Run | Concerns / Notes |
|---|------|---------|--------|----------|-----------------|
| C1 | Menu | `/dev-page client_menu_page` | ⬜ | — | — |
| C2 | Product Detail | `/dev-page client_product_detail` | ⬜ | — | — |
| C3 | Order | `/dev-page client_order_page` | ⬜ | — | — |
| C4 | Monitoring / Servicing Table | `/dev-page client_monitoring_servicing_table` | ⬜ | — | — |
| C5 | Favourites | `/dev-page client_favourite_page` | ⬜ | — | — |
| C6 | Info | `/dev-page client_info_page` | ⬜ | — | — |

---

## Admin Pages

| # | Page | Command | Status | Last Run | Concerns / Notes |
|---|------|---------|--------|----------|-----------------|
| A1 | Products | `/dev-page admin_main/admin_main_product` | ⬜ | — | — |
| A2 | Categories | `/dev-page admin_main/admin_main_categories` | ⬜ | — | — |
| A3 | Toppings | `/dev-page admin_main/admin_main_topping` | ⬜ | — | — |
| A4 | Combos | `/dev-page admin_main/admin_main_combos` | ⬜ | — | — |
| A5 | Staff | `/dev-page admin_main/admin_main_staff` | ⬜ | — | — |
| A6 | Marketing | `/dev-page admin_main/admin_main_marketing` | ⬜ | — | — |
| A7 | Storage | `/dev-page admin_main/admin_main_storage` | ⬜ | — | — |
| A8 | Todo List | `/dev-page admin_main/admin_main_todo_list` | ⬜ | — | — |
| A9 | Staff Task Board | `/dev-page admin_main/admin_main_staff_task_boad` | ⬜ | — | — |
| A10 | Training | `/dev-page admin_main/admin_main_training` | ⬜ | — | — |
| A11 | Overview | `/dev-page admin_main/admin_overview` | ⬜ | — | — |
| A12 | Summary | `/dev-page admin_main/admin_summary` | ⬜ | — | — |

---

## Cross-Page Concerns

> Things that affect multiple pages — shared components, state, performance.

| # | Concern | Affects Pages | Status | Notes |
|---|---------|--------------|--------|-------|
| X1 | Shared components audit — identify reusable UI across all pages | All | ⬜ | Run after first 3 pages done |
| X2 | Zustand store boundaries — which state is global vs page-local | C1, C3, C4, A1–A12 | ⬜ | — |
| X3 | TanStack Query cache keys — avoid stale data between pages | All | ⬜ | — |
| X4 | Performance — lazy loading, code splitting per route | All | ⬜ | — |
| X5 | SSE/realtime wiring — KDS, POS, monitoring pages must share one WS connection | C4, A11 | ⬜ | — |
| X6 | Mobile responsiveness — client pages must work on phone | C1–C6 | ⬜ | — |

---

## Session Log

> One row per `/dev-page` session. Append, never edit old rows.

| Date | Page | Outcome | Key decisions / blockers |
|------|------|---------|--------------------------|
| — | — | — | — |

---

## Quick-Run Order (Recommended)

Run in this order to catch shared component gaps early:

```
1. /dev-page client_menu_page                       ← highest traffic, sets shared patterns
2. /dev-page client_product_detail                  ← reuses menu components
3. /dev-page client_order_page                      ← reuses cart/checkout state
4. /dev-page client_monitoring_servicing_table      ← SSE/realtime
5. /dev-page client_favourite_page
6. /dev-page client_info_page
7. /dev-page admin_main/admin_main_product          ← sets admin CRUD pattern
8. /dev-page admin_main/admin_main_categories
9. /dev-page admin_main/admin_main_topping
10. /dev-page admin_main/admin_main_combos
11. /dev-page admin_main/admin_main_staff
12. /dev-page admin_main/admin_main_marketing
13. /dev-page admin_main/admin_main_storage
14. /dev-page admin_main/admin_main_todo_list
15. /dev-page admin_main/admin_main_staff_task_boad
16. /dev-page admin_main/admin_main_training
17. /dev-page admin_main/admin_overview
18. /dev-page admin_main/admin_summary
```
