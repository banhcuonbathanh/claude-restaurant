# Customer Menu — So Sánh Chi Tiết Tài Liệu vs. Code (5 Mảng)

> **Phạm vi:** rà soát sâu bộ tài liệu `customer_menu` so với code thật của trang `/menu` theo 5 trục:
> (1) giao diện component · (2) luồng dữ liệu cross-component (Zustand) · (3) luồng dữ liệu cross-page
> (Zustand) · (4) hành vi loading · (5) mô hình dữ liệu FE⇄BE. **Chỉ đọc — KHÔNG sửa code/tài liệu.**
> Thực hiện bởi 4 sub-agent Sonnet chạy song song; các mục 🔴 đã được **tự tay kiểm chứng lại** (kèm grep/file:line).
> Loại trừ khỏi Mảng 1 theo yêu cầu: `DrinkCustomize`, `OrderNote`.
> Ngày: 2026-06-20.

> ⚠️ **CẬP NHẬT THIẾT KẾ (2026-06-23):** Tài liệu so sánh này giờ dùng **DESIGN_PROMPT.md** (thiết kế mới) làm phía spec/tài liệu. Code FE thực tế vẫn dùng thiết kế cũ — tất cả các zone đã thay đổi bên dưới là **GAP cần code xây lại (pending rebuild).**

---

## Tóm Tắt Điều Hành

| Mảng | Kết luận | 🔴 | 🟡 | 🟢 |
|---|---|---|---|---|
| 1 · Giao diện component | **8 zone là gap cần xây lại** (thiết kế mới vs code cũ) — spec là DESIGN_PROMPT.md | 7 | 1 | 1 |
| 2 · Luồng cross-component | Xây lại header giải quyết gap nguồn dữ liệu; còn 1 điểm thiếu về ghi chú | 1 | 1 | nhiều ✅ |
| 3 · Luồng cross-page | Luồng lớn đúng; handoff 201 sai; đồng bộ QR→header được giải quyết khi xây lại | 1 | 1 | nhiều ✅ |
| 4 · Loading | **Gần như hoàn hảo** — chỉ 2 lỗi cosmetic | 0 | 0 | 2 |
| 5 · Mô hình FE⇄BE | Chính xác; flags còn đúng; 3 điểm thừa chưa ghi | 0 | 6 | vài ✅ |

**🔴 CÁC GAP CẦN XÂY LẠI THEO THIẾT KẾ MỚI (code phải đóng — spec = DESIGN_PROMPT.md):**
1. **Xây lại Header:** bỏ pill bar, nút đăng nhập, nhãn bàn khỏi MenuHeader; thay bằng ảnh banner + tiêu đề Playfair. Di chuyển pill "Bàn 04" (vòng sáng cam xoay) vào header của OrderSummary.
2. **Category tabs → scroll-spy nav:** thay filter tabs bằng sticky scroll-spy anchor nav; tất cả section luôn render; IntersectionObserver điều khiển highlight active.
3. **ComboCard nhân multi-select:** chuyển pill nhân combo từ single-select sang multi-select (cả hai mặc định được chọn, phải chọn ≥1).
4. **Thiết kế lại nút checkout:** thay CartBottomBar full-width (có tổng tiền) bằng hai nút pill nổi xếp chồng (pill giỏ hàng + pill "Thanh toán", không hiện tổng).
5. **Bỏ badge "Gọi thêm"** khỏi OrderSummary.
6. **Pre-fill GHI CHÚ** với "Gia đình (mẹ + 2 người lớn + 2 trẻ)".
7. **FavouritesRail:** ✅ đã giải quyết (GAP-7-FAV) — rail đã tồn tại; 3 fixes đã áp: tap thẻ → detail món, heart cam, label có heart icon. Lưu ý: heart color trên ProductCard/ComboCard/ProductGridCard deferred sang GAP-8.
8. **Ví dụ minh hoạ:** cập nhật thành đơn gia đình Bàn 04 (tổng 103.000 đ, badge = 13).

