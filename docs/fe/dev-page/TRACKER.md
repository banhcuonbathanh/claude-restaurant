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
| C2 | Product Detail | `/dev-page client_product_detail` | ✅ | 2026-05-30 | Visual 6/6 · Func 8/8. Built CustomerTopNav+QuantityStepper shared; 5 product-detail components; fixed TS error in favourites/page.tsx unblocking Docker build. |
| C3 | Order | `/dev-page client_order_page` | ⚠️ | 2026-05-30 | 24/25 ACs. Fixed: 404 error state, Zone 5 status condition. Deferred: qty stepper (no BE endpoint). Visual 10/10 · Func 7/7 tested. |
| C4 | Monitoring / Servicing Table | `/dev-page client_monitoring_servicing_table` | ⚠️ | 2026-05-30 | Route /tracking (no param). orderId from useCartStore.activeOrderId. Visual 4/6 (D+E hidden until first SSE push — correct). Func 6/7 (F-01 401 env-only in test). itemCount=0 in queue broadcast. |
| C5 | Favourites | `/dev-page client_favourite_page` | ⚠️ | 2026-05-29 | Visual 10/11 · Func 12/12. Open: product-404 toast missing; S2 ZC combo name blank (API encoding, pre-existing). |
| C6 | Info | `/dev-page client_info_page` | ⚠️ | 2026-05-30 | All 17 FE ACs covered. BE CI-8+CI-9 (GET/PUT /customer/profile) deferred — blocked by auth model (no customer account system). ClientMainBottomNav built (5-tab). CartCount made optional in CustomerTopNav. |

---

## Admin Pages

| # | Page | Command | Status | Last Run | Concerns / Notes |
|---|------|---------|--------|----------|-----------------|
| A1 | Products | `/dev-page admin_main/admin_main_product` | ✅ | 2026-05-30 | Visual 4/4 · Func 8/8. Extracted 3 components (_components/). Fixed: topping overflow cap (max 2 + "+N more"), price > 0 validation, EmptyState, Badge status, 409 field-level error. BE /availability route confirmed registered. |
| A2 | Categories | `/dev-page admin_main/admin_main_categories` | ⬜ | — | — |
| A3 | Toppings | `/dev-page admin_main/admin_main_topping` | ⬜ | — | — |
| A4 | Combos | `/dev-page admin_main/admin_main_combos` | ⬜ | — | — |
| A5 | Staff | `/dev-page admin_main/admin_main_staff` | ⬜ | — | — |
| A6 | Marketing | `/dev-page admin_main/admin_main_marketing` | ⬜ | — | — |
| A7 | Storage | `/dev-page admin_main/admin_main_storage` | ⬜ | — | — |
| A8 | Todo List | `/dev-page admin_main/admin_main_todo_list` | ⬜ | — | — |
| A9 | Staff Task Board | `/dev-page admin_main/admin_main_staff_task_boad` | ⬜ | — | — |
| A10 | Training | `/dev-page admin_main/admin_main_training` | ⬜ | — | — |
| A11 | Overview | `/dev-page admin_main/admin_overview` | ✅ | 2026-05-30 | Visual 7/7 · Func 10/10. Fixed 5 bugs: urgent card red bg; WaitingSection expanded to all statuses; per-status actions; PrepPanel always visible; WS ConnectionErrorBanner. PrepPanel renamed to "Tổng hợp chế biến", starts collapsed. |
| A12 | Summary | `/dev-page admin_main/admin_summary` | ⬜ | — | — |

---

## Cross-Page Concerns

> Things that affect multiple pages — shared components, state, performance.

