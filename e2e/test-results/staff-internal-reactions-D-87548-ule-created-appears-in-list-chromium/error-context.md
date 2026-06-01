# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staff-internal-reactions.spec.ts >> D — Training Management >> D1 — training module created appears in list
- Location: tests/staff-internal-reactions.spec.ts:515:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Thêm module|\+ Module|Tạo module|Tạo/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - heading "Quản trị hệ thống" [level=1] [ref=e4]
      - navigation [ref=e5]:
        - link "Tổng quan" [ref=e6] [cursor=pointer]:
          - /url: /admin/overview
        - link "Tổng kết" [ref=e7] [cursor=pointer]:
          - /url: /admin/summary
        - link "Sản phẩm" [ref=e8] [cursor=pointer]:
          - /url: /admin/products
        - link "Combo" [ref=e9] [cursor=pointer]:
          - /url: /admin/combos
        - link "Danh mục" [ref=e10] [cursor=pointer]:
          - /url: /admin/categories
        - link "Topping" [ref=e11] [cursor=pointer]:
          - /url: /admin/toppings
        - link "Nhân viên" [ref=e12] [cursor=pointer]:
          - /url: /admin/staff
        - link "Công việc" [ref=e13] [cursor=pointer]:
          - /url: /admin/todo-list
        - link "Kho nguyên liệu" [ref=e14] [cursor=pointer]:
          - /url: /admin/ingredients
        - link "Marketing" [ref=e15] [cursor=pointer]:
          - /url: /admin/marketing
        - link "Đào tạo" [ref=e16] [cursor=pointer]:
          - /url: /admin/training
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - heading "Đào tạo nhân viên" [level=1] [ref=e21]
          - paragraph [ref=e22]: Quản lý hướng dẫn và theo dõi tiến trình
        - button "+ New Guide" [ref=e23] [cursor=pointer]
      - generic [ref=e24]:
        - button "Tất cả" [pressed] [ref=e25] [cursor=pointer]
        - button "Bếp" [ref=e26] [cursor=pointer]
        - button "Thu ngân" [ref=e27] [cursor=pointer]
        - button "Nhân viên" [ref=e28] [cursor=pointer]
        - button "Quản lý" [ref=e29] [cursor=pointer]
        - generic [ref=e30]: 4 hướng dẫn
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]: 📚
            - 'generic "Vai trò: Bếp" [ref=e37]': Bếp
            - button "Tuỳ chọn" [ref=e39] [cursor=pointer]: ⋮
          - generic [ref=e40]:
            - heading "Kỹ Thuật v2 Updated" [level=3] [ref=e41]
            - 'generic "Vai trò: Bếp" [ref=e43]': Bếp
            - button "Xem tiến trình →" [ref=e44] [cursor=pointer]
        - generic [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e47]: 📚
            - 'generic "Vai trò: Bếp" [ref=e49]': Bếp
            - button "Tuỳ chọn" [ref=e51] [cursor=pointer]: ⋮
          - generic [ref=e52]:
            - heading "Kỹ Thuật Làm Bánh Cuốn" [level=3] [ref=e53]
            - generic [ref=e54]:
              - 'generic "Vai trò: Bếp" [ref=e55]': Bếp
              - 'generic "Vai trò: Nhân viên" [ref=e56]': Nhân viên
            - button "Xem tiến trình →" [ref=e57] [cursor=pointer]
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]: 📚
            - 'generic "Vai trò: Bếp" [ref=e62]': Bếp
            - button "Tuỳ chọn" [ref=e64] [cursor=pointer]: ⋮
          - generic [ref=e65]:
            - heading "Kỹ Thuật Làm Bánh Cuốn" [level=3] [ref=e66]
            - paragraph [ref=e67]: Hướng dẫn kỹ thuật cơ bản
            - generic [ref=e68]:
              - 'generic "Vai trò: Bếp" [ref=e69]': Bếp
              - 'generic "Vai trò: Nhân viên" [ref=e70]': Nhân viên
            - button "Xem tiến trình →" [ref=e71] [cursor=pointer]
        - generic [ref=e72]:
          - generic [ref=e73]:
            - generic [ref=e74]: 📚
            - 'generic "Vai trò: Bếp" [ref=e76]': Bếp
            - button "Tuỳ chọn" [ref=e78] [cursor=pointer]: ⋮
          - generic [ref=e79]:
            - heading "Kỹ Thuật Làm Bánh Cuốn (Updated)" [level=3] [ref=e80]
            - generic [ref=e81]:
              - 'generic "Vai trò: Bếp" [ref=e82]': Bếp
              - 'generic "Vai trò: Nhân viên" [ref=e83]': Nhân viên
            - button "Xem tiến trình →" [ref=e84] [cursor=pointer]
      - generic [ref=e86]:
        - generic [ref=e87]:
          - heading "Completion Tracking— Kỹ Thuật v2 Updated" [level=2] [ref=e88]:
            - text: Completion Tracking
            - generic [ref=e89]: — Kỹ Thuật v2 Updated
          - combobox [ref=e90]:
            - option "Kỹ Thuật v2 Updated" [selected]
            - option "Kỹ Thuật Làm Bánh Cuốn"
            - option "Kỹ Thuật Làm Bánh Cuốn"
            - option "Kỹ Thuật Làm Bánh Cuốn (Updated)"
        - generic [ref=e91]: Chưa có nhân viên nào được giao hướng dẫn này.
  - region "Notifications alt+T"
  - alert [ref=e92]
  - generic [ref=e93]:
    - paragraph [ref=e94]:
      - text: Chúng tôi dùng cookies và bộ nhớ trình duyệt để lưu giỏ hàng và trạng thái đơn hàng. Không có dữ liệu thẻ ngân hàng nào được lưu. Xem
      - link "Chính sách bảo mật" [ref=e95] [cursor=pointer]:
        - /url: /privacy-policy
      - text: .
    - button "Đồng ý" [ref=e96] [cursor=pointer]
