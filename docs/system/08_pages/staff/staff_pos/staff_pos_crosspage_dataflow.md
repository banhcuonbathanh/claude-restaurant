# Staff POS — Cross-Page Data Flow (the order, after it leaves `/pos`)

> **What this is:** ✅ implemented · the **cross-page** companion to [staff_pos.md](staff_pos.md).
> Once `/pos` POSTs an order, **how is that order shared across the pages and devices that outlive
> the POS screen** — the cashier payment page, the KDS, and the admin overview floor?
>
> The key difference from the customer flow: **POS keeps nothing in localStorage.** The `activeOrder`
> state that bridges the "waiting for kitchen" screen is pure `useState` — wiped on F5. The only
> cross-page hub that matters is the **server order row** (MySQL + Redis pub/sub). Every downstream
> surface re-fetches it independently from BE.
>
> Traced from source on branch `experience_claude.md_system_1`:
> [`fe/src/app/(dashboard)/pos/page.tsx`](../../../../../fe/src/app/(dashboard)/pos/page.tsx) ·
> [`fe/src/context/OrdersWSContext.tsx`](../../../../../fe/src/context/OrdersWSContext.tsx) ·
> [`fe/src/app/(dashboard)/layout.tsx`](../../../../../fe/src/app/(dashboard)/layout.tsx) ·
> [`fe/src/lib/storage-keys.ts`](../../../../../fe/src/lib/storage-keys.ts) ·
> [`fe/src/app/(dashboard)/cashier/payment/[id]/page.tsx`](../../../../../fe/src/app/(dashboard)/cashier/payment/[id]/page.tsx) ·
> BE facts → [staff_pos_be.md](staff_pos_be.md).
>
> Siblings: [staff_pos.md](staff_pos.md) · [staff_pos_be.md](staff_pos_be.md) ·
> [staff_pos_loading.md](staff_pos_loading.md) · [SCENARIO_POS_ORDER.md](SCENARIO_POS_ORDER.md) ·
> Downstream: [../staff_cashier_payment/staff_cashier_payment.md](../staff_cashier_payment/staff_cashier_payment.md) ·
> [../staff_kds/staff_kds.md](../staff_kds/staff_kds.md) ·
> [../../admin/admin_overview/admin_overview.md](../../admin/admin_overview/admin_overview.md)

---

## 0. The whole picture on one diagram

```
   ┌──────────────────────────── ONE STAFF BROWSER (the cashier's device) ──────────────────────────┐
   │                                                                                                  │
   │                  ┌──────────── in-browser hub (POS) ─────────────┐                              │
   │                  │  activeOrder   ░ useState (memory ONLY)         │                              │
   │                  │                NO localStorage write at all     │                              │
   │                  └─────────────────────────────────────────────────┘                             │
   │                     ▲ set on 201        ▲ read on WS event                                        │
   │                     │                   │                                                          │
   │  /pos ──POST /orders┘                   │ order_status_changed (status='ready')                   │
   │     │  setActiveOrder(order)             │── router.push('/cashier/payment/:id')                   │
   │     │  setCart([])   ░ in-memory only    │                                                          │
   │     │                                                                                              │
   │     └── "Đến thanh toán" (manual) ─────────────────────────────────▶ /cashier/payment/:id          │
   │     └── "Tạo đơn mới" ─────────────────▶ setActiveOrder(null)  (resets waiting screen)             │
   │                                                                                                  │
   │      shared WS (one socket per browser, opened by (dashboard) layout)                           │
   │      OrdersWSProvider  →  wss://.../ws/orders-live?token=...                                     │
   │      channel: orders:kds  ← pos/page.tsx:54 · layout.tsx:4                                      │
   └──────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                               │
   ══════════════════════════ THE WIRE — the BE order row is the real hub ═══════════════════════════
                                               │
                              ┌────────────────▼────────────────┐
                              │        one  order  row            │   MySQL (durable) + Redis (pub/sub)
                              │  id · status='pending'            │
                              │  source='pos' · table_id=NULL     │
                              │  created_by=<cashier UUID>        │
                              └──┬─────────────────────────────┬──┘
                 cashier side    │                              │         KDS / admin side
   ◀── GET /orders/:id ──────────┤                              ├──── new_order ──▶ orders:admin (SSE)
   ◀── WS payment_success ───────┤                              ├──── orders:kds ─▶ /kds (WS) · /pos (WS)
        (orders:kds channel)     │                              ├──── order_status_changed ─▶ all subscribers
                                 │  staff/chef acts on KDS      │
                                 │  PATCH /orders/:id/status ───┘ (fan-out triggers auto-redirect on /pos)
```

