# Admin Overview — `/admin/overview`

> **TL;DR:** ✅ implemented · manager+ · The live floor command centre and default admin landing
> (`/admin` redirects here). Renders (in DOM order): connection banner → new-order popup →
> header → search → **Zone A** stat cards → **Zone D** table section (which itself wraps the
> *Tổng món* dish summary, the **Zone B** "cần chuẩn bị" list, and the list/grid table view) →
> **Zone C** prep panel (only while ≥1 order is 🔍 Kiểm tra) → **Zone E** paid log → **Zone F**
> cancel log. Realtime via WS ([`useOverviewWS`](../../../../../fe/src/hooks/useOverviewWS.ts)
> mutates the `['orders','live']` query cache) + SSE
> ([`useAdminSSE`](../../../../../fe/src/hooks/useAdminSSE.ts) pops the new-order confirm modal).
> A 30 s timer re-renders elapsed-time urgency.
>
> **Page file:** [`page.tsx`](../../../../../fe/src/app/(dashboard)/admin/overview/page.tsx) ·
> **Helpers:** [`overview.helpers.ts`](../../../../../fe/src/features/admin/overview.helpers.ts) ·
> **Components:** [`fe/src/features/admin/components/`](../../../../../fe/src/features/admin/components/)

---

## ASCII Wireframe

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  (khung admin: sidebar + tab điều hướng — xem PAGES_INDEX.md)                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ⚠ Cảnh báo mất kết nối  (ConnectionErrorBanner)                             ║  → ConnectionErrorBanner.tsx · chỉ hiện khi wsConnected===false
╟──────────────────────────────────────────────────────────────────────────────╢
║   ┌─ Đầu trang · Trạng thái sàn  (OverviewHeader) ────────────────────────┐  ║  → OverviewHeader.tsx
║   │ Tổng quan sàn                                    ● Live (pulse)       │  ║
║   │ Tất cả bàn — cập nhật theo thời gian thực                             │  ║
║   └───────────────────────────────────────────────────────────────────────┘  ║
║   ┌─ Thanh tìm kiếm đơn & bàn  (OverviewSearchBar) ───────────────────────┐  ║  → OverviewSearchBar.tsx · lọc đồng thời Zone B + D
║   │ 🔍 [Tìm theo mã đơn, số bàn, tên khách……]                 [✕]         │  ║
║   │ (khi gõ) → «N đơn · M bàn phù hợp với “q”»                            │  ║
║   └───────────────────────────────────────────────────────────────────────┘  ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ A ┌─ Thẻ chỉ số nhanh — 4 thẻ  (StatCards) ───────────────────────────────┐  ║  → StatCards.tsx · từ orders+tables+now (chỉ đơn có table_id)
║   │ ┌Bàn đang phục vụ┐┌ Món chờ làm ┐┌Món đang làm┐┌Khẩn cấp/Cảnh báo┐    │  ║
║   │ │ occupied/total ││  Σ pending  ││ Σ preparing ││  urgent/warning │   │  ║
║   │ │  / N bàn       ││ Chưa bắt đầu││ Đang chế biến││ >20′ / 10–20′   │  │  ║
║   │ └────────────────┘└────────────┘└─────────────┘└─────────────────┘    │  ║
║   └───────────────────────────────────────────────────────────────────────┘  ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ D ┌─ Khu vực bàn — danh sách / lưới  (TableSection)   [☰ list | ▦ grid] ──┐  ║  → TableSection.tsx · sở hữu viewMode + slot belowSummary
║   │ ┌─ Tổng hợp món cả sàn  (Tổng món) ─────────────────────────────┐     │  ║
║   │ │ 🔍 đang kiểm tra K bàn   [Bỏ kiểm tra(K)]  [Xem tất cả]       │     │  ║
║   │ │ [Bánh ×N ▼][Trứng ×N][Giò ×N][Canh ×N có/không rau] …         │     │  ║
║   │ │   nhân/rau theo từng chip · (+Δ) từ các bàn 🔍                │     │  ║
║   │ └───────────────────────────────────────────────────────────────┘     │  ║
║   │                                                                       │  ║
║   │ ┌─ Bàn chờ bếp xác nhận — Zone B  (WaitingSection) ─────────────┐     │  ║
║   │ │ chỉ status='pending' · n bàn · k loại món · T phần còn lại    │     │  ║
║   │ │ cột sắp xếp: Bàn|Trạng thái|Mã đơn|Thời gian|Còn lại          │     │  ║
║   │ │ Bàn 03 [Chờ xác nhận] BC-42 2′ Bánh×4 [🔍][Xác nhận]          │     │  ║
║   │ │ click dòng → OrderDetail · 🔍 = kiểm tra → nuôi Zone C        │     │  ║
║   │ └───────────────────────────────────────────────────────────────┘     │  ║
║   │                                                                       │  ║
║   │ viewMode='list' → Danh sách bàn dạng dòng  (TableList)                │  ║
║   │   1 dòng/bàn · [Thanh toán][Huỷ] · kèm PaymentModal                   │  ║
║   │ viewMode='grid' → Lưới bàn dạng thẻ  (TableGrid)                      │  ║
║   │   1 thẻ/bàn (thẻ Trống nếu không có đơn) · mở OrderDetail             │  ║
║   └───────────────────────────────────────────────────────────────────────┘  ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ C ┌─ Bảng gom món cần làm — chỉ khi đã 🔍  (PrepPanel) ───────────────────┐  ║  → PrepPanel.tsx · đầu vào = đơn 🔍 AND status='pending'
║   │ «Danh sách món ăn cần chuẩn bị»    [primaryNext]   [T phần]           │  ║
║   │ gom theo món → Tên món | Bàn | Nhân/Rau | Còn lại (sắp xếp)           │  ║
║   │ Canh (♨) ghim cuối + chi tiết có/không rau theo đơn                   │  ║
║   └───────────────────────────────────────────────────────────────────────┘  ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ E ▸ Nhật ký đơn đã thu tiền  (PaidLog)  — «Đơn đã thanh toán hôm nay»        ║  → PaidLog.tsx
║     N đơn · Σ tiền · mở → GET /orders/history status='paid'                  ║  (lazy: enabled khi mở)
║ F ▸ Nhật ký đơn đã huỷ  (CancelLog)  — «Đơn đã huỷ hôm nay»                  ║  → CancelLog.tsx
║     N đơn · mở → cùng query lọc status='cancelled'                           ║  (lazy: enabled khi mở)
╚══════════════════════════════════════════════════════════════════════════════╝

  OVERLAY (fixed) ── Popup đơn hàng mới  (NewOrderPopup) ── hiện khi SSE new_order  → NewOrderPopup.tsx
  ┌─ Đơn hàng mới!            #BC-43   [Bàn] ──┐
  │ • Bánh cuốn thịt      ×2        24.000đ    │
  │ • …                                        │
  │ ────────────────────────────────────────   │
  │ N món · Tổng cộng  42.000đ                 │
  │         [ Bỏ qua ]  [✓ Xác nhận nhận đơn]  │
  └────────────────────────────────────────────┘
