#!/usr/bin/env python3
"""PANEL 6 for customer_order_list.excalidraw — Loading States.
Source: customer_order_list_loading.md (3 layers + overlay phases A-D)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p6")
E = []

X, Y = 1720, 1140
E += ex.panel_header(X, Y, "PANEL 6 · Loading States",
                     "customer_order_list_loading.md · unusual story — list does NO async fetch; all loading lives in the overlay")

def layer(x, y, w, h, title, body, bg, stk):
    E.append(ex.rect(x, y, w, h, bg=bg, stk=stk, sw=2))
    E.append(ex.text(x + 12, y + 8, title, fs=12, color=ex.PANEL_TXT))
    E.append(ex.text(x + 12, y + 30, body, fs=10, color=ex.SUB, w=w - 24, wrap=True))

ly = Y + 60
layer(X, ly, 1300, 70, "LAYER 1 — Route spinner · (shop)/loading.tsx",
      "Centered orange ring (h-8 w-8 border-t-orange-500). Fires on HARD navigate into the (shop) group; "
      "absent on client-side transitions. No /order-specific loading.tsx (correct — no async server data).",
      "#fff7ed", ex.C_ORD)
ly += 90
layer(X, ly, 1300, 70, "LAYER 2 — List page mounts · order/page.tsx",
      "NO Suspense · NO isLoading · NO skeleton. orders=[] on first paint → useEffect([],[]) runs loadCachedOrders() "
      "(sync localStorage scan) → list fills next commit. 1-frame empty-flash, imperceptible.",
      ex.L_INDIGO, "#6366f1")
ly += 90

# Layer 3 — overlay phases A-D
E.append(ex.text(X, ly, "LAYER 3 — OrderDetailSheet overlay · useOrderSSE three-phase load", fs=12, color=ex.PANEL_TXT)); ly += 26
phases = [
    ("A · instant paint", "read ▓ cache → setOrder(JSON) → full detail, NO spinner", ex.C_BE),
    ("B · REST snapshot", "GET /orders/:id → setOrder(data.data) · 404 → setIsNotFound · other err → fall to SSE", ex.C_CYAN),
    ("C · SSE stream", "fetchEventSource backoff 1s,2s,4s…cap 30s · max 5 · banner after 3 fails", ex.C_VIOLET),
    ("D · null spinner", "order===null → ring + 'Đang tải đơn hàng...' (header always renders → can close)", "#f59e0b"),
]
px = X
pw = 318
for title, body, accent in phases:
    E.append(ex.rect(px, ly, pw, 120, bg="#ffffff", stk=accent, sw=2))
    E.append(ex.rect(px, ly, pw, 26, bg=accent, stk=accent))
    E.append(ex.text(px + 10, ly + 6, title, fs=11, color=ex.DARK))
    E.append(ex.text(px + 10, ly + 36, body, fs=10, color=ex.L_TEXT, w=pw - 20, wrap=True))
    px += pw + 10

ly += 140
E.append(ex.rect(X, ly, 1300, 52, bg="#fffbeb", stk=ex.C_AMBER))
E.append(ex.text(X + 12, ly + 8,
    "Phase order: A may skip B/C visually (cache hit paints first). ConnectionErrorBanner can show OVER valid cached content.\n"
    "404 wedge: isNotFound set but never read by the sheet → spinner forever (see Panel 8 / Panel 13).",
    fs=10, color="#b45309", w=1276, wrap=True))

ex.append(FP, E)
print(f"PANEL 6: added {len(E)} elements")
