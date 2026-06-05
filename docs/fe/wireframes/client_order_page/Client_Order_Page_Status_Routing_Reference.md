# Client Order Page — Status Routing Reference

> Customer-facing **order tracking** screen — header "Theo Dõi Đơn Hàng".
> One order per page; `order.status` does **not** route the order into different sections
> (it always renders one order). Instead status gates **which buttons / banners / modals appear**.
> Every cell below is traced to code — file:line in the "Source files" list.

## Source files

| What | File |
|---|---|
| Page entry (detail/tracking) | `fe/src/app/(shop)/order/[id]/page.tsx` |
| `DishRow` (inline component) | `fe/src/app/(shop)/order/[id]/page.tsx:681` |
| SSE hook (progress · notification · isNotFound) | `fe/src/hooks/useOrderSSE.ts` |
| Status badge labels | `fe/src/components/shared/StatusBadge.tsx` |
| Status enum (FE mirror) | `fe/src/types/order.ts` (`OrderStatus`) |
| Status enum (BE source) | `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md:199` |

> Sibling list page `fe/src/app/(shop)/order/page.tsx` ("Đơn hàng của bạn") shares
> `StatusBadge` + progress bar but only routes the **progress bar** by status
> (`isActive` → shown, else hidden, `page.tsx` list line ~120). Not detailed here.

---

## Page Layout

| Zone | Component | Title (verbatim) | When visible |
|---|---|---|---|
| A | Sticky nav header | Theo Dõi Đơn Hàng | Always — `LIVE` / `MẤT KẾT NỐI` badge driven by `connectionError` |
| B | ConnectionErrorBanner | — | Only when `connectionError` (`[id]/page.tsx:295`) |
| C | Order card | Bàn {table_name} / Mang về | Always — holds `StatusBadge` + progress bar + dish rows (collapsible) |
| D | Dish summary table | Chi tiết món | Always — collapsible (`collapsedSummary`) |
| E | Money summary | — (Đã dùng / Còn lại / Tổng cộng) | Always |
| F | Completed banner | Đơn hàng đã hoàn thành | Only `order.status === 'delivered'` (`:539`) |
| G | Cancel-whole-order button | Huỷ toàn bộ đơn hàng | Only `canCancelOrder` (`:550`) |
| H | Add-more actions | Theo dõi bàn / Thêm món / Đặt thêm món | Only when `order.table_id` present (`:560`) |
| M1 | Notification modal | (confirmed/ready/cancelled) | Only when `notification !== null` (`:587`) |
| M2 | Cancel confirm modal | Huỷ đơn hàng? / Huỷ món còn lại? / Huỷ món này? | Only when `cancelTarget !== null` (`:640`) |
| — | Not-found screen | Không tìm thấy đơn hàng | Only when `isNotFound` (`:155`) — replaces whole page |
| — | Loading skeleton | — | Only when `!order` (`:175`) — replaces whole page |

**Derived flags (the real gates):**
- `isActive = order.status !== 'delivered' && order.status !== 'cancelled'` — `:232`
- `canCancelOrder = progress < 30 && (order.status === 'confirmed' || order.status === 'preparing')` — `:233`
- `progress` = `round(servedQty / totalQty * 100)` — `useOrderSSE.ts` (item served counts, **not** status)

---

## Order DB Statuses (`orders.status`)

Source: `docs/be/be_code_summary/DB_SCHEMA_SUMMARY.md:199` — `ENUM('pending','confirmed','preparing','ready','delivered','cancelled','paid')`.
Transition: `pending → confirmed → preparing → ready → delivered → paid` (`:213`).

| Status | VN label (StatusBadge) | Meaning |
|---|---|---|
| `pending` | Chờ xác nhận | Created, awaiting restaurant confirm |
| `confirmed` | Đã xác nhận | Restaurant accepted |
| `preparing` | Đang làm | Being cooked |
| `ready` | Sẵn sàng | Ready to serve |
| `delivered` | Đã giao | All dishes served — order done |
| `cancelled` | Đã huỷ | Cancelled |
| `paid` | Đã thanh toán | Paid at POS |

---

## Order Status — Which Element Each Appears In

Rows = status. Columns = the **status-gated** UI elements (zones that are always visible — A,B,C,D,E — are omitted; they render at every status).

