#!/usr/bin/env python3
"""PANEL 1 for admin_summary.excalidraw — Page Wireframe (desktop 1200px).
Sourced from docs/system/08_pages/admin/admin_summary/admin_summary.md (ASCII + Zones table).
FIRST panel → uses ex.save (creates the doc)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_summary/admin_summary.excalidraw"
ex.reset("p1")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe — /admin/summary",
                     'Tổng kết nhà hàng · manager+ · zones A–D + StockInModal overlay · source: admin_summary.md')

dx, dy, dw = X, Y + 60, 1180
E.append(ex.rect(dx, dy, dw, 1100, bg="#ffffff", stk=B, sw=2))

# admin shell tab nav
E.append(ex.rect(dx + 16, dy + 16, dw - 32, 40, bg=ex.L_NEUTRAL, stk=B, sw=1.5))
E.append(ex.text(dx + 30, dy + 27, "(admin shell: tab nav)", fs=12, color="#64748b"))

# Range selector
ry = dy + 70
E.append(ex.rect(dx + 16, ry, dw - 32, 56, bg=ex.L_INDIGO, stk="#a5b4fc", sw=1.5))
E.append(ex.text(dx + 30, ry + 9, "Tổng kết nhà hàng", fs=15, color="#1e293b"))
for i, lab in enumerate(["Hôm nay", "Tuần này", "Tháng này"]):
    bx = dx + 620 + i * 160
    bg = "#6366f1" if i == 0 else "#ffffff"
    fg = "#ffffff" if i == 0 else "#475569"
    E.append(ex.rect(bx, ry + 12, 140, 32, bg=bg, stk="#a5b4fc", sw=1.5))
    E.append(ex.text(bx + 22, ry + 20, lab, fs=12, color=fg))
E.append(ex.text(dx + 30, ry + 34, "RangeSelector  ·  local useState<SummaryRange>('today')  —  NO Zustand  (page.tsx:24-42, 366)", fs=9, color="#64748b"))

# Zone A — KPI cards
ay = ry + 76
E.append(ex.text(dx + 24, ay, "A · SummaryKPICards — ['admin','summary',range]  (page.tsx:58-103)", fs=11, color="#b45309"))
kpis = [("Khách hôm nay", "86", "lượt đặt bàn (không hủy)"),
        ("Món đã bán", "240", "phần đã giao (delivered)*"),
        ("Doanh thu", "4.250.000đ", "thanh toán completed"),
        ("Bàn đang phục vụ", "3", "confirmed/preparing/ready ‡")]
cw = (dw - 32 - 3 * 12) / 4
for i, (lab, val, sub) in enumerate(kpis):
    cx = dx + 16 + i * (cw + 12)
    E.append(ex.rect(cx, ay + 18, cw, 90, bg=ex.L_ORANGE, stk="#fdba74", sw=1.5))
    E.append(ex.text(cx + 12, ay + 28, lab, fs=10, color="#9a3412"))
    E.append(ex.text(cx + 12, ay + 48, val, fs=20, color="#7c2d12"))
    E.append(ex.text(cx + 12, ay + 80, sub, fs=8, color="#a16207"))

# Zone B + C side by side
bcy = ay + 124
half = (dw - 32 - 12) / 2
# B Top dishes
E.append(ex.rect(dx + 16, bcy, half, 230, bg="#ffffff", stk=B, sw=1.5))
E.append(ex.text(dx + 30, bcy + 10, "B · TopDishesList — ['admin','top-dishes',range]", fs=11, color="#1d4ed8"))
E.append(ex.text(dx + 30, bcy + 28, "top 5 · ×qty · pct% bar (pct = % of top-N rows*)", fs=9, color="#64748b"))
dishes = ["#1 Bánh cuốn thịt  ×120 · 50%  ▓▓▓▓▓  4.200.000đ",
          "#2 Canh mọc        ×95  · 39%  ▓▓▓▓   950.000đ",
          "#3 Giò             ×42  · 18%  ▓▓     378.000đ"]
for i, d in enumerate(dishes):
    dyr = bcy + 56 + i * 34
    E.append(ex.rect(dx + 30, dyr, half - 28, 28, bg=ex.L_NEUTRAL, stk="#cbd5e1", sw=1))
    E.append(ex.text(dx + 42, dyr + 7, d, fs=9, color=T, ff=3))
# C Staff performance
cxp = dx + 16 + half + 12
E.append(ex.rect(cxp, bcy, half, 230, bg="#ffffff", stk=B, sw=1.5))
E.append(ex.text(cxp + 14, bcy + 10, "C · StaffPerfTable — ['admin','staff-performance',range]", fs=11, color="#7c3aed"))
E.append(ex.text(cxp + 14, bcy + 28, "Tên · Vai trò · Đơn xử lý · Doanh thu (chef → —)", fs=9, color="#64748b"))
staff = ["Nguyễn An     Bếp       45     —",
         "Trần Bình     Thu ngân  41   2.150.000đ",
         "Hương         Quản lý    0       0đ"]
for i, s in enumerate(staff):
    syr = bcy + 56 + i * 34
    E.append(ex.rect(cxp + 14, syr, half - 28, 28, bg=ex.L_NEUTRAL, stk="#cbd5e1", sw=1))
    E.append(ex.text(cxp + 26, syr + 7, s, fs=9, color=T, ff=3))

# Zone D — low stock
dyr = bcy + 250
E.append(ex.rect(dx + 16, dyr, dw - 32, 200, bg="#fff7ed", stk="#fdba74", sw=1.5))
E.append(ex.text(dx + 30, dyr + 10, "D · StockAlertList — ['admin','low-stock']  RANGE-INDEPENDENT  (page.tsx:292-361)", fs=11, color="#b45309"))
E.append(ex.text(dx + 880, dyr + 12, "Xem toàn bộ kho →", fs=10, color="#2563eb"))
E.append(ex.text(dx + 880, dyr + 28, "(raw <a>, full nav)", fs=8, color="#94a3b8"))
alerts = [("🔴 Mộc nhĩ", "còn 0.2 kg / min 1 kg", "▓▓ (red — below threshold)"),
          ("🟡 Tôm tươi", "còn 1.1 kg / min 1 kg", "▓▓▓▓▓▓▓▓▓ (yellow — within 1.2×)")]
for i, (nm, qt, bar) in enumerate(alerts):
    yr = dyr + 44 + i * 70
    E.append(ex.rect(dx + 30, yr, dw - 230, 56, bg="#ffffff", stk="#e2e8f0", sw=1))
    E.append(ex.text(dx + 42, yr + 8, nm + "   " + qt, fs=10, color=T))
    E.append(ex.text(dx + 42, yr + 30, bar, fs=9, color="#94a3b8", ff=3))
    E.append(ex.rect(dx + dw - 190, yr + 12, 150, 32, bg="#fb923c", stk="#ea580c", sw=1.5))
    E.append(ex.text(dx + dw - 168, yr + 20, "+ Nhập hàng", fs=11, color="#ffffff"))

# StockInModal overlay note
my = dyr + 214
E.append(ex.rect(dx + 300, my, 580, 70, bg="#1e293b", stk="#334155", sw=2))
E.append(ex.text(dx + 318, my + 12, "▣ StockInModal (fixed overlay) — RHF + Zod (stockSchema page.tsx:205-209)", fs=11, color="#f1f5f9"))
E.append(ex.text(dx + 318, my + 34, "ingredient (read-only) · qty>0 · note  →  POST /admin/stock-movements {type:'in'}", fs=10, color="#94a3b8", ff=3))

# footnotes
E.append(ex.text(dx + 16, dy + 1064, "* drift: label '(delivered)' but BE counts delivered+paid · pct = % of top-N not period   ‡ active_tables is range-agnostic live count  →  see Panel 8", fs=9, color="#dc2626"))

n = ex.save(FP, E)
print(f"PANEL 1: saved {len(E)} elements (file total {n})")
