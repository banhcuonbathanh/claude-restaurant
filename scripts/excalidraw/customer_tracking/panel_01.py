#!/usr/bin/env python3
"""PANEL 1 for customer_tracking.excalidraw — Page Wireframe (mobile 420px).
Sourced from docs/system/08_pages/customer/customer_tracking/customer_tracking.md
(ASCII wireframe + Zones table). FIRST panel → uses ex.save()."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p1")
E = []
X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe — /tracking (mobile 420px)",
                     "from customer_tracking.md · read-only live monitor · 5 widgets + 3 fallbacks")

# phone frame
px, py, pw = X, Y + 60, 440
E.append(ex.rect(px, py, pw, 880, bg="#ffffff", stk=ex.L_BORDER, sw=2))

def zone(y, h, accent, title, lines, src):
    E.append(ex.rect(px + 14, y, pw - 28, h, bg=ex.L_NEUTRAL, stk=accent, sw=2))
    E.append(ex.text(px + 26, y + 8, title, fs=13, color=ex.L_TEXT))
    E.append(ex.text(px + 26, y + 28, lines, fs=10, color="#475569"))
    E.append(ex.text(px + pw - 28 - len(src) * 6, y + 8, src, fs=9, color="#94a3b8", align="left"))
    return y + h + 10

cy = py + 16
cy = zone(cy, 56, ex.C_TAN, "MonitoringTopBar  ● live / ○ mất kết nối",
          "sseConnected (useOrderMonitorSSE) · sticky · aria-live", "sse")
cy = zone(cy, 40, ex.C_RED, "⚠ ConnectionErrorBanner",
          "fixed top-0 red · only when !sseConnected", "sse")
cy = zone(cy, 36, ex.C_ZUS, "👁 Ẩn / Hiện bàn của bạn (toggle)",
          "page-local useState showTable (default true)", "useState")
cy = zone(cy, 78, ex.C_CYAN, "TableInfoBanner",
          "Bàn 03 · [status badge] = effectiveStatus\nvị trí 2/5 · ước tính ~8 phút  ← queueData", "query+sse")
cy = zone(cy, 96, ex.C_ORD, "OrderDetailCard",
          "GET /orders/:id (TanStack) · refetch on itemsChangedAt\n• Bánh cuốn thịt  ra 1/2\n• Canh mọc        còn 1\ncombo header (₫0) filtered out", "query")
cy = zone(cy, 110, ex.C_VIOLET, "WholeFloorPrepList — hàng đợi toàn quán",
          "queueData.queue (SSE) · own row highlighted\n1. Bàn 01  ▓▓▓▓░░\n2. Bàn 03  ▓▓░░░░  ← bạn\n3. Mang về ░░░░░░", "sse")
cy = zone(cy, 40, ex.C_SLATE, "ClientBottomNav (shell)",
          "[Menu][Đơn][Yêu Thích][Theo Dõi][Cài Đặt]", "shell")

# fallbacks strip
fy = cy + 8
E.append(ex.text(px + 26, fy, "Full-screen fallbacks (first match wins):", fs=11, color=ex.L_TEXT))
for i, (lab, c) in enumerate([("no activeOrderId → Về trang menu", ex.C_SLATE),
                              ("order 404 → Đơn hàng không tồn tại", ex.C_RED),
                              ("SSE 401/403 → Phiên hết hạn — quét lại QR", ex.C_RED)]):
    E.append(ex.rect(px + 26, fy + 20 + i * 26, pw - 80, 22, bg="#fff7ed", stk=c, sw=1))
    E.append(ex.text(px + 34, fy + 24 + i * 26, lab, fs=10, color="#475569"))

print("PANEL 1:", ex.save(FP, E), "elements")
