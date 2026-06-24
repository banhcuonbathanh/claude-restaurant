# Customer Menu — `/menu`

> ⚠️ **DESIGN UPDATE — this doc now reflects the NEW design described in
> [DESIGN_PROMPT.md](DESIGN_PROMPT.md). The FE code still has the OLD design; a code rebuild is
> pending. Sections that differ from the current code are marked with "⚠️ NEW DESIGN — code
> pending rebuild."**

> **TL;DR:** ✅ implemented · guest JWT (or open browse) · The core customer page: browse
> categories, combos and products, build a cart, and submit the order. With a table bound (QR
> path) checkout is a single confirm modal; without a table it routes to `/checkout`.
> 🔮 PLANNED: this same page is the entry for online ordering from home (customer account login).
> BE view (endpoints, auth, caching, errors) → [customer_menu_be.md](customer_menu_be.md)

---

## ASCII Wireframe

```
┌────────────────────────────────────────────────┐
│ [restaurant banner + dark gradient overlay]    │ ← A Header (photo banner)
│          Quán Bánh Cuốn  (Playfair serif)      │   ✅ NEW DESIGN — rebuilt (GAP-1)
│                                                │   No pill bar, no table label, no login here
├────────────────────────────────────────────────┤
│ 🔍 Tìm món nhanh...                            │ ← B SearchBar
│ [Tất cả][Suất][Trứng][Bánh Cuốn][Giò][Canh]   │ ← C CategoryTabs (sticky scroll-spy)
│ ♥ FavouritesRail ▸ ▸ ▸  (if ≥1 favourite)     │ ← D                ⚠️ NEW DESIGN — code pending rebuild
├────────────────────────────────────────────────┤
│ SUẤT                                           │ ← E ComboSection (always renders in scroll)
│ ┌──────────────────────────────────┐           │   ⚠️ NEW DESIGN — code pending rebuild
│ │ ♡ [img] Suất Đầy Đủ 30.000đ  – 0 +│         │
│ │         [Nhân thịt][Nhân mộc nhĩ]│           │   combo nhân: MULTI-select, both default-on
│ └──────────────────────────────────┘           │
│ TRỨNG · BÁNH CUỐN · GIÒ · CANH                │ ← F ProductList
│ ┌──────────────────────────────────┐           │
│ │ ♡ [img] Bánh Trứng Vàng  9.000đ – 0 +│      │
│ ├──────────────────────────────────┤           │
│ │ ♡ [img] Canh có rau       0 đ  – 0 +│       │
│ └──────────────────────────────────┘           │
├────────────────────────────────────────────────┤
│ Đơn của bạn  ◉ Bàn 04 (spinning ring)  ⌄      │ ← I OrderSummary                ⚠️ NEW DESIGN
│   ghi chú: Gia đình (mẹ + 2 người lớn + 2 trẻ)│   order note pre-filled — code pending rebuild
├────────────────────────────────────────────────┤
│                              [🛒 13]           │ ← J Floating cart pill (bottom-right)
│                           [Thanh toán]         │   ✅ NEW DESIGN — rebuilt (GAP-9-CHECKOUT)
│                                                │   No total shown; dims if canh missing
├────────────────────────────────────────────────┤
│ [Menu][Đơn Hàng][Yêu Thích][Theo Dõi][Cài Đặt] │ ← ClientBottomNav (shell)
└────────────────────────────────────────────────┘
  Overlays: CartDrawer (slide-up cart editor) · TableConfirmModal (QR checkout confirm)
```

### Per-Zone Detail — how each zone gets & shares its data

> The block above is the *layout*. The blocks below zoom into each zone to answer two questions:
> **(1) where does this zone's data come from?** and **(2) how does it stay in sync with the others
> without prop-drilling?** Full mechanism → [customer_menu_crosscomponent_dataflow.md](customer_menu_crosscomponent_dataflow.md);
> loading behaviour → [customer_menu_loading.md](customer_menu_loading.md).

**Legend (notation used in every block):**

