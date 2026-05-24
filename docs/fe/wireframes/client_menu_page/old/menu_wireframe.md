---
page: menu
route: /(shop)/menu
spec_ref: Spec_3 §4
created: 2026-05-17
---

# Wireframe — Menu Page

## Data Sources

| Zone | Source | Update mechanism |
|---|---|---|
| Zone A Header | `settingsStore.tableLabel` (Zustand) | In-memory client state |
| Zone C CategoryTabs | `GET /api/v1/categories` | TanStack Query, staleTime 5 min |
| Zone D ComboSection | `GET /api/v1/combos` | TanStack Query, staleTime 5 min |
| Zone E ProductGrid | `GET /api/v1/products?category_id=&is_available=true` | TanStack Query, per `selectedCategory` |
| Zone F CartFAB | `cartStore.itemCount()` + `cartStore.total()` (Zustand) | In-memory client state |
| Zone G AddToOrderBanner | `?add_to_order=<orderId>` URL query param | URL state (P11-6, not yet implemented) |

## Layout

```
┌─────────────────────────────────────┐
│  [A] Quán Bánh Cuốn  ⚙  📋  🛒 2   │  ← sticky top-0 z-20
├─────────────────────────────────────┤
│  [B] Restaurant banner h-44          │  ← optional, object-cover
│      gradient overlay + caption      │
├─────────────────────────────────────┤
│  [C] [Tất cả] Bánh Cuốn  Chả  →     │  ← sticky top-[52px] z-10
├──────────────────────────────────────┤
│  [D] COMBO  (only when tab = Tất cả) │
│  ┌────────────────────────────────┐  │
│  │ img  Combo Gia Đình  180k  +  │  │
│  │ img  Combo Tiêu Chuẩn 120k +  │  │
│  └────────────────────────────────┘  │
├─────────────────────────────────────┤
│  [E] MÓN LẺ  (2-col grid)           │
│  ┌──────────┐  ┌──────────┐        │
│  │  img     │  │  img     │        │  ← aspect-square, object-cover
│  │  name    │  │  name    │        │
│  │  price   │  │  price   │   +    │
│  └──────────┘  └──────────┘        │
│        ··· cuộn để xem thêm ···    │
├─────────────────────────────────────┤
│  [F] [2]  Xem giỏ hàng  90,000 ₫   │  ← fixed bottom-6, count > 0
└─────────────────────────────────────┘
 [G] Đang thêm vào Đơn #xxx · Bàn 3 ✕  ← P11-6, amber banner sticky below header
```

## Components

| Zone | Component | File | spec_ref | Notes |
|---|---|---|---|---|
| Zone A | Header (inline) | `menu/page.tsx` | Spec_3 §4.1 | sticky; shows tableLabel from settingsStore |
| Zone B | RestaurantBanner (inline) | `menu/page.tsx` | — | optional; graceful fallback to gradient |
| Zone C | `CategoryTabs` | `components/menu/CategoryTabs.tsx` | Spec_3 §4.8 | sticky top-[52px]; orange active underline |
| Zone D | `ComboCard` × n | `components/menu/ComboCard.tsx` | Spec_3 §4.5 | horizontal card; only shown when selectedCategory === null |
| Zone E | `ProductGridCard` × n | `components/menu/ProductGridCard.tsx` | Spec_3 §4.3 | 2-col grid; vertical card (image top, content bottom) |
| Zone F | CartFAB (inline) | `menu/page.tsx` | Spec_3 §4.1 | fixed bottom-6; hidden when cart empty |
| CartDrawer | `CartDrawer` | `components/menu/CartDrawer.tsx` | Spec_3 §4.7 | slide-in from right; not shown in wireframe |
| Zone G | AddToOrderBanner (inline) | `menu/page.tsx` | Spec_4 §5.2 | P11-6 — not yet implemented; needs P11-4 ✅ first |

## Skeleton (isLoading = true)

All zones replace with `animate-pulse bg-card rounded-xl` blocks matching zone dimensions.
Product grid: 4 gray cards in 2×2 layout.

## Key Rules (copy from spec §4)

- `staleTime: 5 * 60 * 1000` on all product/category queries — matches Redis TTL
- `selectedCategory: null` = "Tất cả" (show combos + all products)
- `selectedCategory: string` = filter by category_id (hide combos section)
- All product IDs are `string` UUID — never `number`
- `price` not `base_price`; `image_path` not `image_url`
- Unavailable products show "Hết" overlay + disabled add button

## Task Rows

| ID | Owner | Task | Status | spec_ref | draw_ref |
|---|---|---|---|---|---|
| P-MENU-1 | FE | Wireframe + zone table (menu.excalidraw + menu.md) | ✅ | Spec_3 §4 | wireframes/menu.excalidraw |
| P-MENU-2 | FE | `ProductGridCard` component + update menu layout to 2-col grid | ✅ | Spec_3 §4.1 §4.3 | wireframes/menu.md Zone E |