**🔴 CÁC VẤN ĐỀ TÀI LIỆU/CODE CŨ (vẫn còn hiệu lực, giữ lại):**
- **`TableConfirmModal` KHÔNG gọi `setActiveOrderId` khi thành công.** Nó chỉ `clearCart()` + `router.replace()` (`TableConfirmModal.tsx:48-50`). Câu `customer_menu.md:210` ("201 ⇒ setActiveOrderId(id) → clearCart() → router.replace") là **sai thực tế**. Sau `clearCart()`, `activeOrderId` bị reset về `null`.
- **Luồng `ToppingModal` được tài liệu mô tả KHÔNG tồn tại.** File `ToppingModal.tsx` có **0 import** (code chết). Nhân của món lẻ chọn bằng **pill inline** ngay trên `ProductCard`/`ProductGridCard`. Khối "▢ ToppingModal (mở từ E/F)" trong tài liệu mô tả luồng chưa hề được nối dây.
- **`OrderSummary` nhiều hơn hẳn "preview + ghi chú".** Code render bộ đếm canh, bảng "Tổng số món" thu gọn được, bộ đếm số lượng theo nhóm, và ghi chú có trạng thái "Đã lưu" — không có gì trong số này nằm trong ASCII cũ của zone I.

**Component chết/không thể chạm tới (ngoài DrinkCustomize/OrderNote):**
- `ToppingModal` — 0 import (chết hoàn toàn).
- `ComboModal` — được `ComboCard` import & render nhưng `setModalOpen(true)` không bao giờ được gọi
  (`ComboCard.tsx:75,182` chỉ set `false`) → UI không thể mở.

---

## Mảng 1 — Giao Diện Component

**Kết luận:** thiết kế mới (DESIGN_PROMPT.md) là spec hiện tại. Code FE vẫn dùng thiết kế cũ cho 8 zone đã thay đổi — mỗi zone là gap cần xây lại. Các zone không đổi vẫn chính xác.

