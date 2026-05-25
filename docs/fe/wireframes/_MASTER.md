# Wireframe Master — FE Control Document

> **Single control file for all FE page specs, shared components, and global state.**
> Start here every time you design, build, or audit a FE page.
> Update this file immediately when any page is added, spec'd, or built.

---

## How to use

| I want to… | Go to |
|------------|-------|
| Design a new page | Step 1: add a row to Page Registry below → Step 2: follow [HOW_TO_SPEC_v2.md](HOW_TO_SPEC_v2.md) |
| Find a reusable component | [shared/_INDEX_SHARING_COMPONENT.md](shared/_INDEX_SHARING_COMPONENT.md) |
| Understand which stores a page needs | Global State Map (§3 below) |
| See all flow diagrams | Flow Diagram Index (§4 below) |
| Copy the spec file template | [HOW_TO_SPEC_v2.md](HOW_TO_SPEC_v2.md) (6-step format) |
| Find business rules / RBAC | `docs/core/MASTER_v1.2.md` |
| Find API contract | `docs/contract/API_CONTRACT_v1.2.md` |

---

## §1 — Page Registry

> `spec` = has a `*_spec.md` file following HOW_TO_SPEC_v2 format.
> `wireframe` = has an `.excalidraw` or visual file.
> Status: ✅ built · 🔄 in progress · ⬜ not started · — not applicable.

### Customer Flow (`(shop)/`)

| Page | Route | Folder | Spec | Wireframe | Build | Stores used |
|------|-------|--------|------|-----------|-------|-------------|
| QR Entry | `/table/[tableId]` | — | — | — | ✅ | `settingsStore` |
| **Menu** | `/(shop)/menu` | [client_menu_page/](client_menu_page/) | [menu_spec.md](client_menu_page/menu_spec.md) ✅ | [menu_ver1_done.excalidraw](client_menu_page/menu_ver1_done.excalidraw) | ✅ | `cartStore` · `favouritesStore` · `settingsStore` |
| Product Detail | `/(shop)/menu/product/[id]` | [client_product_detail/](client_product_detail/) | ⬜ needs spec | [product-detail.excalidraw](client_product_detail/product-detail.excalidraw) | ✅ | `cartStore` · `favouritesStore` |
| Combo Detail | `/(shop)/menu/combo/[id]` | — | ⬜ needs spec | — | ✅ | `cartStore` |
| Settings | `/(shop)/menu/settings` | — | ⬜ needs spec | — | ✅ | `settingsStore` |
| Checkout | `/(shop)/checkout` | — | ⬜ needs spec | — | ✅ | `cartStore` · `settingsStore` |
| Order Tracking | `/(shop)/order/[id]` | [client_order_page/](client_order_page/) | ⬜ needs spec | [order_ver2.excalidraw](client_order_page/order_ver2.excalidraw) | ✅ | `cartStore` |
| Order List | `/(shop)/order` | [client_order_page/](client_order_page/) | ⬜ needs spec | — | ✅ | — |
| Favourites | — | [client_favourite_page/](client_favourite_page/) | ⬜ needs spec | [favourites.excalidraw](client_favourite_page/favourites.excalidraw) | ⬜ | `favouritesStore` |
| Info / Profile | — | [client_info_page/](client_info_page/) | ⬜ needs spec | [client_info.excalidraw](client_info_page/client_info.excalidraw) | ⬜ | `settingsStore` |
| Monitoring | — | [client_monitoring_servicing_table/](client_monitoring_servicing_table/) | ⬜ needs spec | [restaurant-monitor.excalidraw](client_monitoring_servicing_table/restaurant-monitor.excalidraw) | ⬜ | — |

### Auth

| Page | Route | Folder | Spec | Wireframe | Build | Stores used |
|------|-------|--------|------|-----------|-------|-------------|
| Login | `/(auth)/login` | — | ⬜ needs spec | — | ✅ | `authStore` |
| Welcome | `/welcome` | — | — | — | ✅ | — |

