#!/usr/bin/env python3
"""PANEL 10 — Object Lifecycle moving (dark). Per-beat lanes: Action · order snapshot-after ·
components reacting · SSE/BE reaction. From SCENARIO + crosspage §6."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p10")
E = []
X, Y = 40, 6980
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle — ORD-016 useState moving, beat by beat",
                     "from SCENARIO + crosspage §6 · ✗ rows = SSE event dropped → state frozen until reload",
                     color="#0f172a")

y0 = Y + 60
# lane headers
lanes = [(0, 150, "ACTION"), (160, 360, "order useState after (what changed)"), (530, 330, "components react"), (870, 400, "SSE / BE reaction")]
E.append(ex.rect(X, y0, 1270, 26, bg=ex.C_SLATE, stk=ex.C_SLATE))
for lx, lw, label in lanes:
    E.append(ex.text(X + lx + 8, y0 + 6, label, fs=11, color=ex.DARK))

rows = [
    ("confirm", "status: pending → 'confirmed'", "badge flips · notification modal", "order_status_changed ✓ handled", ex.C_BE),
    ("qty +  (Trà đá)", "(unchanged) quantity stays 1", "stepper shows 2 then nothing", "item_updated ✗ DROPPED · invalidate no-op", ex.C_RED),
    ("item served", "items[Bánh].qty_served 0→1", "row tick ✓ · progress bar fills", "item_progress ✓ handled", ex.C_ORD),
    ("cancel Giò", "(unchanged) Giò row remains", "row stays · money unchanged", "item_cancelled ✗ DROPPED", ex.C_RED),
    ("all served", "status: → 'delivered'", "banner shows · Huỷ btn gone · stream closes", "order_completed ✓ handled", ex.C_BE),
]
ry = y0 + 26
for act, snap, comp, sse, c in rows:
    E.append(ex.rect(X, ry, 1270, 44, bg=ex.CARD_BG, stk=c, sw=1))
    E.append(ex.rect(X, ry, 4, 44, bg=c, stk=c))
    E.append(ex.text(X + 14, ry + 14, act, fs=10, color=ex.LIGHT, ff=3))
    E.append(ex.text(X + 168, ry + 14, snap, fs=10, color=ex.C_AMBER, ff=3))
    E.append(ex.text(X + 538, ry + 14, comp, fs=10, color=ex.MUTED, ff=3))
    E.append(ex.text(X + 878, ry + 14, sse, fs=10, color=(ex.C_RED if c == ex.C_RED else ex.C_BE), ff=3))
    ry += 46

E.append(ex.text(X, ry + 8, "The two ✗ rows are this page's OWN write paths — the loop never closes back into the useState mirror until a fresh GET /orders/:id on remount.",
                 fs=10, color=ex.C_RED, ff=2))

print("PANEL 10:", ex.append(FP, E), "total elements")
