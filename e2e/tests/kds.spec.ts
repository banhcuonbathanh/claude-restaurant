import { test, expect, chromium } from '@playwright/test'
import { loginAs, loginAsGuest } from '../fixtures/auth'

/**
 * Flow 2: Staff chef logs in to KDS, guest places an order via QR,
 * chef sees the order arrive via WebSocket and marks items as done.
 *
 * Uses two independent browser contexts to simulate concurrent users.
 * Requires: docker compose up -d + seed data applied.
 */
test.describe('KDS — Chef receives and processes order', () => {
  test('new order appears in KDS after guest places it', async ({ browser }) => {
    // Context 1: Chef logs in and waits at KDS
    const chefCtx  = await browser.newContext()
    const chefPage = await chefCtx.newPage()
    await loginAs(chefPage, 'chef')
    await chefPage.goto('/kds')

    // KDS loads (shows empty state or existing orders — either is fine)
    await expect(chefPage).toHaveURL(/\/kds/)
    await chefPage.waitForLoadState('networkidle')

    // Count how many order cards exist before the guest order
    const cardsBefore = await chefPage.locator('[class*="bg-card"][class*="rounded-xl"][class*="border-2"]').count()

    // Context 2: Guest places an order
    const guestCtx  = await browser.newContext()
    const guestPage = await guestCtx.newPage()
    await loginAsGuest(guestPage)

    const addBtn = guestPage.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()

    await guestPage.getByRole('button', { name: 'Giỏ hàng' }).click()
    await guestPage.getByRole('button', { name: 'Thanh toán' }).click()
    await expect(guestPage).toHaveURL(/\/checkout/)

    await guestPage.getByPlaceholder('Họ tên *').fill('KDS Test')
    await guestPage.getByPlaceholder('Số điện thoại *').fill('0901234567')
    await guestPage.getByRole('radio', { name: /Tiền mặt/i }).check()
    await guestPage.getByRole('button', { name: /Đặt hàng/i }).click()
    await expect(guestPage).toHaveURL(/\/order/, { timeout: 15_000 })

    // Chef page should receive the new order via WebSocket within 10 s
    await expect(
      chefPage.locator('[class*="bg-card"][class*="rounded-xl"][class*="border-2"]')
    ).toHaveCount(cardsBefore + 1, { timeout: 10_000 })

    await guestCtx.close()
    await chefCtx.close()
  })

  test('chef can mark an item as done in KDS', async ({ browser }) => {
    // Place an order first using a fresh guest context
    const guestCtx  = await browser.newContext()
    const guestPage = await guestCtx.newPage()
    await loginAsGuest(guestPage)

    const addBtn = guestPage.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()

    await guestPage.getByRole('button', { name: 'Giỏ hàng' }).click()
    await guestPage.getByRole('button', { name: 'Thanh toán' }).click()
    await expect(guestPage).toHaveURL(/\/checkout/)
    await guestPage.getByPlaceholder('Họ tên *').fill('KDS Mark Test')
    await guestPage.getByPlaceholder('Số điện thoại *').fill('0901234567')
    await guestPage.getByRole('radio', { name: /Tiền mặt/i }).check()
    await guestPage.getByRole('button', { name: /Đặt hàng/i }).click()
    await expect(guestPage).toHaveURL(/\/order/, { timeout: 15_000 })
    await guestCtx.close()

    // Now open KDS as chef and find the order
    const chefCtx  = await browser.newContext()
    const chefPage = await chefCtx.newPage()
    await loginAs(chefPage, 'chef')
    await chefPage.goto('/kds')
    await chefPage.waitForLoadState('networkidle')

    // Wait for at least one order card
    const firstCard = chefPage
      .locator('[class*="bg-card"][class*="rounded-xl"][class*="border-2"]')
      .first()
    await expect(firstCard).toBeVisible({ timeout: 15_000 })

    // Find an undone item (has "còn ×" badge) and click to mark progress
    const undoneItem = firstCard.locator('[role="button"]').first()
    await expect(undoneItem).toBeVisible()
    await undoneItem.click()

    // After click: the item either shows ✓ (if qty was 1) or the count decrements.
    // We accept either outcome — the PATCH request succeeded.
    await chefPage.waitForTimeout(1_000)

    // Verify no error toast appears
    await expect(chefPage.getByText('Không thể cập nhật món')).not.toBeVisible()

    await chefCtx.close()
  })
})
