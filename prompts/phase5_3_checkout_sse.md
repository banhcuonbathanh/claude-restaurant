# Phase 5.3 — Checkout & Order Tracking (SSE)
> Dependency: Task 5.2 cart ✅ + Task 4.3 orders API ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §4.2 §5.2 (cancel rule, SSE config)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec_3_Menu_Checkout_UI_v2.docx`
- [ ] `claude/CLAUDE_FE.docx`
- [ ] `contract/API_CONTRACT_v1.1.docx` §4 §10.2

---

## Prompt

```
You are the FE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §4.2+§5.2, ERROR_CONTRACT, Spec_3_Menu, 
CLAUDE_FE.docx, and API_CONTRACT §4+§10.2 above.

## Task: Build checkout page + order tracking + SSE hook (Task 5.3)

### Step 1: fe/src/app/(shop)/checkout/schema.ts
Zod schema:
  customer_name: z.string().min(2).max(100)
  customer_phone: z.string().regex(/^(0|\+84)[0-9]{9}$/)
  note: z.string().max(500).optional()
  payment_method: z.enum(['vnpay', 'momo', 'zalopay', 'cash'])

### Step 2: fe/src/app/(shop)/checkout/page.tsx
Guard: if cartStore.itemCount === 0 → redirect /menu immediately.
Show order summary from cartStore (items, total).
On submit:
  1. Store payment_method in cartStore BEFORE API call
  2. Build POST /orders payload:
     🔴 DO NOT include payment_method in payload
     MUST include: source ('qr' if tableId set, else 'online'), items array
  3. On success: cartStore.clearCart() → redirect /order/{data.id}
  4. On ORDER_001 (409): toast "Bàn này đang có đơn chưa hoàn thành"

### Step 3: fe/src/hooks/useOrderSSE.ts
const WS_RECONNECT = { maxAttempts: 5, baseDelay: 1000, maxDelay: 30_000, showBannerAfter: 3 }

function useOrderSSE(orderId: string):
  - Read accessToken from Zustand store — NEVER from localStorage
  - Connect to: GET /api/v1/orders/{orderId}/events
  - Auth: Authorization: Bearer {token} header — NOT query param (SSE supports headers)
  - Handle events: order_status_changed, item_progress, order_completed
  - Reconnect with exponential backoff: delay = min(baseDelay * 2^attempt, maxDelay)
  - Track reconnect attempts → set connectionError=true after showBannerAfter failures
  - Cleanup EventSource on component unmount

### Step 4: fe/src/app/(shop)/order/[id]/page.tsx
Call useOrderSSE(orderId) on mount.
Show progress bar: Math.round((totalServed / totalQty) * 100)%
List each order_item with StatusBadge + qty_served/quantity indicator.
Cancel button: visible ONLY when progress < 30 AND status !== 'delivered' AND status !== 'cancelled'
  On cancel: show confirmation modal → DELETE /orders/:id → handle ORDER_002 (422)
Show <ConnectionErrorBanner /> when connectionError=true (after 3 failed SSE reconnects)

## Definition of Done
- [ ] POST /orders payload has NO payment_method field, HAS source field
- [ ] SSE connects with Authorization: Bearer header (verify in DevTools Network tab)
- [ ] Token read from Zustand store, never localStorage
- [ ] Progress bar updates in real-time on item_progress SSE event
- [ ] Cancel button visible only when < 30% done AND not final status
- [ ] ConnectionErrorBanner appears after 3 failed SSE reconnect attempts
- [ ] All prices formatted with formatVND()
- [ ] npx tsc --noEmit passes
```
