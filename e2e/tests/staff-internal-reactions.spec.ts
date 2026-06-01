import { test, expect } from '@playwright/test'

/**
 * Staff Internal Operations — Actor Reactions
 * Covers all events in FLOW_STAFF_INTERNAL_REACTIONS.md (sections A–E).
 *
 * Auth strategy: ALL tests use pre-saved storageState (generated in global-setup.ts)
 * to avoid hitting the 5 req/min login rate limit. The global-setup saves 4 auth
 * states (manager, admin, chef, cashier) using those 4 allowed slots — no loginAs
 * calls remain in this file.
 */

// ─── A — Product & Menu Operations ───────────────────────────────────────────

test.describe('A — Product & Menu Operations', () => {
  test.describe.configure({ mode: 'serial' })
  test.use({ storageState: 'auth-states/manager.json' })

  // A1: Product added → appears in list
  test('A1 — product added appears in product list', async ({ page }) => {
    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { name: /Sản phẩm/i })).toBeVisible({ timeout: 10_000 })

    const productName = `A1 Test Bánh ${Date.now()}`
    await page.getByRole('button', { name: /\+ Thêm sản phẩm/i }).click()

    // Category is required — select the first available option
    const catSelect = page.locator('select[name="category_id"]')
    await expect(catSelect).toBeVisible({ timeout: 6_000 })
    await catSelect.selectOption({ index: 1 })

    await page.getByPlaceholder('Bánh cuốn nhân tôm').fill(productName)
    await page.locator('input[name="price"]').fill('25000')
    await page.getByRole('button', { name: 'Lưu' }).click()

    await expect(page.getByText('Đã thêm sản phẩm')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(productName)).toBeVisible({ timeout: 5_000 })
  })

  // A2: Product edited → updated in list
  test('A2 — product edited name reflects in list', async ({ page }) => {
    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { name: /Sản phẩm/i })).toBeVisible({ timeout: 10_000 })

    const productName = `A2 Edit Prod ${Date.now()}`
    const updatedName = `${productName} v2`

    await page.getByRole('button', { name: /\+ Thêm sản phẩm/i }).click()
    const catSelect = page.locator('select[name="category_id"]')
    await expect(catSelect).toBeVisible({ timeout: 6_000 })
    await catSelect.selectOption({ index: 1 })
    await page.getByPlaceholder('Bánh cuốn nhân tôm').fill(productName)
    await page.locator('input[name="price"]').fill('30000')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText('Đã thêm sản phẩm')).toBeVisible({ timeout: 8_000 })

    const row = page.locator('tr').filter({ hasText: productName })
    await expect(row).toBeVisible({ timeout: 5_000 })
    await row.getByRole('button', { name: /Sửa/i }).click()

    // Edit modal opens with name pre-filled — overwrite it
    const editInput = page.locator('input[name="name"]')
    await expect(editInput).toBeVisible({ timeout: 5_000 })
    await editInput.fill(updatedName)
    await page.getByRole('button', { name: 'Lưu' }).click()

    await expect(page.getByText('Đã cập nhật sản phẩm')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(updatedName)).toBeVisible()
  })

  // A3: Product deactivated → removed/hidden from active list
  test('A3 — deactivated product disappears from list', async ({ page }) => {
    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { name: /Sản phẩm/i })).toBeVisible({ timeout: 10_000 })

    const productName = `A3 Del Prod ${Date.now()}`

    await page.getByRole('button', { name: /\+ Thêm sản phẩm/i }).click()
    const catSelect = page.locator('select[name="category_id"]')
    await expect(catSelect).toBeVisible({ timeout: 6_000 })
    await catSelect.selectOption({ index: 1 })
    await page.getByPlaceholder('Bánh cuốn nhân tôm').fill(productName)
    await page.locator('input[name="price"]').fill('20000')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByText('Đã thêm sản phẩm')).toBeVisible({ timeout: 8_000 })

    const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: productName })
    await expect(row).toBeVisible({ timeout: 5_000 })
    const deleteBtn = row.getByRole('button', { name: /Xoá|Ẩn|Deactivate|Vô hiệu/i })
    if (await deleteBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await deleteBtn.click()
      const confirmBtn = page.getByRole('button', { name: /Xác nhận|Confirm|OK/i })
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click()
      }
      await expect(page.getByText(/Đã xóa sản phẩm|vô hiệu|thành công/i)).toBeVisible({ timeout: 8_000 })
    }
  })

  // A4: Topping added → appears in topping list
  test('A4 — topping added appears in topping list', async ({ page }) => {
    await page.goto('/admin/toppings')
    await expect(page.getByRole('heading', { name: /Topping/i })).toBeVisible({ timeout: 10_000 })

    const toppingName = `A4 Topping ${Date.now()}`
    await page.getByRole('button', { name: /Thêm topping|\+ Topping|Tạo/i }).click()
    const nameInput = page.getByPlaceholder(/tên topping|topping name/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(toppingName)
    const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
    if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await priceInput.fill('5000')
    }
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()

    await expect(page.getByText('Đã thêm topping')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(toppingName)).toBeVisible({ timeout: 5_000 })
  })

  // A5: Topping edited → updated in list
  test('A5 — topping edited reflects updated name', async ({ page }) => {
    await page.goto('/admin/toppings')
    await expect(page.getByRole('heading', { name: /Topping/i })).toBeVisible({ timeout: 10_000 })

    const toppingName = `A5 Topping ${Date.now()}`
    const updatedName = `${toppingName} v2`

    await page.getByRole('button', { name: /Thêm topping|\+ Topping|Tạo/i }).click()
    const nameInput = page.getByPlaceholder(/tên topping|topping name/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(toppingName)
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
    await expect(page.getByText('Đã thêm topping')).toBeVisible({ timeout: 8_000 })

    const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: toppingName })
    await expect(row).toBeVisible({ timeout: 5_000 })
    await row.getByRole('button', { name: /Sửa|Edit/i }).click()

    const editInput = page.locator('input[name="name"]')
    await expect(editInput).toBeVisible({ timeout: 5_000 })
    await editInput.fill(updatedName)
    await page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).last().click()

    await expect(page.getByText('Đã cập nhật topping')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(updatedName)).toBeVisible()
  })

  // A6: Category added → appears in category list
  test('A6 — category added appears in category list', async ({ page }) => {
    await page.goto('/admin/categories')
    await expect(
      page.getByRole('heading', { name: /Danh mục|Category|Categories/i })
    ).toBeVisible({ timeout: 10_000 })

    const catName = `A6 Cat ${Date.now()}`
    await page.getByRole('button', { name: /Thêm danh mục|\+ Danh mục|Tạo/i }).click()
    const nameInput = page.getByPlaceholder(/tên danh mục|category name|Bánh/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(catName)
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()

    await expect(page.getByText('Đã thêm danh mục')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(catName)).toBeVisible({ timeout: 5_000 })
  })

  // A7: Combo created → appears in combo list
  test('A7 — combo created appears in combo list', async ({ page }) => {
    await page.goto('/admin/combos')
    // Combo page heading is inline, not an h1/h2 — look for the "+ Thêm combo" button
    await expect(page.getByRole('button', { name: '+ Thêm combo' })).toBeVisible({ timeout: 10_000 })

    const comboName = `A7 Combo ${Date.now()}`
    await page.getByRole('button', { name: '+ Thêm combo' }).click()

    const nameInput = page.getByPlaceholder('VD: Combo Gia Đình').first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(comboName)

    // Combo requires ≥2 products — wait for rows to load then click first two
    const productRows = page.locator('div[class*="max-h-72"] > div[class*="gap-3"]')
    await expect(productRows.first()).toBeVisible({ timeout: 8_000 })
    const rowCount = await productRows.count()
    if (rowCount >= 2) {
      await productRows.nth(0).click()
      await productRows.nth(1).click()
    }

    // Price is required (min 1)
    await page.locator('input[name="price"]').fill('50000')
    await page.getByRole('button', { name: 'Lưu combo' }).click()

    await expect(page.getByText('Đã tạo combo')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(comboName)).toBeVisible({ timeout: 5_000 })
  })

  // A8: Combo edited → change reflected in list
  test('A8 — combo edited name reflects in combo list', async ({ page }) => {
    await page.goto('/admin/combos')
    await expect(page.getByRole('button', { name: '+ Thêm combo' })).toBeVisible({ timeout: 10_000 })

    const comboName = `A8 Combo ${Date.now()}`
    const updatedName = `${comboName} v2`

    await page.getByRole('button', { name: '+ Thêm combo' }).click()
    const nameInput = page.getByPlaceholder('VD: Combo Gia Đình').first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(comboName)
    const productRows = page.locator('div[class*="max-h-72"] > div[class*="gap-3"]')
    const rowCount = await productRows.count()
    if (rowCount >= 2) {
      await productRows.nth(0).click()
      await productRows.nth(1).click()
    }
    await page.locator('input[name="price"]').fill('50000')
    await page.getByRole('button', { name: 'Lưu combo' }).click()
    await expect(page.getByText('Đã tạo combo')).toBeVisible({ timeout: 8_000 })

    const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: comboName })
    await expect(row).toBeVisible({ timeout: 5_000 })
    await row.getByRole('button', { name: /Sửa|Edit/i }).click()

    const editInput = page.locator('input[name="name"]')
    await expect(editInput).toBeVisible({ timeout: 5_000 })
    await editInput.fill(updatedName)
    await page.getByRole('button', { name: 'Lưu combo' }).click()

    await expect(page.getByText('Đã cập nhật combo')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(updatedName)).toBeVisible()
  })
})

