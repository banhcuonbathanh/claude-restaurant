# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staff-internal-reactions.spec.ts >> B — Staff Account Management >> B1 — manager creates chef account → appears in list
- Location: tests/staff-internal-reactions.spec.ts:228:7

# Error details

```
Error: locator.selectOption: Error: strict mode violation: locator('select') resolved to 3 elements:
    1) <select class="h-[44px] w-40 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">…</select> aka getByRole('combobox').first()
    2) <select class="h-[44px] w-44 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">…</select> aka getByRole('combobox').nth(1)
    3) <select name="role" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">…</select> aka locator('select[name="role"]')

Call log:
  - waiting for locator('select')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - heading "Quản trị hệ thống" [level=1] [ref=e4]
      - navigation [ref=e5]:
        - link "Tổng quan" [ref=e6] [cursor=pointer]:
          - /url: /admin/overview
        - link "Tổng kết" [ref=e7] [cursor=pointer]:
          - /url: /admin/summary
        - link "Sản phẩm" [ref=e8] [cursor=pointer]:
          - /url: /admin/products
        - link "Combo" [ref=e9] [cursor=pointer]:
          - /url: /admin/combos
        - link "Danh mục" [ref=e10] [cursor=pointer]:
          - /url: /admin/categories
        - link "Topping" [ref=e11] [cursor=pointer]:
          - /url: /admin/toppings
        - link "Nhân viên" [ref=e12] [cursor=pointer]:
          - /url: /admin/staff
        - link "Công việc" [ref=e13] [cursor=pointer]:
          - /url: /admin/todo-list
        - link "Kho nguyên liệu" [ref=e14] [cursor=pointer]:
          - /url: /admin/ingredients
        - link "Marketing" [ref=e15] [cursor=pointer]:
          - /url: /admin/marketing
        - link "Đào tạo" [ref=e16] [cursor=pointer]:
          - /url: /admin/training
    - generic [ref=e18]:
      - generic [ref=e19]:
        - heading "Nhân viên (94)" [level=2] [ref=e20]:
          - text: Nhân viên
          - generic [ref=e21]: (94)
        - button "+ Thêm nhân viên" [ref=e22] [cursor=pointer]
      - generic [ref=e23]:
        - generic [ref=e24]:
          - paragraph [ref=e25]: Tổng nhân viên
          - paragraph [ref=e26]: "94"
        - generic [ref=e27]:
          - paragraph [ref=e28]: Đang hoạt động
          - paragraph [ref=e29]: "75"
          - generic [ref=e31]: Đang HĐ
        - generic [ref=e32]:
          - paragraph [ref=e33]: Vô hiệu hóa
          - paragraph [ref=e34]: "19"
          - generic [ref=e36]: Vô hiệu
        - generic [ref=e37]:
          - paragraph [ref=e38]: Theo vai trò
          - paragraph [ref=e39]: "94"
          - generic [ref=e41]: Thu ngân:23 · NV:2 · QL:2 · Bếp:66 · Admin:1
      - generic [ref=e42]:
        - textbox "🔍 Tìm tên / username..." [ref=e43]
        - combobox [ref=e44]:
          - option "Tất cả vai trò" [selected]
          - option "Bếp"
          - option "Thu ngân"
          - option "Nhân viên"
          - option "Quản lý"
          - option "Admin"
        - combobox [ref=e45]:
          - option "Tất cả trạng thái" [selected]
          - option "Đang hoạt động"
          - option "Vô hiệu hóa"
      - table [ref=e47]:
        - rowgroup [ref=e48]:
          - row "Nhân viên Username Vai trò Ca làm Hiệu suất Trạng thái" [ref=e49]:
            - columnheader "Nhân viên" [ref=e50]
            - columnheader "Username" [ref=e51]
            - columnheader "Vai trò" [ref=e52]
            - columnheader "Ca làm" [ref=e53]
            - columnheader "Hiệu suất" [ref=e54]
            - columnheader "Trạng thái" [ref=e55]
            - columnheader [ref=e56]
        - rowgroup [ref=e57]:
          - 'row "TV Kiểm Tra Verify Trưởng Ca verify_test_01 Vai trò: Thu ngân Sáng Chiều Tối 0% Đang HĐ Chi tiết Sửa Xóa" [ref=e58]':
            - cell "TV Kiểm Tra Verify Trưởng Ca" [ref=e59]:
              - generic [ref=e60]:
                - generic [ref=e61]: TV
                - generic [ref=e62]:
                  - paragraph [ref=e63]: Kiểm Tra Verify
                  - paragraph [ref=e64]: Trưởng Ca
            - cell "verify_test_01" [ref=e65]
            - 'cell "Vai trò: Thu ngân" [ref=e66]':
              - 'generic "Vai trò: Thu ngân" [ref=e67]': Thu ngân
            - cell "Sáng Chiều Tối" [ref=e68]:
              - generic [ref=e69]:
                - generic [ref=e70]: Sáng
                - generic [ref=e71]: Chiều
                - generic [ref=e72]: Tối
            - cell "0%" [ref=e73]:
              - paragraph [ref=e76]: 0%
            - cell "Đang HĐ" [ref=e77]:
              - button "Đang HĐ" [ref=e78] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e79]:
              - generic [ref=e80]:
                - button "Chi tiết" [ref=e81] [cursor=pointer]
                - button "Sửa" [ref=e82] [cursor=pointer]
                - button "Xóa" [ref=e83] [cursor=pointer]
          - 'row "NV Nhân Viên staff Vai trò: Nhân viên — 0% Đang HĐ Chi tiết Sửa Xóa" [ref=e84]':
            - cell "NV Nhân Viên" [ref=e85]:
              - generic [ref=e86]:
                - generic [ref=e87]: NV
                - paragraph [ref=e89]: Nhân Viên
            - cell "staff" [ref=e90]
            - 'cell "Vai trò: Nhân viên" [ref=e91]':
              - 'generic "Vai trò: Nhân viên" [ref=e92]': Nhân viên
            - cell "—" [ref=e93]:
              - generic [ref=e95]: —
            - cell "0%" [ref=e96]:
              - paragraph [ref=e99]: 0%
            - cell "Đang HĐ" [ref=e100]:
              - button "Đang HĐ" [ref=e101] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e102]:
              - generic [ref=e103]:
                - button "Chi tiết" [ref=e104] [cursor=pointer]
                - button "Sửa" [ref=e105] [cursor=pointer]
                - button "Xóa" [ref=e106] [cursor=pointer]
          - 'row "QL Quản Lý manager Vai trò: Quản lý — 0% Đang HĐ Chi tiết Sửa" [ref=e107]':
            - cell "QL Quản Lý" [ref=e108]:
              - generic [ref=e109]:
                - generic [ref=e110]: QL
                - paragraph [ref=e112]: Quản Lý
            - cell "manager" [ref=e113]
            - 'cell "Vai trò: Quản lý" [ref=e114]':
              - 'generic "Vai trò: Quản lý" [ref=e115]': Quản lý
            - cell "—" [ref=e116]:
              - generic [ref=e118]: —
            - cell "0%" [ref=e119]:
              - paragraph [ref=e122]: 0%
            - cell "Đang HĐ" [ref=e123]:
              - button "Đang HĐ" [ref=e124] [cursor=pointer]
            - cell "Chi tiết Sửa" [ref=e125]:
              - generic [ref=e126]:
                - button "Chi tiết" [ref=e127] [cursor=pointer]
                - button "Sửa" [ref=e128] [cursor=pointer]
          - 'row "ĐB Đầu Bếp chef Vai trò: Bếp — 0% Đang HĐ Chi tiết Sửa Xóa" [ref=e129]':
            - cell "ĐB Đầu Bếp" [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]: ĐB
                - paragraph [ref=e134]: Đầu Bếp
            - cell "chef" [ref=e135]
            - 'cell "Vai trò: Bếp" [ref=e136]':
              - 'generic "Vai trò: Bếp" [ref=e137]': Bếp
            - cell "—" [ref=e138]:
              - generic [ref=e140]: —
            - cell "0%" [ref=e141]:
              - paragraph [ref=e144]: 0%
            - cell "Đang HĐ" [ref=e145]:
              - button "Đang HĐ" [ref=e146] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e147]:
              - generic [ref=e148]:
                - button "Chi tiết" [ref=e149] [cursor=pointer]
                - button "Sửa" [ref=e150] [cursor=pointer]
                - button "Xóa" [ref=e151] [cursor=pointer]
          - 'row "TN Thu Ngân cashier Vai trò: Thu ngân — 0% Đang HĐ Chi tiết Sửa Xóa" [ref=e152]':
            - cell "TN Thu Ngân" [ref=e153]:
              - generic [ref=e154]:
                - generic [ref=e155]: TN
                - paragraph [ref=e157]: Thu Ngân
            - cell "cashier" [ref=e158]
            - 'cell "Vai trò: Thu ngân" [ref=e159]':
              - 'generic "Vai trò: Thu ngân" [ref=e160]': Thu ngân
            - cell "—" [ref=e161]:
              - generic [ref=e163]: —
            - cell "0%" [ref=e164]:
              - paragraph [ref=e167]: 0%
            - cell "Đang HĐ" [ref=e168]:
              - button "Đang HĐ" [ref=e169] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e170]:
              - generic [ref=e171]:
                - button "Chi tiết" [ref=e172] [cursor=pointer]
                - button "Sửa" [ref=e173] [cursor=pointer]
                - button "Xóa" [ref=e174] [cursor=pointer]
          - 'row "TT Status Toggle Test e2e_chef_1778886183825 Vai trò: Thu ngân — 0% Vô hiệu Chi tiết Sửa Xóa" [ref=e175]':
            - cell "TT Status Toggle Test" [ref=e176]:
              - generic [ref=e177]:
                - generic [ref=e178]: TT
                - paragraph [ref=e180]: Status Toggle Test
            - cell "e2e_chef_1778886183825" [ref=e181]
            - 'cell "Vai trò: Thu ngân" [ref=e182]':
              - 'generic "Vai trò: Thu ngân" [ref=e183]': Thu ngân
            - cell "—" [ref=e184]:
              - generic [ref=e186]: —
            - cell "0%" [ref=e187]:
              - paragraph [ref=e190]: 0%
            - cell "Vô hiệu" [ref=e191]:
              - button "Vô hiệu" [ref=e192] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e193]:
              - generic [ref=e194]:
                - button "Chi tiết" [ref=e195] [cursor=pointer]
                - button "Sửa" [ref=e196] [cursor=pointer]
                - button "Xóa" [ref=e197] [cursor=pointer]
          - 'row "UN Updated Name e2e_chef_1778886182467 Vai trò: Bếp — 0% Đang HĐ Chi tiết Sửa Xóa" [ref=e198]':
            - cell "UN Updated Name" [ref=e199]:
              - generic [ref=e200]:
                - generic [ref=e201]: UN
                - paragraph [ref=e203]: Updated Name
            - cell "e2e_chef_1778886182467" [ref=e204]
            - 'cell "Vai trò: Bếp" [ref=e205]':
              - 'generic "Vai trò: Bếp" [ref=e206]': Bếp
            - cell "—" [ref=e207]:
              - generic [ref=e209]: —
            - cell "0%" [ref=e210]:
              - paragraph [ref=e213]: 0%
            - cell "Đang HĐ" [ref=e214]:
              - button "Đang HĐ" [ref=e215] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e216]:
              - generic [ref=e217]:
                - button "Chi tiết" [ref=e218] [cursor=pointer]
                - button "Sửa" [ref=e219] [cursor=pointer]
                - button "Xóa" [ref=e220] [cursor=pointer]
          - 'row "TC E2E Test Chef e2e_chef_1778886181245 Vai trò: Bếp — 0% Đang HĐ Chi tiết Sửa Xóa" [ref=e221]':
            - cell "TC E2E Test Chef" [ref=e222]:
              - generic [ref=e223]:
                - generic [ref=e224]: TC
                - paragraph [ref=e226]: E2E Test Chef
            - cell "e2e_chef_1778886181245" [ref=e227]
            - 'cell "Vai trò: Bếp" [ref=e228]':
              - 'generic "Vai trò: Bếp" [ref=e229]': Bếp
            - cell "—" [ref=e230]:
              - generic [ref=e232]: —
            - cell "0%" [ref=e233]:
              - paragraph [ref=e236]: 0%
            - cell "Đang HĐ" [ref=e237]:
              - button "Đang HĐ" [ref=e238] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e239]:
              - generic [ref=e240]:
                - button "Chi tiết" [ref=e241] [cursor=pointer]
                - button "Sửa" [ref=e242] [cursor=pointer]
                - button "Xóa" [ref=e243] [cursor=pointer]
          - 'row "TT Status Toggle Test e2e_chef_1778886087376 Vai trò: Thu ngân — 0% Vô hiệu Chi tiết Sửa Xóa" [ref=e244]':
            - cell "TT Status Toggle Test" [ref=e245]:
              - generic [ref=e246]:
                - generic [ref=e247]: TT
                - paragraph [ref=e249]: Status Toggle Test
            - cell "e2e_chef_1778886087376" [ref=e250]
            - 'cell "Vai trò: Thu ngân" [ref=e251]':
              - 'generic "Vai trò: Thu ngân" [ref=e252]': Thu ngân
            - cell "—" [ref=e253]:
              - generic [ref=e255]: —
            - cell "0%" [ref=e256]:
              - paragraph [ref=e259]: 0%
            - cell "Vô hiệu" [ref=e260]:
              - button "Vô hiệu" [ref=e261] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e262]:
              - generic [ref=e263]:
                - button "Chi tiết" [ref=e264] [cursor=pointer]
                - button "Sửa" [ref=e265] [cursor=pointer]
                - button "Xóa" [ref=e266] [cursor=pointer]
          - 'row "UN Updated Name e2e_chef_1778886086047 Vai trò: Bếp — 0% Đang HĐ Chi tiết Sửa Xóa" [ref=e267]':
            - cell "UN Updated Name" [ref=e268]:
              - generic [ref=e269]:
                - generic [ref=e270]: UN
                - paragraph [ref=e272]: Updated Name
            - cell "e2e_chef_1778886086047" [ref=e273]
            - 'cell "Vai trò: Bếp" [ref=e274]':
              - 'generic "Vai trò: Bếp" [ref=e275]': Bếp
            - cell "—" [ref=e276]:
              - generic [ref=e278]: —
            - cell "0%" [ref=e279]:
              - paragraph [ref=e282]: 0%
            - cell "Đang HĐ" [ref=e283]:
              - button "Đang HĐ" [ref=e284] [cursor=pointer]
            - cell "Chi tiết Sửa Xóa" [ref=e285]:
              - generic [ref=e286]:
                - button "Chi tiết" [ref=e287] [cursor=pointer]
                - button "Sửa" [ref=e288] [cursor=pointer]
                - button "Xóa" [ref=e289] [cursor=pointer]
      - generic [ref=e290]:
        - button "←" [disabled] [ref=e291]
        - generic [ref=e292]: Trang 1 / 10
        - button "→" [ref=e293] [cursor=pointer]
      - generic [ref=e295]:
        - generic [ref=e296]:
          - heading "Thêm nhân viên" [level=3] [ref=e297]
          - button "✕" [ref=e298] [cursor=pointer]
        - generic [ref=e299]:
          - generic [ref=e300]:
            - generic [ref=e301]:
              - generic [ref=e302]: Username *
              - textbox "chef_an" [ref=e303]: b1_chef_1780276697340
            - generic [ref=e304]:
              - generic [ref=e305]: Mật khẩu *
              - textbox [ref=e306]: E2eTest1
          - generic [ref=e307]:
            - generic [ref=e308]: Tên đầy đủ *
            - textbox "Nguyễn Văn An" [active] [ref=e309]: B1 Test Chef
          - generic [ref=e310]:
            - generic [ref=e311]:
              - generic [ref=e312]: Vai trò *
              - combobox [ref=e313]:
                - option "Bếp"
                - option "Thu ngân" [selected]
                - option "Nhân viên"
                - option "Quản lý"
            - generic [ref=e314]:
              - generic [ref=e315]: Vị trí công việc
              - textbox "Bếp trưởng" [ref=e316]
          - generic [ref=e317]:
            - generic [ref=e318]: Ca làm việc
            - generic [ref=e319]:
              - button "Sáng" [ref=e320] [cursor=pointer]
              - button "Chiều" [ref=e321] [cursor=pointer]
              - button "Tối" [ref=e322] [cursor=pointer]
          - generic [ref=e323]:
            - generic [ref=e324]: Trách nhiệm / Mô tả công việc
            - textbox "Mô tả công việc và trách nhiệm..." [ref=e325]
          - generic [ref=e326]:
            - generic [ref=e327]:
              - generic [ref=e328]: Số điện thoại
              - textbox "0901234567" [ref=e329]
            - generic [ref=e330]:
              - generic [ref=e331]: Email
              - textbox "an@quán.vn" [ref=e332]
          - generic [ref=e333]:
            - button "Huỷ" [ref=e334] [cursor=pointer]
            - button "Tạo tài khoản" [ref=e335] [cursor=pointer]
  - region "Notifications alt+T"
  - alert [ref=e336]
  - generic [ref=e337]:
    - paragraph [ref=e338]:
      - text: Chúng tôi dùng cookies và bộ nhớ trình duyệt để lưu giỏ hàng và trạng thái đơn hàng. Không có dữ liệu thẻ ngân hàng nào được lưu. Xem
      - link "Chính sách bảo mật" [ref=e339] [cursor=pointer]:
        - /url: /privacy-policy
      - text: .
    - button "Đồng ý" [ref=e340] [cursor=pointer]
```