```

## Chi tiết từng thành phần (Wireframe)

Mỗi thành phần một khung riêng — tiêu đề tiếng Việt (giữ tên code) + link mã nguồn.

### Toàn cục — Cảnh báo mất kết nối (ConnectionErrorBanner)
[ConnectionErrorBanner.tsx](../../../../../fe/src/components/shared/ConnectionErrorBanner.tsx)
```
┌─ Cảnh báo mất kết nối ───────────────────────────┐
│ ⚠ Mất kết nối thời gian thực — đang thử lại…     │
└──────────────────────────────────────────────────┘
```
Chỉ hiện khi `wsConnected===false`. Ẩn ngay khi WS nối lại.

### Đầu trang · Trạng thái sàn (OverviewHeader)
[OverviewHeader.tsx](../../../../../fe/src/features/admin/components/OverviewHeader.tsx)
```
┌─ Đầu trang · Trạng thái sàn ─────────────────────────┐
│ Tổng quan sàn                          ● Live        │
│ Tất cả bàn — cập nhật theo thời gian thực            │
└──────────────────────────────────────────────────────┘
```
Tiêu đề tĩnh + chấm ● Live nhấp nháy theo trạng thái WS.

### Thanh tìm kiếm đơn & bàn (OverviewSearchBar)
[OverviewSearchBar.tsx](../../../../../fe/src/features/admin/components/OverviewSearchBar.tsx)
```
┌─ Thanh tìm kiếm đơn & bàn ───────────────────────────┐
│ 🔍 Tìm theo mã đơn, số bàn, tên khách…        [✕]    │
│ 3 đơn · 2 bàn phù hợp với “abc”   (khi đang gõ)      │
└──────────────────────────────────────────────────────┘
```
Lọc **đồng thời** Zone B (WaitingSection) và Zone D (bàn/đơn) phía client.

### Zone A — Thẻ chỉ số nhanh (StatCards)
[StatCards.tsx](../../../../../fe/src/features/admin/components/StatCards.tsx)
```
┌ Bàn đang ─┐ ┌ Món chờ ─┐ ┌ Món đang ─┐ ┌ Khẩn/Cảnh ─┐
│ phục vụ   │ │  làm     │ │  làm      │ │  báo       │
│   3       │ │   12     │ │    8      │ │   2 / 5    │  ← nền đỏ nếu khẩn>0
│  / 8 bàn  │ │Chưa bắt đầu│ │Đang chế bn│ │>20′ / 10–20′│
└───────────┘ └──────────┘ └───────────┘ └────────────┘
```
4 thẻ (2×2 mobile / 1×4 desktop). Chỉ tính đơn có `table_id` thật.

### Zone D — Khu vực bàn (TableSection)
[TableSection.tsx](../../../../../fe/src/features/admin/components/TableSection.tsx)
```
Danh sách bàn                          [☰ list | ▦ grid]
┌ Tổng hợp món cả sàn ──── 🔍 2 bàn ── [Xem tất cả] 24 phần ┐
│ [Bánh ×10 ▼][Trứng ×6][Giò ×4][Canh ×4 có/không rau]      │
└───────────────────────────────────────────────────────────┘
  ⇩ belowSummary = WaitingSection (Zone B)
  ⇩ rồi TableList (list) hoặc TableGrid (grid)