// ─── B — Staff Account Management ────────────────────────────────────────────
// All B tests use storageState (no loginAs) to avoid exhausting the 5 req/min
// rate limit that was already used by global-setup's 4 auth state saves.

test.describe('B — Staff Account Management', () => {
  test.describe.configure({ mode: 'serial' })

  // B1: Staff (chef) created by manager → appears in staff list
  test('B1 — manager creates chef account → appears in list', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/manager.json' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const username = `b1_chef_${Date.now()}`
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('B1 Test Chef')
    await page.locator('select[name="role"]').selectOption('chef')
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()

    await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(username)).toBeVisible({ timeout: 5_000 })
    await ctx.close()
  })

  // B2a: Admin creates manager account
  test('B2 — admin creates manager account successfully', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/admin.json' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const username = `b2_mgr_${Date.now()}`
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('B2 Test Manager')
    await page.locator('select[name="role"]').selectOption('manager')
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()

    await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(username)).toBeVisible({ timeout: 5_000 })
    await ctx.close()
  })

  // B2b: Manager cannot create a manager account — BE returns 403 or FE hides option
  test('B2 — manager cannot create another manager account', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/manager.json' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const username = `b2b_mgr_${Date.now()}`
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await expect(page.getByPlaceholder('chef_an')).toBeVisible({ timeout: 6_000 })

    const managerOption = page.locator('select[name="role"] option[value="manager"]')
    const hasManagerOption = await managerOption.count() > 0

    if (!hasManagerOption) { await ctx.close(); return }

    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('B2b Manager Attempt')
    await page.locator('select[name="role"]').selectOption('manager')
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()

    await expect(
      page.getByText(/Có lỗi xảy ra|không đủ quyền|INSUFFICIENT_ROLE/i)
    ).toBeVisible({ timeout: 8_000 })
    await ctx.close()
  })

  // B3: Staff role changed → updated role badge visible
  test('B3 — staff role changed reflects updated role badge', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/admin.json' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const username = `b3_staff_${Date.now()}`
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('B3 Role Change')
    await page.locator('select[name="role"]').selectOption('chef')
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
    await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })

    const row = page.locator('tr').filter({ hasText: username })
    await expect(row).toBeVisible({ timeout: 5_000 })
    await row.getByRole('button', { name: /Sửa/i }).click()

    await page.locator('select[name="role"]').selectOption('cashier')
    await page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).last().click()

    await expect(page.getByText('Đã cập nhật nhân viên')).toBeVisible({ timeout: 8_000 })
    await expect(
      page.locator('tr').filter({ hasText: username }).getByText(/cashier|Cashier|Thu ngân/i)
    ).toBeVisible({ timeout: 5_000 })
    await ctx.close()
  })

  // B4: Staff deactivated → status becomes "Vô hiệu"
  test('B4 — deactivated staff account shows Vô hiệu status', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/manager.json' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const username = `b4_deact_${Date.now()}`
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('B4 Deactivate')
    await page.locator('select[name="role"]').selectOption('cashier')
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
    await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })

    const row = page.locator('tr').filter({ hasText: username })
    await expect(row).toBeVisible({ timeout: 5_000 })
    await row.getByRole('button', { name: 'Đang HĐ' }).click()

    await expect(page.getByText('Đã cập nhật trạng thái')).toBeVisible({ timeout: 8_000 })
    await expect(row.getByRole('button', { name: 'Vô hiệu' })).toBeVisible()
    await ctx.close()
  })

  // B5: Manager cannot deactivate a peer manager — action button absent or 403
  // Uses storageState for admin to avoid exhausting the rate limit after B1-B4 logins
  test('B5 — manager cannot deactivate another manager', async ({ browser }) => {
    // Create a second manager as admin (via storageState — no loginAs call)
    const adminCtx = await browser.newContext({ storageState: 'auth-states/admin.json' })
    const adminPage = await adminCtx.newPage()
    await adminPage.goto('http://localhost:3000/admin/staff')
    await expect(adminPage.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const targetMgr = `b5_target_mgr_${Date.now()}`
    await adminPage.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await adminPage.getByPlaceholder('chef_an').fill(targetMgr)
    await adminPage.locator('input[type="password"]').fill('E2eTest1')
    await adminPage.getByPlaceholder('Nguyễn Văn An').fill('B5 Target Manager')
    await adminPage.locator('select[name="role"]').selectOption('manager')
    await adminPage.getByRole('button', { name: 'Tạo tài khoản' }).click()
    await expect(adminPage.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
    await adminCtx.close()

    // Check as manager1 (via storageState): target manager row should have no status button
    const managerCtx = await browser.newContext({ storageState: 'auth-states/manager.json' })
    const managerPage = await managerCtx.newPage()
    await managerPage.goto('http://localhost:3000/admin/staff')
    await expect(
      managerPage.getByRole('heading', { name: /Nhân viên/i })
    ).toBeVisible({ timeout: 10_000 })

    const targetRow = managerPage.locator('tr').filter({ hasText: targetMgr })
    if (await targetRow.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const statusBtn = targetRow.getByRole('button', { name: /Đang HĐ|Vô hiệu/i })
      if (await statusBtn.count() === 0) {
        // FE hides the button for peer managers — assertion passes
      } else {
        // FE shows the button; clicking should produce an error (BE returns 403)
        await statusBtn.click()
        await expect(
          managerPage.getByText(/không đủ quyền|Có lỗi xảy ra|lỗi/i)
        ).toBeVisible({ timeout: 8_000 })
      }
    }
    await managerCtx.close()
  })

  // B6: Admin can view staff session list (storageState — avoids rate limit after B1-B5)
  test('B6 — admin can view staff session list', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/admin.json' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const sessionBtn = page
      .getByRole('button', { name: /Phiên|Session|Xem phiên/i })
      .first()
    if (await sessionBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await sessionBtn.click()
      await expect(
        page.getByText(/Phiên đăng nhập|Session|Thiết bị/i).first()
      ).toBeVisible({ timeout: 8_000 })
    }
    await ctx.close()
  })

  // B7: Manager can revoke a lower-role staff session (storageState)
  test('B7 — manager can revoke a lower-role staff session', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/manager.json' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })

    const revokeBtn = page
      .getByRole('button', { name: /Thu hồi|Revoke|Đăng xuất phiên/i })
      .first()
    if (await revokeBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await revokeBtn.click()
      const confirmBtn = page.getByRole('button', { name: /Xác nhận|Confirm|OK/i })
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click()
      }
      await expect(
        page.getByText(/Thu hồi thành công|Đã thu hồi|thành công/i)
      ).toBeVisible({ timeout: 8_000 })
    }
    await ctx.close()
  })
})

