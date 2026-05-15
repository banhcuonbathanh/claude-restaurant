# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin — Staff management >> edit an existing staff member full name
- Location: tests/admin.spec.ts:43:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Đã tạo tài khoản nhân viên')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText('Đã tạo tài khoản nhân viên')

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
  - link "Kho nguyên liệu":
    - /url: /admin/ingredients
  - link "Marketing":
    - /url: /admin/marketing
- heading "Nhân viên (8)" [level=2]
- button "+ Thêm nhân viên"
- table:
  - rowgroup:
    - row "Tên đầy đủ Username Vai trò Trạng thái":
      - columnheader "Tên đầy đủ"
      - columnheader "Username"
      - columnheader "Vai trò"
      - columnheader "Trạng thái"
      - columnheader
  - rowgroup:
    - row "E2E Test Chef e2e_chef_1778828525438 Bếp Đang hoạt động Sửa Xóa":
      - cell "E2E Test Chef"
      - cell "e2e_chef_1778828525438"
      - cell "Bếp"
      - cell "Đang hoạt động":
        - button "Đang hoạt động"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "Tráº§n Quáº£n LÃ½ manager1 Quản lý Đang hoạt động Sửa Xóa":
      - cell "Tráº§n Quáº£n LÃ½"
      - cell "manager1"
      - cell "Quản lý"
      - cell "Đang hoạt động":
        - button "Đang hoạt động"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - 'row "LÃª Äáº§u Báº¿p chef1 Bếp Đang hoạt động Sửa Xóa"':
      - 'cell "LÃª Äáº§u Báº¿p"'
      - cell "chef1"
      - cell "Bếp"
      - cell "Đang hoạt động":
        - button "Đang hoạt động"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "Pháº¡m Thu NgÃ¢n cashier1 Thu ngân Đang hoạt động Sửa Xóa":
      - cell "Pháº¡m Thu NgÃ¢n"
      - cell "cashier1"
      - cell "Thu ngân"
      - cell "Đang hoạt động":
        - button "Đang hoạt động"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "Nguyễn Văn Bếp chef_demo01 Bếp Đang hoạt động Sửa Xóa":
      - cell "Nguyễn Văn Bếp"
      - cell "chef_demo01"
      - cell "Bếp"
      - cell "Đang hoạt động":
        - button "Đang hoạt động"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "Lê Văn Phục staff_demo01 Nhân viên Đang hoạt động Sửa Xóa":
      - cell "Lê Văn Phục"
      - cell "staff_demo01"
      - cell "Nhân viên"
      - cell "Đang hoạt động":
        - button "Đang hoạt động"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "Trần Thị Thu cashier01 Thu ngân Đang hoạt động Sửa Xóa":
      - cell "Trần Thị Thu"
      - cell "cashier01"
      - cell "Thu ngân"
      - cell "Đang hoạt động":
        - button "Đang hoạt động"
      - cell "Sửa Xóa":
        - button "Sửa"
        - button "Xóa"
    - row "Admin admin Admin Đang hoạt động Sửa":
      - cell "Admin"
      - cell "admin"
      - cell "Admin"
      - cell "Đang hoạt động":
        - button "Đang hoạt động" [disabled]
      - cell "Sửa":
        - button "Sửa"
- heading "Thêm nhân viên" [level=3]
- text: Username
- textbox "chef_an": e2e_chef_1778828525438
- text: Mật khẩu
- textbox: E2eTest1
- text: Tên đầy đủ
- textbox "Nguyễn Văn An": Original Name
- text: Vai trò
- combobox:
  - option "Bếp" [selected]
  - option "Thu ngân"
  - option "Nhân viên"
  - option "Quản lý"
- text: Số điện thoại
- textbox "0901234567"
- text: Email
- textbox "an@quán.vn"
- button "Huỷ"
- button "Tạo tài khoản"
- region "Notifications alt+T"
- alert
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
> 51 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  52 | 
  53 |     // Find the row for the new staff and click "Sửa"
  54 |     const row = page.locator('tr').filter({ hasText: username })
  55 |     await expect(row).toBeVisible({ timeout: 5_000 })
  56 |     await row.getByRole('button', { name: 'Sửa' }).click()
  57 | 
  58 |     // Edit modal heading includes the username
  59 |     await expect(page.getByText(`Sửa nhân viên — ${username}`)).toBeVisible()
  60 |     const nameInput = page.getByPlaceholder('Nguyễn Văn An')
  61 |     await nameInput.clear()
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