```
Khung bao Zone D: sở hữu `viewMode`, dải *Tổng món*, và slot `belowSummary`.

### Zone B — Bàn chờ bếp xác nhận (WaitingSection)
[WaitingSection.tsx](../../../../../fe/src/features/admin/components/WaitingSection.tsx)
```
┌ Bàn cần chuẩn bị ───────────────────────── 12 phần ┐
│ 4 bàn · 3 loại món · 12 phần còn lại               │
├ Bàn↕│Trạng thái↕│Mã đơn↕│Thời gian↕│Còn lại↕│Thao tác │
│ B1 ▼│[Chờ xác n]│ BC-42 │ 8 phút   │ Bánh×4 │[🔍][Xác nhận]
│ └─ (mở rộng) → OrderDetail ────────────────────────┘
└────────────────────────────────────────────────────┘
```
Chỉ đơn `pending`. Viền dòng = độ khẩn (cam/vàng/đỏ). 🔍 → nuôi Zone C + Δ Tổng món.

### Zone B/D — Chi tiết một đơn (OrderDetail)
[OrderDetail.tsx](../../../../../fe/src/features/admin/components/OrderDetail.tsx)
```
┌─ #BC-42  [Chờ xác nhận]        8 phút  42.000đ ──┐
│ ████████░░░░░░  6/14 phần đã ra          43%     │
│ Chờ 4   ·   Đang làm 2   ·   Đã ra 8             │
│ ● Bánh cuốn thịt              2/4                │
│ ● Trứng                       0/2                │
│ [ 🔍 Kiểm tra ]   [ Trạng thái ▼ → tiến/Huỷ ]    │
└──────────────────────────────────────────────────┘
```
Thẻ dùng chung trong WaitingSection & TableGrid. `onToggleCheck` = dấu «đã kiểm» theo bàn.

### Zone D — Danh sách bàn dạng dòng (TableList)
[TableList.tsx](../../../../../fe/src/features/admin/components/TableList.tsx)
```
┌ Bàn ──────────────── Thời gian↕ ──────────────────┐
│ B1 001 [Chờ xác nhận ›]  8′  [Đặt hộ][⌄]           │  ← click → TableDetailDrawer
│ B2 002 [Đã thanh toán 💰][Huỷ ✕] 22′ [⌄]          │  ← delivered → thu/huỷ
│ B3 ● Trống          —                  [ Đặt hộ ] │  ← trống → /pos
└────────────────────────────────────────────────────┘
```
Modal con: **PaymentModal** (xác nhận tiền mặt) · **TableDetailDrawer** (kéo từ phải).

### TableList → PaymentModal (thu tiền mặt)
[TableList.tsx](../../../../../fe/src/features/admin/components/TableList.tsx)
```
┌─ Thu tiền — Bàn 2 ───────────────────┐
│         Tổng tiền  120.000đ          │
│ ☐ Khách đã đưa tiền                  │
│ ☐ Nhân viên đã nhận đủ tiền          │
│ [ Huỷ ]   [ Xác nhận thu tiền ]      │
└──────────────────────────────────────┘
```
Nút xác nhận chỉ bật khi **cả hai** ô đã tick → `createPayment()`.

### TableList → TableDetailDrawer (ngăn kéo phải)
[TableList.tsx](../../../../../fe/src/features/admin/components/TableList.tsx)
```
┌─ Bàn 2 · BC-40                          [✕] ┐
│ ● Bánh cuốn thịt      ×2        24.000đ    │
│ ● Trứng               ×1        10.000đ    │
│ ────────────────────────────────────────   │
│ Tổng  34.000đ      [ Xem đầy đủ → ]        │
└────────────────────────────────────────────┘
```
Kéo từ phải khi click 1 dòng bàn đang phục vụ.

### Zone D — Lưới bàn dạng thẻ (TableGrid)
[TableGrid.tsx](../../../../../fe/src/features/admin/components/TableGrid.tsx)
```
┌ B1  4 chỗ ▲─┐ ┌ B2  2 chỗ ▲─┐ ┌ B3  4 chỗ ──┐
│ [OrderDetail]│ │ [OrderDetail]│ │     Trống    │
│  progress…   │ │  progress…   │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```
1/2/3/4 cột responsive. Viền thẻ = độ khẩn. Thẻ Trống = EmptyTableCard.

### Zone C — Bảng gom món cần làm (PrepPanel)
[PrepPanel.tsx](../../../../../fe/src/features/admin/components/PrepPanel.tsx)
```
┌ Danh sách món ăn cần chuẩn bị ─── [Xác nhận] 12 phần ┐
│ 3 loại món · 12 phần còn lại                        │
├ Tên món ──── Bàn ──── Nhân/Rau ──────── Còn lại↕ ───┤
│ Bánh cuốn   B1,B3   thịt×4 mọc×2          ×6        │
│ Trứng       B2      —                      ×2        │
│ ♨ Canh      B1      có rau×3 không rau×1   ×4        │  ← ghim cuối, cam
└─────────────────────────────────────────────────────┘
```
Chỉ hiện khi `kiemTraIds.size > 0`. Gom món còn lại của các đơn 🔍 **và** `pending`.

### Zone E — Nhật ký đơn đã thu tiền (PaidLog)
[PaidLog.tsx](../../../../../fe/src/features/admin/components/PaidLog.tsx)
```
▸ Đơn đã thanh toán hôm nay   5 đơn      1.250.000đ   [▾]
  ── mở ────────────────────────────────────────────────
  Bàn │ Mã đơn │ Tổng tiền │ Giờ tạo │ Giờ TT │ Ghi chú
  B1  │ BC-01  │ 120.000đ  │ 11:30   │ 12:05  │ —