```
◀── reads        zone renders FROM this source        [GET /x]   TanStack Query (server state)
──▶ writes       zone mutates this source             ⚡         in-memory Zustand singleton
(local)          component useState — never shared     ⏳ skel    has a loading skeleton
```

**The one rule behind all of it:** every cart-aware zone talks to the **same `useCartStore`
singleton** — never to another zone. Catalog zones read **TanStack Query** caches. "Is this modal
open?" stays in **local `useState`**. Three layers, one discipline.

```
                  ⚡ useCartStore (Zustand, 1 module singleton)         📦 TanStack Query caches
                  items[] · tableId · tableName · orderNote             ['categories']  (5m stale)
                  total() · itemCount()  ← selectors (derived)          ['products-all'](5m stale)
                        ▲ writes        reads ▲                         ['combos']      (5m stale)
                        │                     │                         ['products',cat,q] ⏳ skel
              ┌─────────┴───────┬─────────────┴─────────┐                     ▲
        taps ─┤ Combo/Product   │  Header/Mini/Summary/  │               reads│ (catalog)
              │ /Topping/Canh   │  BottomBar (render)    │            ┌────────┴─────────┐
              └─────────────────┴────────────────────────┘            │ Tabs/Combos/    │
                  no arrow ever goes zone → zone                       │ Products/Favs   │
```

---

**A · Header (photo banner)** — static visual; table label moved to OrderSummary header. ✅ NEW DESIGN — rebuilt (GAP-1, 2026-06-24): `MenuHeader.tsx` is now a `h-[196px]` `next/image` photo banner + gradient overlay + Playfair (`font-display`) title; login button + table label removed.

```
┌────────────────────────────────────────┐
│ [cover photo + dark gradient overlay]  │   static asset — no network, no store read
│    "Quán Bánh Cuốn" (Playfair serif)   │
└────────────────────────────────────────┘   No pill bar, no "Bàn XX" label, no login button.
                                             The "Bàn 04" table pill lives in the OrderSummary
                                             header (zone I), wrapped in a spinning orange ring.
                                             ◀── ⚡ useCartStore.tableName used only by zone I now.
```

**Mini · MiniCartStrip** — store *selectors*, sticky only when cart non-empty.

```
┌────────────────────────────────────────┐
│ 🛒 3 món · 105.000đ        [Xem giỏ →] │   ◀── ⚡ itemCount()  (Σ quantity)
└────────────────────────────────────────┘   ◀── ⚡ total()      (Σ price×qty)
   shows only if itemCount() > 0               [Xem giỏ →] ──▶ opens CartDrawer overlay
   ↑ same derived numbers as I and J — they can't drift (all recompute from items[])
```

**Banner · RestaurantBanner** — static asset, no data source.
**AddToOrderBanner** — renders only in **explicit** add-to-order mode; data is a URL param, not store/BE.

```
│ ▸ Đang thêm món vào đơn #123 [Xem đơn] │   ◀── (local) useSearchParams() ?add_to_order=<id>
                                              flips the whole page into "POST onto existing order"
```

**ActiveOrderRecoveryBanner** — renders when there is a persisted `activeOrderId` but NOT in explicit
add-to-order mode (`suppressed={!!addToOrderId}`). Lets the customer resume a live order after navigating
away (order → settings → menu) **without re-scanning the QR**. Self-validating + self-cleaning.

```
│ Đơn hàng #123 đang xử lý — thêm món? │   ◀── (store) useCartStore.activeOrderId
│              [Xem đơn]  [Thêm món]    │       GET /orders/:id revalidates (BE = source of truth)
                                              paid/cancelled/404 ⇒ setActiveOrderId(null) + hide (auto-clean)
                                              [Thêm món] ⇒ router.push(?add_to_order=<id>) → existing append flow
```

---

**B · SearchBar** — local input, lifted into the products query key.

