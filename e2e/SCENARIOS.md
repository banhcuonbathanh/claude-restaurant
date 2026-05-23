# E2E Test Scenarios — Hệ Thống Quản Lý Quán Bánh Cuốn

> Tool: Playwright · Target: http://localhost:3000 (requires `docker compose up -d`)
> Seed data required: `scripts/seed.sql` must be applied to the DB.

---

## Prerequisites

| Condition | Detail |
|---|---|
| Stack running | `docker compose up -d` — FE :3000, BE :8080, MySQL :3306, Redis :6379 |
| Seed applied | `scripts/seed.sql` loaded (staff accounts + tables with QR tokens) |
| Admin creds | username: `admin` · password: `admin123` |
| Chef creds | username: `chef1` · password: `chef123` |
| Bàn 01 QR token | `a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890` |

---

## Flow 1 — Guest QR → Menu → Cart → Order

**File:** `tests/guest-order.spec.ts`

| Step | Action | Expected |
|---|---|---|
| 1 | Navigate to `/table/a1b2c3d4…` | Redirect to `/menu` |
| 2 | Wait for product cards to load | At least 1 product visible |
| 3 | Click `+` on first available product | Cart badge shows "1" |
| 4 | Click cart icon in header | CartDrawer opens |
| 5 | Click "Thanh toán" in drawer | Navigate to `/checkout` |
| 6 | Fill "Họ tên *" with "Nguyễn Test" | Input has value |
| 7 | Fill "Số điện thoại *" with "0901234567" | Input has value |
| 8 | Select "💵 Tiền mặt COD" radio | Radio checked |
| 9 | Click "Đặt hàng · …" submit button | Navigate to `/order` |
| 10 | Verify order confirmation page | Text "Đơn hàng của bạn" or order content visible |

**AC:** Full guest flow from QR scan to order placement completes without errors.

---

## Flow 2 — Staff KDS: Receive New Order + Mark Items Done

**File:** `tests/kds.spec.ts`

| Step | Action | Expected |
|---|---|---|
| 1 | Chef context: login as chef1 → navigate to `/kds` | KDS page loads (empty state or existing orders) |
| 2 | Guest context: navigate to QR URL → add item → checkout | Order placed successfully |
| 3 | Chef context: wait for new order card to appear | Order card with "Chờ xác nhận" badge visible |
| 4 | Chef context: click item row in the order card | Item qty_served increments |
| 5 | Chef context: verify item shows ✓ (all qty served) | Item text has line-through, green ✓ badge |

**AC:** New order appears in KDS via WebSocket within 10 seconds; item status update works.

---

## Flow 3 — Admin: Create Staff Member

**File:** `tests/admin.spec.ts`

| Step | Action | Expected |
|---|---|---|
| 1 | Login as admin | Redirect to `/dashboard` or `/admin` |
| 2 | Navigate to `/admin/staff` | Staff list page visible |
| 3 | Click "+ Thêm nhân viên" | Create staff modal opens |
| 4 | Fill username (unique, e.g. `e2e_chef_<timestamp>`) | Input has value |
| 5 | Fill password with "E2eTest1" | Input has value |
| 6 | Fill full_name with "E2E Test Chef" | Input has value |
| 7 | Select role "Bếp" (chef) | Role selected |
| 8 | Submit form | Toast "Đã tạo tài khoản nhân viên" appears |
| 9 | Verify new staff row in table | `e2e_chef_<timestamp>` username visible |
| 10 | Click "Sửa" on new staff → change full_name → save | Toast "Đã cập nhật nhân viên" |
| 11 | Click status toggle on new staff | Toast "Đã cập nhật trạng thái"; badge shows "Vô hiệu" |

**AC:** Admin can create, edit, and toggle staff status; all mutations reflect in the table.

---

## Flow 4 — Auth: Role Redirects + Invalid QR + Logout

**File:** `tests/auth.spec.ts` · Diagram: §1.1 · §1.3 · §1.4

| Step | Action | Expected |
|---|---|---|
| 1 | Login as chef | Redirect /kds |
| 2 | Login as cashier | Redirect /pos |
| 3 | Login as manager | Redirect /admin/overview |
| 4 | Login as admin | Redirect /admin/overview |
| 5 | Login with wrong credentials | Stay on /login + error message |
| 6 | Visit /admin/overview unauthenticated | Redirect /login |
| 7 | Navigate to invalid QR URL | Error shown; no /menu redirect |
| 8 | Manager logout | Redirect /login; protected route also redirects to /login |

