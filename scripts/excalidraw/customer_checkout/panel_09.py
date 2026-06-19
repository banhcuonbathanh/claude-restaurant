#!/usr/bin/env python3
"""PANEL 9 (dark) — Object Lifecycle (moving) — the 201 onSuccess seam.
Sourced from customer_checkout_crosspage_dataflow.md §2 + SCENARIO §12:01:47."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p9")
E = []
X, Y = 1620, 2500
E.append(ex.rect(X - 20, Y - 20, 1560, 380, bg="#0b1220", stk="#1e293b", sw=2))
E += ex.panel_header(X, Y, "PANEL 9 · Object Lifecycle (moving) — the 201 handoff seam", "onSuccess (page.tsx:61-76): what changes, in order, before navigating", color=ex.LIGHT, sub_color=ex.MUTED)

cy = Y + 60
lanes = [
 (ex.C_TAN, "① try GET /orders/:id", "best-effort → fullOrder\n(may 403 online, Bug3)\nfallback: minimal {id,table_busy}"),
 (ex.C_VIOLET, "② cache write", "order_cache_<id> = JSON ▓\nsurvives F5\n(checkout/page.tsx:68)"),
 (ex.C_ZUS, "③ clearCart() ░", "items=[] tableId=null\ntableName=null activeOrderId=null\npaymentMethod=null orderNote=''"),
 (ex.C_CYAN, "router.replace", "NOT push → back-btn skips\n/checkout (empty-cart guard).\n▶ /order/<id>"),
]
for i, (acc, t, b) in enumerate(lanes):
    xx = X + i * 380
    c, _ = ex.card(xx, cy, 360, acc, t, b)
    E += c
    if i < len(lanes) - 1:
        E.append(ex.arrow(xx + 360, cy + 70, xx + 380, cy + 70, stk=ex.MUTED, sw=2))

ny = cy + 200
E.append(ex.rect(X, ny, 1500, 90, bg="#1a1305", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 14, ny + 8, "Critical difference vs /menu TableConfirmModal", fs=12, color=ex.C_RED))
E.append(ex.text(X + 14, ny + 32,
 "TableConfirmModal calls setActiveOrderId(id) after create → /tracking knows the order immediately.\n/checkout does NOT — clearCart() resets activeOrderId to null (cart.ts:89). Guest must tap \"Theo dõi bàn\"\non /order/<id> to set the pointer. Until then /tracking shows the empty state.",
 fs=10, color=ex.LIGHT, ff=3))

ex.append(FP, E)
print(f"PANEL 9: appended {len(E)} elements")
