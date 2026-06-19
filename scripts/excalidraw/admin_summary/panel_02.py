#!/usr/bin/env python3
"""PANEL 2 — Cross-Component Dataflow for admin_summary.excalidraw.
Sourced from SCENARIO_SUMMARY_REVIEW.md §A + admin_summary.md §Zones.
(NOTE: admin_summary_crosscomponent_dataflow.md is absent from the doc-set; this panel
is traced from the scenario's cross-component section + the zones table instead.)"""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p2")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 1400, 40
E += ex.panel_header(X, Y, "PANEL 2 · Cross-Component Dataflow",
                     "No Zustand store · range useState → prop fan-out · 4 independent useQuery · ⚠ no crosscomponent doc — traced from SCENARIO §A")

# parent state box
px, py, pw = X, Y + 60, 520
E.append(ex.rect(px, py, pw, 80, bg=ex.L_INDIGO, stk="#a5b4fc", sw=2))
E.append(ex.text(px + 16, py + 12, "SummaryPage  (page.tsx:365)", fs=13, color="#1e293b"))
E.append(ex.text(px + 16, py + 36, "const [range, setRange] = useState<SummaryRange>('today')", fs=11, color="#3730a3", ff=3))
E.append(ex.text(px + 16, py + 56, "the ONLY shared state — no store, no URL param, dies on F5", fs=9, color="#64748b"))

# three range-keyed children
cy = py + 120
labels = [("SummaryKPICards", "['admin','summary',range]", "page.tsx:58"),
          ("TopDishesList", "['admin','top-dishes',range]", "page.tsx:107"),
          ("StaffPerfTable", "['admin','staff-performance',range]", "page.tsx:159")]
cw = 300
for i, (nm, key, src) in enumerate(labels):
    cx = X + i * (cw + 20)
    E.append(ex.rect(cx, cy, cw, 96, bg=ex.L_ORANGE, stk="#fdba74", sw=1.5))
    E.append(ex.text(cx + 14, cy + 10, nm, fs=12, color="#9a3412"))
    E.append(ex.text(cx + 14, cy + 34, "own useQuery:", fs=9, color="#64748b"))
    E.append(ex.text(cx + 14, cy + 50, key, fs=10, color="#7c2d12", ff=3))
    E.append(ex.text(cx + 14, cy + 74, "prop: range  ·  " + src, fs=9, color="#a16207"))
    # arrow from parent
    E.append(ex.arrow(px + 120 + i * 60, py + 80, cx + cw / 2, cy, stk="#6366f1", sw=2))

# independent StockAlertList
sy = cy + 130
sx = X
E.append(ex.rect(sx, sy, cw, 96, bg="#fff7ed", stk="#fb923c", sw=2))
E.append(ex.text(sx + 14, sy + 10, "StockAlertList", fs=12, color="#9a3412"))
E.append(ex.text(sx + 14, sy + 34, "['admin','low-stock']", fs=10, color="#7c2d12", ff=3))
E.append(ex.text(sx + 14, sy + 54, "NO range prop (page.tsx:381)", fs=10, color="#dc2626"))
E.append(ex.text(sx + 14, sy + 74, "range-independent — never refetches on switch", fs=9, color="#a16207"))

# rules box
rx = X + cw + 20
E.append(ex.rect(rx, sy, 620, 96, bg=ex.L_NEUTRAL, stk=B, sw=1.5))
E.append(ex.text(rx + 14, sy + 10, "Coupling rules (the whole picture)", fs=12, color="#1e293b"))
E.append(ex.text(rx + 14, sy + 34, "• sections NEVER talk to each other — no section→section arrow", fs=10, color="#475569"))
E.append(ex.text(rx + 14, sy + 52, "• only coupling = parent range prop fan-out to 3 children", fs=10, color="#475569"))
E.append(ex.text(rx + 14, sy + 70, "• switch range → 3 refetch · low-stock static (SCENARIO 13:36)", fs=10, color="#475569"))

print("PANEL 2 built")
n = ex.append(FP, E)
print(f"PANEL 2: added {len(E)} elements (file total {n})")
