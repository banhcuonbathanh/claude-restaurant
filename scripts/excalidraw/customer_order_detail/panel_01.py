#!/usr/bin/env python3
"""PANEL 1 for customer_order_detail.excalidraw — Page Wireframe (mobile 420px).
Sourced from docs/system/08_pages/customer/customer_order_detail/customer_order_detail.md
(ASCII wireframe + Zones table). FIRST panel → uses ex.save()."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p1")
E = []
X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe — /order/:id (mobile 420px)",
                     "from customer_order_detail.md · the richest customer page · live mirror over useOrderSSE · read + 3 write paths")

# phone frame
px, py, pw = X, Y + 60, 460
E.append(ex.rect(px, py, pw, 900, bg="#ffffff", stk=ex.L_BORDER, sw=2))

def zone(y, h, accent, title, lines, src):
    E.append(ex.rect(px + 14, y, pw - 28, h, bg=ex.L_NEUTRAL, stk=accent, sw=2))
    E.append(ex.text(px + 26, y + 8, title, fs=12, color=ex.L_TEXT))
    E.append(ex.text(px + 26, y + 26, lines, fs=9, color="#475569"))
    E.append(ex.text(px + pw - 26 - len(src) * 5, y + 8, src, fs=8, color="#94a3b8"))
    return y + h + 8

cy = py + 14
cy = zone(cy, 46, ex.C_TAN, "Sticky nav  [←] Theo Dõi Đơn Hàng  [StatusBadge]",
          "header + shared/StatusBadge ← useOrderSSE(id)", "sse")
cy = zone(cy, 34, ex.C_RED, "⚠ ConnectionErrorBanner (fixed top-0)",
          "connectionError after ≥3 failed SSE reconnects", "sse")
cy = zone(cy, 132, ex.C_ORD, "Order card + DishRow (per item)",
          "Bàn 03 #BC-0042 [preparing] 12 phút · progress bar\n▼ Combo Đầy Đặn (collapsible · combo_ref_id group)\n  ● Bánh cuốn thịt · thịt   ra 1/1 ✓\n  ● Canh mọc · có rau       còn 1  [Huỷ]\n● Trà đá [−1+]  còn 2  [Huỷ]  ← QuantityStepper", "sse + memo")
cy = zone(cy, 110, ex.C_CYAN, "▼ Tổng hợp món (summary table)",
          "grouped by product_id → summaryRows memo\nMón  SL  Đã ra  Còn  Đơn giá  Tổng\nBánh cuốn  2  1  1  35.000  70.000\n+ chả lụa · ghi chú…   [Huỷ phần còn]", "derived memo")
cy = zone(cy, 78, ex.C_AMBER, "Money summary card",
          "Đã ăn:    60.000đ   ← eatenAmount\nChưa ra:  45.000đ   ← remainingAmount\nTổng cộng:105.000đ  ← order.total_amount", "derived")
cy = zone(cy, 46, ex.C_BE, "✓ banner 'Đơn đã hoàn tất' (delivered only)",
          "renders when status === 'delivered'", "derived")
cy = zone(cy, 56, ex.C_VIOLET, "[ Huỷ đơn hàng ]   [ + Gọi thêm món ]",
          "Huỷ: only while canCancelOrder · +Gọi → /menu?add_to_order=:id", "mutation+nav")
cy = zone(cy, 38, ex.C_SLATE, "ClientBottomNav (shell)",
          "[Menu][Đơn Hàng][Yêu Thích][Theo Dõi][Cài Đặt]", "shell")

# overlays strip
fy = cy + 8
E.append(ex.text(px + 26, fy, "Overlays (modal layer):", fs=11, color=ex.L_TEXT))
for i, (lab, c) in enumerate([("order-notification modal — staff updated order (setNotification)", ex.C_TAN),
                              ("cancel-confirm modal — Huỷ món / Huỷ đơn (cancelTarget)", ex.C_RED)]):
    E.append(ex.rect(px + 26, fy + 20 + i * 26, pw - 60, 22, bg="#fff7ed", stk=c, sw=1))
    E.append(ex.text(px + 34, fy + 24 + i * 26, lab, fs=9, color="#475569"))

print("PANEL 1:", ex.save(FP, E), "elements")
