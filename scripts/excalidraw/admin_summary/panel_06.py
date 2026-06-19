#!/usr/bin/env python3
"""PANEL 6 — Loading States for admin_summary.excalidraw.
Sourced from admin_summary_loading.md (6 layers + per-query skeleton table + range-switch)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p6")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 2920, 1280
E += ex.panel_header(X, Y, "PANEL 6 · Loading States",
                     "No shared Suspense · 4 independent useQuery skeletons · staggered pop-in · source: admin_summary_loading.md")

# layers stack
ly = Y + 60
layers = [
    ("1  (dashboard)/layout.tsx", "no loading UI — wraps OrdersWSProvider only"),
    ("2  AuthGuard", "renders null (BLANK) while user not in Zustand — longest perceived wait"),
    ("3  RoleGuard minRole=MANAGER", "access-denied message if role < MANAGER (not a spinner)"),
    ("4  admin/loading.tsx", "route-level orange spinner — navigation into segment ONLY"),
    ("5  summary/page.tsx", "NO loading.tsx at this segment (confirmed — file absent)"),
    ("6  four per-query skeletons", "each widget owns its inline animate-pulse — no <Suspense>"),
]
for i, (a, b) in enumerate(layers):
    yy = ly + i * 42
    bg = ex.L_ORANGE if i == 5 else ex.L_NEUTRAL
    E.append(ex.rect(X, yy, 580, 36, bg=bg, stk="#cbd5e1", sw=1.5))
    E.append(ex.text(X + 12, yy + 6, a, fs=11, color="#1e293b"))
    E.append(ex.text(X + 12, yy + 22, b, fs=8, color="#64748b"))

# per-query table
tx = X + 620
E.append(ex.text(tx, ly - 4, "Per-section skeleton (priority: isLoading → empty → data)", fs=11, color="#1e293b"))
ty = ly + 18
cols = [("Section", 150), ("staleTime", 80), ("skeleton", 130), ("empty state", 180)]
E.append(ex.rect(tx, ty, 540, 28, bg="#1e293b", stk="#334155"))
cx = tx
for nm, w in cols:
    E.append(ex.text(cx + 6, ty + 7, nm, fs=10, color="#f1f5f9"))
    cx += w
trows = [
    ("SummaryKPICards", "60s", "4× h-28 cards", "(none — always 4 fields)"),
    ("TopDishesList", "60s", "5× h-8 rows", "Chưa có dữ liệu trong kỳ này"),
    ("StaffPerfTable", "60s", "4× h-8 rows", "Chưa có dữ liệu"),
    ("StockAlertList", "120s", "3× h-12 rows", "✅ Tất cả nguyên liệu đủ hàng"),
]
for r, row in enumerate(trows):
    yy = ty + 28 + r * 34
    E.append(ex.rect(tx, yy, 540, 34, bg="#ffffff" if r % 2 == 0 else ex.L_NEUTRAL, stk="#e2e8f0", sw=1))
    cx = tx
    for i, cell in enumerate(row):
        E.append(ex.text(cx + 6, yy + 9, cell, fs=9, color=T, ff=3 if i < 3 else 2))
        cx += cols[i][1]

# range switch + modal pending
by = ty + 28 + len(trows) * 34 + 16
E.append(ex.rect(tx, by, 540, 100, bg=ex.L_INDIGO, stk="#a5b4fc", sw=1.5))
E.append(ex.text(tx + 12, by + 8, "Range switch (page.tsx:366)", fs=11, color="#1e293b"))
E.append(ex.text(tx + 12, by + 30, "3 range-keyed queries re-enter isLoading → skeleton re-appears", fs=10, color="#475569"))
E.append(ex.text(tx + 12, by + 48, "['admin','low-stock'] NOT re-keyed → stays static (staggered)", fs=10, color="#475569"))
E.append(ex.text(tx + 12, by + 72, "Modal submit: isPending → button 'Đang lưu...' disabled (no double-submit)", fs=10, color="#7c2d12"))

E.append(ex.text(X, ly + len(layers) * 42 + 10, "⚠ Gap: NO isError in any section — failed fetch → skeleton pulses forever; KPI shows 0 on undefined data (Panel 13)", fs=9, color="#dc2626"))

n = ex.append(FP, E)
print(f"PANEL 6: added {len(E)} elements (file total {n})")
