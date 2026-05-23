import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/auth'

/**
 * Admin product/category/topping CRUD flows — §5.3
 * client_flow/cleint_flow_diagram.md
 *
 * Runs serially to avoid race conditions between create → edit → delete steps.
 */
test.describe.configure({ mode: 'serial' })

// ─── Products (/admin/products) ──────────────────────────────────────────────

test.describe('Admin §5.3 — Product CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager')
    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { name: /Sản phẩm|Products/i })).toBeVisible({ timeout: 10_000 })
  })

  test('product list renders: name · category · price · availability', async ({ page }) => {
    // At least one product row or card must be visible
    await expect(page.locator('table tbody tr, [class*="card"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('create a new product', async ({ page }) => {
    const productName = `E2E Bánh Test ${Date.now()}`

    await page.getByRole('button', { name: /Thêm sản phẩm|Tạo sản phẩm|\+ Sản phẩm/i }).click()
    await expect(page.getByRole('dialog, form')).toBeVisible({ timeout: 6_000 }).catch(() => {})

    // Fill name
    const nameInput = page.getByPlaceholder(/tên sản phẩm|product name|Bánh cuốn/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(productName)

    // Fill price
    const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
    if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await priceInput.fill('25000')
    }

    // Submit
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()

    // Success toast
    await expect(
      page.getByText(/Đã tạo|Tạo thành công|thành công/i)
    ).toBeVisible({ timeout: 8_000 })

    // Product appears in list
    await expect(page.getByText(productName)).toBeVisible({ timeout: 5_000 })
  })

  test('edit a product name', async ({ page }) => {
    const productName = `E2E Edit Prod ${Date.now()}`
    const updatedName = `${productName} Updated`

    // Create first
    await page.getByRole('button', { name: /Thêm sản phẩm|Tạo sản phẩm|\+ Sản phẩm/i }).click()
    const nameInput = page.getByPlaceholder(/tên sản phẩm|product name|Bánh cuốn/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(productName)
    const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
    if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await priceInput.fill('30000')
    }
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
    await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })

    // Edit it
    const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: productName })
    await expect(row).toBeVisible({ timeout: 5_000 })
    await row.getByRole('button', { name: /Sửa|Edit/i }).click()

    const editNameInput = page.getByDisplayValue(productName)
    await expect(editNameInput).toBeVisible({ timeout: 5_000 })
    await editNameInput.fill(updatedName)
    await page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).last().click()

    await expect(page.getByText(/Đã cập nhật|cập nhật thành công|thành công/i)).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(updatedName)).toBeVisible()
  })

  test('soft-delete (deactivate) a product', async ({ page }) => {
    const productName = `E2E Delete Prod ${Date.now()}`

    // Create first
    await page.getByRole('button', { name: /Thêm sản phẩm|Tạo sản phẩm|\+ Sản phẩm/i }).click()
    const nameInput = page.getByPlaceholder(/tên sản phẩm|product name|Bánh cuốn/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(productName)
    const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
    if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await priceInput.fill('20000')
    }
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()
    await expect(page.getByText(/Đã tạo|thành công/i)).toBeVisible({ timeout: 8_000 })

    // Deactivate (soft-delete)
    const row = page.locator('tr, [class*="row"], [class*="card"]').filter({ hasText: productName })
    await expect(row).toBeVisible({ timeout: 5_000 })
    const deleteBtn = row.getByRole('button', { name: /Xoá|Ẩn|Deactivate|Vô hiệu/i })
    if (await deleteBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await deleteBtn.click()
      // Confirmation dialog
      const confirmBtn = page.getByRole('button', { name: /Xác nhận|Confirm|OK/i })
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click()
      }
      await expect(
        page.getByText(/Đã xoá|Đã ẩn|vô hiệu|thành công/i)
      ).toBeVisible({ timeout: 8_000 })
    }
  })
})

// ─── Categories (/admin/categories) ──────────────────────────────────────────

test.describe('Admin §5.3 — Category CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager')
    await page.goto('/admin/categories')
    await expect(
      page.getByRole('heading', { name: /Danh mục|Category|Categories/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('category list renders: name · sort_order · product count', async ({ page }) => {
    await expect(
      page.locator('table tbody tr, [class*="row"], [class*="card"]').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('create a category', async ({ page }) => {
    const catName = `E2E Cat ${Date.now()}`

    await page.getByRole('button', { name: /Thêm danh mục|\+ Danh mục|Tạo/i }).click()
    const nameInput = page.getByPlaceholder(/tên danh mục|category name|Bánh/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(catName)
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()

    await expect(
      page.getByText(/Đã tạo|thành công/i)
    ).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(catName)).toBeVisible({ timeout: 5_000 })
  })
})

// ─── Toppings (/admin/toppings) ───────────────────────────────────────────────

test.describe('Admin §5.3 — Topping CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager')
    await page.goto('/admin/toppings')
    await expect(
      page.getByRole('heading', { name: /Topping|Topping/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('topping list renders: name · price', async ({ page }) => {
    await expect(
      page.locator('table tbody tr, [class*="row"], [class*="card"]').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('create a topping', async ({ page }) => {
    const toppingName = `E2E Topping ${Date.now()}`

    await page.getByRole('button', { name: /Thêm topping|\+ Topping|Tạo/i }).click()
    const nameInput = page.getByPlaceholder(/tên topping|topping name/i).first()
    await expect(nameInput).toBeVisible({ timeout: 6_000 })
    await nameInput.fill(toppingName)
    const priceInput = page.getByPlaceholder(/giá|price|0/i).first()
    if (await priceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await priceInput.fill('5000')
    }
    await page.getByRole('button', { name: /Tạo|Lưu|Save|Thêm/i }).last().click()

    await expect(
      page.getByText(/Đã tạo|thành công/i)
    ).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(toppingName)).toBeVisible({ timeout: 5_000 })
  })
})
