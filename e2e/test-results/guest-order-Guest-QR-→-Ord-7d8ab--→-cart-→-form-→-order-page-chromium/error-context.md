# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-order.spec.ts >> Guest QR → Order flow >> full checkout flow: QR → cart → form → order page
- Location: tests/guest-order.spec.ts:29:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()

```

```yaml
- banner:
  - heading "Quán Bánh Cuốn" [level=1]
  - link "Cài đặt":
    - /url: /menu/settings
    - img
  - button "Đơn hàng":
    - img
    - text: Đơn hàng
  - button:
    - img
- paragraph: Bánh cuốn tươi — ngon mỗi ngày
- button "Tất cả"
- button "banh cuon"
- main:
  - heading "Combo" [level=2]
  - text: 🍱
  - button "Yêu thích":
    - img
  - paragraph: suat day du
  - paragraph: 30.000 ₫
  - list:
    - listitem: ×1 gio
    - listitem: ×3 banh cuon
    - listitem: ×1 trung
  - link "Chi tiết":
    - /url: /menu/combo/642ba87b-bcf6-4ff8-8237-cedfb2a363e9
  - button:
    - img
  - heading "Món lẻ" [level=2]
  - link "banh cuon":
    - /url: /menu/product/fc13bca2-67df-4927-a4d3-cee1df37ad7d
    - img "banh cuon"
  - button "Yêu thích":
    - img
  - link "banh cuon":
    - /url: /menu/product/fc13bca2-67df-4927-a4d3-cee1df37ad7d
    - paragraph: banh cuon
  - paragraph: 4.000 ₫
  - paragraph: banh cuon nhan thit
  - button "topping 2 +1 ₫"
  - link "Chi tiết":
    - /url: /menu/product/fc13bca2-67df-4927-a4d3-cee1df37ad7d
  - button:
    - img
  - link "gio":
    - /url: /menu/product/ab7ca380-9ab6-4483-84ab-c03b83128b90
    - img "gio"
  - button "Yêu thích":
    - img
  - link "gio":
    - /url: /menu/product/ab7ca380-9ab6-4483-84ab-c03b83128b90
    - paragraph: gio
  - paragraph: 9.000 ₫
  - paragraph: gio
  - link "Chi tiết":
    - /url: /menu/product/ab7ca380-9ab6-4483-84ab-c03b83128b90
  - button:
    - img
  - link "trung":
    - /url: /menu/product/48675a02-f4a0-4578-869d-4192eb31f9a3
    - img "trung"
  - button "Yêu thích":
    - img
  - link "trung":
    - /url: /menu/product/48675a02-f4a0-4578-869d-4192eb31f9a3
    - paragraph: trung
  - paragraph: 9.000 ₫
  - paragraph: nhan thit
  - link "Chi tiết":
    - /url: /menu/product/48675a02-f4a0-4578-869d-4192eb31f9a3
  - button:
    - img
- heading "Giỏ hàng (0 món)" [level=2]
- button:
  - img
- paragraph: Giỏ hàng trống
- text: Tổng cộng 0 ₫
- button "Thanh toán" [disabled]
- button "Tiếp tục chọn món"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { loginAsGuest } from '../fixtures/auth'
  3  | 
  4  | /**
  5  |  * Flow 1: Guest scans QR → browses menu → adds item → checks out → order confirmed.
  6  |  * Requires: docker compose up -d + seed data applied.
  7  |  */
  8  | test.describe('Guest QR → Order flow', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     await loginAsGuest(page)
  11 |   })
  12 | 
  13 |   test('redirects to /menu after QR auth', async ({ page }) => {
  14 |     await expect(page).toHaveURL(/\/menu/)
  15 |     await expect(page.getByRole('heading', { name: /Quán Bánh Cuốn/i })).toBeVisible()
  16 |   })
  17 | 
  18 |   test('can add a product to cart and see badge', async ({ page }) => {
  19 |     // Wait for at least one add-to-cart button to be enabled
  20 |     const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
  21 |     await expect(addBtn).toBeVisible({ timeout: 15_000 })
  22 |     await addBtn.click()
  23 | 
  24 |     // Cart badge should now show "1"
  25 |     const cartBtn = page.getByRole('button', { name: 'Giỏ hàng' })
  26 |     await expect(cartBtn.locator('span').filter({ hasText: '1' })).toBeVisible()
  27 |   })
  28 | 
  29 |   test('full checkout flow: QR → cart → form → order page', async ({ page }) => {
  30 |     // Add first available product
  31 |     const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
> 32 |     await expect(addBtn).toBeVisible({ timeout: 15_000 })
     |                          ^ Error: expect(locator).toBeVisible() failed
  33 |     await addBtn.click()
  34 | 
  35 |     // Open cart drawer
  36 |     await page.getByRole('button', { name: 'Giỏ hàng' }).click()
  37 | 
  38 |     // Click "Thanh toán" inside the drawer
  39 |     const checkoutBtn = page.getByRole('button', { name: 'Thanh toán' })
  40 |     await expect(checkoutBtn).toBeVisible()
  41 |     await checkoutBtn.click()
  42 | 
  43 |     // Should land on /checkout
  44 |     await expect(page).toHaveURL(/\/checkout/, { timeout: 10_000 })
  45 | 
  46 |     // Fill in customer info
  47 |     await page.getByPlaceholder('Họ tên *').fill('Nguyễn Test')
  48 |     await page.getByPlaceholder('Số điện thoại *').fill('0901234567')
  49 | 
  50 |     // Select cash payment (it's the default but let's be explicit)
  51 |     await page.getByRole('radio', { name: /Tiền mặt/i }).check()
  52 | 
  53 |     // Submit order
  54 |     const submitBtn = page.getByRole('button', { name: /Đặt hàng/i })
  55 |     await expect(submitBtn).toBeEnabled()
  56 |     await submitBtn.click()
  57 | 
  58 |     // Should redirect to /order after successful submission
  59 |     await expect(page).toHaveURL(/\/order/, { timeout: 15_000 })
  60 |   })
  61 | 
  62 |   test('checkout form validates required fields', async ({ page }) => {
  63 |     // Add item and reach checkout
  64 |     const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
  65 |     await expect(addBtn).toBeVisible({ timeout: 15_000 })
  66 |     await addBtn.click()
  67 | 
  68 |     await page.getByRole('button', { name: 'Giỏ hàng' }).click()
  69 |     await page.getByRole('button', { name: 'Thanh toán' }).click()
  70 |     await expect(page).toHaveURL(/\/checkout/)
  71 | 
  72 |     // Submit without filling any fields
  73 |     await page.getByRole('button', { name: /Đặt hàng/i }).click()
  74 | 
  75 |     // Expect validation errors
  76 |     await expect(page.getByText('Vui lòng nhập tên')).toBeVisible()
  77 |     await expect(page.getByText('Số điện thoại không hợp lệ')).toBeVisible()
  78 | 
  79 |     // URL must still be /checkout (not redirected)
  80 |     await expect(page).toHaveURL(/\/checkout/)
  81 |   })
  82 | })
  83 | 
```