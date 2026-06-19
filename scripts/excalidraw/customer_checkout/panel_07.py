#!/usr/bin/env python3
"""PANEL 7 — Flags / Known Mismatches. Sourced from CHECKOUT_BUGS.md (Bug 1-3)
+ customer_checkout_be.md §Flags (4-5)."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p7")
E = []
X, Y = 1520, 1360
E += ex.panel_header(X, Y, "PANEL 7 · Flags / Known Mismatches",
                     "from CHECKOUT_BUGS.md + customer_checkout_be.md §Flags — code bugs, NOT stale docs")

flags = [
 ("#ef4444", "🟠 Bug 1 · payment_method dead",
  "radio (page.tsx:24-29,184-194) → cart.setPaymentMethod → clearCart wipes it.\nNOT in POST body · no orders.payment_method column (DB_SCHEMA:138).\nVNPay/MoMo/ZaloPay do nothing. Fix: FE drop non-cash / disable."),
 ("#ef4444", "🟠 Bug 2 · TABLE_HAS_ACTIVE_ORDER branch dead → silent dup order",
  "FE onError waits for an error BE never sends. Busy table → 201 + table_busy:true\n+ parallel order created (deliberate rule, BUSINESS_RULES §2.3). ErrTableHasActiveOrder\n(errors.go:30) referenced nowhere. Checkout also ignores table_busy. Fix: FE."),
 ("#f59e0b", "🟡 Bug 3 · online (table-null) order unreadable by guest token (403)",
  "GetOrder guard: customer ok only if o.TableID==claims.TableID. online → NULL → 403.\nRe-fetch swallowed; /order/:id own fetch 403s. Latent (no wired online entry). Fix: BE."),
 ("#94a3b8", "Flag 4 · name/phone/note NOT server-validated",
  "handler binds with no rules; min-2 + phone regex is FE-only (page.tsx:16-17)."),
 ("#94a3b8", "Flag 5 · checkout never uses POST /orders/:id/items",
  "always creates a fresh order; cart.activeOrderId ignored here (unlike menu append mode)."),
]
yy = Y + 60
for acc, t, b in flags:
    h = 76 if t.startswith(("🟠", "🟡")) else 50
    E.append(ex.rect(X, yy, 1080, h, bg=("#fef2f2" if acc == "#ef4444" else "#fffbeb" if acc == "#f59e0b" else "#f8fafc"), stk=acc, sw=2))
    E.append(ex.text(X + 12, yy + 8, t, fs=11, color=(acc if acc != "#94a3b8" else ex.PANEL_TXT)))
    E.append(ex.text(X + 12, yy + 28, b, fs=9, color=ex.L_TEXT, ff=3))
    yy += h + 10

ex.append(FP, E)
print(f"PANEL 7: appended {len(E)} elements")
