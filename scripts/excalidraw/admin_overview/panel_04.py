#!/usr/bin/env python3
"""PANEL 4 — Object Model FE⇄BE⇄DB — type defs (crosscomponent §2.1) + admin_overview_be.md.
admin_overview.md has no §Object Model section → sourced from traced order.ts types + BE read/write pipeline."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p4")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 40, 1560
E += ex.panel_header(X, Y, "PANEL 4 · Object Model — FE ⇄ BE ⇄ DB",
                     "Order · OrderItem · Table shapes + READ (raw SQL→enrich→cache→props) & WRITE (button→PATCH→SQL) pipelines · source: order.ts + be.md")

# type cards
def tcard(x, y, w, title, lines, c):
    out = [ex.rect(x, y, w, 24 + len(lines) * 15 + 14, bg="#ffffff", stk=c, sw=2),
           ex.rect(x, y, w, 24, bg=c, stk=c),
           ex.text(x + 10, y + 5, title, fs=10, color="#0a0a0a", ff=3)]
    for i, l in enumerate(lines):
        out.append(ex.text(x + 10, y + 30 + i * 15, l, fs=9, color=T, ff=3))
    return out

oy = Y + 70
E += tcard(X, oy, 380, "interface Order  (order.ts:38-52)",
           ["id  order_number  status  source", "table_id  table_name?  customer_name", "customer_phone  total_amount  note",
            "created_at  updated_at?  items[]"], "#FF7A1A")
E += tcard(X, oy + 120, 380, "interface OrderItem  (order.ts:15-27)",
           ["id  product_id  combo_id  combo_ref_id", "name  quantity  qty_served  unit_price", "note  toppings_snapshot  flagged"], "#F59E0B")
E += tcard(X, oy + 230, 380, "interface Table  (admin.api.ts:159-165)",
           ["id  name  capacity", "status: available|occupied|reserved", "qr_token?"], "#22D3EE")

# READ pipeline
rx = X + 430
E.append(ex.text(rx, oy - 4, "READ pipeline  (GET /orders/live)", fs=11, color="#0f766e"))
steps = ["MySQL raw SQL\nWHERE status IN (5 active)\nORDER BY created_at ASC",
         "enrich N+1\nGetOrderItemsByOrderID\n+ table_name (GetTableByID)",
         "orderJSON() serialize\n→ Order[]",
         "['orders','live'] cache\nstaleTime 15s",
         "page.tsx derives\nfiltered* → props"]
sx = rx
for i, s in enumerate(steps):
    E.append(ex.rect(sx, oy + 24, 150, 70, bg=ex.L_NEUTRAL, stk=B, sw=1.5))
    E.append(ex.text(sx + 8, oy + 32, s, fs=8, color=T, ff=3))
    if i < len(steps) - 1:
        E.append(ex.arrow(sx + 150, oy + 59, sx + 158, oy + 59, stk="#0f766e", sw=2))
    sx += 158

# WRITE pipeline
wy = oy + 130
E.append(ex.text(rx, wy - 4, "WRITE pipeline  (advance / confirm / cancel)", fs=11, color="#9a3412"))
wsteps = ["button onAction\n(id, nextStatus)", "handleAction\noptimistic setQueryData",
          "PATCH /orders/:id/status\n{ status }", "UpdateOrderStatus\nvalidTransitions check",
          "UPDATE orders\nSET status=?, updated_at"]
sx = rx
for i, s in enumerate(wsteps):
    E.append(ex.rect(sx, wy + 24, 150, 64, bg="#fff7ed", stk="#fb923c", sw=1.5))
    E.append(ex.text(sx + 8, wy + 32, s, fs=8, color="#7c2d12", ff=3))
    if i < len(wsteps) - 1:
        E.append(ex.arrow(sx + 150, wy + 56, sx + 158, wy + 56, stk="#fb923c", sw=2))
    sx += 158

# field mapping note
my = wy + 110
E.append(ex.rect(rx, my, 790, 56, bg=ex.L_INDIGO, stk="#6366f1", sw=1.5))
E.append(ex.text(rx + 12, my + 8, "FE↔BE↔DB field map · ItemStatus is DERIVED (not stored): qty_served vs quantity → pending|preparing|done (GetOrder only).", fs=9, color="#3730a3", ff=3, w=766, wrap=True))
E.append(ex.text(rx + 12, my + 34, "combo header row = combo_id≠null & combo_ref_id=null (₫0 placeholder) → filtered by isKitchenItem() before display/count.", fs=9, color="#4338ca", ff=3, w=766, wrap=True))

n = ex.append(FP, E)
print(f"PANEL 4: {len(E)} elements added (total {n})")
