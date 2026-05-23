import { test, expect, chromium } from '@playwright/test'
import { loginAs, loginAsGuest, QR } from '../fixtures/auth'

/**
 * POS & Payment flows from client_flow/cleint_flow_diagram.md
 * §4.1 — Cashier POS: table grid, create order
 * §4.2 — Payment: COD flow (QR gateway skipped — requires ngrok/sandbox)
 */

test.describe('POS §4.1 — Cashier POS UI', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cashier')
    await expect(page).toHaveURL(/\/pos/, { timeout: 10_000 })
  })

  test('POS page loads with table grid visible', async ({ page }) => {
    // Left panel: table grid must show at least one table
    const tableItems = page.locator('button, [role="button"]').filter({ hasText: /Bàn/i })
    await expect(tableItems.first()).toBeVisible({ timeout: 12_000 })
  })

  test('clicking a table loads order details in middle panel', async ({ page }) => {
    const firstTable = page.locator('button, [role="button"]').filter({ hasText: /Bàn/i }).first()
    await expect(firstTable).toBeVisible({ timeout: 12_000 })
    await firstTable.click()

    // Middle panel should update — either shows an order or empty state
    await page.waitForLoadState('networkidle')
    // No error toast should appear
    await expect(page.getByText(/lỗi server|lỗi hệ thống/i)).not.toBeVisible()
  })

  test('"Tạo đơn mới" button is visible', async ({ page }) => {
    const newOrderBtn = page.getByRole('button', { name: /Tạo đơn mới/i })
    await expect(newOrderBtn).toBeVisible({ timeout: 10_000 })
  })

  test('cashier can create a new POS order', async ({ page }) => {
    const newOrderBtn = page.getByRole('button', { name: /Tạo đơn mới/i })
    await expect(newOrderBtn).toBeVisible({ timeout: 10_000 })
    await newOrderBtn.click()

    // A modal/dialog should open
    const dialog = page.locator('[role="dialog"], [class*="modal"], form').first()
    await expect(dialog).toBeVisible({ timeout: 6_000 })

    // Fill optional customer name if the field exists
    const nameInput = page.getByPlaceholder(/Tên khách|Họ tên|customer_name/i)
    if (await nameInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await nameInput.fill('POS Walk-in Test')
    }

    // Submit
    const confirmBtn = page
      .getByRole('button', { name: /Xác nhận|Tạo đơn|Tạo|Confirm/i })
      .last()
    await confirmBtn.click()

    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/lỗi|thất bại/i)).not.toBeVisible()
  })
})

test.describe('POS §4.2 — COD Payment', () => {
  test('payment page renders total + method options for a live order', async ({ browser }) => {
    // Place an order as guest (ban05 — dedicated to payment tests)
    const guestCtx = await browser.newContext()
    const guestPage = await guestCtx.newPage()
    await loginAsGuest(guestPage, QR.ban05)

    const addBtn = guestPage.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()
    await guestPage.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
    await guestPage.getByRole('button', { name: 'Thanh toán' }).click()
    await expect(guestPage).toHaveURL(/\/checkout/)
    await guestPage.getByPlaceholder('Họ tên *').fill('Payment COD Test')
    await guestPage.getByPlaceholder('Số điện thoại *').fill('0901234567')
    await guestPage.getByRole('radio', { name: /Tiền mặt/i }).check()
    await guestPage.getByRole('button', { name: /Đặt hàng/i }).click()
    await expect(guestPage).toHaveURL(/\/order\//, { timeout: 15_000 })

    const match = guestPage.url().match(/\/order\/([^/?#]+)/)
    const orderId = match?.[1]
    expect(orderId).toBeTruthy()
    await guestCtx.close()

    // Cashier opens the payment page for this order
    const cashierCtx = await browser.newContext()
    const cashierPage = await cashierCtx.newPage()
    await loginAs(cashierPage, 'cashier')
    await cashierPage.goto(`/cashier/payment/${orderId}`)

    // Payment page must show order total
    await expect(
      cashierPage.getByText(/Tổng tiền|Tổng|Total/i).first()
    ).toBeVisible({ timeout: 10_000 })

    // Payment method options visible
    await expect(
      cashierPage.getByText(/Tiền mặt|COD/i).first()
    ).toBeVisible({ timeout: 5_000 })

    await cashierCtx.close()
  })

  test('COD confirm button is present on payment page', async ({ browser }) => {
    // Place an order as guest (ban06)
    const guestCtx = await browser.newContext()
    const guestPage = await guestCtx.newPage()
    await loginAsGuest(guestPage, QR.ban06)

    const addBtn = guestPage.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()
    await guestPage.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
    await guestPage.getByRole('button', { name: 'Thanh toán' }).click()
    await expect(guestPage).toHaveURL(/\/checkout/)
    await guestPage.getByPlaceholder('Họ tên *').fill('COD Test')
    await guestPage.getByPlaceholder('Số điện thoại *').fill('0901234567')
    await guestPage.getByRole('radio', { name: /Tiền mặt/i }).check()
    await guestPage.getByRole('button', { name: /Đặt hàng/i }).click()
    await expect(guestPage).toHaveURL(/\/order\//, { timeout: 15_000 })

    const match = guestPage.url().match(/\/order\/([^/?#]+)/)
    const orderId = match?.[1]
    expect(orderId).toBeTruthy()
    await guestCtx.close()

    const cashierCtx = await browser.newContext()
    const cashierPage = await cashierCtx.newPage()
    await loginAs(cashierPage, 'cashier')
    await cashierPage.goto(`/cashier/payment/${orderId}`)

    // "Xác nhận COD" button must exist (may be greyed if order not yet ready)
    const codBtn = cashierPage.getByRole('button', { name: /Xác nhận COD|Thanh toán tiền mặt/i })
    await expect(codBtn).toBeVisible({ timeout: 10_000 })

    await cashierCtx.close()
  })
})
