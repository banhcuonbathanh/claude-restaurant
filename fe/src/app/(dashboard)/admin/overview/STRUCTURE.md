# Admin Overview — Page Structure

Component map of the Admin Overview page, with an ASCII layout mockup for each piece.
Every component name links to its source code.

Entry point: [page.tsx](./page.tsx) — `OverviewPage`

---

## Tree

```
OverviewPage  [page.tsx]
│
├─ ConnectionErrorBanner        (only when WS disconnected)
├─ NewOrderPopup                (modal — only when a new order arrives)
│
├─ OverviewHeader
├─ OverviewSearchBar
│
├─ StatCards                    ── Zone A: 4 stat cards
│
├─ TableSection                 ── Zone D: "Tổng món" summary + list/grid toggle
│   ├─ belowSummary ⇒ WaitingSection   ── Zone B: bàn cần chuẩn bị
│   │                    └─ OrderDetail            (expand row)
│   ├─ TableList            (viewMode = 'list')
│   │     ├─ TableDetailDrawer (right drawer, click row)
│   │     └─ PaymentModal      (click "Đã thanh toán" on delivered)
│   └─ TableGrid            (viewMode = 'grid')
│         └─ TableCard → OrderDetail
│
├─ PrepPanel                    ── Zone C: only when 🔍 Kiểm tra selected (pending only)
├─ PaidLog                      ── Zone E: today's paid orders (collapsible)
└─ CancelLog                    ── Zone F: today's cancelled orders (collapsible)
```

---

## Full-page layout

```
┌──────────────────────────────────────────────────────────────┐
│ [ConnectionErrorBanner]  (only if WS down)                    │
├──────────────────────────────────────────────────────────────┤
│ Tổng quan sàn                                    ● Live       │  ← OverviewHeader
│ Tất cả bàn — cập nhật theo thời gian thực                     │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Tìm theo mã đơn, số bàn, tên khách...               [×]   │  ← OverviewSearchBar
├──────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│ │ Bàn PV │ │ Chờ làm│ │Đang làm│ │Khẩn/CB │                  │  ← StatCards (Zone A)
│ │   3/8  │ │   12   │ │    8   │ │  2 / 5 │                  │
│ └────────┘ └────────┘ └────────┘ └────────┘                  │
├──────────────────────────────────────────────────────────────┤
│ Danh sách bàn                              [≡ list] [▦ grid] │  ← TableSection (Zone D)
│ ┌── Tổng món ───────────────────── 24 phần ──[Xem tất cả]─┐  │
│ │ Bánh ×10  Trứng ×6  Giò ×4  Canh ×4   (nhân/rau split)  │  │
│ └────────────────────────────────────────────────────────┘  │
│ ┌── WaitingSection (Zone B) ─────────────────────────────┐  │
│ │ Danh sách bàn cần chuẩn bị            (see below)       │  │
│ └────────────────────────────────────────────────────────┘  │
│ ┌── TableList OR TableGrid ──────────────────────────────┐  │
│ │ per-table rows / cards                (see below)       │  │
│ └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│ [PrepPanel]  (Zone C — only when 🔍 Kiểm tra active)         │
├──────────────────────────────────────────────────────────────┤
│ ▸ Đơn đã thanh toán hôm nay      5 đơn   1.250.000đ    [▾]   │  ← PaidLog (Zone E)
│ ▸ Đơn đã huỷ hôm nay             1 đơn                 [▾]   │  ← CancelLog (Zone F)
└──────────────────────────────────────────────────────────────┘
```

---

## Per-component mockups

### [OverviewHeader.tsx](../../../../features/admin/components/OverviewHeader.tsx)
```
┌──────────────────────────────────────────────────┐
│ Tổng quan sàn                          ● Live     │
│ Tất cả bàn — cập nhật theo thời gian thực         │
└──────────────────────────────────────────────────┘
```

### [OverviewSearchBar.tsx](../../../../features/admin/components/OverviewSearchBar.tsx)
```
┌──────────────────────────────────────────────────┐
│ 🔍 Tìm theo mã đơn, số bàn, tên khách...    [×]  │
└──────────────────────────────────────────────────┘
   3 đơn · 2 bàn phù hợp với "abc"   (only while typing)
```

