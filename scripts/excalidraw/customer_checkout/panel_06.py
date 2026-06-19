#!/usr/bin/env python3
"""PANEL 6 — Scenario Timeline. Sourced from SCENARIO_CHECKOUT_ORDER.md
(Minh's online order, 12:01 beats; Bug 1/2/3 fire points)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p6")
E = []
X, Y = 620, 1360
E += ex.panel_header(X, Y, "PANEL 6 · Scenario — Minh's online order (🔮 PLANNED path)",
                     "from SCENARIO_CHECKOUT_ORDER.md — source:'online', table_id:null · cart = combo Giò + Canh")

ty = Y + 60
beats = [
 ("12:01:00", "arrive /checkout", "guard: itemCount()=2 passes · summary+form+radios render · footer ₫21,000"),
 ("12:01:20", "type name+phone", "\"Nguyễn Văn Minh\" + \"0912345678\" → RHF tracks (validates on submit)"),
 ("12:01:30", "pick 💳 VNPay", "🚨 Bug1 begins — real RHF field but will have zero downstream effect"),
 ("12:01:45", "tap Đặt hàng", "Zod all pass → mutate → btn \"Đang đặt hàng...\" · setPaymentMethod('vnpay')"),
 ("12:01:45", "build payload", "buildOrderItemsPayload: combo row + standalone Canh · NO payment_method"),
 ("12:01:46", "BE CreateOrder", "no table→tableBusy=false · expandCombo header0+sub · recalc ₫21,000 ·"),
 ("",        "",               "publish new_order → KDS · return 201 {id, table_busy:false}"),
 ("12:01:47", "onSuccess", "🚨 Bug3 — GET /orders/:id → 403 (table NULL) · catch → cache minimal {id}"),
 ("",        "",          "clearCart() → 'vnpay' gone (Bug1 done) · router.replace('/order/<id>')"),
 ("12:01:47", "Bug2 note", "TABLE_HAS_ACTIVE_ORDER onError branch never fires (no table this run)"),
]
for i, (t, a, d) in enumerate(beats):
    yy = ty + i * 50
    acc = "#ef4444" if "🚨" in d or "Bug2" in a else "#0ea5e9"
    E.append(ex.rect(X, yy, 800, 44, bg=("#fef2f2" if acc == "#ef4444" else "#ffffff"), stk=acc, sw=1))
    if t:
        E.append(ex.text(X + 8, yy + 6, t, fs=10, color=acc, ff=3))
    if a:
        E.append(ex.text(X + 92, yy + 6, a, fs=10, color=ex.PANEL_TXT))
    E.append(ex.text(X + 8 if not t else X + 92, yy + 24, d, fs=9, color=ex.L_TEXT, ff=3))

ex.append(FP, E)
print(f"PANEL 6: appended {len(E)} elements")
