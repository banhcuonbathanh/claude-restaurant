# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staff-internal-reactions.spec.ts >> A — Product & Menu Operations >> A1 — product added appears in product list
- Location: tests/staff-internal-reactions.spec.ts:15:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Đã tạo|thành công/i)
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText(/Đã tạo|thành công/i)

```

```yaml
- heading "Quản trị hệ thống" [level=1]
- navigation:
  - link "Tổng quan":
    - /url: /admin/overview
  - link "Tổng kết":
    - /url: /admin/summary
  - link "Sản phẩm":
    - /url: /admin/products
  - link "Combo":
    - /url: /admin/combos
  - link "Danh mục":
    - /url: /admin/categories
  - link "Topping":
    - /url: /admin/toppings
  - link "Nhân viên":
    - /url: /admin/staff
  - link "Công việc":
    - /url: /admin/todo-list
  - link "Kho nguyên liệu":
    - /url: /admin/ingredients
  - link "Marketing":
    - /url: /admin/marketing
  - link "Đào tạo":
    - /url: /admin/training
- heading "Sản phẩm (15)" [level=2]
- button "🌱 Dữ liệu mẫu"
- button "+ Thêm sản phẩm"
- table:
  - rowgroup:
    - row "Tên sản phẩm Danh mục Topping Giá Trạng thái":
      - columnheader
      - columnheader "Tên sản phẩm"
      - columnheader "Danh mục"
      - columnheader "Topping"
      - columnheader "Giá"
      - columnheader "Trạng thái"
      - columnheader
  - rowgroup:
    - row "banh cuon banh cuon banh cuon topping 2 4.000 ₫ Hết hàng Sửa Xóa":
      - cell "banh cuon":
        - img "banh cuon"
      - cell "banh cuon"
      - cell "banh cuon"
      - cell "topping 2"
      - cell "4.000 ₫"
      - cell "Hết hàng"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "gio gio banh cuon — 9.000 ₫ Hết hàng Sửa Xóa":
      - cell "gio":
        - img "gio"
      - cell "gio"
      - cell "banh cuon"
      - cell "—"
      - cell "9.000 ₫"
      - cell "Hết hàng"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "trung trung banh cuon — 9.000 ₫ Hết hàng Sửa Xóa":
      - cell "trung":
        - img "trung"
      - cell "trung"
      - cell "banh cuon"
      - cell "—"
      - cell "9.000 ₫"
      - cell "Hết hàng"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "🍜 BÃ¡nh Cuá»‘n Thá»‹t HÃ nh phi Ruá»‘c tÃ´m +1 more 45.000 ₫ Đang bán Sửa Xóa":
      - cell "🍜"
      - cell "BÃ¡nh Cuá»‘n Thá»‹t"
      - cell
      - cell "HÃ nh phi Ruá»‘c tÃ´m +1 more"
      - cell "45.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "🍜 Nem RÃ¡n MÃ³n Phá»¥ — 35.000 ₫ Đang bán Sửa Xóa":
      - cell "🍜"
      - cell "Nem RÃ¡n"
      - cell "MÃ³n Phá»¥"
      - cell "—"
      - cell "35.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - 'row "🍜 TrÃ ÄÃ¡ Äá»“ Uá»‘ng — 10.000 ₫ Đang bán Sửa Xóa"':
      - cell "🍜"
      - 'cell "TrÃ ÄÃ¡"'
      - 'cell "Äá»“ Uá»‘ng"'
      - cell "—"
      - cell "10.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "🍜 BÃ¡nh Cuá»‘n TÃ´m HÃ nh phi Ruá»‘c tÃ´m +1 more 50.000 ₫ Đang bán Sửa Xóa":
      - cell "🍜"
      - cell "BÃ¡nh Cuá»‘n TÃ´m"
      - cell
      - cell "HÃ nh phi Ruá»‘c tÃ´m +1 more"
      - cell "50.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "🍜 Cháº£ GiÃ² MÃ³n Phá»¥ — 35.000 ₫ Đang bán Sửa Xóa":
      - cell "🍜"
      - cell "Cháº£ GiÃ²"
      - cell "MÃ³n Phá»¥"
      - cell "—"
      - cell "35.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - 'row "🍜 NÆ°á»›c Chanh Äá»“ Uá»‘ng — 20.000 ₫ Đang bán Sửa Xóa"':
      - cell "🍜"
      - cell "NÆ°á»›c Chanh"
      - 'cell "Äá»“ Uá»‘ng"'
      - cell "—"
      - cell "20.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "🍜 BÃ¡nh Cuá»‘n Tháºp Cáº©m HÃ nh phi Ruá»‘c tÃ´m +3 more 55.000 ₫ Đang bán Sửa Xóa":
      - cell "🍜"
      - cell "BÃ¡nh Cuá»‘n Tháºp Cáº©m"
      - cell
      - cell "HÃ nh phi Ruá»‘c tÃ´m +3 more"
      - cell "55.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "🍜 Cháº£ Lá»¥a MÃ³n Phá»¥ — 25.000 ₫ Đang bán Sửa Xóa":
      - cell "🍜"
      - cell "Cháº£ Lá»¥a"
      - cell "MÃ³n Phá»¥"
      - cell "—"
      - cell "25.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - 'row "🍜 NÆ°á»›c Cam Äá»“ Uá»‘ng — 25.000 ₫ Đang bán Sửa Xóa"':
      - cell "🍜"
      - cell "NÆ°á»›c Cam"
      - 'cell "Äá»“ Uá»‘ng"'
      - cell "—"
      - cell "25.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "🍜 BÃ¡nh Cuá»‘n Trá»©ng HÃ nh phi Trá»©ng chiÃªn 40.000 ₫ Đang bán Sửa Xóa":
      - cell "🍜"
      - cell "BÃ¡nh Cuá»‘n Trá»©ng"
      - cell
      - cell "HÃ nh phi Trá»©ng chiÃªn"
      - cell "40.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - 'row "🍜 CÃ PhÃª Sá»¯a Äá»“ Uá»‘ng — 30.000 ₫ Đang bán Sửa Xóa"':
      - cell "🍜"
      - cell "CÃ PhÃª Sá»¯a"
      - 'cell "Äá»“ Uá»‘ng"'
      - cell "—"
      - cell "30.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - 'row "🍜 Gá»i Cuá»‘n MÃ³n Phá»¥ ThÃªm tÃ´m ThÃªm thá»‹t 40.000 ₫ Đang bán Sửa Xóa"':
      - cell "🍜"
      - 'cell "Gá»i Cuá»‘n"'
      - cell "MÃ³n Phá»¥"
      - cell "ThÃªm tÃ´m ThÃªm thá»‹t"
      - cell "40.000 ₫"
      - cell "Đang bán"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