| Component | Spec MỚI (DESIGN_PROMPT.md) | Code CŨ thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| **MenuHeader** | Ảnh banner + tiêu đề Playfair "Quán Bánh Cuốn" — không pill bar, không nhãn bàn, không nút đăng nhập dưới banner; pill "Bàn 04" nằm trong header OrderSummary (vòng sáng cam xoay) | Ô phải = **nút đăng nhập/đăng xuất** (`useAuthStore`); nhãn bàn = subtitle từ `useSettingsStore().tableLabel` (`MenuHeader.tsx:11,28-30`); pill bar hiện dưới banner | 🔴 **GAP — code pending rebuild** | Bỏ nút đăng nhập và pill bar khỏi zone header; chuyển pill "Bàn 04" vào header OrderSummary với vòng conic-gradient xoay. |
| **CategoryTabs** | Sticky scroll-spy nav — tất cả section luôn render; bấm tab cuộn đến section đó; cuộn trang tự highlight tab đang trong tầm nhìn (chữ cam + gạch chân + glow); tabs: Tất cả · Suất · Trứng · Bánh Cuốn · Giò · Canh | **Filter tabs** — bấm ẩn/hiện nhóm sản phẩm; không phải scroll-spy; style active khác | 🔴 **GAP — code pending rebuild** | Thay logic filter tabs bằng scroll-spy anchor nav; đảm bảo tất cả section render cùng lúc; dùng IntersectionObserver cho auto-highlight. |
| **FavouritesRail (D)** | Hiện khi có ≥1 yêu thích bất kể tab nào; bấm thẻ mở chi tiết món đó | `FavouritesRail.tsx` **ĐÃ TỒN TẠI** (store `favourites.ts`, heart toggles trên card, wired trong `page.tsx`). Ba điểm lệch thiết kế mới nay ĐÃ ĐƯỢC SỬA: (1) tap thẻ → `/menu/product/${id}` · `/menu/combo/${id}` (trước là `/menu/favourites`); (2) heart đổi màu `fill-primary` (trước là `fill-red-500`); (3) label section có small Heart icon. Rail hiện bất kể section nào (scroll-spy); chỉ ẩn khi đang search (`!searching`), đúng spec — câu "ẩn khi chọn tab danh mục" là STALE (thời filter-tab cũ). | ✅ **đã giải quyết** | Ba fixes đã áp vào `FavouritesRail.tsx` (GAP-7-FAV). Heart trên `ProductCard`/`ComboCard`/`ProductGridCard` vẫn đỏ — deferred sang GAP-8 / global design-token pass. |
| **ComboCard (section SUẤT)** | Full product-card treatment — tim yêu thích + nhóm pill nhân MULTI-select ("Nhân thịt" / "Nhân thịt mộc nhĩ", cả hai bấm được, cả hai mặc định chọn, phải chọn ≥1); pill nhân single-select chỉ dành cho bánh-cuốn & trứng | Stepper `[–] qty [+]` + pill nhân inline + tim yêu thích; `ComboModal` được import nhưng **không mở được** (`ComboCard.tsx:139-183`; không gọi `setModalOpen(true)`); pill nhân combo là single-select | 🔴 **GAP — code pending rebuild** | Chuyển pill nhân combo sang multi-select (cả hai mặc định, bắt buộc ≥1); xoá `ComboModal` không dùng được; giữ single-select chỉ cho thẻ bánh-cuốn & trứng. |
| **CartBottomBar / Nút checkout** | HAI nút pill nổi xếp chồng góc dưới phải (pill giỏ hàng 🛒 + badge đếm cam tròn BÊN TRÊN pill cam "Thanh toán"); chỉ hiện khi giỏ có món; KHÔNG hiện tổng tiền; "Thanh toán" mờ khi thiếu canh | CartBottomBar full-width cam với badge đếm + "Thanh toán" + **TỔNG TIỀN** (`CartBottomBar.tsx:19-28`); dimmed vẫn gọi onCheckout để hiện warn-toast | 🔴 **GAP — code pending rebuild** | Thay CartBottomBar bằng hai nút pill nổi góc dưới phải; bỏ tổng tiền khỏi nút; giữ hành vi dim+warn-toast khi thiếu canh. |
| **Badge "Gọi thêm"** | LOẠI BỎ — không có badge "Gọi thêm" ở bất kỳ đâu trong order summary | Badge "Gọi thêm" được render trong order summary | 🔴 **GAP — code pending rebuild** | Xoá badge "Gọi thêm" khỏi OrderSummary. |
| **Pre-fill GHI CHÚ** | Textarea GHI CHÚ pre-filled với "Gia đình (mẹ + 2 người lớn + 2 trẻ)" | Textarea trống / không pre-fill | 🔴 **GAP — code pending rebuild** | Pre-fill textarea GHI CHÚ với "Gia đình (mẹ + 2 người lớn + 2 trẻ)". |
| **Ví dụ minh hoạ (đơn Bàn 04)** | COMBO = 1 Suất Đầy Đủ Trứng Chín + 2 Suất Giò (80.000 đ); MÓN LẺ = 2 Bánh Trứng Vàng + 2 Bánh Chay + 4 Canh có rau + 2 Canh không rau (23.000 đ); Tổng cộng 103.000 đ; badge đếm nổi = 13 | Ví dụ cũ dùng "Bàn 03" với bộ món và tổng tiền khác | 🟡 **GAP — tài liệu cập nhật theo ví dụ mới** | Cập nhật tất cả tham chiếu ví dụ thành đơn gia đình Bàn 04; badge = 13; tổng = 103.000 đ. |
| **ProductCard / ProductGridCard** | (không đổi trong thiết kế mới) `[+]` mở **▢ ToppingModal** để chọn nhân (cũ) — pill inline mới là đúng | **Pill nhân inline** trên thẻ; `ToppingModal` không hề được import (`ProductCard.tsx:131-147`, `ProductGridCard.tsx:94-110`) | 🔴 | Bỏ ToppingModal khỏi luồng F; ghi pill inline. Đánh dấu ToppingModal là code chết. |
| **OrderSummary (I)** | (không đổi trong thiết kế mới) Tài liệu cũ: "Đơn của bạn (preview)" + ô ghi chú; rung nếu thiếu canh | "Tóm tắt đơn hàng" thu gọn được: nhóm COMBO/MÓN LẺ có stepper + xoá, **khu vực bộ đếm canh**, **bảng "Tổng số món"** (món×nhân×SL×giá), ghi chú có "Đã lưu" (`OrderSummary.tsx:140-310`) | 🔴 | Viết lại ASCII zone I: stepper, khu canh, bảng món, nút thu gọn. |
| **TableConfirmModal** | (không đổi) Tiêu đề "Xác nhận đặt hàng"; nút "Đặt hàng"; textarea "Ghi chú cho bếp"; thành công = chỉ `clearCart()`+`router.replace` | Tài liệu cũ ghi tiêu đề "Xác nhận đơn Bàn 03" và nút "Xác nhận gọi món" — code hiện đã đúng | 🔴(chữ)🟡 | Code đã đúng — cập nhật tài liệu cũ; bỏ câu `setActiveOrderId` khỏi docs. |
| **MiniCartStrip** | (không đổi) `🛒 3 món · 105.000đ [Xem giỏ →]` | Hàng chip tên món cuộn ngang giữa số đếm và tổng; cả thanh là một vùng bấm; không có 🛒, không có "Xem giỏ →" (`MiniCartStrip.tsx:18-38`) | 🟡 | Vẽ lại với hàng chip; bỏ nhãn nút. |
| **CartDrawer** | (không đổi) Tiêu đề + món `[–]qty[+] 🗑` + tổng + `[Thanh toán]` | Thêm: subtitle tên/bàn, nút "Xem đơn hàng" (khi có `activeOrderId`), danh sách combo thu gọn được, footer "Tiếp tục chọn món", biến thể nút "Thêm vào đơn hàng" (`CartDrawer.tsx:73-229`) | 🟡 | Mở rộng ASCII drawer với các trạng thái này. |
| **AddToOrderBanner** | (không đổi) `▸ Đang thêm món vào đơn #123 [Xem đơn]` | Chữ "Chọn món để thêm vào đơn hàng hiện tại" + icon PlusCircle; không hiện id đơn (`AddToOrderBanner.tsx:14-16`) | 🟡 | Cập nhật chữ banner. |
| **Vị trí error/empty của page** | (không đổi) ngụ ý nằm trong ProductList | Render ở **cấp page**; `OrderSummary` render **bất kể** error/loading (`page.tsx:144-183`); chữ lỗi "⚠ Kết nối mạng yếu" | 🟡 | Ghi chú OrderSummary luôn hiện; sửa chữ lỗi. |
| **SearchBar** | (không đổi) Placeholder `🔍 Tìm món...` | "Tìm món nhanh..." (không emoji), nút xoá X, gợi ý 1-ký-tự "Nhập ít nhất 2 ký tự", debounce 300ms (`SearchBar.tsx:26,38-40`) | 🟢 | Cập nhật placeholder + ghi hint/clear/debounce. |

