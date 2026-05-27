# Current Task

> **One task at a time.** Fill this in at session START. Clear or update at session END.
> **No active task?** → Open `MASTER_TASK.md`, find next `⬜` task where all `Deps` are ✅.
> **Task rules** → `GUIDE_TASK.md` · **All tasks** → `MASTER_TASK.md`

---

## Active Task

**ID:** P-WIRE-ORDER-1
**Phase:** P-WIRE-ORDER — Client Order Page Wireframe
**Owner:** Docs
**Status:** 🔄 IN PROGRESS (started, excalidraw extracted, NOT yet written to files)

**What to create (A1 only this session):**
- `docs/fe/wireframes/client_order_page/client_order_page_wireframe_v1.md`
- Update `docs/fe/wireframes/WIREFRAME_INDEX.md` — add row 21
- Update `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` — Page Directory row only (no new shared components found)

**AC:** All 8 zones + 2 modals documented; Zone Mapping + Data Sources + Component Specs + Edge Cases + Testing tables filled; no [TBD] in zone tables.

---

## Context Already Extracted (DO NOT re-read excalidraw — use this)

**Source:** `docs/fe/wireframes/client_order_page/order_ver2.excalidraw`
**Page:** Theo Dõi Đơn Hàng (Order Tracking)
**Route:** `/(shop)/order/[id]`
**Device:** Mobile (420px)
**Auth:** None — guest page accessed via QR link

### Confirmed Answers (owner confirmed 2026-05-27)
1. Route: `/(shop)/order/[id]`
2. Qty stepper (−/qty/+) on items: **YES — live today**
3. Item cancel (`Huỷ` button): **any time** (no kitchen-started restriction)
4. `còn×N` badge: **portions NOT YET SERVED** (still in kitchen queue)

---

### Zones (8 total)

| Zone | Name | Visibility | Sticky |
|------|------|------------|--------|
| Nav | Order Tracking Nav | Always | `top-0 z-20` |
| C1 | Connection Error Banner | Only when SSE disconnects | Below nav |
| 1 | Order Card | Always (collapsible ↕) | No |
| 2 | Dish Summary Table | Always | No |
| 3 | Money Summary Card | Always | No |
| 4 | Completed Banner | Only when `status = delivered` | No |
| 5 | Cancel Whole Order | Only when `progress < 30%` AND `status = active` | No |
| 6 | Add More Dishes | Only when `table_id` exists | No |

### Zone Detail

**Nav:**
- Left: `← Theo Dõi Đơn Hàng` (back button)
- Right: `● LIVE` green pill badge (SSE connected)

**Zone C1 — Connection Error Banner:**
- Red background `#fee2e2`, red border
- Text: `⚠ Mất kết nối realtime – Đang thử kết nối lại...`

**Zone 1 — Order Card (SSE realtime, collapsible):**
- Header row: `Bàn 5  order no: 0042` | status badge `Đang Làm` (amber) | `215,000đ  11 phút  ↕`
- Orange progress bar (~40% filled)
- **COMBO A section** (collapsible ↕): `COMBO A · Bánh Cuốn Tôm + Chả Giò  2 món ↕`
  - `· Bánh Cuốn Tôm` — `tổng ×2  ra ×1` — `còn×1` badge — `Huỷ` button
    - Topping chips: `+ Giò lụa  5,000đ` · `+ Hành phi`
  - `· Chả Giò (combo)` — `tổng ×1  ra ×1  ✓ xong` (green)
    - Topping chip: `+ Tương hoisin`
- **Standalone: Nước Cam** — `tổng ×1  ra ×0` — `còn×1` badge — `Huỷ` button
  - Qty stepper: `Số lượng: −  2  +`
  - Topping chips: `+ Ít đường` · `+ Nhiều đá`
- **Standalone: Bún Bò Huế (canh/soup)** — `còn×2` badge — `Huỷ` button
  - Topping chips: `+ Bò viên  10,000đ` · `+ Chả cá  8,000đ`
- Footer: `3 / 7 phần đã ra`

**Zone 2 — Dish Summary Table:**
- Columns: `TÊN MÓN` | `SL  RA  CÒN` | `ĐƠN GIÁ  TỔNG`
- Rows + topping chips:
  - Bánh Cuốn Tôm — 2, 1, ×1 — 45,000đ, 90,000đ — chips: Giò lụa 5,000đ · Hành phi
  - Chả Giò — 1, 0, ×1 — 30,000đ, 30,000đ — chip: Tương hoisin
  - Bún Bò Huế — 2, 1, ×1 — 60,000đ, 120,000đ — chips: Bò viên 10,000đ · Chả cá 8,000đ
  - Nước Cam — 1, 0, ×1 — 25,000đ, 25,000đ — chips: Ít đường · Nhiều đá
- Footer rows: `Tổng tiền còn lại 155,000đ` (orange) · `Tổng tất cả món 265,000đ`

