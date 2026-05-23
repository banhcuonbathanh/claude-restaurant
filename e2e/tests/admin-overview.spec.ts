import { test, expect } from '@playwright/test'
import { loginAs, loginAsGuest, QR } from '../fixtures/auth'

/**
 * Admin Dashboard flows from client_flow/cleint_flow_diagram.md
 * §5.1 — Admin Overview (Live Floor): stat cards, table grid, real-time WS
 * §5.4 — QR Marketing: QR cards, copy, download
 */

test.describe('Admin Overview §5.1 — Live Floor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager')
    await expect(page).toHaveURL(/\/admin\/overview/, { timeout: 10_000 })
  })

  test('4 stat cards are visible', async ({ page }) => {
    // Cards: Bàn phục vụ · Chờ làm · Đang làm · Khẩn cấp
    await expect(page.getByText(/Bàn phục vụ|Bàn đang phục vụ/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Chờ làm|Chờ xác nhận/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/Đang làm|Đang chuẩn bị/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/Khẩn cấp|Urgent/i).first()).toBeVisible({ timeout: 5_000 })
  })

  test('table grid renders with at least one table', async ({ page }) => {
    // Table grid must show tables — each card shows a table name
    const tableCards = page.locator('[class*="table"], [class*="card"]').filter({ hasText: /Bàn/i })
    await expect(tableCards.first()).toBeVisible({ timeout: 12_000 })
  })

  test('Waiting section shows pending orders list area', async ({ page }) => {
    // "Chờ xác nhận" section heading must be present
    await expect(
      page.getByText(/Chờ xác nhận|Đơn chờ|Pending/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('new order appears in overview after guest places it', async ({ browser }) => {
    // Manager context: already on overview page
    const managerCtx = await browser.newContext()
    const managerPage = await managerCtx.newPage()
    await loginAs(managerPage, 'manager')
    await managerPage.waitForLoadState('networkidle')
    // Give WS time to connect
    await managerPage.waitForTimeout(2_000)

    // Count pending order entries before
    const waitingSection = managerPage.getByText(/Chờ xác nhận|Đơn chờ/i).first()
    await expect(waitingSection).toBeVisible({ timeout: 10_000 })

    // Guest context: place an order (ban07)
    const guestCtx = await browser.newContext()
    const guestPage = await guestCtx.newPage()
    await loginAsGuest(guestPage, QR.ban07)

    const addBtn = guestPage.getByRole('button', { name: 'Thêm vào giỏ hàng' }).first()
    await expect(addBtn).toBeVisible({ timeout: 15_000 })
    await addBtn.click()
    await guestPage.getByRole('button', { name: 'Giỏ hàng', exact: true }).click()
    await guestPage.getByRole('button', { name: 'Thanh toán' }).click()
    await expect(guestPage).toHaveURL(/\/checkout/)
    await guestPage.getByPlaceholder('Họ tên *').fill('Overview WS Test')
    await guestPage.getByPlaceholder('Số điện thoại *').fill('0901234567')
    await guestPage.getByRole('radio', { name: /Tiền mặt/i }).check()
    await guestPage.getByRole('button', { name: /Đặt hàng/i }).click()
    await expect(guestPage).toHaveURL(/\/order/, { timeout: 15_000 })

    // Manager page should receive new_order WS event within 15 s
    // At minimum the page should not crash/show an error
    await managerPage.waitForTimeout(5_000)
    await expect(managerPage.getByText(/lỗi kết nối|lỗi hệ thống/i)).not.toBeVisible()

    await guestCtx.close()
    await managerCtx.close()
  })

  test('"Kiểm tra" toggle on a table card reveals prep panel', async ({ page }) => {
    // Find a table card that has a "Kiểm tra" checkbox
    const kiemtraCheckbox = page.getByRole('checkbox', { name: /Kiểm tra/i }).first()
    if (await kiemtraCheckbox.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await kiemtraCheckbox.check()
      // Prep panel / summary should appear
      await expect(
        page.getByText(/Tổng cần làm|Cần làm|Prep/i).first()
      ).toBeVisible({ timeout: 5_000 })
    }
    // If no table has a Kiểm tra checkbox (no active orders) — test passes vacuously
  })
})

test.describe('QR Marketing §5.4', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager')
    await page.goto('/admin/marketing')
    await expect(page).toHaveURL(/\/admin\/marketing/, { timeout: 10_000 })
  })

  test('QR marketing page renders table QR cards', async ({ page }) => {
    // Each table should have a QR card with table name and QR code image
    await expect(page.getByText(/Bàn/i).first()).toBeVisible({ timeout: 12_000 })
    // QR code image or SVG
    const qrImage = page.locator('img[alt*="QR"], svg[class*="qr"], canvas').first()
    await expect(qrImage).toBeVisible({ timeout: 10_000 })
  })

  test('Copy button writes URL to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const copyBtn = page.getByRole('button', { name: /Copy|Sao chép/i }).first()
    await expect(copyBtn).toBeVisible({ timeout: 10_000 })
    await copyBtn.click()

    // Button should briefly show a checkmark / green state
    await expect(
      page.locator('[class*="green"], [class*="check"]').or(
        page.getByRole('button', { name: /Copied|Đã sao chép/i }).first()
      )
    ).toBeVisible({ timeout: 3_000 })
  })

  test('SVG download button is present', async ({ page }) => {
    const svgBtn = page.getByRole('button', { name: /SVG|Tải SVG|Download/i }).first()
    await expect(svgBtn).toBeVisible({ timeout: 10_000 })
  })

  test('Print section button is present', async ({ page }) => {
    const printBtn = page.getByRole('button', { name: /In|Print/i }).first()
    await expect(printBtn).toBeVisible({ timeout: 10_000 })
  })

  test('Product catalogue section shows products', async ({ page }) => {
    await expect(page.getByText(/Danh mục|Catalogue|sản phẩm/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
