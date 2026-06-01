# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staff-internal-reactions.spec.ts >> E — Overview & Monitoring >> E4 — table cards render urgency colour indicators
- Location: tests/staff-internal-reactions.spec.ts:664:7

# Error details

```
Error: loginAs(manager): still on /login after 2 attempts
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
        - textbox "Tên đăng nhập" [ref=e8]: manager1
      - generic [ref=e9]:
        - text: Mật khẩu
        - textbox "Mật khẩu" [ref=e10]: manager123
        - paragraph [ref=e11]: Đã xảy ra lỗi, vui lòng thử lại
      - button "Đăng nhập" [ref=e12] [cursor=pointer]
    - paragraph [ref=e13]:
      - text: Chưa có tài khoản?
      - link "Đăng ký" [ref=e14] [cursor=pointer]:
        - /url: /register
  - region "Notifications alt+T"
  - alert [ref=e15]
  - generic [ref=e16]:
    - paragraph [ref=e17]:
      - text: Chúng tôi dùng cookies và bộ nhớ trình duyệt để lưu giỏ hàng và trạng thái đơn hàng. Không có dữ liệu thẻ ngân hàng nào được lưu. Xem
      - link "Chính sách bảo mật" [ref=e18] [cursor=pointer]:
        - /url: /privacy-policy
      - text: .
    - button "Đồng ý" [ref=e19] [cursor=pointer]
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
  10 | /**
  11 |  * QR tokens from scripts/seed.sql.
  12 |  * ban01–ban03: original seed tables.
  13 |  * ban04–ban07: additional tables required for add-items, POS payment, overview WS tests.
  14 |  *              Ensure scripts/seed.sql includes matching rows for these tokens.
  15 |  */
  16 | export const QR = {
  17 |   ban01: 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
  18 |   ban02: 'b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012',
  19 |   ban03: 'c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234',
  20 |   ban04: 'd4e5f67890123456d4e5f67890123456d4e5f67890123456d4e5f67890123456',
  21 |   ban05: 'e5f6789012345678e5f6789012345678e5f6789012345678e5f6789012345678',
  22 |   ban06: 'f678901234567890f678901234567890f678901234567890f678901234567890',
  23 |   ban07: 'a7b8c9d0e1f23456a7b8c9d0e1f23456a7b8c9d0e1f23456a7b8c9d0e1f23456',
  24 | } as const
  25 | 
  26 | /**
  27 |  * Login as a named staff role via the /login UI.
  28 |  * Retries once if the form shows a transient error (e.g. rate-limit burst).
  29 |  */
  30 | export async function loginAs(page: Page, role: keyof typeof CREDS) {
  31 |   const { username, password } = CREDS[role]
  32 |   for (let attempt = 0; attempt < 2; attempt++) {
  33 |     await page.goto('/login')
  34 |     await page.getByLabel('Tên đăng nhập').fill(username)
  35 |     await page.getByLabel('Mật khẩu').fill(password)
  36 |     await page.getByRole('button', { name: 'Đăng nhập' }).click()
  37 |     try {
  38 |       await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 8_000 })
  39 |       return
  40 |     } catch {
> 41 |       if (attempt === 1) throw new Error(`loginAs(${role}): still on /login after 2 attempts`)
     |                                ^ Error: loginAs(manager): still on /login after 2 attempts
  42 |       // transient error — wait briefly then retry
  43 |       await page.waitForTimeout(500)
  44 |     }
  45 |   }
  46 | }
  47 | 
  48 | /**
  49 |  * Authenticate a guest session via the QR table URL.
  50 |  * Handles the case where the table already has an active order (redirects to /order/*).
  51 |  * After auth, always ends up at /menu.
  52 |  */
  53 | export async function loginAsGuest(page: Page, qrToken = QR.ban01) {
  54 |   await page.goto(`/table/${qrToken}`)
  55 |   // Accept /menu (normal) or /order/* (table had an active order)
  56 |   await page.waitForURL(
  57 |     url => url.pathname.includes('/menu') || url.pathname.startsWith('/order'),
  58 |     { timeout: 15_000 },
  59 |   )
  60 |   // If we landed on /order (active order exists), navigate to /menu so tests start clean
  61 |   if (!page.url().includes('/menu')) {
  62 |     await page.goto('/menu')
  63 |     await page.waitForURL('**/menu', { timeout: 10_000 })
  64 |   }
  65 | }
  66 | 
```