```
┌────────────────────────────────────────┐
│ 🔍 Tìm món...                          │   ◀──▶ (local) useState searchQuery
└────────────────────────────────────────┘   feeds ──▶ ['products', cat, searchQuery]
   ≥2 chars → query runs · 1 char → query DISABLED (no refetch, no skeleton, old list stays)
```

**C · CategoryTabs** — sticky scroll-spy nav; tabs are navigation anchors, NOT filters. ⚠️ NEW DESIGN — code pending rebuild.

```
┌────────────────────────────────────────────────────────┐
│ [Tất cả][Suất][Trứng][Bánh Cuốn][Giò][Canh]           │   ◀── 📦 [GET /categories] (5m stale)
└────────────────────────────────────────────────────────┘       no skeleton → tabs pop when data lands
   Every section always renders — tapping a tab SCROLLS to that section anchor.
   Scrolling the page auto-highlights the tab for the section currently in view (IntersectionObserver).
   Active style: orange text + orange underline + soft orange text-glow.
   No selectedCategory filter; all sections render simultaneously.
   (Old behaviour: tab selection filtered which section showed — removed.)
```

**D · FavouritesRail** — joins a *client* fav-id list against two *server* caches. ⚠️ NEW DESIGN — code pending rebuild.

```
│ ♥ FavouritesRail ▸ ▸ ▸                 │   ◀── ⚡ useFavouritesStore  (the saved ids)
                                              ◀── 📦 ['products-all'] + ['combos']  (resolve ids→objects)
   renders whenever ≥1 favourite exists — no "only on Tất cả tab" condition.
   (Old behaviour: rail only visible on "Tất cả" tab — removed.)
   Degrades silently if a fav id isn't in the caches.
   Tapping a fav card opens that item's detail modal (not the cart).
```

---

**E · ComboSection** — reads BE (+enrichment), writes the cart. Always renders (scroll-spy section). ⚠️ NEW DESIGN — code pending rebuild.

```
┌──────────────────────────────────────────────────────────┐
│ SUẤT            (always rendered — scroll-spy section)    │   ◀── 📦 [GET /combos] (key ['combos'])
│ ┌────────────────────────────────────────────────────┐   │        enriched in useMemo with ['products-all']
│ │ ♡[img] Suất Đầy Đủ Trứng Chín  30.000đ  – 0 +   │   │
│ │         1 bánh trứng chín + 3 bánh cuốn + ...     │   │
│ │         [Nhân thịt ●][Nhân thịt mộc nhĩ ●] ──────┼───┼──▶ ⚡ addItem({type:'combo', ...nhân:both})
│ └────────────────────────────────────────────────────┘   │        (dedups by id → re-tap bumps quantity)
└──────────────────────────────────────────────────────────┘
   Combo cards now get the FULL product-card treatment:
   - Heart (favourite) toggle in corner of thumbnail.
   - Nhân pill group: MULTI-select ("Nhân thịt" / "Nhân thịt mộc nhĩ").
     Both selected by default (●); at least one must always stay selected.
     Selecting both = mixed suất (bánh cuốn/trứng split across the two nhân).
   - (Old behaviour: combo cards had no heart, no nhân pills — removed.)
   Card tap → /menu/combo/:id · hidden if combos.length===0.
   Enrichment resolves combo_items → product names/prices/toppings; missing product → raw UUID fallback.
```

**F · ProductList** — the *only* zone with a loading skeleton; reads BE, writes the cart.

```
┌──────────────────────────────────────┐
│ MÓN LẺ                                │   ◀── 📦 [GET /products?category_id&search] ⏳ skel
│ ┌──────────────────────────────────┐ │        key ['products', selectedCategory, searchQuery]
│ │ [img] Bánh cuốn thịt 35.000đ [+]─┼─┼──▶ opens ▢ ToppingModal → ⚡ addItem(product+toppings)
│ │ [img] Canh mọc       10.000đ [+]─┼─┼──▶ ⚡ setCanhQty(...) → standalone `canh_*` row
│ └──────────────────────────────────┘ │   card tap → /menu/product/:id
└──────────────────────────────────────┘   ⚠ on this branch BE ignores category_id/search params
   states: isError → "mạng yếu"+Thử lại · loading → skeleton · empty → EmptyState · else → grid
```

