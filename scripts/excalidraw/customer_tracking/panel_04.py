#!/usr/bin/env python3
"""PANEL 4 — Object Model FE⇄BE⇄DB (READ-only).
From customer_tracking.md + _crosscomponent §2.1 type shapes. Page issues no writes."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p4")
E = []
X, Y = 1720, 580
E += ex.panel_header(X, Y, "PANEL 4 · Object Model FE⇄BE⇄DB — READ pipeline only",
                     "from _crosscomponent §2.1 · the page never writes — all arrows point FE-ward")
L = "#1e293b"

def card(x, y, w, h, accent, title, lines):
    E.append(ex.rect(x, y, w, h, bg=ex.L_NEUTRAL, stk=accent, sw=2))
    E.append(ex.rect(x, y, w, 24, bg=accent, stk=accent))
    E.append(ex.text(x + 10, y + 5, title, fs=11, color="#0a0a0a"))
    E.append(ex.text(x + 10, y + 30, lines, fs=10, color="#475569", ff=3))

# DB → BE → FE columns
card(X, Y + 60, 280, 150, ex.C_SLATE, "DB rows (MySQL)",
     "orders(id, table_id,\n  status, total_amount,\n  order_number, created_at)\norder_items(qty, qty_served,\n  filling, note)  -- NO status\ntables(id, name)")
E.append(ex.arrow(X + 280, Y + 130, X + 330, Y + 130, stk=ex.MUTED, sw=2))
card(X + 330, Y + 60, 300, 150, ex.C_ORD, "BE GetOrder → orderJSON",
     "Order row +\n items[] enriched:\n  ItemStatus =\n  itemStatus(served,qty)\n table_name (best-effort)\n→ { data: Order }")
E.append(ex.arrow(X + 630, Y + 130, X + 680, Y + 130, stk=ex.MUTED, sw=2))
card(X + 680, Y + 60, 320, 150, ex.C_TAN, "FE types/order.ts",
     "Order { id, status,\n  total_amount, items[],\n  table_name }\nQueueState { queue,\n  position, total, eta }\nQueueItem { orderId,\n  tableLabel, status }")

# SSE-derived note
sy = Y + 230
E.append(ex.rect(X, sy, 1000, 70, bg="#eef2ff", stk=ex.C_CYAN, sw=2))
E.append(ex.text(X + 12, sy + 8, "SSE-derived (not from REST): QueueState/QueueItem/MonitorTableStatus arrive on the wire;", fs=10, color=L))
E.append(ex.text(X + 12, sy + 26, "position = idx+1 and estimatedMinutes = idx*3 are computed FE-side (BE sends 0 — see Panel 8 Flag 3).", fs=10, color="#475569"))
E.append(ex.text(X + 12, sy + 46, "tableStatuses (MonitorTableStatus[]) is received & stored but NOT rendered on /tracking.", fs=10, color="#7c2d12"))

print("PANEL 4:", ex.append(FP, E), "total elements")
