# DEV_PLAN — Menu Page Reference Build

> Drawn **before** any code was written. This is the developer's picture of the page —
> what I commit to building, in what order, and how data moves.
> Compare with the owner's wireframe (`client_menu_page_v2`): §4 explains how the two
> drawings differ and why both are needed.

---

## 1 · The page as I will build it (390px, top → bottom)

Every box is ONE component file. `[s]` = sticky, `[f]` = fixed, `(cond)` = self-guards / conditional.

```
┌─────────────────────────────────────────────┐
│ A  MenuHeader                    [s] top-0  │  Quán Bánh Cuốn · tableLabel
│    ─ no icons, no dot ─    [Đăng nhập/xuất] │  z-20
├─────────────────────────────────────────────┤
│ A' MiniCartStrip (cart>0)   [s] top-[57px]  │  (3 món) chip chip chip · 42.000 ₫
├─────────────────────────────────────────────┤  z-10
│    RestaurantBanner  h-44                   │  img → 404? gradient fallback
│    "Bánh cuốn tươi — ngon mỗi ngày"         │
├─────────────────────────────────────────────┤
│    AddToOrderBanner (?add_to_order)         │  ⊕ Chọn món để thêm… · Xem đơn
├─────────────────────────────────────────────┤
│ B  SearchBar                [s] top-[52px]  │  🔍 debounce 300ms · ✕ clear
├─────────────────────────────────────────────┤
│ C  CategoryTabs            [s] top-[108px]  │  Tất cả|Bánh Cuốn|Canh|Combo
├─────────────────────────────────────────────┤
│ D  FavouritesRail (no cat ∧ favs>0)         │  YÊU THÍCH → [FavCard][FavCard]→
├─────────────────────────────────────────────┤
│ <main>  3 exclusive states first:           │
│   isError → ⚠ Kết nối mạng yếu [Thử lại]    │
│   loading → skeletons (5×h-24 / 8×square)   │
│   empty   → <EmptyState>                    │
│ ─────────────────────────────────────────── │
│ E  ComboSection (no cat ∧ combos>0)         │  COMBO
│    ┌──────────────────────────────────┐     │
│    │ ComboCard  [img][×1 Giò    ] 30k │     │  nhân pills: (Nhân thịt)(mộc nhĩ)
│    │  ❤        [×3 Bánh Cuốn]  − 0 + │     │  → ComboModal (Thêm combo vào giỏ)
│    └──────────────────────────────────┘     │
│ F  ProductList                              │  MÓN LẺ
│    <sm  ProductCard (1-col, h-list)         │  nhân pills INLINE — no modal
│    ≥sm  ProductGridCard (2→3→4 col grid)    │  cart id: product_<id>_<toppingId|plain>
│ ─────────────────────────────────────────── │
│ I  OrderSummary (cart>0)                    │  Tóm tắt đơn hàng ▾ · [Bàn 2]
│      COMBO group    − qty + 🗑  price       │   └ Xem chi tiết → sub-item edit
│      MÓN LẺ group   − qty + 🗑  price       │     (updateComboItem re-prices)
│      Tổng cộng ────────────────── 42.000 ₫  │
│      CANH  ⚠ running-border khi 0 bát       │   ← shakeKey scroll+shake target
│        Bát có rau    − 0 +                  │   steppers → setCanhQty → CartItems
│        Bát không rau − 0 +                  │     canh_<id>_rau / canh_<id>_plain
│      Tổng số món ▾ (Món·Nhân·SL·giá·tiền)   │   preview == POST payload, exactly
│      Ghi chú [textarea]      ✓ Đã lưu       │   debounce 800ms → orderNote (persisted)
│                                  pb-40      │
├─────────────────────────────────────────────┤
│ J  CartBottomBar (cart>0) [f] bottom-6 z-30 │  (3) Thanh toán · 42.000 ₫
│    dimmed (opacity-60) while canh==0;       │  tap still fires → toast + shake
└─────────────────────────────────────────────┘
  modals (z-50):
  · CartDrawer        ← slide-in right; CTA "Thanh toán" / "Thêm vào đơn hàng"
  · TableConfirmModal ← THE one write: POST /orders → {id, table_busy}
```

