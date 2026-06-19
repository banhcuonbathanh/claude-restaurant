#!/usr/bin/env python3
"""PANEL 10 — Object Lifecycle (moving, dark). Per-beat lanes from _crosscomponent §3 + scenario."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p10")
E = []
X, Y = 1500, 2900
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle — the same objects MOVING",
                     "from _crosscomponent §3 (7 steps) · Action → hook/query state after → widgets reacting",
                     color="#0f172a")

# lane headers
heads = ["Action / SSE event", "hook state after", "query state after", "widgets reacting"]
colx = [X, X + 470, X + 800, X + 1130]
colw = [460, 320, 320, 380]
hy = Y + 56
for i, h in enumerate(heads):
    E.append(ex.rect(colx[i], hy, colw[i], 24, bg=ex.C_SLATE, stk=ex.C_SLATE))
    E.append(ex.text(colx[i] + 8, hy + 5, h, fs=11, color="#0a0a0a"))

beats = [
    ("1 mount: read activeOrderId", "—", "enabled:true → fetch fires", "—"),
    ("2 SSE onopen", "sseConnected=true", "—", "TopBar LIVE · ErrorBanner hidden"),
    ("3 query resolves", "orderStatus=null", "order=Order{pending}", "OrderDetailCard · TableInfoBanner"),
    ("4 queue.update", "queueData={pos3,total5,eta6}", "—", "TableInfoBanner queue · FloorList"),
    ("5 order.status (NEVER arrives)", "orderStatus stays null", "—", "(badge unchanged — Flag 1)"),
    ("6 items_added/updated/cancelled", "itemsChangedAt=Date.now()", "refetch → order updated", "OrderDetailCard re-renders"),
    ("7 toggle Ẩn bàn", "—", "—", "TableInfoBanner+DetailCard unmount"),
]
ry = hy + 28
for i, row in enumerate(beats):
    rh = 40
    c = ex.C_RED if "NEVER" in row[0] else ex.CARD_STK
    for j, cell in enumerate(row):
        E.append(ex.rect(colx[j], ry, colw[j], rh, bg=ex.CARD_BG, stk=c, sw=1))
        E.append(ex.text(colx[j] + 6, ry + 6, cell, fs=9, color=ex.LIGHT, ff=3, w=colw[j] - 12, wrap=True))
    ry += rh + 4

print("PANEL 10:", ex.append(FP, E), "total elements")