### [StatCards.tsx](../../../../features/admin/components/StatCards.tsx)  — Zone A
```
┌── Bàn đang ──┐ ┌── Món chờ ──┐ ┌─ Món đang ─┐ ┌─ Khẩn/Cảnh ─┐
│  phục vụ     │ │   làm       │ │   làm      │ │   báo       │
│    3         │ │   12        │ │    8       │ │   2 / 5     │  ← red bg if urgent>0
│  / 8 bàn     │ │ Chưa bắt đầu│ │Đang chế bn │ │>20p / 10-20p│
└──────────────┘ └─────────────┘ └────────────┘ └─────────────┘
```

### [TableSection.tsx](../../../../features/admin/components/TableSection.tsx)  — Zone D wrapper
```
Danh sách bàn                                  [≡ list] [▦ grid]
┌── Tổng món ──────────  🔍 kiểm tra 2 bàn ── [Xem tất cả] 24 phần ┐
│ [Bánh ×10 ▼] [Trứng ×6 ▼] [Giò ×4 ▼] [Canh ×4 ▼]               │
│   thịt ×6 mọc ×4   ...      ...         có rau ×3 không rau ×1   │
│ ▼ (expand) → Chi tiết <món> theo bàn:                           │
│    Bàn | Nhân/Rau | Đặt | Đã ra | Còn                           │
└─────────────────────────────────────────────────────────────────┘
  ⇩ belowSummary = WaitingSection
  ⇩ then TableList (list) or TableGrid (grid)
```
Buttons live here: **list/grid toggle**, **dish chips (expand per-table detail)**,
**Xem tất cả / Thu gọn**, **Bỏ kiểm tra (N)**.

### [WaitingSection.tsx](../../../../features/admin/components/WaitingSection.tsx)  — Zone B
```
┌── Danh sách bàn cần chuẩn bị ──────────────── 12 phần ─┐
│ 4 bàn · 3 loại món · 12 phần còn lại                   │
├────────────────────────────────────────────────────────┤
│ Bàn↕ │ Trạng thái↕ │ Mã đơn↕ │ Thời gian↕ │ Còn lại↕ │ Thao tác │
├──────┼─────────────┼─────────┼────────────┼──────────┼──────────┤
│ B1 ▼ │ [Chờ xác n] │ #A-001  │ 8 phút     │ Bánh ×4  │ [🔍][Xác nhận] │
│      │             │         │ 30/06 12:0 │ thịt ×2  │          │
│ └─ (expand) → OrderDetail ──────────────────────────────┘
└────────────────────────────────────────────────────────┘
  Only 'pending' orders. Row border = urgency (orange/yellow/red).
  🔍 = toggle Kiểm tra (drives Zone C PrepPanel + Tổng món delta).
```

### [OrderDetail.tsx](../../../../features/admin/components/OrderDetail.tsx)  — used inside WaitingSection & TableGrid
```
┌────────────────────────────────────────────┐
│ #A-001  [Chờ xác nhận]        8 phút  42.000đ│
│ ████████░░░░░░░░  6/14 phần đã ra      43%   │  ← progress bar
│ ┌ Chờ ─┐ ┌ Đang làm ┐ ┌ Đã ra ┐             │
│ │  4   │ │    2     │ │   8   │             │  ← 3 counters
│ └──────┘ └──────────┘ └───────┘             │
│ ● Bánh cuốn thịt              2/4           │  ← item dots
│ ● Trứng                       0/2           │
│ [ 🔍 Kiểm tra ]                              │  ← toggleCheck
│ [ Trạng thái ▼ ]  → reveals advance / Huỷ   │
└────────────────────────────────────────────┘
```

