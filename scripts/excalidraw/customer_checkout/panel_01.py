#!/usr/bin/env python3
"""PANEL 1 for customer_checkout.excalidraw — Page Wireframe (mobile 420px).
Sourced from docs/system/08_pages/customer/customer_checkout/customer_checkout.md
(ASCII wireframe + Zones table). Code: fe/src/app/(shop)/checkout/page.tsx."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/customer/customer_checkout/customer_checkout.excalidraw"
ex.reset("p1")
E = []

X, Y = 40, 40
E += ex.panel_header(X, Y, "PANEL 1 · Page Wireframe — /checkout (mobile 420px)",
                     "from customer_checkout.md — non-table / online order form · QR dine-in path SKIPS this page")

# phone frame
fx, fy, fw = X, Y + 70, 460
frame_h = 880
E.append(ex.rect(fx, fy, fw, frame_h, bg="#ffffff", stk=ex.L_BORDER, sw=2))

def zone(y, h, accent, label, lines, src):
    E.append(ex.rect(fx + 12, y, fw - 24, h, bg=ex.L_NEUTRAL, stk=accent, sw=2))
    E.append(ex.text(fx + 22, y + 8, label, fs=12, color=accent))
    E.append(ex.text(fx + 22, y + 28, lines, fs=10, color=ex.L_TEXT, ff=3))
    E.append(ex.text(fx + fw - 150, y + 6, src, fs=8, color=ex.SUB, ff=3))
    return y + h + 10

cy = fy + 14
# sticky header
E.append(ex.rect(fx + 12, cy, fw - 24, 34, bg=ex.L_ORANGE, stk="#fb923c", sw=2))
E.append(ex.text(fx + 22, cy + 9, "[← Quay lại]   Xác Nhận Đơn Hàng", fs=12, color="#9a3412"))
E.append(ex.text(fx + fw - 110, cy + 11, "sticky header", fs=8, color=ex.SUB, ff=3))
cy += 44

cy = zone(cy, 96, "#0ea5e9", "A · OrderSummary",
          "2x Bánh cuốn thịt        70.000đ\n  + Chả lụa, Hành phi\n1x Canh mọc              10.000đ\n──────────────────────────────\nTổng cộng                80.000đ",
          "useCartStore().items")
cy = zone(cy, 110, "#8b5cf6", "B · ContactForm (RHF+Zod)",
          "[ Họ tên *  ______________ ]   min2\n[ Số điện thoại * ________ ]   /^(0|\\+84)[0-9]{9}$/\n[ Ghi chú (tuỳ chọn) _____ ]   note opt",
          "local form state")
cy = zone(cy, 92, "#f59e0b", "C · PaymentMethod (radio)",
          "(•) 💵 Tiền mặt COD   ( ) 💳 VNPay\n( ) 📱 MoMo           ( ) 🏦 ZaloPay\n⚠️ default cash · NOT sent to BE (Bug 1)",
          "cart.setPaymentMethod")
cy = zone(cy, 56, "#16a34a", "D · SubmitBar (fixed)",
          "        [ Đặt hàng · 80.000đ ]\nPOST /orders ← buildOrderItemsPayload(items)",
          "fixed bottom")

# bottom nav shell
E.append(ex.rect(fx + 12, fy + frame_h - 44, fw - 24, 32, bg="#f1f5f9", stk=ex.L_BORDER, sw=1))
E.append(ex.text(fx + 22, fy + frame_h - 36, "[Menu][Đơn Hàng][Yêu Thích][Theo Dõi][Cài Đặt]", fs=10, color=ex.SUB, ff=3))
E.append(ex.text(fx + 22, fy + frame_h - 70, "ClientBottomNav (shell)", fs=8, color=ex.SUB, ff=3))

# guard note
gy = fy + frame_h + 16
E.append(ex.rect(X, gy, fw, 70, bg="#fef2f2", stk=ex.C_RED, sw=2))
E.append(ex.text(X + 12, gy + 8, "Empty-cart guard (page.tsx:36-38, :92)", fs=11, color="#b91c1c"))
E.append(ex.text(X + 12, gy + 28, "itemCount()===0 && !submitted → return null + router.replace('/menu')\nitems NOT persisted (cart.ts:153) → hard reload always redirects to /menu", fs=9, color=ex.L_TEXT, ff=3))

# N/A cross-component note (the skipped panel)
ny = gy + 86
E.append(ex.rect(X, ny, fw, 56, bg="#f8fafc", stk=ex.SUB, sw=1, style="dashed"))
E.append(ex.text(X + 12, ny + 8, "ⓘ No Cross-Component panel — N/A for this page", fs=10, color=ex.SUB))
E.append(ex.text(X + 12, ny + 26, "single widget (the form) + one read of cart store; no multi-writer\nshared store (crosspage_dataflow.md:37 · SCENARIO §A)", fs=9, color=ex.SUB, ff=3))

ex.save(FP, E)
print(f"PANEL 1: {len(E)} elements")