# Test source

```ts
  138 |     await expect(editInput).toBeVisible({ timeout: 5_000 })
  139 |     await editInput.fill(updatedName)
  140 |     await page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).last().click()
  141 | 
  142 |     await expect(page.getByText(/Đã cập nhật|thành công/i)).toBeVisible({ timeout: 8_000 })
  143 |     await expect(page.getByText(updatedName)).toBeVisible()
  144 |   })
  145 | 
  146 |   // A6: Category added → new tab appears in product list
  147 |   test('A6 — category added appears in category list', async ({ page }) => {
  148 |     await loginAs(page, 'manager')
  149 |     await page.goto('/admin/categories')
  150 |     await expect(
  151 |       page.getByRole('heading', { name: /Danh mục|Category|Categories/i })
  152 |     ).toBeVisible({ timeout: 10_000 })
  153 | 
  154 |     const catName = `A6 Cat ${Date.now()}`
  155 |     await page.getByRole('button', { name: /Thêm danh mục|\+ Danh mục|Tạo/i }).click()
  156 |     const nameInput = page.getByPlaceholder(/tên danh mục|category name|Bánh/i).first()
  157 |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  158 |     await nameInput.fill(catName)
  159 |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  160 | 
  161 |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  162 |     await expect(page.getByText(catName)).toBeVisible({ timeout: 5_000 })
  163 |   })
  164 | 
  165 |   // A7: Combo created → appears in combo list
  166 |   test('A7 — combo created appears in combo list', async ({ page }) => {
  167 |     await loginAs(page, 'manager')
  168 |     await page.goto('/admin/combos')
  169 |     await expect(
  170 |       page.getByRole('heading', { name: /Combo|Set|Bộ/i })
  171 |     ).toBeVisible({ timeout: 10_000 })
  172 | 
  173 |     const comboName = `A7 Combo ${Date.now()}`
  174 |     await page.getByRole('button', { name: /Thêm combo|\+ Combo|Tạo combo|Tạo/i }).click()
  175 | 
  176 |     const nameInput = page.getByPlaceholder(/tên combo|combo name|Tên/i).first()
  177 |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  178 |     await nameInput.fill(comboName)
  179 | 
  180 |     const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
  181 |     if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
  182 |       await priceInput.fill('50000')
  183 |     }
  184 |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  185 | 
  186 |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  187 |     await expect(page.getByText(comboName)).toBeVisible({ timeout: 5_000 })
  188 |   })
  189 | 
  190 |   // A8: Combo edited → change reflected in list
  191 |   test('A8 — combo edited name reflects in combo list', async ({ page }) => {
  192 |     await loginAs(page, 'manager')
  193 |     await page.goto('/admin/combos')
  194 |     await expect(
  195 |       page.getByRole('heading', { name: /Combo|Set|Bộ/i })
  196 |     ).toBeVisible({ timeout: 10_000 })
  197 | 
  198 |     const comboName = `A8 Combo ${Date.now()}`
  199 |     const updatedName = `${comboName} v2`
  200 | 
  201 |     await page.getByRole('button', { name: /Thêm combo|\+ Combo|Tạo combo|Tạo/i }).click()
  202 |     const nameInput = page.getByPlaceholder(/tên combo|combo name|Tên/i).first()
  203 |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  204 |     await nameInput.fill(comboName)
  205 |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  206 |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  207 | 
  208 |     const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: comboName })
  209 |     await expect(row).toBeVisible({ timeout: 5_000 })
  210 |     await row.getByRole('button', { name: /Sửa|Edit/i }).click()
  211 | 
  212 |     const editInput = page.getByDisplayValue(comboName)
  213 |     await expect(editInput).toBeVisible({ timeout: 5_000 })
  214 |     await editInput.fill(updatedName)
  215 |     await page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).last().click()
  216 | 
  217 |     await expect(page.getByText(/Đã cập nhật|thành công/i)).toBeVisible({ timeout: 8_000 })
  218 |     await expect(page.getByText(updatedName)).toBeVisible()
  219 |   })
  220 | })
  221 | 
  222 | // ─── B — Staff Account Management ────────────────────────────────────────────
  223 | 
  224 | test.describe('B — Staff Account Management', () => {
  225 |   test.describe.configure({ mode: 'serial' })
  226 | 
  227 |   // B1: Staff (chef/cashier) created by manager → appears in staff list
  228 |   test('B1 — manager creates chef account → appears in list', async ({ page }) => {
  229 |     await loginAs(page, 'manager')
  230 |     await page.goto('/admin/staff')
  231 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  232 | 
  233 |     const username = `b1_chef_${Date.now()}`
  234 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  235 |     await page.getByPlaceholder('chef_an').fill(username)
  236 |     await page.locator('input[type="password"]').fill('E2eTest1')
  237 |     await page.getByPlaceholder('Nguyễn Văn An').fill('B1 Test Chef')
> 238 |     await page.locator('select').selectOption('chef')
      |                                  ^ Error: locator.selectOption: Error: strict mode violation: locator('select') resolved to 3 elements:
  239 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  240 | 
  241 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  242 |     await expect(page.getByText(username)).toBeVisible({ timeout: 5_000 })
  243 |   })
  244 | 
  245 |   // B2: Manager account created by admin only; manager cannot create another manager
  246 |   test('B2 — admin creates manager account successfully', async ({ page }) => {
  247 |     await loginAs(page, 'admin')
  248 |     await page.goto('/admin/staff')
  249 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  250 | 
  251 |     const username = `b2_mgr_${Date.now()}`
  252 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  253 |     await page.getByPlaceholder('chef_an').fill(username)
  254 |     await page.locator('input[type="password"]').fill('E2eTest1')
  255 |     await page.getByPlaceholder('Nguyễn Văn An').fill('B2 Test Manager')
  256 |     await page.locator('select').selectOption('manager')
  257 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  258 | 
  259 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  260 |     await expect(page.getByText(username)).toBeVisible({ timeout: 5_000 })
  261 |   })
  262 | 
  263 |   test('B2 — manager cannot create another manager account', async ({ page }) => {
  264 |     await loginAs(page, 'manager')
  265 |     await page.goto('/admin/staff')
  266 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  267 | 
  268 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  269 |     // "manager" role option should not be available in the select
  270 |     const managerOption = page.locator('select option[value="manager"]')
  271 |     await expect(managerOption).toHaveCount(0)
  272 |   })
  273 | 
  274 |   // B3: Staff role changed → updated role badge visible
  275 |   test('B3 — staff role changed reflects updated role badge', async ({ page }) => {
  276 |     await loginAs(page, 'admin')
  277 |     await page.goto('/admin/staff')
  278 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  279 | 
  280 |     const username = `b3_staff_${Date.now()}`
  281 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  282 |     await page.getByPlaceholder('chef_an').fill(username)
  283 |     await page.locator('input[type="password"]').fill('E2eTest1')
  284 |     await page.getByPlaceholder('Nguyễn Văn An').fill('B3 Role Change')
  285 |     await page.locator('select').selectOption('chef')
  286 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  287 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  288 | 
  289 |     const row = page.locator('tr').filter({ hasText: username })
  290 |     await expect(row).toBeVisible({ timeout: 5_000 })
  291 |     await row.getByRole('button', { name: /Sửa/i }).click()
  292 | 
  293 |     // Change role from chef to cashier
  294 |     await page.locator('select').selectOption('cashier')
  295 |     await page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).last().click()
  296 | 
  297 |     await expect(page.getByText(/Đã cập nhật/i)).toBeVisible({ timeout: 8_000 })
  298 |     // Row should now show cashier badge
  299 |     await expect(
  300 |       page.locator('tr').filter({ hasText: username }).getByText(/cashier|Cashier|Thu ngân/i)
  301 |     ).toBeVisible({ timeout: 5_000 })
  302 |   })
  303 | 
  304 |   // B4: Staff account deactivated → hidden from list / marked inactive
  305 |   test('B4 — deactivated staff account hidden or marked inactive', async ({ page }) => {
  306 |     await loginAs(page, 'manager')
  307 |     await page.goto('/admin/staff')
  308 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  309 | 
  310 |     const username = `b4_deact_${Date.now()}`
  311 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  312 |     await page.getByPlaceholder('chef_an').fill(username)
  313 |     await page.locator('input[type="password"]').fill('E2eTest1')
  314 |     await page.getByPlaceholder('Nguyễn Văn An').fill('B4 Deactivate')
  315 |     await page.locator('select').selectOption('cashier')
  316 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  317 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  318 | 
  319 |     const row = page.locator('tr').filter({ hasText: username })
  320 |     await expect(row).toBeVisible({ timeout: 5_000 })
  321 |     const statusBtn = row.getByRole('button', { name: 'Đang hoạt động' })
  322 |     await expect(statusBtn).toBeVisible()
  323 |     await statusBtn.click()
  324 | 
  325 |     await expect(page.getByText('Đã cập nhật trạng thái')).toBeVisible({ timeout: 8_000 })
  326 |     await expect(row.getByRole('button', { name: 'Vô hiệu' })).toBeVisible()
  327 |   })
  328 | 
  329 |   // B5: Manager tries to manage another manager → 403 INSUFFICIENT_ROLE
  330 |   test('B5 — manager cannot deactivate another manager (403)', async ({ page }) => {
  331 |     await loginAs(page, 'admin')
  332 |     await page.goto('/admin/staff')
  333 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  334 | 
  335 |     // Create a manager account to target
  336 |     const targetMgr = `b5_target_mgr_${Date.now()}`
  337 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  338 |     await page.getByPlaceholder('chef_an').fill(targetMgr)
```