# Checkout — `/checkout`

> **TL;DR:** ✅ implemented · guest/customer · Order form for the **non-table** path (no QR table
> bound): order summary, name + phone (RHF + Zod), note, payment method radio, fixed submit bar.
> The QR dine-in path **skips this page entirely** — it confirms via `TableConfirmModal` on `/menu`.
> 🔮 PLANNED: this page is the natural home of the online-ordering flow (order from home,
> pickup/delivery) once customer accounts exist.

---

## ASCII Wireframe

```
┌────────────────────────────────────────────────┐
│ [← Quay lại]  Xác Nhận Đơn Hàng                │ ← sticky header
├────────────────────────────────────────────────┤
│ ĐƠN HÀNG CỦA BẠN                               │ ← order summary card
│ 2x Bánh cuốn thịt                  70.000đ     │
│   + Chả lụa, Hành phi                          │
│ 1x Canh mọc                        10.000đ     │
│ ──────────────────────────────────────────     │
│ Tổng cộng                          80.000đ     │
├────────────────────────────────────────────────┤
│ THÔNG TIN LIÊN HỆ                              │ ← contact card (RHF+Zod)
│ [ Họ tên * ____________________ ]              │
│ [ Số điện thoại * _____________ ]              │
│ [ Ghi chú (tuỳ chọn) __________ ]              │
├────────────────────────────────────────────────┤
│ PHƯƠNG THỨC THANH TOÁN                         │ ← payment card
│ (•) 💵 Tiền mặt COD   ( ) 💳 VNPay             │
│ ( ) 📱 MoMo           ( ) 🏦 ZaloPay           │
├────────────────────────────────────────────────┤
│      [ Đặt hàng · 80.000đ ]                    │ ← fixed submit bar
└────────────────────────────────────────────────┘
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Order summary | inline JSX in `checkout/page.tsx` | `useCartStore` items + `formatVND` |
| Contact form | RHF + Zod (`customer_name`, `customer_phone` regex `^(0|+84)[0-9]{9}$`, `note`) | local form |
| Payment method | radio group (`vnpay/momo/zalopay/cash`, default `cash`) | local form → `cart.setPaymentMethod` |
| Submit | fixed bottom button | `POST /orders` via `buildOrderItemsPayload(cart.items)` |

## Key Interactions

- Empty cart on mount → `router.replace('/menu')` (nothing to check out).
- **Đặt hàng** → `POST /orders` `{ source: cart.tableId ? 'qr' : 'online', table_id, items }`:
  - success → caches full order in localStorage (`ORDER_CACHE` key), clears cart,
    `router.replace('/order/:id')` (client-side nav keeps the in-memory token).
  - error `TABLE_HAS_ACTIVE_ORDER` → redirect to the existing `/order/:active_order_id`.
  - other errors → toast with server message.

## Business Logic Used

- Single order-payload builder (no hand-rolled `items[]`) → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (order payload, order cache)
- One active order per table → [../02_spec/BUSINESS_RULES.md §2.3](../02_spec/BUSINESS_RULES.md#23-one-active-order-per-table)
- Payment methods + when payment actually happens → [../02_spec/BUSINESS_RULES.md §4 Payment Rules](../02_spec/BUSINESS_RULES.md#4-payment-rules)
