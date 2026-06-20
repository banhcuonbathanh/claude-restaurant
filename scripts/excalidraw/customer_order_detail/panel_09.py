#!/usr/bin/env python3
"""PANEL 9 — Live State Objects (dark). Real shapes threaded with ORD-20260613-016.
From _be.md (OrderJSON), SCENARIO §A, crosspage §10."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p9")
E = []
X, Y = 40, 6380
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects — the 3 real shapes (ORD-20260613-016)",
                     "from _be.md + SCENARIO §A · one concrete order threaded through useOrderSSE useState · cart store · BE model",
                     color="#0f172a")

y0 = Y + 60
c1, _ = ex.card(X, y0, 380, ex.C_ORD, "useOrderSSE useState<Order>  (the hub)",
                'order: {\n'
                '  id: "ord-…-016",\n'
                '  order_number:"ORD-20260613-016",\n'
                '  table_id:"…", table_name:"Bàn 03",\n'
                '  status: "preparing",\n'
                '  total_amount: 60000,\n'
                '  items: [ … 5 rows … ]\n'
                '}')
E += c1
c2, _ = ex.card(X + 410, y0, 360, ex.C_ZUS, "Zustand · useCartStore (persisted)",
                'activeOrderId: "ord-…-016"  ▓\n'
                'orderNote:     ""           ▓\n'
                'tableId:       "…"          ░ memory\n'
                'items:         []           ░ memory\n'
                '(partialize → CART_CONFIG\n'
                '  = "cart-config-v3")')
E += c2
c3, _ = ex.card(X + 800, y0, 470, ex.C_TAN, "BE OrderJSON model (no Redis cache)",
                'data: {\n'
                '  id, order_number, status,\n'
                '  total_amount, table_name,\n'
                '  items: [{ id, product_id,\n'
                '    combo_ref_id, name, quantity,\n'
                '    qty_served, filling, note,\n'
                '    item_status }]   ← derived\n'
                '}   itemStatus(qty_served,quantity)')
E += c3

# one item example threaded
y1 = y0 + 200
c4, _ = ex.card(X, y1, 600, ex.C_CYAN, "ONE item threaded — Trà đá (the stepper target)",
                'FE useState item:  { id:"itm-trada", quantity:1, qty_served:0,\n'
                '                     filling:null, item_status:"pending" }\n'
                'DB order_items row: quantity=1  qty_served=0  unit_price=8000\n'
                'after stepper +:    quantity SHOULD=2 in DB … but FE still shows 1 (Bug 1)')
E += c4
c5, _ = ex.card(X + 630, y1, 640, ex.C_VIOLET, "combo group example — Suất Đầy Đủ (combo_ref_id)",
                'header ×2  combo_id set · product_id NULL · unit_price 0  (filtered from display)\n'
                'Bánh Trứng Tái ×2 · Giò ×2 · Bánh Cuốn ×6   combo_ref_id → header\n'
                'Trà đá ×2  standalone (product_id set, combo_ref_id NULL)\n'
                'DishRow groups children under collapsible header by combo_ref_id')
E += c5

print("PANEL 9:", ex.append(FP, E), "total elements")