**Zone 3 — Money Summary Card:**
- `Đã dùng (3 phần)` — `110,000đ` (green)
- `Còn lại (4 phần chưa ra)` — `155,000đ` (orange)
- Divider
- `Tổng cộng` — `265,000đ` (large, bold)

**Zone 4 — Completed Banner (conditional):**
- Green border + bg `#f0fdf4`
- `✓` icon in green circle
- Title: `Đơn hàng đã hoàn thành`
- Body: `Cảm ơn bạn đã dùng bữa! Bạn có thể đặt thêm bên dưới.`

**Zone 5 — Cancel Whole Order (conditional):**
- Red outline button, full width
- Text: `Huỷ toàn bộ đơn hàng`
- Condition: `progress < 30% AND status = active`

**Zone 6 — Add More Dishes (conditional):**
- Orange filled button, full width
- Text: `＋ Thêm món`
- Condition: `table_id` exists (dine-in only)

### Modals (2)

**Modal A — Order Confirmed (SSE push):**
- Dark overlay (75% opacity) + dark card `#1e293b`
- `✓` icon in green circle (dark green bg `#166534`)
- Title (white): `Nhà hàng đã nhận đơn!`
- Body (grey): `Dự kiến phục vụ trong khoảng 15 phút.`
- CTA orange button: `Đã hiểu`
- Trigger: SSE event `order_confirmed`

**Modal B — Cancel Confirm Dialog:**
- Dark overlay + dark card `#1e293b`
- `⚠` icon in dark red circle
- Title (white): `Huỷ món này?`
- Body (grey): `"Bánh Cuốn Tôm" sẽ bị huỷ. Không thể hoàn tác.`
- Buttons: `Giữ lại` (outline) · `Xác nhận huỷ` (red filled)
- Trigger: tapping any `Huỷ` button (item-level OR Zone 5 whole-order cancel)

### Skeleton
Fully drawn — matches Zone 1 card + Zone 2 table + Zone 3 money card + Zone 6 button shape. `<OrderPageSkeleton />` required (Pattern B).

---

## Component Reuse Audit (pre-computed)

| Component | Reuse? | Reason |
|-----------|--------|--------|
| `ConnectionErrorBanner` | ✅ reuse | `shared/ConnectionErrorBanner.tsx` — Tier 2 |
| `StatusBadge` | ✅ reuse | `shared/StatusBadge.tsx` — order statuses |
| `QuantityStepper` | ✅ reuse | `shared/QuantityStepper.tsx` — Tier 2 |
| `Button` | ✅ reuse | `ui/button.tsx` — Tier 1 |
| `Badge` | ✅ reuse | `ui/badge.tsx` — Tier 1 |
| `OrderTrackingNav` | new (local) | Page-specific nav with back + LIVE badge |
| `OrderCard` | new (local) | Collapsible card — page-specific |
| `ComboSection` | new (local) | Combo grouping inside OrderCard |
| `OrderItemRow` | new (local) | Single item row with còn×N + Huỷ + stepper |
| `ToppingChip` | new (local) | Small topping label chip |
| `DishSummaryTable` | new (local) | Zone 2 summary table |
| `MoneySummaryCard` | new (local) | Zone 3 money breakdown |
| `CompletedBanner` | new (local) | Zone 4 green banner |
| `OrderConfirmedModal` | new (local) | Modal A — SSE push |
| `CancelConfirmModal` | new (local) | Modal B — item/order cancel |
| `OrderPageSkeleton` | new (local) | Pattern B skeleton — required |
| `useSettingsStore` | ✅ reuse | `store/settings.ts` — tableLabel · guestToken |

**No new (shared) components** — all new components are page-specific.

---

## State & Rendering (pre-computed)

- **Pattern:** B — Full Client (`'use client'`) — all data is order-specific + SSE realtime
- **Skeleton:** `<OrderPageSkeleton />` required
- **Query key:** `['order', orderId]` — `GET /api/v1/orders/:id` — staleTime: 0 (SSE updates primary)
- **SSE:** existing `useOrderSSE` hook — events: `order_confirmed` · `item_update` · `order_ready` · `order_delivered`
- **Stores:** `useSettingsStore` (read: `tableLabel`, `guestToken`)
- **Local state:** `cancelTarget: { itemId, itemName } | 'whole' | null` · `showConfirmedModal: boolean` · `isCardCollapsed: boolean` · `isComboCollapsed: Record<string, boolean>`

---

## Next Tasks After This One

| ID | What |
|----|------|
| P-WIRE-ORDER-2 | `business_description.md` + `how_to_use.md` — read `wireframe_v1.md` as source |
| P-WIRE-ORDER-3 | `tech_description.md` + update state/rendering indexes |
| P-WIRE-ORDER-4 | `conccern.md` + `recomment/` |

---

*Created: 2026-05-27 — context extracted from order_ver2.excalidraw in same session*
*Do NOT re-parse the excalidraw — use the zone detail above.*