---

## 2 · Build order (dependency-sorted — each step compiles against the previous)

```
 ①  types/product.ts · types/cart.ts            ← contracts first
 ②  lib/storage-keys.ts · lib/order-payload.ts  ← cross-page invariants
 ③  store/cart.ts → favourites.ts → settings.ts ← state homes (cart is the heart)
 ④  leaf zones:    SearchBar · CategoryTabs · RestaurantBanner · MiniCartStrip
                   · AddToOrderBanner · CartBottomBar
 ⑤  catalog cards: ProductCard · ProductGridCard · ComboCard+ComboModal
                   · ProductList · ComboSection · FavouritesRail
 ⑥  cart views:    OrderSummary · CartDrawer
 ⑦  checkout:      TableConfirmModal
 ⑧  page.tsx       ← MenuContent brain last: 4 queries + 6 useState + composition
 ⑨  BE slice:      repo → service → handler (catalog GETs, then POST/GET orders)
```

Why this order: a card cannot be written before the `CartItem` identity rules exist
(`id` = line identity, unit `price` pre-summed); OrderSummary cannot be written before
the cards define what they put in the store; the page brain is pure composition.

---

## 3 · Data flow I commit to (the golden rule)

**Zones never talk to each other.** A card writes to a store; subscribers re-render.

```
                       4× useQuery (staleTime 5min)
   ┌───────────────────────────────────────────────────────┐
   │ ['categories']  ['products-all']  ['combos']          │
   │ ['products', cat, q]   (enabled: q==0 ∨ q≥2)          │
   └────────────┬──────────────────────────────────────────┘
                ▼ enrich combos (useMemo join — IMP-2 acknowledged)
        MenuContent ──props──► dumb zone components
                                    │ addItem / updateQty / setCanhQty / setOrderNote
                                    ▼
                              useCartStore ──► OrderSummary · MiniCartStrip
                                    │          CartBottomBar · CartDrawer  (same tick)
                       checkout gate│ canhMissing = !items.some(id startsWith 'canh_')
                                    ▼
              TableConfirmModal: POST /orders (buildOrderItemsPayload — the ONE builder)
                                    │ { id, table_busy }
                                    ▼
              GET /orders/:id → localStorage[order_cache_<id>] → router.replace('/order/:id')
```

---

## 4 · How my drawing differs from yours (and why we need both)

Your wireframe (`menu_ver3_ux.excalidraw` + zone specs) draws **what the customer sees** —
boxes, labels, pixel positions. My dev plan above draws **what the code must guarantee**.
Same page, four differences in viewpoint:

| # | Your wireframe shows | My dev plan adds | Why it matters |
|---|---|---|---|
| 1 | Zones as pictures | **One component file per box** + its self-guard condition (`cart>0`, `no cat ∧ favs>0`) | a zone that "isn't there" is a `return null`, not a missing drawing |
| 2 | A static layout | **The sticky/z-index stack** (`top-0 z-20 → top-[57px] z-10 → bottom-6 z-30 → modals z-50`) | this is what breaks first on real devices; invisible in a flat mockup |
| 3 | One happy-path screen | **3 mutually-exclusive `<main>` states** (error / loading / empty) drawn as first-class rows | every fetch needs all 3 states (LOADING_PATTERNS rule) — wireframes habitually skip them |
| 4 | Buttons | **Arrows = store writes** (`addItem`, `setCanhQty`) and the checkout gate | the wireframe can't show that preview == payload, the page's core invariant |

**Suggested rule for `NEW_PAGE_GUIDE.md`:** between Phase 1 (Wireframe) and Phase 3 (Build),
the developer redraws the wireframe as a DEV_PLAN like this one — zones → files, conditions,
sticky stack, store arrows, build order — and the owner approves the *differences* before
any code. That redraw is where misunderstandings surface (this build found 4 — see
`DIFF_VS_CURRENT.md`).
