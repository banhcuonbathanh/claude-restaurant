#!/usr/bin/env python3
"""PANEL 4 — Cross-Page Dataflow. Sourced from customer_checkout_crosspage_dataflow.md
(§0 whole picture, §1 status lifecycle, §2 handoff seam, §4-6 downstream pages, §12 durability)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p4")
E = []
X, Y = 1460, 40
E += ex.panel_header(X, Y, "PANEL 4 · Cross-Page Dataflow — the order after /checkout submits it",
                     "from customer_checkout_crosspage_dataflow.md — /checkout is a WRITE-ONLY gate; 2 durable artifacts")

# in-browser hub box
hy = Y + 60
E.append(ex.rect(X, hy, 700, 200, bg="#fffbeb", stk="#f59e0b", sw=2))
E.append(ex.text(X + 12, hy + 8, "ONE PHONE — in-browser hub  (▓ survives F5 / ░ dies)", fs=11, color="#92400e"))
E.append(ex.text(X + 12, hy + 32,
 "▓ order_cache_<id>  localStorage   \"what is order X?\"\n░ activeOrderId     cart store     → /checkout CLEARS to null\n▓ <id>              the URL         \"shareable / reloadable\"\n\n/checkout ─POST─▶ onSuccess:\n  ① try GET /orders/:id (may 403 online, Bug3)\n  ② order_cache_<id> = JSON  ③ clearCart()\n  router.replace ▶ /order/<id> ▶ /order list\n     └ \"Thêm món\" ▶ /menu?add_to_order=<id>\n     └ \"Theo dõi bàn\" ▶ /tracking (monitor SSE)",
 fs=9, color=ex.L_TEXT, ff=3))

# BE hub box
E.append(ex.rect(X + 730, hy, 770, 200, bg="#f0fdf4", stk="#16a34a", sw=2))
E.append(ex.text(X + 742, hy + 8, "THE WIRE — the BE is the real hub (one order row)", fs=11, color="#15803d"))
E.append(ex.text(X + 742, hy + 32,
 "MySQL (durable) + Redis (pub/sub) · key = order.id\n\ncustomer side                staff / admin side\n◀ GET /orders/:id            new_order ping ▶ /sse/admin\n◀ SSE /orders/:id/events     orders WS ▶ item_progress\n◀ SSE /sse/order-monitor/:id GET /orders/:id ▶ ['orders',\n  (queue · ETA · floor)        'live'] cache\n\n⚠ /checkout does NOT setActiveOrderId — clearCart()\n  wipes it → /tracking empty until \"Theo dõi bàn\".\n  (vs /menu TableConfirmModal which sets it)",
 fs=9, color=ex.L_TEXT, ff=3))

# status lifecycle
sy = hy + 220
E.append(ex.rect(X, sy, 1500, 84, bg=ex.L_NEUTRAL, stk="#6366f1", sw=2))
E.append(ex.text(X + 12, sy + 8, "Status lifecycle every downstream page renders against (order.ts:29-36)", fs=11, color="#3730a3"))
E.append(ex.text(X + 12, sy + 32,
 "POST /orders → pending ─(staff confirm)→ confirmed ─(KDS)→ preparing ─(all served)→ ready ─(staff bill)→ delivered → paid\n              └────────────────────────── cancelled ◀─ (staff/guest cancel)     │  item-level: pending(0)→preparing(0<n<qty)→done(n≥qty)",
 fs=9, color=ex.L_TEXT, ff=3))

# downstream pages
dy = sy + 104
downs = [
 ("#0ea5e9", "/order/<id> (C10)", "id in URL → shareable.\nuseOrderSSE 3-phase:\n▓cache → REST → SSE.\nfork: Theo dõi/Thêm món/\nHuỷ. ⚠403 on online."),
 ("#8b5cf6", "/order list (C9)", "ZERO network calls.\nscans ALL order_cache_*\nkeys, sorts newest-first.\nOrderDetailSheet reuses\nuseOrderSSE."),
 ("#f59e0b", "/tracking", "reads activeOrderId\n(null after checkout!).\nuseOrderMonitorSSE:\nqueue/ETA/floor.\n401/403 = permanent stop."),
]
for i, (acc, t, b) in enumerate(downs):
    xx = X + i * 505
    E.append(ex.rect(xx, dy, 480, 130, bg="#ffffff", stk=acc, sw=2))
    E.append(ex.text(xx + 10, dy + 8, t, fs=11, color=acc))
    E.append(ex.text(xx + 10, dy + 32, b, fs=9, color=ex.L_TEXT, ff=3))

# durability matrix
my = dy + 150
E.append(ex.rect(X, my, 1500, 130, bg=ex.L_NEUTRAL, stk=ex.SUB, sw=2))
E.append(ex.text(X + 12, my + 8, "Durability matrix (§12)", fs=11, color=ex.PANEL_TXT))
E.append(ex.text(X + 12, my + 30,
 "Datum                          Lives in            F5?  New device?\n"
 "items/tableId/paymentMethod    ░ cart memory       ❌   ❌   (pre-POST only)\n"
 "orderNote                      ▓ cart persist      ✅   ❌\n"
 "activeOrderId                  ▓ cart persist      ✅   ❌   (NULL after /checkout)\n"
 "order_cache_<id>               ▓ localStorage      ✅   ❌\n"
 "order id                       the URL             ✅   ✅   (shareable)\n"
 "the order row                  BE (MySQL+Redis)    ✅   ✅   ← every page, every device",
 fs=9, color=ex.L_TEXT, ff=3))

ex.append(FP, E)
print(f"PANEL 4: appended {len(E)} elements")
