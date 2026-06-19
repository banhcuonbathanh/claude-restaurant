#!/usr/bin/env python3
"""PANEL 4 for admin_marketing.excalidraw — Object Model FE⇄BE (no DB layer).
Source: admin_marketing_be.md response shape + field→component mapping.
READ-only pipeline: handler constants → JSON → FE type → leaf component.
DB layer is explicitly empty (no marketing table, no spend ledger)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p4")
E = []

X, Y = 40, 2080
E += ex.panel_header(X, Y, "PANEL 4 · Object Model FE⇄BE — READ-only pipeline (no DB layer)",
    "admin_marketing_be.md · gin.H constants → JSON → MarketingSpendResponse → leaf component · DB = ∅ (no table, no ledger)")

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

# ---- 3 layer columns ----
py = Y + 70
colw = 360
gap = 90
cols = [
    ("BE — handler constants", ex.C_ORD, [
        "gin.H literal (marketing_handler.go)",
        "summary{...}      :59-66",
        "items[5]{...}     :23-54",
        "love_score{...}   :68-77",
        "date_range{from,to}  :58 (echo)",
        "★ no DB read, no Redis",
    ]),
    ("FE type — MarketingSpendResponse", "#6366f1", [
        "fe/src/types/marketing.ts",
        "{ date_range, summary,",
        "  items: SpendItem[],",
        "  love_score }",
        "decoded by useMarketingSpend",
        "(TanStack cache, staleTime 5m)",
    ]),
    ("FE leaf components", ex.C_TAN, [
        "summary    → BudgetSummaryCards",
        "items      → SpendBreakdownTable",
        "items+pct  → BudgetDonutChart",
        "love_score → LoveScoreSection",
        "(date_range field unused in UI)",
        "CampaignTimeline = static const",
    ]),
]
for i, (title, col, body) in enumerate(cols):
    cx = X + i * (colw + gap)
    h = 40 + len(body) * 20 + 16
    E.append(ex.rect(cx, py, colw, h, bg=ex.L_NEUTRAL, stk=col, sw=2))
    E.append(ex.rect(cx, py, colw, 28, bg=col, stk=col))
    lbl(cx + 12, py + 6, title, fs=12, color="#ffffff")
    for j, s in enumerate(body):
        lbl(cx + 12, py + 38 + j * 20, s, fs=10, ff=3, color=ex.L_TEXT)
    if i < len(cols) - 1:
        E.append(ex.arrow(cx + colw + 4, py + 60, cx + colw + gap - 4, py + 60, stk=ex.L_BORDER, sw=2))

# arrow labels
lbl(X + colw + 4, py + 36, "JSON 200", fs=9, color=ex.SUB)
lbl(X + 2 * colw + gap + 4, py + 36, "props", fs=9, color=ex.SUB)

# ---- DB = empty banner ----
dy = py + 180
E.append(ex.rect(X, dy, 2 * colw + gap, 70, bg="#fef2f2", stk=ex.C_RED, sw=2, style="dashed"))
lbl(X + 14, dy + 10, "DB LAYER = ∅", fs=14, color="#b91c1c")
lbl(X + 14, dy + 36, "No marketing table · no spend ledger · no migration · no sqlc query. When real spend tracking is built,", fs=10, color="#b91c1c")
lbl(X + 14, dy + 52, "this handler must be replaced with a service+repo reading actual rows (be.md Flag 2).", fs=10, color="#b91c1c")

# WRITE path note
wy = dy + 90
E.append(ex.rect(X, wy, 2 * colw + gap, 50, bg="#fff7ed", stk=ex.C_ORD))
lbl(X + 14, wy + 8, "WRITE path = ∅", fs=12, color="#b45309")
lbl(X + 14, wy + 28, "No POST/PATCH/DELETE. 'Xuất báo cáo' / '+ Nhập chi tiêu' are toasts only (be.md Flag 3).", fs=10, color="#b45309")

ex.append(FP, E)
print(f"PANEL 4: added {len(E)} elements")