### [TableList.tsx](../../../../features/admin/components/TableList.tsx)  — Zone D, list mode
```
┌─ Bàn ──────────────── Thời gian↕ ─────────────────────┐
│ B1  001    [Chờ xác nhận ›]   8 phút  [Đặt hộ][⌄]      │  ← occupied: click row → drawer
│ B2  002    [Đã thanh toán 💰][Huỷ ✕]  22 phút [..][⌄] │  ← delivered → pay/cancel
│ B3 ● Trống            —                 [ Đặt hộ ]     │  ← empty → /pos
│   └ (⌄ expand) item list inline + "Xem đầy đủ →"       │
└────────────────────────────────────────────────────────┘
   Sub-modals: TableDetailDrawer (right slide-in) · PaymentModal (cash confirm)
```
**PaymentModal** (click "Đã thanh toán"):
```
┌─ Thu tiền — Bàn 2 ────────────┐
│        Tổng tiền  120.000đ     │
│ ☐ Khách đã đưa tiền            │
│ ☐ Nhân viên đã nhận đủ tiền    │
│ [ Huỷ ]   [ Xác nhận thu tiền ]│  ← enabled only when both checked
└────────────────────────────────┘
```

### [TableGrid.tsx](../../../../features/admin/components/TableGrid.tsx)  — Zone D, grid mode
```
┌─ B1  4 chỗ  ▲─┐ ┌─ B2  2 chỗ  ▲─┐ ┌─ B3  4 chỗ ──┐
│ [OrderDetail] │ │ [OrderDetail] │ │       Trống   │
│  progress...  │ │  progress...  │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
   1 / 2 / 3 / 4 cols responsive. Card border = urgency.
```

### [PrepPanel.tsx](../../../../features/admin/components/PrepPanel.tsx)  — Zone C
```
┌─ Danh sách món ăn cần chuẩn bị ──── [Xác nhận] 12 phần ─┐
│ 3 loại món · 12 phần còn lại                            │
├─ Tên món ──── Bàn ──── Nhân / Rau ──────── Còn lại↕ ───┤
│ Bánh cuốn    B1, B3   thịt ×4  mọc ×2        ×6        │
│ Trứng        B2       ─                       ×2        │
│ ♨ Canh       B1       có rau ×3  không rau ×1 ×4        │  ← soup pinned last, orange
│   └ Chi tiết theo đơn: [Bàn B1 · có rau ×3]            │
└────────────────────────────────────────────────────────┘
  Aggregates remaining kitchen items by dish across 🔍-checked pending orders.
```

### [PaidLog.tsx](../../../../features/admin/components/PaidLog.tsx)  — Zone E (collapsible)
```
▸ Đơn đã thanh toán hôm nay     5 đơn          1.250.000đ   [▾]
  ── expanded ──────────────────────────────────────────────
  Bàn │ Mã đơn │ Tổng tiền │ Giờ tạo │ Giờ TT │ Ghi chú
  B1  │ #A-001 │ 120.000đ  │ 11:30   │ 12:05  │ —
  (fetches ['orders','history'] only when opened)
```

### [CancelLog.tsx](../../../../features/admin/components/CancelLog.tsx)  — Zone F (collapsible)
```
▸ Đơn đã huỷ hôm nay            1 đơn                       [▾]
  ── expanded ──────────────────────────────────────────────
  Bàn │ Mã đơn │ Tổng tiền │ Giờ tạo │ Giờ huỷ │ Ghi chú
  B4  │ #A-004 │ 60.000đ   │ 10:10   │ 10:18   │ khách đổi ý
```

### [NewOrderPopup.tsx](../../../../features/admin/components/NewOrderPopup.tsx)  — modal (SSE-triggered)
```
┌────────────────────────────────┐
│ Đơn hàng mới!          [Bàn 3] │  ← indigo header
│ #A-007                          │
├────────────────────────────────┤
│ ● Bánh cuốn thịt    ×2  60.000đ│
│ ● Trứng             ×1  10.000đ│
├────────────────────────────────┤
│ 3 món · Tổng cộng   [Bỏ qua]   │
│ 70.000đ        [✓ Xác nhận]    │
└────────────────────────────────┘
```

### [ConnectionErrorBanner.tsx](../../../../components/shared/ConnectionErrorBanner.tsx)  — shown when WS down
```
┌──────────────────────────────────────────────┐
│ ⚠ Mất kết nối thời gian thực — đang thử lại…  │
└──────────────────────────────────────────────┘
```

---

## Components → code (quick links)

