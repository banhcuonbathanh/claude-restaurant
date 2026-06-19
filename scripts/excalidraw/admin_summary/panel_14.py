#!/usr/bin/env python3
"""PANEL 14 — One Field, All Layers (dark) for admin_summary.excalidraw.
Traces the stock-in `quantity` field tap → zod → payload → service → SQL → read-back → render.
Sourced from SCENARIO 13:39 + admin_summary_be.md §5 + admin_summary_loading.md."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p14")
E = []

X, Y = 40, 4750
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — stock-in `quantity`",
                     "A single field traced end to end · tap → zod → payload → service → 2 SQL stmts → read-back → render",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 2400, 300, bg="#0b1220", stk="#1e293b", sw=1))

stops = [
    ("1 TAP", ex.C_ZUS, "number input step='0.001'\nuser types 2\npage.tsx:252-259"),
    ("2 ZOD", ex.C_AMBER, "zodResolver(stockSchema)\nquantity > 0 → passes\npage.tsx:205-209"),
    ("3 PAYLOAD", ex.C_CYAN, "{ingredient_id, type:'in',\n quantity:2, note}\nadmin.api.ts:276-277"),
    ("4 SERVICE", ex.C_VIOLET, "validate type∈{in,out,adj}\nexistence-check ingredient\ningredient_service:116-131"),
    ("5 SQL ×2", ex.C_ORD, "INSERT stock_movements.quantity\nUPDATE current_stock + 2\n0.2 → 2.2 · repo:221-248"),
    ("6 READ-BACK", ex.C_TAN, "invalidate low-stock → refetch\n2.2 > min*1.2 → row GONE\npage.tsx:225 / repo:122"),
    ("7 RENDER", ex.C_BE, "StockAlertList drops Mộc nhĩ\ntoast 'Đã nhập hàng'\npage.tsx:280"),
]
bw = 312
by = Y + 55
for i, (lab, acc, body) in enumerate(stops):
    bx = X + i * (bw + 16)
    E.append(ex.rect(bx, by, bw, 130, bg="#1F2937", stk=acc, sw=2))
    E.append(ex.rect(bx, by, bw, 28, bg=acc, stk=acc))
    E.append(ex.text(bx + 10, by + 6, lab, fs=12, color=ex.DARK))
    E.append(ex.text(bx + 12, by + 40, body, fs=10, color=ex.LIGHT, ff=3))
    if i < len(stops) - 1:
        E.append(ex.arrow(bx + bw, by + 64, bx + bw + 16, by + 64, stk=ex.MUTED, sw=2))

n = ex.append(FP, E)
print(f"PANEL 14: added {len(E)} elements (file total {n})")
