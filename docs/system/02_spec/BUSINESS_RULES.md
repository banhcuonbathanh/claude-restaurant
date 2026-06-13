# Business Rules — Summary Reference

> **TL;DR:** This is a condensed reference for RBAC, order rules, payment rules, cancel rules, and
> JWT/auth config. The single source of truth for business logic is
> `docs/system/07_business_logic/` ([LOGIC_INDEX.md](../07_business_logic/LOGIC_INDEX.md)) together
> with this file. **Any change to business logic or flow MUST first consult and update
> `docs/system/07_business_logic/` (LOGIC_INDEX.md).**
>
> Status markers: ✅ implemented · 🔮 PLANNED (owner decision 2026-06-12, not in code yet) ·
> ⚠️ DRIFT (target rule differs from current code).

---

## 1. RBAC Role Hierarchy

```
admin  ⊃  manager  ⊃  staff  ⊃  (chef | cashier)  ‖  customer (isolated)
```

| Role | Hierarchy | Primary Screens | Who Creates |
|---|---|---|---|
| `admin` | Top — full access | All | System / owner |
| `manager` | Manages staff, cashier, chef | `/admin/overview` + all staff screens | Admin |
| `staff` | Cashier + cancel rights | `/pos`, `/kds` | Manager+ |
| `cashier` | POS + payment | `/pos`, `/cashier/payment/:id` | Manager+ |
| `chef` | KDS only | `/kds` | Manager+ |
| `customer` | Isolated — no staff permissions | `/menu`, `/order/:id`, `/tracking` | Auto (guest JWT on QR scan) |

Middleware patterns (Go):

```go
RequireRole("admin", "manager")  // whitelist specific roles
AtLeastRole("staff")             // role >= staff in hierarchy
RequireOwner()                   // owner of resource OR admin/manager
```

> Never hardcode role checks inside handlers — always use middleware.

---

## 2. Order Rules

### 2.1 State Machine (happy path)

```
pending → confirmed → preparing → ready → delivered
```

Cancel path (current code): `pending / confirmed / preparing → cancelled` (if < 30% served).
🔮 Target rule (owner decision 2026-06-12): customer may cancel at **any time before payment is
completed** — including at `ready` — ⚠️ DRIFT, see §3.

### 2.2 Transition Permissions

| Transition | From | To | Who |
|---|---|---|---|
| Create order | — | pending | customer, cashier, staff |
| Confirm | pending | confirmed | cashier, staff, manager |
| Start cooking | confirmed | preparing | chef, staff |
| Finish cooking | preparing | ready | chef, staff (or auto) |
| Deliver | ready | delivered | cashier, staff (via payment) |
| Cancel | pending/confirmed/preparing | cancelled | customer (own), cashier, staff, manager |
| Cancel 🔮 TARGET | ready (anytime before payment) | cancelled | customer (own), cashier, staff, manager — ⚠️ DRIFT, current code blocks |

### 2.3 One Active Order Per Table

> 1 table = max 1 order with status in (`pending`, `confirmed`, `preparing`, `ready`) at a time.

- `delivered` and `cancelled` are not active
- Server returns `409 TABLE_HAS_ACTIVE_ORDER` if violated
- FE must redirect to the existing order — never show a generic error

### 2.4 Item Status (Derived — No Column)

| Condition | Status |
|---|---|
| `qty_served = 0` | `pending` |
| `0 < qty_served < quantity` | `preparing` |
| `qty_served = quantity` | `done` |

> Do NOT add a `status` column to `order_items`. Detail: `../07_business_logic/LOGIC_INDEX.md`

### 2.5 Combo Expansion

When creating an order with a combo, the backend creates:
- 1 header row (`combo_id` set, `unit_price = 0`)
- N sub-item rows (`combo_ref_id` = header row ID)

`recalculateTotalAmount()` must be called after every `order_items` mutation.

---

## 3. Cancel Rules

### 3.1 Target rule (owner decision 2026-06-12) — 🔮 not in code yet

> A customer can cancel their meal/order (single items or the whole order) at **any time before
> payment is completed**. This replaces the "< 30% served" rule for customers.

### 3.2 Current code behaviour — ⚠️ DRIFT, BE change pending

```
cancel_allowed = SUM(qty_served) / SUM(quantity) < 0.30
```

| Condition | Result (current code) |
|---|---|
| < 30% served | Cancel allowed |
| >= 30% served | `422 CANCEL_THRESHOLD` |
| Status = `ready` or `delivered` | Cancel blocked (regardless of ratio) |

### 3.3 Who can cancel

| Actor | Item | Order | Condition |
|---|---|---|---|
| Customer | Own order items only | Own order only | current code: < 30% · 🔮 target: anytime before payment (⚠️ DRIFT) |
| Chef | No (KDS status update only) | No | — |
| Cashier / Staff / Manager | Any | Any | current code: < 30% |

