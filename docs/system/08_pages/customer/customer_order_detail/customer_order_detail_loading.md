# Customer Order Detail — Loading States · `/order/:id`

> **TL;DR:** ✅ implemented · how `/order/:id` behaves while data is in flight. **No `loading.tsx`
> and no `<Suspense>` exist for this route.** Data is driven entirely by `useOrderSSE`, not
> TanStack Query. Three loading branches render in strict priority order on the page component
> itself: (1) `isNotFound` → full-page 404 screen; (2) `!order` → detailed `animate-pulse`
> skeleton (nav + order card + table + money card + button); (3) `order` present → live page with
> a connection-status pill ("LIVE" / "MẤT KẾT NỐI") and a `ConnectionErrorBanner` after ≥3 failed
> SSE reconnects. A localStorage cache (`order_cache_<id>`) paints the order **instantly** on
> revisit, skipping the skeleton entirely.
>
> Traced from source on branch `experience_claude.md_system_1` (NOT from docs).
> Sources: `fe/src/app/(shop)/order/[id]/page.tsx` · `fe/src/hooks/useOrderSSE.ts` ·
> `fe/src/components/shared/ConnectionErrorBanner.tsx` · `fe/src/app/(shop)/loading.tsx`
>
> Page overview → [customer_order_detail.md](customer_order_detail.md) ·
> BE view → [customer_order_detail_be.md](customer_order_detail_be.md) ·
> Cross-page data flow → [customer_order_detail_crosspage_dataflow.md](customer_order_detail_crosspage_dataflow.md) ·
> Scenario → [SCENARIO_ORDER_DETAIL.md](SCENARIO_ORDER_DETAIL.md) ·
> Bugs → [ORDER_DETAIL_BUGS.md](ORDER_DETAIL_BUGS.md) ·
> Order object model → [../../02_spec/object/OBJECT_MODEL_ORDER.md](../../02_spec/object/OBJECT_MODEL_ORDER.md)

---

## Loading Layers (outer → inner)

```
1. Route navigation
   └── (shop)/loading.tsx          → centered orange spinner, entire shop shell
       (fires on hard-navigate INTO the (shop) group; absent for client-side transitions)

2. order/[id]/page.tsx mounts
   └── NO loading.tsx under order/ or order/[id]/
       NO <Suspense> boundary
       NO useQuery / isLoading
       → useOrderSSE(params.id) runs its 3-phase sequence:
           Phase A  cache read       → instant paint if cache hit (skeleton skipped)
           Phase B  GET /orders/:id  → REST snapshot
           Phase C  SSE stream       → live updates

3. Main content branch (priority-ordered in the component):
   ├── isNotFound === true   → full-page 404 screen
   ├── order === null        → animate-pulse skeleton (nav + card + table + money + button)
   └── order present         → live page + connection-status pill + optional ConnectionErrorBanner
```

---

### Layer 1 — Route-level spinner · `fe/src/app/(shop)/loading.tsx:1-7`

Next.js App Router renders `ShopLoading` for the **entire `(shop)` route group** during
server-side or hard navigation into any shop route (including `/order/:id`):

- `h-64` centered flex div; `h-8 w-8` ring with `animate-spin`, `border-4`,
  `border-gray-200`, `border-t-orange-500`. (`(shop)/loading.tsx:3-5`)
- Not order-specific — shared by menu, checkout, tracking, and order routes.
- Does **not** fire on client-side link transitions (e.g. router.push from `/menu`); those
  are instant because Next.js prefetches.

**Confirmed:** no `loading.tsx` exists under `fe/src/app/(shop)/order/` or
`fe/src/app/(shop)/order/[id]/` — only `page.tsx` in each folder. A route-specific spinner
would add no value because this page has no async server component data to stream.

---

### Layer 2 — `useOrderSSE` three-phase load sequence · `fe/src/hooks/useOrderSSE.ts`

`useOrderSSE(orderId)` is the sole data source for this page. It is **not** a TanStack Query
hook — there is no `isLoading` flag from `useQuery`. Loading state is inferred from whether
`order` is `null` (no data yet) or non-null (data present).

#### Phase A — Instant paint from localStorage cache · `useOrderSSE.ts:33-38`

```ts
useEffect(() => {
  try {
    const cached = localStorage.getItem(cacheKey(orderId))
    if (cached) setOrder(JSON.parse(cached))
  } catch {}
}, [orderId])
```

- `cacheKey(id)` expands to `STORAGE_KEYS.ORDER_CACHE + id`, where `STORAGE_KEYS.ORDER_CACHE`
  is `'order_cache_'` (`useOrderSSE.ts:9`, `fe/src/lib/storage-keys.ts`).
- If a cache entry exists from a prior visit, `setOrder(...)` fires **synchronously during
  mount** (before any network call). The page renders the full order UI with stale data, and
  the skeleton is never shown.
- The cache is written back whenever `order` changes (`useOrderSSE.ts:41-46`).

