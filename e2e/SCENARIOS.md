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

## Running Tests

```bash
# Install (one time)
cd e2e && npm install && npx playwright install chromium

# Ensure stack is up
docker compose up -d

# Run all tests
cd e2e && npm test

# Run single flow
npm run test:guest
npm run test:kds
npm run test:admin

# Visual debugging
npm run test:headed
npm run test:ui
```