---

## Flow 5 — Add Items to Existing Order

**File:** `tests/add-items.spec.ts` · Diagram: §2.2
**Seed prerequisite:** `ban04` QR token in `scripts/seed.sql`

| Step | Action | Expected |
|---|---|---|
| 1 | Guest auth via ban04 | /menu |
| 2 | Place order | Redirect /order/:id |
| 3 | Click "Thêm món" | Redirect /menu?add_to_order=:id |
| 4 | Add item + submit | Toast "Đã thêm món thành công" or back to /order/:id |
| 5 | Submit with invalid orderId | 409 error toast shown |

---

## Flow 6 — POS & COD Payment

**File:** `tests/pos.spec.ts` · Diagram: §4.1 · §4.2
**Seed prerequisite:** `ban05`, `ban06` QR tokens in `scripts/seed.sql`

| Step | Action | Expected |
|---|---|---|
| 1 | Cashier login | Redirect /pos |
| 2 | POS: table grid visible | At least 1 Bàn button shown |
| 3 | Click table | Order panel loads, no error |
| 4 | Click "Tạo đơn mới" | Modal opens |
| 5 | Submit order form | No error toast |
| 6 | Guest places order; cashier opens /cashier/payment/:id | Total + payment method options visible |
| 7 | "Xác nhận COD" button | Present on payment page |

Note: VNPay/MoMo/ZaloPay QR gateway tests are excluded — require ngrok sandbox (Phase 7-7).

---

## Flow 7 — Admin Overview & QR Marketing

**File:** `tests/admin-overview.spec.ts` · Diagram: §5.1 · §5.4
**Seed prerequisite:** `ban07` QR token in `scripts/seed.sql`

| Step | Action | Expected |
|---|---|---|
| 1 | Manager opens /admin/overview | 4 stat cards visible |
| 2 | Table grid | At least 1 table card |
| 3 | "Chờ xác nhận" section | Visible |
| 4 | Guest places order → manager sees it | No crash; page stays live |
| 5 | "Kiểm tra" toggle | Prep panel appears (if active orders exist) |
| 6 | Manager opens /admin/marketing | QR cards + QR images rendered |
| 7 | Copy button | Green checkmark briefly shown |
| 8 | SVG / Print buttons | Visible |
| 9 | Product catalogue section | Visible |

---

## Flow 8 — Product/Category/Topping CRUD

**File:** `tests/admin-products.spec.ts` · Diagram: §5.3

| Step | Action | Expected |
|---|---|---|
| 1 | /admin/products | List renders |
| 2 | Create product | Toast "Đã tạo"; row appears |
| 3 | Edit product name | Toast "Đã cập nhật" |
| 4 | Soft-delete product | Toast "Đã xoá / Đã ẩn" |
| 5 | /admin/categories — create | Toast "Đã tạo" |
| 6 | /admin/toppings — create | Toast "Đã tạo" |

---

## Seed Requirement Summary

| QR Token | Table | Used by |
|---|---|---|
| `a1b2c3d4…` (ban01) | Bàn 01 | guest-order.spec.ts |
| `b2c3d4e5…` (ban02) | Bàn 02 | kds.spec.ts — WS new order |
| `c3d4e5f6…` (ban03) | Bàn 03 | kds.spec.ts — mark item |
| `d4e5f678…` (ban04) | Bàn 04 | add-items.spec.ts |
| `e5f67890…` (ban05) | Bàn 05 | pos.spec.ts — payment page |
| `f6789012…` (ban06) | Bàn 06 | pos.spec.ts — COD confirm |
| `a7b8c9d0…` (ban07) | Bàn 07 | admin-overview.spec.ts — WS event |

---

## Running Tests

```bash
# Install (one time)
cd e2e && npm install && npx playwright install chromium

# Ensure stack is up
docker compose up -d

# Run all tests
cd e2e && npm test

# Run individual flows
npm run test:guest       # §2.1 QR → order
npm run test:kds         # §3 KDS
npm run test:admin       # §5.2 staff management
npm run test:auth        # §1.1 §1.3 §1.4 auth flows
npm run test:add-items   # §2.2 add to existing order
npm run test:pos         # §4.1 §4.2 POS + payment
npm run test:overview    # §5.1 §5.4 admin overview + marketing
npm run test:products    # §5.3 product/category/topping CRUD

# Visual debugging
npm run test:headed
npm run test:ui
```
