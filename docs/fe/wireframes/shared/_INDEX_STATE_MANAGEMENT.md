# State Management Index

> Check here **before** adding any new state.
> If a store or query key exists → reuse it. Do not duplicate.
> If it doesn't exist → add it here the moment you create it.

---

## How to use this index

In your wireframe's **Data Sources & State Management** table, reference this file for any Zustand store or TanStack Query key that crosses page boundaries.

| Zone | Data Source | Update Mechanism | Query Key | Notes |
|------|-------------|------------------|-----------|-------|
| C | TanStack Query → `GET /api/v1/categories` | Invalidate on mutation | `['categories']` | ← matches row in §Server Cache Keys below |
| B | `useAuthStore.user.role` | Zustand | N/A | ← matches row in §Global Zustand Stores below |

---

## State Layers (summary)

| Layer | Tool | Scope | When to use |
|-------|------|-------|-------------|
| **Global client state** | Zustand | Cross-page | Cart, auth, favourites, settings, UI filters shared across pages |
| **Server cache** | TanStack Query | Cross-page (shared keys) | Any data fetched from the API. Reuse the same `queryKey` across pages to share cache |
| **Form state** | RHF + Zod | Local (modal/form only) | Add/Edit/Create modals. Never lift into Zustand |
| **UI-only local state** | `useState` / `useReducer` | Local (component) | Modal open/close, selected row, active tab that does not cross pages |

---

## Global Zustand Stores

> State that crosses page boundaries. Do not duplicate in local state.

| Store | File | What it owns | Used by |
|-------|------|-------------|---------|
| `useCartStore` | `store/cart.ts` | `items` · `drinkConfig` · `orderNote` · `activeOrderId` — computed: `itemCount()` · `total()` | Menu |
| `useFavouritesStore` | `store/favourites.ts` | Favourite product/combo IDs (localStorage-persisted) | Menu |
| `useSettingsStore` | `store/settings.ts` | `tableLabel` · `customerName` · `guestToken` | Menu |
| `useAuthStore` | `store/auth.ts` | `user` · `role` · JWT token | Admin — Categories · Admin — Training · Admin — Combos · Admin — Marketing · Admin — Staff |
| `useTrainingStore` | `store/trainingStore.ts` | `activeRole: StaffRole \| 'all'` · `selectedGuideId: string` | Admin — Training |

---

## Server Cache Keys (TanStack Query)

> Reuse these exact keys so pages share the same cache. Do not invent new keys for the same resource.

| Query Key | Endpoint | staleTime | Used by | Notes |
|-----------|----------|-----------|---------|-------|
| `['categories']` | `GET /api/v1/categories` | 60s | Menu · Admin — Categories | Both pages read the same cache. Mutations in Admin invalidate; Menu re-fetches |
| `['products', categoryId, searchQuery]` | `GET /api/v1/products` | 5 min | Menu | Parameterised by category + search |
| `['combos']` | `GET /api/v1/combos` | 5 min | Menu | Customer-facing combo list |
| `['admin', 'combos']` | `GET /api/v1/admin/combos` | 30s | Admin — Combos | Admin-facing combo list (separate key from customer `['combos']`) |
| `['admin', 'products']` | `GET /api/v1/admin/products` | 60s | Admin — Combos | Product search in ComboFormModal |
| `['admin', 'staff']` | `GET /api/v1/admin/staff` | on-focus | Admin — Staff | Refetches on window focus; full list (client-side filter + paginate) |
| `['admin', 'staff', id]` | `GET /api/v1/admin/staff/:id` | 30s | Admin — Staff | `enabled` only when StaffDetailDrawer opens; fetches single staff with full detail |
| `['training', 'guides', role]` | `GET /api/v1/admin/training/guides` | 5 min | Admin — Training | Parameterised by role filter |
| `['training', 'progress', guideId, page]` | `GET /api/v1/admin/training/guides/:id/progress` | 2 min | Admin — Training | Paginated; changes on guide dropdown |
| `['training', 'staffProgress', staffId, guideId]` | `GET /api/v1/admin/training/staff/:id/progress/:guideId` | on-demand | Admin — Training | Fetched only when Modal 2 opens |
| `['marketing', 'spend', dateRange]` | `GET /api/v1/admin/marketing/spend` | 5 min | Admin — Marketing | Shared by Zones C, D, E on the same page |
| `['admin', 'toppings']` | `GET /api/v1/admin/toppings` | 60s | Admin — Products | Topping checkbox list in ProductFormModal |
| `['admin', 'ingredients']` | `GET /api/v1/admin/ingredients` | 60s | Admin — Storage | Full ingredient list; client-side filter by search query |

---

## Per-Page State Breakdown

### Menu — `/(shop)/menu`

