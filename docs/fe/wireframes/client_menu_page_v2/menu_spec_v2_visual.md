---
page: Menu (Ordering Experience) — VISUAL SHORT SPEC
route: /(shop)/menu/page.tsx
created: 2026-06-08
status: companion to menu_spec.md (canonical) — diagram-first summary
reads_with: ./menu_spec.md   # full as-built detail lives there
---

# Menu Page — v2 Visual Spec (the short one)

> **Read this to *understand* the page in 5 minutes.** For exact classes, props, line
> numbers and payloads → [menu_spec.md](./menu_spec.md) (canonical).
>
> **What the page is:** a mobile-first **catalog + cart builder**. Customer arrives by QR
> scan (or URL), browses combos / món lẻ, customizes (nhân, canh, note), places ONE order.
> It **creates** an order — it never reads order status back.

---

## 1 · Component Map

`page.tsx` is just a shell. `MenuContent` is the brain: it runs the 4 BE queries, holds
page state, and hands data down to dumb zone components. **Zones never talk to each other.**

```
MenuPage (page.tsx)                  ← <Suspense> shell only
└── MenuContent                      ← BRAIN: 4 queries + page state, composes all zones
    │
    ├─ MenuHeader ............ A      ❤ fav · ⚙ settings · 📋 đơn hàng · 🛒 cart
    ├─ MiniCartStrip ......... A'     item chips  (auto-hides when cart empty)
    ├─ RestaurantBanner ...... ─      hero image (404 → gradient)
    ├─ AddToOrderBanner ...... ─      only if ?add_to_order=<id>
    ├─ SearchBar ............. B      debounce 300ms
    ├─ CategoryTabs .......... C      Tất cả · Bánh Cuốn · Canh · Combo
    ├─ FavouritesRail ........ D      only when no category + favs>0
    │   └─ FavCard ×N
    ├─ ComboSection .......... E      only when no category + combos>0
    │   └─ ComboCard ×N              nhân pills + qty stepper
    ├─ ProductList ........... F      <main> content
    │   ├─ ProductCard ×N    (<sm)   mobile list   ─┐
    │   └─ ProductGridCard ×N (≥sm)  desktop grid   ┘→ ToppingModal
    ├─ OrderSummary .......... I      live preview (null when empty) + canh + note
    ├─ CartBottomBar ......... J      auto-hides when cart empty → onCheckout
    ├─ CartDrawer ............ modal  slide-in cart list
    └─ TableConfirmModal ..... modal  QR checkout → POST /orders  (the ONE write)
```

**The golden rule:** a card writes to a **store**; every component subscribed to that store
re-renders automatically. No zone-to-zone calls, no event bus, no context.

```
   ProductCard / ComboCard
            │ addItem()
            ▼
      ┌─────────────┐   set() re-renders ALL subscribers in one tick
      │ useCartStore│ ─────────────────────────────────────────────┐
      └─────────────┘                                               │
        │        │            │             │            │          │
        ▼        ▼            ▼             ▼            ▼          ▼
   OrderSummary MiniCartStrip CartBottomBar MenuHeader  CartDrawer (preview live)
```

---

## 2 · Shared Components (reuse before you build)

> Registry: [`../shared/_INDEX_SHARING_COMPONENT.md`](../shared/_INDEX_SHARING_COMPONENT.md)

```
ALREADY SHARED (used here)          OWNED here but reusable           SHOULD reuse (drift)
┌────────────────────────┐         ┌────────────────────────┐       ┌──────────────────────┐
│ Button   (ui atom)     │         │ ProductCard            │       │ QuantityStepper      │
│ EmptyState (shared)    │         │ ComboCard · CategoryTabs│       │  (custom -/+ steppers│
└────────────────────────┘         │ CartDrawer · ToppingModal│      │   duplicate it)      │
                                    └────────────────────────┘       │ Badge (for "Hết"/    │
                                                                     │  filling pills)      │
                                                                     └──────────────────────┘
```

⚠️ Menu feature components use **raw Tailwind**, no design-system atoms. Adopting
`QuantityStepper` + `Badge` would unify touch-targets + a11y.

---

## 3 · Loading Strategy

