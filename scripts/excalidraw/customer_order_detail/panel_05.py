#!/usr/bin/env python3
"""PANEL 5 — Cross-Page Dataflow. From customer_order_detail_crosspage_dataflow.md
(in-browser hub vs THE WIRE · status lifecycle · nav-button writes · durability matrix)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p5")
E = []
X, Y = 40, 2660
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow — in-browser hub vs THE WIRE",
                     "from customer_order_detail_crosspage_dataflow.md · this page = primary SSE-driven writer of order_cache_<id>")

y0 = Y + 56
# ONE PHONE box
E.append(ex.rect(X, y0, 700, 280, bg=ex.L_NEUTRAL, stk=ex.L_BORDER, sw=2))
E.append(ex.text(X + 12, y0 + 8, "ONE PHONE — in-browser hub", fs=12, color=ex.L_TEXT))
hubs = [
    (ex.C_ZUS, "▓ order_cache_<id>", "localStorage · full Order JSON · 'what is order X right now?'"),
    (ex.C_ZUS, "▓ activeOrderId", "cart store partialize → CART_CONFIG (cart-config-v3) · which order is live"),
    (ex.C_SLATE, "░ tableId", "cart store MEMORY only (not partialized) · dies on F5"),
]
for i, (c, t, s) in enumerate(hubs):
    yy = y0 + 36 + i*48
    E.append(ex.rect(X + 14, yy, 672, 40, bg="#ffffff", stk=c, sw=2))
    E.append(ex.text(X + 24, yy + 6, t, fs=11, color=ex.L_TEXT, ff=3))
    E.append(ex.text(X + 24, yy + 24, s, fs=9, color="#475569"))
# nav button writes
E.append(ex.text(X + 14, y0 + 188, "3 nav buttons write-before-push:", fs=11, color=ex.L_TEXT))
navs = [
    "Theo dõi bàn (isActive)  → ▓ activeOrderId=id                 → /tracking",
    "Thêm món (isActive)      → ▓ activeOrderId=id · ░ tableId      → /menu?add_to_order=:id",
    "Đặt thêm món (!isActive) → ▓ activeOrderId=null · ░ tableId    → /menu",
]
for i, n in enumerate(navs):
    E.append(ex.text(X + 18, y0 + 210 + i*22, n, fs=9, color="#475569", ff=3))

# THE WIRE box
wx = X + 760
E.append(ex.rect(wx, y0, 520, 200, bg=ex.L_ORANGE, stk=ex.C_ORD, sw=3))
E.append(ex.text(wx + 12, y0 + 8, "THE WIRE — only cross-device hub", fs=12, color=ex.L_TEXT))
E.append(ex.text(wx + 12, y0 + 32,
                 "one orders row  (MySQL — durable)\n"
                 "  order.id · status · + order_items[]\n"
                 "        │ Redis pub/sub\n"
                 "  order:<id>   → this guest's SSE\n"
                 "  orders:kds   → kitchen board\n"
                 "  orders:admin → admin floor",
                 fs=10, color="#475569", ff=3))
E.append(ex.arrow(X + 700, y0 + 60, wx, y0 + 60, stk=ex.C_ORD, sw=2))
E.append(ex.text(X + 706, y0 + 38, "GET + SSE + writes", fs=8, color=ex.C_ORD))

# status lifecycle
lx, ly = wx, y0 + 220
E.append(ex.rect(lx, ly, 520, 56, bg=ex.L_INDIGO, stk=ex.C_VIOLET, sw=2))
E.append(ex.text(lx + 12, ly + 6, "OrderStatus lifecycle (types/order.ts:29-36)", fs=11, color=ex.L_TEXT))
E.append(ex.text(lx + 12, ly + 26, "pending → confirmed → preparing → ready → delivered\n              └────────── cancelled ──────────┘   isActive = !delivered && !cancelled", fs=9, color="#475569", ff=3))

# durability matrix
my = y0 + 300
E.append(ex.text(X, my, "Durability matrix — survives F5? / new device?", fs=12, color=ex.L_TEXT))
mat = [
    ("order_cache_<id>", "▓ localStorage", "F5 ✅  device ❌", ex.C_ZUS),
    ("activeOrderId", "▓ CART_CONFIG", "F5 ✅  device ❌", ex.C_ZUS),
    ("tableId", "░ memory", "F5 ❌  device ❌", ex.C_SLATE),
    ("order id", "URL param", "F5 ✅  device ✅ (shareable)", ex.C_CYAN),
    ("the orders row", "BE MySQL+Redis", "F5 ✅  device ✅  (truth)", ex.C_ORD),
]
for i, (d, loc, surv, c) in enumerate(mat):
    yy = my + 24 + i*30
    E.append(ex.rect(X, yy, 1280, 26, bg="#ffffff", stk=c, sw=1))
    E.append(ex.rect(X, yy, 4, 26, bg=c, stk=c))
    E.append(ex.text(X + 14, yy + 6, d, fs=10, color=ex.L_TEXT, ff=3))
    E.append(ex.text(X + 360, yy + 6, loc, fs=10, color="#475569", ff=3))
    E.append(ex.text(X + 700, yy + 6, surv, fs=10, color="#475569", ff=3))

print("PANEL 5:", ex.append(FP, E), "total elements")