- heading "Thêm sản phẩm" [level=3]
- text: Danh mục
- combobox:
  - option "-- Chọn danh mục --" [selected]
  - option "banh cuon"
  - option "MÃ³n Phá»¥"
  - 'option "Äá»“ Uá»‘ng"'
  - option "Combo"
- paragraph: Chọn danh mục
- text: Tên sản phẩm
- textbox "Bánh cuốn nhân tôm": A1 Test Bánh 1780276686526
- text: Mô tả (tuỳ chọn)
- textbox
- text: Hình ảnh Chưa có ảnh
- button "Chọn ảnh"
- text: Giá (₫)
- spinbutton: "25000"
- text: Thứ tự
- spinbutton: "0"
- text: Topping áp dụng
- checkbox "Chả quế +8.000 ₫"
- text: Chả quế +8.000 ₫
- checkbox "Chả quế +8.000 ₫"
- text: Chả quế +8.000 ₫
- checkbox "Chả quế +8.000 ₫"
- text: Chả quế +8.000 ₫
- checkbox "Cháº£ lá»¥a thÃªm +15.000 ₫"
- text: Cháº£ lá»¥a thÃªm +15.000 ₫
- checkbox "Giò lụa +10.000 ₫"
- text: Giò lụa +10.000 ₫
- checkbox "Giò lụa +10.000 ₫"
- text: Giò lụa +10.000 ₫
- checkbox "Giò lụa +10.000 ₫"
- text: Giò lụa +10.000 ₫
- checkbox "HÃ nh phi +5.000 ₫"
- text: HÃ nh phi +5.000 ₫
- checkbox "Hành phi Miễn phí"
- text: Hành phi Miễn phí
- checkbox "Hành phi Miễn phí"
- text: Hành phi Miễn phí
- checkbox "Hành phi Miễn phí"
- text: Hành phi Miễn phí
- checkbox "Ruá»‘c tÃ´m +10.000 ₫"
- text: Ruá»‘c tÃ´m +10.000 ₫
- checkbox "ThÃªm tÃ´m +25.000 ₫"
- text: ThÃªm tÃ´m +25.000 ₫
- checkbox "ThÃªm thá»‹t +20.000 ₫"
- text: ThÃªm thá»‹t +20.000 ₫
- checkbox "Tôm tươi +15.000 ₫"
- text: Tôm tươi +15.000 ₫
- checkbox "Tôm tươi +15.000 ₫"
- text: Tôm tươi +15.000 ₫
- checkbox "Tôm tươi +15.000 ₫"
- text: Tôm tươi +15.000 ₫
- checkbox "topping 1 +12 ₫"
- text: topping 1 +12 ₫
- checkbox "topping 2 +1 ₫"
- text: topping 2 +1 ₫
- checkbox "Trá»©ng chiÃªn +15.000 ₫"
- text: Trá»©ng chiÃªn +15.000 ₫
- checkbox "Trứng chiên +5.000 ₫"
- text: Trứng chiên +5.000 ₫
- checkbox "Trứng chiên +5.000 ₫"
- text: Trứng chiên +5.000 ₫
- checkbox "Trứng chiên +5.000 ₫"
- text: Trứng chiên +5.000 ₫
- button "Huỷ"
- button "Lưu"
- region "Notifications alt+T"
- alert
- paragraph:
  - text: Chúng tôi dùng cookies và bộ nhớ trình duyệt để lưu giỏ hàng và trạng thái đơn hàng. Không có dữ liệu thẻ ngân hàng nào được lưu. Xem
  - link "Chính sách bảo mật":
    - /url: /privacy-policy
  - text: .