**Khớp đúng (không đổi theo thiết kế mới):** RestaurantBanner (ảnh banner), pill nhân inline ProductCard (single-select cho bánh-cuốn & trứng), OrderSummary nhóm COMBO/MÓN LẺ + bộ đếm canh + bảng "Tổng số món" + ghi chú "Đã lưu", ProductList (skeleton/grid/empty).

---

## Mảng 2 — Luồng Cross-Component (Zustand)

**Kết luận:** hình dạng store, tên action, công thức selector, cổng canh và quy tắc "không truyền props
giữa các zone" đều khớp chính xác. Một lỗi nặng (nguồn của MenuHeader) + một điểm thiếu về ghi chú.

| Chủ đề | Tài liệu nói | Code thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| Nguồn dữ liệu MenuHeader | Spec MỚI: không có nhãn bàn trong header — pill "Bàn 04" chỉ nằm trong header OrderSummary | Code CŨ đọc `useSettingsStore().tableLabel` (`MenuHeader.tsx:11`) cho subtitle; cart store không dùng trong header | 🔴 **GAP — code pending rebuild** | Bỏ toàn bộ logic nhãn bàn khỏi MenuHeader; hiện "Bàn 04" qua header OrderSummary. (`OrderSummary.tsx:47` đã đọc cart `tableName` — dùng lại đó.) |
| Ghi chú của TableConfirmModal | rút `orderNote` từ store | dùng `useState` **cục bộ** riêng; POST gửi `note: note.trim()\|\|null`; không đọc `orderNote` store (`TableConfirmModal.tsx:15-16,23`) | 🟡 | Tài liệu: luồng QR thu ghi chú riêng; `orderNote` store chỉ dùng ở luồng `/checkout` online. |
| `addItem` dedup, selector `total()`/`itemCount()`, chữ ký `setCanhQty`, danh sách field `clearCart`, builder duy nhất `buildOrderItemsPayload` cho cả 3 luồng POST, cổng canh `id.startsWith('canh_')` | như tài liệu | xác nhận tại `cart.ts:51-59,124-125,35/97,89` · `order-payload.ts` · `page.tsx:40` | 🟢 | Không cần làm — đều đúng. |

