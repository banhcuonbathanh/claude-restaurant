#!/usr/bin/env python3
"""PANEL 9 (dark) for admin_marketing.excalidraw — Live State Objects.
Source: admin_marketing_be.md + SCENARIO_MARKETING.md concrete 200 OK JSON.
Real shapes: TanStack cache entry + BE response model. ONE example threaded
(June 2026 range → budget 50M / spent 18.5M). NO Zustand store on this page."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p9")
E = []

X, Y = 40, 4540
E += ex.panel_header(X, Y, "PANEL 9 · Live State Objects — real shapes + one example (June-2026 range)",
    color=ex.PANEL_TXT)
E.append(ex.text(X, Y + 26,
    "This page has NO Zustand store. The only client state is the TanStack cache entry; the BE model is a hardcoded literal (no DB row).",
    fs=10, color="#475569"))

y = Y + 64
COLW = 1500

def block(y, accent, title, shape, ex_label, example):
    sh = shape.split("\n"); ev = example.split("\n")
    h = 14 + 30 + 12 + 16 + len(sh) * 14 + 14 + 16 + len(ev) * 14 + 14
    E.append(ex.rect(X, y, COLW, h, bg=ex.CARD_BG, stk=accent, sw=2))
    E.append(ex.rect(X, y, COLW, 30, bg=accent, stk=accent))
    E.append(ex.text(X + 14, y + 8, title, fs=13, color=ex.DARK))
    cy = y + 42 + 12
    E.append(ex.text(X + 14, cy, "SHAPE", fs=10, color=accent)); cy += 16
    E.append(ex.text(X + 14, cy, shape, fs=11, color=ex.LIGHT, ff=3)); cy += len(sh) * 14 + 14
    E.append(ex.rect(X + 14, cy - 6, COLW - 28, 1, bg=accent, stk=accent, round_=False))
    E.append(ex.text(X + 14, cy, ex_label, fs=10, color=accent)); cy += 16
    E.append(ex.text(X + 14, cy, example, fs=11, color="#E5E7EB", ff=3))
    return h

# A — TanStack cache entry (the only client hub)
a_shape = (
"queryClient cache['marketing','spend',dateRange]   ░ memory · dies on F5\n"
"= MarketingSpendResponse · staleTime 5min · enabled !!from && !!to\n"
"  written once per distinct date range — every entry holds IDENTICAL data")
a_ex = (
"['marketing','spend',{from:'2026-06-01',to:'2026-06-30'}] = {\n"
"  date_range:{from:'2026-06-01',to:'2026-06-30'},\n"
"  summary:{ total_budget:50000000, total_spent:18500000, total_remaining:31500000,\n"
"            spent_pct:37, roi:3.2, roi_base:'Dựa trên 2.000 khách/tháng' },\n"
"  items:[5], love_score:{...} }")
h = block(y, ex.C_TAN, "A · TanStack cache entry  —  the only in-browser state (no Zustand)", a_shape, "EXAMPLE", a_ex); y += h + 22

# B — BE response model
b_shape = (
"MarketingSpendResponse (BE gin.H literal → FE type) · marketing_handler.go:56-79\n"
"{ date_range:{from,to}, summary:Summary, items:SpendItem[5], love_score:LoveScore }\n"
"SpendItem { id, icon, name, sub_items[], budget, spent, remaining, progress_pct, color }\n"
"★ from/to land ONLY in date_range — every other field is a Go constant (not DB-derived)")
b_ex = (
"GET /admin/marketing/spend?from=2026-06-01&to=2026-06-30 → 200 {\n"
"  items:[\n"
"   {id:'social', icon:'📱', name:'Social Media Ads', budget:15000000, spent:8000000, progress_pct:53, color:'#6366f1'},\n"
"   {id:'print',  icon:'🖨️', name:'In ấn & Tờ rơi',  budget:5000000,  spent:3500000, progress_pct:70, color:'#f59e0b'}, ...],\n"
"  love_score:{ cost_per_new_customer:9250, current_followers:1500, target_followers:5000,\n"
"               follower_progress_pct:30, satisfaction_score:4.5, satisfaction_max:5.0 } }")
h = block(y, ex.C_ORD, "B · MarketingSpendResponse  —  BE truth (hardcoded, no DB row)", b_shape, "EXAMPLE — same range, BE view", b_ex); y += h + 22

# C — local useState (date range)
c_shape = (
"local useState in MarketingDashboardPage (page.tsx:32) · NOT persisted\n"
"dateRange: { from: string, to: string }   seeded by getCurrentMonthRange() page.tsx:22-29\n"
"  updated by MarketingPageHeader onDateChange → setDateRange → drives queryKey")
c_ex = (
"// initial mount on 2026-06-20\n"
"dateRange = { from:'2026-06-01', to:'2026-06-30' }\n"
"// after picking May → { from:'2026-05-01', to:'2026-05-31' }  → new key, same payload")
h = block(y, ex.C_ZUS, "C · dateRange  —  local useState (the only mutable input)", c_shape, "EXAMPLE", c_ex); y += h

ex.append(FP, E)
print(f"PANEL 9: added {len(E)} elements")
