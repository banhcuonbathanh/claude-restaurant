#!/usr/bin/env python3
"""PANEL 8 (dark) — Live State Objects. Sourced from customer_checkout_crosspage_dataflow.md §2
+ SCENARIO_CHECKOUT_ORDER.md (one concrete example: Minh's order)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p8")
E = []
X, Y = 40, 2500
E.append(ex.rect(X - 20, Y - 20, 1560, 380, bg="#0b1220", stk="#1e293b", sw=2))
E += ex.panel_header(X, Y, "PANEL 8 · Live State Objects — the 3 real shapes", "one example (Minh's order) threaded through all three", color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
c1, _ = ex.card(X, cy, 490, ex.C_ZUS, "cart store (Zustand)",
 "items: [combo Giò, Canh]\ntableId: null   tableName: null\nactiveOrderId: null\npaymentMethod: 'vnpay' (briefly)\norderNote: ''\n──────────\npersist (CART_CONFIG \"cart-config-v3\"):\n  partialize → { orderNote, activeOrderId }\n  (items NOT persisted)")
E += c1
c2, _ = ex.card(X + 510, cy, 490, ex.C_VIOLET, "order_cache_<id> (localStorage)",
 "{ id, order_number:'#A12',\n  status:'pending',\n  source:'online'|'qr',\n  table_id:null|'<uuid>',\n  customer_name, customer_phone,\n  total_amount: 21000,\n  note, created_at, items:[...] }\n→ full Order shape (order.ts:38-52)")
E += c2
c3, _ = ex.card(X + 1020, cy, 490, ex.C_ORD, "BE OrderJSON (the row)",
 "id · order_number · status:'pending'\nsource: online  table_id: NULL\ncreated_by: NULL (customer role)\ntotal_amount: 21000\nitems[]: header(unit_price=0)\n  + sub-rows(combo_ref_id)\n  + standalone Canh\n(orderJSON handler:318-389)")
E += c3

ex.append(FP, E)
print(f"PANEL 8: appended {len(E)} elements")
