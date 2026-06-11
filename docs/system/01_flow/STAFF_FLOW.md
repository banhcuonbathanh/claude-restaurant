# Staff Flow — Login to Payment Confirm

> **TL;DR:** Staff log in once; role determines immediate redirect (chef → KDS, cashier → POS,
> manager → Overview). The three staff surfaces (KDS, POS, Overview) all feed into the same
> `/cashier/payment/:id` endpoint. WebSocket is the realtime backbone for all staff screens.

---

## Role Hierarchy

```
admin  ⊃  manager  ⊃  staff  ⊃  cashier  |  chef
```

| Role | Primary Screen | What They Can Do |
|---|---|---|
| `chef` | `/kds` | Mark items done, update order to preparing/ready |
| `cashier` | `/pos` | Create walk-in orders, process payment |
| `staff` | `/pos` | Everything cashier can + cancel any order/item |
| `manager` | `/admin/overview` | Everything staff can + confirm orders, force-cancel, view all tables |
| `admin` | `/admin/overview` | Full access |

---

## Flow Overview

```
POST /api/v1/auth/login { username, password }
    │ access_token → Zustand memory only
    │ refresh_token → httpOnly cookie (JS cannot read)
    │
    Role redirect:
    │   chef      → /kds
    │   cashier/staff → /pos
    │   manager/admin → /admin/overview
    │
    ┌─────────────────────────────────────────────────────────────┐
    │ CHEF: /kds                                                  │
    │   WS /ws/kds?token= ← receives new_order events            │
    │   Beep alert → order appears on board                      │
    │   Click item → PATCH /orders/:id/items/:itemId/status      │
    │     └─ qty_served++ ; all done → order "ready"             │
    │   Manual: PATCH /orders/:id/status { status: "ready" }     │
    └─────────────────────────────────────────────────────────────┘
    │
    ┌─────────────────────────────────────────────────────────────┐
    │ CASHIER: /pos                                               │
    │   Browse products (same /products API as menu)             │
    │   Build cart (component state, NOT Zustand, NOT localStorage)│
    │   POST /orders { source:"pos", customer_name:"Khách tại quán" }│
    │   WS watches for order_status_changed { status:"ready" }   │
    │   Auto-redirect → /cashier/payment/:id                     │
    └─────────────────────────────────────────────────────────────┘
    │
    ┌─────────────────────────────────────────────────────────────┐
    │ MANAGER: /admin/overview                                    │
    │   Dual realtime: SSE /api/v1/admin/events                  │
    │                + WS /ws/orders-live?token=                 │
    │   WS new_order → popup "Xác nhận" / "Bỏ qua"              │
    │   "Xác nhận" → PATCH /orders/:id/status { confirmed }      │
    │   Table grid: click table → view active order              │
    └─────────────────────────────────────────────────────────────┘
    │
    /cashier/payment/:id  (Cashier+ role required)
    │   Display: order number, table, items, total
    │   Select method → confirm
    │
    COD:   POST /payments { method:"cod" } → completed immediately
           toast → window.print() → /pos
    │
    QR:    POST /payments { method:"vnpay"|"momo"|"zalopay" }
           returns qr_code_url + status:"pending"
           Show QR code to customer
           WS /ws/orders-live listens for payment_success
           On event: toast → window.print() → /pos
```

---

## Step Table

