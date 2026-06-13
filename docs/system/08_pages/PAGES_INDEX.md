# FE Pages Index — Every Page, One Wireframe

> **TL;DR:** Complete inventory of every frontend page (Next.js App Router). Each page has its own
> file in this folder containing an ASCII wireframe, zone→component table, key interactions, and
> links to business logic. Status markers: ✅ implemented · 🔮 PLANNED (owner decision 2026-06-12,
> not in code yet). Grouped by role: Customer → Staff → Admin.

---

## How to Read This Folder

- **One file per page.** The ASCII wireframe in each file is the shared visual contract between
  owner and Claude — change the page, update the drawing.
- Wireframes of ✅ pages are traced from the real `page.tsx` + its components.
  Wireframes of 🔮 pages are **proposed — owner to confirm**.
- Customer pages are mobile-first (one column, bottom tab bar).
  Staff/Admin pages are desktop (tab nav header, wide tables).

---

## Customer Pages (public / guest JWT)

| Route | Status | Purpose | File |
|---|---|---|---|
| `/` | ✅ | Marketing/demo landing — feature tour, table QR shortcuts, staff quick login | [public_landing.md](public/public_landing.md) |
| `/welcome` | ✅ | Restaurant-branded welcome page — hero, story, signature dishes, hours, "Xem thực đơn" CTA | [customer_welcome.md](customer/customer_welcome.md) |
| `/introduction` | 🔮 PLANNED | Dedicated about-the-restaurant page — story, photos, map, hours, contact | [customer_introduction.md](customer/customer_introduction.md) |
| `/table/:tableId` | ✅ | QR landing — exchanges QR token for guest JWT, redirects to `/menu` | [customer_table_qr.md](customer/customer_table_qr.md) |
| `/menu` | ✅ | Browse products + combos, build cart, submit order | [customer_menu.md](customer/customer_menu.md) · [BE](customer/customer_menu_be.md) |
| `/menu/product/:id` | ✅ | Product detail — hero image, toppings, quantity, add to cart | [customer_product_detail.md](customer/customer_product_detail.md) |
| `/menu/combo/:id` | ✅ | Combo detail — included items, quantity, add to cart | [customer_combo_detail.md](customer/customer_combo_detail.md) |
| `/menu/favourites` (+ `/save`, `/sets`) | ✅ | Favourites list, save-as-set form, saved sets | [customer_favourites.md](customer/customer_favourites.md) |
| `/menu/settings` | ✅ | Local display preferences (name, table label) | [customer_settings.md](customer/customer_settings.md) |
| `/checkout` | ✅ | Non-table order form — name/phone/payment method (online path) | [customer_checkout.md](customer/customer_checkout.md) |
| `/order` | ✅ | Order history list (from localStorage cache) | [customer_order_list.md](customer/customer_order_list.md) |
| `/order/:id` | ✅ | Live order detail via SSE — item progress, cancel, add more | [customer_order_detail.md](customer/customer_order_detail.md) |
| `/tracking` | ✅ | Live table/queue monitoring view via SSE | [customer_tracking.md](customer/customer_tracking.md) |
| `/profile` | ✅ | Customer profile — avatar, personal info form, quick nav | [customer_profile.md](customer/customer_profile.md) |
| `/privacy-policy` · `/terms` | ✅ | Static legal pages | [public_legal.md](public/public_legal.md) |

> 🔮 PLANNED (cross-cutting): **online-ordering entry** — customer login + order from home
> (pickup/delivery). Touches `/welcome`, `/menu`, `/checkout`. Noted inside those page files.

## Staff Pages (role: chef / cashier / staff)

| Route | Status | Purpose | File |
|---|---|---|---|
| `/login` | ✅ | Staff login form — role-based redirect after auth | [staff_login.md](staff/staff_login.md) |
| `/register` | ✅ | Account registration form | [staff_register.md](staff/staff_register.md) |
| `/kds` | ✅ | Kitchen Display System — live cooking board (WS) | [staff_kds.md](staff/staff_kds.md) |
| `/pos` | ✅ | POS — cashier builds walk-in orders | [staff_pos.md](staff/staff_pos.md) |
| `/cashier/payment/:id` | ✅ | Bill + payment method + QR + print receipt | [staff_cashier_payment.md](staff/staff_cashier_payment.md) |
| `/orders/live` | ⚠ stub | Placeholder only — renders a TODO line; superseded by `/admin/overview` | — (no wireframe; no UI) |
| `/dev-login` | ✅ dev-only | Auto-login helper for development (spinner, no UI to design) | — (noted in [staff_login.md](staff/staff_login.md)) |

