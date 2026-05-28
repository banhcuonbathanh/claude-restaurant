---
created: 2026-05-28
updated: 2026-05-28
type: project overview + status tracker
audience: owner + developer
---

# Wireframe Project — Status & Overview

> One-stop summary. Read this first when starting any frontend work.
> Deep detail lives in individual page folders. This file is the map, not the territory.

---

## What This Project Is

The `docs/fe/wireframes/` folder is the **written + visual specification layer** for the entire frontend of the Quán Bánh Cuốn app. It sits between the domain specs (`docs/spec/`) and actual code (`fe/src/`).

Every page folder answers 7 questions before a developer opens VS Code:
1. **What does it look like?** → `[page]_wireframe_v1.md` + `.excalidraw`
2. **Who uses it and why?** → `business_description.md`
3. **How do I build it?** → `tech_description.md`
4. **How does a user operate it?** → `how_to_use.md`
5. **What's still unresolved?** → `conccern.md`
6. **What UX/UI improvements are recommended?** → `recomment/recommend.md`
7. **What does Claude need to know before coding it?** → `recomment/recomment_claude.md`

---

## Project Scope

| Type | Count |
|------|-------|
| Page folders (fully documented) | 18 |
| Flow diagrams (excalidraw only) | 8 |
| Shared indexes | 3 |
| Root guide files | 5 |

---

## 18 Page Folders — Completeness Status

> Last audited: 2026-05-28. All folders are 100% complete.
> Legend: WF = wireframe_v1.md · BD = business_description · TD = tech_description · HU = how_to_use · CC = conccern · RR = recommend · RC = recomment_claude

### Admin Pages (12)

| Folder | Route | WF | BD | TD | HU | CC | RR | RC | Excalidraw | PNG |
|--------|-------|----|----|----|----|----|----|-----|------------|-----|
| [admin_main_categories](../admin_main/admin_main_categories/) | `/admin/categories` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_main_combos](../admin_main/admin_main_combos/) | `/admin/combos` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_main_marketing](../admin_main/admin_main_marketing/) | `/admin/marketing` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_main_product](../admin_main/admin_main_product/) | `/admin/products` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_main_staff](../admin_main/admin_main_staff/) | `/admin/staff` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_main_staff_task_boad](../admin_main/admin_main_staff_task_boad/) | `/admin/staff/task-board` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [admin_main_storage](../admin_main/admin_main_storage/) | `/admin/storage` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_main_todo_list](../admin_main/admin_main_todo_list/) | `/admin/todo-list` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [admin_main_topping](../admin_main/admin_main_topping/) | `/admin/toppings` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_main_training](../admin_main/admin_main_training/) | `/admin/training` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [admin_overview](../admin_main/admin_overview/) | `/admin/overview` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [admin_summary](../admin_main/admin_summary/) | `/admin/summary` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Client Pages (6)

| Folder | Route | WF | BD | TD | HU | CC | RR | RC | Excalidraw | PNG |
|--------|-------|----|----|----|----|----|----|-----|------------|-----|
| [client_favourite_page](../client_favourite_page/) | `/(shop)/menu/favourites` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [client_info_page](../client_info_page/) | `/(shop)/profile` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [client_menu_page](../client_menu_page/) | `/(shop)/menu` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [client_monitoring_servicing_table](../client_monitoring_servicing_table/) | `/(shop)/tracking` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [client_order_page](../client_order_page/) | `/(shop)/order/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [client_product_detail](../client_product_detail/) | `/(shop)/menu/product/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3 Shared Indexes — Status

These files track cross-page patterns. **Update them whenever a new page is added.**

| Index | File | What it tracks | Last updated |
|-------|------|----------------|--------------|
| Rendering Strategy | [_INDEX_RENDERING_STRATEGY.md](../_INDEX_RENDERING_STRATEGY.md) | Pattern A/B/C per page · ISR revalidate · Skeleton status · Known gaps | 2026-05-27 |
| Shared Components | [_INDEX_SHARING_COMPONENT.md](../_INDEX_SHARING_COMPONENT.md) | UI atoms · shared components · stores · page directory | 2026-05-27 |
| State Management | [_INDEX_STATE_MANAGEMENT.md](../_INDEX_STATE_MANAGEMENT.md) | Zustand stores · TanStack Query keys · per-page state breakdown | 2026-05-27 |