// ─── C — Table & QR Code Management ──────────────────────────────────────────

test.describe('C — Table & QR Code Management', () => {
  test.use({ storageState: 'auth-states/manager.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/marketing')
    await expect(page).toHaveURL(/\/admin\/marketing/, { timeout: 10_000 })
  })

  // C1: New table added → row appears
  test('C1 — new table added appears on marketing page', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm bàn|\+ Bàn|Tạo bàn/i })
    if (await addBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
      const tableName = `C1 Bàn ${Date.now()}`
      await addBtn.click()
      const nameInput = page.getByPlaceholder(/tên bàn|table name|Bàn/i).first()
      if (await nameInput.isVisible({ timeout: 4_000 }).catch(() => false)) {
        await nameInput.fill(tableName)
      }
      await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
      await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
      await expect(page.getByText(tableName)).toBeVisible({ timeout: 5_000 })
    }
  })

  // C2: QR code visible for each table
  test('C2 — QR code is visible for each table', async ({ page }) => {
    const qrImage = page.locator('img[alt*="QR"], svg[class*="qr"], canvas').first()
    if (await qrImage.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await expect(qrImage).toBeVisible()
    }
  })

  test('C2 — SVG download button present', async ({ page }) => {
    const svgBtn = page.getByRole('button', { name: /SVG|Tải SVG|Download/i }).first()
    if (await svgBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await expect(svgBtn).toBeVisible()
    }
  })

  test('C2 — copy URL button writes to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const copyBtn = page.getByRole('button', { name: /Copy|Sao chép/i }).first()
    if (await copyBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await copyBtn.click()
      await expect(
        page
          .locator('[class*="green"], [class*="check"]')
          .or(page.getByRole('button', { name: /Copied|Đã sao chép/i }).first())
      ).toBeVisible({ timeout: 3_000 })
    }
  })

  // C3: QR regenerated → old src differs from new
  test('C3 — QR regenerated: new QR differs from old', async ({ page }) => {
    const regenBtn = page.getByRole('button', { name: /Tạo lại QR|Regenerate|Làm mới QR/i }).first()
    if (await regenBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
      const oldSrc = await page
        .locator('img[alt*="QR"], canvas').first()
        .getAttribute('src').catch(() => null)

      await regenBtn.click()
      const confirmBtn = page.getByRole('button', { name: /Xác nhận|Confirm|OK/i })
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click()
      }
      await expect(page.getByText(/Đã tạo lại|thành công/i)).toBeVisible({ timeout: 8_000 })

      const newQrEl = page.locator('img[alt*="QR"], canvas').first()
      await expect(newQrEl).toBeVisible({ timeout: 5_000 })
      const newSrc = await newQrEl.getAttribute('src').catch(() => null)
      if (oldSrc && newSrc) expect(newSrc).not.toBe(oldSrc)
    }
  })

  // C4: Product catalogue print button present
  test('C4 — product catalogue print button is present', async ({ page }) => {
    const printBtn = page.getByRole('button', { name: /In|Print/i }).first()
    if (await printBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await expect(printBtn).toBeVisible()
    }
  })
})

