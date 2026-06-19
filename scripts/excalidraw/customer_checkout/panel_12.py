#!/usr/bin/env python3
"""PANEL 12 (dark) — Failure / Edge Map. Sourced from all docs + code:
loading.md (guard/silent failure), be.md (403/400/retry), CHECKOUT_BUGS (1-3)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p12")
E = []
X, Y = 40, 3820
E.append(ex.rect(X - 20, Y - 20, 1560, 470, bg="#0b1220", stk="#1e293b", sw=2))
E += ex.panel_header(X, Y, "PANEL 12 · Failure / Edge Map", "every unhappy path on the /checkout write", color=ex.LIGHT, sub_color=ex.MUTED)

edges = [
 ("empty cart", "itemCount()===0 && !submitted → null + replace('/menu'). Hard reload ALWAYS hits this (items not persisted)."),
 ("Zod fail", "name<2 / phone !~ /^(0|\\+84)[0-9]{9}$/ → inline error, no network. (server does NOT re-validate — Flag 4)"),
 ("400 bind", "missing source / items<1 / item without XOR product|combo → 400 INVALID_INPUT (handler:71-85)."),
 ("403 online (Bug 3)", "source:'online' + table NULL + customer token → GetOrder ownership guard → 403 on re-fetch AND /order/:id."),
 ("silent GET fail", "onSuccess re-fetch failure swallowed → caches minimal {id} body, no toast (loading.md Flag 4)."),
 ("dup order (Bug 2)", "busy table → 201 + table_busy:true → parallel order created, NO notice. Dead TABLE_HAS_ACTIVE_ORDER branch."),
 ("order_number clash", "uq_orders_order_number unique-violation → retry ×3 in CreateOrderWithItems (service:332-346)."),
 ("monitor auth fail", "/tracking monitor SSE 401/403 → PERMANENT stop, isUnauthorized=true → must re-scan QR."),
]
cy = Y + 60
for i, (t, d) in enumerate(edges):
    col = i % 2
    row = i // 2
    xx = X + col * 760
    yy = cy + row * 100
    E.append(ex.rect(xx, yy, 740, 88, bg="#1a0b0b", stk=ex.C_RED, sw=2))
    E.append(ex.text(xx + 12, yy + 8, t, fs=12, color=ex.C_RED))
    E.append(ex.text(xx + 12, yy + 30, d, fs=9, color=ex.LIGHT, ff=3, w=716, wrap=True))

ex.append(FP, E)
print(f"PANEL 12: appended {len(E)} elements")
