#!/usr/bin/env python3
"""PANEL 8 — Flags / Known Mismatches. From _be.md Flags, ORDER_DETAIL_BUGS.md,
_loading.md flags, SCENARIO flags."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p8")
E = []
X, Y = 40, 5400
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches — 2 code bugs + doc-vs-code drift",
                     "from _be.md Flags 1-6 · ORDER_DETAIL_BUGS.md · _loading.md flags · SCENARIO flags")

y0 = Y + 56
flags = [
    ("🟠 Bug 1", ex.C_RED, "Quantity edit never reflects live", "PATCH /quantity → BE publishes item_updated (order_service.go:696) but useOrderSSE has NO case; AND onSuccess invalidateQueries(['order',id]) is a no-op (no such useQuery). New qty/total only after reload. FE fix in useOrderSSE.ts."),
    ("🟡 Bug 2", ex.C_RED, "Cancelled item stays on screen", "DELETE /orders/items/:id publishes item_cancelled (order_service.go:642) — useOrderSSE has NO case. Row stays, money doesn't drop until reload. Shared root with C9 overlay."),
    ("⚠ 3", ex.C_AMBER, "items_added also dropped", "'Thêm món' on sibling device publishes items_added (order_service.go:516) — no case → new dishes invisible live. One re-fetch-on-unhandled-event fix closes all 3 gaps."),
    ("⚠ 4", ex.C_AMBER, "SSE handler has no ownership check", "StreamOrder only needs valid token via authMW — never checks order.table_id vs caller (sse/handler.go:21-70). Any authed client who knows an id can subscribe. REST paths DO enforce ownership."),
    ("⚠ 5", ex.C_AMBER, "No status replay on (re)connect", "StreamOrder does no DB read — relays only future deltas. Status change while disconnected is lost on the channel; badge correct only via the mount-time GET."),
    ("⚠ 6", ex.C_VIOLET, "order_init is dead code", "useOrderSSE has an order_init case but NO publisher ever emits order_init — REST snapshot seeds state instead (UNVERIFIED)."),
    ("🔴 DRIFT", ex.C_RED, "30% cancel rule vs owner target", "Both FE gate (canCancelOrder progress<30 && status∈{confirmed,preparing}) and BE ErrCancelThreshold enforce 30%. Owner target (2026-06-12) = 'cancel any time before payment'. Not yet reconciled."),
    ("⚠ UI", ex.C_AMBER, "Banner overlaps connection pill", "ConnectionErrorBanner (fixed top-0, z-50) covers the LIVE/MẤT KẾT NỐI pill (z-20) when both render."),
]
colw = 630
for i, (tag, c, head, body) in enumerate(flags):
    col = i % 2
    row = i // 2
    fx = X + col * (colw + 20)
    fy = y0 + row * 96
    E.append(ex.rect(fx, fy, colw, 86, bg="#ffffff", stk=c, sw=2))
    E.append(ex.rect(fx, fy, 6, 86, bg=c, stk=c))
    E.append(ex.text(fx + 16, fy + 8, tag + " · " + head, fs=11, color=ex.L_TEXT))
    E.append(ex.text(fx + 16, fy + 30, body, fs=9, color="#475569", w=colw - 28, wrap=True))

print("PANEL 8:", ex.append(FP, E), "total elements")
