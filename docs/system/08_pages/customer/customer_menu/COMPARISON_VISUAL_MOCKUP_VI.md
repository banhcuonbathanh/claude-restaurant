# Customer Menu — Mockup Trực Quan: Doc vs. Code vs. Đề Xuất Sửa + Feedback

> **Quy trình:** mỗi zone có **① Doc/Mockup · ② Code render thật (ASCII) · ③ Đề xuất sửa**, kèm
> **📷 Ảnh chụp thật** và **💬 Feedback của bạn**. Bạn điền feedback vào ô đó → tôi chỉnh sửa theo.
>
> **Trạng thái ảnh chụp thật:** ✅ ĐÃ CHỤP (2026-06-20). Chụp từ app thật chạy qua `docker compose`
> (full stack), bằng Playwright (`e2e/tests/capture-menu-zones.spec.ts`), viewport iPhone 390×844, luồng
> QR thật (`/table/<token>` → `/menu`, tableId được set). Ảnh lưu ở `./screenshots/<zone>_real.png`.
> Toàn cảnh trang: [`screenshots/menu_full_real.png`](./screenshots/menu_full_real.png).
> Ngày: 2026-06-20. File này chỉ đọc — không sửa code/doc app.

> ⚠️ **THIẾT KẾ MỚI:** Cột ① (Doc/Mockup) trong file này đã được cập nhật theo thiết kế mới từ `DESIGN_PROMPT.md`. Code FE thực tế vẫn dùng thiết kế cũ — ảnh `screenshots/*.png` phản ánh thiết kế cũ, KHÔNG dùng làm tham chiếu cho các zone đã thay đổi (Header, Category Tabs, Favourites Rail, Combo Cards, Checkout Control, "Gọi thêm", Order Note). Code pending rebuild cho các zone đó.

---

## 🔴 Zone A — Header

Nguồn code: `MenuHeader.tsx:11,28-43` · **Code chờ rebuild theo thiết kế mới**

### ① Mockup thiết kế MỚI (`DESIGN_PROMPT.md §1`)
```
┌────────────────────────────────────────────────┐
│ [===== ảnh bìa quán (~196px) =================] │  ◀── photo banner, dark gradient overlay
│                                                 │
│           Quán Bánh Cuốn                        │  ◀── Playfair Display, white, text-shadow
│       (căn giữa, trên ảnh bìa)                 │
└────────────────────────────────────────────────┘
   • KHÔNG có pill bar bên dưới banner
   • KHÔNG có nhãn bàn trong header
   • KHÔNG có nút đăng nhập/đăng xuất trong header
   • Pill "Bàn 04" sống trong header của order-summary panel (có spinning orange ring)
```

### ② Code render THẬT (thiết kế cũ — GAP)
```
┌────────────────────────────────────────────────┐
│ Quán Bánh Cuốn                  ┌────────────┐  │  ◀── useSettingsStore().tableLabel
│ Bàn 03   ← subtitle (xám, nhỏ)  │ ⎆ Đăng nhập │  │      (KHÔNG phải cart.tableName)
│                                 └────────────┘  │  ◀── nút từ useAuthStore (đăng nhập/đăng xuất)
└────────────────────────────────────────────────┘
   [── pill bar ──────────────────────────────────]   ◀── pill bar dưới banner (thiết kế cũ)
   • tableLabel nằm DƯỚI tên quán (subtitle), không nằm bên phải
   • Có user → "⎆ Đăng xuất" · chưa có → "⎆ Đăng nhập"
```

### ③ Đề xuất sửa (rebuild header theo thiết kế mới)
```
Rebuild MenuHeader thành photo banner thuần túy:
  • Cover image ~196px với dark gradient overlay (transparent → rgba(8,11,18,0.92))
  • "Quán Bánh Cuốn" căn giữa, Playfair Display, white, soft text-shadow
  • Xóa pill bar, xóa nhãn bàn, xóa nút đăng nhập khỏi header
  • Pill "Bàn 04" + spinning orange ring → chuyển vào order-summary header (Zone I)
```

