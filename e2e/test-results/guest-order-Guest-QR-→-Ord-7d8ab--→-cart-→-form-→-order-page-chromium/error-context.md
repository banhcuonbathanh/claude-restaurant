# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-order.spec.ts >> Guest QR → Order flow >> full checkout flow: QR → cart → form → order page
- Location: tests/guest-order.spec.ts:29:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/order/
Received string:  "http://localhost:3000/checkout"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    34 × unexpected value "http://localhost:3000/checkout"

```

```yaml
- banner:
  - button "← Quay lại"
  - heading "Xác Nhận Đơn Hàng" [level=1]
- heading "Đơn hàng của bạn" [level=2]
- paragraph: 1x banh cuon
- paragraph: 4.000 ₫
- text: Tổng cộng 4.000 ₫
- heading "Thông tin liên hệ" [level=2]
- textbox "Họ tên *": Nguyễn Test
- textbox "Số điện thoại *": "0901234567"
- textbox "Ghi chú (tuỳ chọn)"
- heading "Phương thức thanh toán" [level=2]
- radio "💳 VNPay"
- text: 💳 VNPay
- radio "📱 MoMo"
- text: 📱 MoMo
- radio "🏦 ZaloPay"
- text: 🏦 ZaloPay
- radio "💵 Tiền mặt COD" [checked]
- text: 💵 Tiền mặt COD
- button "Đặt hàng · 4.000 ₫"
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
  25 |     const cartBtn = page.getByRole('button', { name: 'Giỏ hàng', exact: true })
  26 |     await expect(cartBtn.locator('span').filter({ hasText: '1' })).toBeVisible()
  27 |   })
  28 | 
  29 |   test('full checkout flow: QR → cart → form → order page', async ({ page }) => {
  30 |     const logs: string[] = []
  31 |     page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`))
  32 | 
  33 |     // Add first available product
  34 |     const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
  35 |     await expect(addBtn).toBeVisible({ timeout: 15_000 })
  36 |     await addBtn.click()
  37 | 
  38 |     // Open cart drawer
  39 |     await page.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
  40 | 
  41 |     // Click "Thanh toán" inside the drawer
  42 |     const checkoutBtn = page.getByRole('button', { name: 'Thanh toán' })
  43 |     await expect(checkoutBtn).toBeVisible()
  44 |     await checkoutBtn.click()
  45 | 
  46 |     // Should land on /checkout
  47 |     await expect(page).toHaveURL(/\/checkout/, { timeout: 10_000 })
  48 | 
  49 |     // Fill in customer info
  50 |     await page.getByPlaceholder('Họ tên *').fill('Nguyễn Test')
  51 |     await page.getByPlaceholder('Số điện thoại *').fill('0901234567')
  52 | 
  53 |     // Select cash payment (it's the default but let's be explicit)
  54 |     await page.getByRole('radio', { name: /Tiền mặt/i }).check()
  55 | 
  56 |     // Submit order
  57 |     const submitBtn = page.getByRole('button', { name: /Đặt hàng/i })
  58 |     await expect(submitBtn).toBeEnabled()
  59 |     await submitBtn.click()
  60 | 
  61 |     // Should redirect to /order after successful submission
  62 |     try {
> 63 |       await expect(page).toHaveURL(/\/order/, { timeout: 15_000 })
     |                          ^ Error: expect(page).toHaveURL(expected) failed
  64 |     } catch (e) {
  65 |       console.log('CAPTURED CONSOLE LOGS:', logs.join('\n'))
  66 |       throw e
  67 |     }
  68 |   })
  69 | 
  70 |   test('checkout form validates required fields', async ({ page }) => {
  71 |     // Add item and reach checkout
  72 |     const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
  73 |     await expect(addBtn).toBeVisible({ timeout: 15_000 })
  74 |     await addBtn.click()
  75 | 
  76 |     await page.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
  77 |     await page.getByRole('button', { name: 'Thanh toán' }).click()
  78 |     await expect(page).toHaveURL(/\/checkout/)
  79 | 
  80 |     // Submit without filling any fields
  81 |     await page.getByRole('button', { name: /Đặt hàng/i }).click()
  82 | 
  83 |     // Expect validation errors
  84 |     await expect(page.getByText('Vui lòng nhập tên')).toBeVisible()
  85 |     await expect(page.getByText('Số điện thoại không hợp lệ')).toBeVisible()
  86 | 
  87 |     // URL must still be /checkout (not redirected)
  88 |     await expect(page).toHaveURL(/\/checkout/)
  89 |   })
  90 | })
  91 | 
```