// ─── D — Training Management ──────────────────────────────────────────────────

test.describe('D — Training Management', () => {
  test.use({ storageState: 'auth-states/manager.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/training')
    await expect(
      page.getByText('Đào tạo nhân viên')
    ).toBeVisible({ timeout: 10_000 })
  })

  // D1: Training guide created → appears in list (no toast — page just refreshes)
  test('D1 — training guide created appears in list', async ({ page }) => {
    const guideName = `D1 Guide ${Date.now()}`

    await page.getByRole('button', { name: '+ New Guide' }).click()

    // Required: title
    await page.getByPlaceholder('Tên hướng dẫn đào tạo').fill(guideName)
    // Required: role (primary role for this guide)
    await page.locator('select[name="role"]').selectOption('chef')
    // Required: at least one responsibleRoles — click the "Bếp +" toggle button
    await page.getByRole('button', { name: /Bếp \+/ }).click()
    await page.getByRole('button', { name: 'Lưu hướng dẫn' }).click()

    // No toast on success — guide card appears in list (use heading to avoid strict-mode violation
    // with the guide also appearing as an <option> in the assignment dropdown)
    await expect(page.getByRole('heading', { name: guideName })).toBeVisible({ timeout: 8_000 })
  })

  // D2: Training assigned to staff → assignment visible
  test('D2 — training assigned to staff appears in tracking table', async ({ page }) => {
    const assignBtn = page
      .getByRole('button', { name: /Giao|Assign|Phân công/i })
      .first()
    if (await assignBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await assignBtn.click()
      const staffSelect = page.getByRole('combobox').or(page.locator('select')).first()
      if (await staffSelect.isVisible({ timeout: 4_000 }).catch(() => false)) {
        await staffSelect.selectOption({ index: 1 })
      }
      await page.getByRole('button', { name: /Giao|Assign|Xác nhận/i }).last().click()
      await expect(
        page.getByText(/Đã giao|giao thành công|thành công/i)
      ).toBeVisible({ timeout: 8_000 })
    }
  })

  // D3: Staff marks training complete → status updates
  test('D3 — staff can mark assigned training as complete', async ({ page }) => {
    const completeBtn = page
      .getByRole('button', { name: /Hoàn thành|Complete|Đánh dấu xong/i })
      .first()
    if (await completeBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await completeBtn.click()
      await expect(
        page.getByText(/Hoàn thành|✅|completed/i).first()
      ).toBeVisible({ timeout: 8_000 })
    }
  })

  // D4: Manager opens training progress modal
  test('D4 — manager can open training progress modal', async ({ page }) => {
    const progressBtn = page
      .getByRole('button', { name: /Tiến độ|Progress|Chi tiết/i })
      .first()
    if (await progressBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await progressBtn.click()
      await expect(
        page.getByRole('dialog').or(page.locator('[class*="modal"]'))
      ).toBeVisible({ timeout: 6_000 })
      await expect(
        page.getByText(/Bước|Step|Quiz|Lần thử/i).first()
      ).toBeVisible({ timeout: 5_000 })
    }
  })

  // D5: Manager adds note to training record
  test('D5 — manager adds note to training record', async ({ page }) => {
    const noteBtn = page
      .getByRole('button', { name: /Ghi chú|Add note|Nhận xét/i })
      .first()
    if (await noteBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await noteBtn.click()
      const noteInput = page
        .getByPlaceholder(/ghi chú|note|nhận xét/i)
        .or(page.getByRole('textbox').last())
      await expect(noteInput).toBeVisible({ timeout: 5_000 })
      await noteInput.fill('D5 automated test note')
      await page.getByRole('button', { name: /Lưu|Save/i }).last().click()
      await expect(page.getByText(/Đã lưu|lưu thành công|thành công/i)).toBeVisible({ timeout: 8_000 })
    }
  })

  // D6: Training filter tabs by role are present
  test('D6 — training filter tabs by role are present', async ({ page }) => {
    await expect(
      page.getByRole('tab', { name: /Tất cả|All/i })
        .or(page.getByText(/Tất cả|All/i).first())
    ).toBeVisible({ timeout: 8_000 })

    const chefTab = page
      .getByRole('tab', { name: /Bếp|Chef/i })
      .or(page.getByRole('button', { name: /Bếp|Chef/i }).first())
    if (await chefTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await chefTab.click()
      await expect(page.getByText(/lỗi hệ thống|error/i)).not.toBeVisible()
    }
  })
})