| 📷 Ảnh chụp thật (thiết kế cũ) | 💬 Feedback của bạn |
|---|---|
| ![MenuHeader thật](./screenshots/menuheader_real.png)<br>⚠ Ảnh này phản ánh **thiết kế cũ** — có pill bar + nút đăng nhập. Không dùng làm tham chiếu cho thiết kế mới. | |

---

## 🔴 Zone F — ProductCard (chọn nhân)

Nguồn code: `ProductCard.tsx:104-148` · `ToppingModal.tsx` = 0 import (chết) · **Code chờ rebuild (nhân rules thiết kế mới)**

### ① Mockup thiết kế MỚI (`DESIGN_PROMPT.md §6`)
```
┌─────────────────────────────────────────────┐
│ [♡][img]  Bánh Cuốn Thịt      4.000đ         │  ◀── heart toggle top-right của thumbnail
│           mô tả ngắn...    [–] n [+]          │  ◀── stepper inline
│                          ( Nhân thịt )        │  ◀── pill nhân single-select (cam khi chọn)
│                          ( Nhân thịt mộc nhĩ )│
└─────────────────────────────────────────────┘
   Nhân rules thiết kế mới:
   • Bánh cuốn & trứng: pill nhân SINGLE-select ("Nhân thịt" / "Nhân thịt mộc nhĩ")
   • Bánh Chay, Giò, Canh: KHÔNG có pill nhân
   • Canh: giá "0 đ"
   • Mỗi product card đều có heart toggle (favourite) ở góc thumbnail
   • ToppingModal.tsx = CODE CHẾT (0 import) → xoá ở task dọn code
```

### ② Code render THẬT — KHÔNG có modal, pill inline trên thẻ
```
┌─────────────────────────────────────────────┐
│ [img]  Bánh cuốn               35.000đ       │
│        mô tả ngắn...        ┌───┐      ┌───┐  │
│                            │ – │  2   │ + │  │  ◀── stepper SL ngay trên thẻ
│                            └───┘      └───┘  │
│                            ( nhân thịt  )    │  ◀── pill nhân (single-select)
│                            ( nhân mộc nhĩ)   │      tô cam khi chọn
└─────────────────────────────────────────────┘
   • Không có ToppingModal nào được mở (file đó 0 import → code chết)
   • Nhân = pill data-driven từ product.toppings (ProductCard.tsx:131-147)
   • Thiếu: heart toggle, giá 0 đ cho canh
```

### ③ Đề xuất sửa (rebuild theo thiết kế mới)
```
┌─────────────────────────────────────────────┐
│ [♡][img]  Bánh Cuốn Thịt  4.000đ  [–] n [+]  │
│           mô tả...  ( Nhân thịt )(Nhân mộc nhĩ)│  ◀── pill inline, single-select
└─────────────────────────────────────────────┘
   • Thêm heart toggle vào mọi product card.
   • Bỏ khối "▢ ToppingModal" khỏi luồng E/F.
   • Ghi: ToppingModal.tsx là CODE CHẾT (0 import) → xoá ở task dọn code.
   • Bánh Chay / Giò / Canh: không có pill nhân. Canh: giá "0 đ".
```

| 📷 Ảnh chụp thật (thiết kế cũ) | 💬 Feedback của bạn |
|---|---|
| ![ProductCard thật](./screenshots/productcard_real.png)<br>⚠ Ảnh phản ánh thiết kế cũ — có pill nhân inline + stepper, KHÔNG có ToppingModal, nhưng thiếu heart toggle. |  |

---

---

## 🔴 Zone B — Category Tabs (Scroll-Spy Sticky Nav)

Nguồn code: _(chưa có component scroll-spy — code pending rebuild)_ · **Code chờ rebuild**