#### Phase B — REST snapshot · `useOrderSSE.ts:54-62`

Inside the main `useEffect`, `connect()` runs immediately after mount:

```ts
const { data } = await api.get(`/orders/${orderId}`)
if (!stopped) setOrder(data.data)
```

Hits `GET /api/v1/orders/:id` — traced fully in
[customer_order_detail_be.md](customer_order_detail_be.md).

| REST result | Behaviour |
|---|---|
| 2xx | `setOrder(data.data)` — overwrites any stale cache with fresh snapshot; skeleton (if showing) clears |
| 404 | `setIsNotFound(true)` then `return` — **SSE phase never opens** (`useOrderSSE.ts:60`) |
| Other error | Swallowed; falls through to SSE phase; skeleton stays until SSE resolves or fails repeatedly |

#### Phase C — SSE stream · `useOrderSSE.ts:64-143`

After the REST snapshot, `connect()` opens an SSE stream via `@microsoft/fetch-event-source` to
`GET /api/v1/orders/:id/events` with `Authorization: Bearer <token>`.

Reconnect constants (`useOrderSSE.ts:16-21`):

| Constant | Value | Meaning |
|---|---|---|
| `maxAttempts` | 5 | Give up after 5 failed attempts |
| `baseDelay` | 1 000 ms | Initial backoff delay |
| `maxDelay` | 30 000 ms | Cap on backoff delay |
| `showBannerAfter` | 3 | Show `ConnectionErrorBanner` once `attemptsRef.current >= 3` |

Backoff formula: `min(1000 × 2^(attempt-1), 30000)` → 1 s, 2 s, 4 s, then 30 s cap
(`useOrderSSE.ts:136-140`).

A successful `onopen` resets `attemptsRef.current = 0` and clears the banner
(`useOrderSSE.ts:76-77`):

```ts
attemptsRef.current = 0
setConnectionError(false)
```

After ≥3 failed attempts (`useOrderSSE.ts:134`):

```ts
if (attemptsRef.current >= RECONNECT.showBannerAfter) setConnectionError(true)
```

`connectionError` drives two pieces of UI (see Main Content Branch §3 below).

---

## Main Content Branch · `fe/src/app/(shop)/order/[id]/page.tsx`

The component renders **one of three branches**, checked in this exact priority order:

### Branch 1 — `isNotFound` screen · `page.tsx:155-173`

```tsx
if (isNotFound) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <AlertTriangle size={28} className="text-muted-fg" />
      </div>
      <p className="text-base font-semibold text-foreground">Không tìm thấy đơn hàng</p>
      <p className="text-sm text-muted-fg mt-1">Mã đơn hàng không hợp lệ hoặc đã bị xoá.</p>
      <button onClick={() => router.push('/menu')} …>Về trang menu</button>
    </div>
  )
}
```

- Full-page centered layout, `min-h-screen`.
- `AlertTriangle` icon (Lucide, 28px) in a `w-16 h-16 bg-muted` circle.
- Single CTA: "Về trang menu" → `router.push('/menu')`.
- Triggered when `GET /orders/:id` returns 404 (`useOrderSSE.ts:60`).

### Branch 2 — `animate-pulse` skeleton · `page.tsx:175-230`

When no cache exists AND the REST call has not yet resolved (or encountered a non-404 error),
`order` is `null`. A detailed multi-section skeleton renders:

```
min-h-screen bg-background pb-10 animate-pulse
├── Sticky nav skeleton (top-0 z-20 bg-card border-b) · page.tsx:179-183
│     w-6 h-6 rounded bg-muted  (back button)
│     flex-1 h-4 bg-muted rounded w-40  (title)
│     w-14 h-5 bg-muted rounded-full  (connection pill)
└── max-w-lg mx-auto px-4 pt-4 space-y-3
      Order card skeleton · page.tsx:185-201
        border-l-4 border-primary/30
        Header: "Bàn" label, order number, status badge, total amount
        Progress bar: h-1 bg-muted
        3 dish row skeletons (dot + name bar + price bar + button placeholder)
      Table skeleton · page.tsx:202-215
        border-l-4 border-border/30
        h-8 header + 4 row skeletons (6 columns each)
      Money card skeleton · page.tsx:216-224
        border-l-4 border-border/30
        3 label+value row pairs
      Button skeleton · page.tsx:225-226
        h-12 bg-muted rounded-xl
```

The entire outer div carries `animate-pulse` — all child `bg-muted` rectangles pulse
together. Each skeleton section mirrors the structure of the equivalent live section:

| Skeleton section | Live section equivalent |
|---|---|
| Nav skeleton (`page.tsx:179-183`) | `<header>` sticky nav (`page.tsx:273-293`) |
| Order card skeleton (`page.tsx:185-201`) | Order card with dish rows (`page.tsx:299-403`) |
| Table skeleton (`page.tsx:202-215`) | Dish summary table (`page.tsx:406-516`) |
| Money card skeleton (`page.tsx:216-224`) | Money summary card (`page.tsx:519-536`) |
| Button skeleton (`page.tsx:225-226`) | "Thêm món" / "Theo dõi bàn" buttons (`page.tsx:560-583`) |

