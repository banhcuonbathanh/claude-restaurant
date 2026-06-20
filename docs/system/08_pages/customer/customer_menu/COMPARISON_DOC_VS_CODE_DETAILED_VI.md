# Customer Menu — So Sánh Chi Tiết Tài Liệu vs. Code (5 Mảng)

> **Phạm vi:** rà soát sâu bộ tài liệu `customer_menu` so với code thật của trang `/menu` theo 5 trục:
> (1) giao diện component · (2) luồng dữ liệu cross-component (Zustand) · (3) luồng dữ liệu cross-page
> (Zustand) · (4) hành vi loading · (5) mô hình dữ liệu FE⇄BE. **Chỉ đọc — KHÔNG sửa code/tài liệu.**
> Thực hiện bởi 4 sub-agent Sonnet chạy song song; các mục 🔴 đã được **tự tay kiểm chứng lại** (kèm grep/file:line).
> Loại trừ khỏi Mảng 1 theo yêu cầu: `DrinkCustomize`, `OrderNote`.
> Ngày: 2026-06-20.

---

## Tóm Tắt Điều Hành

| Mảng | Kết luận | 🔴 | 🟡 | 🟢 |
|---|---|---|---|---|
| 1 · Giao diện component | **Tài liệu lỗi thời nhiều** — code phong phú hơn bản vẽ | 4 | 5 | 4 |
| 2 · Luồng cross-component | Phần lớn chính xác; 1 lỗi nặng | 1 | 1 | nhiều ✅ |
| 3 · Luồng cross-page | Luồng lớn đúng; bước handoff 201 sai | 2 | 1 | nhiều ✅ |
| 4 · Loading | **Gần như hoàn hảo** — chỉ 2 lỗi cosmetic | 0 | 0 | 2 |
| 5 · Mô hình FE⇄BE | Chính xác; flags còn đúng; 3 điểm thừa chưa ghi | 0 | 6 | vài ✅ |

**🔴 NHỮNG PHÁT HIỆN PHẢI "LÊN TIẾNG" (đã tự kiểm chứng):**
1. **`MenuHeader` KHÔNG đọc `useCartStore.tableName`.** Nó đọc `useSettingsStore().tableLabel`
   (`MenuHeader.tsx:11,28`). Lúc quét QR, code ghi `setTableName` vào *cart* store — giá trị này
   không bao giờ tới được header. Zone A trong tài liệu sai, và đây là **lỗi sản phẩm thật**: sau khi
   quét QR, nhãn bàn ở header có thể bị trống.
