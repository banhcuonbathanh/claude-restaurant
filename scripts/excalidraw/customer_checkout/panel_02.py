#!/usr/bin/env python3
"""PANEL 2 — BE View. Sourced from customer_checkout_be.md.
Code: be/cmd/server/main.go · order_handler.go · order_service.go · errors.go."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p2")
E = []
X, Y = 620, 40
E += ex.panel_header(X, Y, "PANEL 2 · BE View — 2 endpoints, both authMW",
                     "from customer_checkout_be.md — one write + one re-fetch · no Redis read-cache")

ty = Y + 60
E.append(ex.rect(X, ty, 760, 28, bg=ex.L_INDIGO, stk="#6366f1", sw=2))
E.append(ex.text(X + 10, ty + 7, "#  Endpoint            Auth     Handler→Service           Repo / SQL", fs=10, color="#3730a3", ff=3))
rows = [
 "1  POST /orders        authMW   Create → CreateOrder      tx CreateOrderWithItems",
 "2  GET  /orders/:id    authMW   Get    → GetOrder         GetOrderByID + items + table",
]
for i, r in enumerate(rows):
    yy = ty + 28 + i * 26
    E.append(ex.rect(X, yy, 760, 26, bg="#ffffff", stk=ex.L_BORDER, sw=1))
    E.append(ex.text(X + 10, yy + 6, r, fs=10, color=ex.L_TEXT, ff=3))
E.append(ex.text(X, ty + 90, "Routes: main.go:230-237 — orderR.Use(authMW); POST \"\" + GET /:id carry NO role MW\n(any valid JWT incl. guest token passes). This page calls NO catalog GETs.", fs=9, color=ex.SUB, ff=3))

# auth model card
ay = ty + 140
E.append(ex.rect(X, ay, 370, 200, bg=ex.L_NEUTRAL, stk="#0ea5e9", sw=2))
E.append(ex.text(X + 12, ay + 8, "Auth model", fs=12, color="#0369a1"))
E.append(ex.text(X + 12, ay + 32,
 "• both under orderR.Use(authMW) — token\n  mandatory (catalog was public).\n• created_by rule (handler:88-92):\n  role==customer → blanked → NULL;\n  staff JWT → stores staff subject.\n• guest ownership BY TABLE not id:\n  callerID = claims.TableID;\n  GetOrder enforces o.TableID==callerID\n  (service:116-120).\n• ⚠ online (table NULL) → 403 for\n  customer role (Bug 3).",
 fs=9, color=ex.L_TEXT, ff=3))

# cache + error card
cy = ay
E.append(ex.rect(X + 390, cy, 370, 200, bg=ex.L_NEUTRAL, stk="#16a34a", sw=2))
E.append(ex.text(X + 402, cy + 8, "Caching & errors", fs=12, color="#15803d"))
E.append(ex.text(X + 402, cy + 32,
 "• NO Redis read-cache on either ep —\n  both hit MySQL directly.\n• Redis = pub/sub fan-out only:\n  new_order + admin event + monitor\n  broadcast (service:348-350).\n• only client cache = localStorage\n  order_cache_<id> (onSuccess).\n\nErrors: bind/validate → 400 INVALID_INPUT\n  ErrNotFound→404 · ErrForbidden→403\n  combo/empty-items AppError→400",
 fs=9, color=ex.L_TEXT, ff=3))

ex.append(FP, E)
print(f"PANEL 2: appended {len(E)} elements")
