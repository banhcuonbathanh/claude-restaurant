import { test, expect } from '@playwright/test'
import { loginAsGuest } from '../fixtures/auth'

/**
 * Flow 1: Guest scans QR → browses menu → adds item → checks out → order confirmed.
 * Requires: docker compose up -d + seed data applied.
 */
test.describe('Guest QR → Order flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page)
  })

  test('redirects to /menu after QR auth', async ({ page }) => {
    await expect(page).toHaveURL(/\/menu/)
    await expect(page.getByRole('heading', { name: /Quán Bánh Cuốn/i })).toBeVisible()
  })

  test('can add a product to cart and see badge', async ({ page }) => {
    // Wait for at least one add-to-cart button to be enabled
    const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()

    // Cart badge should now show "1"
    const cartBtn = page.getByRole('button', { name: 'Giỏ hàng', exact: true })
    await expect(cartBtn.locator('span').filter({ hasText: '1' })).toBeVisible()
  })

  test('full checkout flow: QR → cart → form → order page', async ({ page }) => {
    const logs: string[] = []
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`))

    // Add first available product
    const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()

    // Open cart drawer
    await page.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()

    // Click "Thanh toán" inside the drawer
    const checkoutBtn = page.getByRole('button', { name: 'Thanh toán' })
    await expect(checkoutBtn).toBeVisible()
    await checkoutBtn.click()

    // Should land on /checkout
    await expect(page).toHaveURL(/\/checkout/, { timeout: 10_000 })

    // Fill in customer info
    await page.getByPlaceholder('Họ tên *').fill('Nguyễn Test')
    await page.getByPlaceholder('Số điện thoại *').fill('0901234567')

    // Select cash payment (it's the default but let's be explicit)
    await page.getByRole('radio', { name: /Tiền mặt/i }).check()

    // Submit order
    const submitBtn = page.getByRole('button', { name: /Đặt hàng/i })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // Should redirect to /order after successful submission
    try {
      await expect(page).toHaveURL(/\/order/, { timeout: 15_000 })
    } catch (e) {
      console.log('CAPTURED CONSOLE LOGS:', logs.join('\n'))
      throw e
    }
  })

  test('checkout form validates required fields', async ({ page }) => {
    // Add item and reach checkout
    const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()

    await page.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
    await page.getByRole('button', { name: 'Thanh toán' }).click()
    await expect(page).toHaveURL(/\/checkout/)

    // Submit without filling any fields
    await page.getByRole('button', { name: /Đặt hàng/i }).click()

    // Expect validation errors
    await expect(page.getByText('Vui lòng nhập tên')).toBeVisible()
    await expect(page.getByText('Số điện thoại không hợp lệ')).toBeVisible()

    // URL must still be /checkout (not redirected)
    await expect(page).toHaveURL(/\/checkout/)
  })
})
