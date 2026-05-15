# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin — Staff management >> edit an existing staff member full name
- Location: tests/admin.spec.ts:43:7

# Error details

```
TimeoutError: locator.clear: Timeout 15000ms exceeded.
Call log:
  - waiting for getByPlaceholder('Nguyễn Văn An')

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
        - link "Kho nguyên liệu" [ref=e13] [cursor=pointer]:
          - /url: /admin/ingredients
        - link "Marketing" [ref=e14] [cursor=pointer]:
          - /url: /admin/marketing
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Nhân viên (9)" [level=2] [ref=e18]
        - button "+ Thêm nhân viên" [ref=e19] [cursor=pointer]
      - table [ref=e21]:
        - rowgroup [ref=e22]:
          - row "Tên đầy đủ Username Vai trò Trạng thái" [ref=e23]:
            - columnheader "Tên đầy đủ" [ref=e24]
            - columnheader "Username" [ref=e25]
            - columnheader "Vai trò" [ref=e26]
            - columnheader "Trạng thái" [ref=e27]
            - columnheader [ref=e28]
        - rowgroup [ref=e29]:
          - row "Original Name e2e_chef_1778828536407 Bếp Đang hoạt động Sửa Xóa" [ref=e30]:
            - cell "Original Name" [ref=e31]
            - cell "e2e_chef_1778828536407" [ref=e32]
            - cell "Bếp" [ref=e33]
            - cell "Đang hoạt động" [ref=e34]:
              - button "Đang hoạt động" [ref=e35] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e36]:
              - generic [ref=e37]:
                - button "Sửa" [active] [ref=e38] [cursor=pointer]
                - button "Xóa" [ref=e39] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778828525438 Bếp Đang hoạt động Sửa Xóa" [ref=e40]:
            - cell "E2E Test Chef" [ref=e41]
            - cell "e2e_chef_1778828525438" [ref=e42]
            - cell "Bếp" [ref=e43]
            - cell "Đang hoạt động" [ref=e44]:
              - button "Đang hoạt động" [ref=e45] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e46]:
              - generic [ref=e47]:
                - button "Sửa" [ref=e48] [cursor=pointer]
                - button "Xóa" [ref=e49] [cursor=pointer]
          - row "Tráº§n Quáº£n LÃ½ manager1 Quản lý Đang hoạt động Sửa Xóa" [ref=e50]:
            - cell "Tráº§n Quáº£n LÃ½" [ref=e51]
            - cell "manager1" [ref=e52]
            - cell "Quản lý" [ref=e53]
            - cell "Đang hoạt động" [ref=e54]:
              - button "Đang hoạt động" [ref=e55] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e56]:
              - generic [ref=e57]:
                - button "Sửa" [ref=e58] [cursor=pointer]
                - button "Xóa" [ref=e59] [cursor=pointer]
          - 'row "LÃª Äáº§u Báº¿p chef1 Bếp Đang hoạt động Sửa Xóa" [ref=e60]':
            - 'cell "LÃª Äáº§u Báº¿p" [ref=e61]'
            - cell "chef1" [ref=e62]
            - cell "Bếp" [ref=e63]
            - cell "Đang hoạt động" [ref=e64]:
              - button "Đang hoạt động" [ref=e65] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e66]:
              - generic [ref=e67]:
                - button "Sửa" [ref=e68] [cursor=pointer]
                - button "Xóa" [ref=e69] [cursor=pointer]
          - row "Pháº¡m Thu NgÃ¢n cashier1 Thu ngân Đang hoạt động Sửa Xóa" [ref=e70]:
            - cell "Pháº¡m Thu NgÃ¢n" [ref=e71]
            - cell "cashier1" [ref=e72]
            - cell "Thu ngân" [ref=e73]
            - cell "Đang hoạt động" [ref=e74]:
              - button "Đang hoạt động" [ref=e75] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e76]:
              - generic [ref=e77]:
                - button "Sửa" [ref=e78] [cursor=pointer]
                - button "Xóa" [ref=e79] [cursor=pointer]
          - row "Nguyễn Văn Bếp chef_demo01 Bếp Đang hoạt động Sửa Xóa" [ref=e80]:
            - cell "Nguyễn Văn Bếp" [ref=e81]
            - cell "chef_demo01" [ref=e82]
            - cell "Bếp" [ref=e83]
            - cell "Đang hoạt động" [ref=e84]:
              - button "Đang hoạt động" [ref=e85] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e86]:
              - generic [ref=e87]:
                - button "Sửa" [ref=e88] [cursor=pointer]
                - button "Xóa" [ref=e89] [cursor=pointer]
          - row "Lê Văn Phục staff_demo01 Nhân viên Đang hoạt động Sửa Xóa" [ref=e90]:
            - cell "Lê Văn Phục" [ref=e91]
            - cell "staff_demo01" [ref=e92]
            - cell "Nhân viên" [ref=e93]
            - cell "Đang hoạt động" [ref=e94]:
              - button "Đang hoạt động" [ref=e95] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e96]:
              - generic [ref=e97]:
                - button "Sửa" [ref=e98] [cursor=pointer]
                - button "Xóa" [ref=e99] [cursor=pointer]
          - row "Trần Thị Thu cashier01 Thu ngân Đang hoạt động Sửa Xóa" [ref=e100]:
            - cell "Trần Thị Thu" [ref=e101]
            - cell "cashier01" [ref=e102]
            - cell "Thu ngân" [ref=e103]
            - cell "Đang hoạt động" [ref=e104]:
              - button "Đang hoạt động" [ref=e105] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e106]:
              - generic [ref=e107]:
                - button "Sửa" [ref=e108] [cursor=pointer]
                - button "Xóa" [ref=e109] [cursor=pointer]
          - row "Admin admin Admin Đang hoạt động Sửa" [ref=e110]:
            - cell "Admin" [ref=e111]
            - cell "admin" [ref=e112]
            - cell "Admin" [ref=e113]
            - cell "Đang hoạt động" [ref=e114]:
              - button "Đang hoạt động" [disabled] [ref=e115]
            - cell "Sửa" [ref=e116]:
              - button "Sửa" [ref=e118] [cursor=pointer]
      - generic [ref=e120]:
        - heading "Sửa nhân viên — e2e_chef_1778828536407" [level=3] [ref=e122]
        - generic [ref=e123]:
          - generic [ref=e124]:
            - generic [ref=e125]: Tên đầy đủ
            - textbox [ref=e126]: Original Name
          - generic [ref=e127]:
            - generic [ref=e128]: Vai trò
            - combobox [ref=e129]:
              - option "Bếp" [selected]
              - option "Thu ngân"
              - option "Nhân viên"
              - option "Quản lý"
          - generic [ref=e130]:
            - generic [ref=e131]:
              - generic [ref=e132]: Số điện thoại
              - textbox [ref=e133]
            - generic [ref=e134]:
              - generic [ref=e135]: Email
              - textbox [ref=e136]
          - generic [ref=e137]:
            - button "Huỷ" [ref=e138] [cursor=pointer]
            - button "Lưu" [ref=e139] [cursor=pointer]
  - region "Notifications alt+T"
  - alert [ref=e140]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { loginAs } from '../fixtures/auth'
  3  | 
  4  | /**
  5  |  * Flow 3: Admin creates a staff member, edits it, and toggles status.
  6  |  * Uses a timestamp-based username to avoid collisions across test runs.
  7  |  * Requires: docker compose up -d + seed data applied.
  8  |  */
  9  | test.describe('Admin — Staff management', () => {
  10 |   // Unique username for each test run to avoid conflicts
  11 |   const ts       = Date.now()
  12 |   const username = `e2e_chef_${ts}`
  13 | 
  14 |   test.beforeEach(async ({ page }) => {
  15 |     await loginAs(page, 'admin')
  16 |     await page.goto('/admin/staff')
  17 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  18 |   })
  19 | 
  20 |   test('create a new staff member', async ({ page }) => {
  21 |     // Open modal
  22 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  23 |     await expect(page.getByRole('heading', { name: 'Thêm nhân viên' })).toBeVisible()
  24 | 
  25 |     // Fill form
  26 |     await page.getByPlaceholder('chef_an').fill(username)
  27 |     await page.locator('input[type="password"]').fill('E2eTest1')
  28 |     await page.getByPlaceholder('Nguyễn Văn An').fill('E2E Test Chef')
  29 | 
  30 |     // Select role: pick "Bếp" from the select
  31 |     await page.locator('select').selectOption('chef')
  32 | 
  33 |     // Submit
  34 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  35 | 
  36 |     // Success toast
  37 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  38 | 
  39 |     // New staff row appears in the table
  40 |     await expect(page.getByText(username)).toBeVisible({ timeout: 5_000 })
  41 |   })
  42 | 
  43 |   test('edit an existing staff member full name', async ({ page }) => {
  44 |     // Create first, then edit
  45 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  46 |     await page.getByPlaceholder('chef_an').fill(username)
  47 |     await page.locator('input[type="password"]').fill('E2eTest1')
  48 |     await page.getByPlaceholder('Nguyễn Văn An').fill('Original Name')
  49 |     await page.locator('select').selectOption('chef')
  50 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  51 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  52 | 
  53 |     // Find the row for the new staff and click "Sửa"
  54 |     const row = page.locator('tr').filter({ hasText: username })
  55 |     await expect(row).toBeVisible({ timeout: 5_000 })
  56 |     await row.getByRole('button', { name: 'Sửa' }).click()
  57 | 
  58 |     // Edit modal heading includes the username
  59 |     await expect(page.getByText(`Sửa nhân viên — ${username}`)).toBeVisible()
  60 |     const nameInput = page.getByPlaceholder('Nguyễn Văn An')
> 61 |     await nameInput.clear()
     |                     ^ TimeoutError: locator.clear: Timeout 15000ms exceeded.
  62 |     await nameInput.fill('Updated Name')
  63 |     await page.getByRole('button', { name: 'Lưu' }).click()
  64 | 
  65 |     // Success toast
  66 |     await expect(page.getByText('Đã cập nhật nhân viên')).toBeVisible({ timeout: 8_000 })
  67 | 
  68 |     // Updated name in table
  69 |     await expect(page.getByText('Updated Name')).toBeVisible()
  70 |   })
  71 | 
  72 |   test('toggle staff active status', async ({ page }) => {
  73 |     // Create a staff member to toggle
  74 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  75 |     await page.getByPlaceholder('chef_an').fill(username)
  76 |     await page.locator('input[type="password"]').fill('E2eTest1')
  77 |     await page.getByPlaceholder('Nguyễn Văn An').fill('Status Toggle Test')
  78 |     await page.locator('select').selectOption('cashier')
  79 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  80 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  81 | 
  82 |     // Find the new staff row and click its status toggle (shows "Đang hoạt động")
  83 |     const row = page.locator('tr').filter({ hasText: username })
  84 |     await expect(row).toBeVisible({ timeout: 5_000 })
  85 |     const statusBtn = row.getByRole('button', { name: 'Đang hoạt động' })
  86 |     await expect(statusBtn).toBeVisible()
  87 |     await statusBtn.click()
  88 | 
  89 |     // Toast confirms update
  90 |     await expect(page.getByText('Đã cập nhật trạng thái')).toBeVisible({ timeout: 8_000 })
  91 | 
  92 |     // Status button now shows "Vô hiệu"
  93 |     await expect(row.getByRole('button', { name: 'Vô hiệu' })).toBeVisible()
  94 |   })
  95 | })
  96 | 
```