**▢ ToppingModal** (overlay opened from E/F) — open/closed is *local*; the picks land in the cart.

```
┌─ Chọn nhân ──────────────┐
│ ☑ nhân thịt   ☐ nhân mọc │   open flag ◀──▶ (local) useState   (never enters the store)
│            [ Thêm vào giỏ]│   confirm ──▶ ⚡ addItem(..., toppings:[{id,name,price:0}])
└──────────────────────────┘   "nhân" is modelled as a ₫0 topping — there is NO filling column
```

---

**I · OrderSummary** — store read + the canh-shake gate; owns the order note. ⚠️ NEW DESIGN — code pending rebuild.

```
┌──────────────────────────────────────────────────────┐
│ Tóm tắt đơn hàng  ◉ Bàn 04 (spinning orange ring) ⌄ │   ◀── ⚡ items[]   (live preview)
│                                                      │   ◀── ⚡ useCartStore.tableName → "Bàn 04" pill
│  COMBO                               Subtotal 80.000đ│        wrapped in slowly spinning orange light ring
│    Suất Đầy Đủ Trứng Chín  – 1 +  30.000đ  🗑       │        (animated conic gradient — ⚠️ NEW DESIGN)
│    Suất Giò                – 2 +  50.000đ  🗑       │
│  MÓN LẺ                              Subtotal 23.000đ│   Worked example (Bàn 04 family order):
│    Bánh Trứng Vàng         – 2 +  18.000đ  🗑       │     COMBO: 1× Suất Đầy Đủ Trứng Chín (30k)
│    Bánh Chay               – 2 +   5.000đ  🗑       │             2× Suất Giò (50k) → subtotal 80k
│    Canh có rau             – 4 +   0 đ    🗑       │     MÓN LẺ: 2× Bánh Trứng Vàng (18k)
│    Canh không rau          – 2 +   0 đ    🗑       │             2× Bánh Chay (5k)
│  Tổng cộng:                         103.000 đ        │             4× Canh có rau (0đ)
│                                                      │             2× Canh không rau (0đ) → subtotal 23k
│  GHI CHÚ: [Gia đình (mẹ + 2 người lớn + 2 trẻ)]    │     Total: 103.000 đ
└──────────────────────────────────────────────────────┘
   ◀──▶ ⚡ orderNote  (setOrderNote — persisted field)
   Pre-filled value: "Gia đình (mẹ + 2 người lớn + 2 trẻ)" — ⚠️ NEW DESIGN (was empty placeholder).
   No "Gọi thêm" badge anywhere in the order summary — ⚠️ NEW DESIGN (removed).
   gate: items.some(id startsWith 'canh_')===false → SHAKE 🔴
```

**J · Floating cart + checkout buttons** — two stacked pill buttons pinned bottom-right; appear only when cart is non-empty. ⚠️ NEW DESIGN — code pending rebuild.

```
                              ┌──────────┐
                              │ 🛒  13   │   ← cart pill: icon + round orange count badge
                              └──────────┘   ◀── ⚡ itemCount()  (badge = 13 for Bàn 04 example)
                              ┌──────────┐       tap → scrolls to OrderSummary
                              │Thanh toán│   ← orange pill; dims/disables when no canh
                              └──────────┘   ◀── ⚡ tableId: set → TableConfirmModal · null → /checkout
   Appears only when itemCount() > 0.
   NO total is shown on either button — ⚠️ NEW DESIGN.
   (Old behaviour: full-width bottom bar showing "n món · 105.000đ  [Thanh toán]" — removed.)
   Canh gate: soup missing → "Thanh toán" pill DIMMED (same logic as before, different component shape).
```

---

**Cart drawer** (overlay) — full cart editor; reads/writes store, drains it via the one builder.