```
COLD VISIT (Pattern B = full client — no server HTML)

  blank ──► skeleton ──► content
            (animate-pulse)
            mobile  5× h-24
            tablet+ 8× aspect-square

  inside <main>, 3 mutually-exclusive branches:
  ┌──────────────────────────────────────────────┐
  │ isError  → "⚠ Kết nối mạng yếu" + [Thử lại]   │
  │ loading  → skeletons                           │
  │ empty    → <EmptyState>                         │
  │ else     → ComboSection + ProductList          │
  └──────────────────────────────────────────────┘
```

🚨 **DRIFT:** the shared index claims **Pattern A (ISR + RSC prefetch)** but the code is
**Pattern B (full client)** → every QR landing shows a loading flash. Fix = add an RSC shell
that `prefetchQuery` → `dehydrate` → `<HydrationBoundary>`, keep `MenuContent` as the client child.

---

## 4 · Local Data Management (in-page state)

Two layers only. **Global mutable → Zustand. Page-local UI → `useState` in `MenuContent`, props down.**

```
GLOBAL (Zustand, any zone subscribes directly)
┌────────────────┬──────────────────────────────────────────────┐
│ useCartStore   │ items · tableId · drinkConfig(canh) ·          │
│                │ orderNote · activeOrderId                       │
│ useFavourites  │ items (heart badge + Zone D rail)              │
│ useSettings    │ customerName · tableLabel (header subtitle)    │
└────────────────┴──────────────────────────────────────────────┘

PAGE-LOCAL (useState in MenuContent → passed by props)
┌────────────────┬──────────────────────┬───────────────────────┐
│ selectedCategory│ filter + D/E visibility│ Tabs, Combo, ProductList│
│ searchQuery    │ products query        │ SearchBar, ProductList │
│ cartOpen       │ CartDrawer open       │ Header, BottomBar      │
│ confirmOpen    │ TableConfirmModal open│ BottomBar, CartDrawer  │
│ hasOrders      │ "Đơn hàng" dot        │ MenuHeader             │
│ canhShakeKey   │ shake canh on block   │ OrderSummary           │
│ addToOrderId   │ ?add_to_order mode    │ Banner, CartDrawer     │
└────────────────┴──────────────────────┴───────────────────────┘
```

No RHF/Zod on this page — the only text input (note) writes straight to `useCartStore`.

### 4a · Inside `useCartStore` — the cart's local data (the most important store)

A product/combo is only ONE part of the store — it becomes a line in `items[]`.
Canh, table and note live in their OWN fields, NOT as cart items.

```
useCartStore  (store/cart.ts)
├── items: CartItem[] ........ the cart lines            ← cards write here
├── tableId / tableName ...... which table (QR scan)
├── activeOrderId ........... an in-progress order, if any
├── paymentMethod ........... chosen later at checkout
├── drinkConfig {bowls,vegBowls} ... canh count (separate from items!)
└── orderNote: string ....... free-text note to kitchen
```

### 4b · What a card GIVES to `addItem()` — one `CartItem`

Tap **+** → the card builds a full, self-describing `CartItem` and passes it in.
The card computes `id` and `price` ITSELF — the store does not.

```jsonc
{
  "id":         "product_<id>_<toppingKey>"  // or "combo_<id>_<filling>"  ← LINE IDENTITY
  "type":       "product" | "combo",
  "product_id": "uuid",          // products only
  "combo_id":   "uuid",          // combos only
  "name":       "Bánh Cuốn",
  "quantity":   1,
  "price":      4000,            // UNIT price = base + Σ selected toppings (pre-summed)
  "toppings":   [ {id,name,price} ],
  "combo_items":[ {product_id,product_name,quantity,unit_price} ]  // combos only
}
```

Two values the card decides BEFORE calling the store:
- **`id`** = the line's identity. Different toppings/nhân → different `id` → a SEPARATE line.
- **`price`** = unit price with toppings already added (`base + Σ topping.price`).

### 4c · What `addItem` DOES with it — dedup by `id` only (cart.ts:42-52)

The store is deliberately dumb: no pricing, no validation — just merge by `id`.