```
   LEGEND
   ──▶  navigation / HTTP call
   ◀──  WS/SSE push (server → browser)
   ░    memory only — dies on F5 / page close
   ▓    localStorage — survives F5
   ⚠️   POS has NO ▓ writes; all state is ░
```

**Read it like this:** the POS cashier's browser holds no persistent order state. The `activeOrder`
(post-201) is pure memory. The only datum that survives the POS screen is the **order id in the URL**
when the cashier navigates to `/cashier/payment/:id`. The BE order row is the single hub connecting
every downstream page and every other device.

---

## 1. The status lifecycle every page renders against

All pages consume the same `OrderStatus` enum. The POS-specific lifecycle has a narrower path
than customer orders — POS has no table assignment, so the floor-view concern disappears; the
`ready` status is the key trigger.

```
   POST /orders (source='pos')
        │
        ▼
   pending ──── (staff confirms on /kds) ──▶ confirmed ──── (chef starts) ──▶ preparing
                                                                                   │
                                                                        (all items served / chef)
                                                                                   ▼
   auto-redirect fires on POS ◀── WS order_status_changed (status='ready') ── ready
        │
        ▼
   /cashier/payment/:id
        │
        └──── POST /payments  ────▶  paid   (order record is archived, not live)
```

| Status | Who sets it | POS sees | Cashier payment sees | KDS sees | Admin overview sees |
|---|---|---|---|---|---|
| `pending` | `POST /orders` | "⏳ Bếp đang chuẩn bị..." waiting screen | `GET /orders/:id` result | new ticket appears | `new_order` ping → hydrates live cache |
| `confirmed` | staff on KDS | WS event fired — but POS only reacts to `ready`, ignores `confirmed` | order detail refreshes | ticket moves | live cache WS patch |
| `preparing` | KDS | (same — ignored until `ready`) | order detail reflects progress | item progress | live cache WS patch |
| `ready` | KDS / `maybeAutoReady` | **auto-redirect** `router.push('/cashier/payment/:id')` | page destination | KDS marks done | live cache WS patch |
| `paid` | payment webhook | (POS has navigated away) | `window.print(); router.push('/pos')` | no longer shown | drops from `ACTIVE` set |
| `cancelled` | staff/cashier | no dedicated handler — if `order_status_changed` fires for cancel while `activeOrder` is set, the POS re-fetches and `status !== 'ready'` so no redirect; cashier taps "Tạo đơn mới" | page shows stale order | ticket removed | dropped → CancelLog |

> **`confirmed` and `preparing` are transparent to POS.** The WS subscription at `pos/page.tsx:58-67`
> filters `msg.type !== 'order_status_changed'` and `msg.order_id !== orderId`, then re-fetches the
> order and checks `order.status === 'ready'`. All intermediate status events arrive but produce no
> action on the POS screen.

---

## 2. The moment of handoff — what `/pos` leaves behind

This is the seam. The cross-component doc ends at cart submit. This file begins after `201`.

On `POST /orders` success (`pos/page.tsx:98-103`):

```
   POST /orders ──────────────▶ 201 { id, order_number, status:'pending', items[], total_amount }
        │
        │   ① setActiveOrder(order)    ░ useState — lives only while POS tab is open
        │   ② setCart([])              ░ useState — empties the cart in memory
        │   ③ toast.success(…)         (no storage write of any kind)
        ▼
   "Waiting for kitchen" screen renders  (still at /pos, no router.push yet)
```