```
Lazy: chỉ fetch `['orders','history']` (status='paid') khi mở.

### Zone F — Nhật ký đơn đã huỷ (CancelLog)
[CancelLog.tsx](../../../../../fe/src/features/admin/components/CancelLog.tsx)
```
▸ Đơn đã huỷ hôm nay          1 đơn                   [▾]
  ── mở ────────────────────────────────────────────────
  Bàn │ Mã đơn │ Tổng tiền │ Giờ tạo │ Giờ huỷ │ Ghi chú
  B4  │ BC-04  │ 60.000đ   │ 10:10   │ 10:18   │ khách đổi ý
```
Lazy: cùng query, lọc status='cancelled'.

### Overlay — Popup đơn hàng mới (NewOrderPopup)
[NewOrderPopup.tsx](../../../../../fe/src/features/admin/components/NewOrderPopup.tsx)
```
┌─ Đơn hàng mới!          [Bàn 3] ─────┐
│ #BC-43                               │
│ ● Bánh cuốn thịt    ×2  60.000đ      │
│ ● Trứng             ×1  10.000đ      │
│ ────────────────────────────────     │
│ 3 món · Tổng 70.000đ                 │
│   [ Bỏ qua ]  [✓ Xác nhận nhận đơn]  │
└──────────────────────────────────────┘
```
Bật khi SSE `new_order`. ✓ → `PATCH /orders/:id/status {confirmed}`. Bỏ qua → đơn vẫn `pending`.

## Component Tree

| # | Component | File | Rendered by | Data / props |
|---|---|---|---|---|
| — | `OverviewPage` | [page.tsx](../../../../../fe/src/app/(dashboard)/admin/overview/page.tsx) | route | owns all state + 2 queries (`['tables']`, `['orders','live']`) |
| — | `ConnectionErrorBanner` | [ConnectionErrorBanner.tsx](../../../../../fe/src/components/shared/ConnectionErrorBanner.tsx) | page | `wsConnected===false` |
| — | `OverviewHeader` | [OverviewHeader.tsx](../../../../../fe/src/features/admin/components/OverviewHeader.tsx) | page | static title + Live dot |
| — | `OverviewSearchBar` | [OverviewSearchBar.tsx](../../../../../fe/src/features/admin/components/OverviewSearchBar.tsx) | page | `searchQuery`, match counts |
| A | `StatCards` | [StatCards.tsx](../../../../../fe/src/features/admin/components/StatCards.tsx) | page | `orders`, `tables`, `now` (scoped to orders w/ real `table_id`) |
| D | `TableSection` | [TableSection.tsx](../../../../../fe/src/features/admin/components/TableSection.tsx) | page | tables + list/grid orders; owns `viewMode`, dish summary, `belowSummary` slot |
| B | `WaitingSection` | [WaitingSection.tsx](../../../../../fe/src/features/admin/components/WaitingSection.tsx) | `TableSection` via `belowSummary` | `filteredOrders` (status='pending' only), `kiemTraIds`, `onKiemTra` |
| D | `TableList` | [TableList.tsx](../../../../../fe/src/features/admin/components/TableList.tsx) | `TableSection` (list) | rows + inline `PaymentModal`; `onPaymentDone`, `onCancel` |
| D | `TableGrid` | [TableGrid.tsx](../../../../../fe/src/features/admin/components/TableGrid.tsx) | `TableSection` (grid) | per-table cards + `EmptyTableCard` |
| B/D | `OrderDetail` | [OrderDetail.tsx](../../../../../fe/src/features/admin/components/OrderDetail.tsx) | `WaitingSection` / `TableGrid` expand | one order's items + next-status/cancel + `onToggleCheck` |
| C | `PrepPanel` | [PrepPanel.tsx](../../../../../fe/src/features/admin/components/PrepPanel.tsx) | page (`kiemTraIds.size > 0`) | orders that are 🔍 **and** `status==='pending'` |
| E | `PaidLog` | [PaidLog.tsx](../../../../../fe/src/features/admin/components/PaidLog.tsx) | page | own lazy query `['orders','history']` → `status==='paid'` |
| F | `CancelLog` | [CancelLog.tsx](../../../../../fe/src/features/admin/components/CancelLog.tsx) | page | same query → `status==='cancelled'` |
| — | `NewOrderPopup` | [NewOrderPopup.tsx](../../../../../fe/src/features/admin/components/NewOrderPopup.tsx) | page (`popupOrder`) | SSE `new_order` → `GET /orders/:id` |

**Shared helpers** — [overview.helpers.ts](../../../../../fe/src/features/admin/overview.helpers.ts):
`elapsedMins` · `isKitchenItem` · `itemCounts` · `statusLabel` / `statusColors` · `toppingLabel`
(Canh → có/không rau; others → nhân from `toppings_snapshot`) · `summarizePending` (WaitingSection
rows) · `summarizeTableDishes` (Tổng món strip, base + 🔍 delta) · `urgencyBorder`.

## Data Sources

| Query key | Fn | Used by | Notes |
|---|---|---|---|
| `['tables']` | `listTables` | page → StatCards / TableSection | `staleTime 60s` |
| `['orders','live']` | `listLiveOrders` | page (filtered to `ACTIVE`) | `staleTime 15s`; mutated by WS + SSE + optimistic actions |
| `['orders','history']` | `listTodayHistory` | PaidLog / CancelLog | `enabled` only when the log is opened |

BE endpoints for each → [BE view](admin_overview_be.md). API fns live in
[`admin.api.ts`](../../../../../fe/src/features/admin/admin.api.ts): `listLiveOrders`,
`listTables`, `listTodayHistory`, `updateOrderStatus`, `createPayment`.

## Two independent selection sets (don't confuse them)

- **`kiemTraIds`** — a **Set of order ids**, toggled by the 🔍 button inside `WaitingSection`.
  Drives **Zone C `PrepPanel`** (`kiemTraIds ∩ status==='pending'`) and, via the derived
  `kiemTraTableIds`, the **+Δ preview** in the *Tổng món* strip. `Bỏ kiểm tra` clears the whole set.
- **`checkedTableIds`** — a **Set of table ids**, toggled by `onToggleCheck` inside `OrderDetail`.
  Feeds `OrderDetail`'s `isChecked` flag and is passed through `TableList`/`TableGrid`. Separate
  from Kiểm tra — used as a per-table "đã kiểm" mark on the table card/detail.

## Key Interactions

- **New order (SSE)** → `handleNewOrder` fetches `GET /orders/:id`, inserts into `['orders','live']`
  cache, and opens **NewOrderPopup**. **✓ Xác nhận** → `PATCH /orders/:id/status {confirmed}` +
  optimistic cache update; **Bỏ qua** just closes (order stays `pending`, still visible in Zone B).
- **Status advance** (Zone B row, Zone C `primaryNext`, TableGrid/OrderDetail) → `handleAction` →
  `updateOrderStatus` with optimistic cache patch; WS `order_status_changed` reconciles.
- **🔍 Kiểm tra** toggle (Zone B) → adds order to `kiemTraIds` → surfaces Zone C + Tổng món delta;
  the row lights up indigo.
- **Payment done** (TableList `PaymentModal`, 2 confirm checkboxes) → `createPayment` →
  `onPaymentDone` drops the order from live cache and invalidates `['orders','history']` (feeds Zone E).
- **Cancel** → `handleAction(id,'cancelled')` (removes from live, appears in Zone F after history refetch).
- **List/grid toggle** switches Zone D layout; **search** filters Zone B orders + Zone D tables/orders
  simultaneously (client-side, on `order_number` / id / `customer_name` / table name).

## Business Logic Used

- Which statuses appear in which zone + allowed actions → [../02_spec/BUSINESS_RULES.md §2.2 Transition Permissions](../02_spec/BUSINESS_RULES.md#22-transition-permissions)
- Force-cancel rule (⚠ DRIFT: code still applies < 30 % rule; target = any time before payment) →
  [../02_spec/BUSINESS_RULES.md §3 Cancel Rules](../02_spec/BUSINESS_RULES.md#3-cancel-rules)
- Dual realtime channels (WS cache mutation + SSE popup) → [../02_spec/BUSINESS_RULES.md §6 Realtime Config](../02_spec/BUSINESS_RULES.md#6-realtime-config)
- Zone routing logic on FE → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (overview status routing)