```
addItem(item):
   line with this exact id already exists?
   ├─ YES → bump it:  existing.quantity += item.quantity
   └─ NO  → append the whole item as a new line

  Tap + on "Bánh Cuốn nhân thịt"     → id product_X_thit   → NEW line, qty 1
  Tap + again (same)                 → same id              → qty 2
  Tap + on "Bánh Cuốn nhân mộc nhĩ"  → id product_X_mocnhi  → DIFFERENT line, qty 1
```

| Who | Does what |
|---|---|
| **the card** | builds the full `CartItem` — decides `id` (identity) + final unit `price` |
| **`addItem`** | only merges by `id` (existing → +qty · new → append) |
| **`total()` / `itemCount()`** | derived on READ (`Σ price×quantity`) — never stored |

⚠️ Because the store trusts whatever `id` the card gives it, two surfaces that build the `id`
differently (the `filling`-vs-topping issue, IMP-1) create DUPLICATE lines for the same dish.
⚠️ `items` is NOT persisted (see §5) — everything you add lives in memory until the order is placed.

---

## 5 · Cross-Page Data (what survives, what doesn't)

State split by **lifetime** across 3 stores + localStorage:

```
┌────────────┬──────────────────┬─────────────────────────────────────────┐
│ store      │ localStorage      │ persisted?                                │
├────────────┼──────────────────┼─────────────────────────────────────────┤
│ cart       │ cart-config-v3    │ PARTIAL → orderNote + activeOrderId only  │
│            │                   │ items / tableId / drinkConfig = MEMORY    │
│ settings   │ customer-settings │ FULL (name, tableLabel)                   │
│ favourites │ favourites        │ FULL                                      │
└────────────┴──────────────────┴─────────────────────────────────────────┘
```

⚠️ Why canh (`drinkConfig`) is NOT persisted: it only makes sense vs the current (non-persisted)
cart — migration v4 wipes any stale value so a previous order's canh count never resurfaces.

**Handoff Menu → Order (no shared route state — via localStorage cache):**

```
TableConfirmModal: POST /orders ✓
   │ GET /orders/:id
   ▼
localStorage["order_cache_<id>"] ──read──► /order/:id  page
   │
   └─ on next /menu mount: any order_cache_* key exists → "Đơn hàng" dot lights
```

Auth token = **Zustand memory only** (never localStorage) → checkout uses `router.replace`
(not full nav) so the token survives navigation.

---

## 6 · Backend — Load · Send · Receive · Errors

**Every call goes through ONE axios instance** (`lib/api-client.ts`) — never `fetch` directly.
It auto-attaches the token on the way out and auto-handles 401 on the way back.

```
            ┌──────────────────────── lib/api-client.ts (axios) ─────────────────────────┐
component → │ REQUEST interceptor:  add  Authorization: Bearer <token from useAuthStore> │ → BE
            │ RESPONSE interceptor: on 401 → refresh / redirect (see §6d)                │ ← BE
            └────────────────────────────────────────────────────────────────────────────┘
```

### 6a · LOADING (reads) — TanStack Query, 4× GET, staleTime 5min

```
       useQuery(queryKey, queryFn)                       queryFn = api.get(...).then(r => r.data.data)
┌──────────────────────────────────────┐                          └─ BE wraps payload in { data: ... }
│ ['categories']      always            │
│ ['products-all']    always (enrich)   │   enabled flag = WHEN it runs:
│ ['combos']          always            │     ['products', cat, q] only fires when q===0 OR q>=2
│ ['products',cat,q]  enabled q=0 or ≥2 │     (so a 1-char search makes NO network call)
└──────────────────────────────────────┘

  WHAT EACH QUERY DOES on every render:
  1st time / stale  → fetch → isLoading=true → skeletons     (cache empty or older than 5min)
  cached & fresh    → return cache instantly, no network      (<5min since last fetch)
  same key reused   → de-duped — one request shared by all subscribers

  combo_items from BE carry only product_id + quantity
        │ useMemo joins ['products-all']  →  resolves name + unit_price
        ▼  (⚠️ IMP-2: this join should live on the BE so the catalog isn't downloaded twice)
  enriched combos rendered by ComboSection
```

`refetch()` (returned by the products query) is what the error-state **[Thử lại]** button calls.