```
   STORAGE THE INSTANT AFTER 201
   ┌──────────────────────────────────────────────────────────┐
   │ ░ activeOrder = { id, order_number, status:'pending', … } │  ← ONLY thing that carries the order id
   │ ░ cart        = []                                        │
   │                                                          │
   │ ▓ localStorage: NO write — zero keys added or changed    │  ← confirmed: storage-keys.ts has no
   │                                                          │    POS-specific key; pos/page.tsx has
   │                                                          │    no localStorage.setItem call
   └──────────────────────────────────────────────────────────┘
```

| # | Write | Where it lands | Who reads it later | Source |
|---|---|---|---|---|
| ① | `setActiveOrder(order)` | ░ `useState` in `POSContent` | same component — WS handler (line 57), "Đến thanh toán" button (line 118) | `pos/page.tsx:99` |
| ② | `setCart([])` | ░ `useState` in `POSContent` | re-renders the empty order summary panel | `pos/page.tsx:100` |
| ③ | `order.id` in `router.push(...)` | the **URL** `/cashier/payment/:id` | `/cashier/payment/[id]/page.tsx` — the only cross-page consumer | `pos/page.tsx:118` (manual) or `pos/page.tsx:66` (auto via WS) |

> **Why no localStorage?** POS is a staff-internal tool, not a recoverable customer session. Staff
> losing the active order on F5 is acceptable; they can find it on `/admin/overview` or the cashier
> can re-navigate to `/cashier/payment/:id` from there. The design deliberately avoids polluting
> `localStorage` with walk-in order ids that would never be cleaned up.

---

## 3. The shared WS — one socket, multiple subscribers

`OrdersWSProvider` is mounted once by `(dashboard)/layout.tsx:4`, wrapping every staff page inside
the `(dashboard)` segment (KDS, cashier, admin overview, **and** POS). A single WebSocket connection
to `orders:kds` is shared via React context; individual pages subscribe/unsubscribe handlers without
opening their own sockets.

```
   (dashboard)/layout.tsx
       └── <OrdersWSProvider>          ← one socket: wss://.../ws/orders-live?token=...
                                          channel subscribed: orders:kds
               ├── /pos/page.tsx            subscribe: auto-redirect handler  (pos/page.tsx:54-70)
               ├── /kds/page.tsx            subscribe: KDS tile updates        (❓ UNVERIFIED — skim kds/page.tsx)
               ├── /cashier/payment/[id]    opens its OWN dedicated WS         (cashier/payment/[id]/page.tsx:63-108)
               └── /admin/overview/…        uses useOverviewWS (separate hook)  (❓ UNVERIFIED — verify hook)
```

**POS subscription lifecycle** (`pos/page.tsx:55-70`):
- `useEffect` dependencies: `[subscribe, activeOrder, router]`
- Runs (and re-registers the handler) every time `activeOrder` changes — when an order is created
  (`activeOrder` goes from `null` → `Order`) the subscription becomes active
- When `activeOrder` is null (initial, or after "Tạo đơn mới"), the `if (!activeOrder) return` at
  line 56 unsubscribes immediately (the returned cleanup runs on next render)
- On `order_status_changed` for the active order id: re-fetches `GET /orders/:id` and if
  `status === 'ready'` calls `router.push('/cashier/payment/${orderId}')` (line 66)

**The cashier payment page opens its own dedicated WS** (`cashier/payment/[id]/page.tsx:63-108`),
NOT the shared provider — it builds the connection inline, listening for `payment_success`. This is
a second, parallel socket on the same `orders:kds` channel for the duration of the payment flow.

---

## 4. `/cashier/payment/:id` — the downstream handoff target

POS hands off to this page by placing the **order id in the URL** — either automatically via the
WS redirect (`pos/page.tsx:66`) or manually via the "Đến thanh toán" button (`pos/page.tsx:118`).