```
┌─ Giỏ hàng ───────────────────────────┐
│ Bánh cuốn thịt   [–] 2 [+]   🗑       │   ◀── ⚡ items[]
│ Canh mọc         [–] 1 [+]   🗑       │   [±] ──▶ ⚡ updateQty / updateComboItem
│ Tổng: 105.000đ      [ Thanh toán ]   │   🗑  ──▶ ⚡ removeItem
└──────────────────────────────────────┘   submit ──▶ buildOrderItemsPayload(items) (one builder)
```

**TableConfirmModal** (overlay, QR path) — builds the payload from the store, fires the only POST.

```
┌─ Xác nhận đơn Bàn 03 ────────────────┐
│ 3 món · 105.000đ                      │   items ◀── ⚡ useCartStore
│        [Hủy]   [Xác nhận gọi món]    │   confirm ──▶ buildOrderItemsPayload() ──▶ POST /orders (source qr)
└──────────────────────────────────────┘   201 ⇒ clearCart() → setActiveOrderId(id) → router.replace('/order/<id>')
```

> `clearCart()` empties only the **draft** (`items` + `paymentMethod` + `orderNote`) and **keeps the
> identity** (`tableId` / `tableName` / `activeOrderId`) so the order stays recoverable after navigating
> away — this **overrides the old Invariant 5** (owner-approved). Right after, `setActiveOrderId(id)` points
> the cleared cart at the new order. Persistence (`partialize`) = `orderNote` + `activeOrderId` only; the
> pointer is cleared later on terminal status (`paid`/`cancelled`) by the `/order/:id` page. The order id
> also travels via URL + `order_cache_<id>` — see
> [customer_menu_crosspage_dataflow.md](customer_menu_crosspage_dataflow.md).

## Zones

| Zone | Component | Data source |
|---|---|---|
| A Header (photo banner) ✅ NEW (rebuilt GAP-1) | `features/menu/MenuHeader` | static asset (`/header-example.jpg` via `next/image`); no store/network read; table pill lives in zone I |
| Mini cart | `features/menu/MiniCartStrip` | `useCartStore` |
| Banner | `features/menu/RestaurantBanner` | static |
| Add-to-order banner | `features/menu/AddToOrderBanner` | `?add_to_order=` query param |
| Active-order recovery banner | `features/menu/ActiveOrderRecoveryBanner` | `useCartStore.activeOrderId` + `GET /orders/:id` (revalidate + self-clean); shown when no `?add_to_order=` |
| B Search | `features/menu/SearchBar` | local state → products query (`search` param, min 2 chars) |
| C Tabs ⚠️ NEW | `features/menu/CategoryTabs` | `GET /categories` (TanStack Query, 5 min stale); scroll-spy anchors, not filters |
| D Favourites rail ⚠️ NEW | `features/menu/FavouritesRail` | `useFavouritesStore` + `GET /products` + `GET /combos`; renders on ≥1 fav (no tab condition) |
| E Combos ⚠️ NEW | `features/menu/ComboSection` | `GET /combos` enriched with `GET /products`; cards now have heart + multi-select nhân pills |
| F Products | `features/menu/ProductList` | `GET /products?category_id&search&is_available=true` |
| I Order summary ⚠️ NEW | `features/menu/OrderSummary` | `useCartStore` (items, note); "Bàn 04" pill with spinning ring; note pre-filled; no "Gọi thêm" |
| J Floating pills ⚠️ NEW | `features/menu/CartBottomBar` | `useCartStore` itemCount(); two stacked pill buttons bottom-right, no total displayed |
| Cart drawer | `features/menu/CartDrawer` | `useCartStore`; submits via `lib/order-payload.ts` |
| Confirm modal | `features/menu/TableConfirmModal` | `POST /orders` (source `qr`, no name/phone) |

## Key Interactions