### ① Mockup thiết kế MỚI (`DESIGN_PROMPT.md §3`)
```
┌─────────────────────────────────────────────────────────────────┐
│ [ Tất cả ] [ Suất ] [ Trứng ] [ Bánh Cuốn ] [ Giò ] [ Canh ]  │  ◀── sticky, horizontally scrollable
│              ▔▔▔▔▔                                              │  ◀── "Suất" = active: orange text
│              orange glow                                         │       + orange underline + glow
└─────────────────────────────────────────────────────────────────┘
   • Đây là navigation anchors, KHÔNG phải filters
   • Tất cả sections luôn render (không ẩn/hiện)
   • Tap tab → smooth scroll đến section đó
   • Scroll page → tab của section trong view tự được highlight (scroll-spy)
   • Sticky: giữ nguyên vị trí khi scroll xuống
```

### ② Code render THẬT (thiết kế cũ — GAP)
```
┌─────────────────────────────────────────────────────────────────┐
│ [ Tất cả ] [ Suất ] [ Trứng ] [ Bánh Cuốn ] [ Giò ] [ Canh ]  │  ◀── filter tabs (show/hide)
└─────────────────────────────────────────────────────────────────┘
   • Tabs là filters: tap tab → ẩn các section khác, chỉ render section đó
   • Không có scroll-spy (scroll không tự highlight tab)
   • Không sticky (hoặc sticky nhưng không có scroll-spy behavior)
```

### ③ Đề xuất sửa (rebuild theo thiết kế mới)
```
   • Chuyển từ filter tabs sang scroll-spy sticky nav
   • Tất cả sections luôn render (bỏ filter logic)
   • Thêm IntersectionObserver hoặc scroll event để highlight tab theo scroll
   • Active style: orange text + orange underline + soft orange glow
```

| 📷 Ảnh chụp thật (thiết kế cũ) | 💬 Feedback của bạn |
|---|---|
| _(chưa chụp riêng cho tabs)_ | |

---

## ✅ Zone C — Favourites Rail (YÊU THÍCH)

Nguồn code: `FavouritesRail.tsx` · `store/favourites.ts` · **3 fixes đã áp (GAP-7-FAV)**

### ① Mockup thiết kế MỚI (`DESIGN_PROMPT.md §4`)
```
♥ YÊU THÍCH
┌────────┐ ┌────────┐ ┌────────┐
│ [♥][img]│ │ [♥][img]│ │ [♥][img]│   ◀── horizontal scroll rail
│ Suất Giò│ │ Bánh   │ │ Suất   │
│ 25.000đ │ │ Chay   │ │ Đầy Đủ │
└────────┘ └────────┘ └────────┘
   • Chỉ render khi có ≥1 item được favourite
   • Rail ẩn hoàn toàn khi 0 item favourite
   • Compact card: thumbnail nhỏ + filled orange heart ♥ ở góc + tên + giá
   • Tap card → mở detail của item đó
   • Tap heart ♥ trên card → un-favourite, xóa khỏi rail
   • Combo + product đều có thể xuất hiện trong rail
   • Favourites lưu local, tách biệt khỏi cart state
```

### ② Code render THẬT (sau GAP-7-FAV fixes)
```
   FavouritesRail.tsx ĐÃ TỒN TẠI — 3 điểm lệch đã được sửa:
   • Tap card: product → /menu/product/${id}, combo → /menu/combo/${id}
     (trước: cả hai link /menu/favourites — fixed)
   • Heart icon: fill-primary text-primary (cam, token đúng)
     (trước: fill-red-500 text-red-500 — fixed)
   • Section label: <Heart size={12} className="fill-primary text-primary" /> + "Yêu thích"
     (trước: chỉ text — fixed)
   • Rail ẩn khi searching (đúng spec); hiện bất kể section (scroll-spy)
   • Auto ẩn khi 0 favourites (return null — đúng)
   Note: heart trên ProductCard/ComboCard/ProductGridCard vẫn đỏ → deferred GAP-8
```

### ③ Trạng thái sau fix
```
   ✅ Tap card → detail item (product/combo route đúng)
   ✅ Orange heart (fill-primary) trên fav card
   ✅ Label "YÊU THÍCH" có small heart icon cam
   ⏸ Heart trên card-list (ProductCard/ComboCard/ProductGridCard) → GAP-8
```

