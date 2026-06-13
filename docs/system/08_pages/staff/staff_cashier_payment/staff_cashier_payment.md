# Cashier Payment — `/cashier/payment/:id`

> **TL;DR:** ✅ implemented · cashier+ (AuthGuard + RoleGuard minRole=CASHIER) · Bill + payment
> screen: printable receipt card, payment-method picker (Tiền mặt / VNPay / MoMo / ZaloPay),
> QR display for gateway methods with optional proof upload. COD completes instantly;
> QR methods wait for `payment_success` over a dedicated WS, then `window.print()` → back to `/pos`.

---

## ASCII Wireframe

```
Before payment created:                      QR method pending:
┌──────────────────────────────────┐         ┌──────────────────────────────────┐
│ [← Quay lại] Thanh Toán Đơn #42  │         │ (same receipt card on top)       │
├──────────────────────────────────┤         ├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │         │ ┌──────────────────────────────┐ │
│ │        Bánh Cuốn             │ │ receipt │ │   Quét mã — MoMo             │ │
│ │    Hoá đơn thanh toán        │ │ card    │ │   ┌──────────────┐           │ │
│ │ Đơn #     BC-0042            │ │ (also   │ │   │   QR image   │           │ │
│ │ Bàn       03                 │ │ printed)│ │   │   224×224    │           │ │
│ │ ──────────────────────────── │ │         │ │   └──────────────┘           │ │
│ │ 2× Bánh cuốn thịt   70.000đ  │ │         │ │  ⏳ Đang chờ thanh toán...   │ │
│ │ 1× Canh mọc         10.000đ  │ │         │ └──────────────────────────────┘ │
│ │ ──────────────────────────── │ │         │ ┌──────────────────────────────┐ │
│ │ Tổng cộng           80.000đ  │ │         │ │ Upload ảnh xác nhận (tuỳ     │ │
│ │     Cảm ơn quý khách!        │ │         │ │ chọn)  [choose file]         │ │
│ └──────────────────────────────┘ │         │ └──────────────────────────────┘ │
├──────────────────────────────────┤         └──────────────────────────────────┘
│ Phương thức thanh toán           │
│ [Tiền mặt][VNPay]                │           On payment_success (WS) or COD:
│ [MoMo]    [ZaloPay]              │           toast → window.print() → /pos
│ [ Xác nhận COD / Tạo QR … ]      │
└──────────────────────────────────┘
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Header | inline JSX in `cashier/payment/[id]/page.tsx` | — |
| Receipt card | inline JSX (print-friendly; controls carry `.no-print`) | `GET /orders/:id` |
| Method picker | inline 2×2 button grid (`cod/vnpay/momo/zalopay`, default `cod`) | local state |
| Create payment | mutation | `POST /payments { order_id, method }` |
| QR block | inline `<img>` | `payment.qr_code_url` |
| Proof upload | inline file input | `PATCH /payments/:id/proof` (multipart `image`) |
| WS listener | raw `WebSocket` to `/ws/orders-live?token=` with exponential backoff | `payment_success` event |

## Key Interactions

- Pick method → **Xác nhận COD** (cash: payment `completed` immediately → toast → print → `/pos`)
  or **Tạo QR <method>** (gateway: payment `pending`, QR shown).
- Gateway webhook confirms server-side → WS `payment_success` for this order → toast with amount →
  `window.print()` (receipt only, `.no-print` hides controls) → redirect `/pos`.
- Optional: upload proof screenshot while waiting.
- **← Quay lại** → browser back (normally `/pos`).

## Business Logic Used

- Payment methods, webhook verification, completion rules → [../02_spec/BUSINESS_RULES.md §4 Payment Rules](../02_spec/BUSINESS_RULES.md#4-payment-rules)
- Order must be `ready`/served before payment per flow → [../02_spec/BUSINESS_RULES.md §2.1 State Machine](../02_spec/BUSINESS_RULES.md#21-state-machine-happy-path)
- WS auth + reconnect/backoff pattern → [../02_spec/BUSINESS_RULES.md §6 Realtime Config](../02_spec/BUSINESS_RULES.md#6-realtime-config)
- Print/receipt handling on FE → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (payment flow)
