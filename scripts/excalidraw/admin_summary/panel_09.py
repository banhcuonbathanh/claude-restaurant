#!/usr/bin/env python3
"""PANEL 9 — Live State Objects (dark) for admin_summary.excalidraw.
Sourced from admin_summary_be.md (response shapes) + SCENARIO (Mộc nhĩ example).
Real object shapes threaded with ONE concrete example."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 2500
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects",
                     "Real shapes threaded with ONE example (Mộc nhĩ) · NO Zustand object — only client state is range:'week'",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 2400, 540, bg="#0b1220", stk="#1e293b", sw=1))

cy = Y + 50
els, h = ex.card(X, cy, 560, ex.C_ZUS,
    "client state (no store)",
    'range = "week"            // useState, page.tsx:366\n'
    '// the ONLY shared client value\n'
    '// dies on F5 → resets to "today"\n'
    'modalIng: Ingredient|null // StockAlertList local\n'
    'mut.isPending: boolean    // submit gate')
E += els

els, h2 = ex.card(X + 600, cy, 600, ex.C_TAN,
    "TanStack cache — read entries",
    "['admin','summary','week'] →\n"
    "  {customers:86, dishes_sold:240,\n"
    "   revenue:'4250000', active_tables:3}\n"
    "['admin','top-dishes','week'] →\n"
    "  [{name:'Bánh cuốn thịt', qty:820,\n"
    "    revenue:8200000, pct:82.0}, ...]\n"
    "['admin','low-stock'] →  (camelCase)\n"
    "  [{id, name:'Mộc nhĩ', unit:'kg',\n"
    "    quantity:0.2, warningThreshold:1,\n"
    "    status:'low_stock'}]")
E += els

els, h3 = ex.card(X + 1240, cy, 600, ex.C_ORD,
    "BE write response (snake_case)",
    "POST /admin/stock-movements  201 →\n"
    "{ id, ingredient_id:'<uuid Mộc nhĩ>',\n"
    "  type:'in', quantity:2,\n"
    "  note:'Nhập hàng sau ca trưa',\n"
    "  created_at }\n"
    "// actor (created_by) injected BE-side\n"
    "//   from JWT — NOT in response body\n"
    "// staff-perf row is role-dependent:\n"
    "//   chef rows OMIT the revenue key")
E += els

# the one example callout
ey = cy + max(h, h2, h3) + 20
E.append(ex.rect(X, ey, 1840, 56, bg="#111827", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 16, ey + 10, "ONE EXAMPLE THREADED — Mộc nhĩ:", fs=12, color=ex.C_RED))
E.append(ex.text(X + 16, ey + 32, "low-stock quantity 0.2 (camelCase) ─▶ modalIng object ─▶ payload quantity:2 ─▶ DB current_stock 0.2→2.2 ─▶ re-read drops it from list", fs=11, color=ex.LIGHT, ff=3))

n = ex.append(FP, E)
print(f"PANEL 9: added {len(E)} elements (file total {n})")