---

## Root Guide Files

| File | Purpose | Read when |
|------|---------|-----------|
| [FOLDER_STANDARD.md](../FOLDER_STANDARD.md) | Step-by-step guide to building a page folder (Steps 0–8) | Creating a new page folder |
| [WIREFRAME_INDEX.md](../WIREFRAME_INDEX.md) | Master index of all 21 pages + 8 flows | Finding a specific page wireframe |
| [_MASTER.md](../_MASTER.md) | Cross-page patterns — what's shared, what's page-local | Architecture decisions |
| [HOW_TO_SPEC_v2.md](../HOW_TO_SPEC_v2.md) | How to write a wireframe spec from scratch | Creating a new spec |
| [_TEMPLATE.md](../_TEMPLATE.md) | Copy-paste template for new page wireframe | Starting a new page wireframe |

---

## Recommended Excalidraw Files

| Page | Best visual to open |
|------|---------------------|
| Client — Menu | `client_menu_page/menu_ver3_ux.excalidraw` (latest UX pass) |
| Client — Order Tracking | `client_order_page/order_ver2.excalidraw` |
| Client — Product Detail | `client_product_detail/product-detail.excalidraw` |
| Admin — Overview | `admin_main/admin_overview/admin-overview.excalidraw` |
| Full system journey | `full_system_jounery/flow-full-system-journey.excalidraw` |
| Customer ordering flow | `client_order_page/flow-customer-ordering-pages.excalidraw` |

---

## Known Gaps (cross-page)

> From `_INDEX_RENDERING_STRATEGY.md`. Fix before shipping each page.

| Gap | Affects | Priority |
|-----|---------|----------|
| `<PageSkeleton />` not built on any Pattern B page | ALL Pattern B pages (13 pages) | 🔴 Blocker per page |
| No `prefetchQuery` on category tab hover → round-trip per tap | Menu | Medium |
| iOS Safari kills EventSource on screen lock — no `visibilitychange` reconnect | Order Tracking · Restaurant Monitor | Medium |
| `<OrderPageSkeleton />` not yet built | Client — Order Tracking | 🔴 Blocker |
| `<OverviewSkeleton />` not yet built | Admin — Overview | 🔴 Blocker |
| `<MonitoringSkeleton />` not yet built | Client — Restaurant Monitor | 🔴 Blocker |
| `<AdminSummarySkeleton />` not yet built | Admin — Tổng Kết Ngày | Medium |

---

## How to Add a New Page

1. Copy `_TEMPLATE.md` → new folder named `[page_folder]/[page]_wireframe_v1.md`
2. Run `/wireframe <page-folder-name>` to scaffold remaining files
3. Run `/excalidraw <page-name>` to generate the visual
4. Add a row to `WIREFRAME_INDEX.md`
5. Add rows to all 3 shared indexes (`_INDEX_RENDERING_STRATEGY.md`, `_INDEX_SHARING_COMPONENT.md`, `_INDEX_STATE_MANAGEMENT.md`)
6. Update this file's status table

---

## Next Steps (ordered by impact)

> See next section for full breakdown.

1. **Build skeletons first** — all Pattern B pages are unshippable without them
2. **P-ARCH-1** — create `src/lib/storage-keys.ts` + fix 6 hardcoded localStorage strings
3. **P-ARCH-2** — correct menu wireframe file paths in `_TEMPLATE.md`
4. **Phase 7-7** — VNPay + MoMo payment sandbox via ngrok
5. **Dev phase round 2** — use `/dev-page` on unbuilt client pages (order, product detail)
6. **v2 excalidraw** — run `/redraw` on pages that have UX recommendations unimplemented

---

*Maintained by: dev team. Update after every wireframe session.*
*Do NOT put spec content here — this is a map, not a spec.*