- button "Đồng ý"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { loginAs, loginAsGuest, QR } from '../fixtures/auth'
  3   | 
  4   | /**
  5   |  * Staff Internal Operations — Actor Reactions
  6   |  * Covers all events in FLOW_STAFF_INTERNAL_REACTIONS.md (sections A–E).
  7   |  */
  8   | 
  9   | // ─── A — Product & Menu Operations ───────────────────────────────────────────
  10  | 
  11  | test.describe('A — Product & Menu Operations', () => {
  12  |   test.describe.configure({ mode: 'serial' })
  13  | 
  14  |   // A1: Product added → appears in list for admin/manager
  15  |   test('A1 — product added appears in product list', async ({ page }) => {
  16  |     await loginAs(page, 'manager')
  17  |     await page.goto('/admin/products')
  18  |     await expect(page.getByRole('heading', { name: /Sản phẩm|Products/i })).toBeVisible({ timeout: 10_000 })
  19  | 
  20  |     const productName = `A1 Test Bánh ${Date.now()}`
  21  |     await page.getByRole('button', { name: /Thêm sản phẩm|Tạo sản phẩm|\+ Sản phẩm/i }).click()
  22  |     const nameInput = page.getByPlaceholder(/tên sản phẩm|product name|Bánh cuốn/i).first()
  23  |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  24  |     await nameInput.fill(productName)
  25  |     const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
  26  |     if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
  27  |       await priceInput.fill('25000')
  28  |     }
  29  |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  30  | 
> 31  |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
      |                                                        ^ Error: expect(locator).toBeVisible() failed
  32  |     await expect(page.getByText(productName)).toBeVisible({ timeout: 5_000 })
  33  |   })
  34  | 
  35  |   // A2: Product edited → updated in list
  36  |   test('A2 — product edited name/price reflects in list', async ({ page }) => {
  37  |     await loginAs(page, 'manager')
  38  |     await page.goto('/admin/products')
  39  |     await expect(page.getByRole('heading', { name: /Sản phẩm|Products/i })).toBeVisible({ timeout: 10_000 })
  40  | 
  41  |     const productName = `A2 Edit Prod ${Date.now()}`
  42  |     const updatedName = `${productName} Updated`
  43  | 
  44  |     await page.getByRole('button', { name: /Thêm sản phẩm|Tạo sản phẩm|\+ Sản phẩm/i }).click()
  45  |     const nameInput = page.getByPlaceholder(/tên sản phẩm|product name|Bánh cuốn/i).first()
  46  |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  47  |     await nameInput.fill(productName)
  48  |     const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
  49  |     if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
  50  |       await priceInput.fill('30000')
  51  |     }
  52  |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  53  |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  54  | 
  55  |     const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: productName })
  56  |     await expect(row).toBeVisible({ timeout: 5_000 })
  57  |     await row.getByRole('button', { name: /Sửa|Edit/i }).click()
  58  | 
  59  |     const editInput = page.getByDisplayValue(productName)
  60  |     await expect(editInput).toBeVisible({ timeout: 5_000 })
  61  |     await editInput.fill(updatedName)
  62  |     await page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).last().click()
  63  | 
  64  |     await expect(page.getByText(/Đã cập nhật|cập nhật thành công|thành công/i)).toBeVisible({ timeout: 8_000 })
  65  |     await expect(page.getByText(updatedName)).toBeVisible()
  66  |   })
  67  | 
  68  |   // A3: Product deactivated/deleted → removed from list
  69  |   test('A3 — deactivated product disappears from list', async ({ page }) => {
  70  |     await loginAs(page, 'manager')
  71  |     await page.goto('/admin/products')
  72  |     await expect(page.getByRole('heading', { name: /Sản phẩm|Products/i })).toBeVisible({ timeout: 10_000 })
  73  | 
  74  |     const productName = `A3 Del Prod ${Date.now()}`
  75  | 
  76  |     await page.getByRole('button', { name: /Thêm sản phẩm|Tạo sản phẩm|\+ Sản phẩm/i }).click()
  77  |     const nameInput = page.getByPlaceholder(/tên sản phẩm|product name|Bánh cuốn/i).first()
  78  |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  79  |     await nameInput.fill(productName)
  80  |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  81  |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  82  | 
  83  |     const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: productName })
  84  |     await expect(row).toBeVisible({ timeout: 5_000 })
  85  |     const deleteBtn = row.getByRole('button', { name: /Xoá|Ẩn|Deactivate|Vô hiệu/i })
  86  |     if (await deleteBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
  87  |       await deleteBtn.click()
  88  |       const confirmBtn = page.getByRole('button', { name: /Xác nhận|Confirm|OK/i })
  89  |       if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
  90  |         await confirmBtn.click()
  91  |       }
  92  |       await expect(page.getByText(/Đã xoá|Đã ẩn|vô hiệu|thành công/i)).toBeVisible({ timeout: 8_000 })
  93  |     }
  94  |   })
  95  | 
  96  |   // A4: Topping added → appears in topping list
  97  |   test('A4 — topping added appears in topping list', async ({ page }) => {
  98  |     await loginAs(page, 'manager')
  99  |     await page.goto('/admin/toppings')
  100 |     await expect(page.getByRole('heading', { name: /Topping/i })).toBeVisible({ timeout: 10_000 })
  101 | 
  102 |     const toppingName = `A4 Topping ${Date.now()}`
  103 |     await page.getByRole('button', { name: /Thêm topping|\+ Topping|Tạo/i }).click()
  104 |     const nameInput = page.getByPlaceholder(/tên topping|topping name/i).first()
  105 |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  106 |     await nameInput.fill(toppingName)
  107 |     const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
  108 |     if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
  109 |       await priceInput.fill('5000')
  110 |     }
  111 |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  112 | 
  113 |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  114 |     await expect(page.getByText(toppingName)).toBeVisible({ timeout: 5_000 })
  115 |   })
  116 | 
  117 |   // A5: Topping edited → updated in list
  118 |   test('A5 — topping edited reflects updated name', async ({ page }) => {
  119 |     await loginAs(page, 'manager')
  120 |     await page.goto('/admin/toppings')
  121 |     await expect(page.getByRole('heading', { name: /Topping/i })).toBeVisible({ timeout: 10_000 })
  122 | 
  123 |     const toppingName = `A5 Topping ${Date.now()}`
  124 |     const updatedName = `${toppingName} v2`
  125 | 
  126 |     await page.getByRole('button', { name: /Thêm topping|\+ Topping|Tạo/i }).click()
  127 |     const nameInput = page.getByPlaceholder(/tên topping|topping name/i).first()
  128 |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  129 |     await nameInput.fill(toppingName)
  130 |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  131 |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
```