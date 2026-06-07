# Menu Page — Status Routing Reference

> **⚠️ This page has NO entity-status routing.** `/menu` is a **catalog + cart builder** — it
> never reads an order / table / payment `status` and never renders status into a zone. There is
> no status × zone matrix to build (confirmed by tracker row C1 = `N/A`).
>
> This file documents what the page *does* instead: what it renders live, its zones, exactly
> what it **fetches from BE**, exactly what it **sends to BE**, and how it shares data across
> pages. Every cell is traced to code as of 2026-06-07.
> Source page: `fe/src/app/(shop)/menu/page.tsx`.

---

## Live Page Snapshot (http://localhost:3000/menu, 2026-06-07)

What actually renders right now (empty cart):

- **Header:** "Quán Bánh Cuốn" + table label slot · icons: Yêu thích · Cài đặt · Đơn hàng · Giỏ hàng
- **Banner:** "Bánh cuốn tươi — ngon mỗi ngày" (image 404 → gradient fallback)
- **Category tabs:** Tất cả · Bánh Cuốn · Canh · Suất / Combo
- **Combo section (5):**
  | Combo | Price | Items |
  |---|---|---|
  | Suất Đầy Đủ Trứng Chín | 30.000 ₫ | ×1 Bánh Trứng Chín · ×1 Giò · ×3 Bánh Cuốn · ×1 Canh |
  | Suất Đầy Đủ Trứng Tái | 30.000 ₫ | ×1 Bánh Trứng Tái · ×1 Giò · ×3 Bánh Cuốn · ×1 Canh |
  | Suất Giò | 21.000 ₫ | ×1 Giò · ×3 Bánh Cuốn · ×1 Canh |
  | Suất Trứng Bánh Không | 21.000 ₫ | ×1 Bánh Trứng Vàng · ×3 Bánh Cuốn · ×1 Canh |
  | Bánh Chay | 12.000 ₫ | ×3 Bánh Cuốn · ×1 Canh |
- **Món lẻ section (6):** Canh (**0 ₫**) · Giò (9.000 ₫) · Bánh Trứng Tái (9.000 ₫) · Bánh Trứng Chín (9.000 ₫) · Bánh Trứng Vàng (9.000 ₫) · Bánh Cuốn (4.000 ₫)
- Every combo & product card has **Nhân thịt / Nhân mộc nhĩ** filling toggles + qty stepper.
- **Cart drawer:** empty → "Giỏ hàng trống", Thanh toán disabled.
- **Tóm tắt đơn hàng (OrderSummary):** not shown — it returns `null` while the cart is empty.

---

## Page Layout

| Zone | Component | Title (verbatim) | When visible |
|---|---|---|---|
| A | `<header>` | Quán Bánh Cuốn | Always (sticky) |
| — | Mini cart strip | — | Only when `itemCount() > 0` |
| — | Banner `<img>` | Bánh cuốn tươi — ngon mỗi ngày | Always (gradient fallback on 404) |
| — | Add-to-order banner | Chọn món để thêm vào đơn hàng hiện tại | Only when `?add_to_order=<id>` in URL |
| B | `SearchBar` | — | Always |
| C | `CategoryTabs` | — | Always |
| D | `FavouritesRail` | — | Only when `selectedCategory === null && favItems.length > 0` |
| E | `ComboCard` list | Combo | Only when `selectedCategory === null && combos.length > 0` |
| F | `ProductCard` / `ProductGridCard` | Món lẻ | When `products.length > 0` (heading only if combos shown) |
| I | `OrderSummary` | Tóm tắt đơn hàng | Only when cart has items (`items.length > 0` → else returns `null`) |
| J | CartBottomBar | Thanh toán | Only when `itemCount() > 0` |
| modal | `CartDrawer` | Giỏ hàng | On cart icon / mini-strip click |
| modal | `TableConfirmModal` | Xác nhận đặt hàng | On Thanh toán when `tableId` is set (QR flow) |

> Content area also has 3 mutually-exclusive states before E/F render: `isError` → "Kết nối mạng yếu" + retry · `isLoading` → skeletons · empty → `EmptyState`.

---

## Why There Is No Status Matrix

| Concept | What this page does | Status routing? |
|---|---|---|
| Products | filtered by `is_available=true` (catalog availability flag) | ❌ flag, not a status flow |
| Orders | **creates** one via `POST /orders`; never reads order `status` back | ❌ write-only |
| Tables | reads `tableId`/`tableName` from cart store (set by QR scan elsewhere) | ❌ no `tables.status` read |
| Payment | not touched on this page | ❌ |

The only status-shaped value handled is the `TABLE_HAS_ACTIVE_ORDER` **error code** on order create → redirect. That is error handling, not status rendering.

---

## What Information Comes FROM BE (reads) — TanStack Query → `GET`

Four queries in page.tsx:144-175. All go through `lib/api-client.ts` (axios) → `GET /api/v1/...`.

