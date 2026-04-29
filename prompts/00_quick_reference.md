# Quick Reference — BanhCuon System
> Keep this open. Check here before writing any field name, command, or rule.

---

## Commands

```bash
# After any sqlc query change
sqlc generate && go build ./...

# Run one test
go test ./internal/service/... -run TestLogin

# Migrations
goose -dir migrations mysql "$DB_DSN" up
goose -dir migrations mysql "$DB_DSN" down

# Frontend type check
cd fe && npx tsc --noEmit

# Docker
docker-compose up -d
docker-compose logs -f backend
```

---

## Critical Field Names

| ❌ Never write | ✅ Always write | Where |
|---|---|---|
| `base_price` | `price` | products |
| `price_delta` | `price` | toppings |
| `image_url` | `image_path` | products, combos |
| `staff_id` (on orders) | `created_by` | orders |
| `webhook_payload` | `gateway_data` | payments |
| `'success'` | `'completed'` | payments.status |
| `order_items.status` | ❌ does not exist | derive from `qty_served` |
| `order_items.flagged` | ❌ pending Issue #5 | — |
| `slug` | ❌ does not exist | products, categories |
| `int` / `number` ID | `string` UUID | all tables |

---

## order_items Status (No Column — Derive It)

```
qty_served == 0                  → pending
0 < qty_served < quantity        → preparing
qty_served == quantity           → done
```

---

## Error Response Format

```json
{ "error": "AUTH_001", "message": "human readable" }
```
Use `respondError(c, http.StatusXxx, "CODE", "message")` — never build JSON manually.

---

## RBAC Values

| Role | Value |
|---|---|
| customer | 1 |
| chef | 2 |
| cashier | 2 |
| staff | 3 |
| manager | 4 |
| admin | 5 |

`RequireRole(4)` = Manager+. `RequireRole(2)` = Chef or Cashier+.

---

## Business Rules (One-Liners)

| Rule | Detail |
|---|---|
| 1 table = 1 active order | Check `GetActiveOrderByTable` before INSERT — 409 `ORDER_001` if exists |
| total_amount drift | Call `recalculateTotalAmount(orderId)` after EVERY `order_items` mutation |
| Cancel threshold | `SUM(qty_served) / SUM(quantity) < 0.30` — else 422 `ORDER_002` |
| Order state machine | `pending→confirmed→preparing→ready→delivered` — no skipping |
| POST /orders payload | NO `payment_method` · MUST have `source` (`qr`/`online`/`pos`) |
| POST /payments | Reject 409 if `order.status ≠ 'ready'` |
| Webhook HMAC | Verify signature FIRST — before ANY DB access |
| Webhook idempotency | `payment.status == 'completed'` → return 200, stop |
| Payment retry | UPDATE existing row — UNIQUE on `payments.order_id` |
| VNPay response | Must be exactly `{"RspCode": "00", "Message": "Confirm Success"}` |
| JWT algorithm | Verify `t.Method == jwt.SigningMethodHMAC` BEFORE parsing |
| Login error | Identical error for wrong username AND wrong password |
| Access token | Zustand in-memory ONLY — never localStorage |

---

## Realtime Config (Copy-Paste)

```typescript
const WS_RECONNECT = { maxAttempts: 5, baseDelay: 1000, maxDelay: 30_000, showBannerAfter: 3 }
```

- SSE auth: `Authorization: Bearer` header
- WS auth: `?token={accessToken}` query param
- SSE heartbeat: every 15s → `": keep-alive\n\n"`
- WS ping: every 30s · close if no pong within 10s
- Show `ConnectionErrorBanner` after 3 failed reconnects

---

## Design Tokens (Tailwind Only — No Hex in Code)

| Token | Hex | Tailwind class |
|---|---|---|
| Primary accent | `#FF7A1A` | `text-orange-500` / `bg-orange-500` |
| Background | `#0A0F1E` | `bg-[#0A0F1E]` |
| Card | `#1F2937` | `bg-gray-800` |
| Success | `#3DB870` | `text-green-500` |
| Warning | `#FCD34D` | `text-yellow-300` |
| Error/Urgent | `#FC8181` | `text-red-300` |
| Text primary | `#F9FAFB` | `text-gray-50` |
| Text muted | `#9CA3AF` | `text-gray-400` |

KDS card colors: `<10min = bg-gray-800` · `10-20min = border-yellow-300` · `>20min or flagged = border-red-300`

---

## Claude Prefix System

| Prefix | You must |
|---|---|
| 💡 SUGGESTION: | Read — decide whether to apply |
| ⚠️ FLAG: | Resolve before continuing |
| 🚨 RISK: | Stop — read carefully — decide approach |
| 🔴 STOP: | Must resolve before Claude will proceed |
| ❓ CLARIFY: | Answer the question to unblock |
| 🔄 REDIRECT: | Evaluate and confirm new direction |