| 📷 Ảnh chụp thật | 💬 Feedback của bạn |
|---|---|
| _(cần rebuild + docker compose up -d --build fe để chụp thiết kế mới)_ | |

---

## 🔴 Zone E — Combo (Suất) Cards

Nguồn code: `ComboCard.tsx` · **Code chờ rebuild (heart + nhân multi-select)**

### ① Mockup thiết kế MỚI (`DESIGN_PROMPT.md §5`)
```
SUẤT
┌─────────────────────────────────────────────────┐
│ [♡][img]  Suất Đầy Đủ Trứng Chín    [–] 1 [+]  │  ◀── heart ở góc thumbnail, stepper bên phải
│           1 bánh trứng chín + 3 bánh cuốn...    │  ◀── mô tả ngắn
│           30.000 đ                               │  ◀── giá orange
│                          ┌──────────────────┐   │
│                          │(Nhân thịt)(Nhân   │   │  ◀── nhân MULTI-select pill group
│                          │ thịt mộc nhĩ    )│   │      cả hai = solid orange by default
│                          └──────────────────┘   │      bắt buộc ≥1 luôn selected
└─────────────────────────────────────────────────┘
   Các suất thật:
   • Suất Đầy Đủ Trứng Tái — 30.000 đ
   • Suất Đầy Đủ Trứng Chín — 30.000 đ
   • Suất Giò — 25.000 đ
   • Suất Trứng Tái — 25.000 đ
   • Suất Trứng Chín — 25.000 đ
```

### ② Code render THẬT (thiết kế cũ — GAP)
```
┌─────────────────────────────────────────────────┐
│ [img]  Suất Đầy Đủ Trứng Chín     [–] 1 [+]    │  ◀── không có heart toggle
│        mô tả...                                  │
│        30.000đ                                   │
└─────────────────────────────────────────────────┘
   • Combo card KHÔNG có heart toggle (favourite)
   • Combo card KHÔNG có nhân pill group
   • Người dùng không thể chọn nhân cho suất
```

### ③ Đề xuất sửa (rebuild theo thiết kế mới)
```
   • Thêm heart toggle (favourite) vào góc thumbnail của combo card
   • Thêm nhân MULTI-select pill group bên dưới stepper
     - "Nhân thịt" và "Nhân thịt mộc nhĩ"
     - Mặc định cả hai selected (solid orange)
     - Không cho phép deselect cái cuối cùng
   • Nhân của suất flow vào cart và order summary như nhân của product
```

| 📷 Ảnh chụp thật (thiết kế cũ) | 💬 Feedback của bạn |
|---|---|
| _(xem [menu_full_real.png](./screenshots/menu_full_real.png) — combo section)_<br>⚠ Ảnh phản ánh thiết kế cũ — không có heart, không có nhân pills. | |

---

## 🔴 Zone J — Checkout Control (Floating Pill Buttons)

Nguồn code: _(checkout bar component)_ · **Code chờ rebuild (bottom bar → floating pills)**

### ① Mockup thiết kế MỚI (`DESIGN_PROMPT.md §8`)
```
                              ┌──────────┐
                              │ 🛒  [13] │  ◀── cart pill + round orange count badge (13 = Bàn 04)
                              └──────────┘
                              ┌──────────┐
                              │ Thanh toán│  ◀── solid orange pill
                              └──────────┘
   Vị trí: pinned bottom-right, bên trên bottom nav
   • Chỉ hiện khi giỏ hàng có món (cart non-empty)
   • Tap cart pill → scroll đến order summary
   • Tap "Thanh toán" → mở confirm modal
   • "Thanh toán" DIM/disabled khi chưa chọn canh
   • KHÔNG hiển thị tổng tiền trên button nào
   • Count badge = 13 cho ví dụ Bàn 04 (tổng số lượng tất cả món)
```