| # | Step | Actor | FE Page | BE Endpoint | State Change |
|---|---|---|---|---|---|
| 1 | Login | Staff | `/login` | `POST /api/v1/auth/login` | access_token → Zustand; refresh_token → httpOnly cookie |
| 2 | 401 on any request | FE interceptor | — | `POST /api/v1/auth/refresh` | new access_token → Zustand; retry original request |
| 3 | KDS connects | Chef | `/kds` | `WS /ws/kds?token=` | order board populated |
| 4 | New order arrives | Chef | `/kds` | WS `new_order` event | order prepended; audio beep |
| 5 | Mark item done | Chef | `/kds` | `PATCH /orders/:id/items/:itemId/status` | `qty_served++` |
| 6 | All items done | System | — | auto | order → `ready`; WS pushes update |
| 7 | POS: build order | Cashier | `/pos` | `GET /api/v1/products` | cart in component state |
| 8 | POS: submit order | Cashier | `/pos` | `POST /api/v1/orders` | order → `pending`; cart cleared |
| 9 | Kitchen ready | WS | `/pos` | WS `order_status_changed` (ready) | auto-redirect → `/cashier/payment/:id` |
| 10 | Confirm order | Manager | `/admin/overview` | `PATCH /orders/:id/status` | order → `confirmed` |
| 11 | COD payment | Cashier | `/cashier/payment/:id` | `POST /api/v1/payments { method:"cod" }` | payment → `completed`; order → `delivered` |
| 12 | QR payment | Cashier | `/cashier/payment/:id` | `POST /api/v1/payments { method:"vnpay"... }` | payment → `pending`; QR code shown |
| 13 | QR payment confirmed | WS | — | WS `payment_success` | toast → print → `/pos` |
| 14 | Upload proof | Cashier | `/cashier/payment/:id` | `PATCH /api/v1/payments/:id/proof` | payment marked verified |
| 15 | Cancel item/order | Staff+ | any order view | `DELETE /orders/items/:itemId` or `DELETE /orders/:id` | item/order removed (< 30% rule) |
| 16 | Logout | Any staff | — | `POST /api/v1/auth/logout` | jti → Redis blacklist; Zustand cleared |

---

## Realtime Protocol by Staff Screen

| Screen | Protocol | Endpoint | Events |
|---|---|---|---|
| KDS `/kds` | WebSocket | `/ws/kds?token=` | `new_order`, `item_progress`, `order_cancelled`, `order_status_changed` |
| POS `/pos` | WebSocket | `/ws/orders-live?token=` | `order_status_changed` (ready), `payment_success` |
| Payment `/cashier/payment/:id` | WebSocket | `/ws/orders-live?token=` | `payment_success` |
| Overview `/admin/overview` | SSE + WebSocket | `/api/v1/admin/events` + `/ws/orders-live?token=` | `new_order`, `order_status_changed`, table updates |

**Why `?token=` for WS:** Browser WebSocket API cannot set custom headers; query param is the only option. SSE uses `Authorization: Bearer` header as normal.

---

## Cancel Permissions Summary

| Actor | Cancel Item | Cancel Order | Condition |
|---|---|---|---|
| Customer (guest) | Own order only | Own order only | < 30% served |
| Chef | Via KDS status update only | No direct cancel | — |
| Cashier | Any order | Any order | < 30% served |
| Staff | Any order | Any order | < 30% served |
| Manager | Any order | Any order | < 30% served |

---

## Auth & State Rules

| Data | Where Stored | Reason |
|---|---|---|
| Staff access token | Zustand `authStore` — **memory only** | XSS prevention |
| Staff refresh token | httpOnly cookie (server-set) | JS cannot read it |
| POS cart | Component `useState` — NOT Zustand, NOT localStorage | Single-session; dies with the component intentionally |
| KDS order board | Component state, rebuilt from WS | Always fresh from server |
| Overview tables/orders | TanStack Query + WS/SSE patches | Server is source of truth |

---

## Invariants — Never Break

1. Staff access token is **memory-only** — never touches localStorage.
2. **Refresh is automatic** — interceptor retries on 401 silently; never force-redirect to `/login` on first 401.
3. **POS cart is component state** — do not move it to Zustand or localStorage.
4. **WS uses `?token=`** — not `Authorization` header.
5. **SSE uses `Authorization: Bearer`** — not query param.
6. **COD completes immediately** — no WS wait; print receipt right after `POST /payments` response.
7. **Payment only on `ready` orders** — do not navigate to `/cashier/payment/:id` for non-ready orders.
8. **One active order per table** — FE must handle `TABLE_HAS_ACTIVE_ORDER` gracefully.

---

## Deep Dive Sources

| File | Purpose |
|---|---|
| `docs/work_flow/STAFF_ORDER_FLOW.md` | Authoritative source — read before touching staff flows |
| `docs/work_flow/FLOW_06_PAYMENT.md` | Payment flow detail |
| `docs/work_flow/FLOW_09_AUTH_TOKENS.md` | WS vs SSE token transport rules |
| `docs/core/MASTER_v1.2.md §4.1` | Order state machine + transitions |
| `docs/core/MASTER_v1.2.md §4.2` | Cancel rule (< 30% formula) |
| `docs/core/MASTER_v1.2.md §6.1–6.3` | Staff JWT config + interceptor pattern |
