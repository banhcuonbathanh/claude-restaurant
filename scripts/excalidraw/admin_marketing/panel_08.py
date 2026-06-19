#!/usr/bin/env python3
"""PANEL 8 for admin_marketing.excalidraw — Flags / Known Mismatches.
Source: admin_marketing_be.md Flags 1-4 + admin_marketing_loading.md gaps 1-5 +
SCENARIO_MARKETING.md flags + the .md wireframe-vs-code number drift (this skill found it)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p8")
E = []

X, Y = 40, 3880
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches — collected from all 4 docs + this build",
    "be.md Flags 1-4 · loading.md gaps 1-5 · scenario flags · plus a doc-vs-code number drift surfaced while building this map")

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

flags = [
    ("BE-1", "from/to accepted but IGNORED — date filter decorative", "Header picker refetches with new params, but GetSpend only echoes into date_range; all numbers constant. mh.go:20-21,58.", ex.C_RED),
    ("BE-2", "Whole endpoint is hardcoded mock data", "No service/repo/SQL. No marketing table. Must be replaced when real spend tracking is built. mh.go:23-77.", ex.C_ORD),
    ("BE-3", "'Xuất báo cáo' / '+ Nhập chi tiêu' have no endpoint", "Both → toast.info('… đang phát triển'). No write path exists. page.tsx:41-42.", ex.C_ORD),
    ("BE-4", "No realtime", "Pull-only via TanStack. No SSE/WS. A spend change wouldn't push to open dashboards.", ex.C_AMBER),
    ("LOAD-1", "No donut skeleton", "During isLoading the BudgetDonutChart panel is simply absent → asymmetric layout. page.tsx:78.", ex.C_AMBER),
    ("LOAD-2", "Zones C & E show NOTHING on null data", "summary/love_score null → silent blank (no EmptyState, no message). page.tsx:62-64,92-94.", ex.C_AMBER),
    ("LOAD-3", "No <Suspense> / no marketing loading.tsx", "Only the admin-group route loading.tsx is the nav fallback. Remove it → no per-page fallback.", ex.C_AMBER),
    ("LOAD-4", "Shared isLoading — no progressive reveal", "All zones re-enter skeleton together on every date change. No cached-partial stay-rendered.", ex.C_AMBER),
    ("LOAD-5", "❓ Donut blank-during-load UNVERIFIED", "Code is clear (page.tsx:78) but no AC/wireframe confirms blank-right-panel is intentional.", ex.C_SLATE),
    ("DOC", "Wireframe numbers ≠ code constants", ".md ASCII shows spent 32.000k / 64%; traced BE = 18.500k / 37%. .md figures are illustrative/older — code wins.", ex.C_VIOLET),
]
cy = Y + 70
colw = 580
for i, (tag, title, body, col) in enumerate(flags):
    col_i = i % 2
    row = i // 2
    fx = X + col_i * (colw + 30)
    fy = cy + row * 92
    E.append(ex.rect(fx, fy, colw, 80, bg=ex.L_NEUTRAL, stk=col, sw=2))
    E += ex.badge(fx + 10, fy + 10, tag, col, fs=10)
    lbl(fx + 110, fy + 12, title, fs=12, color=ex.PANEL_TXT)
    E.append(ex.text(fx + 12, fy + 40, body, fs=10, color=ex.SUB, w=colw - 24, wrap=True))

# footer note
ny = cy + 5 * 92 + 10
E.append(ex.rect(X, ny, colw * 2 + 30, 50, bg="#f0fdf4", stk=ex.C_BE))
lbl(X + 12, ny + 8, "No <PAGE>_BUGS.md for this page.", fs=12, color="#047857")
lbl(X + 12, ny + 28, "Trace found no FE↔BE event/ownership/dead-output disagreement — only intentional-stub behaviour (doc edits, not code, are the fix).", fs=10, color="#047857")

ex.append(FP, E)
print(f"PANEL 8: added {len(E)} elements")
