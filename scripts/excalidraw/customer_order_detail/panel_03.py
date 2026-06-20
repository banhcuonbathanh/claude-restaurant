#!/usr/bin/env python3
"""PANEL 3 — BE View. From customer_order_detail_be.md (5-endpoint table + auth + caching + errors)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p3")
E = []
X, Y = 40, 1840
E += ex.panel_header(X, Y, "PANEL 3 · BE View — 5 endpoints (all authMW, ownership by table_id)",
                     "from customer_order_detail_be.md · #5 PATCH /quantity is UNIQUE to this page vs C9 overlay · no Redis read-cache")

y0 = Y + 56
# header row
cols = [(0, 36, "#"), (40, 250, "Endpoint"), (296, 230, "Handler → Service"), (530, 250, "Repo / SQL"), (786, 200, "Redis")]
E.append(ex.rect(X, y0, 986, 26, bg=ex.L_TEXT, stk=ex.L_TEXT))
for cx, cw, label in cols:
    E.append(ex.text(X + cx + 8, y0 + 6, label, fs=11, color="#ffffff"))

rows = [
    ("1", "GET /orders/:id", "orderH.Get → GetOrder", "GetOrderByID +Items +Table", "— (live MySQL)", ex.C_TAN),
    ("2", "GET /orders/:id/events  SSE", "sse.StreamOrder", "relays pub/sub (no DB)", "sub order:<id>", ex.C_CYAN),
    ("3", "DELETE /orders/:id", "orderH.Cancel → CancelOrder", "SumQtyServed +SoftDelete", "pub order:<id>+kds", ex.C_RED),
    ("4", "DELETE /orders/items/:id", "orderH.CancelItem → CancelOrderItem", "DeleteItem +Recalc", "pub order:<id>+kds", ex.C_RED),
    ("5", "PATCH /orders/items/:id/quantity ★", "orderH.UpdateItemQuantity", "UpdateItemQty +Recalc", "pub order:<id>+kds", ex.C_ORD),
]
ry = y0 + 26
for n, ep, hs, repo, redis, accent in rows:
    E.append(ex.rect(X, ry, 986, 40, bg="#ffffff", stk=accent, sw=1))
    E.append(ex.rect(X, ry, 4, 40, bg=accent, stk=accent))
    E.append(ex.text(X + 12, ry + 13, n, fs=11, color=ex.L_TEXT))
    E.append(ex.text(X + 48, ry + 6, ep, fs=10, color=ex.L_TEXT, ff=3))
    E.append(ex.text(X + 304, ry + 13, hs, fs=9, color="#475569", ff=3))
    E.append(ex.text(X + 538, ry + 13, repo, fs=9, color="#475569", ff=3))
    E.append(ex.text(X + 794, ry + 13, redis, fs=9, color="#475569", ff=3))
    ry += 42

# auth + caching notes
ny = ry + 12
notes = [
    (ex.C_VIOLET, "Auth model", "All 5 behind authMW · NO role gate · guest JWT (sub=guest, role=customer, table_id) passes all. Ownership: callerID→claims.TableID; service rejects ErrForbidden(403) if order.table_id ≠ caller."),
    (ex.C_AMBER, "Gotcha", "PATCH /orders/items/:id (no /quantity) is a DIFFERENT endpoint — UpdateItemServed, AtLeast('chef') — KDS only. This page calls only the /quantity variant."),
    (ex.C_TAN, "Caching", "NO Redis read-cache on any endpoint — orders read live from MySQL. Redis is pub/sub fan-out only; publish failures logged + swallowed. Client staleness = localStorage order_cache_<id>."),
]
for i, (c, t, body) in enumerate(notes):
    E.append(ex.rect(X, ny + i*56, 986, 50, bg=ex.L_NEUTRAL, stk=c, sw=2))
    E.append(ex.text(X + 12, ny + i*56 + 6, t, fs=11, color=ex.L_TEXT))
    E.append(ex.text(X + 12, ny + i*56 + 24, body, fs=9, color="#475569", w=960, wrap=True))

print("PANEL 3:", ex.append(FP, E), "total elements")
