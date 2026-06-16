# Staff POS — `/pos` · Loading States

> **TL;DR:** ✅ implemented · how `/pos` behaves while data is in flight. Two effective layers:
> (1) **no route-level spinner** — there is no `loading.tsx` anywhere in the `(dashboard)` route
> group or the `pos/` sub-folder; (2) **two silent `useQuery` hooks** that default to `[]` and
> render nothing special while fetching; no skeleton, no per-query spinner, no error-retry UI.
> The only visible "loading" feedback is the **`createOrder.isPending` button label** ("Đang tạo...")
> during order submission.
> Page overview → [staff_pos.md](staff_pos.md) · BE view → [staff_pos_be.md](staff_pos_be.md)

> Traced from source on branch `experience_claude.md_system_1` (NOT from docs).
> Sources: `fe/src/app/(dashboard)/pos/page.tsx` · `fe/src/features/menu/components/CategoryTabs.tsx`.

---

## Loading Layers (outer → inner)

```
1. Route navigation  → NO spinner — (dashboard)/loading.tsx does NOT exist
2. POS page mounts   → NO <Suspense> boundary
3. POSContent runs   → 2 useQuery hooks fire; NEITHER drives a skeleton or spinner
4. "Tạo Đơn" button → createOrder.isPending: button label → "Đang tạo...", button disabled
```

### 1 — Route-level spinner · `(dashboard)/loading.tsx`

**Does not exist.** `ls fe/src/app/(dashboard)/` shows only `admin/`, `cashier/`, `kds/`,
`layout.tsx`, `orders/`, `pos/`, and a root `page.tsx`. There is no `loading.tsx` file at the
dashboard group level and no `pos/loading.tsx` inside the pos sub-folder. Navigation into `/pos`
(e.g. from the login redirect or a sidebar link) shows **no route-level spinner** — the browser
displays a blank shell until the page JS hydrates.

Contrast: the customer `(shop)/` group does have a `loading.tsx` (orange spinner). The staff
`(dashboard)/` group currently has no equivalent.

### 2 — Suspense boundary

**None.** `POSPage` wraps `POSContent` in `<AuthGuard>` + `<RoleGuard>` (`pos/page.tsx:24-30`), not
in a `<Suspense>`. There is no `useSearchParams` or any other hook that would require one.

### 3 — Per-query states · `pos/page.tsx:39-51`

The page fires two `useQuery` calls. **Neither** destructures `isLoading` or `isError`.

| Query | `queryKey` | Default | Loading UI | Notes |
|---|---|---|---|---|
| Categories | `['categories']` | `[]` (`pos/page.tsx:39`) | **none** | `CategoryTabs` renders only "Tất cả" tab until data arrives (`CategoryTabs.tsx:14-23`) |
| Products | `['products', selectedCategory]` | `[]` (`pos/page.tsx:45`) | **none** | Product grid renders an **empty `<div className="grid…">`** — zero cells, no pulse placeholder |

Both queries share the same `staleTime: 5 * 60 * 1000` (`pos/page.tsx:42,50`). On a revisit within
5 minutes, TanStack returns cached data immediately — no loading window at all.

On a cold load the grid is momentarily empty. There is **no skeleton, no spinner, and no error state**
— the queries fall through silently to `[]` on any failure (see `pos/page.tsx:41` `.then(r => r.data?.data ?? r.data ?? [])`;
same on line `49`).

### 4 — Mutation pending state · `pos/page.tsx:206-211`

The `createOrder` `useMutation` (`pos/page.tsx:90-104`) exposes `isPending`:

```
pos/page.tsx:207  disabled={cart.length === 0 || createOrder.isPending}
pos/page.tsx:211  {createOrder.isPending ? 'Đang tạo...' : 'Tạo Đơn →'}
```

While the `POST /orders` request is in flight:
- The "Tạo Đơn →" button label changes to **"Đang tạo..."**.
- The button is `disabled` + `opacity-40 cursor-not-allowed` (Tailwind class on line `209`).
- No spinner element, no overlay — text label change only.

---

## Main content branch

The POS page has **two top-level render paths**, not a priority-ordered state table inside a single
`<main>` region.

### Path A — "Waiting for kitchen" screen · `pos/page.tsx:107-133`

When `activeOrder !== null`, the entire page is replaced by a centred card:

```
pos/page.tsx:107  if (activeOrder) {
pos/page.tsx:109    <div className="flex flex-col items-center justify-center min-h-screen …">
pos/page.tsx:110-132  <bg-card rounded-2xl> showing order number + "⏳ Bếp đang chuẩn bị..." + 2 buttons
```

