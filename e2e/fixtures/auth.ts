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
  ban03: 'c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234',
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