```
   /pos  ────── router.push('/cashier/payment/<id>') ──────▶  /cashier/payment/[id]
                            order id in URL                           │
                                                                      │ useQuery(['order', orderId])
                                                                      │   GET /orders/:id
                                                                      │   ← authoritative snapshot
                                                                      │
                                                                      ├─ user selects payment method
                                                                      │
                                                                      ├─ POST /payments { order_id, method }
                                                                      │     ← returns Payment { id, status, qr_code_url }
                                                                      │
                                                                      ├─ COD → status='completed' immediately
                                                                      │         window.print(); router.push('/pos')
                                                                      │
                                                                      └─ QR methods → status='pending'
                                                                                  open WS listening for payment_success
                                                                                  window.print(); router.push('/pos')
```

What the cashier payment page does NOT inherit from POS:
- No cart data — it fetches the order fresh from `GET /orders/:id`
- No `activeOrder` state — it reads the URL param `params.id` (`cashier/payment/[id]/page.tsx:49`)
- No POS-managed WS subscription — it opens its own socket independently

**Return path:** after a successful payment, `router.push('/pos')` (`cashier/payment/[id]/page.tsx:91,119`)
returns the cashier to `/pos`. At this point POS has a fresh mount — `activeOrder` is `null`, cart
is empty, the cashier can start a new order. There is no "last order" memory.

---

## 5. KDS — the order appears as a new ticket

KDS (`/kds`) subscribes to the `orders:kds` Redis channel via the shared `OrdersWSProvider`.
When `POST /orders` succeeds on the POS, the BE service publishes a `new_order` event to
`orders:kds` (`order_service.go:348-350` per `staff_pos_be.md §3`).

```
   POS: POST /orders ─────▶ BE: CreateOrder tx ─────▶ Redis: PUBLISH orders:kds { type:'new_order', order_id, … }
                                                              │
                                                    ┌─────────▼──────────────────────────────────────────┐
                                                    │  WS fan-out: every subscriber on orders:kds receives │
                                                    │  ├── /kds page:       new ticket appears              │
                                                    │  ├── /pos page:       receives msg but filters        │
                                                    │  │                    type !== 'order_status_changed' │
                                                    │  │                    → no action on new_order         │
                                                    │  └── other staff tabs: (same filter logic)             │
                                                    └────────────────────────────────────────────────────────┘
```

POS orders arrive at KDS with:
- `source = 'pos'` (stored enum `OrdersSourcePos`)
- `table_id = NULL` — KDS display shows no table assignment
- `customer_name = 'Khách tại quán'` (placeholder literal, `order_service.go:325`)
- `created_by = <cashier UUID>` (non-NULL, unlike QR/customer orders)

For full KDS rendering and ticket lifecycle see
[../staff_kds/staff_kds.md](../staff_kds/staff_kds.md).

---

## 6. Admin Overview — the order row lands in the live cache

The admin overview (`/admin/overview`) receives orders via two separate channels:
1. An SSE `new_order` ping on `orders:admin` that tells the page a new order exists
2. A WS `orders:kds` connection (via `useOverviewWS`) that delivers live patches

```
   POS: POST /orders ─────▶ BE publish ──┬──▶ orders:admin SSE: new_order { id, order_number, table_id:null, … }
                                          │         │
                                          │         └──▶ admin overview: GET /orders/:id
                                          │                  ─▶ inserts into ['orders','live'] TanStack cache (if ACTIVE)
                                          │
                                          └──▶ orders:kds WS: new_order
                                                    └──▶ admin overview (useOverviewWS): same hydrate path
```

Because `table_id = NULL`, POS orders do **not** appear in the table-grid / floor-monitor zones that
QR orders occupy. They appear in the list-view of active orders, identified by `source = 'pos'` and
the `Khách tại quán` customer name.

For full admin overview zone breakdown see
[../../admin/admin_overview/admin_overview.md](../../admin/admin_overview/admin_overview.md).

---

