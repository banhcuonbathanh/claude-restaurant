# Admin Overview — `/admin/overview`

> **TL;DR:** ✅ implemented · manager+ · The live floor command centre and default admin landing
> (`/admin` redirects here). Six zones: stat cards, all active orders, a "Kiểm tra" prep panel,
> table list/grid with actions, today's paid log and cancel log. Realtime via WS
> (`useOverviewWS` mutates the live-orders query cache) + SSE (`useAdminSSE` pops a new-order
> confirm modal). 30 s timer keeps elapsed-time urgency fresh.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ (admin shell: tab nav — see PAGES_INDEX.md)                      │
├──────────────────────────────────────────────────────────────────┤
│ Tổng quan sàn — cập nhật theo thời gian thực          ● Live     │
│ ⚠ ConnectionErrorBanner (if WS down)                             │
│ 🔍 [Tìm theo mã đơn, số bàn, tên khách...........]   (n kết quả) │
├──────────────────────────────────────────────────────────────────┤
│ A ┌Bàn đang phục vụ┐┌Món chờ làm┐┌Món đang làm┐┌Khẩn cấp/Cảnh báo┐│
│   │   4 / 6 bàn    ││     7     ││     3      ││       1        ││
│   └────────────────┘└───────────┘└────────────┘└────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│ B  WaitingSection — TẤT CẢ đơn active (pending→delivered)        │
│    ┌ Bàn 03 #BC-42 [pending] 2m  [Xác nhận][Kiểm tra][Huỷ] ┐     │
│    └ Bàn 01 #BC-40 [preparing] 14m  [→ ready] …            ┘     │
├──────────────────────────────────────────────────────────────────┤
│ C  PrepPanel — CHỈ đơn 'pending' đã bấm Kiểm tra                 │
│    (hiện khi kiemTraIds ≠ ∅; xem món + filling trước khi nhận)   │
├──────────────────────────────────────────────────────────────────┤
│ D  Danh sách bàn                    [☰ list | ▦ grid] toggle     │
│    TableList (default) / TableGrid — mỗi bàn: đơn active,        │
│    trạng thái, hành động (thanh toán xong / huỷ)                 │
├──────────────────────────────────────────────────────────────────┤
│ E  PaidLog — đơn đã thanh toán hôm nay                           │
│ F  CancelLog — đơn đã huỷ hôm nay                                │
└──────────────────────────────────────────────────────────────────┘
  Overlay: NewOrderPopup — "Đơn hàng mới!" với items + tổng tiền
           [Bỏ qua]  [✓ Xác nhận nhận đơn]  (pending → confirmed)
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Search | inline input in `admin/overview/page.tsx` | local state; filters orders + tables client-side |
| A Stat cards | `features/admin/components/StatCards` | derived from live orders + tables |
| B Active orders | `features/admin/components/WaitingSection` | `GET /orders` live (`['orders','live']` query) + WS cache mutations |
| C Prep panel | `features/admin/components/PrepPanel` | filtered: `kiemTraIds ∩ status === 'pending'` |
| D Tables | `features/admin/components/TableList` / `TableGrid` (toggle) | `GET /tables` + live orders |
| E Paid log | `features/admin/components/PaidLog` | today's paid orders (`['orders','history']`) |
| F Cancel log | `features/admin/components/CancelLog` | today's cancelled orders |
| Popup | local `NewOrderPopup` | `useAdminSSE` `new_order` event → `GET /orders/:id` |

## Key Interactions

- New order arrives (SSE) → added to live cache + **NewOrderPopup**; **✓ Xác nhận** →
  `PATCH /orders/:id/status {confirmed}`; **Bỏ qua** just closes (order stays pending in Zone B).
- Zone B/D action buttons → `updateOrderStatus` (optimistic cache update; WS confirms).
- **Kiểm tra** toggle on an order → adds it to Zone C PrepPanel (pending orders only).
- Table row payment done → removes order from live cache, invalidates history (feeds Zone E).
- List/grid toggle switches Zone D layout; search filters B + D simultaneously.

## Business Logic Used

- Which statuses appear in which zone + allowed actions → [../02_spec/BUSINESS_RULES.md §2.2 Transition Permissions](../02_spec/BUSINESS_RULES.md#22-transition-permissions)
- Force-cancel rule (⚠ DRIFT: code still applies < 30 % rule; target = any time before payment) →
  [../02_spec/BUSINESS_RULES.md §3 Cancel Rules](../02_spec/BUSINESS_RULES.md#3-cancel-rules)
- Dual realtime channels (WS cache mutation + SSE popup) → [../02_spec/BUSINESS_RULES.md §6 Realtime Config](../02_spec/BUSINESS_RULES.md#6-realtime-config)
- Zone routing logic on FE → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (overview status routing)