Cancelled orders with existing payment → server triggers refund flow.
Detail: `../07_business_logic/LOGIC_INDEX.md`

---

## 4. Payment Rules

| Rule | Detail |
|---|---|
| When to create | Only when `order.status = "ready"` → `409 ORDER_NOT_READY` otherwise |
| One row per order | `UNIQUE(order_id)` — retries must `UPDATE` (not `INSERT`) |
| Webhook idempotency | Check `payment.status = "completed"` before any logic — webhooks repeat |
| HMAC verify first | Always verify gateway signature before any DB query |
| Amount verify | Webhook amount must match `payment.amount` in DB |
| No hard delete | Audit trail — `deleted_at` only |
| Methods | VNPay QR · MoMo QR · ZaloPay QR · Cash (COD) |

Detail: `../07_business_logic/LOGIC_INDEX.md` + [`../01_flow/PAYMENT_FLOW.md`](../01_flow/PAYMENT_FLOW.md)

---

## 5. JWT / Auth Rules

### 5.1 Token Config

| Token | TTL | Storage | Notes |
|---|---|---|---|
| Staff access token | 24 h | Zustand memory only | Sent as `Authorization: Bearer` |
| Staff refresh token | 30 d | httpOnly cookie | JS cannot read it |
| Guest JWT (customer) | 2 h | Zustand memory only | Stateless — not stored in DB |
| Redis blacklist | = remaining access TTL | `Redis: logout:{jti}` | Set on logout |

### 5.2 Guest JWT Payload

```json
{
  "sub":      "guest",
  "role":     "customer",
  "table_id": "<table UUID>",
  "jti":      "<UUID>",
  "exp":      "now + 7200"
}
```

Rules: stateless, no refresh, no DB row. On expiry → rescan QR. Rate limit: 5 req/min/IP on `POST /auth/guest`.

### 5.3 Staff JWT Payload

```json
{
  "sub":  "<staff UUID>",
  "role": "<role>",
  "jti":  "<UUID>",
  "exp":  "now + 86400"
}
```

### 5.4 Auth Middleware Steps (every authenticated request)

1. Parse + verify JWT signature (HMAC-SHA256); block algorithm confusion
2. Check Redis blacklist `logout:{jti}` → `401 TOKEN_INVALID` if found
3. Check `is_active` via Redis cache `auth:staff:{id}` (5 min TTL) → DB on miss
4. If `is_active = false` → `401 ACCOUNT_DISABLED`
5. Set `staff_id`, `role` in `gin.Context`

When admin deactivates a staff: `DEL auth:staff:{id}` immediately → near-instant effect.

### 5.5 FE Interceptor Pattern

1. Attach access token to every request
2. On `401`: call `POST /auth/refresh` (sends httpOnly cookie automatically)
3. Success: store new access token → retry original request
4. Failure: clear token → redirect `/login`

**One retry only.** Never redirect to `/login` on first 401.

Detail: `../07_business_logic/LOGIC_INDEX.md`

---

## 6. Realtime Config

### WebSocket (staff)

| Config | Value |
|---|---|
| KDS endpoint | `ws://{host}/api/v1/ws/kds?token=` |
| POS / Overview endpoint | `ws://{host}/api/v1/ws/orders-live?token=` |
| Auth | `?token=<access_token>` query param (browser WS cannot set headers) |
| Ping/pong interval | 30 s |
| Reconnect | Exponential backoff: 1 s → 2 s → 4 s → max 30 s |
| Max attempts | 5; show "Mất kết nối" banner after 3 failures |

### SSE (customer + admin events)

| Config | Value |
|---|---|
| Customer order stream | `GET /api/v1/orders/:id/stream` |
| Customer monitor | `GET /api/v1/orders/monitor/stream` |
| Admin events | `GET /api/v1/admin/events` |
| Auth | `Authorization: Bearer <token>` header |
| Redis channel | `order:{order_id}:events` |
| Heartbeat | `: keep-alive` every 15 s (prevents proxy timeout) |
| Initial event | `order_init` sent immediately on connect |
| Event types | `order_status_changed`, `item_progress`, `order_completed`, `order_cancelled` |

Detail: `../03_be/REALTIME_SSE.md` + `../07_business_logic/LOGIC_INDEX.md`

---

## Deep Dive Sources

| Topic | File |
|---|---|
| Business-logic index (single source of truth, with this file) | `../07_business_logic/LOGIC_INDEX.md` |
| Order state machine + cancel detail | `../01_flow/ORDER_STATE_MACHINE.md` |
| Realtime implementation (SSE/WS) | `../03_be/REALTIME_SSE.md` |
| API endpoints | `../02_spec/API_SPEC.md` |
| Error codes | `../02_spec/ERROR_SPEC.md` |
| DB schema | `../02_spec/DB_SCHEMA.md` |
| Payment flow | `../01_flow/PAYMENT_FLOW.md` |
