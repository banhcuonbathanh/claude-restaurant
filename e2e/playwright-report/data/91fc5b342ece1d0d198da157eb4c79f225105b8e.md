# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin — Staff management >> toggle staff active status
- Location: tests/admin.spec.ts:72:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Quán Bánh Cuốn" [level=1] [ref=e4]
    - paragraph [ref=e5]: Đăng nhập để tiếp tục
    - generic [ref=e6]:
      - generic [ref=e7]:
        - text: Tên đăng nhập
        - textbox "Tên đăng nhập" [ref=e8]: admin
      - generic [ref=e9]:
        - text: Mật khẩu
        - textbox "Mật khẩu" [ref=e10]: admin123
        - paragraph [ref=e11]: Đã xảy ra lỗi, vui lòng thử lại
      - button "Đăng nhập" [ref=e12] [cursor=pointer]
  - region "Notifications alt+T"
  - alert [ref=e13]
```

# Test source

```ts
  1  | import type { Page } from '@playwright/test'
  2  | 
  3  | export const CREDS = {
  4  |   admin:   { username: 'admin',    password: 'admin123' },
  5  |   chef:    { username: 'chef1',    password: 'chef1234' },
  6  |   cashier: { username: 'cashier1', password: 'cashier123' },
  7  |   manager: { username: 'manager1', password: 'manager123' },
  8  | } as const
  9  | 
  10 | /** QR tokens from scripts/seed.sql */
  11 | export const QR = {
  12 |   ban01: 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
  13 |   ban02: 'b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012',
  14 | } as const
  15 | 
  16 | /**
  17 |  * Login as a named staff role via the /login UI.
  18 |  * Returns after the post-login redirect completes.
  19 |  */
  20 | export async function loginAs(page: Page, role: keyof typeof CREDS) {
  21 |   const { username, password } = CREDS[role]
  22 |   await page.goto('/login')
  23 |   await page.getByLabel('Tên đăng nhập').fill(username)
  24 |   await page.getByLabel('Mật khẩu').fill(password)
  25 |   await page.getByRole('button', { name: 'Đăng nhập' }).click()
  26 |   // Wait for redirect away from /login
> 27 |   await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 10_000 })
     |              ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  28 | }
  29 | 
  30 | /**
  31 |  * Authenticate a guest session via the QR table URL.
  32 |  * Returns after redirect to /menu completes.
  33 |  */
  34 | export async function loginAsGuest(page: Page, qrToken = QR.ban01) {
  35 |   await page.goto(`/table/${qrToken}`)
  36 |   await page.waitForURL('**/menu', { timeout: 10_000 })
  37 | }
  38 | 
```