| Status | VN label | StatusBadge | Progress bar | Edit qty (stepper) | Cancel item/combo | G · Huỷ toàn bộ | F · Completed banner | H · Theo dõi bàn + Thêm món | H · Đặt thêm món |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `pending` | Chờ xác nhận | ✅ | ✅ | ✅ (if `qty_served=0`) | ✅ (if `remaining>0`) | ❌ (not confirmed/preparing) | ❌ | ✅ | ❌ |
| `confirmed` | Đã xác nhận | ✅ | ✅ | ✅ | ✅ | ✅ (if `progress<30`) | ❌ | ✅ | ❌ |
| `preparing` | Đang làm | ✅ | ✅ | ✅ | ✅ | ✅ (if `progress<30`) | ❌ | ✅ | ❌ |
| `ready` | Sẵn sàng | ✅ | ✅ | ✅ | ✅ | ❌ (not confirmed/preparing) | ❌ | ✅ | ❌ |
| `delivered` | Đã giao | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `cancelled` | Đã huỷ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `paid` | Đã thanh toán | ✅ | ✅ | ⚠️ ✅ | ⚠️ ✅ (if `remaining>0`) | ❌ | ❌ | ⚠️ ✅ | ❌ |

- **Edit qty / Cancel item / Theo dõi bàn + Thêm món** columns are all gated on `isActive` — true for every status **except** `delivered` and `cancelled`.
- **H buttons require `order.table_id`** (take-away orders with no table show no Zone H at all).
- `Đặt thêm món` (re-order) shows for the two terminal-from-`isActive` states (`delivered`, `cancelled`) when `table_id` present.

> ⚠️ **FLAG — `paid` is treated as active.** `isActive` only excludes `delivered`/`cancelled`, so a `paid` order still renders the qty stepper, per-item Cancel, and "Thêm món". If a customer reaches this page after payment, they could still edit/cancel/add. Confirm with BE whether `paid` should be excluded from `isActive` (`[id]/page.tsx:232`).

---

## DishRow — Action Buttons / Controls Per Item

Gating is per-item, not by order status directly (but all require `isActive`).

| Control | Condition | Effect |
|---|---|---|
| QuantityStepper | `isActive && item.qty_served === 0` (`:695`) | `patchOrderItemQty(itemId, qty)` → `PATCH /orders/items/:id` |
| "Huỷ" (per item) | `remaining > 0 && isActive` (`:764`) | opens M2 → `DELETE /orders/items/:id` |
| "Huỷ N món còn lại của {combo}" | combo has `remaining.length > 0 && isActive` (`:364`) | opens M2 (`combo-remaining`) → multi `DELETE /orders/items/:id` |
| "Huỷ" (summary table row) | `row.remaining > 0 && isActive` (`:485`) | opens M2 (`combo-remaining`) for that product's remaining items |

> No status-**advancing** buttons on this page — the customer can only **cancel** or **adjust qty**.
> Status advances (confirm → preparing → ready → delivered) happen staff-side (KDS/Overview) and arrive here via SSE.

---

## Zone G — Cancel Whole Order — Rules

- Button "Huỷ toàn bộ đơn hàng" visible **only** when `canCancelOrder` = `progress < 30 && (status === 'confirmed' || status === 'preparing')` (`:233`, `:550`).
- ⚠️ Therefore **`pending` cannot be whole-order cancelled** from this button (only `confirmed`/`preparing` can) — pending users must cancel item-by-item.
- Opens M2 confirm → `DELETE /orders/:id` → toast "Đã huỷ đơn hàng" → redirect `/menu` (`:64–66`).

---

## M1 — Notification Modal — Rules

Driven by **SSE events** (a status *transition*), not by the stored `order.status` render. Source: `useOrderSSE.ts` `order_status_changed` / `order_cancelled`.

| `notification.kind` | Triggered by SSE | Modal content |
|---|---|---|
| `confirmed` | `order_status_changed` → `status === 'confirmed'` (carries optional `eta`) | "Nhà hàng đã nhận đơn!" + ETA |
| `ready` | `order_status_changed` → `status === 'ready'` | "Đến lượt bàn của bạn!" |
| `cancelled` | `order_status_changed` → `'cancelled'` **or** `order_cancelled` event | "Đơn hàng đã bị huỷ" |

