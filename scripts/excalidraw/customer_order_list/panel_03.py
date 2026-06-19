#!/usr/bin/env python3
"""PANEL 3 for customer_order_list.excalidraw — BE View.
Source: customer_order_list_be.md (endpoint table, auth model, caching, errors)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p3")
E = []

X, Y = 2440, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View",
                     "customer_order_list_be.md · all 4 endpoints reached ONLY via OrderDetailSheet overlay — list grid calls none")

# banner
by = Y + 56
E.append(ex.rect(X, by, 1320, 36, bg="#fff7ed", stk=ex.C_ORD))
E.append(ex.text(X + 12, by + 9, "List page = ZERO BE calls · No Redis read-cache (live MySQL every call) · Redis = pub/sub fan-out only", fs=12, color="#b45309"))

# endpoint table
ty = by + 56
cols = [("#", 30), ("Endpoint", 320), ("Auth", 90), ("Handler / Service", 360), ("Redis", 270)]
# header row
cx = X
E.append(ex.rect(X, ty, sum(c[1] for c in cols), 28, bg=ex.L_INDIGO, stk=ex.L_BORDER))
for name, w in cols:
    E.append(ex.text(cx + 8, ty + 7, name, fs=11, color=ex.PANEL_TXT))
    cx += w
ty += 28

rows = [
    ("1", "GET /orders/:id", "authMW", "orderH.Get :125 → GetOrder :106", "—"),
    ("2", "GET /orders/:id/events (SSE)", "authMW", "sse.StreamOrder :21 (relays pub/sub)", "order:<id>"),
    ("3", "DELETE /orders/:id  (cancel order)", "authMW", "orderH.Cancel :186 → CancelOrder :558", "order:<id> + orders:kds"),
    ("4", "DELETE /orders/items/:id  (cancel item)", "authMW", "orderH.CancelItem :200 → CancelOrderItem :598", "order:<id> + orders:kds"),
]
for r in rows:
    cx = X
    E.append(ex.rect(X, ty, sum(c[1] for c in cols), 40, bg=ex.L_NEUTRAL, stk=ex.L_BORDER))
    for i, (val, (_, w)) in enumerate(zip(r, cols)):
        ff = 3 if i in (1,) else 2
        E.append(ex.text(cx + 8, ty + 10, val, fs=10, color=ex.L_TEXT, ff=ff, w=w - 12, wrap=True))
        cx += w
    ty += 40

# auth model
ay = ty + 24
E.append(ex.text(X, ay, "AUTH MODEL", fs=13, color=ex.PANEL_TXT)); ay += 22
for s in [
    "• List page needs NO token — pure localStorage read (page.tsx:10-24).",
    "• Every overlay endpoint behind authMW; guest JWT (sub=\"guest\", role=\"customer\", table_id) satisfies all 4.",
    "• Ownership BY TABLE: role==customer → callerID swapped to claims.TableID; service 403s if order.table_id ≠ caller.",
    "• SSE auth validated by authMW BEFORE StreamOrder runs; token sent as Bearer header (not query param).",
]:
    E.append(ex.text(X, ay, s, fs=11, color=ex.L_TEXT)); ay += 22

# errors
ey = ay + 16
E.append(ex.text(X, ey, "ERROR BEHAVIOUR", fs=13, color=ex.PANEL_TXT)); ey += 24
errs = [("404 NOT_FOUND", "#fee2e2", "unknown / soft-deleted id"),
        ("403 FORBIDDEN", "#fee2e2", "guest reads another table's order"),
        ("422 CANCEL_THRESHOLD", "#fef3c7", "past 30% rule / item already served")]
exb = X
for code, bg, why in errs:
    E.append(ex.rect(exb, ey, 420, 44, bg=bg, stk=ex.L_BORDER))
    E.append(ex.text(exb + 10, ey + 8, code, fs=11, color="#991b1b"))
    E.append(ex.text(exb + 10, ey + 26, why, fs=10, color=ex.SUB))
    exb += 440

ex.append(FP, E)
print(f"PANEL 3: added {len(E)} elements")
