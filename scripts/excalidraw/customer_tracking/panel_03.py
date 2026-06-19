#!/usr/bin/env python3
"""PANEL 3 — BE View. From customer_tracking_be.md (endpoints, auth, caching, errors)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p3")
E = []
X, Y = 1720, 40
E += ex.panel_header(X, Y, "PANEL 3 · BE View — 1 REST read + 1 SSE stream",
                     "from customer_tracking_be.md · page is read-only · NO writes · no Redis key cache")
L = "#1e293b"

def card(x, y, w, h, accent, title, lines):
    E.append(ex.rect(x, y, w, h, bg=ex.L_NEUTRAL, stk=accent, sw=2))
    E.append(ex.rect(x, y, w, 26, bg=accent, stk=accent))
    E.append(ex.text(x + 10, y + 6, title, fs=12, color="#0a0a0a"))
    E.append(ex.text(x + 10, y + 34, lines, fs=10, color="#475569"))

card(X, Y + 60, 880, 120, ex.C_ORD, "1 · GET /orders/:id   (authMW · guest JWT OK)",
     "handler orderH.Get → svc.GetOrder → GetOrderByID + GetOrderItemsByOrderID + GetTableByID\n"
     "OWNERSHIP guard: customer callerID = claims.TableID; order.table_id ≠ caller → ErrForbidden (403)\n"
     "derived ItemStatus = itemStatus(qty_served, quantity)  (no order_items.status column)\n"
     "Redis: — none (hits MySQL every call · FE staleTime:0 · refetch on itemsChangedAt)")
card(X, Y + 200, 880, 138, ex.C_CYAN, "2 · GET /sse/order-monitor/:id   (authMW · guest JWT OK)",
     "handler sse.StreamOrderMonitor → MonitorSnapshot → buildMonitorPayloads\n"
     "on connect: Subscribe order:<id> · queue:broadcast · tables:broadcast → emit 'connected'\n"
     "initial snapshot: 1×queue.update + 1×tables.status  · keep-alive comment every 15s\n"
     "⚠ NO per-order ownership check — only validates non-empty :id (asymmetry vs REST)\n"
     "ListActiveOrders + ListTables on connect; pub/sub is TRANSPORT only, not a cache")

# error mapping strip
ey = Y + 360
E.append(ex.text(X, ey, "Error mapping (handleServiceError):", fs=12, color=L))
for i, (code, txt, c) in enumerate([("404", "ErrNotFound (no order)", ex.C_RED),
                                    ("403", "ErrForbidden (table mismatch, REST only)", ex.C_RED),
                                    ("401/403", "SSE auth → permanent AuthError", ex.C_RED),
                                    ("400", "bad/empty :id on SSE (before headers)", ex.C_AMBER)]):
    yy = ey + 24 + i * 26
    E.append(ex.rect(X, yy, 70, 22, bg=c, stk=c))
    E.append(ex.text(X + 8, yy + 4, code, fs=10, color="#0a0a0a"))
    E.append(ex.text(X + 82, yy + 4, txt, fs=10, color="#475569"))

print("PANEL 3:", ex.append(FP, E), "total elements")