### ② Code render THẬT (thiết kế cũ — GAP)
```
┌────────────────────────────────────────────────────────────────┐
│ 🛒 3 món               Thanh toán         105.000đ            │  ◀── full-width orange bottom bar
└────────────────────────────────────────────────────────────────┘
   • Full-width bar (không phải floating pills)
   • Hiển thị tổng tiền trên bar
   • Hiển thị số món (không phải badge riêng)
```

### ③ Đề xuất sửa (rebuild theo thiết kế mới)
```
   • Thay full-width bottom bar bằng 2 floating pill buttons pinned bottom-right
   • Cart pill: 🛒 icon + round orange count badge
   • Thanh toán pill: solid orange, tap → confirm modal
   • Bỏ total tiền khỏi checkout control
   • Dim "Thanh toán" khi thiếu canh
```

| 📷 Ảnh chụp thật (thiết kế cũ) | 💬 Feedback của bạn |
|---|---|
| _(xem [menu_full_real.png](./screenshots/menu_full_real.png) — bottom bar)_<br>⚠ Ảnh phản ánh thiết kế cũ — full-width bar với tổng tiền. | |

---

## 🔴 Zone I — OrderSummary

Nguồn code: `OrderSummary.tsx:140-309` · **Code chờ rebuild (Bàn pill + spinning ring + order note pre-fill + bỏ "Gọi thêm")**

### ① Mockup thiết kế MỚI (`DESIGN_PROMPT.md §7`)
```
┌─ Tóm tắt đơn hàng   ◉Bàn 04◉  ⌄ Ẩn ──────┐  ◀── "Bàn 04" pill + spinning orange light ring
│                   (spinning orange ring)    │      header bấm để thu/mở
│                                            │
│ COMBO                       Σ 80.000đ      │  ◀── nhóm, mỗi món có [–] n [+] 🗑
│  Suất Đầy Đủ Trứng Chín [–]1[+] 30.000đ 🗑 ⌄│      ⌄ Chi tiết mở rộng món con
│    Nhân thịt · Mộc nhĩ  (orange caption)   │
│    > Bánh Trứng Chín ×1 · Bánh Cuốn ×3... │
│  Suất Giò           [–]2[+] 50.000đ 🗑 ⌄   │
│    Nhân thịt · Mộc nhĩ  (orange caption)   │
│ MÓN LẺ                      Σ 23.000đ      │
│  Bánh Trứng Vàng    [–]2[+] 18.000đ 🗑     │
│    Nhân thịt  (orange caption)              │
│  Bánh Chay          [–]2[+]  5.000đ 🗑     │
│  Canh có rau        [–]4[+]  0 đ   🗑     │
│  Canh không rau     [–]2[+]  0 đ   🗑     │
│ ─────────────────────────────             │
│ Tổng cộng:                 103.000đ        │
│ ┌─ CANH ───────────────────────────────┐  │  ◀── viền chạy 🔴 nếu thiếu canh
│ │ Bát có rau      [–] 4 [+]             │  │
│ │ Bát không rau   [–] 2 [+]             │  │
│ └──────────────────────────────────────┘  │
│ TỔNG SỐ MÓN (7 loại)           ⌄ Hiện     │  ◀── bảng tổng hợp thu gọn được
│  MÓN            NHÂN      SL  ĐƠN GIÁ    │
│  Bánh Trứng Chín thịt·mộc ×1  9.000đ     │
│  Bánh Cuốn       thịt·mộc ×11 4.000đ     │
│  Giò             —        ×3  9.000đ     │
│  Canh có rau     —        ×7  0 đ        │
│  Bánh Trứng Vàng thịt     ×2  9.000đ     │
│  Bánh Chay       —        ×2  2.500đ     │
│  Canh không rau  —        ×2  0 đ        │
│ ─────────────────────────────             │
│ GHI CHÚ                    ✓ Đã lưu       │  ◀── lưu có debounce
│ [Gia đình (mẹ + 2 người lớn + 2 trẻ)]    │  ◀── pre-filled mặc định
└────────────────────────────────────────────┘
   • KHÔNG có badge "Gọi thêm" ở bất kỳ đâu
   • Ví dụ Bàn 04: 13 món tổng, badge cart count = 13
```