```

# Test source

```ts
  418 | 
  419 |   test.beforeEach(async ({ page }) => {
  420 |     await loginAs(page, 'manager')
  421 |     await page.goto('/admin/marketing')
  422 |     await expect(page).toHaveURL(/\/admin\/marketing/, { timeout: 10_000 })
  423 |   })
  424 | 
  425 |   // C1: New table added → new table row in marketing page
  426 |   test('C1 — new table added appears on marketing page', async ({ page }) => {
  427 |     const tableName = `C1 Bàn ${Date.now()}`
  428 |     const addBtn = page.getByRole('button', { name: /Thêm bàn|\+ Bàn|Tạo bàn/i })
  429 |     if (await addBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
  430 |       await addBtn.click()
  431 |       const nameInput = page.getByPlaceholder(/tên bàn|table name|Bàn/i).first()
  432 |       if (await nameInput.isVisible({ timeout: 4_000 }).catch(() => false)) {
  433 |         await nameInput.fill(tableName)
  434 |       }
  435 |       await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  436 |       await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  437 |       await expect(page.getByText(tableName)).toBeVisible({ timeout: 5_000 })
  438 |     }
  439 |   })
  440 | 
  441 |   // C2: QR code generated for table → QR visible, can download/print
  442 |   test('C2 — QR code is visible for each table', async ({ page }) => {
  443 |     await expect(page.getByText(/Bàn/i).first()).toBeVisible({ timeout: 12_000 })
  444 |     const qrImage = page.locator('img[alt*="QR"], svg[class*="qr"], canvas').first()
  445 |     await expect(qrImage).toBeVisible({ timeout: 10_000 })
  446 |   })
  447 | 
  448 |   test('C2 — SVG download button present', async ({ page }) => {
  449 |     const svgBtn = page.getByRole('button', { name: /SVG|Tải SVG|Download/i }).first()
  450 |     await expect(svgBtn).toBeVisible({ timeout: 10_000 })
  451 |   })
  452 | 
  453 |   test('C2 — copy URL button writes to clipboard', async ({ page, context }) => {
  454 |     await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  455 |     const copyBtn = page.getByRole('button', { name: /Copy|Sao chép/i }).first()
  456 |     await expect(copyBtn).toBeVisible({ timeout: 10_000 })
  457 |     await copyBtn.click()
  458 |     await expect(
  459 |       page
  460 |         .locator('[class*="green"], [class*="check"]')
  461 |         .or(page.getByRole('button', { name: /Copied|Đã sao chép/i }).first())
  462 |     ).toBeVisible({ timeout: 3_000 })
  463 |   })
  464 | 
  465 |   // C3: QR regenerated → new QR shown; old token no longer valid
  466 |   test('C3 — QR regenerated: new QR shown and old token invalidated', async ({ page }) => {
  467 |     const regenBtn = page.getByRole('button', { name: /Tạo lại QR|Regenerate|Làm mới QR/i }).first()
  468 |     if (await regenBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
  469 |       // Capture old QR src before regenerating
  470 |       const oldQrSrc = await page
  471 |         .locator('img[alt*="QR"], canvas')
  472 |         .first()
  473 |         .getAttribute('src')
  474 |         .catch(() => null)
  475 | 
  476 |       await regenBtn.click()
  477 |       const confirmBtn = page.getByRole('button', { name: /Xác nhận|Confirm|OK/i })
  478 |       if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
  479 |         await confirmBtn.click()
  480 |       }
  481 |       await expect(page.getByText(/Đã tạo lại|thành công/i)).toBeVisible({ timeout: 8_000 })
  482 | 
  483 |       // New QR image should differ from the old one (or just be visible)
  484 |       const newQrEl = page.locator('img[alt*="QR"], canvas').first()
  485 |       await expect(newQrEl).toBeVisible({ timeout: 5_000 })
  486 |       const newQrSrc = await newQrEl.getAttribute('src').catch(() => null)
  487 |       if (oldQrSrc && newQrSrc) {
  488 |         expect(newQrSrc).not.toBe(oldQrSrc)
  489 |       }
  490 |     }
  491 |   })
  492 | 
  493 |   // C4: Product catalogue print button present
  494 |   test('C4 — product catalogue print button is present', async ({ page }) => {
  495 |     await expect(page.getByText(/Danh mục|Catalogue|sản phẩm/i).first()).toBeVisible({ timeout: 10_000 })
  496 |     const printBtn = page.getByRole('button', { name: /In|Print/i }).first()
  497 |     await expect(printBtn).toBeVisible({ timeout: 10_000 })
  498 |   })
  499 | })
  500 | 
  501 | // ─── D — Training Management ──────────────────────────────────────────────────
  502 | 
  503 | test.describe('D — Training Management', () => {
  504 |   test.describe.configure({ mode: 'serial' })
  505 | 
  506 |   test.beforeEach(async ({ page }) => {
  507 |     await loginAs(page, 'manager')
  508 |     await page.goto('/admin/training')
  509 |     await expect(
  510 |       page.getByRole('heading', { name: /Đào tạo|Training/i })
  511 |     ).toBeVisible({ timeout: 10_000 })
  512 |   })
  513 | 
  514 |   // D1: Training module created → appears in list
  515 |   test('D1 — training module created appears in list', async ({ page }) => {
  516 |     const moduleName = `D1 Module ${Date.now()}`
  517 | 
> 518 |     await page.getByRole('button', { name: /Thêm module|\+ Module|Tạo module|Tạo/i }).click()
      |                                                                                       ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  519 |     const nameInput = page.getByPlaceholder(/tên module|module name|Tiêu đề/i).first()
  520 |     await expect(nameInput).toBeVisible({ timeout: 6_000 })
  521 |     await nameInput.fill(moduleName)
  522 |     await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
  523 | 
  524 |     await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })
  525 |     await expect(page.getByText(moduleName)).toBeVisible({ timeout: 5_000 })
  526 |   })
  527 | 
  528 |   // D2: Training assigned to staff → assignment visible in tracking table
  529 |   test('D2 — training assigned to staff appears in tracking table', async ({ page }) => {
  530 |     // Find an existing module and assign it
  531 |     const assignBtn = page
  532 |       .getByRole('button', { name: /Giao|Assign|Phân công/i })
  533 |       .first()
  534 |     if (await assignBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
  535 |       await assignBtn.click()
  536 |       // Select a staff member from the modal
  537 |       const staffSelect = page
  538 |         .getByRole('combobox')
  539 |         .or(page.locator('select'))
  540 |         .first()
  541 |       if (await staffSelect.isVisible({ timeout: 4_000 }).catch(() => false)) {
  542 |         await staffSelect.selectOption({ index: 1 })
  543 |       }
  544 |       await page.getByRole('button', { name: /Giao|Assign|Xác nhận/i }).last().click()
  545 |       await expect(
  546 |         page.getByText(/Đã giao|giao thành công|thành công/i)
  547 |       ).toBeVisible({ timeout: 8_000 })
  548 |     }
  549 |   })
  550 | 
  551 |   // D3: Staff marks training complete → status badge updates to ✅
  552 |   test('D3 — staff can mark assigned training as complete', async ({ page }) => {
  553 |     // Look for an "in progress" or assigned training row with a "Complete" button
  554 |     const completeBtn = page
  555 |       .getByRole('button', { name: /Hoàn thành|Complete|Đánh dấu xong/i })
  556 |       .first()
  557 |     if (await completeBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
  558 |       await completeBtn.click()
  559 |       await expect(
  560 |         page.getByText(/Hoàn thành|✅|completed/i).first()
  561 |       ).toBeVisible({ timeout: 8_000 })
  562 |     }
  563 |   })
  564 | 
  565 |   // D4: Manager reviews training progress → opens TrainingProgressModal
  566 |   test('D4 — manager can open training progress modal', async ({ page }) => {
  567 |     const progressBtn = page
  568 |       .getByRole('button', { name: /Tiến độ|Progress|Chi tiết/i })
  569 |       .first()
  570 |     if (await progressBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
  571 |       await progressBtn.click()
  572 |       await expect(
  573 |         page.getByRole('dialog').or(page.locator('[class*="modal"]'))
  574 |       ).toBeVisible({ timeout: 6_000 })
  575 |       // Modal shows 3-step timeline or quiz attempts
  576 |       await expect(
  577 |         page.getByText(/Bước|Step|Quiz|Lần thử/i).first()
  578 |       ).toBeVisible({ timeout: 5_000 })
  579 |     }
  580 |   })
  581 | 
  582 |   // D5: Manager adds note to training → note saved and visible
  583 |   test('D5 — manager adds note to training record', async ({ page }) => {
  584 |     const noteBtn = page
  585 |       .getByRole('button', { name: /Ghi chú|Add note|Nhận xét/i })
  586 |       .first()
  587 |     if (await noteBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
  588 |       await noteBtn.click()
  589 |       const noteInput = page
  590 |         .getByPlaceholder(/ghi chú|note|nhận xét/i)
  591 |         .or(page.getByRole('textbox').last())
  592 |       await expect(noteInput).toBeVisible({ timeout: 5_000 })
  593 |       await noteInput.fill('D5 automated test note')
  594 |       await page.getByRole('button', { name: /Lưu|Save/i }).last().click()
  595 |       await expect(page.getByText(/Đã lưu|lưu thành công|thành công/i)).toBeVisible({ timeout: 8_000 })
  596 |     }
  597 |   })
  598 | 
  599 |   // D6: Training filtered by role → filter tabs visible
  600 |   test('D6 — training filter tabs by role are present', async ({ page }) => {
  601 |     // Zone B filter tabs: All / Chef / Cashier / Staff
  602 |     await expect(
  603 |       page.getByRole('tab', { name: /Tất cả|All/i })
  604 |         .or(page.getByText(/Tất cả|All/i).first())
  605 |     ).toBeVisible({ timeout: 8_000 })
  606 | 
  607 |     const chefTab = page
  608 |       .getByRole('tab', { name: /Bếp|Chef/i })
  609 |       .or(page.getByRole('button', { name: /Bếp|Chef/i }).first())
  610 |     if (await chefTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
  611 |       await chefTab.click()
  612 |       // After filtering, page should not show an error
  613 |       await expect(page.getByText(/lỗi hệ thống|error/i)).not.toBeVisible()
  614 |     }
  615 |   })
  616 | })
  617 | 
  618 | // ─── E — Overview & Monitoring ────────────────────────────────────────────────
```