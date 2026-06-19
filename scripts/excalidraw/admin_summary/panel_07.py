#!/usr/bin/env python3
"""PANEL 7 — Scenario Timeline for admin_summary.excalidraw.
Sourced from SCENARIO_SUMMARY_REVIEW.md (Hương, manager1, 13:35→13:39)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p7")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 40, 1640
E += ex.panel_header(X, Y, "PANEL 7 · Scenario Timeline — Tổng kết cuối ngày",
                     "Hương (manager1) end-of-lunch review · 13:35→13:39 · source: SCENARIO_SUMMARY_REVIEW.md")

beats = [
    ("13:35", "Login + nav", "manager1 JWT in useAuthStore (memory) · RoleGuard minRole=MANAGER passes · cashier/chef → 403", "#6366f1"),
    ("13:35:01", "4 sections skeleton in parallel", "range='today' · each child fires own useQuery · staggered pop-in (no Promise.all)", "#f59e0b"),
    ("13:35:03", "Reads KPI cards", "Khách 86 · Món 240 (delivered+paid) · Doanh thu 4.250.000đ · Bàn 3 (live, range-agnostic)", "#fb923c"),
    ("13:36", "Switches to 'Tuần này'", "setRange('week') → 3 queries refetch (INTERVAL 6 DAY) · StockAlertList static (120s fresh)", "#6366f1"),
    ("13:37", "Scans top-5 dishes", "Bánh cuốn thịt ×820 82% · combo_ref_id IS NULL excludes combo children · pct = % of top-5", "#fb923c"),
    ("13:37:30", "Scans staff performance", "Lê Đầu Bếp 62 đơn → revenue '—' (BE omits key for chef) · LEFT JOIN shows 0-order staff", "#7c3aed"),
    ("13:38", "Spots 🔴 Mộc nhĩ 0.2kg", "low-stock returns ≤ min*1.2 · isCritical = 0.2 < 1.0 → red (FE split) · clicks +Nhập hàng", "#dc2626"),
    ("13:39", "Submit → POST stock-movements", "qty 2 · INSERT movement + UPDATE current_stock 0.2→2.2 (NOT transactional) · 201", "#ea580c"),
    ("13:39:02", "Success → invalidate ×2 + close", "invalidate low-stock + ingredients · toast · 2.2 > 1.2 → Mộc nhĩ drops off alert list", "#10b981"),
]
cw = 380
for i, (t, title, body, accent) in enumerate(beats):
    col = i % 3
    row = i // 3
    bx = X + col * (cw + 20)
    by = Y + 60 + row * 130
    E.append(ex.rect(bx, by, cw, 112, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(bx, by, 90, 26, bg=accent, stk=accent))
    E.append(ex.text(bx + 8, by + 6, t, fs=11, color="#0a0a0a"))
    E.append(ex.text(bx + 100, by + 6, title, fs=12, color="#1e293b"))
    E.append(ex.text(bx + 12, by + 38, body, fs=9, color="#475569", w=cw - 24, wrap=True))
    if i < len(beats) - 1 and col < 2:
        E.append(ex.arrow(bx + cw, by + 56, bx + cw + 20, by + 56, stk="#94a3b8", sw=2))

n = ex.append(FP, E)
print(f"PANEL 7: added {len(E)} elements (file total {n})")
