#!/usr/bin/env python3
"""PANEL 8 — Flags / Known Mismatches for admin_summary.excalidraw.
Sourced from admin_summary.md §Flags + admin_summary_be.md §Flags."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p8")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 1300, 1840
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches",
                     "Doc-vs-code drift — behavioural notes, not bugs · source: admin_summary.md + admin_summary_be.md §Flags")

flags = [
    ('FE1', '"Khách hôm nay" label static', "label never changes for week/month; value IS range-correct — wording only", "page.tsx:78"),
    ('FE2', '"(delivered)" under-describes', "BE dishes_sold = status IN (delivered, paid); caption says delivered only", "page.tsx:87"),
    ('FE3', '🔴/🟡 split is FE-only', "BE returns ≤ min*1.2; isCritical = qty < warningThreshold computed FE-side", "page.tsx:318"),
    ('FE4', 'top-dishes pct = % of top-N', "totalQty sums returned LIMIT rows only — NOT period share; bars sum ~100%", "repo:150-154"),
    ('FE5', 'active_tables range-agnostic', "live snapshot; subquery has no date filter; switching range won't change it", "repo:94-97"),
    ('FE6', '<a> not next/link', '"Xem toàn bộ kho →" = raw <a> → full-page nav, not client routing', "page.tsx:304"),
    ('BE5', 'stock-in NOT transactional', "INSERT + UPDATE not in BEGIN; fail between → movement logged, stock unmoved", "repo:221-248"),
    ('BE5b', "adjustment ADDS not sets", "type:'adjustment' → current_stock + qty (adds); page only sends 'in' so safe", "repo:235-237"),
    ('BE7', "limit > 50 resets to 5", "values >50 reset to 5 (not clamped to 50); page always sends limit=5", "repo:110-112"),
    ('LD1', "no isError UI anywhere", "failed fetch → skeleton pulses forever; KPI shows 0 on undefined data", "loading.md Gap1/4"),
]
cw = 580
for i, (tag, title, body, src) in enumerate(flags):
    col = i % 2
    row = i // 2
    bx = X + col * (cw + 20)
    by = Y + 60 + row * 76
    E.append(ex.rect(bx, by, cw, 64, bg="#fef2f2", stk="#f87171", sw=1.5))
    E.append(ex.rect(bx, by, 54, 64, bg="#f87171", stk="#f87171"))
    E.append(ex.text(bx + 8, by + 24, tag, fs=11, color="#0a0a0a"))
    E.append(ex.text(bx + 64, by + 8, title, fs=12, color="#991b1b"))
    E.append(ex.text(bx + 64, by + 28, body, fs=9, color="#475569", w=cw - 80, wrap=True))
    E.append(ex.text(bx + 64, by + 48, src, fs=8, color="#94a3b8", ff=3))

n = ex.append(FP, E)
print(f"PANEL 8: added {len(E)} elements (file total {n})")
