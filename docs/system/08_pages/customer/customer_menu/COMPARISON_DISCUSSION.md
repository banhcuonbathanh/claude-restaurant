# Comparison Discussion & Fix Decisions — customer_menu

> **Đây là nơi bạn ra lệnh sửa gap.** Mỗi 🔴 gap từ comparison-doc = 1 mục bên dưới.
> Quy trình:
> 1. Tôi viết sẵn **💡 Đề xuất của tôi** (phương án sửa cụ thể) cho mỗi gap.
> 2. Bạn phản hồi ở **💬 Yêu cầu của bạn**: ✅ đồng ý · ❌ không · ✏️ sửa lại như nào.
> 3. Ta thảo luận (ghi full vào **🗣 Thảo luận**) → chốt ở **✅ Quyết định**.
> 4. **Đã chốt → tôi sửa NGAY trên code thật** (code fix có `MASTER_TASK` row trước) → **bạn kiểm tra output**.
> 5. Cập nhật **Trạng thái**.
>
> - **Doc fix** (vẽ lại ASCII cho khớp code) → gộp 1 task, làm ngay.
> - **Code fix** (sửa hành vi app) → **phải có dòng trong `MASTER_TASK.md` trước** + ALIGN (theo `CLAUDE.md`).
> - File này **chỉ ghi quyết định & thảo luận**, không phải file audit. Nguồn gap: `COMPARISON_TRACKER.md` + `COMPARISON_VISUAL_MOCKUP_VI.md`.
>
> **Trạng thái:** ⬜ chưa bàn · 💬 chờ bạn feedback · 🗣 đang thảo luận · 🔧 đang sửa · ✅ xong · ⏸ tạm hoãn

| Page | Branch | Last comparison run | Tổng gap | ⬜ | 🔧 | ✅ |
|---|---|---|---|---|---|---|
| customer_menu | experience_claude.md_system_1_test_iphon2_change_code | 2026-06-20 | 5 chính (7🔴) | 5 | 0 | 0 |

---

## GAP-1 · MenuHeader — nhãn bàn trống sau khi quét QR

