#!/usr/bin/env python3
"""PANEL 14 — One Field, All Layers (dark). Trace `quantity` via the QuantityStepper.
The broken round-trip is the point — from SCENARIO §C/§D + _be.md #5 + ORDER_DETAIL_BUGS Bug 1."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_order_detail/customer_order_detail.excalidraw"
ex.reset("p14")
E = []
X, Y = 40, 10740
E += ex.panel_header(X, Y, "PANEL 14 · One Field, All Layers — `quantity` via the stepper (a BROKEN round-trip)",
                     "from SCENARIO §C/§D + _be.md #5 + ORDER_DETAIL_BUGS Bug 1 · the write reaches the DB but never returns to the screen",
                     color="#0f172a")

y0 = Y + 60
steps = [
    ("1 · tap +", ex.C_ZUS, "QuantityStepper onChange(2) — only if canStepper = isActive && qty_served===0 (page.tsx:695)"),
    ("2 · mutate", ex.C_ZUS, "updateQtyMutation.mutate({itemId, qty:2}) → patchOrderItemQty (api-client.ts:72-73)"),
    ("3 · HTTP", ex.C_CYAN, "PATCH /orders/items/:id/quantity  body { quantity: 2 }  (authMW, callerID→TableID)"),
    ("4 · service", ex.C_ORD, "UpdateOrderItemQuantity (order_service.go:648): qty<1→ErrInvalidInput · order active · qty_served>0→ErrCancelThreshold"),
    ("5 · SQL write", ex.C_BE, "UpdateItemQuantity (orders.sql.go:423) → order_items.quantity = 2  · then RecalculateTotalAmount (orders.sql.go:364)"),
    ("6 · publish", ex.C_ORD, "publishOrderEvent(ctx,'item_updated',orderID) → Redis order:<id> + orders:kds (order_service.go:696)"),
    ("7 · ✗ FE drop", ex.C_RED, "useOrderSSE switch has NO item_updated case → event silently dropped (useOrderSSE.ts:83-123)"),
    ("8 · ✗ invalidate", ex.C_RED, "onSuccess invalidateQueries(['order',id]) → no such useQuery → no-op (page.tsx:59)"),
    ("9 · render", ex.C_RED, "screen still shows qty=1 · 'Tổng cộng' still ₫60,000 · correct ₫70,000 only after full reload"),
]
ry = y0
for tag, c, body in steps:
    E.append(ex.rect(X, ry, 1270, 40, bg=ex.CARD_BG, stk=c, sw=2))
    E.append(ex.rect(X, ry, 130, 40, bg=c, stk=c))
    E.append(ex.text(X + 12, ry + 13, tag, fs=11, color=ex.DARK, ff=3))
    E.append(ex.text(X + 144, ry + 12, body, fs=10, color=ex.LIGHT, ff=3))
    ry += 44

# down arrows between steps 6→7 to mark the break
E.append(ex.text(X + 1290, y0 + 5*44 + 4, "← DB has 2", fs=10, color=ex.C_BE))
E.append(ex.text(X + 1290, y0 + 8*44 + 4, "← UI has 1", fs=10, color=ex.C_RED))

print("PANEL 14:", ex.append(FP, E), "total elements")
