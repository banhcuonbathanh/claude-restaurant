#!/usr/bin/env python3
"""PANEL 7 — Scenario Timeline — SCENARIO_OVERVIEW_FLOOR.md.
Manager works the live floor: board load → new_order popup → confirm → kitchen → delivered → 409 trap → payment → log."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p7")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 40, 2780
E += ex.panel_header(X, Y, "PANEL 7 · Scenario — A manager works the live floor",
                     "Cast: Nguyễn Quản Lý (manager) · Lê Đầu Bếp (chef/KDS) · Bàn 03 guest · source: SCENARIO_OVERVIEW_FLOOR.md")

# spine
spine_x = X + 120
sy0 = Y + 80
beats = [
    ("T+0:00", "Board loads", "2 parallel fetches (GET /tables · /orders/live) hit MySQL → paint A/B/D <200ms. SSE + WS open & idle. 30s timer ticks.", "#22D3EE"),
    ("T+0:45", "New order — SSE doorbell", "BE CreateOrder → publish orders:admin {new_order}. useAdminSSE → GET /orders/:id → prepend ['orders','live'] + NewOrderPopup. WS prepends too (dedup).", "#A78BFA"),
    ("T+0:47", "✓ Xác nhận (pending→confirmed)", "handleConfirmPopup: optimistic setQueryData → PATCH status {confirmed} → validTransitions ✅ → UPDATE orders → publish order_status_changed. WS echo idempotent.", "#34D399"),
    ("T+2:15", "Kitchen advances (WS only)", "Chef on /kds PATCHes preparing→ready. order_status_changed on orders:kds → useOverviewWS setQueryData, no HTTP. item_progress counts down \"Còn lại\".", "#FF7A1A"),
    ("T+4:00", "ready → delivered", "Manager clicks \"Đã giao\" in Zone D → handleAction → optimistic write → PATCH {delivered} ✅. Row now shows [Đã thanh toán 💰] + [Huỷ].", "#FBBF24"),
    ("T+4:05", "⚠ The 409 trap", "Manager clicks Huỷ on delivered → PATCH {cancelled}. delivered→cancelled NOT in map → 409. Optimistic 'cancelled' stuck; generic toast hides cause; 15s refetch heals.", "#F87171"),
    ("T+4:30", "Cash payment", "PaymentModal (2 checkboxes) → POST /payments {cash, amount}. amount IGNORED (server uses total_amount). completePayment→MarkOrderPaid delivered→paid. onPaymentDone drops from live + invalidates history. Bàn 03 → Trống.", "#FF7A1A"),
    ("T+4:35", "Review Zone E", "Opens PaidLog accordion → enabled:open fires GET /orders/history (already invalidated) → filter status==='paid'. Bàn 03 is row one. (history has items:[] — Flag 6)", "#22D3EE"),
]
E.append(ex.rect(spine_x - 3, sy0, 6, len(beats) * 130 - 20, bg=B, stk=B))
for i, (t, h, body, c) in enumerate(beats):
    yy = sy0 + i * 130
    E.append(ex.rect(spine_x - 10, yy, 20, 20, bg=c, stk=c, round_=True))
    E.append(ex.text(X, yy + 2, t, fs=12, color=T))
    cardc = "#fef2f2" if c == "#F87171" else "#ffffff"
    E.append(ex.rect(spine_x + 40, yy - 6, 1600, 116, bg=cardc, stk=c, sw=2))
    E.append(ex.text(spine_x + 54, yy + 4, h, fs=13, color=T))
    E.append(ex.text(spine_x + 54, yy + 28, body, fs=10, color="#334155", ff=3, w=1560, wrap=True))

n = ex.append(FP, E)
print(f"PANEL 7: {len(E)} elements added (total {n})")
