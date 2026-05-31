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
| C6 | Info | `/dev-page client_info_page` | ⚠️ | 2026-05-30 | Visual 6/6 · Func 6/6. FE complete. BE CI-8+CI-9 deferred — no customer account system. ClientMainBottomNav (5-tab) built. CustomerTopNav.cartCount optional + cart hidden when undefined. |

---

## Admin Pages

| # | Page | Command | Status | Last Run | Concerns / Notes |
|---|------|---------|--------|----------|-----------------|
| A1 | Products | `/dev-page admin_main/admin_main_product` | ✅ | 2026-05-30 | Visual 4/4 · Func 8/8. Extracted 3 components (_components/). Fixed: topping overflow cap (max 2 + "+N more"), price > 0 validation, EmptyState, Badge status, 409 field-level error. BE /availability route confirmed registered. |
| A2 | Categories | `/dev-page admin_main/admin_main_categories` | ✅ | 2026-05-30 | All 14 ACs covered. Fixed: 409 delete (product-attached toast), 409 save (RHF field error), isError retry panel, staleTime 60s, client-side sort. Page was pre-built; no new files needed. Phase 4 skipped (browser locked). |
| A3 | Toppings | `/dev-page admin_main/admin_main_topping` | ✅ | 2026-05-31 | 19/19 ACs. Extracted 3 _components. BE: is_available added to PATCH /toppings/:id (repo+service+handler). FE: isAvailable toggle, staleTime 60s, EmptyState, Badge, linked-product delete warning, 409 field error. |
| A4 | Combos | `/dev-page admin_main/admin_main_combos` | ✅ | 2026-05-31 | 17/17 ACs. BE PATCH /combos/:id live. Visual 4/4 · Func 9/9. ⚠️ Esc key doesn't close modal (accessibility note only, not in spec ACs). ⚠️ UTF-8 encoding in seed product names (pre-existing). |
| A5 | Staff | `/dev-page admin_main/admin_main_staff` | ✅ | 2026-05-31 | Visual 5/5 · Func 11/11. BE: migration 013 (job_title/shifts/responsibilities) + models + repo + service + handler. FE: 6 local components + page.tsx rewrite. Fixed shifts NULL scan (sqlc override + COALESCE). ⚠️ Pagination btn text clipped at narrow width. |
| A6 | Marketing | `/dev-page admin_main/admin_main_marketing` | ✅ | 2026-05-30 | Visual 6/6 · Func 11/11. Built 9 FE components + BE stub endpoint (static data). Fixed TZ bug in getCurrentMonthRange. Replaced old QR-management page with budget dashboard. |
| A7 | Storage | `/dev-page admin_main/admin_main_storage` | ✅ | 2026-05-31 | Visual 4/4 · Func 10/10. 22/22 ACs. BE: migration 010 + repo/service/handler (importDate/shelfDays/status computed). Fixed: Shifts NULL crash (models.go []byte) + 012 migration conflict (→014). |
| A8 | Todo List | `/dev-page admin_main/admin_main_todo_list` | ✅ | 2026-05-31 | Visual 5/5 · Func 11/11. Full-stack build: 011_staff_tasks.sql + repo/service/handler + 10 FE files. Fixed: mobile Tailwind breakpoints (was JS window.innerWidth); filter bar sync on stats row click. |
| A9 | Staff Task Board | `/dev-page admin_main/admin_main_staff_task_boad` | ⚠️ | 2026-05-30 | 18/18 ACs covered. BE: migration 012 + sqlc + repo + service + handler (3 endpoints). FE: 7 components + page.tsx. Phase 4 (browser) pending. |
| A10 | Training | `/dev-page admin_main/admin_main_training` | ✅ | 2026-05-31 | Visual 4/4 · Func 11/11. BE: 014_training.sql (4 tables) + sqlc + repo + service + handler (7 endpoints). FE: types + store + hooks + 6 components + page.tsx. Fixed nav overflow (added overflow-x-auto to layout.tsx). RBAC DELETE=7 handlers confirmed. |
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
| 2026-05-30 | admin_main/admin_main_marketing | ✅ | Built 9 new components (MarketingPageHeader, DateRangePicker, KPICard, ProgressBar, BudgetSummaryCards, SpendBreakdownTable, BudgetDonutChart, LoveScoreSection, CampaignTimeline) + BE stub GET /admin/marketing/spend + hook. Replaced QR-management page. Fixed TZ bug in date init. Visual 6/6 · Func 11/11. |
| 2026-05-30 | client_info_page | ⚠️ | Built 8 new files: ClientMainBottomNav, useCustomerProfile hook, ProfileAvatarHeader, PersonalInfoForm, QuickNavGrid, SaveCTABar, ProfilePageSkeleton, profile/page.tsx. CustomerTopNav.cartCount optional; cart icon hidden when undefined. Visual 6/6 · Func 6/6. BE CI-8+CI-9 deferred (auth model blocker). |
| 2026-05-30 | admin_main/admin_main_categories | ✅ | Audit-only (page existed). Fixed 5 spec gaps: 409 delete → specific toast; 409 save → RHF setError on name; isError → retry panel; staleTime 60s; client-side sort_order. Phase 4 skipped (browser locked by prior session). |
| 2026-05-30 | admin_main/admin_main_combos | ✅ | 7 gaps filled. BE: PATCH /combos/:id (UpdateCombo service+handler+route+admin.api.ts updateCombo). FE: edit mode with pre-fill, Sửa button, admin-only Xóa, min-2 items guard, savings note, disabled submit, EmptyState shared. Phase 4 skipped (Playwright locked). |
| 2026-05-30 | admin_main/admin_main_staff_task_boad | ⚠️ | Full-stack build. BE: migration 012 (priority/notes/in_progress/time-window) + sqlc + 3 endpoints. FE: 2 shared badges + 5 local components + page.tsx. Admin layout startsWith fix. 18/18 ACs. Phase 4 pending. |
| 2026-05-30 | admin_main/admin_main_storage | ⚠️ | Full-stack build. BE: migration 010 (import_date/shelf_days) + repo/service/handler (quantity/warningThreshold/expiryDate/status). FE: 3 extracted components + page.tsx with search. Fixed: 012 migration conflict (012_training→014), Shifts NULL crash (models.go []byte). Visual 4/4 · Func 8/10 (browser locked for F-10). |
| 2026-05-31 | admin_main/admin_main_storage | ✅ | Phase 4 browser audit complete. Visual 4/4 · Func 10/10. Verified: table renders both rows correctly (orange bg expiring_soon, red qty/expiry), search filter, edit pre-fill (all 6 fields), empty-search state, no overflow. |
| 2026-05-31 | admin_main/admin_main_staff | ✅ | Full-stack build. BE: migration 013 (job_title/shifts JSON/responsibilities) + models ([]byte) + repo (COALESCE) + service + handler (shifts marshal/unmarshal). sqlc.yaml override staff.shifts→[]byte. FE: 6 local components (PageHeader, StatsBar, FilterBar, StaffTable, AddEditModal, DetailDrawer) + page.tsx rewrite. Visual 5/5 · Func 11/11. |
| 2026-05-31 | admin_main/admin_main_training | ✅ | Full-stack build from scratch. BE: 014_training.sql (4 tables) + sqlc + repo + service + handler (7 endpoints). Fixed: GetStaffByUsername shifts NULL scan, duplicate 012_training.sql, TodoPageClient stub. FE: types + training.api.ts + useTrainingQueries + trainingStore + RoleBadge + JobGuideCard + JobGuideCardGrid + RoleFilterTabs + CompletionTrackingTable + CreateEditGuideModal + TrainingProgressModal + page.tsx. Visual 4/4 · Func 11/11 PASS. Fixed nav overflow (overflow-x-auto on layout nav). |
| 2026-05-31 | admin_main/admin_main_todo_list | ✅ | Full-stack build + Phase 4 audit. BE: 011_staff_tasks.sql + repo/service/handler (3 endpoints). FE: task.ts + useTodoTasks/useTaskStats + TaskStatusBadge + Pagination + 8 page components + layout tab. Phase 4: Visual 5/5 · Func 11/11. Fixed during audit: mobile breakpoint (Tailwind vs JS), filter bar assigned_to sync. |
| 2026-05-31 | admin_main/admin_main_topping | ✅ | Extracted 3 _components (ToppingPageHeader, ToppingTable, ToppingFormModal). BE: UpdateToppingAvailability (repo+service+handler, direct SQL). FE: isAvailable toggle, staleTime 60s, EmptyState, Badge, linked-product delete warning, 409 field error. 19/19 ACs covered. |

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
