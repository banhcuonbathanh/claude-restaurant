#!/usr/bin/env python3
"""PANEL 11 — DB Row-Level View (READ, dark). From _be.md + schema. Page reads, never writes."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p11")
E = []
X, Y = 40, 3500
E += ex.panel_header(X, Y, "PANEL 11 · DB Row-Level View — READ only (no writes)",
                     "from _be.md · GetOrderByID + GetOrderItemsByOrderID + GetTableByID · status is DERIVED, not stored",
                     color="#0f172a")

y0 = Y + 60
c1, _ = ex.card(X, y0, 520, ex.C_ORD, "orders  (1 row)",
                'id            = ord-…-016\ntable_id      = <Bàn 03 uuid>\nstatus        = preparing   ← stored\ntotal_amount  = 60000\norder_number  = ORD-20260613-016\ncreated_at    = 2026-06-13 12:01')
E += c1
c2, _ = ex.card(X + 550, y0, 560, ex.C_TAN, "order_items  (N rows) — NO status column",
                'id  qty  qty_served  filling   note\n--  ---  ----------  -------   ----\n..   2       1        thit      —\nItemStatus = itemStatus(qty_served,qty)\n  served==0 → pending\n  0<served<qty → partial\n  served>=qty → served')
E += c2
c3, _ = ex.card(X + 1130, y0, 300, ex.C_SLATE, "tables  (1 row)",
                'id    = <Bàn 03 uuid>\nname  = "Bàn 03"\n→ resolves table_name\n  (best-effort)')
E += c3

E.append(ex.rect(X, y0 + 230, 1430, 60, bg=ex.CARD_BG, stk=ex.C_RED, sw=2))
E.append(ex.text(X + 12, y0 + 238, "WRITES from this page: NONE.", fs=12, color=ex.C_RED))
E.append(ex.text(X + 12, y0 + 260, "All qty_served increments + status transitions are written by KDS/POS/admin — /tracking only observes.",
                 fs=10, color=ex.MUTED))

print("PANEL 11:", ex.append(FP, E), "total elements")
