#!/usr/bin/env python3
"""PANEL 11 (dark) — Realtime Fan-out. Sourced from customer_checkout_crosspage_dataflow.md
§7 (admin event pipeline) + §8 (one staff tap, all screens move)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p11")
E = []
X, Y = 1620, 3320
E.append(ex.rect(X - 20, Y - 20, 1560, 470, bg="#0b1220", stk="#1e293b", sw=2))
E += ex.panel_header(X, Y, "PANEL 11 · Realtime Fan-out — one commit, many screens", "Redis pub/sub only (no Redis read-cache) · device→BE→(Redis)→device", color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
c1, h1 = ex.card(X, cy, 740, ex.C_BE, "① POST /orders create → fan-out (service:348-350)",
 "new_order ─Redis─▶ /sse/admin ping (lightweight)\n         admin GET /orders/:id ─▶ ['orders','live']\n         (only if ACTIVE)\nadmin event + monitor broadcast\n→ Lê Đầu Bếp's KDS shows the ticket live\n(no browser↔browser path)")
E += c1
c2, h2 = ex.card(X + 760, cy, 750, ex.C_CYAN, "② staff \"served +1\" → PATCH item",
 "PATCH /orders/A/items/X → qty_served++\n  ─Redis publish─▶\n  • /order/<id>  SSE item_progress → bar moves\n                 → ▓ order_cache_A written back\n  • /tracking    SSE items_* → refetch card\n  • admin floor  orders WS → ['orders','live']\n  • other guests /tracking → queue.update")
E += c2
ny = cy + max(h1, h2) + 10
E.append(ex.rect(X, ny, 1500, 58, bg="#0a1a12", stk=ex.C_TAN, sw=2))
E.append(ex.text(X + 12, ny + 8, "SSE stop conditions (useOrderSSE)", fs=11, color=ex.C_TAN))
E.append(ex.text(X + 12, ny + 28, "loop STOPS on order_cancelled / order_completed · monitor SSE 401/403 = PERMANENT stop (re-scan QR).", fs=10, color=ex.LIGHT, ff=3))

ex.append(FP, E)
print(f"PANEL 11: appended {len(E)} elements")