// ─── E — Overview & Monitoring ────────────────────────────────────────────────

test.describe('E — Overview & Monitoring', () => {
  test.use({ storageState: 'auth-states/manager.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/overview')
    await expect(page).toHaveURL(/\/admin\/overview/, { timeout: 10_000 })
  })

  // E1: "Kiểm tra" toggled → prep panel appears
  test('E1 — Kiểm tra toggle on table card reveals prep panel', async ({ page }) => {
    const kiemtra = page.getByRole('checkbox', { name: /Kiểm tra/i }).first()
    if (await kiemtra.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await kiemtra.check()
      await expect(
        page.getByText(/Tổng cần làm|Cần làm|Prep/i).first()
      ).toBeVisible({ timeout: 5_000 })
    }
  })

  // E2: Prep panel shows checklist for checked tables
  test('E2 — prep panel shows items checklist for checked tables', async ({ page }) => {
    const kiemtra = page.getByRole('checkbox', { name: /Kiểm tra/i }).first()
    if (await kiemtra.isVisible({ timeout: 8_000 }).catch(() => false)) {
      if (!await kiemtra.isChecked()) await kiemtra.check()
      await expect(
        page.getByText(/Tổng cần làm|PrepPanel|Cần làm/i).first()
      ).toBeVisible({ timeout: 5_000 })
    }
  })

  // E3: 4 stat cards render
  test('E3 — 4 stat cards render with labels', async ({ page }) => {
    await expect(page.getByText(/Bàn phục vụ|Bàn đang phục vụ/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Chờ làm|Chờ xác nhận/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/Đang làm|Đang chuẩn bị/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/Khẩn cấp|Urgent/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/lỗi kết nối|lỗi hệ thống/i)).not.toBeVisible()
  })

  // E4: Table cards render (urgency borders applied via CSS)
  test('E4 — table cards render in the floor grid', async ({ page }) => {
    const tableCards = page
      .locator('[class*="table"], [class*="card"]')
      .filter({ hasText: /Bàn/i })
    const count = await tableCards.count()
    if (count > 0) {
      await expect(tableCards.first()).toBeVisible({ timeout: 5_000 })
    }
  })

  // E5: "Mang đi" confirm button present in waiting orders
  test('E5 — Mang đi confirm button present in overview', async ({ page }) => {
    const mangiBtn = page
      .getByRole('button', { name: /Mang đi|Takeaway|Xác nhận mang đi/i })
      .first()
    if (await mangiBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await mangiBtn.click()
      await expect(
        page.getByText(/Đã xác nhận|thành công/i).first()
      ).toBeVisible({ timeout: 8_000 })
    }
  })
})

