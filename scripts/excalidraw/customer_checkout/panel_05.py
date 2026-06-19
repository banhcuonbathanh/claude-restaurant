#!/usr/bin/env python3
"""PANEL 5 — Loading States. Sourced from customer_checkout_loading.md.
Code: fe/src/app/(shop)/checkout/page.tsx · (shop)/loading.tsx · cart.ts."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p5")
E = []
X, Y = 40, 1200
E += ex.panel_header(X, Y, "PANEL 5 · Loading States",
                     "from customer_checkout_loading.md — a mutation page, not a fetch page")

ly = Y + 60
E.append(ex.rect(X, ly, 520, 100, bg=ex.L_NEUTRAL, stk="#0ea5e9", sw=2))
E.append(ex.text(X + 12, ly + 8, "4 layers (outer→inner)", fs=11, color="#0369a1"))
E.append(ex.text(X + 12, ly + 30,
 "1 Route nav   → ShopLoading spinner (shared)\n2 Suspense    → NONE\n3 Data fetch  → NONE (no useQuery on mount)\n4 Mutation    → button disabled + label only",
 fs=9, color=ex.L_TEXT, ff=3))

by = ly + 116
E.append(ex.rect(X, by, 520, 192, bg="#ffffff", stk="#f59e0b", sw=2))
E.append(ex.text(X + 12, by + 8, "Main-content branch (priority-ordered, page.tsx)", fs=11, color="#b45309"))
E.append(ex.text(X + 12, by + 30,
 "1 !submitted && itemCount()===0 → null (blank)\n2 submitOrder.isPending → btn disabled +\n  \"Đang đặt hàng...\"  (no spinner icon)\n3 onSuccess → clearCart + replace /order/<id>\n4 onError TABLE_HAS_ACTIVE_ORDER → DEAD branch\n5 onError other → toast.error(message)\n6 idle (cart non-empty) → full form\n\nNo skeletons · no per-field spinner · GET\nrefetch failure in onSuccess is SILENT (Bug 3).",
 fs=9, color=ex.L_TEXT, ff=3))

ex.append(FP, E)
print(f"PANEL 5: appended {len(E)} elements")
