#!/usr/bin/env python3
"""PANEL 5 — Cross-Page Dataflow for admin_summary.excalidraw.
Sourced from admin_summary_crosspage_dataflow.md (one-diagram + handoff + durability)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p5")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 1300, 1280
E += ex.panel_header(X, Y, "PANEL 5 · Cross-Page Dataflow",
                     "Thin surface · the ONE write (restock) is the only cross-page event · NO SSE/WS — refetch-only · source: admin_summary_crosspage_dataflow.md")

# in-browser hub
hy = Y + 60
E.append(ex.rect(X, hy, 620, 200, bg=ex.L_INDIGO, stk="#a5b4fc", sw=2))
E.append(ex.text(X + 14, hy + 10, "in-browser hub — TanStack Query (memory only)", fs=12, color="#1e293b"))
keys = ["['admin','low-stock']            ← read here",
        "['admin','ingredients']          ← invalidated too",
        "['admin','summary',range]        ← read-only,",
        "['admin','top-dishes',range]        no cross-page",
        "['admin','staff-performance',range]  write"]
for i, k in enumerate(keys):
    E.append(ex.text(X + 14, hy + 36 + i * 20, k, fs=10, color="#3730a3", ff=3))
E.append(ex.text(X + 14, hy + 144, "/admin/summary  StockInModal:", fs=10, color="#475569"))
E.append(ex.text(X + 14, hy + 162, "POST /admin/stock-movements → 201 → invalidate BOTH", fs=10, color="#dc2626", ff=3))
E.append(ex.text(X + 14, hy + 180, "/admin/ingredients reads same DB row → refetch when busted", fs=9, color="#64748b"))

# the wire / BE hub
wy = hy + 220
E.append(ex.rect(X, wy, 620, 110, bg="#fff7ed", stk="#fb923c", sw=2))
E.append(ex.text(X + 14, wy + 10, "THE WIRE — BE is the real hub (MySQL, durable, no Redis)", fs=12, color="#9a3412"))
E.append(ex.text(X + 14, wy + 36, "ingredients.current_stock   (the row of truth)", fs=10, color="#7c2d12", ff=3))
E.append(ex.text(X + 14, wy + 56, "stock_movements log entry   (audit)", fs=10, color="#7c2d12", ff=3))
E.append(ex.text(X + 14, wy + 82, "other manager devices see it on NEXT refetch — NOT pushed", fs=10, color="#dc2626"))
E.append(ex.arrow(X + 310, hy + 200, X + 310, wy, stk="#ea580c", sw=2))

# durability matrix
mx = X + 660
E.append(ex.rect(mx, hy, 560, 330, bg=ex.L_NEUTRAL, stk="#94a3b8", sw=2))
E.append(ex.text(mx + 14, hy + 10, "Durability matrix", fs=12, color="#1e293b"))
mrows = [
    ("Datum", "F5", "new device", True),
    ("Range tab (useState)", "❌ → today", "❌", False),
    ("TanStack cache (memory)", "❌", "❌", False),
    ("ingredients.current_stock", "✅", "✅", False),
    ("stock_movements log row", "✅", "✅", False),
]
for i, (d, f5, nd, head) in enumerate(mrows):
    yy = hy + 36 + i * 32
    bg = "#1e293b" if head else ("#ffffff" if i % 2 else ex.L_NEUTRAL)
    fg = "#f1f5f9" if head else T
    E.append(ex.rect(mx + 12, yy, 536, 30, bg=bg, stk="#e2e8f0", sw=1))
    E.append(ex.text(mx + 22, yy + 8, d, fs=10, color=fg, ff=3))
    E.append(ex.text(mx + 330, yy + 8, f5, fs=10, color=fg))
    E.append(ex.text(mx + 450, yy + 8, nd, fs=10, color=fg))
E.append(ex.text(mx + 14, hy + 210, "Multi-device: restock by A is NOT pushed to B. B sees it on", fs=10, color="#475569"))
E.append(ex.text(mx + 14, hy + 228, "next nav OR after 120s staleTime (low-stock) expires.", fs=10, color="#475569"))
E.append(ex.text(mx + 14, hy + 252, "🔮 planned /admin/storage reads same endpoints → no wiring", fs=10, color="#7c3aed"))
E.append(ex.text(mx + 14, hy + 270, "needed; the DB row is the shared fact.", fs=10, color="#7c3aed"))
E.append(ex.text(mx + 14, hy + 296, "Contrast: /admin/overview DOES use WS (useOverviewWS).", fs=10, color="#64748b"))

n = ex.append(FP, E)
print(f"PANEL 5: added {len(E)} elements (file total {n})")
