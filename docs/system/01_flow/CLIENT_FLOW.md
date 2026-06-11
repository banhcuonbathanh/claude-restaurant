# Client Flow — QR Scan to Order Tracking

> **TL;DR:** Customer scans a table QR → receives a stateless 2 h guest JWT (no login, no account)
> → browses menu → submits order via `TableConfirmModal` (no name/phone — staff handles identity)
> → watches real-time progress via SSE. One active order per table is enforced server-side.

---

## Flow Diagram

```
QR Scan → /table/:qr_token
    │
    POST /api/v1/auth/guest { qr_token }
    │ guest JWT → Zustand memory only (NEVER localStorage)
    │ tableId, tableName → cartStore
    │
    Redirect → /menu
    │
    Browse products / combos
    Add to cart (Zustand)
    │
    "Thanh toán" button (appears when cart has items)
    │
    ┌─────────────────────────────────────────────┐
    │ cartStore.tableId present?                  │
    │   YES → TableConfirmModal (QR path)         │
    │   NO  → /checkout page (walk-in / web)      │
    └─────────────────────────────────────────────┘
    │ (QR path)
    TableConfirmModal: item list + total + optional note
    NO name / NO phone — staff handles identity
    │
    POST /api/v1/orders { source:"qr", table_id, items, note }
    │
    On success:
      GET /orders/:id → cache to localStorage[order_cache_<id>]
      cartStore.clearCart()  ← clears items + tableId + tableName
      window.location.replace('/order/<id>')
    │
    /order/:id  ← live SSE updates (useOrderSSE)
    │
    /order      ← order list (reads localStorage cache, no API call)
    │
    /tracking   ← live queue view (reads activeOrderId from cartStore)
```

---

## Step Table

| # | Step | Actor | FE Page / Component | BE Endpoint | State Change |
|---|---|---|---|---|---|
| 1 | Scan QR | Customer | `/table/[tableId]/page.tsx` | `POST /api/v1/auth/guest` | guest JWT → Zustand; tableId → cartStore |
| 2 | Error: table has active order | — | — | returns `TABLE_HAS_ACTIVE_ORDER` | redirect to existing `/order/:id` or `/order` |
| 3 | Browse menu | Customer | `/menu/page.tsx` | `GET /api/v1/products` `GET /api/v1/combos` | items added to Zustand cart |
| 4 | Open checkout | Customer | `TableConfirmModal` | — | shows cart items + total + optional note |
| 5 | Submit order | Customer | `TableConfirmModal` → submit | `POST /api/v1/orders` | order created, status = `pending` |
| 6 | Cache order | FE | — | `GET /api/v1/orders/:id` | order written to `localStorage[order_cache_<id>]` |
| 7 | Clear cart | FE | — | — | `clearCart()` → tableId/tableName/items wiped |
| 8 | View order | Customer | `/order/[id]/page.tsx` | `GET /api/v1/orders/:id/stream` (SSE) | real-time item progress |
| 9 | Add more items | Customer | `/menu?add_to_order=<id>` | `POST /api/v1/orders/:id/items` | new items appended to active order |
| 10 | Cancel item | Customer | `/order/[id]` | `DELETE /api/v1/orders/items/:itemId` | item removed if < 30% served |
| 11 | View order list | Customer | `/order/page.tsx` | none (localStorage read) | shows all cached orders |
| 12 | Live tracking | Customer | `/tracking/page.tsx` | `GET /api/v1/orders/monitor/stream` (SSE) | table map + queue view |

---

## SSE Events (customer receives)

| Event Type | When | What FE Does |
|---|---|---|
| `order_init` | On connect (immediate) | Populate initial order state — no separate GET needed |
| `order_status_changed` | Status transition | Update status badge; show toast |
| `item_progress` | Chef marks item done (`qty_served++`) | Update item progress bar inline |
| `order_completed` | Order → `delivered` | Show completion screen |
| `order_cancelled` | Order cancelled (by staff or self) | Redirect to `/menu` |

---

## State & Storage Rules

| Data | Where Stored | Reason |
|---|---|---|
| Guest JWT | Zustand `authStore` — **memory only** | XSS prevention — never localStorage |
| `tableId`, `tableName` | Zustand `cartStore` — not persisted | Cleared on `clearCart()` after order submit |
| `activeOrderId` | Zustand `cartStore` — **persisted** via `STORAGE_KEYS.CART_CONFIG` | Survives page refresh; needed for `/tracking` |
| Order cache | `localStorage[STORAGE_KEYS.ORDER_CACHE + id]` | Powers `/order` list without any API call |
| Cart config, drinkConfig, orderNote | `localStorage[STORAGE_KEYS.CART_CONFIG]` | Survives page refresh |

All localStorage keys come from `fe/src/lib/storage-keys.ts` — no hardcoded strings anywhere.

---

## Offline QR Rule (Critical)

> The QR path uses `TableConfirmModal`, **not** the `/checkout` page.
>
> - **No name field** — customer identity is handled by staff
> - **No phone field** — same reason
> - **Only an optional note field** is shown
> - `source: "qr"` in the order payload signals the backend to validate `table_id` against the JWT claim

Violating this rule (adding name/phone inputs to the QR path) breaks the design intent and the spec.

---

## Invariants — Never Break

1. The customer **never sees a login page** during the QR flow.
2. Guest JWT is **memory-only** — never written to localStorage or a cookie.
3. `TableConfirmModal` has **no name or phone input** on the QR path.
4. `/order` list works **without an API call** — it reads localStorage cache.
5. `clearCart()` resets `tableId` — after submit, tableId is gone until the next QR scan.
6. `TABLE_HAS_ACTIVE_ORDER` error **redirects to that order** — never shows a generic error.
7. `activeOrderId` **persists** across page reloads (in `CART_CONFIG`) so `/tracking` survives a refresh.

---

## Deep Dive Sources

| File | Purpose |
|---|---|
| `docs/work_flow/CLIENT_QR_FLOW.md` | Authoritative source — read before touching this flow |
| `docs/core/MASTER_v1.2.md §6.4` | Guest JWT spec and rules |
| `docs/core/MASTER_v1.2.md §4.5` | One active order per table rule |
| `fe/src/store/cart.ts` | Cart store: tableId, activeOrderId, clearCart |
| `fe/src/lib/storage-keys.ts` | All localStorage key constants |
