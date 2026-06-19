#!/usr/bin/env python3
"""PANEL 10 (dark) for admin_marketing.excalidraw — Object Lifecycle (moving).
Source: admin_marketing_loading.md + SCENARIO_MARKETING.md + admin_marketing_be.md.
Per-beat lanes: Action · cache-snapshot-after · components reacting · BE reaction."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_marketing/admin_marketing.excalidraw"
ex.reset("p10")
E = []

X, Y = 40, 5560
E += ex.panel_header(X, Y, "PANEL 10 · Object Lifecycle — the same objects MOVING, beat by beat",
    color=ex.PANEL_TXT)
E.append(ex.text(X, Y + 26,
    "Lanes: ACTION → cache snapshot after → components reacting → BE reaction. The June→May beat is the punchline: new key, byte-identical payload.",
    fs=10, color="#475569"))

# lane headers
hy = Y + 64
lanes = [("ACTION", 320, ex.C_ZUS), ("CACHE SNAPSHOT (after)", 560, ex.C_TAN),
         ("COMPONENTS REACTING", 460, ex.C_CYAN), ("BE REACTION", 360, ex.C_ORD)]
lx = X
lane_x = []
for name, w, col in lanes:
    E.append(ex.rect(lx, hy, w, 28, bg=col, stk=col))
    E.append(ex.text(lx + 10, hy + 6, name, fs=12, color=ex.DARK))
    lane_x.append((lx, w, col))
    lx += w + 16

# beats
beats = [
    ("mount · seed range\ngetCurrentMonthRange()",
     "dateRange={from:'2026-06-01',\n  to:'2026-06-30'}\ncache: empty for this key",
     "enabled flips true →\nquery starts",
     "—"),
    ("GET fires (cache miss)",
     "cache[June]: <fetching>\nisLoading=true",
     "zones C/D/E → pulse\nskeletons; F static visible",
     "marketingH.GetSpend\nbuilds gin.H literal"),
    ("200 OK received",
     "cache[June]=full response\nstaleTime 5min · isLoading=false",
     "Cards/Table/Donut/Love\nmount with real values",
     "returns constants\n(budget 50M, spent 18.5M)"),
    ("pick May in header\nsetDateRange(...)",
     "dateRange={from:'2026-05-01',\n  to:'2026-05-31'}\ncache[May]: miss → fetching",
     "ALL zones re-skeleton\nTOGETHER (shared isLoading)",
     "second GET fires"),
    ("200 OK (May)",
     "cache now has 2 entries\nJune + May — IDENTICAL data",
     "screen UNCHANGED\n(same numbers)",
     "echoes date_range only\nFlag 1: params ignored"),
    ("click 'Xuất báo cáo'",
     "no cache change\nno state change",
     "Sonner toast.info()\n'đang phát triển'",
     "— no request, no endpoint"),
]
by = hy + 36
rh = 64
for action, cache, comp, be in beats:
    cells = [action, cache, comp, be]
    for (cx, w, col), cell in zip(lane_x, cells):
        E.append(ex.rect(cx, by, w, rh, bg=ex.CARD_BG, stk=col))
        E.append(ex.text(cx + 10, by + 8, cell, fs=10, color="#E5E7EB", ff=3))
    by += rh + 10

ex.append(FP, E)
print(f"PANEL 10: added {len(E)} elements")
