---
description: Apply whenever writing or reviewing order management, payment, or cancellation logic — on either BE or FE. Encodes the exact business rules for this Vietnamese food stall's order lifecycle.
---

# Order Flow Skill — BanhCuon Project

## Order state machine

```
Happy path:  pending → confirmed → preparing → ready → delivered
Cancel path: pending / confirmed / preparing → cancelled  (if < 30% served)
```

| Transition | From | To | Condition | Who |
|---|---|---|---|---|
| Create | — | pending | No active order on same table | customer · cashier |
| Confirm | pending | confirmed | Auto or manual | cashier · manager |
| Start cooking | confirmed | preparing | Chef accepts | chef · staff |
| Complete | preparing | ready | All items done | chef · staff |
| Deliver | ready | delivered | Cashier confirms | cashier |
| Cancel | pending/confirmed/preparing | cancelled | SUM(qty_served)/SUM(quantity) < 0.30 | customer (own) · manager |

---

## Cancel rule (exact threshold)

```
cancel_allowed = SUM(qty_served) / SUM(quantity) < 0.30
```

- **Rejected if ≥ 30% already served** → `422 CANCEL_THRESHOLD`
- Use `422 UnprocessableEntity`, NOT `409 Conflict` — this is a business rule violation, not a resource conflict
- Successful cancel → trigger payment refund if already paid

---

## Payment rules

| Rule | Detail |
|---|---|
| Payment creation allowed | Only when `order.status = 'ready'` |
| Methods | vnpay · momo · zalopay · cash |
| Webhook order | HMAC verify ALWAYS first, before any DB read |
| Idempotency | Check `payment.status` before any write — gateways retry multiple times |
| Cash payments | Cashier confirms manually — no webhook |

**Payment error → order status:** `ORDER_NOT_READY` (409) if cashier tries to pay before order is ready.

---

## One active order rule (1 table → max 1 active order)

```
active = status IN (pending, confirmed, preparing, ready)
```

- Check before INSERT into orders
- If violated → `409 TABLE_HAS_ACTIVE_ORDER` + `{ active_order_id: "..." }` in details
- FE response: redirect to `/order/:active_order_id`

---

## item_status — DERIVED, never stored

**Decision: Approach B** — status computed from `qty_served` everywhere. No `item_status` column in DB, no migration needed.

```go
// BE — service layer
func itemStatus(qtyServed, quantity int32) string {
    switch {
    case qtyServed == 0:       return "pending"
    case qtyServed < quantity: return "preparing"
    default:                   return "done"
    }
}
```

```ts
// FE — fe/src/types/order.ts
export function deriveItemStatus(qty_served: number, quantity: number): ItemStatus {
  if (qty_served === 0) return 'pending'
  if (qty_served >= quantity) return 'done'
  return 'preparing'
}
```

```sql
-- SQL filters (use qty_served math, NOT a status column)
-- pending:   WHERE qty_served = 0
-- preparing: WHERE qty_served > 0 AND qty_served < quantity
-- done:      WHERE qty_served = quantity
```

---

## recalculateTotalAmount (call after EVERY order_items mutation)

```go
// Must be inside the same transaction
err = repo.RecalculateTotalAmount(ctx, tx, orderID)
```

This is mandatory after any INSERT, UPDATE, or DELETE on `order_items`. Missing it silently corrupts the order total.

---

## Realtime: order events (SSE)

- Endpoint: `GET /orders/:id/events` — SSE stream
- Who can subscribe: order owner (customer) + Staff+
- Events pushed on: status change · item qty_served update · cancellation
- Reconnect: exponential backoff, max 5 attempts, show `ConnectionErrorBanner` after 3 fails