### ② Code render THẬT (thiết kế cũ — GAP)
```
┌─ Tóm tắt đơn hàng        [Bàn 03]   ⌄ Ẩn ─┐  ◀── header bấm để thu/mở (collapse)
│                                            │
│ COMBO                       Σ 42.000đ      │  ◀── nhóm, mỗi món có [–] n [+] 🗑
│   Combo Đầy Đặn   [–] 1 [+]  🗑   ⌄        │      combo mở rộng xem món con
│ MÓN LẺ                      Σ 35.000đ      │
│   Bánh cuốn thịt  [–] 1 [+]  🗑            │
│ ─────────────────────────────             │
│ Tổng cộng:                  77.000đ        │
│ ┌─ CANH ───────────────────────────────┐  │  ◀── viền chạy 🔴 nếu thiếu canh
│ │ ⚠ Bạn chưa chọn canh...               │  │
│ │ Bát có rau      [–] 0 [+]             │  │  ◀── stepper canh (ghi canh_* item)
│ │ Bát không rau   [–] 0 [+]             │  │
│ └──────────────────────────────────────┘  │
│ Tổng số món (2 loại)            ⌄ Hiện     │  ◀── bảng tổng hợp thu gọn được
│   Món          Nhân  SL  Đơn giá Thành tiền│
│   Bánh cuốn    thịt  ×1  35.000đ  35.000đ  │
│ ─────────────────────────────             │
│ Ghi chú            ✓ Đã lưu                │  ◀── lưu có debounce, hiện "Đã lưu"
│ [____________________________]            │  ◀── trống (không pre-filled)
└────────────────────────────────────────────┘
   GAP so với thiết kế mới:
   • "Bàn 03" pill: pill đơn giản, không có spinning orange ring
   • Badge "Gọi thêm" có thể xuất hiện (cần kiểm tra)
   • Ghi chú trống (chưa pre-filled)
   • Pill bàn vẫn nằm trong header của panel, nhưng chưa có spinning animation
```

### ③ Đề xuất sửa (rebuild theo thiết kế mới)
```
   • Thêm spinning orange light ring vào pill "Bàn 04" trong header panel
   • Xóa badge "Gọi thêm" khỏi order summary
   • Pre-fill textarea ghi chú: "Gia đình (mẹ + 2 người lớn + 2 trẻ)"
   • Cập nhật worked example theo Bàn 04 (103.000đ, 7 loại, cart badge = 13)
```

| 📷 Ảnh chụp thật (thiết kế cũ) | 💬 Feedback của bạn |
|---|---|
| ![OrderSummary thật](./screenshots/ordersummary_real.png)<br>⚠ Ảnh phản ánh thiết kế cũ. Thiết kế mới: spinning orange ring, bỏ "Gọi thêm", ghi chú pre-filled, worked example Bàn 04 103.000đ. |  |

---

## 🔴 TableConfirmModal (luồng QR)

Nguồn code: `TableConfirmModal.tsx:48-101`

### ① Doc đang vẽ (`customer_menu.md:206-210`)
```
┌─ Xác nhận đơn Bàn 03 ────────────────┐
│ 3 món · 105.000đ                      │
│        [Hủy]   [Xác nhận gọi món]    │
└──────────────────────────────────────┘
   confirm ──▶ POST /orders
   201 ⇒ setActiveOrderId(id) → clearCart() → router.replace('/order/<id>')
```

### ② Code render + hành vi THẬT
```
┌─ Xác nhận đặt hàng ──────────────────┐   ◀── tiêu đề: "Xác nhận đặt hàng" (không có "Bàn 03")
│ 2× Bánh cuốn thịt          70.000đ    │
│ 1× Canh mọc                10.000đ    │
│ ─────────────────────────────        │
│ Tổng cộng                  80.000đ    │
│ ┌──────────────────────────────────┐ │   ◀── textarea ghi chú (LOCAL state, không phải store.orderNote)
│ │ Ghi chú cho bếp (tuỳ chọn)       │ │
│ └──────────────────────────────────┘ │
│      [ Hủy ]      [ Đặt hàng ]       │   ◀── nút: "Đặt hàng" (đang gửi → "Đang đặt...")
└──────────────────────────────────────┘
   201 ⇒ (lưu order_cache_<id>) → clearCart() → router.replace('/order/<id>')
   ❌ KHÔNG gọi setActiveOrderId — clearCart() reset activeOrderId về null
```