| Zone | Component | Code | Rendered at |
|---|---|---|---|
| — | `ConnectionErrorBanner` | [ConnectionErrorBanner.tsx](../../../../components/shared/ConnectionErrorBanner.tsx) | [page.tsx#L186](./page.tsx#L186) |
| — | `NewOrderPopup` | [NewOrderPopup.tsx](../../../../features/admin/components/NewOrderPopup.tsx) | [page.tsx#L189-L196](./page.tsx#L189-L196) |
| — | `OverviewHeader` | [OverviewHeader.tsx](../../../../features/admin/components/OverviewHeader.tsx) | [page.tsx#L198](./page.tsx#L198) |
| — | `OverviewSearchBar` | [OverviewSearchBar.tsx](../../../../features/admin/components/OverviewSearchBar.tsx) | [page.tsx#L200-L205](./page.tsx#L200-L205) |
| A | `StatCards` | [StatCards.tsx](../../../../features/admin/components/StatCards.tsx) | [page.tsx#L208](./page.tsx#L208) |
| D | `TableSection` | [TableSection.tsx](../../../../features/admin/components/TableSection.tsx) | [page.tsx#L211-L245](./page.tsx#L211-L245) |
| B | `WaitingSection` | [WaitingSection.tsx](../../../../features/admin/components/WaitingSection.tsx) | `belowSummary` → [page.tsx#L233-L243](./page.tsx#L233-L243) |
| D | `TableList` | [TableList.tsx](../../../../features/admin/components/TableList.tsx) | [TableSection.tsx#L206](../../../../features/admin/components/TableSection.tsx#L206) (list) |
| D | `TableGrid` | [TableGrid.tsx](../../../../features/admin/components/TableGrid.tsx) | [TableSection.tsx#L218](../../../../features/admin/components/TableSection.tsx#L218) (grid) |
| B/D | `OrderDetail` | [OrderDetail.tsx](../../../../features/admin/components/OrderDetail.tsx) | inside `WaitingSection` & `TableGrid` |
| C | `PrepPanel` | [PrepPanel.tsx](../../../../features/admin/components/PrepPanel.tsx) | [page.tsx#L248-L254](./page.tsx#L248-L254) |
| E | `PaidLog` | [PaidLog.tsx](../../../../features/admin/components/PaidLog.tsx) | [page.tsx#L257](./page.tsx#L257) |
| F | `CancelLog` | [CancelLog.tsx](../../../../features/admin/components/CancelLog.tsx) | [page.tsx#L260](./page.tsx#L260) |

### Sub-components (defined inside a parent file, not exported separately)

| Sub-component | Lives in | What |
|---|---|---|
| `PaymentModal` | [TableList.tsx#L23](../../../../features/admin/components/TableList.tsx#L23) | Cash payment confirm modal |
| `TableDetailDrawer` | [TableList.tsx#L142](../../../../features/admin/components/TableList.tsx#L142) | Right slide-in order detail |
| `TableCard` / `EmptyTableCard` | [TableGrid.tsx#L8](../../../../features/admin/components/TableGrid.tsx#L8) | One grid cell |
| `StatCard` | [StatCards.tsx#L6](../../../../features/admin/components/StatCards.tsx#L6) | One stat tile |

---

## Supporting (non-component) code

| What | Code |
|---|---|
| API calls (`listLiveOrders`, `listTables`, `updateOrderStatus`, `createPayment`, `listTodayHistory`) | [admin.api.ts](../../../../features/admin/admin.api.ts) |
| Derived-data helpers (`summarizeTableDishes`, `summarizePending`, `itemCounts`, `urgencyBorder`, `elapsedMins`, `statusColors`, `toppingLabel`…) | [overview.helpers.ts](../../../../features/admin/overview.helpers.ts) |
| WS cache sync | [useOverviewWS.ts](../../../../hooks/useOverviewWS.ts) |
| SSE new-order events | [useAdminSSE.ts](../../../../hooks/useAdminSSE.ts) |

## Notes

- `HistoryLog.tsx` and `OrderDetail.tsx` exist in `features/admin/components/`, but only
  `OrderDetail` is used by this page (via `TableGrid` / `WaitingSection`). `HistoryLog` is **not**
  imported here.
- Zone B (`WaitingSection`) and Zone C (`PrepPanel`) render **only `pending`** orders.
- The ASCII mockups are schematic — numbers/labels are illustrative, not live data.
