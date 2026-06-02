# Admin Overview — Status Reference

## Page Layout

| Zone | Component | Title | When visible |
|---|---|---|---|
| A | StatCards | — | Always |
| B | WaitingSection | Danh sách bàn cần chuẩn bị | Always — all active orders |
| C | PrepPanel | Danh sách món ăn cần chuẩn bị | Only when 🔍 Kiểm tra is active on a row |
| D | Table view | — | Always |
| E | HistoryLog | Lịch sử hôm nay | Collapsible — `cancelled` + `paid` orders from today |

---

## Table DB Statuses (`tables.status`)

| Status | Meaning |
|---|---|
| `available` | Empty, no active order |
| `occupied` | Has an active order in progress |
| `reserved` | Reserved (not yet seated) |
| `inactive` | Disabled / not in use |

---

## Order Statuses — Which Section Each Appears In

| Order Status | Vietnamese label | StatCards | WaitingSection (Zone B) | PrepPanel (Zone C) | Table view (Zone D) | History (Zone E) |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `pending` | Chờ xác nhận | ✅ | ✅ | ✅ (if kiemTra active) | ✅ | ❌ |
| `confirmed` | Đã xác nhận | ✅ | ❌ | ❌ | ✅ | ❌ |
| `preparing` | Đang làm | ✅ | ❌ | ❌ | ✅ | ❌ |
| `ready` | Sẵn sàng phục vụ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `delivered` | Đã giao | ✅ | ❌ | ❌ | ✅ | ❌ |
| `cancelled` | Đã huỷ | — | ❌ | ❌ | ❌ | ✅ |
| `paid` | Đã thanh toán | — | ❌ | ❌ | ❌ | ✅ |

---

## WaitingSection — Action Buttons Per Status

| Order Status | Button shown | Next status |
|---|---|---|
| `pending` | Xác nhận | `confirmed` |
| `confirmed` | Bắt đầu làm | `preparing` |
| `preparing` | Sẵn sàng | `ready` |
| `ready` | Đã giao | `delivered` |

---

## PrepPanel — Rules

- Only shows orders with status `pending` (from kiemTra-selected table)
- Bulk action button always shows **"Xác nhận"** → advances all to `confirmed`
- Dishes disappear immediately after confirming (optimistic update)
- All other status transitions handled in **Table view (Zone D)**

---

## Zone E — HistoryLog Rules

- Shows only `cancelled` and `paid` orders created **today** (midnight → now)
- Sorted by `updated_at DESC` (most recent first — cancellation/payment time)
- Columns: Bàn · Mã đơn · Trạng thái · Tổng tiền · Giờ tạo · Giờ kết thúc · Ghi chú
- "Giờ kết thúc" = `updated_at` (the moment the order was cancelled or paid)
- "Ghi chú" = `note` field (free-text left by customer/staff at order creation)
- **No `cancel_reason` field exists** — use `note` + elapsed time as signal
- Collapsed by default; toggle to expand
- Purpose: let staff/manager spot patterns in cancellations and improve operations