## Admin Pages (role: manager / admin — all share the admin tab-nav shell)

| Route | Status | Purpose | File |
|---|---|---|---|
| `/admin` | ✅ | Redirect → `/admin/overview` (no UI) | — |
| `/admin/overview` | ✅ | Live floor — stat cards, active orders, tables, paid/cancel logs | [admin_overview.md](admin/admin_overview.md) |
| `/admin/summary` | ✅ | Reports — revenue KPIs, top dishes, staff performance, low-stock alerts | [admin_summary.md](admin/admin_summary.md) |
| `/admin/products` | ✅ | Product CRUD | [admin_products.md](admin/admin_products.md) |
| `/admin/combos` | ✅ | Combo CRUD | [admin_combos.md](admin/admin_combos.md) |
| `/admin/categories` | ✅ | Category CRUD | [admin_categories.md](admin/admin_categories.md) |
| `/admin/toppings` | ✅ | Topping CRUD | [admin_toppings.md](admin/admin_toppings.md) |
| `/admin/staff` | ✅ | Staff account CRUD — roles, activate/deactivate | [admin_staff.md](admin/admin_staff.md) |
| `/admin/staff/task-board` | ✅ | Per-staff task board — KPIs + expandable task table | [admin_task_board.md](admin/admin_task_board.md) |
| `/admin/todo-list` | ✅ | Team to-do tasks — filter, cards/table, create/edit modal | [admin_todo_list.md](admin/admin_todo_list.md) |
| `/admin/ingredients` | ✅ | Ingredient list + stock in/out movements | [admin_ingredients.md](admin/admin_ingredients.md) |
| `/admin/storage` | 🔮 PLANNED | Full inventory management — low-stock warnings, link availability to menu | [admin_storage.md](admin/admin_storage.md) |
| `/admin/marketing` | ✅ | Marketing spend dashboard — budget KPIs, breakdown, campaign timeline | [admin_marketing.md](admin/admin_marketing.md) |
| `/admin/training` | ✅ | Staff training — job guides + completion tracking | [admin_training.md](admin/admin_training.md) |

---

## Shared Shells (drawn once, referenced by every page file)

**Customer shell** — `(shop)/layout.tsx` wraps every customer page with `ClientBottomNav`:

```
┌────────────────────────────────────────┐
│              (page content)            │
├────────────────────────────────────────┤
│ [Menu] [Đơn Hàng] [Yêu Thích]          │  ← ClientBottomNav (fixed)
│        [Theo Dõi] [Cài Đặt]            │     /menu /order /menu/favourites
└────────────────────────────────────────┘     /tracking /menu/settings
```

**Admin shell** — `(dashboard)/admin/layout.tsx` wraps every `/admin/*` page
(AuthGuard + RoleGuard minRole=MANAGER + ThemeToggle):

```
┌──────────────────────────────────────────────────────────────┐
│ Quản trị hệ thống                              [ThemeToggle] │
│ Tổng quan·Tổng kết·Sản phẩm·Combo·Danh mục·Topping·Nhân viên │  ← tab nav
│ ·Công việc·Kho nguyên liệu·Marketing·Đào tạo                 │
├──────────────────────────────────────────────────────────────┤
│                       (page content)                         │
└──────────────────────────────────────────────────────────────┘
```

**Dashboard shell** — `(dashboard)/layout.tsx` wraps `/kds`, `/pos`, `/cashier/*`, `/admin/*`
with `OrdersWSProvider` (one shared WebSocket per browser session — no visual chrome).

---

## Deep Dive

- Component catalog + tokens → [../04_fe/DESIGN_SYSTEM.md](../04_fe/DESIGN_SYSTEM.md)
- End-to-end journeys → [../01_flow/CLIENT_FLOW.md](../01_flow/CLIENT_FLOW.md) · [../01_flow/STAFF_FLOW.md](../01_flow/STAFF_FLOW.md)
- Build a new page → [../05_dev_guide/NEW_PAGE_GUIDE.md](../05_dev_guide/NEW_PAGE_GUIDE.md)
