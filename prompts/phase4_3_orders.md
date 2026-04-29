# Phase 4.3 — Orders Backend + SSE
> Most complex backend task — 3 sub-sessions (a, b, c). One sub-session at a time.
> Dependency: Task 4.2 products working ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §4.1 §4.2 §4.5 §5.2 (order state machine, cancel rule, active order, SSE config)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec_4_Orders_API.docx`
- [ ] `Task/Task 1 data base/005_orders_sql_v1.2.docx`
- [ ] `Task/BanhCuon_DB_SCHEMA_SUMMARY.md`
- [ ] `contract/API_CONTRACT_v1.1.docx` §4 §10.2

---

## Sub-session A Prompt: CreateOrder + Combo Expand

```
You are the BE Dev for the BanhCuon system.

I have pasted the docs listed above.

## Task 4.3a: order_service CreateOrder + combo expand logic

Implement be/internal/service/order_service.go — CreateOrder only.

CreateOrder flow:
1. Check Bloom filter bloom:order_exists (fast path)
2. GetActiveOrderByTable → if exists, return 409 ORDER_001 (1 table = 1 active order rule)
3. Generate order_number: INCR order_seq:{YYYYMMDD} in Redis TTL 2d → format ORD-YYYYMMDD-NNN
   Fallback: INSERT ... ON DUPLICATE KEY UPDATE last_seq = last_seq + 1
4. Start DB transaction
5. INSERT into orders table (source field required, NO payment_method)
6. For each item in payload:
   - If combo_id set: query combo_items → INSERT 1 parent header row + N sub-item rows
     (sub-items have combo_ref_id pointing to parent row)
   - If product_id only: INSERT single order_item row
7. RecalculateTotalAmount(orderID) inside same transaction
8. Commit transaction
9. Publish WS event new_order to kds:channel (Redis pub/sub)
10. Set table_order:{tableID} in Redis TTL 24h

🚨 total_amount is DENORMALIZED — RecalculateTotalAmount MUST be called.
   Silent drift = payment charges wrong amount.

## Definition of Done
- [ ] POST /orders creates order_items with correct combo expand (parent + sub-items)
- [ ] Second order on same table returns 409 ORDER_001
- [ ] order_number format is ORD-YYYYMMDD-NNN
- [ ] total_amount is correct after creation
- [ ] go build ./... passes
```

---

## Sub-session B Prompt: CancelOrder + UpdateItemStatus + State Transitions

```
You are the BE Dev for the BanhCuon system. 
Task 4.3a (CreateOrder) is complete.

I have pasted the docs listed above.

## Task 4.3b: CancelOrder + UpdateItemStatus + state machine transitions

Add to be/internal/service/order_service.go:

CancelOrder:
1. Get order — if not found, 404
2. SumQtyServedAndQuantity → if ratio >= 0.30, return 422 ORDER_002
3. UPDATE status='cancelled'
4. Publish SSE event order_status_changed to order:{orderID}:channel
5. DEL table_order:{tableID} from Redis
6. If payment exists and status='completed' → trigger refund flow

UpdateItemStatus (KDS chef clicks):
1. Get current item (derive status from qty_served — no status column)
2. Cycle: pending → preparing → done (increment qty_served)
3. 🚨 If inventory deduction fails: ROLLBACK entire transaction → return 409 (NOT 500)
4. Check if all items done → if yes, UPDATE order.status='ready'
5. Publish SSE event item_progress to order:{orderID}:channel
6. Broadcast WS to kds:channel and orders-live:channel

UpdateOrderStatus:
- Validate state machine transitions — no skipping
- Valid: pending→confirmed, confirmed→preparing, preparing→ready, ready→delivered
- Invalid transitions: return 422 with clear error

## Definition of Done
- [ ] Cancel < 30% served → success
- [ ] Cancel >= 30% served → 422 ORDER_002
- [ ] State machine blocks invalid transitions
- [ ] Chef click → qty_served incremented → SSE item_progress fires
- [ ] All items done → order.status auto-updates to 'ready'
- [ ] Inventory failure → full rollback → 409
- [ ] go build ./... passes
```

---

## Sub-session C Prompt: SSE Handler + Order Handler HTTP Layer

```
You are the BE Dev for the BanhCuon system.
Tasks 4.3a and 4.3b (order service) are complete.

I have pasted the docs listed above.

## Task 4.3c: SSE handler + order_handler HTTP layer

### be/internal/sse/handler.go
Set headers:
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive
  X-Accel-Buffering: no    ← required for nginx

Subscribe to Redis channel: order:{orderID}:channel
On connect: send initial order state as order_init event immediately.
Stream events until order delivered/cancelled or client disconnects.
Send ": keep-alive\n\n" every 15 seconds (prevents proxy timeout).

### be/internal/handler/order_handler.go
Wire all endpoints per API_CONTRACT §4:
- POST /api/v1/orders          — Customer/Cashier+
- GET /api/v1/orders           — Cashier+, filter by status/date
- GET /api/v1/orders/:id       — Auth, customers can only see their own order
- PATCH /api/v1/orders/:id/status — Cashier+
- DELETE /api/v1/orders/:id    — Customer/Cashier+ (cancel)
- PATCH /api/v1/orders/:id/items/:itemId/status — Chef+ (cycle status)
- PATCH /api/v1/orders/:id/items/:itemId/flag   — Chef+
- GET /api/v1/orders/:id/events — Auth, SSE stream

## Definition of Done
- [ ] GET /orders/:id/events streams events to client in real-time
- [ ] order_init event sent on connect with current order state
- [ ] Heartbeat ": keep-alive\n\n" sent every 15 seconds
- [ ] X-Accel-Buffering: no header present
- [ ] Customer cannot access another customer's order (403)
- [ ] go build ./... passes
```