| State | Layer | Source | Notes |
|-------|-------|--------|-------|
| Cart items · drink config · order note | Zustand | `useCartStore` | Persisted to localStorage |
| Favourite IDs | Zustand | `useFavouritesStore` | localStorage-persisted |
| Table label · guest token | Zustand | `useSettingsStore` | Set at session start |
| Category list | TanStack Query | `['categories']` | staleTime 5 min |
| Product list | TanStack Query | `['products', categoryId, searchQuery]` | Debounced search (300 ms) |
| Combo list | TanStack Query | `['combos']` | Hidden when a category is selected |
| Search query | `useState` (local) | SearchBar | Debounced before hitting query key |
| Selected category | `useState` (local) | CategoryTabs | Controls product + combo visibility |

**Sharing:** `['categories']` cache is shared with Admin — Categories. Cart state is Menu-only.

---

### Admin — Categories — `/admin/categories`

| State | Layer | Source | Notes |
|-------|-------|--------|-------|
| Auth / role | Zustand | `useAuthStore` | Guards page access via `AuthGuard` + `RoleGuard` |
| Category list | TanStack Query | `['categories']` | Shared cache with Menu page |
| Add modal open | `useState` (local) | page component | Boolean, no store needed |
| Selected category for edit | `useState` (local) | page component | `Category \| null` |
| Add form | RHF + Zod | `AddCategoryModal` | POST → invalidate `['categories']` on success |
| Edit form | RHF + Zod | `EditCategoryModal` | PATCH → invalidate `['categories']` on success |

**Sharing:** `['categories']` key is shared with Menu. Any mutation here also refreshes the Menu page's category tabs.

---

### Admin — Combos — `/admin/combos`

| State | Layer | Source | Notes |
|-------|-------|--------|-------|
| Auth / role | Zustand | `useAuthStore` | Role used to hide "Xóa" button for non-Admin |
| Combo list | TanStack Query | `['admin', 'combos']` | Full list, no pagination |
| Product list (modal search) | TanStack Query | `['admin', 'products']` | Fetched once; filtered client-side by search input |
| Modal open + mode (`add`/`edit`) | `useState` (local) | page component | Boolean + mode string |
| Selected combo for edit | `useState` (local) | page component | `Combo \| null` |
| Combo form | RHF + Zod | `ComboFormModal` | POST / PUT → invalidate `['admin', 'combos']` |
| Savings calculation | Computed (local) | `ComboFormModal` | `retailSum - watchedPrice`, re-computed on change |

**Sharing:** No cross-page shared state beyond `useAuthStore`.

---

### Admin — Training — `/admin/training`

| State | Layer | Source | Notes |
|-------|-------|--------|-------|
| Auth / role | Zustand | `useAuthStore` | Controls nav visibility and "+ New Guide" CTA |
| Active role filter | Zustand | `useTrainingStore.activeRole` | Drives `['training', 'guides', activeRole]` query key |
| Selected guide (dropdown) | Zustand | `useTrainingStore.selectedGuideId` | Drives Completion Tracking table query |
| Guide card list | TanStack Query | `['training', 'guides', activeRole]` | staleTime 5 min |
| Completion tracking (paginated) | TanStack Query | `['training', 'progress', guideId, page]` | staleTime 2 min |
| Staff detail (modal) | TanStack Query | `['training', 'staffProgress', staffId, guideId]` | `enabled` only when Modal 2 is open |
| Create/Edit guide form | RHF + Zod | `CreateEditGuideModal` | POST / PATCH → invalidate `['training', 'guides', *]` |
| Modal 1 open | `useState` (local) | page component | Boolean |
| Modal 2 open + context | `useState` (local) | page component | `{ staffId, guideId } \| null` |

**Sharing:** `useTrainingStore` is Training-page-only. `useAuthStore` shared across all admin pages.

---

### Admin — Marketing — `/admin/marketing`

| State | Layer | Source | Notes |
|-------|-------|--------|-------|
| Auth / role | Zustand | `useAuthStore` | RoleGuard: `['admin', 'manager']` |
| Date range filter | `useState` (local) or `useDateRangeStore` | `MarketingPageHeader` | Default: current month. Drives query key param |
| Spend data | TanStack Query | `['marketing', 'spend', dateRange]` | Single query shared by Zones C, D, and E |
| Campaign timeline | Static / hardcoded | `CampaignTimeline` component | No API call needed |

**Sharing:** All three data zones (BudgetSummary, SpendBreakdown, LoveScore) read the same `['marketing', 'spend', dateRange]` query — do not create separate fetches.

---

### Admin — Products — `/admin/products`

| State | Layer | Source | Notes |
|-------|-------|--------|-------|
| Auth / role | Zustand | `useAuthStore` | Guards page via AuthGuard + RoleGuard |
| Product list | TanStack Query | `['admin', 'products']` | staleTime 30s; shared with Admin — Combos |
| Category list (form) | TanStack Query | `['categories']` | staleTime 60s; shared with Menu + Admin — Categories |
| Topping list (form) | TanStack Query | `['admin', 'toppings']` | staleTime 60s; read-only in ProductFormModal |
| Modal open + mode | `useState` (local) | `ProductsPageClient` | `'add' \| 'edit'` |
| Selected product (edit) | `useState` (local) | `ProductsPageClient` | `Product \| null` |
| Product form | RHF + Zod | `ProductFormModal` | POST / PATCH → invalidate `['admin', 'products']` |

