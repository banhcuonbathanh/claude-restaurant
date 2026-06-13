# KDS — Kitchen Display — `/kds`

> **TL;DR:** ✅ implemented · chef (staff JWT) · Fullscreen cooking board: responsive grid of
> order cards (1–4 columns), colour-coded urgency borders by elapsed time, live updates over the
> shared WebSocket (new orders beep), tap an item line to mark one portion done, inline status
> picker to finish ("ready") or cancel an order.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ KDS — Bếp                                                        │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌────────┐ │
│ │▌Bàn 03 #BC-42          │ │▌Bàn 01 #BC-40          │ │  ...   │ │
│ │ [Đã xác nhận]  12 phút │ │ [Đang chuẩn bị] 22 phút│ │        │ │ ← border colour:
│ │ ● Bánh cuốn · thịt     │ │   (border-urgent >20m) │ │        │ │   >20m urgent
│ │       còn ×2 (tap=−1)  │ │ ● Canh mọc · có rau  ✓ │ │        │ │   10–20m warning
│ │ ● Canh mọc · không rau │ │ ● Bánh cuốn · mộc nhĩ  │ │        │ │   <10m normal
│ │       còn ×1           │ │       còn ×1           │ │        │ │
│ │ 3 món · 3 phần còn lại │ │ 2 món · 1 phần còn lại │ │        │ │
│ │ ┌─inline status picker─┐│ │                        │ │        │ │
│ │ │[✓ Phục vụ][🛍][Huỷ] ││ │                        │ │        │ │
│ │ └──────────────────────┘│ │                        │ │        │ │
│ │ [🔍 Kiểm tra][Trạng thái▼]│ [🔍 Kiểm tra][Trạng thái▼]│      │ │
│ └────────────────────────┘ └────────────────────────┘ └────────┘ │
└──────────────────────────────────────────────────────────────────┘
  Empty state: "Không có đơn nào đang chờ 🍜" (centered)
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Order grid | inline JSX in `(dashboard)/kds/page.tsx` | initial `GET /orders` filtered to {pending, confirmed, preparing}; then WS |
| WS feed | `useOrdersWSContext().subscribe` (shared connection from dashboard layout) | events: `new_order` (refetch + beep), `item_progress`, `order_cancelled`, `order_status_changed` |
| Item rows | inline rows; variant label via `kdsVariant()` (canh → có/không rau from `toppings_snapshot`; other items → nhân names) | order items, combo header rows filtered out |
| Status picker | inline buttons (✓ Phục vụ / 🛍 Mang đi / Huỷ) | `PATCH /orders/:id/status` |
| Flag button | 🔍 Kiểm tra toggle (local highlight, urgent border) | local state |
| Beep | `useBeep()` Web Audio oscillator | on `new_order` |

## Key Interactions

- Tap an item line → `PATCH /orders/:orderId/items/:itemId/status` — serves one portion
  (`qty_served`+1); line strikes through at 0 remaining.
- **Trạng thái ▼** → opens inline picker: ✓ Phục vụ / 🛍 Mang đi (both → status `ready`),
  Huỷ → status `cancelled`. Order leaves the board once non-active.
- **🔍 Kiểm tra** → flags the card with an urgent border (chef's local marker; no API call).
- New WS `new_order` → card prepends + audio beep.

## Business Logic Used

- Cooking transitions (`confirmed → preparing → ready`) and who may make them →
  [../02_spec/BUSINESS_RULES.md §2.2 Transition Permissions](../02_spec/BUSINESS_RULES.md#22-transition-permissions)
- Item progress = `qty_served` (derived, no status column) → [../02_spec/BUSINESS_RULES.md §2.4](../02_spec/BUSINESS_RULES.md#24-item-status-derived--no-column)
- WS auth (`?token=`) + shared connection pattern → [../02_spec/BUSINESS_RULES.md §6 Realtime Config](../02_spec/BUSINESS_RULES.md#6-realtime-config)
- Urgency thresholds + KDS variant labels → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (KDS rules)