### Branch 3 — Live page with connection-status indicators · `page.tsx:270-293`

When `order` is non-null, the full page renders. Two connection-state indicators are always
present in the sticky header and below it:

#### Connection-status pill · `page.tsx:282-292`

```tsx
<div
  aria-label={connectionError ? 'Mất kết nối realtime' : 'Kết nối realtime đang hoạt động'}
  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
    connectionError
      ? 'bg-red-900/30 text-urgent'
      : 'bg-green-900/30 text-success'
  }`}
>
  <span className={`w-1.5 h-1.5 rounded-full ${connectionError ? 'bg-urgent' : 'bg-success animate-pulse'}`} />
  {connectionError ? 'MẤT KẾT NỐI' : 'LIVE'}
</div>
```

- Connected: green pill `bg-green-900/30`, text `"LIVE"`, dot `bg-success animate-pulse`.
- Disconnected: red pill `bg-red-900/30`, text `"MẤT KẾT NỐI"`, dot `bg-urgent` (static).

#### `ConnectionErrorBanner` · `page.tsx:295` + `fe/src/components/shared/ConnectionErrorBanner.tsx:1-7`

```tsx
{connectionError && <ConnectionErrorBanner />}
```

`ConnectionErrorBanner` renders:

```tsx
<div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50">
  ⚠️ Mất kết nối — đang thử lại...
</div>
```

- `fixed top-0 left-0 right-0` — overlays the sticky nav.
- `z-50` — above all page content.
- Appears once `attemptsRef.current >= 3` (`useOrderSSE.ts:134`).
- Appears even when the order is already painted from cache — the user sees stale data AND
  the banner simultaneously.
- Clears when SSE reconnects successfully (`useOrderSSE.ts:77`: `setConnectionError(false)`).

---

## Search / Interaction Gating

This page has **no search, filter, or pagination**. No fetch is gated by user input.

The only interactions that trigger mutations are:
- Quantity stepper → `PATCH /orders/items/:id/quantity` (mutation, not a re-fetch)
- Cancel item / cancel order → `DELETE` mutations

`updateQtyMutation.onSuccess` calls `queryClient.invalidateQueries({ queryKey: ['order', params.id] })`
(`page.tsx:59`), but because the page uses `useOrderSSE` (not a TanStack Query), **this
`invalidateQueries` is a no-op** — there is no registered `['order', id]` query to invalidate.
Live updates from mutations rely solely on the SSE stream pushing `item_progress` events.

---

## Flags / Known Gaps

| # | Gap | Detail |
|---|---|---|
| 1 | **Stale cache paints before REST reconciles** | If `order_cache_<id>` exists, the order renders instantly with potentially stale data (old `qty_served`, old `status`). There is no loading indicator and no visual diff between stale and fresh data — the REST snapshot silently overwrites when it arrives. This gap is documented here; the bug tracker lives in [ORDER_DETAIL_BUGS.md](ORDER_DETAIL_BUGS.md). |
| 2 | **`invalidateQueries` is a no-op** | `updateQtyMutation.onSuccess` calls `queryClient.invalidateQueries({ queryKey: ['order', params.id] })` (`page.tsx:59`). Because this page does not register a `useQuery(['order', id])`, the call has no effect. After a quantity edit or item cancel the UI only updates when the SSE stream sends `item_progress` — see [ORDER_DETAIL_BUGS.md](ORDER_DETAIL_BUGS.md). |
| 3 | **Non-404 REST errors fall through to SSE silently** | When `GET /orders/:id` returns a non-404 error, the error is swallowed (`useOrderSSE.ts:61-62`) and `connect()` proceeds to open the SSE. The skeleton continues to show with no feedback until SSE also fails (≥3 attempts → `ConnectionErrorBanner`) or the user navigates away. |
| 4 | **No `<Suspense>` in `order/[id]/page.tsx`** | The page has no `useSearchParams()` or other suspending call, so no `<Suspense>` is needed. Confirmed by code inspection. Documented here to confirm it was checked. |
| 5 | **`ConnectionErrorBanner` is `fixed top-0` and overlaps the sticky nav** | The banner (`z-50`) covers the back button and the "LIVE" / "MẤT KẾT NỐI" pill in the sticky header (`z-20`) when both render simultaneously. The user cannot read the connection pill when the banner is active. |
| 6 | **SSE ignores `item_updated` and `item_cancelled` events** | The `onmessage` handler in `useOrderSSE.ts:83-123` handles only: `order_init`, `order_status_changed`, `order_cancelled`, `item_progress`, `order_completed`. If the BE emits `item_updated` or `item_cancelled` events (e.g. after a staff cancel), the page does not re-render the dish list live — see [ORDER_DETAIL_BUGS.md](ORDER_DETAIL_BUGS.md). |