## 7. Multi-device sync — one kitchen action, two staff devices move

```
   CHEF on KDS taps "served +1" on item X (POS order A)
        │
        ▼
   PATCH /orders/A/items/X ──▶ BE: qty_served++ ──▶ Redis: PUBLISH orders:kds { type:'item_progress', … }
        │                                                    │
        │                             ┌───────────────────────┼────────────────────────────────────┐
        ▼                             ▼                        ▼                                   ▼
   KDS device                    POS device               Admin overview                     other staff
   progress bar moves             WS receives              WS patch                           (same)
                                  item_progress            ['orders','live'] updated
                                  ─ but POS only acts
                                    on order_status_changed
                                    type=ready
                                  ─ item_progress is silently
                                    swallowed (no state to update)
```

When `maybeAutoReady` fires (last item served) or chef taps "ready":
```
   BE: PUBLISH orders:kds { type:'order_status_changed', order_id:'A', status:'ready' }
        │
        └──▶ POS: WS handler (pos/page.tsx:58-67):
                 msg.type === 'order_status_changed' ✓
                 msg.order_id === activeOrder.id ✓
                 GET /orders/A → order.status === 'ready' ✓
                 router.push('/cashier/payment/A')  ← AUTOMATIC REDIRECT
```

```
   THE INVARIANT:  no arrow goes device → device directly.
                   Every cross-device update is  device → BE → Redis pub/sub → device.
                   The BE order row is the single source; WS is its loudspeaker.
```

---

## 8. Cancellation / reverse flows

POS does not have a cancel button for the order it just created. Cancellation of a POS order can
only happen from two surfaces:
1. **Admin overview** — `PATCH /orders/:id/status { status:'cancelled' }` (staff action)
2. **KDS** — ❓ UNVERIFIED whether KDS exposes a cancel action directly

```
   ┌──────────────────────────────────────────────────────────────────────────┐
   │  WHO     │  ENDPOINT                          │  POS effect               │
   ├──────────┼────────────────────────────────────┼────────────────────────────┤
   │ Admin    │ PATCH /orders/:id/status            │ WS event arrives: type=   │
   │          │   { status:'cancelled' }            │ 'order_status_changed'    │
   │          │                                     │ status !== 'ready'        │
   │          │                                     │ → no auto-redirect        │
   │          │                                     │ → cashier still sees the  │
   │          │                                     │ "waiting for kitchen" UI  │
   │          │                                     │ (no cancelled-modal on    │
   │          │                                     │ POS — see Flag below)     │
   ├──────────┼────────────────────────────────────┼────────────────────────────┤
   │ Cashier  │ (none — POS has no cancel button)  │ N/A                        │
   │ (POS)    │ "Tạo đơn mới" button only clears   │ setActiveOrder(null)       │
   │          │ the local state — does NOT cancel   │ the BE order still exists │
   │          │ the BE order row                    │ as 'pending' (orphaned)   │
   └──────────┴────────────────────────────────────┴────────────────────────────┘
```

> **⚠️ FLAG — "Tạo đơn mới" orphans the active BE order.** When the cashier taps "Tạo đơn mới"
> (`pos/page.tsx:125`: `setActiveOrder(null)`), the local state resets but no cancel request is
> sent to the BE. The pending order row persists in MySQL and stays in the admin live cache until it
> times out or is manually cancelled by staff. This is a known gap — the POS has no "cancel current
> order" API call. Owner to decide if a cancel mutation should be wired to this button.

### Where a cancel lands on each surface

| Surface | Channel | Effect |
|---|---|---|
| POS (active waiting screen) | WS `order_status_changed` (status=cancelled) | WS callback re-fetches order; `status !== 'ready'` → no redirect; cashier sees no UI change (stuck on waiting screen until "Tạo đơn mới") |
| `/cashier/payment/:id` | WS `payment_success` only — cancel is not handled | page shows stale order; no auto-navigate away |
| KDS | WS `order_status_changed` | ticket removed from active queue |
| Admin overview | WS patch | dropped from `['orders','live']` → CancelLog |

