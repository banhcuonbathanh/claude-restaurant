#!/usr/bin/env python3
"""PANEL 4 — Object Model FE⇄BE⇄DB for admin_summary.excalidraw.
Sourced from admin_summary.md §Object Model + admin_summary_be.md per-endpoint detail."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p4")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 40, 1280
E += ex.panel_header(X, Y, "PANEL 4 · Object Model — page owns NO model",
                     "Read-aggregation + ONE write · consumes Order/OrderItem metrics + Ingredient/StockMovement · source: admin_summary.md §Object Model")

# READ pipeline
ry = Y + 60
E.append(ex.rect(X, ry, 560, 230, bg=ex.L_NEUTRAL, stk="#94a3b8", sw=2))
E.append(ex.text(X + 14, ry + 10, "READ pipeline — Order / OrderItem metrics", fs=13, color="#1e293b"))
E.append(ex.text(X + 14, ry + 34, "OBJECT_MODEL_ORDER.md (no fields restated here)", fs=9, color="#64748b"))
reads = [
    "orders ──COUNT(*) status!='cancelled'──▶ customers (KPI A)",
    "order_items⋈orders status IN(delivered,paid) ──SUM(qty)──▶ dishes_sold",
    "payments status='completed' ──SUM(amount)──▶ revenue",
    "orders status IN(confirmed,preparing,ready) ──COUNT DISTINCT table──▶ active_tables",
    "order_items GROUP BY name combo_ref_id IS NULL ──▶ top-dishes",
    "staff LEFT JOIN orders/payments ──▶ staff-performance",
]
for i, r in enumerate(reads):
    E.append(ex.text(X + 14, ry + 56 + i * 26, "• " + r, fs=9, color="#475569", ff=3))

# WRITE pipeline
wx = X + 600
E.append(ex.rect(wx, ry, 560, 230, bg="#fff7ed", stk="#fb923c", sw=2))
E.append(ex.text(wx + 14, ry + 10, "WRITE pipeline — Ingredient + StockMovement", fs=13, color="#9a3412"))
E.append(ex.text(wx + 14, ry + 34, "OBJECT_MODEL_INGREDIENT.md", fs=9, color="#a16207"))
E.append(ex.text(wx + 14, ry + 60, "StockInModal {ingredient_id, type:'in', quantity, note}", fs=10, color="#7c2d12", ff=3))
E.append(ex.arrow(wx + 200, ry + 86, wx + 200, ry + 110, stk="#ea580c", sw=2))
E.append(ex.text(wx + 14, ry + 112, "① INSERT stock_movements  (audit log, durable)", fs=10, color="#7c2d12", ff=3))
E.append(ex.text(wx + 14, ry + 134, "② UPDATE ingredients.current_stock += quantity", fs=10, color="#7c2d12", ff=3))
E.append(ex.text(wx + 14, ry + 156, "③ re-SELECT movement → 201 response", fs=10, color="#7c2d12", ff=3))
E.append(ex.text(wx + 14, ry + 186, "status (in_stock/low_stock/expiring_soon/out_of_stock)", fs=9, color="#64748b"))
E.append(ex.text(wx + 14, ry + 202, "computed server-side ON READ (not a stored state machine)", fs=9, color="#64748b"))

n = ex.append(FP, E)
print(f"PANEL 4: added {len(E)} elements (file total {n})")
