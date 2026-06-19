#!/usr/bin/env python3
"""PANEL 10 — Object Lifecycle moving (dark) — crosscomponent §3 + §7.
BC-42 pending→confirmed in 7 beats: Action · cache-after · components reacting · TanStack/WS reaction."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p10")
E = []

X, Y = 1900, 4100
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle (moving) — BC-42 pending → confirmed",
                     "the SAME object moving · 7 beats × 4 lanes · source: crosscomponent §3, §7",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 1740, 530, bg="#0b1220", stk=ex.CARD_STK, sw=1))

# lane headers
lanes = [("Action", 360, ex.C_SLATE), ("cache ['orders','live'] after", 480, ex.C_TAN),
         ("components reacting", 420, ex.C_ZUS), ("TanStack / WS reaction", 360, ex.C_CYAN)]
lx = X
hy = Y + 56
for name, w, c in lanes:
    E.append(ex.rect(lx, hy, w - 10, 26, bg=c, stk=c))
    E.append(ex.text(lx + 8, hy + 5, name, fs=10, color=ex.DARK))
    lx += w

beats = [
    ("① tap \"Xác nhận\"\n  WaitingSection\n  onAction(BC-42,confirmed)", "(unchanged)\nBC-42.status='pending'", "spinner not yet", "—"),
    ("② setLoadingIds\n  add BC-42", "(unchanged)", "WaitingSection/TableList\nbutton → '...' spinner", "loadingIds prop"),
    ("③ PATCH /orders/BC-42\n  /status {confirmed}", "(unchanged — await)", "—", "200 OK"),
    ("④ setQueryData\n  optimistic map", "BC-42.status='confirmed' ✦", "page re-renders, derives\nnew filtered arrays", "cache entry marked"),
    ("⑤ fan-out re-render", "BC-42.status='confirmed'", "B: BC-42 VANISHES (not\npending) · D: badge flips\n· StatCards recompute", "all subscribers notified"),
    ("⑥ WS order_status_changed", "BC-42.status='confirmed'\n(idempotent)", "no visible change", "useOverviewWS\nsetQueryData (no-op diff)"),
    ("⑦ finally:\n  setLoadingIds del", "BC-42.status='confirmed'", "spinner clears (D only)", "settled"),
]
ry = hy + 32
for i, row in enumerate(beats):
    yy = ry + i * 64
    lx = X
    bg = "#13203a" if i % 2 == 0 else "#101a30"
    for (val, (name, w, c)) in zip(row, lanes):
        E.append(ex.rect(lx, yy, w - 10, 60, bg=bg, stk=ex.CARD_STK, sw=1))
        col = ex.C_TAN if (name.startswith("cache") and "✦" in val) else ex.LIGHT
        E.append(ex.text(lx + 8, yy + 6, val, fs=9, color=col, ff=3, w=w - 22, wrap=True))
        lx += w

n = ex.append(FP, E)
print(f"PANEL 10: {len(E)} elements added (total {n})")
