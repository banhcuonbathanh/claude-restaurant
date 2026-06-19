#!/usr/bin/env python3
"""PANEL 9 (dark) — Live State Objects behind /order.
Source: customer_order_list_be.md + crosspage §2. ONE example threaded:
ORD-20260613-016 (Bàn 03, 2× Suất Đầy Đủ Trứng Tái = ₫60,000)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 4340
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects — real shapes + one example (ORD-20260613-016)", color=ex.PANEL_TXT)

note = "This page uses NO TanStack Query — own useState + useOrderSSE state; the only 'cache' is localStorage order_cache_<id>."
E.append(ex.text(X, Y + 26, note, fs=10, color="#475569"))

y = Y + 64
COLW = 1500

def block(y, accent, title, shape, ex_label, example):
    sh = shape.split("\n"); ev = example.split("\n")
    h = 14 + 30 + 12 + 16 + len(sh)*14 + 14 + 16 + len(ev)*14 + 14
    E.append(ex.rect(X, y, COLW, h, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(X, y, COLW, 30, bg=accent, stk=accent))
    E.append(ex.text(X + 14, y + 8, title, fs=13, color=ex.DARK))
    cy = y + 42 + 12
    E.append(ex.text(X + 14, cy, "SHAPE", fs=10, color=accent)); cy += 16
    E.append(ex.text(X + 14, cy, shape, fs=11, color=ex.LIGHT, ff=3)); cy += len(sh)*14 + 14
    E.append(ex.rect(X + 14, cy - 6, COLW - 28, 1, bg=accent, stk=accent, round_=False))
    E.append(ex.text(X + 14, cy, ex_label, fs=10, color=accent)); cy += 16
    E.append(ex.text(X + 14, cy, example, fs=11, color="#E5E7EB", ff=3))
    return h

# A — localStorage cache (the hub the list reads)
ca_shape = (
"localStorage['order_cache_'+id]   ▓ survives F5 · per-browser\n"
"= full Order JSON · written by 3 writers (TableConfirmModal, checkout, useOrderSSE)\n"
"  read by /order list (loadCachedOrders) + useOrderSSE instant-paint seed")
ca_ex = (
"order_cache_ord-016 = {\n"
"  id:\"ord-016\", order_number:\"ORD-20260613-016\", status:\"confirmed\",\n"
"  table_id:\"tbl-ban03\", table_name:\"Bàn 03\", total_amount:60000,\n"
"  created_at:\"2026-06-13T11:43:00Z\",\n"
"  items:[ /* Suất Đầy Đủ Trứng Tái ×2 — combo header + children, see card C */ ] }")
h = block(y, ex.C_TAN, "A · order_cache_<id>  —  localStorage (the in-browser hub)", ca_shape, "EXAMPLE", ca_ex); y += h + 22

# B — cart store
cb_shape = (
"useCartStore (Zustand + persist · key 'cart-config-v3')\n"
"  items: CartItem[]              ░ memory only — NOT persisted\n"
"  tableId / tableName: string|null   ░ memory only\n"
"  activeOrderId: string|null         ▓ persisted (partialize)\n"
"  orderNote: string                  ▓ persisted (partialize)\n"
"  partialize → { orderNote, activeOrderId }")
cb_ex = (
"// after order submit clearCart() ran → items=[], tableId=null, activeOrderId=null\n"
"// after overlay 'Thêm món' tap:\n"
"{ items:[], tableId:\"tbl-ban03\"(memory), activeOrderId:\"ord-016\"(persisted), orderNote:\"\" }")
h = block(y, ex.C_ZUS, "B · useCartStore  —  Zustand (drives 'Thêm món' handoff)", cb_shape, "EXAMPLE", cb_ex); y += h + 22

# C — BE Order model
cc_shape = (
"Order (BE truth → FE snapshot) · GetOrder enriches each item\n"
"Order { id, order_number, table_id, table_name, status, total_amount, items[] }\n"
"OrderItem { id, product_id|combo_id, combo_ref_id, name, unit_price,\n"
"            quantity, qty_served, note }\n"
"★ ItemStatus is DERIVED itemStatus(qty_served,quantity) — NO status column\n"
"★ combo header row: combo_id set, combo_ref_id=null, unit_price=0 (filtered from progress)")
cc_ex = (
"GET /orders/ord-016 → { data: {\n"
"  id:\"ord-016\", status:\"confirmed\", table_name:\"Bàn 03\", total_amount:60000,\n"
"  items:[\n"
"   {name:\"Suất Đầy Đủ Trứng Tái\", combo_id:\"cb-tt\", combo_ref_id:null, unit_price:0, quantity:1},\n"
"   {name:\"Bánh cuốn trứng tái\", combo_ref_id:\"hdr\", unit_price:30000, quantity:1, qty_served:1},  // done\n"
"   {name:\"Bánh cuốn trứng tái\", combo_ref_id:\"hdr\", unit_price:30000, quantity:1, qty_served:0} ] } }")
h = block(y, ex.C_ORD, "C · Order model  —  BE truth · GET /orders/:id snapshot", cc_shape, "EXAMPLE — same order, BE view", cc_ex); y += h

ex.append(FP, E)
print(f"PANEL 9: added {len(E)} elements")
