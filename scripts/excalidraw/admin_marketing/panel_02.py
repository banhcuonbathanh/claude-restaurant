#!/usr/bin/env python3
"""PANEL 2 for admin_marketing.excalidraw — Cross-Component Dataflow (prop-drill, NO store).
Source: SCENARIO_MARKETING.md §A (the _crosscomponent_dataflow.md file is N/A for this
page — single query fans out via props, no Zustand hub). Code: page.tsx, useMarketingSpend.ts."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p2")
E = []

X, Y = 40, 820
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow — prop-drill, NO store",
    "SCENARIO_MARKETING.md §A · single useMarketingSpend(dateRange) at page top → props to 5 leaf components · no Zustand, no shared store")

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

# ---- the single hub ----
hx, hy, hw, hh = X, Y + 70, 360, 110
E.append(ex.rect(hx, hy, hw, hh, bg=ex.L_INDIGO, stk="#6366f1", sw=2))
lbl(hx + 14, hy + 10, "useMarketingSpend(dateRange)", fs=13, color="#3730a3")
lbl(hx + 14, hy + 34, "page.tsx:33 · the ONLY data source", fs=10, color=ex.SUB)
lbl(hx + 14, hy + 54, "queryKey ['marketing','spend',dateRange]", fs=10, ff=3, color="#3730a3")
lbl(hx + 14, hy + 72, "returns { data, isLoading, isError, refetch }", fs=10, ff=3, color="#3730a3")

# ---- leaf components (right column) ----
LX = hx + hw + 220
leaves = [
    ("BudgetSummaryCards", "data.summary", "page.tsx:63", ex.C_ORD),
    ("SpendBreakdownTable", "data.items", "page.tsx:72", ex.C_ORD),
    ("BudgetDonutChart", "data.items + summary.spent_pct", "page.tsx:80", ex.C_ORD),
    ("LoveScoreSection", "data.love_score", "page.tsx:93", ex.C_ORD),
    ("error banner / skeletons", "isError / isLoading", "page.tsx:46-53,57-89", ex.C_RED),
]
ly = Y + 70
lh = 50
for name, field, ref, col in leaves:
    E.append(ex.rect(LX, ly, 460, lh, bg=ex.L_NEUTRAL, stk=col))
    lbl(LX + 12, ly + 7, name, fs=12)
    lbl(LX + 12, ly + 28, f"← {field}   ({ref})", fs=10, ff=3, color=ex.SUB)
    # arrow from hub to leaf
    E.append(ex.arrow(hx + hw + 4, hy + hh // 2, LX - 4, ly + lh // 2, stk="#6366f1", sw=2))
    ly += lh + 14

# ---- CampaignTimeline OUTSIDE the query ----
ty = ly + 10
E.append(ex.rect(LX, ty, 460, 56, bg="#fffdf7", stk="#fde9cf", style="dashed"))
lbl(LX + 12, ty + 8, "CampaignTimeline", fs=12)
lbl(LX + 12, ty + 28, "← CAMPAIGN_MILESTONES (static const) — NO props from hook", fs=10, ff=3, color="#b45309")

# ---- callout ----
co_y = hy + hh + 50
E.append(ex.rect(hx, co_y, hw + 40, 150, bg="#fff7ed", stk=ex.C_ORD))
lbl(hx + 12, co_y + 10, "NO cross-component store", fs=13, color="#b45309")
for i, s in enumerate([
    "• No Zustand · no Context · no shared hub.",
    "• Single query result prop-drills to leaves.",
    "• All 5 zones read the SAME isLoading boolean",
    "  → no progressive reveal (see Panel 6).",
    "• _crosscomponent_dataflow.md = N/A for this",
    "  page (SCENARIO §A).",
]):
    lbl(hx + 12, co_y + 36 + i * 18, s, fs=10, color="#b45309")

ex.append(FP, E)
print(f"PANEL 2: added {len(E)} elements")
