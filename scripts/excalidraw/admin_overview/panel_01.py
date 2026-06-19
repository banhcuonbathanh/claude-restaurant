#!/usr/bin/env python3
"""PANEL 1 for admin_overview.excalidraw — Page Wireframe (desktop 1200px).
Sourced from docs/system/08_pages/admin/admin_overview/admin_overview.md (ASCII + Zones table).
FIRST panel → uses ex.save (creates the doc)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p1")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe — /admin/overview",
                     "Live floor command centre · manager+ · 6 zones A–F + NewOrderPopup · source: admin_overview.md")

# device frame
dx, dy, dw = X, Y + 60, 1180
E.append(ex.rect(dx, dy, dw, 1330, bg="#ffffff", stk=B, sw=2))

def bar(y, h, bg, stk, label, sub=None, lx=None):
    out = [ex.rect(dx + 16, y, dw - 32, h, bg=bg, stk=stk, sw=1.5)]
    out.append(ex.text(dx + 30, y + 10, label, fs=13, color=T))
    if sub:
        out.append(ex.text(dx + 30, y + 30, sub, fs=10, color="#64748b"))
    return out

# header
E += bar(dy + 16, 56, ex.L_NEUTRAL, B,
         "Tổng quan sàn — cập nhật theo thời gian thực                          ● Live",
         "ConnectionErrorBanner (sticky red) when WS disconnects · 30s elapsed-time timer")
# search
E += bar(dy + 84, 44, "#ffffff", B,
         "🔍  Tìm theo mã đơn, số bàn, tên khách…                              (n kết quả)",
         "local searchQuery → filters orders + tables client-side (B + D)")

# Zone A — stat cards
ay = dy + 140
E.append(ex.text(dx + 24, ay, "A · StatCards — derived from live orders + tables", fs=11, color="#b45309"))
labels = [("Bàn đang phục vụ", "4 / 6 bàn"), ("Món chờ làm", "7"),
          ("Món đang làm", "3"), ("Khẩn cấp / Cảnh báo", "1")]
cw = (dw - 32 - 3 * 12) / 4
for i, (lab, val) in enumerate(labels):
    cx = dx + 16 + i * (cw + 12)
    E.append(ex.rect(cx, ay + 18, cw, 70, bg=ex.L_ORANGE, stk="#fdba74", sw=1.5))
    E.append(ex.text(cx + 12, ay + 28, lab, fs=10, color="#9a3412"))
    E.append(ex.text(cx + 12, ay + 48, val, fs=20, color="#7c2d12"))

# Zone B — WaitingSection
by = ay + 104
E.append(ex.rect(dx + 16, by, dw - 32, 150, bg="#ffffff", stk=B, sw=1.5))
E.append(ex.text(dx + 30, by + 10, "B · WaitingSection — TẤT CẢ đơn active (pending→delivered)", fs=12, color="#1d4ed8"))
E.append(ex.text(dx + 30, by + 30, "GET /orders/live  ·  ['orders','live']  +  WS cache mutations", fs=9, color="#64748b"))
rows = ["Bàn 03  #BC-42  [pending]   2m    [Xác nhận] [🔍 Kiểm tra] [Huỷ]",
        "Bàn 01  #BC-40  [preparing] 14m   [→ ready]  [🔍 Kiểm tra]"]
for i, r in enumerate(rows):
    ry = by + 52 + i * 42
    E.append(ex.rect(dx + 30, ry, dw - 60, 34, bg=ex.L_NEUTRAL, stk="#cbd5e1", sw=1))
    E.append(ex.text(dx + 42, ry + 9, r, fs=10, color=T, ff=3))

# Zone C — PrepPanel
cy = by + 162
E.append(ex.rect(dx + 16, cy, dw - 32, 60, bg="#f5f3ff", stk="#c4b5fd", sw=1.5, style="dashed"))
E.append(ex.text(dx + 30, cy + 10, "C · PrepPanel — CHỈ đơn 'pending' đã bấm Kiểm tra", fs=12, color="#6d28d9"))
E.append(ex.text(dx + 30, cy + 30, "gated: kiemTraIds.size > 0  ∩  status==='pending'  (xem món + filling trước khi nhận)", fs=9, color="#7c3aed"))

# Zone D — TableList / TableGrid
dyy = cy + 72
E.append(ex.rect(dx + 16, dyy, dw - 32, 120, bg="#ffffff", stk=B, sw=1.5))
E.append(ex.text(dx + 30, dyy + 10, "D · Danh sách bàn", fs=12, color="#0f766e"))
E.append(ex.text(dx + dw - 230, dyy + 10, "[ ☰ list | ▦ grid ]  viewMode", fs=10, color="#0f766e"))
E.append(ex.text(dx + 30, dyy + 30, "GET /tables (staleTime 60s) + live orders · mỗi bàn: đơn active, trạng thái, hành động", fs=9, color="#64748b"))
for i in range(3):
    rx = dx + 30 + i * ((dw - 60) / 3 + 0)
    bwc = (dw - 60) / 3 - 10
    E.append(ex.rect(rx, dyy + 52, bwc, 54, bg=ex.L_NEUTRAL, stk="#cbd5e1", sw=1))
    E.append(ex.text(rx + 10, dyy + 60, ["Bàn 03 · delivered", "Bàn 01 · preparing", "Bàn 05 · Trống"][i], fs=9, color=T))
    E.append(ex.text(rx + 10, dyy + 80, ["[Đã thanh toán 💰][Huỷ]", "[→ ready]", "—"][i], fs=9, color="#475569", ff=3))

# Zone E/F logs
ey = dyy + 132
for i, (lab, sub) in enumerate([("E · PaidLog — đơn đã thanh toán hôm nay", "lazy: enabled:open · ['orders','history'] filter status==='paid'"),
                                 ("F · CancelLog — đơn đã huỷ hôm nay", "same key, filter status==='cancelled' · badge invisible until opened")]):
    ry = ey + i * 50
    E.append(ex.rect(dx + 16, ry, dw - 32, 42, bg="#f8fafc", stk=B, sw=1, style="dashed"))
    E.append(ex.text(dx + 30, ry + 7, lab, fs=11, color=T))
    E.append(ex.text(dx + 30, ry + 24, sub, fs=8, color="#64748b"))

# Popup overlay
py = ey + 116
E.append(ex.rect(dx + 320, py, 540, 150, bg="#eef2ff", stk="#6366f1", sw=2))
E.append(ex.rect(dx + 320, py, 540, 32, bg="#6366f1", stk="#6366f1"))
E.append(ex.text(dx + 334, py + 8, "Overlay · NewOrderPopup — \"Đơn hàng mới!\"  (useAdminSSE new_order)", fs=11, color="#ffffff"))
E.append(ex.text(dx + 334, py + 44, "items (combo header rows filtered) + tổng tiền", fs=10, color="#3730a3"))
E.append(ex.text(dx + 334, py + 70, "[ Bỏ qua ]   [ ✓ Xác nhận nhận đơn ]   → PATCH status {confirmed}", fs=10, color="#3730a3", ff=3))
E.append(ex.text(dx + 334, py + 100, "Bỏ qua = đóng, đơn vẫn pending ở Zone B", fs=9, color="#6366f1"))

n = ex.save(FP, E)
print(f"PANEL 1: {len(E)} elements written (total {n})")
