#!/usr/bin/env python3
"""PANEL 10 — Object Lifecycle (moving, dark) for admin_summary.excalidraw.
Sourced from SCENARIO restock beats (13:38→13:39:02) + crosspage §2.
Per-beat lanes: Action · cache-snapshot-after · components reacting · BE reaction."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p10")
E = []

X, Y = 40, 3120
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle — the restock, moving",
                     "Same objects from Panel 9 in motion · per-beat lanes · current_stock 0.2 → 2.2 → leaves WHERE ≤ min*1.2",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 2400, 540, bg="#0b1220", stk="#1e293b", sw=1))

# lane headers
lanes = ["ACTION", "CACHE snapshot AFTER", "COMPONENTS reacting", "BE reaction (MySQL)"]
lane_accent = [ex.C_ZUS, ex.C_TAN, ex.C_CYAN, ex.C_ORD]
lx = X
lw = [380, 560, 520, 560]
ly = Y + 50
for i, (lab, acc) in enumerate(zip(lanes, lane_accent)):
    E.append(ex.rect(lx, ly, lw[i], 30, bg=acc, stk=acc))
    E.append(ex.text(lx + 12, ly + 8, lab, fs=12, color=ex.DARK))
    lx += lw[i] + 12

beats = [
    ("click +Nhập hàng → type 2",
     "modalIng = {name:'Mộc nhĩ',\n  quantity:0.2}  (no cache write yet)",
     "StockInModal mounts (fixed overlay)\nbutton enabled",
     "— (no request yet)"),
    ("submit '✓ Xác nhận nhập'",
     "no cache change yet;\nmut.isPending = true",
     "button → 'Đang lưu...' disabled\n(no double-submit)",
     "POST /admin/stock-movements\n{type:'in', quantity:2}"),
    ("201 received",
     "(server done — see BE lane)\nmovement row returned",
     "—",
     "① INSERT stock_movements\n② UPDATE current_stock 0.2→2.2\n③ re-SELECT  (NOT in a tx)"),
    ("onSuccess fires",
     "invalidate ['admin','low-stock']\ninvalidate ['admin','ingredients']",
     "StockAlertList refetch (skeleton flash)\ntoast 'Đã nhập hàng' · modal closes",
     "next GET low-stock: 2.2 > min*1.2\n→ Mộc nhĩ DROPS off the list"),
]
by = ly + 40
for r, row in enumerate(beats):
    yy = by + r * 100
    lx = X
    for i, cell in enumerate(row):
        E.append(ex.rect(lx, yy, lw[i], 90, bg="#1F2937", stk=lane_accent[i], sw=1.5))
        E.append(ex.text(lx + 10, yy + 10, f"beat {r+1}" if i == 0 else "", fs=9, color=ex.MUTED))
        E.append(ex.text(lx + 10, yy + (28 if i == 0 else 12), cell, fs=9, color=ex.LIGHT, ff=3))
        lx += lw[i] + 12

n = ex.append(FP, E)
print(f"PANEL 10: added {len(E)} elements (file total {n})")