- No modal for `preparing`, `delivered`, `paid` transitions.
- `order_completed` SSE event sets status `delivered` and stops the stream — surfaces as Zone F banner, **not** a modal (`useOrderSSE.ts`).
- Dismiss → `clearNotification()` sets `notification = null`.

---

## Zone C / D / E — Per-Zone Rules

- **Zone C (Order card):** dish rows hidden when `collapsed`; combo sub-items grouped by `combo_ref_id` and individually collapsible. Shows `total_amount`, elapsed minutes, and `X/Y phần đã ra` + per-note counts.
- **Progress bar:** width = `progress%` (served/total qty) — independent of status; always rendered.
- **Zone D (Chi tiết món):** one row per `product_id` (grouped), columns SL · Ra · Còn · Đơn giá · Tổng; per-row "Huỷ" on remaining. Collapsible.
- **Zone E (Money summary):** "Đã dùng" = `unit_price × qty_served`; "Còn lại" row only when `remainingAmount > 0`; "Tổng cộng" = `order.total_amount`.

---

# Data Management — FE & BE (current state, traced to code)

> How the order data behind this page is fetched, stored, mutated and pushed live.
> Read-only audit — describes the code as it is today, no changes proposed.

## 1. The single data object the page renders

Everything on screen derives from **one `Order` object** (`fe/src/types/order.ts:44`), shaped by BE in `orderJSON()` (`be/internal/handler/order_handler.go:345-421`):

| Field | Type | Drives |
|---|---|---|
| `id` · `order_number` | string | header, identity |
| `status` | OrderStatus enum | StatusBadge, all status gates (`isActive`, `canCancelOrder`) |
| `source` | `online` \| `qr` \| `pos` | — (carried, not shown here) |
| `table_id` · `table_name` | string \| null | Zone H gate (`order.table_id`), "Bàn {table_name}" title |
| `total_amount` | number (ParsePrice → number) | Zone E "Tổng cộng" |
| `items[]` | OrderItem[] | every dish row, progress, money math |

Each `items[]` entry (`order.ts:15`, built at `order_handler.go:389-402`) carries `quantity`, `qty_served`, `unit_price`, `note`, `filling`, `toppings_snapshot`, `combo_id`/`combo_ref_id`, and `item_status` (BE-derived `pending`/`preparing`/`done` — `order_service.go:748`). **FE does not store `item_status`**; it re-derives progress from `qty_served` vs `quantity` instead (`useOrderSSE.ts:152`).

## 2. FE data management — there is no TanStack Query cache for this page

Despite the project rule "server state → TanStack Query", this page is driven by the **custom `useOrderSSE` hook** (`fe/src/hooks/useOrderSSE.ts`), which holds the order in **React `useState`**, not the Query cache. Three layers:

1. **localStorage cache (instant paint):** on mount, reads `ORDER_CACHE + id` and seeds `order` so the page shows last-known data before any network call (`useOrderSSE.ts:33-38`). Persisted back on every `order` change (`:41-46`). Key constant lives in `src/lib/storage-keys.ts` (`ORDER_CACHE`).
2. **REST snapshot (source of truth):** `GET /orders/{id}` fetched once on connect (`:56`) → `setOrder(data.data)`. A `404` flips `isNotFound` → not-found screen.
3. **SSE deltas (live patches):** opens `GET /orders/{id}/events` and mutates the in-memory `order` per event (see §4).

⚠️ **FLAG — two client stores referenced but only written, never read for display:**
- `useCartStore.setTableId` / `setActiveOrderId` are called from Zone H ("Theo dõi bàn", "Thêm món") to seed the cart before navigating away (`[id]/page.tsx:42-43`) — they do **not** feed this page's render.
- The `react-query` `useMutation`s below DO call `queryClient.invalidateQueries(['order', id])` on success (`:59`), but **nothing populates that query key** — the page reads from `useOrderSSE` state, so the invalidation is a no-op on this screen. Refresh comes from the SSE `item_progress` / status events instead.

## 3. FE → BE mutations (the only writes this page makes)

All four are plain axios calls via `useMutation`; the customer can only **adjust qty** or **cancel** — never advance status.

