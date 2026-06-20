#!/usr/bin/env python3
"""PANEL 6 — Loading States. From customer_order_detail_loading.md
(3 layers · useOrderSSE 3-phase · 3 priority branches · reconnect constants)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p6")
E = []
X, Y = 40, 3640
E += ex.panel_header(X, Y, "PANEL 6 · Loading States — no loading.tsx, no Suspense, no useQuery",
                     "from customer_order_detail_loading.md · data driven entirely by useOrderSSE · cache paints instantly on revisit")

y0 = Y + 56
# Layer 1
E.append(ex.rect(X, y0, 420, 70, bg=ex.L_NEUTRAL, stk=ex.C_SLATE, sw=2))
E.append(ex.text(X + 12, y0 + 8, "Layer 1 · (shop)/loading.tsx", fs=11, color=ex.L_TEXT))
E.append(ex.text(X + 12, y0 + 28, "centered orange spinner · whole shop shell\nonly on hard-navigate INTO (shop) · not client transitions", fs=9, color="#475569"))

# Layer 2 — 3 phases
E.append(ex.rect(X + 450, y0, 560, 70, bg=ex.L_ORANGE, stk=ex.C_ORD, sw=2))
E.append(ex.text(X + 462, y0 + 8, "Layer 2 · useOrderSSE 3-phase (NOT TanStack)", fs=11, color=ex.L_TEXT))
E.append(ex.text(X + 462, y0 + 28,
                 "A cache read → instant paint if hit (skeleton skipped)\n"
                 "B GET /orders/:id → REST snapshot\n"
                 "C SSE stream → live deltas", fs=9, color="#475569", ff=3))

# Layer 3 — priority branches
by = y0 + 100
E.append(ex.text(X, by, "Layer 3 · main-content branch (strict priority order):", fs=12, color=ex.L_TEXT))
branches = [
    ("1", "isNotFound === true", "full-page 404 'Không tìm thấy đơn hàng' + 'Về trang menu' (GET 404 → ts:60)", ex.C_RED),
    ("2", "order === null", "animate-pulse skeleton: nav + order card + table + money + button (page.tsx:175-230)", ex.C_AMBER),
    ("3", "order present", "live page + pill (LIVE/MẤT KẾT NỐI) + ConnectionErrorBanner after ≥3 fails", ex.C_BE),
]
for i, (n, cond, body, c) in enumerate(branches):
    yy = by + 26 + i*44
    E.append(ex.rect(X, yy, 1010, 38, bg="#ffffff", stk=c, sw=2))
    E.append(ex.rect(X, yy, 30, 38, bg=c, stk=c))
    E.append(ex.text(X + 9, yy + 11, n, fs=13, color=ex.DARK))
    E.append(ex.text(X + 40, yy + 5, cond, fs=11, color=ex.L_TEXT, ff=3))
    E.append(ex.text(X + 40, yy + 22, body, fs=9, color="#475569"))

# reconnect constants
ry = by + 26 + 3*44 + 14
E.append(ex.rect(X, ry, 1010, 56, bg=ex.L_INDIGO, stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X + 12, ry + 8, "SSE reconnect (useOrderSSE.ts:16-21)", fs=11, color=ex.L_TEXT))
E.append(ex.text(X + 12, ry + 28,
                 "maxAttempts 5 · baseDelay 1000ms · maxDelay 30000ms · showBannerAfter 3 · backoff min(1000×2^(n-1),30000)=1s,2s,4s,…,30s · onopen resets attempts=0",
                 fs=9, color="#475569", ff=3))

print("PANEL 6:", ex.append(FP, E), "total elements")
