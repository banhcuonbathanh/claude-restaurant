#!/usr/bin/env python3
"""PANEL 7 for admin_marketing.excalidraw — Scenario Timeline.
Source: SCENARIO_MARKETING.md (Chị Hương / manager1, morning of grand opening).
Beat-by-beat timeline + peak 200 OK snapshot. Code refs as cited in scenario."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p7")
E = []

X, Y = 40, 3160
E += ex.panel_header(X, Y, "PANEL 7 · Scenario — Chị Hương reviews the launch budget (manager1)",
    "SCENARIO_MARKETING.md · morning of grand opening ~08:45 · one manager, one GET, and the date picker that does nothing")

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

# ---- vertical beat timeline (left) ----
by = Y + 70
beats = [
    ("08:44", "Opens /admin/marketing — auth gate fires", "AuthGuard + RoleGuard(MANAGER) · JWT role=manager passes AtLeast(\"manager\"). cashier/chef → 403 redirect.", ex.C_VIOLET),
    ("08:44:02", "Page mounts; getCurrentMonthRange() seeds range", "dateRange = { from:'2026-06-01', to:'2026-06-30' } (page.tsx:22-29) → enables useMarketingSpend.", "#6366f1"),
    ("08:44:02", "Single GET fires — cache miss, skeletons up", "GET /api/v1/admin/marketing/spend?from=2026-06-01&to=2026-06-30 · isLoading=true · zones C/D/E pulse, F always visible.", ex.C_AMBER),
    ("08:44:03", "BE returns HARDCODED constants", "marketingH.GetSpend reads from/to, echoes into date_range only, returns gin.H literal. budget 50M · spent 18.5M (37%) · ROI 3.2×.", ex.C_ORD),
    ("08:44:03", "Skeletons lift — all 5 zones render", "cache written staleTime 5m. Cards/Table/Donut/LoveScore mount. She spots In ấn 70% spent before opening.", ex.C_TAN),
    ("08:51", "Changes range to May — numbers DON'T change", "new key → fresh GET → BYTE-IDENTICAL response (only date_range differs). Screen looks identical. Decorative filter (Flag 1).", ex.C_RED),
    ("08:53", "Clicks 'Xuất báo cáo' — toast only", "onExport → toast.info('… đang phát triển') (page.tsx:41). No file, no network. No export endpoint (Flag 3).", ex.C_RED),
]
for t, title, body, col in beats:
    E.append(ex.rect(X, by, 60, 56, bg=col, stk=col))
    lbl(X + 6, by + 18, t, fs=10, color="#ffffff")
    E.append(ex.rect(X + 70, by, 1010, 56, bg=ex.L_NEUTRAL, stk=col))
    lbl(X + 82, by + 7, title, fs=12, color=ex.PANEL_TXT)
    lbl(X + 82, by + 30, body, fs=10, color=ex.SUB)
    by += 66

# ---- peak snapshot (right) — the 200 OK JSON ----
SX = X + 1120
sy = Y + 70
snap = (
"200 OK  (byte-identical for every date range)\n"
"data: {\n"
"  date_range: { from:'2026-06-01', to:'2026-06-30' },  // echoed\n"
"  summary: {\n"
"    total_budget:    50000000,\n"
"    total_spent:     18500000,   // 37%\n"
"    total_remaining: 31500000,\n"
"    spent_pct: 37, roi: 3.2,\n"
"    roi_base: 'Dựa trên 2.000 khách/tháng' },\n"
"  items: [ social 53% · print 70% · kol 40%\n"
"           · promo 20% · event 10% ],\n"
"  love_score: {\n"
"    cost_per_new_customer: 9250,\n"
"    current/target_followers: 1500/5000 (30%),\n"
"    satisfaction_score: 4.5 / 5 } }")
E.append(ex.rect(SX, sy, 560, 360, bg="#0f172a", stk=ex.C_ORD, sw=2))
lbl(SX + 14, sy + 12, "PEAK SNAPSHOT — marketing_handler.go:56-79", fs=12, color=ex.C_AMBER)
lbl(SX + 14, sy + 38, snap, fs=11, ff=3, color="#E5E7EB")

my = sy + 380
E.append(ex.rect(SX, my, 560, 70, bg="#1f2937", stk=ex.C_RED))
lbl(SX + 14, my + 10, "MENTAL MODEL", fs=12, color=ex.C_RED)
lbl(SX + 14, my + 32, "Read-only stub: 1 GET, same constants for every", fs=10, color="#E5E7EB")
lbl(SX + 14, my + 50, "range; date picker + 2 buttons are decorative.", fs=10, color="#E5E7EB")

ex.append(FP, E)
print(f"PANEL 7: added {len(E)} elements")
