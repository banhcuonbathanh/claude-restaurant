#!/usr/bin/env python3
"""PANEL 12 — Realtime Fan-out (dark) — STAR PANEL.
From _be.md event table + scenario §D. One commit → Redis channels → SSE handler → hook → widgets."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p12")
E = []
X, Y = 1500, 3500
E += ex.panel_header(X, Y, "PANEL 12 · Realtime Fan-out — the SSE pipeline (STAR)",
                     "from _be.md event table + scenario §D · BE commit → Redis pub/sub → SSE handler → hook switch → widgets",
                     color="#0f172a")

# stage boxes
y0 = Y + 64
def stg(x, w, accent, title, lines):
    h = 24 + 14 * (lines.count("\n") + 1) + 16
    E.append(ex.rect(x, y0, w, 150, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(x, y0, w, 24, bg=accent, stk=accent))
    E.append(ex.text(x + 8, y0 + 5, title, fs=11, color="#0a0a0a"))
    E.append(ex.text(x + 8, y0 + 32, lines, fs=9, color=ex.LIGHT, ff=3))

stg(X, 320, ex.C_ORD, "BE write (KDS/POS/admin)",
    "publishOrderEvent(...)\npublishItemEvent(...)\npublishMonitorBroadcast()\n  (goroutine — never blocks)")
E.append(ex.arrow(X + 320, y0 + 75, X + 360, y0 + 75, stk=ex.MUTED, sw=2))
stg(X + 360, 300, ex.C_VIOLET, "Redis channels",
    "order:<id>\nqueue:broadcast\ntables:broadcast")
E.append(ex.arrow(X + 660, y0 + 75, X + 700, y0 + 75, stk=ex.MUTED, sw=2))
stg(X + 700, 320, ex.C_CYAN, "SSE StreamOrderMonitor",
    "Subscribe(3 channels)\nemit event:<extractEventType>\nkeep-alive : every 15s\ninitial snapshot on connect")
E.append(ex.arrow(X + 1020, y0 + 75, X + 1060, y0 + 75, stk=ex.MUTED, sw=2))
stg(X + 1060, 340, ex.C_TAN, "useOrderMonitorSSE switch",
    "case queue.update / tables.status\ncase items_added/updated/cancelled\n→ setItemsChangedAt → refetch()")

# match / no-match matrix
my = y0 + 170
E.append(ex.text(X, my, "Event → does it reach this page?", fs=12, color="#0f172a"))
rows = [
    ("queue.update", "queue:broadcast / snapshot", "✅ yes → queueData", ex.C_TAN),
    ("tables.status", "tables:broadcast / snapshot", "✅ arrives → but DROPPED (not rendered)", ex.C_AMBER),
    ("items_added / item_updated / item_cancelled", "order:<id>", "✅ yes → itemsChangedAt → refetch", ex.C_TAN),
    ("order_status_changed", "order:<id>  (status transitions)", "❌ hook listens 'order.status' — NEVER matches (Flag 1)", ex.C_RED),
    ("item_progress", "order:<id>  (qty-served++)", "❌ no case in hook (Flag 2)", ex.C_RED),
]
for i, (ev, ch, res, c) in enumerate(rows):
    yy = my + 26 + i * 30
    E.append(ex.rect(X, yy, 1400, 26, bg=ex.CARD_BG, stk=c, sw=1))
    E.append(ex.text(X + 8, yy + 6, ev, fs=10, color=ex.LIGHT, ff=3))
    E.append(ex.text(X + 470, yy + 6, ch, fs=9, color=ex.MUTED, ff=3))
    E.append(ex.text(X + 800, yy + 6, res, fs=9, color=c, ff=3))

print("PANEL 12:", ex.append(FP, E), "total elements")
