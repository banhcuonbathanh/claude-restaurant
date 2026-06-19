#!/usr/bin/env python3
"""PANEL 8 — Flags / Known Mismatches — be.md §Flags + loading.md + scenario.md.
Collected doc-vs-code drift, dead code, ignored params, security gaps."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/admin/admin_overview/admin_overview.excalidraw"
ex.reset("p8")
E = []
T = ex.L_TEXT

X, Y = 1900, 2780
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches",
                     "doc-vs-code drift collected from all 6 docs · source: be.md §Flags + loading.md + SCENARIO")

flags = [
    ("1", "Zone B feed is GET /orders/live, not GET /orders", "FE sibling labels Zone B's source GET /orders; real call = /orders/live (ListLive→SearchActiveOrders). Twin /orders route exists (AtLeast chef).", "#FF7A1A"),
    ("2", "delivered→cancelled impossible but UI offers it", "TableList renders Huỷ on delivered orders → PATCH cancelled → guaranteed 409. Generic catch toast hides cause. Delivered can only → paid.", "#F87171"),
    ("3", "POST /payments ignores the FE amount", "DTO = {order_id, method} only; amount taken server-side from order.total_amount. The amount FE sends is dead weight (harmless, misleading).", "#FBBF24"),
    ("4", "WS handles 2 event types BE never emits", "useOverviewWS switches on order_updated & order_completed — BE publishes neither (status=order_status_changed, completion=cancelled/payment_success). Dead branches. ❓legacy UNVERIFIED.", "#A78BFA"),
    ("5", "WS /ws/orders-live has NO role gate", "Route group carries no authMW; handler only needs a parseable JWT. Any authenticated user (incl. customer guest) can open the live floor. SSE is correctly manager+.", "#F87171"),
    ("6", "orders/history returns no items", "ListTodayHistory never fetches order_items → paid/cancelled orders arrive with items:[]. PaidLog/CancelLog don't need them — but don't reuse for item-level views.", "#22D3EE"),
    ("7", "q search param on /orders/live unused here", "ListLive supports server-side q filtering; this page passes none and filters client-side. BE filter path only exercised if a caller adds ?q=.", "#34D399"),
    ("8", "Optimistic update not rolled back on error", "handleAction writes new status before PATCH resolves; on 409/error shows toast but does NOT revert. WS reconcile or 15s staleTime refetch heals — UI transiently wrong.", "#F87171"),
    ("9", "No global skeleton / invisible WS-connecting", "Zones render [] on first paint (\"quán đang yên tĩnh\" ≡ loading). wsConnected===null shows no UI; no SSE disconnect banner.", "#FBBF24"),
]
cardw = 830
col_x = [X, X + cardw + 30]
for i, (num, title, body, c) in enumerate(flags):
    col = i % 2
    rowi = i // 2
    x = col_x[col]
    y = Y + 70 + rowi * 132
    E.append(ex.rect(x, y, cardw, 116, bg="#ffffff", stk=c, sw=2))
    E.append(ex.rect(x, y, 34, 116, bg=c, stk=c))
    E.append(ex.text(x + 10, y + 48, num, fs=18, color="#0a0a0a"))
    E.append(ex.text(x + 46, y + 12, title, fs=12, color=T, w=cardw - 60, wrap=True))
    E.append(ex.text(x + 46, y + 44, body, fs=9, color="#475569", ff=3, w=cardw - 60, wrap=True))

n = ex.append(FP, E)
print(f"PANEL 8: {len(E)} elements added (total {n})")
