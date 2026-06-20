#!/usr/bin/env python3
"""PANEL 2 — Cross-Component Dataflow. crosscomponent doc MISSING → sourced from
SCENARIO_ORDER_DETAIL.md §A (lines 368-393) + customer_order_detail_crosspage_dataflow.md §6.
The page's hub is useOrderSSE's useState<Order> — NOT TanStack."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p2")
E = []
X, Y = 40, 1120
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow — useOrderSSE useState IS the hub",
                     "crosscomponent doc MISSING → traced from SCENARIO §A + crosspage §6 · NO TanStack query for the order on this page")

y0 = Y + 56
# hub: useOrderSSE
hub_w = 420
E.append(ex.rect(X, y0, hub_w, 150, bg=ex.L_ORANGE, stk=ex.C_ORD, sw=3))
E.append(ex.text(X + 14, y0 + 10, "useOrderSSE(params.id)", fs=14, color=ex.L_TEXT))
E.append(ex.text(X + 14, y0 + 36,
                 "① read order_cache_<id> → instant paint (ts:33-38)\n"
                 "② GET /orders/:id  → setOrder(data.data) (ts:55-57)\n"
                 "③ SSE /events  → onmessage delta patches (ts:64-131)\n"
                 "   each setOrder() → ▓ writes order_cache_<id>\n"
                 "↳ holds  order: Order | null  (useState — single src)",
                 fs=10, color="#475569"))

# SSE event patches box
ex_x = X + hub_w + 60
E.append(ex.rect(ex_x, y0, 470, 150, bg=ex.L_NEUTRAL, stk=ex.C_TAN, sw=2))
E.append(ex.text(ex_x + 12, y0 + 8, "SSE onmessage switch (useOrderSSE.ts:83-123)", fs=12, color=ex.L_TEXT))
E.append(ex.text(ex_x + 12, y0 + 30,
                 "✓ order_status_changed → {status} + setNotification\n"
                 "✓ item_progress        → patch items[].qty_served\n"
                 "✓ order_cancelled      → {status:'cancelled'} +close\n"
                 "✓ order_completed      → {status:'delivered'} +close\n"
                 "✗ item_updated   — NO CASE (Bug 1)\n"
                 "✗ item_cancelled — NO CASE (Bug 2)\n"
                 "✗ items_added    — NO CASE",
                 fs=10, color="#475569"))

# arrow hub -> derived
ddy = y0 + 200
E.append(ex.arrow(X + hub_w/2, y0 + 150, X + hub_w/2, ddy, stk=ex.C_ORD, sw=2))
E.append(ex.text(X + hub_w/2 + 8, y0 + 165, "order", fs=10, color=ex.C_ORD))

# derived memos row
mem_w = 220
memos = [
    ("displayRows", "per-item rows + combo groups"),
    ("summaryRows", "grouped by product_id"),
    ("progress", "served/total %"),
    ("eaten / remaining", "Amount memos"),
]
for i, (t, s) in enumerate(memos):
    mx = X + i * (mem_w + 16)
    E.append(ex.rect(mx, ddy, mem_w, 50, bg=ex.L_INDIGO, stk=ex.C_VIOLET, sw=2))
    E.append(ex.text(mx + 10, ddy + 8, "useMemo " + t, fs=11, color=ex.L_TEXT))
    E.append(ex.text(mx + 10, ddy + 28, s, fs=9, color="#475569"))

# consumers
cdy = ddy + 90
cons = [("DishRow", "per item"), ("SummaryTable", "grouped"), ("MoneyCard", "eaten/remaining/total")]
for i, (t, s) in enumerate(cons):
    cx = X + i * 300
    E.append(ex.rect(cx, cdy, 270, 46, bg="#ffffff", stk=ex.C_CYAN, sw=2))
    E.append(ex.text(cx + 10, cdy + 8, t, fs=12, color=ex.L_TEXT))
    E.append(ex.text(cx + 10, cdy + 27, s, fs=9, color="#475569"))
    E.append(ex.arrow(X + i*(mem_w+16) + mem_w/2 if i < 3 else cx+135, ddy + 50, cx + 135, cdy, stk=ex.C_VIOLET, sw=1))

# dead invalidation note
E.append(ex.rect(X, cdy + 70, 900, 34, bg="#fff1f2", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 12, cdy + 78,
                 "⚠ DEAD: updateQtyMutation.onSuccess → invalidateQueries(['order',id]) — no such useQuery exists → no-op (page.tsx:59)",
                 fs=10, color="#b91c1c"))

print("PANEL 2:", ex.append(FP, E), "total elements")
