#!/usr/bin/env python3
"""PANEL 7 — Scenario Timeline. From SCENARIO_TRACK_ORDER.md (Bàn 03, ORD-…-016, ₫60k)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p7")
E = []
X, Y = 40, 1520
E += ex.panel_header(X, Y, "PANEL 7 · Scenario — Watching Bàn 03 through the kitchen",
                     "from SCENARIO_TRACK_ORDER.md · ORD-20260613-016 · 2× Suất Đầy Đủ Trứng Tái · ₫60,000")
L = "#1e293b"

beats = [
    ("12:01:00", "Guest taps Theo Dõi", "orderId read from persisted activeOrderId → skeleton (isLoading && !order)", ex.C_ZUS),
    ("12:01:01", "REST resolves", "GET /orders/:id → order{status:pending} · TableInfoBanner + OrderDetailCard paint", ex.C_ORD),
    ("12:01:01", "SSE connects", "onopen → LIVE pill · snapshot: queue.update (#3/5 · ~6 phút) + tables.status", ex.C_CYAN),
    ("12:03", "Chef starts cooking", "order_status_changed arrives but IGNORED (Flag 1) · queue.update consumed · item_progress IGNORED (Flag 2)", ex.C_RED),
    ("12:05", "First dish served", "item_updated → itemsChangedAt → refetch → order{status:preparing} · badge advances (only via refetch)", ex.C_TAN),
    ("12:07", "All served → ready", "item_updated → refetch → order{status:ready} · TableInfoBanner 'Sẵn sàng'", ex.C_TAN),
    ("12:08", "Cashier marks delivered", "next item event → status:delivered → 'Đã phục vụ — Cảm ơn!' · row leaves floor (not in ACTIVE_STATUSES)", ex.C_VIOLET),
]
colw = 230
for i, (t, title, detail, c) in enumerate(beats):
    cx = X + i * colw
    E.append(ex.rect(cx, Y + 60, colw - 16, 150, bg=ex.L_NEUTRAL, stk=c, sw=2))
    E.append(ex.rect(cx, Y + 60, colw - 16, 22, bg=c, stk=c))
    E.append(ex.text(cx + 8, Y + 64, t, fs=11, color="#0a0a0a"))
    E.append(ex.text(cx + 8, Y + 90, title, fs=11, color=L))
    E.append(ex.text(cx + 8, Y + 112, detail, fs=8, color="#475569", w=colw - 28, wrap=True))
    if i < len(beats) - 1:
        E.append(ex.arrow(cx + colw - 16, Y + 135, cx + colw, Y + 135, stk=ex.MUTED, sw=2))

E.append(ex.text(X, Y + 224, "SSE drop mid-scenario: backoff 1→2→4→8→16s (cap 30s, max 5) · REST query keeps serving cached order · page stale not broken.",
                 fs=10, color="#7c2d12"))

print("PANEL 7:", ex.append(FP, E), "total elements")
