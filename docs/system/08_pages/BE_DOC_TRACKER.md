# /page-be-doc Progress Tracker

> One source of truth for all `/page-be-doc` runs.
> A Backend View (`<page>_be.md`) = the code-accurate map of every BE endpoint a page calls,
> traced handler → service → repository → SQL, with auth, caching, errors, and flags.
> Update status + concerns after each run. Never leave a row blank after a session.
> Model file: `docs/system/08_pages/menu/customer_menu_be.md`
> Skill: `.claude/skills/page-be-doc/SKILL.md`

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
| C1 | Menu | `/menu` | `/page-be-doc customer_menu` | ✅ | 2026-06-13 | Model file. 6 endpoints (3 GET catalog public + POST /orders + POST /orders/:id/items + GET /orders/:id). Refresh: re-traced all cells to code — handbook (REDIS_CACHE/CACHE_FLOW/API_SPEC) all match; fixed 3 service line-number offsets in _be.md (ListProducts 164, ListCategories 344, ListCombos 497). No unverified cells. |
| C2 | Welcome | `/welcome` | `/page-be-doc customer_welcome` | ⬜ | — | Signature dishes likely GET /products — confirm on run |
| C3 | Table QR landing | `/table/:tableId` | `/page-be-doc customer_table_qr` | ⬜ | — | QR token → guest JWT exchange |
| C4 | Product Detail | `/menu/product/:id` | `/page-be-doc customer_product_detail` | ⬜ | — | GET product detail + toppings; add-to-cart is local |
| C5 | Combo Detail | `/menu/combo/:id` | `/page-be-doc customer_combo_detail` | ⬜ | — | GET combo detail + included items |
| C6 | Favourites | `/menu/favourites` | `/page-be-doc customer_favourites` | ⬜ | — | Mostly localStorage — confirm whether saved-sets hit BE |
| C7 | Settings | `/menu/settings` | `/page-be-doc customer_settings` | N/A | — | Local display prefs only — no BE calls (verify on run) |
| C8 | Checkout | `/checkout` | `/page-be-doc customer_checkout` | ⬜ | — | POST /orders (online path), name/phone/payment method |
| C9 | Order List | `/order` | `/page-be-doc customer_order_list` | ⬜ | — | Reads from localStorage cache — confirm any GET |
| C10 | Order Detail | `/order/:id` | `/page-be-doc customer_order_detail` | ⬜ | — | GET /orders/:id + SSE + cancel + add-more (realtime) |
| C11 | Tracking | `/tracking` | `/page-be-doc customer_tracking` | ⬜ | — | GET + SSE table/queue (realtime, no writes) |
| C12 | Profile | `/profile` | `/page-be-doc customer_profile` | ⬜ | — | Confirm profile GET/PATCH vs local-only |
| C13 | Landing | `/` | `/page-be-doc public_landing` | ⬜ | — | Marketing/demo — staff quick login + table QR shortcuts |
| C14 | Introduction | `/introduction` | `/page-be-doc customer_introduction` | ❌ | — | 🔮 PLANNED — not coded; BE doc would be speculative |
| C15 | Legal | `/privacy-policy` · `/terms` | `/page-be-doc public_legal` | N/A | — | Static legal pages — no BE calls |

---

## Staff Pages

| # | Page | Route | Command | Status | Last Run | Concerns / Notes |
|---|------|-------|---------|--------|----------|-----------------|
| S1 | Login | `/login` | `/page-be-doc staff_login` | ⬜ | — | POST /auth/login + role redirect |
| S2 | Register | `/register` | `/page-be-doc staff_register` | ⬜ | — | POST /auth/register |
| S3 | KDS (Kitchen) | `/kds` | `/page-be-doc staff_kds` | ⬜ | — | Live cooking board — **WebSocket** + PATCH order/item status |
| S4 | POS | `/pos` | `/page-be-doc staff_pos` | ⬜ | — | Walk-in order build — POST /orders (note: bypasses order-payload.ts) |
| S5 | Cashier Payment | `/cashier/payment/:id` | `/page-be-doc staff_cashier_payment` | ⬜ | — | Bill + payment method + VNPay/MoMo + receipt |

---

## Admin Pages

| # | Page | Route | Command | Status | Last Run | Concerns / Notes |
|---|------|-------|---------|--------|----------|-----------------|
| A1 | Overview | `/admin/overview` | `/page-be-doc admin_overview` | ⬜ | — | Live floor — active orders + tables + paid/cancel logs (realtime) |
| A2 | Summary | `/admin/summary` | `/page-be-doc admin_summary` | ⬜ | — | Reports — revenue KPIs, top dishes, staff perf, low-stock (analytics endpoints) |
| A3 | Products | `/admin/products` | `/page-be-doc admin_products` | ⬜ | — | Product CRUD (manager+ writes, admin deletes, cache invalidation) |
| A4 | Combos | `/admin/combos` | `/page-be-doc admin_combos` | ⬜ | — | Combo CRUD + combo_items |
| A5 | Categories | `/admin/categories` | `/page-be-doc admin_categories` | ⬜ | — | Category CRUD |
| A6 | Toppings | `/admin/toppings` | `/page-be-doc admin_toppings` | ⬜ | — | Topping CRUD |
| A7 | Staff | `/admin/staff` | `/page-be-doc admin_staff` | ⬜ | — | Staff account CRUD + activate/deactivate |
| A8 | Staff Task Board | `/admin/staff/task-board` | `/page-be-doc admin_task_board` | ⬜ | — | Per-staff KPIs + task list (staff_tasks) |
| A9 | Todo List | `/admin/todo-list` | `/page-be-doc admin_todo_list` | ⬜ | — | Team tasks — create/edit modal (staff_tasks) |
| A10 | Ingredients | `/admin/ingredients` | `/page-be-doc admin_ingredients` | ⬜ | — | Ingredient list + stock in/out movements |
| A11 | Marketing | `/admin/marketing` | `/page-be-doc admin_marketing` | ⬜ | — | Marketing spend dashboard |
| A12 | Training | `/admin/training` | `/page-be-doc admin_training` | ⬜ | — | Job guides + completion tracking |
| A13 | Storage | `/admin/storage` | `/page-be-doc admin_storage` | ❌ | — | 🔮 PLANNED — not coded; BE doc would be speculative |

---

## Copy-Paste — All Commands

> Run in dependency order or pick any. Skip ❌ (not coded) and N/A (no BE calls).

```
/page-be-doc customer_welcome
/page-be-doc customer_table_qr
/page-be-doc customer_product_detail
/page-be-doc customer_combo_detail
/page-be-doc customer_favourites
/page-be-doc customer_checkout
/page-be-doc customer_order_list
/page-be-doc customer_order_detail
/page-be-doc customer_tracking
/page-be-doc customer_profile
/page-be-doc public_landing
/page-be-doc staff_login
/page-be-doc staff_register
/page-be-doc staff_kds
/page-be-doc staff_pos
/page-be-doc staff_cashier_payment
/page-be-doc admin_overview
/page-be-doc admin_summary
/page-be-doc admin_products
/page-be-doc admin_combos
/page-be-doc admin_categories
/page-be-doc admin_toppings
/page-be-doc admin_staff
/page-be-doc admin_task_board
/page-be-doc admin_todo_list
/page-be-doc admin_ingredients
/page-be-doc admin_marketing
/page-be-doc admin_training
```

---

## Cross-Page Concerns

> BE facts that affect multiple pages — shared endpoints, cache keys, auth gates, drift found.
> Add a bullet when a run uncovers something that touches more than one page's BE doc.

- _(none yet)_
