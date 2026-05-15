import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/auth'

/**
 * Flow 3: Admin creates a staff member, edits it, and toggles status.
 * Uses a timestamp-based username to avoid collisions across test runs.
 * Requires: docker compose up -d + seed data applied.
 */
test.describe.configure({ mode: 'serial' })

test.describe('Admin — Staff management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/staff')
    await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  })

  test('create a new staff member', async ({ page }) => {
    const username = `e2e_chef_${Date.now()}`
    // Open modal
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await expect(page.getByRole('heading', { name: 'Thêm nhân viên' })).toBeVisible()

    // Fill form
    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('E2E Test Chef')

    // Select role: pick "Bếp" from the select
    await page.locator('select').selectOption('chef')

    // Submit
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()

    // Success toast
    await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })

    // New staff row appears in the table
    await expect(page.getByText(username)).toBeVisible({ timeout: 5_000 })
  })

  test('edit an existing staff member full name', async ({ page }) => {
    const username = `e2e_chef_${Date.now()}`
    // Create first, then edit
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('Original Name')
    await page.locator('select').selectOption('chef')
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
    await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })

    // Find the row for the new staff and click "Sửa"
    const row = page.locator('tr').filter({ hasText: username })
    await expect(row).toBeVisible({ timeout: 5_000 })
    await row.getByRole('button', { name: 'Sửa' }).click()

    // Edit modal heading includes the username
    await expect(page.getByText(`Sửa nhân viên — ${username}`)).toBeVisible()
    // Edit modal's full_name input has no placeholder; scope to the form via the "Lưu" button's ancestor
    const editForm = page.getByRole('button', { name: 'Lưu' }).locator('xpath=ancestor::form')
    const nameInput = editForm.getByRole('textbox').first()
    await nameInput.clear()
    await nameInput.fill('Updated Name')
    await page.getByRole('button', { name: 'Lưu' }).click()

    // Success toast
    await expect(page.getByText('Đã cập nhật nhân viên')).toBeVisible({ timeout: 8_000 })

    // Updated name in table
    await expect(page.getByText('Updated Name').first()).toBeVisible()
  })

  test('toggle staff active status', async ({ page }) => {
    const username = `e2e_chef_${Date.now()}`
    // Create a staff member to toggle
    await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
    await page.getByPlaceholder('chef_an').fill(username)
    await page.locator('input[type="password"]').fill('E2eTest1')
    await page.getByPlaceholder('Nguyễn Văn An').fill('Status Toggle Test')
    await page.locator('select').selectOption('cashier')
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
    await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })

    // Find the new staff row and click its status toggle (shows "Đang hoạt động")
    const row = page.locator('tr').filter({ hasText: username })
    await expect(row).toBeVisible({ timeout: 5_000 })
    const statusBtn = row.getByRole('button', { name: 'Đang hoạt động' })
    await expect(statusBtn).toBeVisible()
    await statusBtn.click()

    // Toast confirms update
    await expect(page.getByText('Đã cập nhật trạng thái')).toBeVisible({ timeout: 8_000 })

    // Status button now shows "Vô hiệu"
    await expect(row.getByRole('button', { name: 'Vô hiệu' })).toBeVisible()
  })
})
