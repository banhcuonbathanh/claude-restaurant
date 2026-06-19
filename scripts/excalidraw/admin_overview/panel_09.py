#!/usr/bin/env python3
"""PANEL 9 — Live State Objects (dark) — crosscomponent §2.1 + be.md.
Real object shapes + ONE concrete example (BC-42) threaded through cache → BE row."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 4100
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects", "real shapes — NO Zustand on this page — threaded with one concrete order BC-42",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 1740, 470, bg="#0b1220", stk=ex.CARD_STK, sw=1))

oy = Y + 60
# Zustand: none
els, h = ex.card(X, oy, 360, ex.C_ZUS, "A · Zustand store", "(none)\n\nThis page has NO Zustand store.\nLocal UI = page.tsx useState:\n  loadingIds  kiemTraIds\n  checkedTableIds  searchQuery\n  viewMode  popupOrder")
E += els
# TanStack live
els, h = ex.card(X + 380, oy, 420, ex.C_TAN, "B · TanStack ['orders','live']",
    "Order[] {\n  id, order_number, status,\n  source, table_id, table_name?,\n  customer_name, total_amount,\n  note, created_at, items[]\n}  stale 15s")
E += els
# tables
els, h = ex.card(X + 820, oy, 380, ex.C_CYAN, "['tables'] · Table[]",
    "{ id, name, capacity,\n  status: available|\n    occupied|reserved,\n  qr_token? }\nstale 60s")
E += els
# BE row
els, h = ex.card(X + 1220, oy, 380, ex.C_ORD, "C · BE order row (MySQL)",
    "orders {\n  id, order_number, status,\n  table_id, customer_name,\n  total_amount, note,\n  created_at, updated_at\n}")
E += els

# concrete example bar
ey = oy + 240
E.append(ex.rect(X, ey, 1600, 130, bg="#13203a", stk=ex.C_TAN, sw=2))
E.append(ex.text(X + 16, ey + 10, "ONE concrete example threaded — order BC-42 (Bàn 03)", fs=13, color=ex.C_TAN))
E.append(ex.text(X + 16, ey + 40,
    "['orders','live'][k] = { id:'…42', order_number:'BC-42', status:'pending', table_id:'…b03', table_name:'Bàn 03',\n"
    "                          total_amount:42000, items:[ {name:'Bánh cuốn nhân thịt', quantity:2, qty_served:0, … } ] }",
    fs=10, color=ex.LIGHT, ff=3))
E.append(ex.text(X + 16, ey + 90,
    "BE row:  orders(id=…42, status='pending', total_amount=42000, table_id=…b03)   ← the single durable truth",
    fs=10, color=ex.C_ORD, ff=3))

n = ex.append(FP, E)
print(f"PANEL 9: {len(E)} elements added (total {n})")