- **Loại:** 🔴 CODE bug
- **Trạng thái:** 💬 chờ bạn feedback
- **Nguồn:** [Mockup Zone A](./COMPARISON_VISUAL_MOCKUP_VI.md#L14-L49) · [Tracker](../../COMPARISON_TRACKER.md#L13)
- **🔗 Code (before):** [MenuHeader.tsx:11](../../../../../fe/src/features/menu/components/MenuHeader.tsx#L11) · [:28-29](../../../../../fe/src/features/menu/components/MenuHeader.tsx#L28-L29)
- **📷 Ảnh thật:** [menuheader_real.png](./screenshots/menuheader_real.png)
- **🔗 Code (after):** _(điền sau khi sửa — cùng link MenuHeader.tsx, dòng đã đổi)_

**Mô tả gap:** Header đọc `useSettingsStore().tableLabel`, nhưng luồng QR scan lại ghi vào `useCartStore.tableName`.
→ Sau khi quét QR, nhãn bàn ("Bàn 03") **không hiện** trên header. Bằng chứng ảnh: `screenshots/menuheader_real.png`.

**💡 Đề xuất của tôi:** Sửa `MenuHeader` đọc `cart.tableName ?? settings.tableLabel` — ưu tiên nhãn từ
luồng QR (nguồn thật của khách), fallback về settings cho POS/staff. Sửa tối thiểu 1 dòng, không đụng store
khác, fix đúng bug. (Phương án B nếu bạn muốn: bắt QR scan ghi luôn vào `settings.tableLabel` — nhưng trộn
2 nguồn dễ lỗi hơn, tôi không khuyên.)

| 💬 Yêu cầu của bạn |
|---|
| _(✅ đồng ý phương án A / ❌ / ✏️ sửa: …)_ |

**🗣 Thảo luận (full):**
> _(ghi lại toàn bộ trao đổi qua lại — lý do, phương án A/B, rủi ro — không chỉ kết luận)_

**✅ Quyết định:** _(chưa chốt)_
**MASTER_TASK row:** _(chưa tạo — code fix bắt buộc có trước khi sửa)_

---

## GAP-2 · TableConfirmModal — doc ghi sai `setActiveOrderId`

- **Loại:** 🔵 DOC sai (code đúng)
- **Trạng thái:** 💬 chờ bạn feedback
- **Nguồn:** [Mockup TableConfirmModal](./COMPARISON_VISUAL_MOCKUP_VI.md#L147-L192)
- **🔗 Code (before):** [TableConfirmModal.tsx:48-50](../../../../../fe/src/features/menu/components/TableConfirmModal.tsx#L48-L50)
- **📷 Ảnh thật:** [tableconfirmmodal_real.png](./screenshots/tableconfirmmodal_real.png)
- **🔗 Code (after):** _(doc-only fix — code không đổi; link giữ nguyên)_

**Mô tả gap:** Doc vẽ luồng 201 ⇒ `setActiveOrderId(id)` → `clearCart()` → `router.replace`.
Code THẬT **không gọi** `setActiveOrderId`; `clearCart()` còn reset `activeOrderId` về null. Tiêu đề thật là
"Xác nhận đặt hàng" (không có "Bàn 03"), nút "Đặt hàng" (không phải "Xác nhận gọi món").

**💡 Đề xuất của tôi:** Code đang ĐÚNG — chỉ sửa **doc**. Vẽ lại ASCII đúng tiêu đề/nút, bỏ
`setActiveOrderId(id)` khỏi luồng 201, ghi rõ `activeOrderId` chỉ set sau khi bấm "Theo dõi" ở `/order/<id>`.
Không đụng code (đề xuất ③ đã có sẵn). Nhanh, an toàn.

| 💬 Yêu cầu của bạn |
|---|
| _(✅ đồng ý chỉ sửa doc / ❌ / ✏️ sửa: …)_ |

**🗣 Thảo luận (full):**
> _(…)_

**✅ Quyết định:** _(chưa chốt)_
**MASTER_TASK row:** _(doc fix: không cần. nếu đổi code: cần.)_

---

## GAP-3 · ToppingModal — code chết (0 import)

- **Loại:** 🔴 CODE cleanup + DOC
- **Trạng thái:** 💬 chờ bạn feedback
- **Nguồn:** [Mockup Zone F](./COMPARISON_VISUAL_MOCKUP_VI.md#L53-L96)
- **🔗 Code (before):** [ToppingModal.tsx](../../../../../fe/src/features/menu/components/ToppingModal.tsx) (file chết) · nhân thật ở [ProductCard.tsx:131-147](../../../../../fe/src/features/menu/components/ProductCard.tsx#L131-L147)
- **📷 Ảnh thật:** [productcard_real.png](./screenshots/productcard_real.png)
- **🔗 Code (after):** _(điền sau khi xoá — link ToppingModal.tsx sẽ 404)_

**Mô tả gap:** Doc vẽ chọn nhân qua `ToppingModal` overlay. Thực tế nhân = **pill inline single-select**
ngay trên `ProductCard` (`ProductCard.tsx:131-147`); `ToppingModal.tsx` không ai import → code chết.

**💡 Đề xuất của tôi:** Làm 2 việc — (a) **xoá `ToppingModal.tsx`** (code fix → cần `MASTER_TASK` row);
tôi sẽ `grep` xác nhận 0 import trước khi xoá. (b) **sửa doc** bỏ khối ToppingModal khỏi luồng E/F, vẽ pill
inline. Nếu bạn muốn giữ lại để dùng sau thì chỉ sửa doc + ghi chú "code chết, chưa dùng".

| 💬 Yêu cầu của bạn |
|---|
| _(✅ xoá + sửa doc / ❌ giữ file / ✏️ sửa: …)_ |

**🗣 Thảo luận (full):**
> _(…)_

**✅ Quyết định:** _(chưa chốt)_
**MASTER_TASK row:** _(xoá file = code fix → cần row)_

---

## GAP-4 · ComboModal — render nhưng không tới được

- **Loại:** 🔴 CODE
- **Trạng thái:** 💬 chờ bạn feedback
- **Nguồn:** [Tracker headline](../../COMPARISON_TRACKER.md#L13)
- **🔗 Code (before):** [ComboModal.tsx](../../../../../fe/src/features/menu/components/ComboModal.tsx)
- **📷 Ảnh thật:** _(chưa chụp riêng — xem toàn cảnh [menu_full_real.png](./screenshots/menu_full_real.png))_
- **🔗 Code (after):** _(điền sau khi điều tra/xử lý)_

**Mô tả gap:** `ComboModal` được render trong cây nhưng không có đường nào mở được nó (unreachable).

**💡 Đề xuất của tôi:** ⚠️ Cần điều tra trước khi chốt — combo giờ mở ở trang riêng `/menu/combo/:id`
(xem cross-page), nên `ComboModal` nhiều khả năng là tàn dư. Tôi sẽ `grep` xem ai set state mở nó; nếu
0 đường mở → **xoá** (code fix → `MASTER_TASK` row). Nếu vẫn còn nơi gọi → đề xuất nối lại. Chưa khuyên
xoá ngay khi chưa grep.

| 💬 Yêu cầu của bạn |
|---|
| _(✅ điều tra rồi xử lý / ❌ để nguyên / ✏️ sửa: …)_ |

**🗣 Thảo luận (full):**
> _(…)_

**✅ Quyết định:** _(chưa chốt)_
**MASTER_TASK row:** _(chưa tạo)_

---

## GAP-5 · OrderSummary — ASCII 1 dòng quá sơ sài so với code thật

- **Loại:** 🔵 DOC (vẽ lại)
- **Trạng thái:** 💬 chờ bạn feedback
- **Nguồn:** [Mockup Zone I](./COMPARISON_VISUAL_MOCKUP_VI.md#L100-L143)
- **🔗 Code (before):** [OrderSummary.tsx:140-309](../../../../../fe/src/features/menu/components/OrderSummary.tsx#L140-L309)
- **📷 Ảnh thật:** [ordersummary_real.png](./screenshots/ordersummary_real.png)
- **🔗 Code (after):** _(doc-only fix — code không đổi; link giữ nguyên)_

**Mô tả gap:** Doc khu I chỉ vẽ "Đơn của bạn (preview) + Ghi chú đơn". Code thật có 5 phần: header collapse,
nhóm COMBO/MÓN LẺ có stepper+xoá, khu **CANH** (viền chạy khi thiếu), bảng **"Tổng số món"** thu gọn,
ghi chú có trạng thái "Đã lưu". Đề xuất ③ đã có sẵn bản ASCII đầy đủ.

**💡 Đề xuất của tôi:** Chỉ sửa **doc** — thay ASCII 1 dòng ở khu I bằng bản ③ đầy đủ (5 phần: header
collapse · nhóm COMBO/MÓN LẺ · khu CANH viền chạy · bảng "Tổng số món" · ghi chú "Đã lưu"). Không đụng code.

| 💬 Yêu cầu của bạn |
|---|
| _(✅ thay bằng bản ③ / ❌ / ✏️ sửa: …)_ |

**🗣 Thảo luận (full):**
> _(…)_

**✅ Quyết định:** _(chưa chốt)_
**MASTER_TASK row:** _(doc fix: không cần)_

---

## 📌 Việc đã chốt (rút gọn để theo dõi)

> Khi 1 GAP chốt xong, copy 1 dòng tóm tắt xuống đây để nhìn nhanh.

| GAP | Quyết định | Loại | MASTER row | Trạng thái |
|---|---|---|---|---|
| — | _(chưa có)_ | — | — | — |