| # | Concern | Affects Pages | Status | Notes |
|---|---------|--------------|--------|-------|
| X1 | Shared components audit — identify reusable UI across all pages | All | 🔄 | CustomerTopNav + QuantityStepper (2026-05-30); ClientMainBottomNav 5-tab added (2026-05-30). CartCount on CustomerTopNav now optional. |
| X2 | Zustand store boundaries — which state is global vs page-local | C1, C3, C4, A1–A12 | ⬜ | — |
| X3 | TanStack Query cache keys — avoid stale data between pages | All | ⬜ | — |
| X4 | Performance — lazy loading, code splitting per route | All | ⬜ | — |
| X5 | SSE/realtime wiring — KDS, POS, monitoring pages must share one WS connection | C4, A11 | 🔄 | C4 monitoring: useOrderMonitorSSE + /sse/order-monitor/:id built. queue:broadcast + tables:broadcast channels added. |
| X6 | Mobile responsiveness — client pages must work on phone | C1–C6 | 🔄 | C2 (product detail) + C3 (order) verified 390px, no overflow. C1, C4–C6 pending. |

---

## Session Log

> One row per `/dev-page` session. Append, never edit old rows.

| Date | Page | Outcome | Key decisions / blockers |
|------|------|---------|--------------------------|
| 2026-05-29 | client_order_page | ⚠️ | Added BE DELETE /orders/items/:id; added Nav+skeleton+Zone2 toppings; qty stepper deferred (needs BE); visual audit skipped (Playwright lock) |
| 2026-05-30 | client_order_page | ⚠️ | Fixed: 404 error state in useOrderSSE + page.tsx; Zone 5 tightened to confirmed\|preparing only. Updated FE/BE_STRUCTURE.md stale entries. Visual 10/10 · Func 7/7. Qty stepper blocked (no customer PATCH endpoint). |
| 2026-05-29 | client_favourite_page | ⚠️ | Built all 3 screens from scratch; store rebuilt to FavouriteItem[]+FavouriteSet[] (Option A); updated ProductCard/ComboCard/FavouritesRail; QuantityStepper updated with size prop; 11/12 ACs — product-404 toast open |
| 2026-05-29 | client_favourite_page | Phase 4 | Visual 10/11 · Func 12/12. ⚠️ S2 ZC combo name blank (pre-existing API encoding). All 3 screens navigable, all interactive elements verified. |
| 2026-05-30 | client_product_detail | ✅ | Built 9 files (2 shared + 5 product-detail + 1 hook + refactored page.tsx). Fixed pre-existing TS error in favourites/page.tsx. Visual 6/6 · Func 8/8. All ACs covered. |
| 2026-05-30 | client_monitoring_servicing_table | ⚠️ | Built 10 files: 5 local components + 2 shared (TableLayoutMap, ClientBottomNav) + hook + page.tsx + BE (monitor_handler.go + publishMonitorBroadcast + route). Route /tracking/[id] (spec omits param). itemCount=0 in queue broadcast. Visual 4/6 · Func 6/7. F-01 401 env-only (guest token from QR flow). |
| 2026-05-30 | admin_main/admin_overview | ✅ | Audit-only (page existed). Fixed 5 bugs: B1 urgent card red bg; B2 WaitingSection covers all active statuses; B3 duplicate button; B4 PrepPanel always visible; B5 WS disconnect banner. Also fixed pre-existing ESLint error in ServiceQueueItem.tsx. Visual 7/7 · Func 10/10. |
| 2026-05-30 | admin_main/admin_main_product | ✅ | Extracted page into 3 local components (ProductPageHeader, ProductsTable, ProductFormModal). Fixed: topping overflow cap, price > 0 validation, EmptyState, Badge for status, 409 duplicate-name field error, 409 active-order delete error. Visual 4/4 · Func 8/8. |
| 2026-05-30 | client_info_page | ⚠️ | Built 8 new files: ClientMainBottomNav, useCustomerProfile hook, ProfileAvatarHeader, PersonalInfoForm, QuickNavGrid, SaveCTABar, ProfilePageSkeleton, profile/page.tsx. Made CustomerTopNav.cartCount optional. All 17 FE ACs covered. BE deferred (auth model blocker). |

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
