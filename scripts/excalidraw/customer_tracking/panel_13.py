#!/usr/bin/env python3
"""PANEL 13 — Failure / Edge Map (dark). From _be Error Behaviour + _loading Flags."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_tracking/customer_tracking.excalidraw"
ex.reset("p13")
E = []
X, Y = 40, 4300
E += ex.panel_header(X, Y, "PANEL 13 · Failure / Edge Map",
                     "from _be.md Error Behaviour + _loading.md · every unhappy path",
                     color="#0f172a")

edges = [
    ("REST 404", "GetOrderByID → sql.ErrNoRows → ErrNotFound", "FE skips 404 retry → 'Đơn hàng không tồn tại' card (isError && !order)", ex.C_RED),
    ("REST 403", "customer table_id ≠ claims.TableID → ErrForbidden", "ownership guard (REST only — SSE has none)", ex.C_RED),
    ("SSE 401/403", "onopen non-OK → permanent AuthError (no retry)", "isUnauthorized → 'Phiên hết hạn — quét lại QR' card", ex.C_RED),
    ("SSE transport drop", "onerror → backoff 1·2·4·8·16s (cap 30s, max 5)", "ConnectionErrorBanner immediately (showBannerAfter unused)", ex.C_AMBER),
    ("SSE bad/empty :id", "monitor_handler validates :id first", "400 INVALID_INPUT before any stream headers", ex.C_AMBER),
    ("Redis behaviour", "pub/sub TRANSPORT only — no key cache", "GET /orders/:id hits MySQL every refetch (staleTime:0)", ex.C_SLATE),
    ("stale queue on reconnect", "queueData keeps last value during gap", "FloorList shows stale positions, no staleness indicator", ex.C_AMBER),
]
yy = Y + 60
for tag, cause, effect, c in edges:
    E.append(ex.rect(X, yy, 1400, 40, bg=ex.CARD_BG, stk=c, sw=1))
    E.append(ex.rect(X, yy, 200, 40, bg=c, stk=c))
    E.append(ex.text(X + 8, yy + 13, tag, fs=10, color="#0a0a0a"))
    E.append(ex.text(X + 210, yy + 5, cause, fs=9, color=ex.LIGHT, ff=3, w=560, wrap=True))
    E.append(ex.text(X + 790, yy + 5, effect, fs=9, color=ex.MUTED, ff=3, w=600, wrap=True))
    yy += 46

print("PANEL 13:", ex.append(FP, E), "total elements")
