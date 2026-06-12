# Customer Menu — `/menu`

> **TL;DR:** ✅ implemented · guest JWT (or open browse) · The core customer page: browse
> categories, combos and products, build a cart, and submit the order. With a table bound (QR
> path) checkout is a single confirm modal; without a table it routes to `/checkout`.
> 🔮 PLANNED: this same page is the entry for online ordering from home (customer account login).

---

## ASCII Wireframe

```
┌────────────────────────────────────────────────┐
│ Quán Bánh Cuốn            Bàn 03               │ ← A MenuHeader
├────────────────────────────────────────────────┤
│ 🛒 3 món · 105.000đ              [Xem giỏ →]   │ ← MiniCartStrip (sticky, if cart>0)
├────────────────────────────────────────────────┤
│ [restaurant banner image]                      │ ← RestaurantBanner
│ ▸ Đang thêm món vào đơn #123  [Xem đơn]        │ ← AddToOrderBanner (only ?add_to_order=)
├────────────────────────────────────────────────┤
│ 🔍 Tìm món...                                  │ ← B SearchBar
│ [Tất cả] [Bánh cuốn] [Đồ uống] [Combo] ...     │ ← C CategoryTabs (scrollable)
│ ♥ FavouritesRail ▸ ▸ ▸  (if favourites exist)  │ ← D
├────────────────────────────────────────────────┤
│ COMBO (only on "Tất cả" tab)                   │ ← E ComboSection
│ ┌──────────────────────────────────┐           │
│ │ Combo Đầy Đặn  42.000đ   [+]     │           │
│ └──────────────────────────────────┘           │
│ MÓN LẺ                                         │ ← F ProductList
│ ┌──────────────────────────────────┐           │
│ │ [img] Bánh cuốn thịt  35.000đ [+]│           │
│ ├──────────────────────────────────┤           │
│ │ [img] Canh mọc        10.000đ [+]│           │
│ └──────────────────────────────────┘           │
├────────────────────────────────────────────────┤
│ Đơn của bạn (preview) + ghi chú đơn            │ ← I OrderSummary (shakes if canh missing)
├────────────────────────────────────────────────┤
│ 3 món · 105.000đ        [ Thanh toán ]         │ ← J CartBottomBar (fixed, dimmed if no canh)
├────────────────────────────────────────────────┤
│ [Menu][Đơn Hàng][Yêu Thích][Theo Dõi][Cài Đặt] │ ← ClientBottomNav (shell)
└────────────────────────────────────────────────┘
  Overlays: CartDrawer (slide-up cart editor) · TableConfirmModal (QR checkout confirm)
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| A Header | `features/menu/MenuHeader` | `useCartStore` (tableName) |
| Mini cart | `features/menu/MiniCartStrip` | `useCartStore` |
| Banner | `features/menu/RestaurantBanner` | static |
| Add-to-order banner | `features/menu/AddToOrderBanner` | `?add_to_order=` query param |
| B Search | `features/menu/SearchBar` | local state → products query (`search` param, min 2 chars) |
| C Tabs | `features/menu/CategoryTabs` | `GET /categories` (TanStack Query, 5 min stale) |
| D Favourites rail | `features/menu/FavouritesRail` | `useFavouritesStore` + `GET /products` + `GET /combos` |
| E Combos | `features/menu/ComboSection` | `GET /combos` enriched with `GET /products` (names/prices) |
| F Products | `features/menu/ProductList` | `GET /products?category_id&search&is_available=true` |
| I Order summary | `features/menu/OrderSummary` | `useCartStore` (items, note) |
| J Bottom bar | `features/menu/CartBottomBar` | `useCartStore` totals |
| Cart drawer | `features/menu/CartDrawer` | `useCartStore`; submits via `lib/order-payload.ts` |
| Confirm modal | `features/menu/TableConfirmModal` | `POST /orders` (source `qr`, no name/phone) |

## Key Interactions

- Tap product card → `/menu/product/:id`; tap combo card → `/menu/combo/:id`; `[+]` → add to cart.
- Tap MiniCartStrip → opens CartDrawer (edit quantities, remove items).
- **Thanh toán**: canh (soup) missing → blocked, OrderSummary shakes + toast "chọn số bát canh".
  Else: `tableId` set → TableConfirmModal (popup confirm only — no `/checkout`, no name/phone);
  no table → `router.push('/checkout')`.
- In `?add_to_order=` mode the cart POSTs items onto the existing order instead of creating one.
- Search ≥ 2 chars filters products; empty category → `EmptyState`.

## Business Logic Used

- Single order-payload builder (filling, combo overrides, canh split) → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (order payload, cart store)
- Canh-required rule + cart maths → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md)
- One active order per table (submit may redirect to existing order) → [../02_spec/BUSINESS_RULES.md §2.3](../02_spec/BUSINESS_RULES.md#23-one-active-order-per-table)
- Combo expansion on the created order → [../02_spec/BUSINESS_RULES.md §2.5](../02_spec/BUSINESS_RULES.md#25-combo-expansion)