2. **`TableConfirmModal` KHÔNG gọi `setActiveOrderId` khi thành công.** Nó chỉ `clearCart()` +
   `router.replace()` (`TableConfirmModal.tsx:48-50`). Câu `customer_menu.md:210` ("201 ⇒
   setActiveOrderId(id) → clearCart() → router.replace") là **sai thực tế**. Sau `clearCart()`,
   `activeOrderId` bị reset về `null`.
3. **Luồng `ToppingModal` được tài liệu mô tả KHÔNG tồn tại.** File `ToppingModal.tsx` có **0 import**
   (code chết). Nhân của món lẻ chọn bằng **pill inline** ngay trên `ProductCard`/`ProductGridCard`;
   nhân combo chọn bằng pill inline trên `ComboCard`. Khối "▢ ToppingModal (mở từ E/F)" trong tài
   liệu mô tả luồng chưa hề được nối dây.
4. **`OrderSummary` nhiều hơn hẳn "preview + ghi chú".** Code render bộ đếm canh, bảng "Tổng số món"
   thu gọn được, bộ đếm số lượng theo nhóm, và ghi chú có trạng thái "Đã lưu" — không có gì trong số
   này nằm trong ASCII của zone I.

**Component chết/không thể chạm tới (ngoài DrinkCustomize/OrderNote):**
- `ToppingModal` — 0 import (chết hoàn toàn).
- `ComboModal` — được `ComboCard` import & render nhưng `setModalOpen(true)` không bao giờ được gọi
  (`ComboCard.tsx:75,182` chỉ set `false`) → UI không thể mở.

---

## Mảng 1 — Giao Diện Component

**Kết luận:** tài liệu lỗi thời ở nhiều chỗ quan trọng. Code render UI phong phú hơn ASCII: bộ chọn
nhân inline (không phải modal), nút đăng nhập trên header, bảng tóm tắt đơn đầy đủ, thêm hành động ở
drawer, và chữ trên modal khác.

| Component | Tài liệu nói | Code thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| **MenuHeader** | Ô bên phải hiện tên bàn từ `useCartStore.tableName` | Ô phải = **nút đăng nhập/đăng xuất** (`useAuthStore`); nhãn bàn là **subtitle** từ `useSettingsStore().tableLabel` (`MenuHeader.tsx:11,28-30`) | 🔴 | Vẽ lại zone A: nút auth bên phải; nhãn bàn = subtitle; sửa nguồn dữ liệu. |
| **ProductCard / ProductGridCard** | `[+]` mở **▢ ToppingModal** để chọn nhân | **Pill nhân inline** trên thẻ; `ToppingModal` không hề được import (`ProductCard.tsx:131-147`, `ProductGridCard.tsx:94-110`) | 🔴 | Bỏ ToppingModal khỏi luồng F; ghi pill inline. Đánh dấu ToppingModal là code chết. |
| **ComboCard** | Chỉ có nút `[+]` đơn giản | Stepper `[–] qty [+]` + pill nhân inline + tim yêu thích; có render `ComboModal` nhưng **không mở được** (`ComboCard.tsx:139-183`; không gọi `setModalOpen(true)`) | 🔴 | Vẽ lại thẻ combo; đánh dấu `ComboModal` là chết/không chạm tới. |
| **OrderSummary (I)** | "Đơn của bạn (preview)" + ô ghi chú; rung nếu thiếu canh | "Tóm tắt đơn hàng" thu gọn được: nhóm COMBO/MÓN LẺ có stepper + xoá, **khu vực bộ đếm canh**, **bảng "Tổng số món"** (món×nhân×SL×giá), ghi chú có "Đã lưu" (`OrderSummary.tsx:140-310`) | 🔴 | Viết lại ASCII zone I: stepper, khu canh, bảng món, nút thu gọn. |
| **TableConfirmModal** | Tiêu đề "Xác nhận đơn Bàn 03"; nút "Xác nhận gọi món"; `201 ⇒ setActiveOrderId(id)` | Tiêu đề **"Xác nhận đặt hàng"**; nút **"Đặt hàng"**; có textarea **"Ghi chú cho bếp"**; thành công = chỉ `clearCart()`+`router.replace` (`TableConfirmModal.tsx:48-103`) | 🔴(chữ)🟡 | Sửa tiêu đề/nút; thêm textarea ghi chú vào hình; bỏ câu `setActiveOrderId`. |
| **MiniCartStrip** | `🛒 3 món · 105.000đ [Xem giỏ →]` | Hàng chip tên món cuộn ngang giữa số đếm và tổng; cả thanh là một vùng bấm; không có 🛒, không có "Xem giỏ →" (`MiniCartStrip.tsx:18-38`) | 🟡 | Vẽ lại với hàng chip; bỏ nhãn nút. |
| **CartDrawer** | Tiêu đề + món `[–]qty[+] 🗑` + tổng + `[Thanh toán]` | Thêm: subtitle tên/bàn, nút "Xem đơn hàng" (khi có `activeOrderId`), danh sách combo thu gọn được, footer "Tiếp tục chọn món", biến thể nút "Thêm vào đơn hàng" (`CartDrawer.tsx:73-229`) | 🟡 | Mở rộng ASCII drawer với các trạng thái này. |
| **AddToOrderBanner** | `▸ Đang thêm món vào đơn #123 [Xem đơn]` | Chữ "Chọn món để thêm vào đơn hàng hiện tại" + icon PlusCircle; không hiện id đơn (`AddToOrderBanner.tsx:14-16`) | 🟡 | Cập nhật chữ banner. |
| **Vị trí error/empty của page** | ngụ ý nằm trong ProductList | Render ở **cấp page**; `OrderSummary` render **bất kể** error/loading (`page.tsx:144-183`); chữ lỗi "⚠ Kết nối mạng yếu" | 🟡 | Ghi chú OrderSummary luôn hiện; sửa chữ lỗi. |
| **SearchBar** | Placeholder `🔍 Tìm món...` | "Tìm món nhanh..." (không emoji), nút xoá X, gợi ý 1-ký-tự "Nhập ít nhất 2 ký tự", debounce 300ms (`SearchBar.tsx:26,38-40`) | 🟢 | Cập nhật placeholder + ghi hint/clear/debounce. |
| **FavouritesRail (D)** | `♥ ... ▸ ▸ ▸`; hiện nếu có yêu thích | Thẻ link tới `/menu/favourites`; tim luôn đỏ-đầy; cũng ẩn khi chọn tab danh mục (`page.tsx:108`, `FavouritesRail.tsx:71,84-90`) | 🟢 | Ghi đích link + tim luôn đầy + ẩn theo danh mục. |
| **CartBottomBar (J)** | `count · total [Thanh toán]`; dimmed chặn bấm | Bố cục = [badge SL][Thanh toán][tổng]; dimmed vẫn **gọi** onCheckout để hiện toast cảnh báo (`CartBottomBar.tsx:19-28`, `page.tsx:187`) | 🟢 | Sửa thứ tự bố cục; làm rõ dim = cảnh báo khi bấm, không phải chặn. |

**Khớp đúng (không cần sửa):** CategoryTabs, RestaurantBanner, ComboSection (điều kiện hiện), ProductList (skeleton/grid/empty).

---

## Mảng 2 — Luồng Cross-Component (Zustand)

**Kết luận:** hình dạng store, tên action, công thức selector, cổng canh và quy tắc "không truyền props
giữa các zone" đều khớp chính xác. Một lỗi nặng (nguồn của MenuHeader) + một điểm thiếu về ghi chú.

| Chủ đề | Tài liệu nói | Code thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| Nguồn dữ liệu MenuHeader | đọc `useCartStore.tableName` | đọc `useSettingsStore().tableLabel` (`MenuHeader.tsx:11`) — không dùng cart store | 🔴 | Sửa tài liệu; xem Mảng 1 / headline #1. (`OrderSummary.tsx:47` *có* đọc cart `tableName`.) |
| Ghi chú của TableConfirmModal | rút `orderNote` từ store | dùng `useState` **cục bộ** riêng; POST gửi `note: note.trim()\|\|null`; không đọc `orderNote` store (`TableConfirmModal.tsx:15-16,23`) | 🟡 | Tài liệu: luồng QR thu ghi chú riêng; `orderNote` store chỉ dùng ở luồng `/checkout` online. |
| `addItem` dedup, selector `total()`/`itemCount()`, chữ ký `setCanhQty`, danh sách field `clearCart`, builder duy nhất `buildOrderItemsPayload` cho cả 3 luồng POST, cổng canh `id.startsWith('canh_')` | như tài liệu | xác nhận tại `cart.ts:51-59,124-125,35/97,89` · `order-payload.ts` · `page.tsx:40` | 🟢 | Không cần làm — đều đúng. |

---

## Mảng 3 — Luồng Cross-Page (Zustand)

**Kết luận:** các luồng lớn (whitelist persist, quét order_cache, điều kiện dừng SSE, cô lập admin,
tái nhập add-to-order) đều chính xác. **Bước handoff khi thành công (201) ghi sai.**

| Chủ đề | Tài liệu nói | Code thực tế (file:line) | Mức | Giải pháp |
|---|---|---|---|---|
| Bước ghi ② của handoff 201 | `setActiveOrderId("<id>")` được đóng dấu khi thành công | **không gọi**; chỉ `clearCart()` (reset `activeOrderId`→null) + `router.replace` (`TableConfirmModal.tsx:48-50`; `checkout/page.tsx` tương tự) | 🔴 | Bỏ bước ② khỏi chuỗi/sơ đồ handoff. `activeOrderId` được set sau bởi nút "Theo dõi" (`order/[id]/page.tsx:564`). |
| Đồng bộ QR scan → MenuHeader | `setTableName` (QR) → MenuHeader render lại | `/table/[tableId]/page.tsx:31` ghi cart `tableName`, nhưng MenuHeader đọc `settings.tableLabel`; trang QR không gọi `setTableLabel` → nhãn bàn trống sau khi quét | 🔴 | Hai field khác nhau ở hai store, không đồng bộ. Hoặc cho MenuHeader đọc cart `tableName`, hoặc cho trang QR set `tableLabel`. (Lỗi sản phẩm, không chỉ lỗi tài liệu.) |
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

| # | Loại | Hành động | Mục tiêu |
|---|---|---|---|
| 1 | 🔴 Lỗi code | Nhãn bàn lúc quét QR không tới được `MenuHeader` (cart `tableName` vs settings `tableLabel`) — chọn một nguồn | `MenuHeader.tsx` / `table/[tableId]/page.tsx` |
| 2 | 🔴 Sửa tài liệu | Viết lại handoff 201: bỏ `setActiveOrderId` khỏi luồng thành công | `customer_menu.md:210`, `customer_menu_crosspage_dataflow.md` |
| 3 | 🔴 Sửa tài liệu | Sửa zone A (nguồn MenuHeader), zone I (bảng/stepper OrderSummary), zone F (pill inline, không ToppingModal), chữ TableConfirmModal | `customer_menu.md` |
| 4 | 🔴 Dọn code | Xoá `ToppingModal.tsx` chết; xử lý `ComboModal` không mở được (nối trigger hoặc xoá) — cùng `DrinkCustomize.tsx`/`OrderNote.tsx` trước đó | `fe/src/features/menu/components/` |
| 5 | 🟡 Sửa tài liệu | Chip MiniCartStrip, trạng thái thêm của CartDrawer, chữ AddToOrderBanner/SearchBar, nguồn kép `/tracking`, ghi-chú-cục-bộ TableConfirmModal | bộ tài liệu |
| 6 | 🟡 Sửa type | Đồng bộ type nullable FE (`description`/`image_path`/combo `category_id`) thành `string`, hoặc BE gửi `null` thật | `fe/src/types/product.ts` / serializer |
| 7 | 🟡 Dọn code | `buildImageURL` chết — gọi hoặc xoá | `product_handler.go` |
| 8 | 🟢 Lỗi nhỏ tài liệu | Thứ tự query loading + gắn lại `min-h-[44px]`; field untyped của Category | bộ tài liệu |

> Theo `CLAUDE.md` (MASTER trước + scope contract): các bản sửa tài liệu là một task; mỗi thay đổi code
> (#1, #4, #6, #7) phải được đăng ký vào `MASTER_TASK.md` trước khi chạm vào bất kỳ file nào.
