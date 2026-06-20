#!/usr/bin/env python3
"""PANEL 7 — Scenario Timeline. From SCENARIO_ORDER_DETAIL.md (Bàn 03 / Minh / ORD-20260613-016)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p7")
E = []
X, Y = 40, 4400
E += ex.panel_header(X, Y, "PANEL 7 · Scenario Timeline — Bàn 03 watches order live (Minh · ORD-20260613-016)",
                     "from SCENARIO_ORDER_DETAIL.md · 2× Suất Đầy Đủ Trứng Tái · ₫60,000 · Bug beats flagged red")

y0 = Y + 60
# vertical spine
spine_x = X + 110
E.append(ex.arrow(spine_x, y0, spine_x, y0 + 730, stk=ex.C_SLATE, sw=2))

beats = [
    ("T+0:00", "Page mounts: instant cache paint → REST snapshot → SSE opens 'LIVE'", "<100ms · no spinner · progress 0%", ex.C_TAN),
    ("T+1:30", "Kitchen confirms → order_status_changed → notification modal", "'Nhà hàng đã nhận đơn!' · badge pending→confirmed", ex.C_BE),
    ("T+2:15", "Minh wants 2 trà đá → QuantityStepper → PATCH /quantity", "★ Bug 1 — qty does NOT reflect live (item_updated dropped + dead invalidate). Stays ₫60k until reload", ex.C_RED),
    ("T+3:45", "First dishes served → item_progress ticks rows to ✓", "qty_served++ · progress bar fills · summary 'Đã ra' updates", ex.C_ORD),
    ("T+5:00", "Minh cancels a not-yet-served Giò → DELETE /orders/items/:id", "★ Bug 2 — item_cancelled dropped → row stays on screen, money doesn't drop", ex.C_RED),
    ("T+6:30", "Taps 'Thêm món' → cart store writes → /menu?add_to_order=:id", "setTableId + setActiveOrderId(id) · SSE stream aborts on unmount", ex.C_VIOLET),
    ("T+7:00", "(alt) Taps 'Theo dõi bàn' → setActiveOrderId only → /tracking", "setTableId NOT called on this path", ex.C_CYAN),
    ("T+12:00", "All dishes served → order_completed → 'Đơn đã hoàn thành' banner", "status→delivered · isActive false · Huỷ button gone · stream closed", ex.C_BE),
]
for i, (t, head, body, c) in enumerate(beats):
    yy = y0 + i * 90
    E.append(ex.text(X, yy + 6, t, fs=12, color=ex.L_TEXT, ff=3))
    # node
    E.append(ex.rect(spine_x - 6, yy + 4, 12, 12, bg=c, stk=c))
    cardx = spine_x + 24
    E.append(ex.rect(cardx, yy, 1180, 78, bg="#ffffff" if c != ex.C_RED else "#fff1f2", stk=c, sw=2))
    E.append(ex.rect(cardx, yy, 4, 78, bg=c, stk=c))
    E.append(ex.text(cardx + 14, yy + 10, head, fs=11, color=ex.L_TEXT))
    E.append(ex.text(cardx + 14, yy + 32, body, fs=9, color="#b91c1c" if c == ex.C_RED else "#475569", w=1150, wrap=True))

print("PANEL 7:", ex.append(FP, E), "total elements")
