# Phase 5.5 — POS Cashier + Payment UI
> Dependency: Task 4.5 payments backend ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §2 §4.3 §5.1 (design tokens, payment rules, WS config)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec_5_Payment_Webhooks.docx` (POS UI + payment flow spec)
- [ ] `claude/CLAUDE_FE.docx`
- [ ] `contract/API_CONTRACT_v1.1.docx` §5

---

## Prompt

```
You are the FE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §2+§4.3+§5.1, ERROR_CONTRACT, Spec_5_Payments,
CLAUDE_FE.docx, and API_CONTRACT §5 above.

## Task: Build POS cashier screen + payment UI (Task 5.5)

### Step 1: fe/src/app/(dashboard)/pos/page.tsx
Role guard: RequireRole(2) = Cashier/Staff/Manager/Admin only.

2-column layout:
- Left: menu browse — CategoryTabs + ProductGrid (reuse components from Task 5.2)
- Right: current order summary — item list, total, action buttons

When cashier adds items and clicks "Tạo Đơn":
POST /orders with:
  customer_name: "Khách tại quán"
  customer_phone: "0000000000"  
  source: "pos"
  items: [...from cart]
  (NO payment_method in payload)

When order.status becomes 'ready' → navigate to /cashier/payment/{orderId}

### Step 2: fe/src/app/(dashboard)/cashier/payment/[id]/page.tsx
Show: order total, payment method selector.

QR payment flow:
  1. POST /api/v1/payments with { order_id, method: 'vnpay'/'momo'/'zalopay' }
  2. Response includes qr_code_url
  3. Display: <img src={qr_code_url} alt="QR Code" />
  4. Subscribe to WS /api/v1/ws/payments?token={accessToken}
  5. On WS event payment_success with matching payment_id:
     - Show toast "Thanh toán thành công"
     - Call window.print()
     - Redirect to /pos

COD flow:
  1. POST /api/v1/payments with { order_id, method: 'cash' }
  2. Response status='completed' immediately
  3. Show toast → window.print() → redirect /pos

Print receipt:
  @media print { .no-print { display: none } }
  Only receipt content visible when printing.
  Receipt includes: order number, items, total, payment method, timestamp.

Optional: PATCH /payments/:id/proof — upload proof image for cashier records.

## Definition of Done
- [ ] POS 2-column layout: menu browse on left, order on right
- [ ] POST /orders from POS uses source='pos' (not 'online' or 'qr')
- [ ] QR payment shows QR image from gateway
- [ ] WS payment_success event triggers toast + print + redirect
- [ ] COD payment: immediate success, no QR shown
- [ ] Print hides .no-print elements correctly
- [ ] Cashier role guard — non-cashier roles see 403
- [ ] npx tsc --noEmit passes
```