### Admin / Dashboard (`(dashboard)/`)

| Page | Route | Folder | Spec | Wireframe | Build | Stores used |
|------|-------|--------|------|-----------|-------|-------------|
| Admin Root | `/(dashboard)/admin` | — | — | — | ✅ | `authStore` |
| Overview | `/(dashboard)/admin/overview` | [admin_main/admin_overview/](admin_main/admin_overview/) | ⬜ needs spec | [admin-overview.excalidraw](admin_main/admin_overview/admin-overview.excalidraw) | ✅ | — |
| Categories | `/(dashboard)/admin/categories` | [admin_main/admin_main_categories/](admin_main/admin_main_categories/) | [admin_main_categories_wireframe_v1.md](admin_main/admin_main_categories/admin_main_categories_wireframe_v1.md) | [categories.excalidraw](admin_main/admin_main_categories/categories.excalidraw) | ✅ | — |
| Products | `/(dashboard)/admin/products` | [admin_main/admin_main_product/](admin_main/admin_main_product/) | ⬜ needs spec | [admin-products.excalidraw](admin_main/admin_main_product/admin-products.excalidraw) | ✅ | — |
| Combos | `/(dashboard)/admin/combos` | [admin_main/admin_main_combos/](admin_main/admin_main_combos/) | ⬜ needs spec | [admin-main-combos.excalidraw](admin_main/admin_main_combos/admin-main-combos.excalidraw) | ✅ | — |
| Toppings | `/(dashboard)/admin/toppings` | [admin_main/admin_main_topping/](admin_main/admin_main_topping/) | ⬜ needs spec | [admin-topping.excalidraw](admin_main/admin_main_topping/admin-topping.excalidraw) | ✅ | — |
| Staff | `/(dashboard)/admin/staff` | [admin_main/admin_main_staff/](admin_main/admin_main_staff/) | [admin-main-staff.md](admin_main/admin_main_staff/admin-main-staff.md) | [admin-main-staff.excalidraw](admin_main/admin_main_staff/admin-main-staff.excalidraw) | ✅ | — |
| Marketing | `/(dashboard)/admin/marketing` | [admin_main/admin_main_marketing/](admin_main/admin_main_marketing/) | ⬜ needs spec | [admin-main-marketing.excalidraw](admin_main/admin_main_marketing/admin-main-marketing.excalidraw) | ✅ | — |
| Summary | `/(dashboard)/admin/summary` | [admin_main/admin_summary/](admin_main/admin_summary/) | ⬜ needs spec | [admin-summary.excalidraw](admin_main/admin_summary/admin-summary.excalidraw) | ✅ | — |
| Ingredients | `/(dashboard)/admin/ingredients` | — | ⬜ needs spec | — | ✅ | — |
| KDS | `/(dashboard)/kds` | [admin_kds/](admin_kds/) | ⬜ needs spec | [flow-kds.excalidraw](admin_kds/flow-kds.excalidraw) | ✅ | — |
| POS | `/(dashboard)/pos` | [admin_pos/](admin_pos/) | ⬜ needs spec | [flow-pos-payment.excalidraw](admin_pos/flow-pos-payment.excalidraw) | ✅ | — |
| Live Orders | `/(dashboard)/orders/live` | — | ⬜ needs spec | — | ✅ | — |
| Cashier Payment | `/(dashboard)/cashier/payment/[id]` | — | ⬜ needs spec | — | ✅ | — |

---

## §2 — Shared Component Registry

> Full details (props, variants, usage rules) → [shared/_INDEX_SHARING_COMPONENT.md](shared/_INDEX_SHARING_COMPONENT.md)

### Quick lookup