### 6b · SENDING (the one write) — `useMutation` → POST /orders

```
TableConfirmModal  → submitOrder.mutate()
        │ body assembled HERE (TableConfirmModal.tsx:19-27):
        ▼
  POST /orders {
     customer_name:'', customer_phone:'',          ← always empty (QR flow)
     note: <modal note>.trim() || null,
     table_id: cart.tableId,
     source: 'qr',
     items: buildOrderItemsPayload(cart.items, cart.drinkConfig)   ← lib/order-payload.ts
  }                                                  3 rules:
                                                     1. combo → combo_items overrides
                                                     2. filling thit/moc_nhi → topping_ids
                                                     3. canh → global rows from drinkConfig
                                                        (note: Có rau / Không rau)
```

> Invariant: OrderSummary preview == POST payload **exactly** — canh is excluded from line
> items then re-added from `drinkConfig` the same way the builder does. ONE builder feeds all
> 3 checkout paths (menu / checkout / add-to-order) so they can never drift.

### 6c · RECEIVING + error handling (mutation callbacks)

```
                         ┌─ onSuccess(data) ──────────────────────────────────────────┐
                         │  GET /orders/:id  → full order                              │
  POST /orders ──────────┤    └─ cache to localStorage["order_cache_<id>"]            │
                         │       (GET fails? cache the create response instead)        │
                         │  cart.clearCart()                                           │
                         │  router.replace('/order/:id')   ← replace keeps token alive │
                         └─────────────────────────────────────────────────────────────┘
                         ┌─ onError(err) ─────────────────────────────────────────────┐
                         │  read err.response.data.{error,message,details}            │
                         │  ├─ error === TABLE_HAS_ACTIVE_ORDER                        │
                         │  │     toast.info + router.replace('/order/<active_id>')    │
                         │  └─ anything else                                           │
                         │        toast.error(message ?? 'Đặt hàng thất bại')         │
                         └─────────────────────────────────────────────────────────────┘
```

Note the **nested try/catch** in onSuccess: even if the follow-up `GET /orders/:id` fails,
the order still succeeds — it just caches the leaner create-response so the flow never breaks.

### 6d · 401 / auth errors — handled globally, not per-page (api-client.ts:19-59)

The page never writes auth-error code; the response interceptor does it for everyone:

```
response 401 (not an /auth/* endpoint)
   │
   ├─ token.sub === 'guest'        → clearAuth → window.location = '/menu'   (guests can't log in)
   ├─ tableId set (QR context)     → refresh fails → '/menu'  (rescan QR)
   └─ normal user                  → POST /auth/refresh
                                       success → retry the original request once (_retry guard)
                                       fail    → clearAuth → '/login'
```

So on `/menu` a dropped/expired guest token quietly bounces back to `/menu` — the customer
just re-lands on the catalog instead of hitting a login wall.

### 6e · Three error surfaces — don't confuse them

| Where | Trigger | What the user sees |
|---|---|---|
| **Query error** (read) | products/categories/combos fetch fails | `<main>` → "⚠ Kết nối mạng yếu" + **[Thử lại]** (`refetch`) |
| **Mutation error** (write) | POST /orders fails | **toast** (info for active-order redirect, error otherwise) |
| **401 anywhere** | expired/invalid token | interceptor refresh or redirect — no in-page UI |

---

## 7 · Top Risks (full list → menu_spec.md §Concerns / §Improvement Strategy)

```
🚨 IMP-1  "Nhân" double-modeled: menu card uses `filling`, detail page uses topping
          → same dish = duplicate cart lines + inconsistent data to kitchen.
🚨 IMP-3  Pattern B on the QR landing page → loading flash every cold visit.
🚨 IMP-4  Toppings invisible in OrderSummary (item.toppings rendered nowhere).
🚨 IMP-5  ProductCard (<sm) hardcodes hasToppings=false → ToppingModal is dead code.
⚠️ IMP-2  products-all fetched only to enrich combos client-side (move to BE).
⚠️ IMP-6  orderNote persists but items don't → half-built cart wiped, orphan note survives.
```

---

*Short visual companion to the canonical [menu_spec.md](./menu_spec.md). Diagrams summarize;
the canonical file is the line-traced source of truth.*
