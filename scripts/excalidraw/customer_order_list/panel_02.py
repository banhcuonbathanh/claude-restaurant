#!/usr/bin/env python3
"""PANEL 2 for customer_order_list.excalidraw — Cross-Component Dataflow.
⚠ dedicated _crosscomponent_dataflow.md is MISSING from the doc-set; traced from
SCENARIO_ORDER_HISTORY.md §A + customer_order_list_crosspage_dataflow.md §4."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p2")
E = []

X, Y = 1340, 40
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow",
                     "⚠ no _crosscomponent file — traced from SCENARIO §A + crosspage §4 · one hub: useOrderSSE → order → widgets")

def box(x, y, w, h, s, bg, stk, fs=12, ff=2, tc=ex.L_TEXT):
    E.append(ex.rect(x, y, w, h, bg=bg, stk=stk, sw=2))
    E.append(ex.text(x + 10, y + 8, s, fs=fs, color=tc, ff=ff, w=w - 20, wrap=True))

# ---- LIST PAGE side (no network) ----
ly = Y + 60
E.append(ex.text(X, ly, "A · LIST PAGE  order/page.tsx  — synchronous, no network", fs=12, color=ex.PANEL_TXT)); ly += 24
box(X, ly, 300, 64, "useState<Order[]> orders\nsetOrders(loadCachedOrders())  useEffect([],[])", ex.L_INDIGO, "#6366f1", fs=11, ff=3)
E.append(ex.arrow(X + 300, ly + 32, X + 380, ly + 32, stk="#6366f1"))
box(X + 380, ly, 300, 64, "loadCachedOrders()\nscan all order_cache_* keys → sort created_at desc", ex.L_NEUTRAL, ex.L_BORDER, fs=11, ff=3)
E.append(ex.text(X + 700, ly + 22, "▶ card grid\n   (combo headers\n    filtered)", fs=11, color=ex.SUB))

# ---- OVERLAY hub ----
hy = ly + 110
E.append(ex.text(X, hy, "B · OVERLAY  OrderDetailSheet  — single hub, no prop-drilling", fs=12, color=ex.PANEL_TXT)); hy += 26

HX, HUBW = X + 0, 340
box(HX, hy, HUBW, 78,
    "useOrderSSE(orderId)\n→ one `order` value (+ progress, connectionError,\n   notification)\nuseMemo recompute on every setOrder",
    ex.L_ORANGE, ex.C_ORD, fs=11, ff=3)

# 6 consumers fanned to the right
cons = [
    "progress bar  (progress memo)",
    "DishRow list  (displayRows memo)",
    "summaryRows  (summaryMap memo)",
    "money totals  (eaten / remaining)",
    "isActive guard  (status check)",
    "\"Thêm món\" btn  (table_id check)",
]
cx = HX + HUBW + 90
cy = hy - 70
for c in cons:
    E.append(ex.rect(cx, cy, 360, 30, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    E.append(ex.text(cx + 10, cy + 7, c, fs=11, color=ex.L_TEXT))
    E.append(ex.arrow(HX + HUBW, hy + 39, cx, cy + 15, stk=ex.C_ORD, sw=1))
    cy += 44

# rule note
ny = hy + 110
E.append(ex.rect(X, ny, HUBW, 76, bg="#f8fafc", stk="#94a3b8", style="dashed"))
E.append(ex.text(X + 10, ny + 10,
    "RULE: no arrow zone→zone.\nAll widgets derive from the SAME `order` ref.\none setOrder → one memo recompute →\nall widgets re-render in lockstep.",
    fs=10, color=ex.SUB, w=HUBW - 20, wrap=True))

ex.append(FP, E)
print(f"PANEL 2: added {len(E)} elements")
