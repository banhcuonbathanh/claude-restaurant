import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/auth'

/**
 * Auth flows from client_flow/cleint_flow_diagram.md
 * §1.1 — Staff login → role-based redirect
 * §1.3 — Guest QR auth with invalid token → error
 * §1.4 — Logout → clear state + redirect
 */

test.describe('Auth §1.1 — Role-based login redirect', () => {
  test('chef → /kds', async ({ page }) => {
    await loginAs(page, 'chef')
    await expect(page).toHaveURL(/\/kds/, { timeout: 10_000 })
  })

  test('cashier → /pos', async ({ page }) => {
    await loginAs(page, 'cashier')
    await expect(page).toHaveURL(/\/pos/, { timeout: 10_000 })
  })

  test('manager → /admin/overview', async ({ page }) => {
    await loginAs(page, 'manager')
    await expect(page).toHaveURL(/\/admin\/overview/, { timeout: 10_000 })
  })

  test('admin → /admin/overview', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/admin\/overview/, { timeout: 10_000 })
  })

  test('wrong credentials → stays on /login with error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Tên đăng nhập').fill('notauser')
    await page.getByLabel('Mật khẩu').fill('badpassword1')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()
    // Error message visible; URL must still be /login
    await expect(
      page.getByText(/Sai thông tin|mật khẩu không đúng|không hợp lệ|incorrect/i)
    ).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated access to protected route → redirect to /login', async ({ page }) => {
    await page.goto('/admin/overview')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})

test.describe('Auth §1.3 — Guest QR: invalid token', () => {
  test('invalid QR token → error shown, no /menu redirect', async ({ page }) => {
    await page.goto('/table/00000000000000000000000000000000000000000000000000000000badtoken')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })

    // Must NOT end up on /menu
    expect(page.url()).not.toMatch(/\/menu/)

    // Either an error message is shown or the page stays on /table with error state
    const hasError = await page.getByText(/không hợp lệ|hết hạn|lỗi|invalid|error/i).isVisible()
    expect(hasError).toBe(true)
  })
})

test.describe('Auth §1.4 — Logout', () => {
  test('logout clears session and redirects to /login', async ({ page }) => {
    await loginAs(page, 'manager')
    await expect(page).toHaveURL(/\/admin\/overview/, { timeout: 10_000 })

    const logoutBtn = page.getByRole('button', { name: /Đăng xuất|Logout/i })
    await expect(logoutBtn).toBeVisible({ timeout: 8_000 })
    await logoutBtn.click()

    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })

  test('after logout, visiting protected route → back to /login', async ({ page }) => {
    await loginAs(page, 'manager')
    await expect(page).toHaveURL(/\/admin\/overview/)

    await page.getByRole('button', { name: /Đăng xuất|Logout/i }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })

    await page.goto('/admin/overview')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})
