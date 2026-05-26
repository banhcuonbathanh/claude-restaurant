# Shared Component Index

> Check here **before** building anything new.
> If a component exists → mark it `✅ reuse` in your page spec Component Map.
> If it doesn't exist → build it, then add a row here.

---

## How to reference in a page spec

In your Component Map (Step 5), write the component name and point to this file:

| Zone | Component | Reuse? | File |
|------|-----------|--------|------|
| J | `Button` | ✅ reuse | `components/ui/button.tsx` |
| — | `MyNewThing` | new (local) | `components/menu/MyNewThing.tsx` |
| — | `SomePanel` | new (shared) | `components/shared/SomePanel.tsx` |

---

## Tier 1 — UI Atoms (`components/ui/`)

> Lowest-level building blocks. Used by all pages — "Used by" column omitted here.

| Component | File | Variants | Notes |
|-----------|------|----------|-------|
| `Button` | `ui/button.tsx` | **variant:** default · secondary · destructive · success · warning · outline · ghost · link — **size:** sm · default · lg · xl · icon · icon-sm · icon-lg | Min touch target: `h-10` (40px). Use `size="lg"` for primary CTA |
| `Badge` | `ui/badge.tsx` | **variant:** default · secondary · success · warning · urgent · outline · muted | Use `success` for available, `urgent` for out-of-stock |
| `Input` | `ui/input.tsx` | — | Styled text input. Wrap with `Label` for forms |
| `Label` | `ui/label.tsx` | — | For form fields only |
| `Card` | `ui/card.tsx` | `Card` · `CardHeader` · `CardContent` · `CardFooter` · `CardTitle` · `CardDescription` | Admin and dashboard pages. Not used in customer flow |
| `ProgressBar` | `ui/progress-bar.tsx` | `value: number · max?: number · color?: string · className?` | Generic inline percentage progress bar. Use for budget progress, follower goals, or any % metric. `role="progressbar"` required. Used by: admin_main_marketing |

---

## Tier 2 — Shared Components (`components/shared/`)

> Cross-cutting components used by multiple page domains.

| Component | File | Key Props | When to use | Used by |
|-----------|------|-----------|-------------|---------|
| `StatusBadge` | `shared/StatusBadge.tsx` | `status: OrderStatus` | Anywhere an order status needs a styled label. Statuses: pending · confirmed · preparing · ready · delivered · cancelled | — |
| `EmptyState` | `shared/EmptyState.tsx` | `icon?: string` · `message: string` | Any empty list or zero-result state. Default icon: 🍜 | — |
| `ConnectionErrorBanner` | `shared/ConnectionErrorBanner.tsx` | none | SSE disconnect. Fixed top banner. Use on KDS, Order tracking pages | — |
| `CookieConsent` | `shared/CookieConsent.tsx` | — | Layout-level only. Do not use inside pages | — |
| `AdminTopNav` | `shared/AdminTopNav.tsx` | `activeTab: AdminTab` | Top navigation bar for all admin pages | admin/categories · admin/training · admin/marketing |
| `AdminSidebar` | `shared/AdminSidebar.tsx` | `activeItem: string` | Side navigation panel for all admin pages | admin/training |
| `DateRangePicker` | `shared/DateRangePicker.tsx` | `value: DateRange · onChange: (range) => void · placeholder?` | Date range filter input. Supports keyboard ISO entry + visual calendar. Use on any admin page with date-scoped data. Used by: admin_main_marketing |
| `KPICard` | `shared/KPICard.tsx` | `label: string · value: string · badge?: string · valueColor?: string · badgeVariant?` | Generic KPI metric card (label + large value + optional badge). Use for overview dashboards, summary pages, marketing. Used by: admin_main_marketing · admin_main_staff |
| `Pagination` | `shared/Pagination.tsx` | `currentPage: number · totalPages: number · onPageChange: (page: number) => void` | Generic page navigation control (← page buttons →). Use on any admin list page with more than 1 page of results. Used by: admin_main_staff |

---

## Tier 3 — Menu Feature Components (`components/menu/`)

> Built for the menu page but reusable in similar customer-flow pages.

| Component | File | Key Props | When to use | Used by |
|-----------|------|-----------|-------------|---------|
| `ProductCard` | `menu/ProductCard.tsx` | `product: Product` | Any page that lists products. Handles add-to-cart + favourite toggle internally | — |
| `ComboCard` | `menu/ComboCard.tsx` | `combo: Combo` | Any page that lists combos | menu |
| `CategoryTabs` | `menu/CategoryTabs.tsx` | `categories` · `selected` · `onSelect` | Horizontal scroll category filter. Sticky-aware | menu |
| `CartDrawer` | `menu/CartDrawer.tsx` | `open` · `onClose` · `addToOrderId?` | Slide-in cart panel. Also handles "add to existing order" flow | menu |
| `ToppingModal` | `menu/ToppingModal.tsx` | `product` · `open` · `onClose` · `onConfirm` | Bottom sheet for topping selection. Used inside `ProductCard` | menu |
| `ComboModal` | `menu/ComboModal.tsx` | `combo` · `open` · `onClose` · `onConfirm` | Bottom sheet for combo detail. Used inside `ComboCard` | menu |

---

## Tier 4 — Guards (`components/guards/`)

> Route protection. Wrap page content, not layouts.