This is **not a loading state in the data-fetching sense** — it is a UI-state branch that replaces
the full order-building layout after a successful `POST /orders`. `activeOrder` is set by the
`onSuccess` callback (`pos/page.tsx:98-100`). The page returns here until either:

- The WS delivers `order_status_changed` + `order.status === 'ready'` → `router.push` to
  `/cashier/payment/:id` (`pos/page.tsx:64-67`).
- The cashier taps "Đến thanh toán" manually (same route, `pos/page.tsx:118`).
- The cashier taps "Tạo đơn mới" → `setActiveOrder(null)` (`pos/page.tsx:125`), returning to Path B.

For full WS + endpoint detail see
[staff_pos_be.md § 5 · `GET /ws/orders-live`](staff_pos_be.md).

### Path B — Order-building layout · `pos/page.tsx:135-224`

Normal two-column layout. States in priority order for the left (product) pane:

| Order | Condition | Renders |
|---|---|---|
| 1 | `products` query fetching + cache empty | **Empty grid** — `<div className="grid grid-cols-2 …">` with zero children (`pos/page.tsx:150-165`) |
| 2 | `products.length === 0` after fetch | Same empty grid — no empty-state message |
| 3 | `products.length > 0` | Product cards rendered via `.map()` (`pos/page.tsx:151-164`) |

Right (order pane) — `cart.length === 0` shows the placeholder text:

```
pos/page.tsx:176-177  <p className="text-muted-fg text-sm text-center mt-10">Chọn món từ menu</p>
```

Otherwise renders the cart item list with quantity controls.

### Skeleton / empty-state details

**No skeleton.** The product grid renders zero-child grid markup while `products` is empty (loading
or genuinely empty). There are no `animate-pulse` placeholders anywhere in `pos/page.tsx` or
`CategoryTabs.tsx`. The empty grid takes up no visible space — the page looks incomplete rather than
"loading".

`CategoryTabs` renders a single "Tất cả" button while `categories === []`, then re-renders to add
category buttons once the query resolves (`CategoryTabs.tsx:14-23, 24-38`). This causes a minor
**layout shift** in the tab strip when categories arrive.

---

## Search / interaction gating

There is **no search input and no interaction that withholds a fetch** on this page.

The `products` query is always `enabled` (no `enabled:` key in the `useQuery` config,
`pos/page.tsx:45-51`). Selecting a category tab calls `setSelectedCategory` (`pos/page.tsx:144-147`),
which changes the `queryKey` from `['products', null]` to `['products', '<uuid>']` and triggers a
new fetch. However, **the BE ignores `?category_id=`** — the response is always the full available
product list regardless of tab. See [staff_pos_be.md Flag 1](staff_pos_be.md) for the unwired
`ListProductsByCategoryAvailable` root cause.

The "Tạo Đơn" button is gated by `cart.length === 0 || createOrder.isPending` (`pos/page.tsx:207`),
which withholds the mutation (not a fetch), covered in Layer 4 above.

---

## Flags / Known Gaps

| # | Gap | Detail |
|---|---|---|
| 1 | **No route-level spinner for `(dashboard)`** | `(dashboard)/loading.tsx` does not exist. Navigation into `/pos` (and every other dashboard page) has no shell spinner during JS loading. Contrast: `(shop)/loading.tsx` provides an orange ring for customer pages. |
| 2 | **No product skeleton** | Cold load renders a blank grid. There are no `animate-pulse` placeholder cards. A user briefly sees an empty POS with only the "Tất cả" tab and no products. |
| 3 | **No error UI for catalog queries** | Both `categories` and `products` queries default to `[]` on failure (`pos/page.tsx:41,49`). A network error or 5xx from BE renders identically to an empty catalog — the cashier sees a blank product grid with no indication that something went wrong and no retry button. |
| 4 | **Category tab shift on load** | `CategoryTabs` renders only "Tất cả" until `categories` resolves. Once the query returns, dynamic tab buttons are injected — a visible width shift in the tab strip. No placeholder tabs are shown. |
| 5 | **"Waiting for kitchen" screen has no timeout or error path** | After `POST /orders` succeeds, the page waits indefinitely for a WS `order_status_changed` → `ready` event. If the WS is disconnected and the status fires during the outage it is **not replayed** (no snapshot in `wsHandler`). The only recovery is the manual "Đến thanh toán" button. For details see [staff_pos_be.md Flag 5](staff_pos_be.md) and the Caching & Invalidation section there. |
