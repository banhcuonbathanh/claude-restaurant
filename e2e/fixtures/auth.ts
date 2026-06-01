import type { Page } from '@playwright/test'

export const CREDS = {
  admin:   { username: 'admin',    password: 'admin123' },
  chef:    { username: 'chef1',    password: 'chef1234' },
  cashier: { username: 'cashier1', password: 'cashier123' },
  manager: { username: 'manager1', password: 'manager123' },
} as const

/**
 * QR tokens from scripts/seed.sql.
 * ban01–ban03: original seed tables.
 * ban04–ban07: additional tables required for add-items, POS payment, overview WS tests.
 *              Ensure scripts/seed.sql includes matching rows for these tokens.
 */
export const QR = {
  ban01: 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
  ban02: 'b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012',
  ban03: 'c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234',
  ban04: 'd4e5f67890123456d4e5f67890123456d4e5f67890123456d4e5f67890123456',
  ban05: 'e5f6789012345678e5f6789012345678e5f6789012345678e5f6789012345678',
  ban06: 'f678901234567890f678901234567890f678901234567890f678901234567890',
  ban07: 'a7b8c9d0e1f23456a7b8c9d0e1f23456a7b8c9d0e1f23456a7b8c9d0e1f23456',
} as const

/**
 * Login as a named staff role via the /login UI.
 * Retries once if the form shows a transient error (e.g. rate-limit burst).
 */
export async function loginAs(page: Page, role: keyof typeof CREDS) {
  const { username, password } = CREDS[role]
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto('/login')
    await page.getByLabel('Tên đăng nhập').fill(username)
    await page.getByLabel('Mật khẩu').fill(password)
    await page.getByRole('button', { name: 'Đăng nhập' }).click()
    try {
      await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 8_000 })
      // Dismiss cookie consent banner so it doesn't block button clicks in tests
      await page.evaluate(() => localStorage.setItem('cookie_consent_accepted', 'true'))
      return
    } catch {
      if (attempt === 1) throw new Error(`loginAs(${role}): still on /login after 2 attempts`)
      // transient error — wait briefly then retry
      await page.waitForTimeout(500)
    }
  }
}

/**
 * Authenticate a guest session via the QR table URL.
 * Handles the case where the table already has an active order (redirects to /order/*).
 * After auth, always ends up at /menu.
 */
export async function loginAsGuest(page: Page, qrToken = QR.ban01) {
  await page.goto(`/table/${qrToken}`)
  // Accept /menu (normal) or /order/* (table had an active order)
  await page.waitForURL(
    url => url.pathname.includes('/menu') || url.pathname.startsWith('/order'),
    { timeout: 15_000 },
  )
  // If we landed on /order (active order exists), navigate to /menu so tests start clean
  if (!page.url().includes('/menu')) {
    await page.goto('/menu')
    await page.waitForURL('**/menu', { timeout: 10_000 })
  }
}
