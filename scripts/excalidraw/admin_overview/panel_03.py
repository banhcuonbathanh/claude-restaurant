#!/usr/bin/env python3
"""PANEL 3 — BE View — admin_overview_be.md.
8-endpoint table (auth · handler→service→repo · Redis) + auth model + no-cache + validTransitions."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p3")
E = []
T = ex.L_TEXT
B = ex.L_BORDER

X, Y = 2700, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View — endpoints traced handler → service → repo",
                     "8 endpoints · whole page staff-only · NO Redis read cache (pub/sub only) · source: admin_overview_be.md")

# table header
tx, ty, tw = X, Y + 70, 1080
cols = [("#", 30), ("Endpoint", 250), ("Auth", 150), ("Handler→Service→Repo", 400), ("Redis", 250)]
E.append(ex.rect(tx, ty, tw, 28, bg="#0f172a", stk="#0f172a"))
cx = tx
for name, w in cols:
    E.append(ex.text(cx + 8, ty + 7, name, fs=10, color="#ffffff"))
    cx += w
rows = [
    ("1", "GET /tables", "AtLeast cashier", "tableH.ListTables → (no svc) → tableRepo.ListTables (raw SQL)", "—"),
    ("2", "GET /orders/live", "AtLeast cashier", "ListLive → SearchActiveOrders → ListActiveOrders (raw, N+1 items)", "—"),
    ("3", "GET /orders/history", "AtLeast cashier", "ListHistory → ListTodayHistory (raw, no items)", "—"),
    ("4", "GET /orders/:id", "authMW (any)", "Get → GetOrder → GetOrderByID + items (sqlc)", "—"),
    ("5", "PATCH /orders/:id/status", "AtLeast chef", "UpdateStatus → UpdateOrderStatus (validTransitions, sqlc)", "pub/sub only"),
    ("6", "POST /payments", "AtLeast cashier", "Create → CreatePayment → completePayment → MarkOrderPaid", "pub orders:kds"),
    ("7", "GET /sse/admin", "AtLeast manager", "sse.StreamAdmin (subscribes Redis)", "sub orders:admin"),
    ("8", "GET /ws/orders-live?token=", "?token ParseToken (NO authMW)", "ws.LiveHandler (per-client sub)", "sub orders:kds"),
]
ry = ty + 28
for i, r in enumerate(rows):
    bg = "#ffffff" if i % 2 == 0 else ex.L_NEUTRAL
    E.append(ex.rect(tx, ry, tw, 36, bg=bg, stk=B, sw=1))
    cx = tx
    for (val, (name, w)) in zip(r, cols):
        col = "#b91c1c" if (i == 7 and name == "Auth") else T
        E.append(ex.text(cx + 8, ry + 9, val, fs=9, color=col, ff=3, w=w - 10, wrap=True))
        cx += w
    ry += 36

# auth model card
ax = tx
ay = ry + 16
E.append(ex.rect(ax, ay, 520, 150, bg="#fff7ed", stk="#fb923c", sw=1.5))
E.append(ex.text(ax + 14, ay + 10, "Auth model — whole page under shell RoleGuard minRole=MANAGER", fs=11, color="#9a3412"))
for i, l in enumerate(["• reads 1–3: AtLeast(cashier) — customer blocked",
                       "• GET /orders/:id: authMW only, ownership in service",
                       "• PATCH status: AtLeast(chef), any valid next status",
                       "• SSE /sse/admin: AtLeast(manager) — Bearer header",
                       "⚠ WS /ws/orders-live: NO role gate — any JWT (Flag 5)"]):
    c = "#b91c1c" if l.startswith("⚠") else "#7c2d12"
    E.append(ex.text(ax + 14, ay + 36 + i * 22, l, fs=9, color=c, ff=3))

# validTransitions
vx = ax + 540
E.append(ex.rect(vx, ay, 540, 150, bg=ex.L_INDIGO, stk="#6366f1", sw=1.5))
E.append(ex.text(vx + 14, ay + 10, "validTransitions (order_service.go:524-530)", fs=11, color="#3730a3"))
E.append(ex.text(vx + 14, ay + 36,
    "pending   → confirmed | cancelled\nconfirmed → preparing | cancelled\npreparing → ready     | cancelled\nready     → delivered\ndelivered → paid          (paid·cancelled terminal)",
    fs=9, color="#4338ca", ff=3))
E.append(ex.text(vx + 14, ay + 132, "invalid → 409 INVALID_STATUS_TRANSITION", fs=9, color="#b91c1c", ff=3))

# no-cache banner
E.append(ex.rect(tx, ay + 166, tw, 34, bg="#ecfdf5", stk="#10b981", sw=1.5))
E.append(ex.text(tx + 14, ay + 175, "Caching: NO Redis read/write cache anywhere. Every read hits MySQL. Redis = pub/sub bus only (orders:admin · orders:kds · order:<id> · queue:/tables:broadcast). Staleness = FE staleTime.", fs=9, color="#065f46", ff=3, w=tw - 28, wrap=True))

n = ex.append(FP, E)
print(f"PANEL 3: {len(E)} elements added (total {n})")