---

## Mảng 3 — Luồng Cross-Page (Zustand)

**Kết luận:** các luồng lớn (whitelist persist, quét order_cache, điều kiện dừng SSE, cô lập admin,
tái nhập add-to-order) đều chính xác. **Bước handoff khi thành công (201) ghi sai.**

| Chủ đề | Tài liệu nói | Code thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| Bước ghi ② của handoff 201 | `setActiveOrderId("<id>")` được đóng dấu khi thành công | **không gọi**; chỉ `clearCart()` (reset `activeOrderId`→null) + `router.replace` (`TableConfirmModal.tsx:48-50`; `checkout/page.tsx` tương tự) | 🔴 | Bỏ bước ② khỏi chuỗi/sơ đồ handoff. `activeOrderId` được set sau bởi nút "Theo dõi" (`order/[id]/page.tsx:564`). |
| Đồng bộ QR scan → MenuHeader | Spec MỚI: không có nhãn bàn trong header — "Bàn 04" hiện trong header OrderSummary, nên vấn đề không đồng bộ này được giải quyết khi xây lại | Code CŨ: `/table/[tableId]/page.tsx:31` ghi cart `tableName`, nhưng MenuHeader đọc `settings.tableLabel`; trang QR không gọi `setTableLabel` → nhãn bàn trống sau khi quét | 🔴 **GAP — giải quyết khi xây lại header** | Bỏ nhãn bàn khỏi MenuHeader loại bỏ vấn đề đồng bộ này. Đảm bảo `tableName` từ QR scan tới được pill "Bàn 04" trong header OrderSummary. |
| Nguồn dữ liệu `/tracking` | chỉ `useOrderMonitorSSE` | còn chạy `useQuery(GET /orders/:id)` làm nguồn snapshot; SSE vá delta (`tracking/page.tsx:21-34`) | 🟡 | Ghi chú nguồn kép. |
| partialize = `{orderNote, activeOrderId}`; items/tableId/tableName chỉ trong phiên; `order_cache_<id>` 3 nơi ghi; trang `/order` quét key cache; "Xoá lịch sử"; SSE dừng khi cancelled/completed; cô lập admin; tái nhập add-to-order; CART_CONFIG=`cart-config-v3` v5 | như tài liệu | xác nhận tại `cart.ts:153,129` · `storage-keys.ts:6` · `order/page.tsx` · `useOrderSSE.ts` · `order/[id]/page.tsx:575` | 🟢 | Không cần làm — đều đúng. |