- Tap product card → `/menu/product/:id`; tap combo card → `/menu/combo/:id`; `[+]` → add to cart.
- Tap MiniCartStrip → opens CartDrawer (edit quantities, remove items).
- **Category tabs (scroll-spy)**: tapping a tab scrolls to the named section; scrolling auto-highlights the active tab. ⚠️ NEW DESIGN — code pending rebuild (old: tab filtered content).
- **Floating cart pill** (🛒 + badge): appears when cart is non-empty; tapping scrolls to OrderSummary (`id="order-summary"` anchor). ✅ Rebuilt (GAP-9-CHECKOUT) — `CartBottomBar.tsx` rewritten as 2 stacked pill buttons bottom-right; old full-width bottom bar with total removed.
- **"Thanh toán" pill**: canh (soup) missing → dimmed/disabled, OrderSummary shakes + toast "chọn số bát canh".
  Else: `tableId` set → TableConfirmModal (popup confirm only — no `/checkout`, no name/phone);
  no table → `router.push('/checkout')`. No total shown on the pill itself.
- In `?add_to_order=` mode the cart POSTs items onto the existing order instead of creating one.
- **Order recovery (no QR re-scan)**: after placing an order, `activeOrderId` survives `clearCart()` + navigation. On `/menu` the `ActiveOrderRecoveryBanner` revalidates it via `GET /orders/:id`; "Thêm món" bridges into `?add_to_order=` (append to the SAME order); a `paid`/`cancelled`/missing order auto-clears the pointer.
- Search ≥ 2 chars filters products; empty category → `EmptyState`.
- **Combo nhân (multi-select)**: both "Nhân thịt" and "Nhân thịt mộc nhĩ" selected by default; at least one must stay selected. ⚠️ NEW DESIGN — code pending rebuild.
- **"Gọi thêm" badge**: removed from the order summary. ⚠️ NEW DESIGN — code pending rebuild.

## Business Logic Used

- Single order-payload builder (filling, combo overrides, canh split) → [../../../07_business_logic/LOGIC_FE.md](../../../07_business_logic/LOGIC_FE.md) (order payload, cart store)
- Canh-required rule + cart maths → [../../../07_business_logic/LOGIC_FE.md](../../../07_business_logic/LOGIC_FE.md)
- One active order per table (submit may redirect to existing order) → [../../../02_spec/BUSINESS_RULES.md §2.3](../../../02_spec/BUSINESS_RULES.md#23-one-active-order-per-table)
- Combo expansion on the created order → [../../../02_spec/BUSINESS_RULES.md §2.5](../../../02_spec/BUSINESS_RULES.md#25-combo-expansion)

---

## Object Model — Menu Page (FE ⇄ BE ⇄ DB)

> Traced from source on branch `experience_claude.md_system_1_test_iphon2_change_code` (NOT from docs).
> Sources: `fe/src/types/product.ts` · `fe/src/types/cart.ts` · `fe/src/app/(shop)/menu/page.tsx` ·
> `be/internal/handler/product_handler.go` · `be/internal/service/product_service.go` ·
> migrations 002/004 (via `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md`).
>
> **Scope:** the catalog objects this page READS (Category, Product, Topping, Combo) and the cart
> objects it WRITES from. The full order WRITE pipeline (CartItem → POST /orders → DB → response)
> lives in [../../../02_spec/object/OBJECT_MODEL_ORDER.md](../../../02_spec/object/OBJECT_MODEL_ORDER.md) — not duplicated here.

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

> **Full Product shape (all layers) → single home [../../../02_spec/object/OBJECT_MODEL_PRODUCT.md](../../../02_spec/object/OBJECT_MODEL_PRODUCT.md)** (Rule #9). The matrix below is the menu-page fetch view; it mirrors the home — keep them in sync or trim to a pointer.

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

> **Full Combo shape (all layers) → single home [../../../02_spec/object/OBJECT_MODEL_COMBO.md](../../../02_spec/object/OBJECT_MODEL_COMBO.md)** (Rule #9). The matrix below is the menu-page fetch view; it mirrors the home — keep them in sync or trim to a pointer.

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
[../../../02_spec/object/OBJECT_MODEL_ORDER.md](../../../02_spec/object/OBJECT_MODEL_ORDER.md) §1–§2 — one fact, one home.

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