| Component | File | Key Props | When to use | Used by |
|-----------|------|-----------|-------------|---------|
| `AuthGuard` | `guards/AuthGuard.tsx` | — | All protected pages (staff, admin). Redirects unauthenticated users | admin/categories · admin/training |
| `RoleGuard` | `guards/RoleGuard.tsx` | `allowedRoles: Role[]` | Admin and manager-only pages | admin/categories · admin/training |

---

## Order Domain (`components/order/`)

| Component | File | Key Props | When to use | Used by |
|-----------|------|-----------|-------------|---------|
| `OrderDetailSheet` | `order/OrderDetailSheet.tsx` | — | Order tracking page (`/order/[id]`) | — |

---

## Global Stores (Zustand)

> State that crosses page boundaries. Do not duplicate in local state.

| Store | File | What it owns | Used by |
|-------|------|-------------|---------|
| `useCartStore` | `store/cart.ts` | Cart items · total · itemCount · activeOrderId | menu |
| `useFavouritesStore` | `store/favourites.ts` | Favourite product/combo IDs (localStorage persisted) | menu |
| `useSettingsStore` | `store/settings.ts` | tableLabel · customerName · guestToken | menu |
| `useAuthStore` | `store/auth.ts` | Current user · role · JWT | admin/categories · admin/training |

---

## 📋 Page Directory

> One row per wireframed page that has been cross-referenced against this index.
> **Use this table** to know which pages to revisit when you add or rename a shared component.
> When you add a new page wireframe → add a row here immediately.

| Page | Route | Wireframe | Shared (from this index) | Local-only components |
|------|-------|-----------|--------------------------|----------------------|
| Menu | `/(shop)/menu` | [menu_wireframe_v1.md](../client_menu_page/menu_wireframe_v1.md) | `CategoryTabs` · `ComboCard` · `ToppingModal` · `ComboModal` · `CartDrawer` · `useCartStore` · `useFavouritesStore` · `useSettingsStore` | `Header` · `SearchBar` · `FavoritesRail` · `ProductGridCard` · `NướcDùngCustomize` · `OrderNoteInput` · `OrderSummary` · `CartFAB` |
| Admin — Categories | `/admin/categories` | [admin_main_categories_wireframe_v1.md](../admin_main/admin_main_categories/admin_main_categories_wireframe_v1.md) | `AdminTopNav` · `AuthGuard` · `RoleGuard` · `useAuthStore` | `CategoryPageHeader` · `CategoryTable` · `AddCategoryModal` · `EditCategoryModal` |
| Admin — Training | `/admin/training` | [admin_staff_training_wireframe_v1.md](../admin_main/admin_main_training/admin_staff_training_wireframe_v1.md) | `AdminSidebar` · `AuthGuard` · `RoleGuard` · `useAuthStore` | `RoleFilterTabs` · `JobGuideCardGrid` · `JobGuideCard` · `CompletionTrackingTable` · `CreateEditGuideModal` · `TrainingProgressModal` |
| Admin — Combos | `/admin/combos` | [admin_main_combos_wireframe_v1.md](../admin_main/admin_main_combos/admin_main_combos_wireframe_v1.md) | `AdminTopNav` · `AuthGuard` · `RoleGuard` · `useAuthStore` · `Button` · `Badge` · `Input` · `Card` · `EmptyState` | `ComboPageHeader` · `ComboTable` · `ComboFormModal` · `ProductSearchList` |
| Admin — Marketing | `/admin/marketing` | [admin_main_marketing_wireframe_v1.md](../admin_main/admin_main_marketing/admin_main_marketing_wireframe_v1.md) | `AdminTopNav` · `AuthGuard` · `RoleGuard` · `useAuthStore` · `Button` · `Badge` · `DateRangePicker` · `KPICard` · `ProgressBar` | `MarketingPageHeader` · `BudgetSummaryCards` · `SpendBreakdownTable` · `BudgetDonutChart` · `LoveScoreSection` · `CampaignTimeline` |
| Admin — Products | `/admin/products` | [admin_main_product_wireframe_v1.md](../admin_main/admin_main_product/admin_main_product_wireframe_v1.md) | `AdminTopNav` · `AuthGuard` · `RoleGuard` · `useAuthStore` · `Button` · `Badge` · `EmptyState` | `ProductPageHeader` · `ProductsTable` · `ProductFormModal` |
| Admin — Staff | `/admin/staff` | [admin_main_staff_wireframe_v1.md](../admin_main/admin_main_staff/admin_main_staff_wireframe_v1.md) | `AdminTopNav` · `AuthGuard` · `RoleGuard` · `useAuthStore` · `Button` · `Badge` · `ProgressBar` · `EmptyState` · `KPICard` · `Pagination` | `StaffPageHeader` · `StaffStatsBar` · `StaffFilterBar` · `StaffTable` · `AddEditStaffModal` · `StaffDetailDrawer` |
| Admin — Storage | `/admin/storage` | [admin_main_storage_wireframe_v1.md](../admin_main/admin_main_storage/admin_main_storage_wireframe_v1.md) | `AdminTopNav` · `AuthGuard` · `RoleGuard` · `useAuthStore` · `Button` · `Badge` · `Input` · `EmptyState` | `StoragePageHeader` · `IngredientTable` · `IngredientFormModal` |

---

*Last updated: 2026-05-26 (admin_main_storage added — no new shared components; Page Directory row added)*
*Add new components here the moment they are built — not after.*
*Add a new Page Directory row whenever a wireframe is cross-referenced against this index.*
