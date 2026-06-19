#!/usr/bin/env python3
"""PANEL 6 — Loading States — admin_overview_loading.md.
5 layers, per-zone empty/loading states, WS connection state machine, no-global-skeleton flag."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p6")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 2700, 1560
E += ex.panel_header(X, Y, "PANEL 6 · Loading States",
                     "3 queries default to [] → render immediately, fill silently · NO global skeleton · source: admin_overview_loading.md")

# 5 layers (vertical chain)
ly = Y + 70
layers = ["1 · Route spinner — admin/loading.tsx (whole /admin/* shell, not overview-specific)",
          "2 · AuthGuard — returns null until getMe() resolves (blank window on hard reload)",
          "3 · RoleGuard — minRole=MANAGER, synchronous, no loading window",
          "4 · OverviewPage mounts — 2 queries fire + WS + SSE connect (no gate)",
          "5 · Queries resolve — zones fill [] → data, silent (no skeleton)"]
for i, l in enumerate(layers):
    yy = ly + i * 40
    E.append(ex.rect(X, yy, 1080, 32, bg=ex.L_NEUTRAL, stk=B, sw=1.5))
    E.append(ex.text(X + 12, yy + 8, l, fs=10, color=T, ff=3))
    if i < len(layers) - 1:
        E.append(ex.arrow(X + 40, yy + 32, X + 40, yy + 40, stk=B, sw=1.5))

# per-zone states
zy = ly + 220
E.append(ex.text(X, zy, "Per-zone empty / loading state", fs=11, color="#0f172a"))
zrows = [("Zone", "Query", "First-paint / empty UI"),
         ("A StatCards", "live+tables (props)", "all values snap from 0 — no skeleton"),
         ("B WaitingSection", "live (props)", "\"Chưa có đơn — quán đang yên tĩnh\""),
         ("C PrepPanel", "— (gated)", "never on first load (kiemTraIds empty)"),
         ("D TableList", "tables (props)", "returns null until ['tables'] resolves"),
         ("E PaidLog", "history LAZY enabled:open", "\"Đang tải…\" → \"Chưa có đơn TT hôm nay\""),
         ("F CancelLog", "history (same key, dedup)", "\"Đang tải…\" → \"Chưa có đơn bị huỷ\"")]
cw = [200, 320, 560]
for i, row in enumerate(zrows):
    yy = zy + 22 + i * 28
    bg = "#0f172a" if i == 0 else ("#ffffff" if i % 2 else ex.L_NEUTRAL)
    E.append(ex.rect(X, yy, sum(cw), 28, bg=bg, stk=B, sw=1))
    cx = X
    for val, w in zip(row, cw):
        col = "#ffffff" if i == 0 else T
        E.append(ex.text(cx + 8, yy + 7, val, fs=9, color=col, ff=3, w=w - 10, wrap=True))
        cx += w

# WS state machine
wy = zy + 230
E.append(ex.rect(X, wy, 530, 130, bg=ex.L_INDIGO, stk="#6366f1", sw=1.5))
E.append(ex.text(X + 14, wy + 10, "WS connection state (OrdersWSContext)", fs=11, color="#3730a3"))
for i, l in enumerate(["null  — connecting (handshake)   → NO UI (invisible)",
                       "true  — ws.onopen                → no banner",
                       "false — ws.onclose               → red ConnectionErrorBanner"]):
    E.append(ex.text(X + 14, wy + 36 + i * 24, l, fs=9, color="#4338ca", ff=3))
E.append(ex.text(X + 14, wy + 108, "SSE: no exposed state — silent reconnect (max 30s, 10 tries)", fs=9, color="#6366f1", ff=3))

# no-skeleton flag
E.append(ex.rect(X + 550, wy, 530, 130, bg="#fef2f2", stk="#f87171", sw=1.5))
E.append(ex.text(X + 564, wy + 10, "⚠ Loading gaps", fs=11, color="#b91c1c"))
for i, l in enumerate(["• No global skeleton — \"loading\" ≡ \"no orders\" visually",
                       "• WS connecting state invisible (only false shows banner)",
                       "• No SSE disconnect UI — missed new_orders silent",
                       "• PaidLog badge reads 0 until accordion opened",
                       "• AuthGuard blank window on hard reload"]):
    E.append(ex.text(X + 564, wy + 36 + i * 18, l, fs=9, color="#7f1d1d", ff=3, w=505, wrap=True))

n = ex.append(FP, E)
print(f"PANEL 6: {len(E)} elements added (total {n})")