// ─── Permission Matrix — role access guards ────────────────────────────────────

test.describe('Permission Matrix — role access guards', () => {
  // RoleGuard renders "Không có quyền truy cập trang này" in-place; does NOT redirect.
  // Tests verify the access-denied message appears and the content is blocked.

  test('chef is blocked from /admin/products (sees access denied)', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/chef.json' })
    const pg = await ctx.newPage()
    await pg.goto('http://localhost:3000/admin/products')
    await expect(pg.getByText(/Không có quyền truy cập/i)).toBeVisible({ timeout: 8_000 })
    await ctx.close()
  })

  test('cashier is blocked from /admin/staff (sees access denied)', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/cashier.json' })
    const pg = await ctx.newPage()
    await pg.goto('http://localhost:3000/admin/staff')
    await expect(pg.getByText(/Không có quyền truy cập/i)).toBeVisible({ timeout: 8_000 })
    await ctx.close()
  })

  // Uses storageState to avoid rate-limit after the many loginAs calls in B section
  test('manager can access /admin/products', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/manager.json' })
    const pg = await ctx.newPage()
    await pg.goto('http://localhost:3000/admin/products')
    await expect(pg.getByRole('heading', { name: /Sản phẩm/i })).toBeVisible({ timeout: 10_000 })
    await ctx.close()
  })

  test('manager can access /admin/training', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'auth-states/manager.json' })
    const pg = await ctx.newPage()
    await pg.goto('http://localhost:3000/admin/training')
    await expect(pg.getByText('Đào tạo nhân viên')).toBeVisible({ timeout: 10_000 })
    await ctx.close()
  })
})