| Tier | Component | File | Pages that use it |
|------|-----------|------|-------------------|
| UI | `Button` | `ui/button.tsx` | All pages |
| UI | `Badge` | `ui/badge.tsx` | All pages |
| UI | `Input` | `ui/input.tsx` | Forms, search |
| UI | `Card` | `ui/card.tsx` | Admin pages |
| UI | `Label` | `ui/label.tsx` | Forms |
| Shared | `StatusBadge` | `shared/StatusBadge.tsx` | Order tracking · KDS · POS |
| Shared | `EmptyState` | `shared/EmptyState.tsx` | Menu · Favourites · any empty list |
| Shared | `ConnectionErrorBanner` | `shared/ConnectionErrorBanner.tsx` | KDS · Order tracking (SSE pages) |
| Shared | `CookieConsent` | `shared/CookieConsent.tsx` | Layout only |
| Menu | `ProductCard` | `menu/ProductCard.tsx` | Menu · Favourites |
| Menu | `ComboCard` | `menu/ComboCard.tsx` | Menu |
| Menu | `CategoryTabs` | `menu/CategoryTabs.tsx` | Menu |
| Menu | `CartDrawer` | `menu/CartDrawer.tsx` | Menu · Order tracking |
| Menu | `ToppingModal` | `menu/ToppingModal.tsx` | Menu (inside ProductCard) |
| Menu | `ComboModal` | `menu/ComboModal.tsx` | Menu (inside ComboCard) |
| Guard | `AuthGuard` | `guards/AuthGuard.tsx` | All dashboard pages |
| Guard | `RoleGuard` | `guards/RoleGuard.tsx` | Admin · manager pages |
| Order | `OrderDetailSheet` | `order/OrderDetailSheet.tsx` | Order tracking |

### Rule: before building a new component

1. Check [shared/_INDEX_SHARING_COMPONENT.md](shared/_INDEX_SHARING_COMPONENT.md)
2. If it exists → reuse, mark `✅ reuse` in your spec's Component Map
3. If it doesn't exist → build it in the right tier, then add a row to the index

---

## §3 — Global State Map

> Zustand stores only. TanStack Query (server state) is managed per-page — see each spec's Data Sources table.

### Stores

| Store | File | Persisted | What it owns |
|-------|------|-----------|-------------|
| `cartStore` | `store/cart.ts` | ✅ localStorage | `items` · `total()` · `itemCount()` · `activeOrderId` · `drinkConfig` · `orderNote` |
| `favouritesStore` | `store/favourites.ts` | ✅ localStorage | Favourite product/combo IDs |
| `settingsStore` | `store/settings.ts` | ✅ localStorage | `tableLabel` · `customerName` · `guestToken` |
| `authStore` | (via AuthGuard) | session | Current user · role · JWT |

### Which pages read/write which stores

| Store | Pages that read | Pages that write |
|-------|----------------|-----------------|
| `cartStore` | Menu · Product Detail · Combo Detail · Checkout · Order Tracking · CartDrawer | Menu (add/remove) · Checkout (clear) |
| `favouritesStore` | Menu · Product Detail · Favourites page | Menu · Product Detail (toggle) |
| `settingsStore` | Menu (tableLabel) · Checkout | QR Entry (`/table/[id]`) · Settings page |
| `authStore` | All dashboard pages (via AuthGuard / RoleGuard) | Login page |

### Rules for global state

- Only put data in a store if **2+ pages** need it — otherwise use `useState` locally
- `cartStore` and `favouritesStore` use Zustand `persist` middleware → survive page reload
- `settingsStore.guestToken` is set once at QR scan — never write it from other pages
- Do not duplicate store data in TanStack Query cache — store = client state, Query = server state

---

## §4 — Flow Diagram Index

> Visual flows showing page-to-page navigation and system interactions.

