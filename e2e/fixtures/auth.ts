import type { Page } from '@playwright/test'

export const CREDS = {
  admin:   { username: 'admin',    password: 'admin123' },
  chef:    { username: 'chef1',    password: 'chef1234' },
  cashier: { username: 'cashier1', password: 'cashier123' },
  manager: { username: 'manager1', password: 'manager123' },
} as const

/** QR tokens from scripts/seed.sql */
export const QR = {
  ban01: 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
  ban02: 'b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012',
} as const

/**
 * Login as a named staff role via the /login UI.
 * Returns after the post-login redirect completes.
 */
export async function loginAs(page: Page, role: keyof typeof CREDS) {
  const { username, password } = CREDS[role]
  await page.goto('/login')
  await page.getByLabel('Tên đăng nhập').fill(username)
  await page.getByLabel('Mật khẩu').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  // Wait for redirect away from /login
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 10_000 })
}

/**
 * Authenticate a guest session via the QR table URL.
 * Returns after redirect to /menu completes.
 */
export async function loginAsGuest(page: Page, qrToken = QR.ban01) {
  await page.goto(`/table/${qrToken}`)
  await page.waitForURL('**/menu', { timeout: 10_000 })
}
