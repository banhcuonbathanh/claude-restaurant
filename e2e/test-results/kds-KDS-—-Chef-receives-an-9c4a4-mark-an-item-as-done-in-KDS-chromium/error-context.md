# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kds.spec.ts >> KDS — Chef receives and processes order >> chef can mark an item as done in KDS
- Location: tests/kds.spec.ts:54:7

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
  1   | import { test, expect, chromium } from '@playwright/test'
  2   | import { loginAs, loginAsGuest } from '../fixtures/auth'
  3   | 
  4   | /**
  5   |  * Flow 2: Staff chef logs in to KDS, guest places an order via QR,
  6   |  * chef sees the order arrive via WebSocket and marks items as done.
  7   |  *
  8   |  * Uses two independent browser contexts to simulate concurrent users.
  9   |  * Requires: docker compose up -d + seed data applied.
  10  |  */
  11  | test.describe('KDS — Chef receives and processes order', () => {
  12  |   test('new order appears in KDS after guest places it', async ({ browser }) => {
  13  |     // Context 1: Chef logs in and waits at KDS
  14  |     const chefCtx  = await browser.newContext()
  15  |     const chefPage = await chefCtx.newPage()
  16  |     await loginAs(chefPage, 'chef')
  17  |     await chefPage.goto('/kds')
  18  | 
  19  |     // KDS loads (shows empty state or existing orders — either is fine)
  20  |     await expect(chefPage).toHaveURL(/\/kds/)
  21  |     await chefPage.waitForLoadState('networkidle')
  22  | 
  23  |     // Count how many order cards exist before the guest order
  24  |     const cardsBefore = await chefPage.locator('[class*="bg-card"][class*="rounded-xl"][class*="border-2"]').count()
  25  | 
  26  |     // Context 2: Guest places an order
  27  |     const guestCtx  = await browser.newContext()
  28  |     const guestPage = await guestCtx.newPage()
  29  |     await loginAsGuest(guestPage)
  30  | 
  31  |     const addBtn = guestPage.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
  32  |     await expect(addBtn).toBeVisible({ timeout: 15_000 })
  33  |     await addBtn.click()
  34  | 
  35  |     await guestPage.getByRole('button', { name: 'Giỏ hàng' }).click()
  36  |     await guestPage.getByRole('button', { name: 'Thanh toán' }).click()
  37  |     await expect(guestPage).toHaveURL(/\/checkout/)
  38  | 
  39  |     await guestPage.getByPlaceholder('Họ tên *').fill('KDS Test')
  40  |     await guestPage.getByPlaceholder('Số điện thoại *').fill('0901234567')
  41  |     await guestPage.getByRole('radio', { name: /Tiền mặt/i }).check()
  42  |     await guestPage.getByRole('button', { name: /Đặt hàng/i }).click()
  43  |     await expect(guestPage).toHaveURL(/\/order/, { timeout: 15_000 })
  44  | 
  45  |     // Chef page should receive the new order via WebSocket within 10 s
  46  |     await expect(
  47  |       chefPage.locator('[class*="bg-card"][class*="rounded-xl"][class*="border-2"]')
  48  |     ).toHaveCount(cardsBefore + 1, { timeout: 10_000 })
  49  | 
  50  |     await guestCtx.close()
  51  |     await chefCtx.close()
  52  |   })
  53  | 
  54  |   test('chef can mark an item as done in KDS', async ({ browser }) => {
  55  |     // Place an order first using a fresh guest context
  56  |     const guestCtx  = await browser.newContext()
  57  |     const guestPage = await guestCtx.newPage()
  58  |     await loginAsGuest(guestPage)
  59  | 
  60  |     const addBtn = guestPage.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
> 61  |     await expect(addBtn).toBeVisible({ timeout: 15_000 })
      |                          ^ Error: expect(locator).toBeVisible() failed
  62  |     await addBtn.click()
  63  | 
  64  |     await guestPage.getByRole('button', { name: 'Giỏ hàng' }).click()
  65  |     await guestPage.getByRole('button', { name: 'Thanh toán' }).click()
  66  |     await expect(guestPage).toHaveURL(/\/checkout/)
  67  |     await guestPage.getByPlaceholder('Họ tên *').fill('KDS Mark Test')
  68  |     await guestPage.getByPlaceholder('Số điện thoại *').fill('0901234567')
  69  |     await guestPage.getByRole('radio', { name: /Tiền mặt/i }).check()
  70  |     await guestPage.getByRole('button', { name: /Đặt hàng/i }).click()
  71  |     await expect(guestPage).toHaveURL(/\/order/, { timeout: 15_000 })
  72  |     await guestCtx.close()
  73  | 
  74  |     // Now open KDS as chef and find the order
  75  |     const chefCtx  = await browser.newContext()
  76  |     const chefPage = await chefCtx.newPage()
  77  |     await loginAs(chefPage, 'chef')
  78  |     await chefPage.goto('/kds')
  79  |     await chefPage.waitForLoadState('networkidle')
  80  | 
  81  |     // Wait for at least one order card
  82  |     const firstCard = chefPage
  83  |       .locator('[class*="bg-card"][class*="rounded-xl"][class*="border-2"]')
  84  |       .first()
  85  |     await expect(firstCard).toBeVisible({ timeout: 15_000 })
  86  | 
  87  |     // Find an undone item (has "còn ×" badge) and click to mark progress
  88  |     const undoneItem = firstCard.locator('[role="button"]').first()
  89  |     await expect(undoneItem).toBeVisible()
  90  |     await undoneItem.click()
  91  | 
  92  |     // After click: the item either shows ✓ (if qty was 1) or the count decrements.
  93  |     // We accept either outcome — the PATCH request succeeded.
  94  |     await chefPage.waitForTimeout(1_000)
  95  | 
  96  |     // Verify no error toast appears
  97  |     await expect(chefPage.getByText('Không thể cập nhật món')).not.toBeVisible()
  98  | 
  99  |     await chefCtx.close()
  100 |   })
  101 | })
  102 | 
```