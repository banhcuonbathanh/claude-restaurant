#!/usr/bin/env python3
"""PANEL 14 (dark) for admin_marketing.excalidraw — One Field, All Layers.
Traces the `from` date param — the field that proves the page's core truth:
input accepted, fires a real request, but BE never applies it. Source: all 4 docs."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p14")
E = []

X, Y = 40, 7280
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — trace `from` (the decorative param)",
    color=ex.PANEL_TXT)
E.append(ex.text(X, Y + 26,
    "The field that proves the page's mental model: it travels the whole stack, fires a real GET, and changes NOTHING in the response numbers.",
    fs=10, color="#475569"))

y = Y + 70
steps = [
    ("1 · TAP", ex.C_ZUS, "DateRangePicker (in MarketingPageHeader) → onDateChange('from','2026-05-01')", "page.tsx:38-43"),
    ("2 · STATE", ex.C_ZUS, "setDateRange({from:'2026-05-01', to:...}) — local useState, not persisted", "page.tsx:32,39"),
    ("3 · QUERY KEY", ex.C_TAN, "queryKey ['marketing','spend',{from:'2026-05-01',...}] → cache miss → fetch", "useMarketingSpend.ts:7"),
    ("4 · REQUEST", ex.C_CYAN, "GET /api/v1/admin/marketing/spend?from=2026-05-01&to=2026-05-31", "useMarketingSpend.ts:9-13"),
    ("5 · HANDLER READ", ex.C_ORD, "from := c.DefaultQuery(\"from\",\"2026-05-01\")  // assigned…", "marketing_handler.go:20"),
    ("6 · HANDLER USE", ex.C_RED, "…echoed ONLY into date_range:{from,to} — NEVER used to filter any number", "marketing_handler.go:58"),
    ("7 · DB", ex.C_SLATE, "∅ — no SQL, no WHERE date BETWEEN, no table. The param dies here.", "(no query exists)"),
    ("8 · READ-BACK", ex.C_TAN, "200 OK: summary/items/love_score = same Go constants regardless of `from`", "mh.go:23-77"),
    ("9 · RENDER", ex.C_RED, "BudgetSummaryCards/Table/Donut/Love show IDENTICAL figures — screen unchanged", "page.tsx:62-93"),
]
COLW = 1500
sh = 50
for tag, col, body, src in steps:
    E.append(ex.rect(X, y, COLW, sh, bg=ex.CARD_BG, stk=col))
    E.append(ex.rect(X, y, 130, sh, bg=col, stk=col, round_=False))
    E.append(ex.text(X + 12, y + 16, tag, fs=12, color=ex.DARK))
    E.append(ex.text(X + 144, y + 8, body, fs=11, color="#E5E7EB", ff=3))
    E.append(ex.text(X + 144, y + 30, src, fs=9, color=ex.MUTED, ff=3))
    y += sh + 8

# verdict
E.append(ex.rect(X, y + 6, COLW, 54, bg="#1f2937", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 14, y + 16, "VERDICT", fs=12, color=ex.C_RED))
E.append(ex.text(X + 120, y + 16,
    "`from` is a fully-wired, fully-decorative field: 9 layers of plumbing, zero effect on output. The one-line truth of /admin/marketing.",
    fs=11, color="#E5E7EB"))

ex.append(FP, E)
print(f"PANEL 14: added {len(E)} elements")
