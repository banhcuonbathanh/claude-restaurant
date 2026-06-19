#!/usr/bin/env python3
"""PANEL 12 — Realtime Fan-out (dark) — crosspage §4/§8 + be.md §7-8.
One PATCH → BE UPDATE → Redis publish → 4 channels → 4 surfaces. INVARIANT: no browser→browser."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p12")
E = []

X, Y = 1900, 4720
E += ex.panel_header(X, Y, "PANEL 12 · Realtime Fan-out — one commit, four screens move",
                     "manager taps \"› ready\" → BE row → Redis → 4 channels · INVARIANT: no browser→browser · source: crosspage §4,§8",
                     color=ex.LIGHT, sub_color=ex.MUTED)
E.append(ex.rect(X - 20, Y - 20, 1740, 470, bg="#0b1220", stk=ex.CARD_STK, sw=1))

# source
sx, sy = X, Y + 70
E.append(ex.rect(sx, sy, 300, 70, bg="#13203a", stk=ex.C_ORD, sw=2))
E.append(ex.text(sx + 12, sy + 10, "manager: PATCH", fs=12, color=ex.C_ORD))
E.append(ex.text(sx + 12, sy + 32, "/orders/A/status\n{ready}", fs=10, color=ex.LIGHT, ff=3))
# BE
bx = sx + 340
E.append(ex.rect(bx, sy, 300, 70, bg="#13203a", stk=ex.C_BE, sw=2))
E.append(ex.text(bx + 12, sy + 10, "BE UPDATE + Redis publish", fs=11, color=ex.C_BE))
E.append(ex.text(bx + 12, sy + 32, "order_status_changed\n(order_service.go:548-553)", fs=9, color=ex.LIGHT, ff=3))
E.append(ex.arrow(sx + 300, sy + 35, bx, sy + 35, stk=ex.C_BE, sw=2))

# 4 channels → surfaces
chy = sy + 120
chans = [("orders:kds (WS)", "① KDS /kds — re-columns cook board", ex.C_TAN),
         ("orders:kds (WS)", "② this + other overview tabs — patch ['orders','live']", ex.C_TAN),
         ("order:<A> (SSE)", "③ customer /order/A — \"sẵn sàng\" badge + toast", ex.C_VIOLET),
         ("queue:/tables: (SSE)", "④ customer /tracking — queue + floor re-render", ex.C_VIOLET)]
for i, (ch, surf, c) in enumerate(chans):
    yy = chy + i * 56
    E.append(ex.rect(X, yy, 360, 48, bg="#101a30", stk=c, sw=1.5))
    E.append(ex.text(X + 10, yy + 14, ch, fs=10, color=c, ff=3))
    E.append(ex.rect(X + 400, yy, 760, 48, bg="#13203a", stk=ex.CARD_STK, sw=1))
    E.append(ex.text(X + 412, yy + 14, surf, fs=10, color=ex.LIGHT, ff=3))
    E.append(ex.arrow(X + 360, yy + 24, X + 400, yy + 24, stk=c, sw=1.5))
    E.append(ex.arrow(bx + 150, sy + 70, X + 180, yy, stk=c, sw=1, style="dotted"))

# new_order note
ny = chy
E.append(ex.rect(X + 1190, ny, 410, 224, bg="#1b1330", stk=ex.C_VIOLET, sw=2))
E.append(ex.text(X + 1204, ny + 10, "new_order doorbell — 2 channels", fs=11, color=ex.C_VIOLET))
E.append(ex.text(X + 1204, ny + 36,
    "SSE orders:admin → useAdminSSE\n  → GET /orders/:id → prepend\n  + NewOrderPopup ✓ (ONLY SSE pops)\n\n"
    "WS orders:kds → useOverviewWS\n  → GET /orders/:id → prepend\n  (silent, no popup)\n\n"
    "both guard ACTIVE.has + dedup\n(find by id) before insert",
    fs=9, color=ex.LIGHT, ff=3))

n = ex.append(FP, E)
print(f"PANEL 12: {len(E)} elements added (total {n})")
