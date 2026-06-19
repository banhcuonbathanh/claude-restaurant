#!/usr/bin/env python3
"""PANEL 5 for customer_order_list.excalidraw — Cross-Page Dataflow.
Source: customer_order_list_crosspage_dataflow.md (order_cache hub, lifecycle,
durability matrix, F5 behaviour)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p5")
E = []

X, Y = 40, 1140
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow — the order_cache_<id> hub",
                     "customer_order_list_crosspage_dataflow.md · in-browser hub (localStorage) vs the wire (one BE orders row)")

# ---- writers → hub → readers ----
hy = Y + 60
# 3 writers
writers = [
    ("TableConfirmModal :37", "POST 201 → GET → cache"),
    ("checkout/page.tsx :68", "POST 201 → GET → cache"),
    ("useOrderSSE :41-46", "every SSE delta → cache"),
]
wy = hy
for name, sub in writers:
    E.append(ex.rect(X, wy, 300, 48, bg=ex.L_INDIGO, stk="#6366f1"))
    E.append(ex.text(X + 10, wy + 7, name, fs=11, color=ex.L_TEXT, ff=3))
    E.append(ex.text(X + 10, wy + 27, sub, fs=10, color=ex.SUB))
    wy += 58

# hub (localStorage)
HX = X + 360
E.append(ex.rect(HX, hy + 20, 280, 110, bg="#ecfdf5", stk="#10b981", sw=2))
E.append(ex.text(HX + 12, hy + 30, "▓ localStorage", fs=12, color="#065f46"))
E.append(ex.text(HX + 12, hy + 52, "order_cache_<id>", fs=12, color="#065f46", ff=3))
E.append(ex.text(HX + 12, hy + 74, "= full Order JSON\nsurvives F5 · per-browser", fs=10, color="#047857"))
for i in range(3):
    E.append(ex.arrow(X + 300, hy + 24 + i*58, HX, hy + 75, stk="#6366f1", sw=1))

# 2 readers
RX = HX + 340
readers = [
    ("/order list  loadCachedOrders()", "scan ALL order_cache_* keys, sort desc"),
    ("useOrderSSE  cacheKey(id)", "instant-paint seed on overlay mount"),
]
ry = hy
for name, sub in readers:
    E.append(ex.rect(RX, ry, 360, 48, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    E.append(ex.text(RX + 10, ry + 7, name, fs=11, color=ex.L_TEXT, ff=3))
    E.append(ex.text(RX + 10, ry + 27, sub, fs=10, color=ex.SUB))
    E.append(ex.arrow(HX + 280, hy + 75, RX, ry + 24, stk="#10b981", sw=1))
    ry += 64

# clearAll note
E.append(ex.text(RX, ry + 4, "clearAll() (list-only) removes every order_cache_* key → setOrders([])", fs=10, color="#b45309"))

# ---- status lifecycle ----
sly = hy + 170
E.append(ex.text(X, sly, "STATUS LIFECYCLE — every customer page renders this union (types/order.ts:29-36)", fs=12, color=ex.PANEL_TXT)); sly += 26
chain = ["pending", "confirmed", "preparing", "ready", "delivered"]
cxx = X
for i, st in enumerate(chain):
    bg = ex.C_BE if st in ("delivered",) else ex.C_AMBER if st in ("ready",) else ex.L_ORANGE
    E.append(ex.rect(cxx, sly, 150, 34, bg=bg, stk=ex.L_BORDER))
    E.append(ex.text(cxx + 12, sly + 9, st, fs=12, color=ex.DARK if bg != ex.L_ORANGE else ex.L_TEXT))
    if i < len(chain) - 1:
        E.append(ex.arrow(cxx + 150, sly + 17, cxx + 170, sly + 17, stk=ex.SUB, sw=1))
    cxx += 170
E.append(ex.rect(cxx + 10, sly, 150, 34, bg="#fee2e2", stk="#ef4444"))
E.append(ex.text(cxx + 22, sly + 9, "cancelled", fs=12, color="#991b1b"))
E.append(ex.text(X, sly + 44, "isActive = status ∉ {delivered, cancelled}  (page.tsx:95 ≡ OrderDetailSheet.tsx:134) → drives progress bar + SSE stop", fs=10, color=ex.SUB))

# ---- the wire ----
wy2 = sly + 90
E.append(ex.rect(X, wy2, 1560, 110, bg="#0f172a", stk="#334155", sw=2))
E.append(ex.text(X + 14, wy2 + 10, "═══ THE WIRE — the BE is the only cross-device hub ═══", fs=12, color="#e2e8f0", ff=3))
E.append(ex.text(X + 14, wy2 + 40,
    "one orders row (id · status) · MySQL durable + Redis pub/sub\n"
    "customer:  ◀ GET /orders/:id   ◀ SSE /orders/:id/events        staff/admin:  new_order SSE ▶ /sse/admin   ·   orders WS ▶ /admin/*",
    fs=11, color="#cbd5e1", ff=3, w=1530, wrap=True))

# ---- durability matrix ----
dy = wy2 + 140
E.append(ex.text(X, dy, "DURABILITY MATRIX", fs=12, color=ex.PANEL_TXT)); dy += 24
dur = [
    ("order_cache_<id>", "▓ localStorage", "F5 ✅", "new device ❌"),
    ("activeOrderId", "▓ cart store partialize", "F5 ✅", "new device ❌"),
    ("items / tableId / tableName", "░ cart store memory", "F5 ❌", "❌"),
    ("selectedOrderId (open sheet)", "░ React state", "F5 ❌", "❌"),
    ("the orders row", "BE (MySQL + Redis)", "F5 ✅", "every device ✅"),
]
for name, loc, f5, dev in dur:
    E.append(ex.rect(X, dy, 1560, 28, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    E.append(ex.text(X + 10, dy + 6, name, fs=11, color=ex.L_TEXT, ff=3, w=360))
    E.append(ex.text(X + 380, dy + 6, loc, fs=11, color=ex.SUB, w=420))
    E.append(ex.text(X + 820, dy + 6, f5, fs=11, color=ex.L_TEXT, w=200))
    E.append(ex.text(X + 1040, dy + 6, dev, fs=11, color=ex.L_TEXT))
    dy += 32

ex.append(FP, E)
print(f"PANEL 5: added {len(E)} elements")