### ③ Đề xuất sửa doc
```
┌─ Xác nhận đặt hàng ──────────────────┐
│ <list món>            <tiền>          │
│ Tổng cộng             <tổng>          │
│ [ Ghi chú cho bếp (tuỳ chọn) ]       │  ← note CỤC BỘ, không đọc store.orderNote
│      [ Hủy ]      [ Đặt hàng ]       │
└──────────────────────────────────────┘
   201 ⇒ ① lưu order_cache_<id> → ② clearCart() → ③ router.replace('/order/<id>')
   FLAG 🔴: BỎ "setActiveOrderId(id)" — nó KHÔNG được gọi ở đây.
            activeOrderId chỉ được set sau, khi bấm "Theo dõi" ở /order/<id>.
```

| 📷 Ảnh chụp thật | 💬 Feedback của bạn |
|---|---|
| ![TableConfirmModal thật](./screenshots/tableconfirmmodal_real.png)<br>⚠ **Bằng chứng:** tiêu đề "Xác nhận đặt hàng" (không có "Bàn 03"), có textarea "Ghi chú cho bếp (tuỳ chọn)", nút "Hủy" / "Đặt hàng" (không phải "Xác nhận gọi món"). |  |

---

## Tổng hợp việc cần làm (từ các mockup trên)

| Zone | Sửa doc/mockup | Sửa code (đăng ký MASTER trước) |
|---|---|---|
| Zone A — Header | ✅ Mockup ① cập nhật theo thiết kế mới | 🔴 Rebuild: photo banner + Playfair title, bỏ pill bar + login dưới banner |
| Zone B — Category Tabs | ✅ Mockup ① cập nhật theo thiết kế mới | 🔴 Rebuild: scroll-spy sticky nav, tất cả sections luôn render |
| Zone C — Favourites Rail | ✅ Mockup ① + ② cập nhật sau GAP-7-FAV | ✅ Component ĐÃ TỒN TẠI; 3 fixes đã áp (tap→detail, orange heart, label heart) |
| Zone E — Combo Cards | ✅ Mockup ① cập nhật theo thiết kế mới | 🔴 Rebuild: thêm heart toggle + nhân multi-select pills cho ComboCard |
| Zone F — ProductCard | ✅ Mockup ① cập nhật (nhân rules mới + heart) | 🔴 Rebuild: thêm heart toggle; nhân rules: single-select cho bánh cuốn/trứng, không có nhân cho Bánh Chay/Giò/Canh |
| Zone I — OrderSummary | ✅ Mockup ① cập nhật (spinning ring + no "Gọi thêm" + pre-fill + Bàn 04 example) | 🔴 Rebuild: spinning orange ring trên pill bàn, xóa "Gọi thêm", pre-fill ghi chú |
| Zone J — Checkout Control | ✅ Mockup ① mô tả floating pills | 🔴 Rebuild: thay full-width bar bằng 2 floating pill buttons |
| TableConfirmModal | Sửa tiêu đề/nút, thêm note, bỏ `setActiveOrderId` | — |
| ProductCard (dead code) | — | 🔴 Xoá `ToppingModal.tsx` chết (0 import) |

> Theo `CLAUDE.md`: phần sửa doc gộp 1 task; mỗi sửa code phải có dòng trong `MASTER_TASK.md` trước.
> Ảnh `screenshots/*.png` phản ánh thiết kế cũ — không dùng làm tham chiếu cho các zone đã thay đổi.
> Muốn ảnh chụp thiết kế mới (Playwright) thì cần rebuild code trước + `docker compose up -d --build fe`.
