# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staff-internal-reactions.spec.ts >> Permission Matrix — role access guards >> cashier is blocked from /admin/staff
- Location: tests/staff-internal-reactions.spec.ts:703:7

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/admin\/staff/
Received string: "http://localhost:3000/admin/staff"
Timeout: 8000ms

Call log:
  - Expect "not toHaveURL" with timeout 8000ms
    20 × unexpected value "http://localhost:3000/admin/staff"

```

```yaml
- text: Không có quyền truy cập trang này
- region "Notifications alt+T"
- alert
- paragraph:
  - text: Chúng tôi dùng cookies và bộ nhớ trình duyệt để lưu giỏ hàng và trạng thái đơn hàng. Không có dữ liệu thẻ ngân hàng nào được lưu. Xem
  - link "Chính sách bảo mật":
    - /url: /privacy-policy
  - text: .
- button "Đồng ý"
```

# Test source

```ts
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
  619 | 
  620 | test.describe('E — Overview & Monitoring', () => {
  621 |   test.beforeEach(async ({ page }) => {
  622 |     await loginAs(page, 'manager')
  623 |     await expect(page).toHaveURL(/\/admin\/overview/, { timeout: 10_000 })
  624 |   })
  625 | 
  626 |   // E1: "Kiểm tra" toggled on a table → prep panel appears below
  627 |   test('E1 — Kiểm tra toggle on table card reveals prep panel', async ({ page }) => {
  628 |     const kiemtra = page.getByRole('checkbox', { name: /Kiểm tra/i }).first()
  629 |     if (await kiemtra.isVisible({ timeout: 8_000 }).catch(() => false)) {
  630 |       await kiemtra.check()
  631 |       await expect(
  632 |         page.getByText(/Tổng cần làm|Cần làm|Prep/i).first()
  633 |       ).toBeVisible({ timeout: 5_000 })
  634 |     }
  635 |   })
  636 | 
  637 |   // E2: Prep panel reviewed — shows items for checked tables
  638 |   test('E2 — prep panel shows items checklist for checked tables', async ({ page }) => {
  639 |     const kiemtra = page.getByRole('checkbox', { name: /Kiểm tra/i }).first()
  640 |     if (await kiemtra.isVisible({ timeout: 8_000 }).catch(() => false)) {
  641 |       const isChecked = await kiemtra.isChecked()
  642 |       if (!isChecked) await kiemtra.check()
  643 |       const prepPanel = page
  644 |         .getByText(/Tổng cần làm|PrepPanel|Cần làm/i)
  645 |         .first()
  646 |       await expect(prepPanel).toBeVisible({ timeout: 5_000 })
  647 |     }
  648 |   })
  649 | 
  650 |   // E3: Stat cards present and auto-refresh (every 30 s) — verify they load
  651 |   test('E3 — 4 stat cards render with numeric values', async ({ page }) => {
  652 |     await expect(page.getByText(/Bàn phục vụ|Bàn đang phục vụ/i).first()).toBeVisible({ timeout: 10_000 })
  653 |     await expect(page.getByText(/Chờ làm|Chờ xác nhận/i).first()).toBeVisible({ timeout: 5_000 })
  654 |     await expect(page.getByText(/Đang làm|Đang chuẩn bị/i).first()).toBeVisible({ timeout: 5_000 })
  655 |     await expect(page.getByText(/Khẩn cấp|Urgent/i).first()).toBeVisible({ timeout: 5_000 })
  656 | 
  657 |     // Each stat card should display a number (0 or more)
  658 |     const statNumbers = page.locator('[class*="stat"] [class*="count"], [class*="card"] span')
  659 |     // Just verify the page didn't crash/show error
  660 |     await expect(page.getByText(/lỗi kết nối|lỗi hệ thống/i)).not.toBeVisible()
  661 |   })
  662 | 
  663 |   // E4: Table urgency colour changes by elapsed time — border colour classes present
  664 |   test('E4 — table cards render urgency colour indicators', async ({ page }) => {
  665 |     const tableCards = page
  666 |       .locator('[class*="table"], [class*="card"]')
  667 |       .filter({ hasText: /Bàn/i })
  668 |     const count = await tableCards.count()
  669 |     if (count > 0) {
  670 |       // At least one table card is rendered — urgency borders are applied via CSS classes
  671 |       // We can verify the element structure is in place without a live order
  672 |       await expect(tableCards.first()).toBeVisible({ timeout: 5_000 })
  673 |     }
  674 |   })
  675 | 
  676 |   // E5: "Mang đi" (takeaway) confirmed by manager → order appears on KDS board
  677 |   test('E5 — Mang đi confirm button present in overview', async ({ page }) => {
  678 |     // Look for a takeaway confirm button in the waiting orders section
  679 |     const mangiBtn = page
  680 |       .getByRole('button', { name: /Mang đi|Takeaway|Xác nhận mang đi/i })
  681 |       .first()
  682 |     if (await mangiBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
  683 |       await mangiBtn.click()
  684 |       await expect(
  685 |         page.getByText(/Đã xác nhận|thành công/i).first()
  686 |       ).toBeVisible({ timeout: 8_000 })
  687 |     }
  688 |   })
  689 | })
  690 | 
  691 | // ─── Permission Matrix — cross-role smoke tests ────────────────────────────────
  692 | 
  693 | test.describe('Permission Matrix — role access guards', () => {
  694 |   // Chef cannot access /admin/products
  695 |   test('chef is blocked from /admin/products', async ({ page }) => {
  696 |     await loginAs(page, 'chef')
  697 |     await page.goto('/admin/products')
  698 |     // Should redirect to /kds or /login, or show an access-denied page
  699 |     await expect(page).not.toHaveURL(/\/admin\/products/, { timeout: 8_000 })
  700 |   })
  701 | 
  702 |   // Cashier cannot access /admin/staff
  703 |   test('cashier is blocked from /admin/staff', async ({ page }) => {
  704 |     await loginAs(page, 'cashier')
  705 |     await page.goto('/admin/staff')
> 706 |     await expect(page).not.toHaveURL(/\/admin\/staff/, { timeout: 8_000 })
      |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  707 |   })
  708 | 
  709 |   // Manager can access /admin/products (Product / Topping / Combo CRUD ✅)
  710 |   test('manager can access /admin/products', async ({ page }) => {
  711 |     await loginAs(page, 'manager')
  712 |     await page.goto('/admin/products')
  713 |     await expect(
  714 |       page.getByRole('heading', { name: /Sản phẩm|Products/i })
  715 |     ).toBeVisible({ timeout: 10_000 })
  716 |   })
  717 | 
  718 |   // Manager can access /admin/training (assign training ✅)
  719 |   test('manager can access /admin/training', async ({ page }) => {
  720 |     await loginAs(page, 'manager')
  721 |     await page.goto('/admin/training')
  722 |     await expect(
  723 |       page.getByRole('heading', { name: /Đào tạo|Training/i })
  724 |     ).toBeVisible({ timeout: 10_000 })
  725 |   })
  726 | })
  727 | 
```