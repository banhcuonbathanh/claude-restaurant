# Customer Menu — `/menu`

> **TL;DR:** ✅ implemented · guest JWT (or open browse) · The core customer page: browse
> categories, combos and products, build a cart, and submit the order. With a table bound (QR
> path) checkout is a single confirm modal; without a table it routes to `/checkout`.
> 🔮 PLANNED: this same page is the entry for online ordering from home (customer account login).
> BE view (endpoints, auth, caching, errors) → [customer_menu_be.md](customer_menu_be.md)

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

- Single order-payload builder (filling, combo overrides, canh split) → [../../07_business_logic/LOGIC_FE.md](../../07_business_logic/LOGIC_FE.md) (order payload, cart store)
- Canh-required rule + cart maths → [../../07_business_logic/LOGIC_FE.md](../../07_business_logic/LOGIC_FE.md)
- One active order per table (submit may redirect to existing order) → [../../02_spec/BUSINESS_RULES.md §2.3](../../02_spec/BUSINESS_RULES.md#23-one-active-order-per-table)
- Combo expansion on the created order → [../../02_spec/BUSINESS_RULES.md §2.5](../../02_spec/BUSINESS_RULES.md#25-combo-expansion)

---

## Object Model — Menu Page (FE ⇄ BE ⇄ DB)

> Traced from source on branch `experience_claude.md_system_1` (NOT from docs).
> Sources: `fe/src/types/product.ts` · `fe/src/types/cart.ts` · `fe/src/app/(shop)/menu/page.tsx` ·
> `be/internal/handler/product_handler.go` · `be/internal/service/product_service.go` ·
> migrations 002/004 (via `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md`).
>
> **Scope:** the catalog objects this page READS (Category, Product, Topping, Combo) and the cart
> objects it WRITES from. The full order WRITE pipeline (CartItem → POST /orders → DB → response)
> lives in [../../02_spec/object/OBJECT_MODEL_ORDER.md](../../02_spec/object/OBJECT_MODEL_ORDER.md) — not duplicated here.

```
READ:   categories/products/toppings/combos (MySQL) → service Details structs (Go)
        → categoryJSON / productJSON / comboJSON (response) → Category / Product / ComboRaw (TS)
        → useMemo enrichment (ComboRaw + products) → Combo / ComboItem (TS, FE-only)
WRITE:  Product/Combo + ToppingModal/ComboModal selections → CartItem (Zustand)
        → buildOrderItemsPayload → POST /orders  … → see OBJECT_MODEL_ORDER.md
```

All Go service structs use plain `string` (DB NULL collapses to `""`) and `int64` prices
(DECIMAL(10,0) VND, no decimals). All IDs are CHAR(36) UUIDs → `string` on FE.

### §1 — Category

`GET /categories` · handler `ListCategories` (inline serializer) · cached 5 min on FE.

| Attribute | DB `categories` | BE→FE JSON | FE type `Category` |
|---|---|---|---|
| `id` | CHAR(36) PK UUID | `string` | `string` |
| `name` | VARCHAR(100) NOT NULL | `string` | `string` |
| `description` | TEXT NULL | `string` — NULL→`""` | — ⚠️ sent but untyped |
| `sort_order` | INT DEFAULT 0 | `number` | `number` |
| `is_active` | TINYINT(1) DEFAULT 1 | `boolean` | — ⚠️ sent but untyped |
| `created_at`/`updated_at`/`deleted_at` | DATETIME | — (not serialized) | — |

### §2 — Topping (embedded in Product)

No standalone fetch on this page — arrives nested in every product via `productJSON`.

| Attribute | DB `toppings` | BE→FE JSON (nested) | FE type `Topping` |
|---|---|---|---|
| `id` | CHAR(36) PK UUID | `string` | `string` |
| `name` | VARCHAR(100) NOT NULL | `string` | `string` |
| `price` | DECIMAL(10,0) DEFAULT 0 | `number` (int64) | `number` |
| `is_available` | TINYINT(1) DEFAULT 1 | `boolean` | `boolean` |

Product↔Topping link: junction `product_toppings (product_id, topping_id)` — never serialized;
BE resolves it into the nested `toppings` array.

### §3 — Product

> **Full Product shape (all layers) → single home [../../02_spec/object/OBJECT_MODEL_PRODUCT.md](../../02_spec/object/OBJECT_MODEL_PRODUCT.md)** (Rule #9). The matrix below is the menu-page fetch view; it mirrors the home — keep them in sync or trim to a pointer.

`GET /products` · handler `ListProducts` → service `ListProducts` → repo `ListProductsAvailable`
(only `is_available=1`, soft-deleted excluded) · serializer `productJSON` (`product_handler.go:443`).

| Attribute | DB `products` | BE service `ProductDetails` | BE→FE JSON | FE type `Product` |
|---|---|---|---|---|
| `id` | CHAR(36) PK UUID | `ID string` | `string` | `string` |
| `category_id` | CHAR(36) NOT NULL FK→categories RESTRICT | `CategoryID string` | `string` | `string` |
| `category_name` | — (join on categories.name) | `CategoryName string` | `string` | `string` |
| `name` | VARCHAR(150) NOT NULL | `Name string` | `string` | `string` |
| `description` | TEXT NULL | `Description string` | `string` — NULL→`""` ⚠️ | `string \| null` ⚠️ |
| `price` | DECIMAL(10,0) NOT NULL | `Price int64` | `number` | `number` |
| `image_path` | VARCHAR(500) NULL — object path, NOT full URL | `ImagePath string` | `string` — NULL→`""` ⚠️ | `string \| null` ⚠️ |
| `is_available` | TINYINT(1) DEFAULT 1 | `IsAvailable bool` | `boolean` | `boolean` |
| `sort_order` | INT DEFAULT 0 | `SortOrder int32` | `number` | `number` |
| toppings | via `product_toppings` junction | `Toppings []ToppingItem` | array of §2 objects | `Topping[]` |
| `created_at`/`updated_at`/`deleted_at` | DATETIME | — | — | — |

### §4 — Combo (two FE shapes: raw wire + enriched)

> **Full Combo shape (all layers) → single home [../../02_spec/object/OBJECT_MODEL_COMBO.md](../../02_spec/object/OBJECT_MODEL_COMBO.md)** (Rule #9). The matrix below is the menu-page fetch view; it mirrors the home — keep them in sync or trim to a pointer.

`GET /combos` · handler `ListCombos` (inline serializer) → service `ListCombos` (Redis-cached,
key `cacheKeyCombos`) → repo `ListCombosAvailable`.

| Attribute | DB `combos` | BE service `ComboDetails` | BE→FE JSON | FE wire `ComboRaw` | FE enriched `Combo` |
|---|---|---|---|---|---|
| `id` | CHAR(36) PK UUID | `ID string` | `string` | `string` | `string` |
| `category_id` | CHAR(36) NULL FK→categories SET NULL | `CategoryID string` | `string` — NULL→`""` ⚠️ | `string \| null` ⚠️ | `string \| null` |
| `name` | VARCHAR(150) NOT NULL | `Name string` | `string` | `string` | `string` |
| `description` | TEXT NULL | `Description string` | `string` — NULL→`""` ⚠️ | `string \| null` ⚠️ | `string \| null` |
| `price` | DECIMAL(10,0) NOT NULL | `Price int64` | `number` | `number` | `number` |
| `image_path` | VARCHAR(500) NULL — object path | `ImagePath string` | `string` — NULL→`""` ⚠️ | `string \| null` ⚠️ | `string \| null` |
| `is_available` | TINYINT(1) DEFAULT 1 | `IsAvailable bool` | `boolean` | `boolean` | `boolean` |
| `sort_order` | INT DEFAULT 0 | `SortOrder int32` | `number` | `number` | `number` |
| items | rows in `combo_items` | `Items []ComboItemDetails` | `combo_items: [{id, product_id, quantity}]` | `combo_items` (same) | `items: ComboItem[]` (enriched) |

`combo_items` per row — DB is a **static template**; at order time BE expands it into
`order_items` rows (header `unit_price`=0 + sub-items, see OBJECT_MODEL_ORDER §2.6):

| Attribute | DB `combo_items` | BE→FE JSON | FE `ComboRaw.combo_items[n]` | FE enriched `ComboItem` |
|---|---|---|---|---|
| `id` | CHAR(36) PK UUID | `string` | `string` | — (dropped) |
| `combo_id` | CHAR(36) FK→combos CASCADE | — (nested) | — | — |
| `product_id` | CHAR(36) FK→products RESTRICT | `string` | `string` | `string` |
| `product_name` | — | — | — | `string` — FE lookup in all-products map; falls back to raw id ⚠️ |
| `quantity` | INT DEFAULT 1 CHECK >0 | `number` | `number` | `number` |
| `unit_price?` | — | — | — | `number \| undefined` — FE lookup, display only |
| `toppings?` | — | — | — | `Topping[]` — FE lookup (TOP-3 enrichment) |

**Enrichment** happens in `menu/page.tsx:86-105` (`useMemo`): `ComboRaw.combo_items` is joined
against the unfiltered `GET /products` result (`products-all` query) to resolve names, prices and
available toppings. `ComboRaw` never reaches components — they receive `Combo` only.

### §5 — Cart objects (WRITE side — pointer only)

The page writes `Product`/`Combo` selections into `useCartStore` as `CartItem`
(`fe/src/types/cart.ts`) and submits via `buildOrderItemsPayload()` (`lib/order-payload.ts`).
Every attribute of `CartItem`, `ComboItemSummary`, the wire payload, BE DTOs, DB rows and the
read-back `Order`/`OrderItem` types is documented layer-by-layer in
[../../02_spec/object/OBJECT_MODEL_ORDER.md](../../02_spec/object/OBJECT_MODEL_ORDER.md) §1–§2 — one fact, one home.

Menu-page-specific cart facts only:

- `CartItem.id` is a cart-local dedup key, never sent to BE: `product_<id>_<toppingIds>` ·
  `combo_<id>` · `canh_<productId>_rau|plain`.
- The canh-required gate (`CartBottomBar` dim + `OrderSummary` shake) checks
  `items.some(i => i.id.startsWith('canh_'))` — it keys off this id convention, not a type field.
- `CartItem.price` already includes selected toppings — display only; BE re-snapshots
  name + unit_price server-side and never trusts client prices.

### §6 — Flags / Known Mismatches

| # | Mismatch | Detail |
|---|---|---|
| 1 | **Product filter params ignored by BE** | FE sends `GET /products?category_id&search&is_available=true` (`menu/page.tsx:65-77`, query key includes both params) but `ListProducts` in `product_handler.go` reads **no query params** (zero `c.Query` calls in the file) and `ProductList` does no client-side filtering either. On this branch, category tabs and search re-fetch the same unfiltered list. (`is_available` is harmless — service filters it anyway.) |
| 2 | **Null convention** | BE sends all nullable text columns (`description`, `image_path`, combo `category_id`) as `""`, never `null`; FE types declare `string \| null`, so `=== null` checks never match. Same as OBJECT_MODEL_ORDER flag 3. |
| 3 | **FE `Category` omits sent fields** | BE serializes `description` + `is_active` on categories; FE type drops them. Harmless today, but invisible if a tab ever needs them. |
| 4 | **Combo enrichment silently degrades** | If a combo references a product missing from the `products-all` result, `product_name` falls back to the raw UUID and `unit_price`/`toppings` are undefined (`menu/page.tsx:99-102`). No error path. |