---

## Mảng 4 — Hành Vi Loading

**Kết luận:** gần như hoàn hảo. Hai lỗi cosmetic của tài liệu, không lệch hành vi.

| Chủ đề | Tài liệu nói | Code thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| Thứ tự khai báo query | categories → all-products → combos → products | thực tế: categories(52) → all-products(59) → products(65) → combos(79) | 🟢 | Sắp lại bảng trong tài liệu (cosmetic). |
| Vị trí `min-h-[44px]` | trên div container lỗi | trên **nút `<Button>` Thử lại** (`page.tsx:147`), không phải wrapper | 🟢 | Ghi lại đúng chỗ. |
| staleTime 5p cả 4 · cổng search (0 hoặc ≥2) · chỉ products có isLoading/isError/refetch · chữ lỗi + nút · skeleton mobile 5×h-24 / desktop 8×aspect-square · 2 chữ empty + điều kiện · Suspense không fallback · combos ẩn tới khi có dữ liệu · categories/combos fail im về [] · hình spinner route | như tài liệu | đều xác nhận (`page.tsx:52-83,144-169,201-207`; `(shop)/loading.tsx`) | ✅ | Không cần làm. |

---

## Mảng 5 — Mô Hình Dữ Liệu FE⇄BE

**Kết luận:** các ma trận Object Model (§1–§6) và flags 1–4 chính xác và vẫn đúng. Phát hiện thêm 3
điểm thừa chưa ghi; cột `filling` được mô tả đúng là không tồn tại (016 thêm, 017 xoá).

| Object.Attr | Tài liệu nói | Code thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| Product.description / image_path | BE NULL→`""`; FE `string\|null` (Flag 2) | `enrichProduct` trả `""` (`product_service.go:628-635`); FE check `=== null` không bao giờ khớp | 🟡 | Đổi type FE thành `string` (hoặc BE gửi `null` thật). |
| Combo.category_id / description / image_path | cùng kiểu lệch NULL→`""` (Flag 2) | `enrichCombo` gộp NULL→`""` (`product_service.go:663-675`) | 🟡 | Cùng cách sửa trên. |
| `buildImageURL` | tài liệu: "đường dẫn object, KHÔNG phải URL đầy đủ" | hàm có định nghĩa (`product_handler.go:32-37`) nhưng **không bao giờ được gọi** — gửi path thô | 🟡 | Code chết: gọi nó trong serializer (và sửa FE `<img>`) hoặc xoá. |
| Category.description / is_active | "gửi nhưng FE không khai type" (Flag 3) | BE gửi cả hai (`product_handler.go:183,186`); FE `Category` bỏ qua | 🟢 | Thêm field optional vào type FE nếu cần. |
| OrderItemPayload | `product_id,combo_id,quantity,topping_ids,note?,combo_items?` | khớp BE `createOrderItemReq` (`order_handler.go:33-40`); XOR ép tại 77-86; JSON null id → Go `""` | 🟢 | Đã khớp. |
| `note` cấp đơn null vs "" | chưa ghi | `TableConfirmModal` gửi `note: ...\|\|null`; Go ép null→`""` | 🟢 | Tuỳ chọn: ghi chú, hoặc gửi `""`. |
| Cột `filling` | "KHÔNG có cột filling" | 016 thêm, 017 xoá → không có; không tham chiếu trong code | 🟢 | Đúng như hiện trạng. |

**Object khớp hoàn toàn:** Topping (cả 4 thuộc tính), hình dạng wire ComboItem, tên/type field OrderItemPayload, việc không có `filling`.

---

## Danh Sách Hành Động Tổng Hợp (theo thứ tự ưu tiên)