---

## 9. End-to-end timeline — the POS order across all pages and devices

```
 Cashier       /pos             BE / Redis               /kds (chef)        Admin           /cashier/payment/:id
   │           (POSContent)                                                  overview              │
   │              │                  │                       │                  │                  │
   ├ Tạo Đơn ──▶ POST /orders ───────┼───────────────────────┼──────────────────┼──────────────────┤
   │              │                  │  CREATE order row      │                  │                  │
   │              │                  │  source='pos'          │                  │                  │
   │              │                  │  table_id=NULL         │                  │                  │
   │              │                  │  created_by=cashierUUID│                  │                  │
   │              │                  │  status='pending'      │                  │                  │
   │              │◀── 201 {id,…} ───┤── PUBLISH orders:kds ─▶ new ticket        │                  │
   │              │   setActiveOrder │── PUBLISH orders:admin ────────────────▶ new_order ping      │
   │              │   setCart([])    │                        │   GET /orders/:id ─────────────────▶ │
   │              │                  │                       │   → ['orders','live'] cache           │
   │              │  "⏳ Bếp đang    │                        │                  │                  │
   │              │  chuẩn bị..."    │                        │                  │                  │
   │              │                  │                       │                  │                  │
   │   (chef starts — KDS) ──────────┼───────────────────────▶ PATCH status=     │                  │
   │              │  WS: confirmed   │  status='confirmed'   │  confirmed ──────▶ WS patch          │
   │              │  → no action     │  PUBLISH orders:kds   │                  │                  │
   │              │                  │                       │                  │                  │
   │   (chef marks ready) ───────────┼───────────────────────▶ PATCH status=     │                  │
   │              │  WS: ready       │  status='ready'       │  ready ──────────▶ WS patch          │
   │              │  GET /orders/:id │  PUBLISH orders:kds   │                  │                  │
   │              │  status='ready' ─┤                        │                  │                  │
   │              │  router.push─────┼────────────────────────┼──────────────────┼────────────────▶ mount
   │              │  ('/cashier/     │                        │                  │   GET /orders/:id
   │              │   payment/:id')  │                        │                  │   receipt renders
   │              │                  │                        │                  │                  │
   │  (cashier selects COD) ─────────┼────────────────────────┼──────────────────┼─ POST /payments ─┤
   │              │                  │  payment row created   │                  │  { method:'cod' } │
   │              │                  │  status='completed'    │                  │                  │
   │              │                  │  PUBLISH orders:kds    │                  │◀── 201 Payment    │
   │              │                  │   payment_success      │                  │  window.print()   │
   │              │                  │                        │                  │  router.push('/pos')
   │              │                  │                        │                  │                  │
   │              │  ░ activeOrder=null (fresh mount)         │                  │                  │
   │              │  ░ cart=[]                                │                  │                  │
   ▼              ▼  new order can be started                  ▼                  ▼                  ▼
```

---

## 10. Reload (F5) behavior per page

The POS stack is almost entirely memory-based. The split between `░` (dies on F5) and `▓` (survives)
is stark compared to the customer flow.

| Page | URL has order id? | State on reload | Outcome |
|---|---|---|---|
| `/pos` (cart phase) | no | ░ cart wiped, ░ selectedCategory reset | blank cart — cashier re-selects items |
| `/pos` (waiting for kitchen) | no | ░ activeOrder wiped | back to blank cart — WS never replays; cashier must find the order via admin or navigate to `/cashier/payment/:id` manually |
| `/cashier/payment/:id` | YES (:id in URL) | `useQuery(['order', orderId])` re-fetches `GET /orders/:id` | full recovery — order data re-loads from BE; payment state ░ lost but can restart |
| `/kds` | no | full BE re-fetch on mount | tickets re-render from `GET /orders/active` (❓ UNVERIFIED — check kds/page.tsx for initial load query) |
| `/admin/overview` | no | full BE re-fetch via `['orders','live']` init | live cache repopulated; no localStorage dependency |