**Sharing:** `['admin', 'products']` shared with Admin — Combos. `['categories']` shared with Menu + Admin — Categories.

---

### Admin — Staff — `/admin/staff`

| State | Layer | Source | Notes |
|-------|-------|--------|-------|
| Auth / role | Zustand | `useAuthStore` | Guards page |
| Staff list | TanStack Query | `['admin', 'staff']` | Refetch on window focus; invalidated on all mutations |
| Search filter | `useState` (local) | Filter bar | Client-side filter over the fetched list |
| Role filter | `useState` (local) | Filter bar | Client-side |
| Status filter | `useState` (local) | Filter bar | Client-side |
| Add/Edit modal open | `useState` (local) | page component | Boolean |
| Selected staff for edit | `useState` (local) | page component | `Staff \| null` |
| Staff detail drawer open | `useState` (local) | page component | `staffId \| null` |
| Add/Edit form | RHF + Zod | modal component | POST / PATCH → invalidate `['admin', 'staff']` |

**Sharing:** No cross-page shared state beyond `useAuthStore`.

---

## Cross-Page State Sharing Map

> Which state escapes a single page.

| State | Shared between | Mechanism |
|-------|----------------|-----------|
| `['categories']` cache | Menu ↔ Admin — Categories | TanStack Query shared key — mutation in Admin refreshes Menu |
| `useAuthStore` | All admin pages | Zustand global store |
| `useCartStore` | Menu (all zones) | Zustand — no other page reads cart |
| `useFavouritesStore` | Menu (FavoritesRail ↔ ProductCard ↔ ComboCard) | Zustand — within Menu only |

---

## 📋 Page Directory

> One row per wireframed page cross-referenced against this index.
> When you add a new page wireframe → add a row here immediately.

| Page | Route | Wireframe | Global Stores | TanStack Keys | Local State |
|------|-------|-----------|---------------|---------------|-------------|
| Menu | `/(shop)/menu` | [menu_wireframe_v1.md](../client_menu_page/menu_wireframe_v1.md) | `useCartStore` · `useFavouritesStore` · `useSettingsStore` | `['categories']` · `['products', ...]` · `['combos']` | selectedCategory · searchQuery |
| Admin — Categories | `/admin/categories` | [admin_main_categories_wireframe_v1.md](../admin_main/admin_main_categories/admin_main_categories_wireframe_v1.md) | `useAuthStore` | `['categories']` | addModalOpen · selectedCategory |
| Admin — Combos | `/admin/combos` | [admin_main_combos_wireframe_v1.md](../admin_main/admin_main_combos/admin_main_combos_wireframe_v1.md) | `useAuthStore` | `['admin', 'combos']` · `['admin', 'products']` | modalOpen · modalMode · selectedCombo |
| Admin — Training | `/admin/training` | [admin_staff_training_wireframe_v1.md](../admin_main/admin_main_training/admin_staff_training_wireframe_v1.md) | `useAuthStore` · `useTrainingStore` | `['training', 'guides', role]` · `['training', 'progress', ...]` · `['training', 'staffProgress', ...]` | modal1Open · modal2Context |
| Admin — Marketing | `/admin/marketing` | [admin_main_marketing_wireframe_v1.md](../admin_main/admin_main_marketing/admin_main_marketing_wireframe_v1.md) | `useAuthStore` | `['marketing', 'spend', dateRange]` | dateRange |
| Admin — Staff | `/admin/staff` | [admin_main_staff_wireframe_v1.md](../admin_main/admin_main_staff/admin_main_staff_wireframe_v1.md) | `useAuthStore` | `['admin', 'staff']` · `['admin', 'staff', id]` | search · roleFilter · statusFilter · page · modalOpen · modalMode · selectedStaff · detailStaffId |
| Admin — Products | `/admin/products` | [admin_main_product_wireframe_v1.md](../admin_main/admin_main_product/admin_main_product_wireframe_v1.md) | `useAuthStore` | `['admin', 'products']` · `['categories']` · `['admin', 'toppings']` | modalOpen · modalMode · selectedProduct |
| Admin — Storage | `/admin/storage` | [admin_main_storage_wireframe_v1.md](../admin_main/admin_main_storage/admin_main_storage_wireframe_v1.md) | `useAuthStore` | `['admin', 'ingredients']` | searchQuery · modalOpen · modalMode · selectedIngredient |

---

*Last updated: 2026-05-26 (admin_main_storage added — ['admin', 'ingredients'] key registered; Page Directory row added)*
*Add a new row whenever a wireframe page is cross-referenced against this index.*
*Update Server Cache Keys and Global Stores the moment a new store or key is created.*
