#!/usr/bin/env python3
"""PANEL 1 for admin_marketing.excalidraw — Page Wireframe — /admin/marketing.
Source: docs/system/08_pages/admin/admin_marketing/admin_marketing.md
(ASCII wireframe + Zones table). Numbers shown are the TRACED BE constants
(admin_marketing_be.md / SCENARIO_MARKETING.md), not the .md placeholder figures.
FIRST panel → ex.save() creates the doc."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p1")
E = []

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe — /admin/marketing",
    "admin_marketing.md · desktop · read-only spend dashboard · one query (useMarketingSpend) fans out to 5 zones · manager+ only")

# ---- desktop frame ----
PX, PY, PW = X, Y + 60, 880
PH = 700
E.append(ex.rect(PX, PY, PW, PH, bg="#ffffff", stk=ex.L_BORDER, sw=2))

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

# admin shell tab nav (context)
E.append(ex.rect(PX, PY, PW, 30, bg=ex.L_INDIGO, stk=ex.L_BORDER))
lbl(PX + 10, PY + 8, "(admin shell tab nav — (dashboard)/admin/layout.tsx · AuthGuard + RoleGuard minRole=MANAGER)", fs=10, color="#3730a3")

# Zone B — header
by = PY + 30
E.append(ex.rect(PX, by, PW, 46, bg=ex.L_ORANGE, stk=ex.L_BORDER))
lbl(PX + 12, by + 14, "B  Marketing", fs=14)
E += ex.badge(PX + 200, by + 12, "01/06/2026 – 30/06/2026 ▾", ex.C_AMBER, fs=10)
lbl(PX + 560, by + 14, "[Xuất BC]  [+ Chi tiêu]", fs=12, color="#b45309")
lbl(PX + 12, by + 30, "MarketingPageHeader · DateRange useState (getCurrentMonthRange) · both buttons → toast.info (no endpoint)", fs=9, color=ex.SUB)

# Zone C — KPI cards
cy = by + 60
lbl(PX + 12, cy, "C  BudgetSummaryCards  ← data.summary  (4 KPI cards)", fs=11, color=ex.PANEL_TXT)
cy += 22
kpis = [("Ngân sách", "₫50.000k"), ("Đã chi", "₫18.500k · 37%"), ("Còn lại", "₫31.500k"), ("ROI dự kiến", "3.2×")]
kw = (PW - 24 - 3 * 12) // 4
for i, (t, v) in enumerate(kpis):
    kx = PX + 12 + i * (kw + 12)
    E.append(ex.rect(kx, cy, kw, 60, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    lbl(kx + 10, cy + 8, t, fs=10, color=ex.SUB)
    lbl(kx + 10, cy + 30, v, fs=13)

# Zone D — table + donut
dy = cy + 80
lbl(PX + 12, dy, "D  SpendBreakdownTable  ← data.items   +   BudgetDonutChart  ← items + summary.spent_pct", fs=11, color=ex.PANEL_TXT)
dy += 22
tw = PW - 24 - 200 - 12
E.append(ex.rect(PX + 12, dy, tw, 180, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
lbl(PX + 24, dy + 10, "Hạng mục            Ngân sách    Đã chi    %", fs=11, color=ex.SUB)
rows = [
    ("📱 Social Media Ads", "15.000k", "8.000k", "53%"),
    ("🖨️ In ấn & Tờ rơi", "5.000k", "3.500k", "70%"),
    ("🌟 Influencer/KOL", "10.000k", "4.000k", "40%"),
    ("🎁 Khuyến mãi khai trương", "10.000k", "2.000k", "20%"),
    ("🎊 Sự kiện khai trương", "10.000k", "1.000k", "10%"),
]
ry = dy + 34
for name, b, s, p in rows:
    lbl(PX + 24, ry, f"{name:<26}{b:>10}{s:>10}{p:>6}", fs=10, ff=3)
    ry += 26
# donut
dox = PX + 12 + tw + 12
E.append(ex.rect(dox, dy, 200, 180, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
lbl(dox + 70, dy + 70, "◔ 37%", fs=18, color=ex.C_ORD)
lbl(dox + 30, dy + 110, "per-category segments", fs=9, color=ex.SUB)
lbl(dox + 18, dy + 150, "absent during load (no skeleton)", fs=8, color="#b45309")

# Zone E — love score
ey = dy + 200
lbl(PX + 12, ey, "E  LoveScoreSection  ← data.love_score  (3 effectiveness cards)", fs=11, color=ex.PANEL_TXT)
ey += 22
loves = [("Chi phí / khách mới", "9.250₫"), ("Followers", "1.500 / 5.000 · 30%"), ("Hài lòng", "4.5 / 5")]
lw = (PW - 24 - 2 * 12) // 3
for i, (t, v) in enumerate(loves):
    lx = PX + 12 + i * (lw + 12)
    E.append(ex.rect(lx, ey, lw, 56, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    lbl(lx + 10, ey + 8, t, fs=10, color=ex.SUB)
    lbl(lx + 10, ey + 28, v, fs=12)

# Zone F — timeline
fy = ey + 76
lbl(PX + 12, fy, "F  CampaignTimeline  ← static CAMPAIGN_MILESTONES (page.tsx:14-20) · always rendered · NO query/skeleton", fs=11, color=ex.PANEL_TXT)
fy += 22
E.append(ex.rect(PX + 12, fy, PW - 24, 40, bg="#fffdf7", stk="#fde9cf", style="dashed"))
lbl(PX + 24, fy + 12, "[Tuần 1-2] ── [Tuần 3] ── [Tuần 4] ── [🎊 Khai trương] ── [Sau KT]", fs=11)

# ---- Zones table (right of frame) ----
ZX = PX + PW + 60
zy = Y + 60
lbl(ZX, zy, "ZONES → COMPONENT → DATA SOURCE", fs=13, color=ex.PANEL_TXT)
zy += 26
zones = [
    ("B Header", "MarketingPageHeader", "local DateRange useState (defaults current month)"),
    ("C KPI cards", "BudgetSummaryCards", "useMarketingSpend(dateRange) → data.summary"),
    ("D Table", "SpendBreakdownTable", "data.items (5 categories)"),
    ("D Donut", "BudgetDonutChart", "data.items + summary.spent_pct"),
    ("E Love score", "LoveScoreSection", "data.love_score"),
    ("F Timeline", "CampaignTimeline", "static CAMPAIGN_MILESTONES const in page.tsx"),
]
for z, comp, src in zones:
    E.append(ex.rect(ZX, zy, 760, 56, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    lbl(ZX + 12, zy + 7, f"{z}  ·  {comp}", fs=12)
    lbl(ZX + 12, zy + 30, src, fs=10, color=ex.SUB)
    zy += 64

zy += 14
lbl(ZX, zy, "KEY INTERACTIONS", fs=13, color=ex.PANEL_TXT); zy += 24
for s in [
    "• Change date range → refetch, but BE IGNORES from/to (echoes into date_range only) → numbers identical",
    "• Xuất báo cáo / + Nhập chi tiêu → toast.info('… đang phát triển') — placeholders, no endpoint",
    "• Error → inline red banner + Thử lại (refetch) · empty items → EmptyState",
]:
    lbl(ZX, zy, s, fs=11, color=ex.L_TEXT); zy += 24

zy += 12
E.append(ex.rect(ZX, zy, 760, 64, bg="#fff7ed", stk=ex.C_ORD))
lbl(ZX + 12, zy + 10, "⚠ Read-only pre-launch STUB: 1 GET, fully hardcoded BE response.", fs=12, color="#b45309")
lbl(ZX + 12, zy + 34, "No Zustand store · no localStorage write · no DB table · no realtime. (see Panels 3, 8)", fs=11, color="#b45309")

ex.save(FP, E)
print(f"PANEL 1: saved {len(E)} elements")
