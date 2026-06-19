#!/usr/bin/env python3
"""PANEL 1 for customer_order_list.excalidraw — Page Wireframe.
Source: docs/system/08_pages/customer/customer_order_list/customer_order_list.md
(ASCII wireframe + Zones table). FIRST panel → ex.save() creates the doc."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p1")
E = []

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe — /order",
                     "customer_order_list.md · mobile 420px · list = pure localStorage read; detail = OrderDetailSheet overlay")

# ---- phone frame ----
PX, PY, PW = X, Y + 60, 460
PH = 760
E.append(ex.rect(PX, PY, PW, PH, bg="#ffffff", stk=ex.L_BORDER, sw=2))

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

# header bar
E.append(ex.rect(PX, PY, PW, 44, bg=ex.L_ORANGE, stk=ex.L_BORDER))
lbl(PX + 14, PY + 14, "📋 Đơn hàng của bạn", fs=14)
lbl(PX + 320, PY + 14, "🗑 Xoá lịch sử", fs=12, color="#b45309")

# card 1 — active order (border-l primary)
c1y = PY + 60
E.append(ex.rect(PX + 14, c1y, PW - 28, 124, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
E.append(ex.rect(PX + 14, c1y, 5, 124, bg=ex.C_ORD, stk=ex.C_ORD, round_=False))  # border-l primary
lbl(PX + 28, c1y + 10, "Bàn 03   #BC-0042", fs=13)
# StatusBadge
E += ex.badge(PX + 250, c1y + 8, "preparing", ex.C_AMBER)
lbl(PX + 360, c1y + 10, "105.000đ  ▸", fs=12)
# progress bar (active only)
E.append(ex.rect(PX + 28, c1y + 42, 300, 10, bg="#e5e7eb", stk="#e5e7eb"))
E.append(ex.rect(PX + 28, c1y + 42, 150, 10, bg=ex.C_ORD, stk=ex.C_ORD))
lbl(PX + 28, c1y + 60, "3/6 phần đã ra            12 phút trước", fs=11, color=ex.SUB)
lbl(PX + 28, c1y + 86, "Bánh cuốn thịt · Canh mọc · Trà đá", fs=11, color=ex.SUB)

# card 2 — delivered (no progress bar)
c2y = c1y + 140
E.append(ex.rect(PX + 14, c2y, PW - 28, 80, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
E.append(ex.rect(PX + 14, c2y, 5, 80, bg="#9ca3af", stk="#9ca3af", round_=False))
lbl(PX + 28, c2y + 10, "Mang về   #BC-0038", fs=13)
E += ex.badge(PX + 250, c2y + 8, "delivered", ex.C_BE)
lbl(PX + 360, c2y + 10, "42.000đ  ▸", fs=12)
lbl(PX + 28, c2y + 46, "4/4 phần đã ra            2 giờ trước  (no bar · !isActive)", fs=11, color=ex.SUB)

# empty state
e3y = c2y + 100
E.append(ex.rect(PX + 14, e3y, PW - 28, 92, bg="#fffdf7", stk="#fde9cf", style="dashed"))
lbl(PX + 150, e3y + 16, "🛍", fs=22)
lbl(PX + 90, e3y + 48, "Chưa có đơn hàng nào", fs=12, color=ex.SUB)
lbl(PX + 40, e3y + 68, "Quét mã QR tại bàn để bắt đầu đặt món", fs=10, color=ex.SUB)

# bottom nav
bny = PY + PH - 44
E.append(ex.rect(PX, bny, PW, 44, bg=ex.L_INDIGO, stk=ex.L_BORDER))
lbl(PX + 10, bny + 14, "Menu | Đơn Hàng | Yêu Thích | Theo Dõi | Cài Đặt", fs=11, color="#3730a3")

# overlay note
lbl(PX + 14, PY + PH + 8, "▸ tap card → OrderDetailSheet (slide-up) → GET /orders/:id + SSE", fs=11, color="#7c3aed")

# ---- Zones table (right of phone) ----
ZX = PX + PW + 60
zy = Y + 60
lbl(ZX, zy, "ZONES → DATA SOURCE", fs=13, color=ex.PANEL_TXT)
zy += 26
zones = [
    ("Header + clear", "inline JSX in order/page.tsx"),
    ("Order cards", "localStorage STORAGE_KEYS.ORDER_CACHE, sorted created_at desc"),
    ("Progress bar", "qty_served / quantity over display items (combo headers filtered)"),
    ("Detail overlay", "OrderDetailSheet → GET /orders/:id"),
    ("Empty state", "inline JSX (no fetch)"),
]
for name, src in zones:
    E.append(ex.rect(ZX, zy, 720, 46, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    lbl(ZX + 12, zy + 7, name, fs=12)
    lbl(ZX + 12, zy + 26, src, fs=10, color=ex.SUB)
    zy += 54

zy += 16
lbl(ZX, zy, "KEY INTERACTIONS", fs=13, color=ex.PANEL_TXT); zy += 24
for s in [
    "• Tap card → opens OrderDetailSheet for that order id",
    "• Xoá lịch sử → removes ALL order_cache_* entries, empties list",
    "• Progress bar shown only while status ∉ {delivered, cancelled}",
]:
    lbl(ZX, zy, s, fs=11, color=ex.L_TEXT); zy += 22

zy += 12
E.append(ex.rect(ZX, zy, 720, 64, bg="#fff7ed", stk=ex.C_ORD))
lbl(ZX + 12, zy + 10, "⚠ The list page itself calls ZERO backend endpoints.", fs=12, color="#b45309")
lbl(ZX + 12, zy + 34, "Every card is rendered from cached JSON → can be stale (see Panel 8).", fs=11, color="#b45309")

ex.save(FP, E)
print(f"PANEL 1: saved {len(E)} elements")