| Flow | File | What it shows |
|------|------|--------------|
| Full System Journey | [full_system_jounery/flow-full-system-journey.excalidraw](full_system_jounery/flow-full-system-journey.excalidraw) | End-to-end: QR → order → payment → KDS |
| Customer Ordering Flow | [client_order_page/flow-customer-ordering.excalidraw](client_order_page/flow-customer-ordering.excalidraw) | Customer page transitions |
| Customer Ordering Pages | [client_order_page/flow-customer-ordering-pages.excalidraw](client_order_page/flow-customer-ordering-pages.excalidraw) | Detailed page-level flow |
| Admin Flow | [admin_main/admin_flow/flow-admin.excalidraw](admin_main/admin_flow/flow-admin.excalidraw) | Admin navigation map |
| Admin Ordering Workflow | [admin_main/admin_flow/flow-admin-ordering-workflow.excalidraw](admin_main/admin_flow/flow-admin-ordering-workflow.excalidraw) | Order management workflow |
| KDS Flow | [admin_kds/flow-kds.excalidraw](admin_kds/flow-kds.excalidraw) | Kitchen display system |
| POS + Payment Flow | [admin_pos/flow-pos-payment.excalidraw](admin_pos/flow-pos-payment.excalidraw) | POS and payment states |
| Realtime / SSE Flow | [admin_sse/flow-realtime.excalidraw](admin_sse/flow-realtime.excalidraw) | SSE connection + event flow |
| Client Flow | [client_flow/client_flow.md](client_flow/client_flow.md) | Written description of client flow |

---

## §5 — Rules

### Adding a new page

1. Add a row to the Page Registry (§1) immediately — even before drawing
2. Create a folder under `docs/fe/wireframes/<page-folder>/`
3. Follow the 6-step format in [HOW_TO_SPEC_v2.md](HOW_TO_SPEC_v2.md)
4. Name the spec file: `<page>_spec.md`
5. Check §2 for reusable components before creating new ones
6. Check §3 for which stores the page needs before adding new state

### Updating an existing spec

- Change spec status in Page Registry the moment build status changes
- If a new shared component is extracted from a page → add it to [shared/_INDEX_SHARING_COMPONENT.md](shared/_INDEX_SHARING_COMPONENT.md) and update §2 here
- If a new store is added → update §3 Global State Map

### Spec file format

| ✅ Put in spec | ❌ Do not put in spec |
|--------------|----------------------|
| ASCII wireframe | TypeScript interface code |
| Zone table | Zustand store implementation |
| Data sources table | TanStack Query hook code |
| Component map (reuse markers) | Business rules (→ `MASTER_v1.2.md`) |
| AC list | API endpoint details (→ `API_CONTRACT_v1.2.md`) |
| Task rows with status | Implementation notes / comments |

### Spec priority queue (what to spec next)

Pages marked `⬜ needs spec` in §1, ordered by user impact:

1. Product Detail — `/(shop)/menu/product/[id]` — already built, high traffic
2. Checkout — `/(shop)/checkout` — critical flow, no spec
3. Order Tracking — `/(shop)/order/[id]` — SSE complexity, no spec
4. KDS — `/(dashboard)/kds` — staff-facing, complex realtime
5. POS — `/(dashboard)/pos` — complex, already has flow diagram

---

## §6 — Guide Files in This Directory

| File | Purpose |
|------|---------|
| [_MASTER.md](_MASTER.md) | **This file** — control document |
| [HOW_TO_SPEC_v2.md](HOW_TO_SPEC_v2.md) | 6-step spec writing guide (current) |
| [HOW_TO_SPEC.md](HOW_TO_SPEC.md) | v1 — kept for reference, superseded by v2 |
| [FOLDER_STANDARD.md](FOLDER_STANDARD.md) | Folder naming and file structure rules |
| [_TEMPLATE.md](_TEMPLATE.md) | Copy-paste page spec template |
| [WIREFRAME_INDEX.md](WIREFRAME_INDEX.md) | Legacy index — excalidraw files only, superseded by §1 above |
| [shared/_INDEX_SHARING_COMPONENT.md](shared/_INDEX_SHARING_COMPONENT.md) | All reusable components — full detail |

---

*Last updated: 2026-05-25*
*Update this file whenever: a page is added · a spec is written · build status changes · a new shared component is created · a new store is added.*
