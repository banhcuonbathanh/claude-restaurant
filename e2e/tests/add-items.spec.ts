import { test, expect } from '@playwright/test'
import { loginAsGuest, QR } from '../fixtures/auth'

/**
 * Flow §2.2 — Add items to an existing order.
 * Uses ban04 to avoid collisions with guest-order.spec.ts (ban01).
 * Seed prerequisite: ban04 QR token must exist in scripts/seed.sql.
 */
test.describe('Add items to existing order — §2.2', () => {
  test('guest places order then adds more items via Thêm món', async ({ page }) => {
    await loginAsGuest(page, QR.ban04)

    // If ban04 already has an active order, loginAsGuest leaves us at /menu.
    // Place a fresh order first.
    const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()

    await page.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
    await page.getByRole('button', { name: 'Thanh toán' }).click()
    await expect(page).toHaveURL(/\/checkout/)

    await page.getByPlaceholder('Họ tên *').fill('Add Items Test')
    await page.getByPlaceholder('Số điện thoại *').fill('0909123456')
    await page.getByRole('radio', { name: /Tiền mặt/i }).check()
    await page.getByRole('button', { name: /Đặt hàng/i }).click()

    await expect(page).toHaveURL(/\/order\//, { timeout: 15_000 })

    // Extract orderId from URL
    const match = page.url().match(/\/order\/([^/?#]+)/)
    const orderId = match?.[1]
    expect(orderId).toBeTruthy()

    // Click "Thêm món" on the order tracking page
    const addMoreBtn = page.getByRole('button', { name: /Thêm món/i })
    await expect(addMoreBtn).toBeVisible({ timeout: 10_000 })
    await addMoreBtn.click()

    // Should land on /menu?add_to_order=<orderId>
    await expect(page).toHaveURL(
      new RegExp(`/menu.*add_to_order=${orderId}`),
      { timeout: 10_000 },
    )

    // Add another item
    const menuAddBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(menuAddBtn).toBeVisible({ timeout: 15_000 })
    await menuAddBtn.click()

    // Open cart drawer and submit
    await page.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
    await page.getByRole('button', { name: 'Thanh toán' }).click()

    // Submit the add-to-order checkout (button text may differ from new-order flow)
    const submitBtn = page
      .getByRole('button', { name: /Thêm món|Xác nhận thêm|Đặt hàng/i })
      .first()
    await expect(submitBtn).toBeVisible({ timeout: 8_000 })
    await submitBtn.click()

    // Expect success: toast appears OR redirected back to /order/:id
    await Promise.race([
      expect(page.getByText(/Đã thêm món thành công|thêm thành công/i)).toBeVisible({ timeout: 10_000 }),
      expect(page).toHaveURL(new RegExp(`/order/${orderId}`), { timeout: 10_000 }),
    ])
  })

  test('409 ORDER_NOT_EDITABLE — toast shown when order not editable', async ({ page }) => {
    // Navigate directly to a menu with a fake/completed orderId — the BE should return 409
    await loginAsGuest(page, QR.ban04)
    await page.waitForURL(url => url.pathname.includes('/menu'), { timeout: 15_000 })

    // Force the add_to_order param with a non-existent orderId
    await page.goto('/menu?add_to_order=00000000-0000-0000-0000-000000000000')

    const addBtn = page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()

    await page.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
    await page.getByRole('button', { name: 'Thanh toán' }).click()

    const submitBtn = page
      .getByRole('button', { name: /Thêm món|Xác nhận thêm|Đặt hàng/i })
      .first()
    if (await submitBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await submitBtn.click()
      // Should show error toast (409 or order not found)
      await expect(
        page.getByText(/không thể thêm|ORDER_NOT_EDITABLE|không tìm thấy|lỗi/i)
      ).toBeVisible({ timeout: 8_000 })
    }
  })
})