> **The POS-specific gotcha:** after `/pos` reloads during the "waiting for kitchen" phase, the
> cashier has no in-browser pointer to the pending order. The order still exists on the BE. The
> cashier can recover by: (a) checking `/admin/overview` for the pending POS order, or (b)
> typing `/cashier/payment/<id>` directly if they noted the id. There is no recovery UI on `/pos` itself.

---

## 11. Durability matrix — what survives what

| Datum | Lives in | Survives F5? | Survives new device? | Scope |
|---|---|---|---|---|
| `cart` items, prices | ░ `useState` | ❌ | ❌ | `/pos` only, pre-POST |
| `selectedCategory` | ░ `useState` | ❌ | ❌ | `/pos` only |
| `activeOrder` (full Order object) | ░ `useState` | ❌ | ❌ | `/pos` only, post-POST waiting screen |
| order id (in redirect URL) | the URL `/cashier/payment/:id` | ✅ (bookmark / back) | ✅ (shareable) | `/cashier/payment/[id]` only |
| Payment state (`payment`, `method`) | ░ `useState` | ❌ | ❌ | `/cashier/payment/[id]` only |
| **the order row** | **BE (MySQL)** | ✅ | ✅ | every page, every device |
| **Redis pub/sub events** | ephemeral | ❌ (no replay) | ❌ | in-flight only; missed during disconnect |

> **The mental model in one line:** `/pos` is a fire-and-forget terminal — it writes one server row,
> hands off the id in the URL, and remembers nothing. Every downstream page (cashier payment, KDS,
> admin) keeps itself fresh from its own BE fetch or WS subscription, independently of the POS that
> created the order.

---

## 12. Source & rule map

| Topic | Source of truth |
|---|---|
| POS on-page (cross-component) flow | [staff_pos.md](staff_pos.md) |
| All BE endpoints (POST /orders, GET /orders/:id, WS) | [staff_pos_be.md](staff_pos_be.md) |
| Order object fields and status enum | [../../02_spec/object/OBJECT_MODEL_ORDER.md](../../02_spec/object/OBJECT_MODEL_ORDER.md) |
| POS cart submission — no localStorage write confirmed | [`fe/src/app/(dashboard)/pos/page.tsx:98-103`](../../../../../fe/src/app/(dashboard)/pos/page.tsx) |
| POS WS subscription (auto-redirect at `ready`) | [`fe/src/app/(dashboard)/pos/page.tsx:54-70`](../../../../../fe/src/app/(dashboard)/pos/page.tsx) |
| Shared WS provider (one socket per browser session) | [`fe/src/context/OrdersWSContext.tsx`](../../../../../fe/src/context/OrdersWSContext.tsx) |
| Layout mounts OrdersWSProvider | [`fe/src/app/(dashboard)/layout.tsx:4`](../../../../../fe/src/app/(dashboard)/layout.tsx) |
| No POS-specific localStorage key | [`fe/src/lib/storage-keys.ts`](../../../../../fe/src/lib/storage-keys.ts) |
| Cashier payment page (downstream) | [`fe/src/app/(dashboard)/cashier/payment/[id]/page.tsx`](../../../../../fe/src/app/(dashboard)/cashier/payment/[id]/page.tsx) |
| KDS ticket rendering | [../staff_kds/staff_kds.md](../staff_kds/staff_kds.md) |
| Admin overview live cache | [../../admin/admin_overview/admin_overview.md](../../admin/admin_overview/admin_overview.md) |
| Realtime config (channels, reconnect backoff) | [staff_pos_be.md §5 + Caching §](staff_pos_be.md) |
| POS order creation flags (payload builder bypass, no-op category filter) | [staff_pos_be.md §Flags](staff_pos_be.md) |
| Loading states per page | [staff_pos_loading.md](staff_pos_loading.md) |
| End-to-end scenario | [SCENARIO_POS_ORDER.md](SCENARIO_POS_ORDER.md) |
