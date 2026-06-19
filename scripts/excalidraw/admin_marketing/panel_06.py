#!/usr/bin/env python3
"""PANEL 6 for admin_marketing.excalidraw — Loading States.
Source: admin_marketing_loading.md. 3 layers (route spinner → mount → single shared
isLoading) + per-zone skeleton table + error/empty branches. Code: page.tsx, loading.tsx."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p6")
E = []

X, Y = 40, 2520
E += ex.panel_header(X, Y, "PANEL 6 · Loading States — single shared isLoading, no Suspense",
    "admin_marketing_loading.md · route spinner → page mount → one useMarketingSpend isLoading drives all zones together (no progressive reveal)")

def lbl(x, y, s, fs=12, color=ex.L_TEXT, ff=2, w=None):
    E.append(ex.text(x, y, s, fs=fs, color=color, ff=ff, w=w))

# ---- 3 layers (stacked boxes) ----
ly = Y + 70
layers = [
    ("1 · Route spinner", "(dashboard)/admin/loading.tsx:1-7 · AdminLoading · whole admin shell during nav · NOT marketing-specific"),
    ("2 · Page mount", "MarketingDashboardPage mounts → single useMarketingSpend query fires (page.tsx:33) · queryKey ['marketing','spend',dateRange]"),
    ("3 · Per-zone branches", "each zone reads the SHARED isLoading → renders animate-pulse skeleton or real content (no per-zone query)"),
]
for i, (t, s) in enumerate(layers):
    E.append(ex.rect(X, ly, 1180, 44, bg=ex.L_INDIGO if i < 2 else ex.L_ORANGE, stk=ex.L_BORDER))
    lbl(X + 12, ly + 6, t, fs=12, color=ex.PANEL_TXT)
    lbl(X + 12, ly + 25, s, fs=10, color=ex.SUB)
    ly += 52

lbl(X, ly + 4, "✗ NO <Suspense> anywhere · ✗ NO marketing-specific loading.tsx (only page.tsx)", fs=11, color="#b45309")

# ---- per-zone skeleton table ----
ty = ly + 34
lbl(X, ty, "PER-ZONE SKELETON (isLoading === true)", fs=12, color=ex.PANEL_TXT)
ty += 24
rows = [
    ("C — KPI cards", "grid 2/4 cols · 4 × h-24 animate-pulse", "page.tsx:57-61"),
    ("D — Spend table", "single h-72 animate-pulse (full-width)", "page.tsx:69-71"),
    ("D — Donut", "NONE — panel absent during load (gap 1)", "page.tsx:78"),
    ("E — Love score", "grid 3 cols · 3 × h-28 animate-pulse", "page.tsx:87-90"),
    ("F — Timeline", "NONE — always rendered (static const)", "page.tsx:97"),
]
for z, sk, ref in rows:
    col = ex.C_RED if "NONE" in sk else ex.C_AMBER
    E.append(ex.rect(X, ty, 1180, 40, bg=ex.L_NEUTRAL, stk=col))
    lbl(X + 12, ty + 5, z, fs=11)
    lbl(X + 240, ty + 5, sk, fs=10, ff=3, color=ex.L_TEXT)
    lbl(X + 980, ty + 5, ref, fs=9, ff=3, color=ex.SUB)
    ty += 48

# ---- branch cards (right) ----
BX = X + 1220
by = Y + 70
E.append(ex.rect(BX, by, 460, 90, bg="#fef2f2", stk=ex.C_RED, sw=2))
lbl(BX + 12, by + 8, "ERROR branch · page.tsx:46-53", fs=12, color="#b91c1c")
lbl(BX + 12, by + 32, "isError → page-level red banner above all", fs=10, color="#b91c1c")
lbl(BX + 12, by + 50, "zones · 'Không thể tải dữ liệu.' + Thử lại", fs=10, color="#b91c1c")
lbl(BX + 12, by + 68, "(refetch). Zones fall to null (isLoading=false).", fs=10, color="#b91c1c")

by2 = by + 110
E.append(ex.rect(BX, by2, 460, 90, bg=ex.L_NEUTRAL, stk=ex.C_TAN, sw=2))
lbl(BX + 12, by2 + 8, "EMPTY branch · page.tsx:73-75", fs=12, color="#047857")
lbl(BX + 12, by2 + 32, "Zone D only → EmptyState 🍜 'Chưa có hạng", fs=10)
lbl(BX + 12, by2 + 50, "mục chi tiêu nào.' (impossible w/ static).", fs=10)
lbl(BX + 12, by2 + 68, "Zones C/E render NOTHING on null (gap 2).", fs=10, color="#b45309")

by3 = by2 + 110
E.append(ex.rect(BX, by3, 460, 110, bg=ex.L_ORANGE, stk=ex.C_ORD, sw=2))
lbl(BX + 12, by3 + 8, "DATE CHANGE re-triggers everything", fs=12, color="#b45309")
for i, s in enumerate([
    "setDateRange → new queryKey → uncached →",
    "isLoading=true → ALL zone skeletons re-enter",
    "TOGETHER (gap 4, no progressive reveal).",
    "Cached range (<5min) → instant, isLoading stays",
    "false. enabled guard defensive only (gap 3).",
]):
    lbl(BX + 12, by3 + 32 + i * 16, s, fs=10, color="#b45309")

ex.append(FP, E)
print(f"PANEL 6: added {len(E)} elements")
