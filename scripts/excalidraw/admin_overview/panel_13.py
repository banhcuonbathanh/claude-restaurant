#!/usr/bin/env python3
"""PANEL 13 — Failure / Edge Map (dark) — be.md §Error + Flags + scenario.
Every unhappy path: 409, payment errors, swallowed errors, security gap, Redis-down."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p13")
E = []

X, Y = 40, 5290
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map", "every unhappy path on this page · source: be.md §Error Behaviour + Flags + SCENARIO",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 1740, 420, bg="#0b1220", stk=ex.CARD_STK, sw=1))

oy = Y + 56
cards = [
    ("409 INVALID_STATUS_TRANSITION", "delivered→cancelled (Huỷ on delivered) → 409. Optimistic 'cancelled' NOT rolled back → generic toast → 15s staleTime refetch restores delivered.", ex.C_RED),
    ("400 INVALID_INPUT", "bind failure on PATCH {status} or POST /payments → respondError 400. FE handleAction catch = same generic toast (can't distinguish from network err).", ex.C_AMBER),
    ("Payment errors", "non-ready/delivered order → ErrOrderNotReady. Duplicate payment → ErrPaymentAlreadyExists (GetPaymentByOrderID idempotency). FE: \"Thanh toán thất bại…\"", ex.C_ORD),
    ("Swallowed SSE/WS errors", "GET /orders/:id failure inside useAdminSSE / useOverviewWS → catch {/* skip */}. A missed popup, never a thrown error — silent gap.", ex.C_CYAN),
    ("⚠ WS no role gate (security)", "/ws/orders-live has no authMW; ParseToken only. Any JWT (incl. customer guest) can open the live floor feed. SSE correctly manager+.", ex.C_RED),
    ("Redis down (degraded)", "No Redis read cache → REST (tables/live/history) still serves from MySQL. Only pub/sub dies: no realtime push; 15s/30s/60s staleTime polls remain the floor.", ex.C_BE),
]
cw = 540
for i, (title, body, c) in enumerate(cards):
    col = i % 3
    rowi = i // 3
    x = X + col * (cw + 10)
    y = oy + rowi * 170
    E.append(ex.rect(x, y, cw, 150, bg="#13203a", stk=c, sw=2))
    E.append(ex.rect(x, y, cw, 28, bg=c, stk=c))
    E.append(ex.text(x + 12, y + 7, title, fs=11, color=ex.DARK))
    E.append(ex.text(x + 12, y + 40, body, fs=10, color=ex.LIGHT, ff=3, w=cw - 24, wrap=True))

n = ex.append(FP, E)
print(f"PANEL 13: {len(E)} elements added (total {n})")
