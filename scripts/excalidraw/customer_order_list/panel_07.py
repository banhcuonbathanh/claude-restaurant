#!/usr/bin/env python3
"""PANEL 7 for customer_order_list.excalidraw — Scenario Timeline.
Source: SCENARIO_ORDER_HISTORY.md (Hoa @ Bàn 03, ORD-20260613-016)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p7")
E = []

X, Y = 40, 2760
E += ex.panel_header(X, Y, "PANEL 7 · Scenario Timeline — Order History Revisit",
                     "SCENARIO_ORDER_HISTORY.md · Hoa @ Bàn 03 · ORD-20260613-016 · 2× Suất Đầy Đủ Trứng Tái ₫60,000 · status confirmed")

# vertical timeline spine
sx = X + 90
top = Y + 64
beats = [
    ("T+0:00", "Tap \"Đơn Hàng\" nav → /order mounts", "useEffect([],[]) → loadCachedOrders() · ZERO network · cached order surfaces", ex.C_VIOLET),
    ("T+0:01", "Card renders from cache", "combo headers filtered (page.tsx:91) · isActive → progress bar + served-count · ⚠ STALE", ex.C_AMBER),
    ("T+0:03", "Tap card → OrderDetailSheet mounts", "setSelectedOrderId(id) · useOrderSSE(orderId) · instant-paint from order_cache_<id>", ex.C_BE),
    ("T+0:04", "REST snapshot corrects the photo", "GET /orders/:id → setOrder(data.data) · ownership gate (table_id) · writes cache back", ex.C_CYAN),
    ("T+0:05", "SSE stream opens", "fetchEventSource /orders/:id/events · connected · :keep-alive 15s · ⚠ no ownership check", ex.C_CYAN),
    ("T+0:08", "Chef serves a dish → live move", "publishOrderEvent item_progress → onmessage patches qty_served → bar advances, no refetch", ex.C_ORD),
    ("T+0:12", "Cancel one not-served item", "DELETE /orders/items/:id → RecalcTotal · ⚠ item_cancelled emitted but DROPPED FE-side (toast only)", "#ef4444"),
    ("T+0:16", "Tap \"Thêm món\" → re-enter /menu", "setTableId + setActiveOrderId(orderId) → router.push('/menu') · unmount aborts SSE", ex.C_VIOLET),
]
y = top
for t, title, body, accent in beats:
    # dot
    E.append(ex.rect(sx - 6, y + 6, 12, 12, bg=accent, stk=accent, round_=True))
    # time label
    E.append(ex.text(X, y + 4, t, fs=12, color=ex.PANEL_TXT, ff=3))
    # card
    E.append(ex.rect(sx + 30, y, 1450, 52, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.text(sx + 42, y + 7, title, fs=12, color=ex.L_TEXT))
    E.append(ex.text(sx + 42, y + 28, body, fs=10, color=ex.SUB, w=1420, wrap=True))
    y += 66
# spine line
E.append(ex.rect(sx - 1, top + 6, 2, (y - 66) - top + 12, bg=ex.L_BORDER, stk=ex.L_BORDER, round_=False))

# mental model
E.append(ex.rect(X, y + 6, 1530, 44, bg="#eef2ff", stk="#6366f1"))
E.append(ex.text(X + 12, y + 16,
    "Mental model: /order is a localStorage photo album that upgrades one card at a time — tap a card and that order comes alive (REST corrects, SSE patches dish-by-dish).",
    fs=11, color="#3730a3", w=1500, wrap=True))

ex.append(FP, E)
print(f"PANEL 7: added {len(E)} elements")