| UI control | FE call | HTTP | BE handler | BE service effect |
|---|---|---|---|---|
| QuantityStepper | `patchOrderItemQty(itemId, qty)` (`api-client.ts`) | `PATCH /orders/items/:id/quantity` | `UpdateItemQuantity` (`order_handler.go:233`) | `UpdateOrderItemQuantity` → recalc `total_amount` |
| "Huỷ" per item / combo-remaining | `api.delete('/orders/items/'+id)` | `DELETE /orders/items/:id` | `CancelItem` (`:215`) | `CancelOrderItem` → delete row + recalc total |
| Zone G "Huỷ toàn bộ" | `api.delete('/orders/'+id)` | `DELETE /orders/:id` | `Cancel` (`:201`) | `CancelOrder` → status `cancelled` |
| Zone H "Thêm món" (other page posts here) | — | `POST /orders/:id/items` | `AddItemsToOrder` (`:284`) | append items + recalc total |

**Ownership / auth:** every call carries the JWT (access token from Zustand memory; SSE uses `Authorization: Bearer` header — `useOrderSSE.ts:72`). For a guest (`role === 'customer'`) the BE swaps `callerID` to `claims.TableID` so ownership is checked **by table, not user id** (`order_handler.go:144, 218-219, 241-242`). A guest can only touch orders on their own table.

> Note: customer mutations do **not** optimistically patch local state. UI refresh after a cancel/qty-change relies on the BE publishing an SSE event back (§4) — except whole-order cancel, which navigates to `/menu` on success.

## 4. BE → FE realtime (Redis pub/sub → SSE)

**Channel:** BE publishes every order event to Redis channel `order:{id}` (`order_service.go:812`) and mirrors to `orders:kds` for the kitchen. The SSE endpoint `StreamOrder` (`be/internal/sse/handler.go:21`) `SUBSCRIBE`s to `order:{id}` and forwards each Redis message verbatim as an SSE frame (`handler.go:62`), plus a `: keep-alive` heartbeat. **The SSE layer adds no data — it is a pure relay** (hence FE must seed via REST first; there is no `order_init` from the server).

| BE publishes | When (service fn) | FE handler (`useOrderSSE.ts`) | Effect on page |
|---|---|---|---|
| `order_status_changed` `{status, eta?}` | `UpdateOrderStatus` (`order_service.go:550`), auto-ready (`:743`) | `:87` patch `order.status`; raise M1 modal for `confirmed`/`ready`/`cancelled` | StatusBadge, gates, notification modal |
| `order_cancelled` | `CancelOrder` (`:591`) | `:98` set status `cancelled`, M1 modal, **stop stream** | terminal |
| `item_progress` `{item_id, qty_served, quantity, item_status}` | `publishItemEvent` after `UpdateItemServed` by chef (`:720, 940`) | `:104` patch that item's `qty_served` | progress bar, "X/Y phần đã ra", money |

⚠️ **FLAG — two FE SSE branches the BE never emits:** `order_init` (`:84`) and `order_completed` (`:118`). A grep of `be/internal/` shows neither string is ever published. The `delivered` state actually arrives as `order_status_changed {status:"delivered"}`, and Zone F's "đã hoàn thành" banner renders from the **snapshot `order.status`**, not from an `order_completed` event. The existing M1 section above (line ~123) describing an `order_completed` event is therefore **inaccurate vs current BE** — the event does not exist. (Documenting only; no fix made.)

## 5. Data lifecycle (one customer session)

```
mount ──▶ read localStorage(ORDER_CACHE+id) ──▶ paint stale order (maybe)
        └▶ GET /orders/:id ───────────────────▶ setOrder(snapshot)  [404 ⇒ not-found]
        └▶ open SSE /orders/:id/events
              ├ item_progress      ⇒ patch items[].qty_served ⇒ progress/money update
              ├ order_status_changed ⇒ patch status + M1 modal
              └ order_cancelled    ⇒ status=cancelled + stop
   every setOrder ⇒ write back to localStorage(ORDER_CACHE+id)
   user qty/cancel ⇒ PATCH/DELETE ⇒ BE recalc + publish ⇒ SSE patches state back
```

**Persistence boundary:** the order itself lives in **MySQL** (`orders` + `order_items`); Redis holds only the **pub/sub channel** and the daily `order:seq:*` counter (`order_service.go:774`) — it is not the order store. The browser's localStorage is a **display cache only**; it is never authoritative and is overwritten by the next REST/SSE update.
