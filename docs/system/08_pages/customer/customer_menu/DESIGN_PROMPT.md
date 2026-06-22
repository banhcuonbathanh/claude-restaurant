# Design Prompt — Customer Menu Page (`/menu`)

> Paste the block below into Claude (design / artifact mode). It is written from the **real running
> app screenshots** + the page spec, so the output matches the live page, not the idealized doc.

---

## PROMPT (copy from here)

Design a **mobile-first food-ordering menu page** for a Vietnamese bánh cuốn (rice-roll) restaurant. This is a QR-table ordering screen: a customer scans a QR at their table, browses the menu, builds a cart, and confirms the order in one modal. Build it as a single self-contained HTML+Tailwind (or React) artifact at an **iPhone width of 390px**. All copy is in Vietnamese — keep it exactly as given.

### Visual system (match precisely)
- **Theme:** dark. Page background near-black `#0b0f17`; cards/panels a slightly lighter slate `#1b2230` / `#222b3a` with subtle rounded corners (`rounded-xl`) and 1px hairline borders `#2a3344`.
- **Primary accent:** warm orange `#f97316` (buttons, prices, active states, the `+` add button).
- **Text:** primary `#e5e7eb` (near-white), secondary/muted `#8b95a7` (descriptions, labels). Prices are orange and bold.
- **Currency format:** `50.000 đ` (dot thousands separator, lowercase `đ`, space before it). Prices right-aligned.
- **Font:** clean sans-serif (Inter/system). The top restaurant title uses a **serif** display font.
- Generous touch targets, comfortable vertical rhythm, no harsh shadows.

### Layout, top → bottom

1. **Header (black bar).** Left: serif title **"Quán Bánh Cuốn"**. Below it a small muted subtitle table label **"Bàn 03"**. Right: an outlined pill button **"⎆ Đăng nhập"** (login). 

2. **Mini cart strip (sticky, only when cart has items).** A thin bar: `🛒 3 món · 105.000đ` on the left, a link **"Xem giỏ →"** on the right.

3. **Search bar.** Full-width rounded input, muted magnifier icon + placeholder **"Tìm món nhanh..."**.

4. **Category tabs (horizontal scroll).** Pills/labels: **Tất cả · Bánh Cuốn · Món Phụ · Đồ Uống · Combo**. Active tab **"Tất cả"** is orange text with an orange underline; others muted.

5. **COMBO section** (shown only on the "Tất cả" tab). Section label **"COMBO"**. Combo cards same shape as product cards: thumbnail, name (e.g. **"Combo Đầy Đặn"**), orange price **"42.000 đ"**, and an orange circular **`+`** button.

6. **MÓN LẺ (individual items) — product cards.** This is the core repeated component. Each card (full width, rounded, slate background):
   - **Left:** square food thumbnail (`~96px`, rounded), with a small circular heart (favourite) toggle in its top-right corner.
   - **Middle:** product **name** in bold (e.g. **"Bánh Cuốn Thịt"**), then a 2-line muted **description** (e.g. *"Bánh cuốn nhân thịt heo xay, hành phi"*).
   - **Right, stacked:** a **quantity stepper** — round outline **`–`**, the number (default **0**), round **orange-filled `+`**. Below the stepper, a **single-select "nhân" (filling) pill** (e.g. **"Hành phi"**) that turns solid orange when selected.
   - Render ~6–10 example cards with varied Vietnamese dish names (Bánh Cuốn Thịt, Bánh Cuốn Trứng, Chả Mỡ, Nem Chua, Canh Rau, Nước Mía, Trà Đá, etc.) and prices 10.000–55.000 đ.

7. **Order summary panel ("Tóm tắt đơn hàng").** A collapsible card showing the live cart:
   - Grouped lines **COMBO** and **MÓN LẺ**, each item row: name, stepper `– n +`, price, and a 🗑 delete icon. A muted **"Subtotal: 70.000 đ"** under the group.
   - A bold **"Tổng cộng:"** row with the orange total.
   - A **CANH (soup) block**: label **"CANH"**, two stepper rows **"Bát có rau" `– 1 +`** and **"Bát không rau" `– 0 +`** (the numbers are orange). If no soup is chosen this block shows a running/animated orange border + warning **"⚠ Bạn chưa chọn canh..."**.
   - A collapsible **"TỔNG SỐ MÓN (2 loại)"** table with columns **MÓN · NHÂN · SL · ĐƠN GIÁ · THÀNH TIỀN**.
   - A **"GHI CHÚ"** order-note textarea with a small **"✓ Đã lưu"** saved indicator.

8. **Fixed bottom checkout bar (orange).** Full-width orange bar pinned above the nav: a small round badge with the item count (e.g. **3**), centered bold white **"Thanh toán"**, and the total on the right **"70.000 đ"**. When soup is missing the bar is dimmed/disabled.

9. **Bottom navigation (shell, 5 tabs).** Icons + Vietnamese labels: **Menu** (active = orange, fork/knife icon with orange top indicator), **Đơn Hàng** (receipt), **Yêu Thích** (heart), **Theo Dõi** (location pin), **Cài Đặt** (gear). Inactive tabs muted.

### Overlay to include: Table confirm modal
A centered dark modal (`rounded-2xl`, slate `#161d29`):
- Title **"Xác nhận đặt hàng"**.
- An itemized list, each row `1× <name>` left, orange price right (e.g. `1× Bánh Cuốn Thịt … 50.000 đ`).
- Hairline divider, then bold **"Tổng cộng"** + big orange total.
- A textarea placeholder **"Ghi chú cho bếp (tuỳ chọn)"**.
- Two buttons at the bottom: outlined **"Hủy"** (cancel) on the left, solid-orange **"Đặt hàng"** (place order) on the right.

### Notes
- Everything is dark-mode; the only bright color is the orange accent. Keep it calm and high-contrast.
- Make the product card and the bottom checkout bar pixel-faithful — they are the signature elements.
- Use placeholder/emoji food thumbnails if no images are available.

## (end prompt)

---

### Reference screenshots (real app, iPhone 390×844, captured 2026-06-20)
- Whole page: `screenshots/menu_full_real.png`
- Header: `screenshots/menuheader_real.png`
- Product card: `screenshots/productcard_real.png`
- Order summary: `screenshots/ordersummary_real.png`
- Confirm modal: `screenshots/tableconfirmmodal_real.png`

> Source of truth for behaviour (not visuals): [`customer_menu.md`](customer_menu.md) ·
> visual diff doc-vs-code: [`COMPARISON_VISUAL_MOCKUP_VI.md`](COMPARISON_VISUAL_MOCKUP_VI.md).
</content>
</invoke>