| # | Query key | Endpoint | staleTime | Gating |
|---|---|---|---|---|
| 1 | `['categories']` | `GET /categories` | 5 min | always |
| 2 | `['products-all']` | `GET /products` | 5 min | always |
| 3 | `['products', cat, search]` | `GET /products?category_id=&search=&is_available=true` | 5 min | `enabled` only when search len `=== 0` or `>= 2` |
| 4 | `['combos']` | `GET /combos` | 5 min | always |

**Exact fields received** (from `fe/src/types/product.ts`):

- **Category** → `id` · `name` · `sort_order`
- **Product** → `id` · `category_id` · `category_name` · `name` · `description` · `price` · `image_path` · `is_available` · `sort_order` · `toppings[]` (each: `id` · `name` · `price` · `is_available`)
- **ComboRaw** (from `/combos`) → `id` · `category_id` · `name` · `description` · `price` · `image_path` · `sort_order` · `is_available` · `combo_items[]` (each: `id` · `product_id` · `quantity` — **no name, no price**)

**Client-side enrichment** (page.tsx:178-196): raw `combo_items` carry only `product_id`+`quantity`, so a `useMemo` joins them against `products-all` to resolve `product_name` + `unit_price` → the enriched `Combo.items[]`. This is why `products-all` (query #2) is fetched even though it isn't rendered directly.

---

## What Information Is SENT TO BE (write) — the only mutation

`TableConfirmModal` → `useMutation` → `POST /orders` (page.tsx:32-71). This is the **only** request this page sends.

**Request body** (page.tsx:34-41):

```jsonc
POST /orders
{
  "customer_name":  "",            // always empty from menu (QR flow)
  "customer_phone": "",            // always empty from menu (QR flow)
  "note":           "<orderNote>", // free text or null
  "table_id":       "<tableId>",   // from cart store (QR scan)
  "source":         "qr",
  "items":          [ /* OrderItemPayload[] — see below */ ]
}
```

**Each `items[]` entry** = `OrderItemPayload` (built by `lib/order-payload.ts`):

```jsonc
{
  "product_id":  "uuid | null",   // null for combos
  "combo_id":    "uuid | null",   // null for standalone products
  "quantity":    1,
  "topping_ids": ["uuid", ...],
  "note":        "Có rau | Không rau",   // canh rows only
  "filling":     "thit | moc_nhi | ''",  // products & combo sub-items
  "combo_items": [ { "product_id": "uuid", "quantity": 1, "filling": "thit" } ]  // combo overrides
}
```

**`buildOrderItemsPayload` — the 3 rules (single source of truth for ALL checkout paths):**
1. **Combo** → emitted with `combo_items` overrides (per-dish qty + the combo's `filling`); canh dishes stripped out of the combo.
2. **Filling** (`thit`/`moc_nhi`) → carried on standalone products and combo sub-items.
3. **Canh** → global, driven by the CANH stepper (`drinkConfig`), split into `note:'Có rau'` / `note:'Không rau'` rows referencing the resolved canh `product_id`; **never** inside a combo.

**Response handling:**

| Outcome | Action | Code |
|---|---|---|
| Success | `GET /orders/:id` → cache to `localStorage["order_cache_<id>"]` → `clearCart()` → `router.replace('/order/:id')` | page.tsx:44-59 |
| `TABLE_HAS_ACTIVE_ORDER` | toast "Bàn này đang có đơn chưa hoàn tất…" + `router.replace('/order/<active_order_id>')` | page.tsx:62-67 |
| other error | `toast.error(message ?? 'Đặt hàng thất bại')` | page.tsx:69 |

**Checkout branch** (CartBottomBar, page.tsx:418-425): `drinkConfig.bowls === 0` → block + shake Canh + toast; else `tableId` set → open `TableConfirmModal`; no `tableId` → `router.push('/checkout')` (online flow collects name/phone there).

---

## Tóm tắt đơn hàng (Zone I — OrderSummary) — full breakdown

Component `features/menu/components/OrderSummary.tsx`. **100% client-side**: reads the cart store, sends nothing to BE. Returns `null` when cart empty (line 45) — that's why it's invisible on the live empty page.

Header shows "Tóm tắt đơn hàng" + the `tableName` chip when a table is set. Five collapsible blocks, all derived live from `useCartStore`:

| Block | Shows | Source |
|---|---|---|
| **COMBO / MÓN LẺ groups** | each cart line · qty stepper · delete · combo expand → editable sub-items · per-line subtotal | `items` split by `type` (lines 47-48) |
| **Tổng cộng** | grand total | `total()` = Σ `price × quantity` (cart.ts:90) |
| **Canh** | Bát có rau / Bát không rau steppers; amber warning + running-border when `bowls === 0` | `drinkConfig` (lines 144-188) |
| **Tổng số món** | table: Món · Nhân · SL · Đơn giá · Thành tiền · per-type rows + grand total | derived `dishSummary` (lines 67-91) |
| **Ghi chú** | free-text note → writes `orderNote`; debounced "Đã lưu ✓" after 800ms | lines 240-257 |

**Non-obvious rules (all traced):**
- **Canh excluded** from "Tổng số món" aggregation (name contains "canh"/"nước dùng", lines 72 & 78) and re-added from `drinkConfig` split có rau / không rau (lines 87-89) — so the preview matches the POST payload **exactly**.
- **Aggregation key = `name|filling`** (lines 73, 79) → "Bánh Cuốn nhân thịt" and "nhân mộc nhĩ" count as separate rows.
- **Đơn giá** comes from `productPriceMap` (built from product lines + combo sub-item `unit_price`); rows with no known price show `—` (this is why the 0₫ Canh shows blank pricing).
- **Combo sub-item qty edit** → `updateComboItem` recomputes the combo's price by `unit_price × delta` (cart.ts:64-79).
- **Filling badge** per line: `thit` → "Nhân thịt", `moc_nhi` → "Nhân mộc nhĩ" (lines 317-321).
- `shakeKey` prop scrolls to + shakes the Canh block when checkout is blocked (lines 17-27).

---

## How It Manages Data CROSS-PAGE

State is split by lifetime across **3 Zustand stores + localStorage**:

| Store | localStorage key | Persisted | Carries across pages | File |
|---|---|---|---|---|
| cart | `cart-config-v3` | **partial** — `orderNote` + `activeOrderId` only | items / tableId / drinkConfig live in memory | `store/cart.ts` |
| settings | `customer-settings` | full | `customerName`, `tableLabel` (header subtitle) | `store/settings.ts` |
| favourites | `favourites` | full | heart badge + Zone D rail | `store/favourites.ts` |

**Critical nuance — cart `partialize` (cart.ts:114):** `items`, `tableId`, `drinkConfig` are deliberately **NOT** persisted. `drinkConfig` (canh count) only makes sense relative to the current (non-persisted) cart, so it resets to 0 on reload instead of resurfacing a stale order's value (migration v4 deletes any old persisted value, cart.ts:105-108).

**Handoffs:**
- **Menu → Order:** after POST, the full order is fetched and written to `localStorage["order_cache_<id>"]` (page.tsx:51); `/order/:id` reads that cache. The header "Đơn hàng" dot lights when any `order_cache_` key exists (page.tsx:132-135).
- **Auth token = Zustand memory only** (never localStorage). `router.replace` (not full nav) is used precisely to keep the token alive across navigation (page.tsx:57).
- **Axios interceptors** (`lib/api-client.ts`): request injects `Bearer` token; 401 → auto-refresh, **but** guests (`sub==='guest'`) and QR contexts (`tableId` set) skip refresh and bounce to `/menu` instead of `/login` (lines 28-49).

**End-to-end loop:** TanStack Query reads catalog (cached 5 min) → user builds cart in Zustand (memory) → OrderSummary previews it live → `buildOrderItemsPayload` serializes it once → `POST /orders` → fetched-back order cached in localStorage → `router.replace('/order/:id')`. No order/table/payment **status** is ever read here.

---

## Concerns (from live check, 2026-06-07)

1. **`restaurant-banner.jpg` → 404** (page.tsx:289) — falls back to gradient (works as designed). Add the asset to `fe/public/` if a real photo was intended.
2. **Canh product price = `0 ₫`** in catalog — confirm intentional (free/included). It surfaces as `—` in the "Tổng số món" Đơn giá column and is easy to miss.

### Topping recording — selection vs. "Tóm tắt đơn hàng" (verified 2026-06-07)

> **Data-model mismatch:** in the DB seed (`scripts/seed_real_menu.sql`) "Nhân thịt"/"Nhân mộc nhĩ"
> are **toppings** (`bbbbbbbb-…0001/0002`, price 0) linked to every bánh, and "Rau mùi tàu" is a
> **topping** for Canh (`…0003`). But the FE invents a separate `filling` field (thit/moc_nhi) and
> a separate `drinkConfig` veg/noveg note for rau. So the same concept is modeled two ways.

3. **🚨 Toppings unselectable from the menu list.** `ProductCard.tsx:24` hardcodes `hasToppings = false`,
   so the topping hint never shows and `ToppingModal` (fully built) is dead code on `/menu`. The "+"
   always adds `toppings: []`. Toppings can only be chosen on the product **detail** page (`ToppingSelector`).
4. **🚨 Toppings never rendered in "Tóm tắt đơn hàng".** `OrderSummary` shows name + `filling` badge + qty
   only; `item.toppings` is read nowhere. "Tổng số món" keys rows by `name|filling` (OrderSummary.tsx:73,79).
   Price *includes* topping cost so totals are right, but the customer cannot see *which* toppings.
   Toppings still reach BE via `topping_ids` (order-payload.ts:60). **Active** — every bánh has nhân
   toppings in seed, and the detail page's `ToppingSelector` renders them.
5. **⚠️ Two add paths disagree.** Menu card → `filling:'thit'`, `toppings:[]`, cart-id `product_<id>_<filling>`.
   Detail page → `toppings:[Nhân thịt]`, **no `filling`**, cart-id `product_<id>_<toppingKey|'plain'>`.
   Same product added from the two surfaces yields different cart lines + different metadata, and
   "nhân" is recorded as a topping in one and as `filling` in the other.