> **Lưu ý:** Các mục 1–8 dưới đây phản ánh thiết kế mới (DESIGN_PROMPT.md) là spec. Gap cần xây lại được đánh dấu GAP THIẾT KẾ MỚI.

| # | Loại | Hành động | Mục tiêu |
|---|---|---|---|
| 1 | 🔴 GAP THIẾT KẾ MỚI | Xây lại MenuHeader: ảnh banner + tiêu đề Playfair; bỏ pill bar, nút đăng nhập, nhãn bàn | `MenuHeader.tsx` |
| 2 | 🔴 GAP THIẾT KẾ MỚI | Thay CategoryTabs filter tabs bằng scroll-spy anchor nav (IntersectionObserver); tất cả section luôn render | `CategoryTabs.tsx` / `page.tsx` |
| 3 | ✅ XONG (GAP-7-FAV) | FavouritesRail: component đã có; 3 fixes đã áp — tap thẻ → detail món, heart `fill-primary`, label Heart icon. Heart trên card-list deferred sang GAP-8. | `FavouritesRail.tsx` |
| 4 | 🔴 GAP THIẾT KẾ MỚI | Pill nhân ComboCard: chuyển sang multi-select (cả hai mặc định, bắt buộc ≥1); chuyển pill "Bàn 04" (vòng xoay) vào header OrderSummary | `ComboCard.tsx` / `OrderSummary.tsx` |
| 5 | 🔴 GAP THIẾT KẾ MỚI | Thay CartBottomBar (thanh full-width) bằng hai nút pill nổi xếp chồng (pill giỏ hàng + pill "Thanh toán"), không hiện tổng | `CartBottomBar.tsx` / `page.tsx` |
| 6 | 🔴 GAP THIẾT KẾ MỚI | Bỏ badge "Gọi thêm" khỏi OrderSummary | `OrderSummary.tsx` |
| 7 | 🔴 GAP THIẾT KẾ MỚI | Pre-fill textarea GHI CHÚ với "Gia đình (mẹ + 2 người lớn + 2 trẻ)" | `OrderSummary.tsx` / `TableConfirmModal.tsx` |
| 8 | 🔴 Sửa tài liệu | Viết lại handoff 201: bỏ `setActiveOrderId` khỏi luồng thành công | `customer_menu.md:210`, `customer_menu_crosspage_dataflow.md` |
| 9 | 🔴 Sửa tài liệu | Sửa zone I (bảng/stepper OrderSummary), zone F (pill inline, không ToppingModal), chữ TableConfirmModal | `customer_menu.md` |
| 10 | 🔴 Dọn code | Xoá `ToppingModal.tsx` chết; xử lý `ComboModal` không mở được (nối trigger hoặc xoá) — cùng `DrinkCustomize.tsx`/`OrderNote.tsx` trước đó | `fe/src/features/menu/components/` |
| 11 | 🟡 Sửa tài liệu | Chip MiniCartStrip, trạng thái thêm của CartDrawer, chữ AddToOrderBanner/SearchBar, nguồn kép `/tracking`, ghi-chú-cục-bộ TableConfirmModal | bộ tài liệu |
| 12 | 🟡 Sửa type | Đồng bộ type nullable FE (`description`/`image_path`/combo `category_id`) thành `string`, hoặc BE gửi `null` thật | `fe/src/types/product.ts` / serializer |
| 13 | 🟡 Dọn code | `buildImageURL` chết — gọi hoặc xoá | `product_handler.go` |
| 14 | 🟢 Lỗi nhỏ tài liệu | Thứ tự query loading + gắn lại `min-h-[44px]`; field untyped của Category | bộ tài liệu |

> Theo `CLAUDE.md` (MASTER trước + scope contract): các bản sửa tài liệu là một task; mỗi thay đổi code
> phải được đăng ký vào `MASTER_TASK.md` trước khi chạm vào bất kỳ file nào.
