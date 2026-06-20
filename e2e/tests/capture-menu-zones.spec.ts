import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { loginAsGuest, QR } from '../fixtures/auth'

// Output into the comparison doc's screenshots folder so the markdown picks them up.
const OUT = path.resolve(
  __dirname,
  '../../docs/system/08_pages/customer/customer_menu/screenshots',
)
const shot = (name: string) => path.join(OUT, name)

test.beforeAll(() => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })
})

// The mobile ProductCard root (and most cards) carry the `bg-card` class.
const CARD_ANCESTOR = 'xpath=ancestor::div[contains(@class,"bg-card")][1]'

test('capture customer-menu zones (real screenshots)', async ({ page }) => {
  test.setTimeout(120_000)

  // Pre-seed cookie consent so the banner never mounts (a reload would wipe the
  // in-memory Zustand tableId set by the QR /table page).
  await page.addInitScript(() => localStorage.setItem('cookie_consent_accepted', 'true'))

  // QR scan → /table/<token> sets cart.tableId + tableName, client-replaces to /menu.
  await loginAsGuest(page, QR.ban01)
  await page.waitForLoadState('networkidle').catch(() => {})

  const addBtns = page.getByRole('button', { name: 'Thêm vào giỏ hàng' })
  await addBtns.first().waitFor({ state: 'visible', timeout: 25_000 })

  // ---- Full page (context) ----
  await page.screenshot({ path: shot('menu_full_real.png'), fullPage: true })

  // ---- Zone A: MenuHeader ----
  await page.locator('header').first().screenshot({ path: shot('menuheader_real.png') })

  // ---- Zone F: ProductCard (the first visible card, captured via the add button's card) ----
  const firstCard = addBtns.first().locator(CARD_ANCESTOR)
  await firstCard.scrollIntoViewIfNeeded()
  await firstCard.screenshot({ path: shot('productcard_real.png') })

  // ---- Populate cart ----
  // 1) first dish (whatever the top card is)
  await addBtns.first().click()
  // 2) a soup product ("Canh Rau" — ASCII) so OrderSummary discovers the canh productId
  const canhName = page.getByText('Canh Rau', { exact: true }).first()
  await canhName.scrollIntoViewIfNeeded()
  await canhName.locator(CARD_ANCESTOR).getByRole('button', { name: 'Thêm vào giỏ hàng' }).click()

  // ---- Zone I: OrderSummary — open by default; bump "Bát có rau" via the canh stepper ----
  const summary = page.getByText('Tóm tắt đơn hàng').first().locator('xpath=ancestor::section[1]')
  await summary.scrollIntoViewIfNeeded()
  const rauRow = summary
    .getByText('Bát có rau')
    .first()
    .locator('xpath=ancestor::div[contains(@class,"justify-between")][1]')
  await rauRow.getByRole('button').last().click() // [-, +] → plus is last
  await page.waitForTimeout(500)
  await summary.scrollIntoViewIfNeeded()
  await summary.screenshot({ path: shot('ordersummary_real.png') })

  // ---- TableConfirmModal (QR path) — canh now present, gate passes; do NOT submit ----
  // CartBottomBar (fixed) is rendered before the closed CartDrawer in the DOM → .first() is the visible one.
  await page.getByRole('button', { name: /Thanh toán/ }).first().click()
  const modal = page.getByText('Xác nhận đặt hàng').first().locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]')
  try {
    await modal.waitFor({ state: 'visible', timeout: 10_000 })
    await modal.screenshot({ path: shot('tableconfirmmodal_real.png') })
  } catch {
    await page.screenshot({ path: shot('tableconfirmmodal_FALLBACK.png'), fullPage: true })
    console.log('Modal did not open. URL:', page.url())
  }
})
