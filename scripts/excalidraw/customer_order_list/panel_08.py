#!/usr/bin/env python3
"""PANEL 8 for customer_order_list.excalidraw — Flags / Known Mismatches.
Source: TRACKING_BUGS.md + Flags across be/crosspage/loading docs."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_list/customer_order_list.excalidraw"
ex.reset("p8")
E = []

X, Y = 1720, 2760
E += ex.panel_header(X, Y, "PANEL 8 · Flags / Known Mismatches",
                     "TRACKING_BUGS.md · 4 live bugs + 2 out-of-scope notes — code mismatches, not stale docs · none fixed yet")

bugs = [
    ("Bug 1", "🔴 High", "#fee2e2", "404 / foreign order wedges overlay spinner forever",
     "useOrderSSE sets isNotFound (:59-61) but OrderDetailSheet destructures only {order,progress,connectionError,notification} (:45) → spinner :206-212 never exits.  FIX: FE"),
    ("Bug 2", "🟠 Med", "#fef3c7", "List cards never refetch → stale until sheet opened",
     "useEffect([],[]) reads cache once (page.tsx:37-39); no socket/refetch; closing overlay does not re-scan.  FIX: FE — re-scan on close / visibilitychange"),
    ("Bug 3", "🟠 Med", "#fef3c7", "item_cancelled published but not consumed → cancel not live",
     "BE publishes type:item_cancelled (order_service.go:642) but useOrderSSE switch :83-123 has no case → item not removed live, only on next snapshot.  FIX: FE"),
    ("Bug 4", "🟡 Low", "#fef9c3", "SSE stream handler does no ownership check",
     "StreamOrder behind authMW only (main.go:239); no table_id compare (sse/handler.go:21-70). REST GET/DELETE do enforce it — SSE is the odd one out.  FIX: BE"),
    ("Bug 5", "🟡 Low", "#f1f5f9", "clearAll() leaves activeOrderId in cart store (out of scope)",
     "clearAll removes order_cache_* keys (page.tsx:41-51) but not setActiveOrderId(null) → /tracking / 'Thêm món' can point at a cacheless order."),
    ("Bug 6", "🟡 Low", "#f1f5f9", "OrderItem type / DishRow has no `filling` (out of scope — OC epic)",
     "migration 016 added order_items.filling + wired admin views, but fe/src/types/order.ts OrderItem (:15-27) lacks it → customer DishRow can't show filling."),
]
y = Y + 60
for tag, sev, bg, title, body in bugs:
    E.append(ex.rect(X, y, 1480, 62, bg=bg, stk=ex.L_BORDER, sw=2))
    E.append(ex.text(X + 12, y + 9, tag, fs=12, color=ex.PANEL_TXT))
    E.append(ex.text(X + 90, y + 9, sev, fs=11, color=ex.L_TEXT))
    E.append(ex.text(X + 180, y + 9, title, fs=12, color=ex.L_TEXT))
    E.append(ex.text(X + 12, y + 32, body, fs=10, color=ex.SUB, w=1456, wrap=True))
    y += 72

ex.append(FP, E)
print(f"PANEL 8: added {len(E)} elements")
