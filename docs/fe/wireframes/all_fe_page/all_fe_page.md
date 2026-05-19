# FE Page Registry — Hệ Thống Quản Lý Quán Bánh Cuốn

> Last updated: 2026-05-19
> Total: 26 pages across 5 groups.
> Status legend: ✅ Done · 🚧 In Progress · ⬜ Not Started

---

## 1. Customer-Facing (Shop)

| # | Page | Route | Min Role | Status | Wireframe | Notes |
|---|---|---|---|---|---|---|
| 1.1 | Root / Home | `/` | Public | ✅ Done | — | Redirect to `/menu` or `/login` |
| 1.2 | QR Table Entry | `/table/[tableId]` | Guest (QR) | ✅ Done | — | POST /auth/guest → set tableId → redirect /menu |
| 1.3 | Menu & Catalog | `/menu` | Guest / Customer | ✅ Done | — | TanStack Query · CategoryTabs · CartDrawer |
| 1.4 | Product Detail | `/menu/product/[id]` | Guest / Customer | ✅ Done | — | Toppings selection modal |
| 1.5 | Combo Detail | `/menu/combo/[id]` | Guest / Customer | ✅ Done | — | Combo item list + confirm |
| 1.6 | Menu Settings | `/menu/settings` | Guest / Customer | ✅ Done | — | — |
| 1.7 | Checkout | `/checkout` | Guest / Customer | ✅ Done | — | RHF+Zod · POST /orders · no payment_method in body |
| 1.8 | Order List | `/order` | Customer | ✅ Done | — | Reads localStorage cached order IDs |
| 1.9 | Order Tracking (SSE) | `/order/[id]` | Owner / Customer | ✅ Done | — | SSE via @microsoft/fetch-event-source · cancel if served < 30% |

**Spec refs:** [Spec_3_Menu_Checkout_UI_v2.md](../../spec/Spec_3_Menu_Checkout_UI_v2.md) · [Spec_6_QR_POS.md](../../spec/Spec_6_QR_POS.md) · [API_CONTRACT §3, §4](../../contract/API_CONTRACT_v1.2.md)

---

## 2. Auth

| # | Page | Route | Min Role | Status | Wireframe | Notes |
|---|---|---|---|---|---|---|
| 2.1 | Login | `/login` | Public | ✅ Done | — | Wrong creds → inline error (not toast) · redirect by role on success |

**Spec refs:** [Spec1_Auth_Updated_v2.md](../../spec/Spec1_Auth_Updated_v2.md) · [FE_SYSTEM_GUIDE §5, §6](../FE_SYSTEM_GUIDE.md)

---

## 3. Staff Dashboard

| # | Page | Route | Min Role | Status | Wireframe | Notes |
|---|---|---|---|---|---|---|
| 3.1 | KDS (Kitchen Display) | `/kds` | Chef (2) | ✅ Done | — | WebSocket · full-screen · urgency colors · sound on new order |
| 3.2 | Orders Live View | `/orders/live` | Chef (2) | ✅ Done | — | WS real-time order list |
| 3.3 | POS (Cashier) | `/pos` | Cashier (3) | ✅ Done | — | 2-col layout · source="pos" · navigate to payment when ready |
| 3.4 | Payment | `/cashier/payment/[id]` | Cashier (3) | ✅ Done | — | QR image · WS payment_success → print → /pos |

**Spec refs:** [Spec_4_Orders_API.md](../../spec/Spec_4_Orders_API.md) · [Spec_5_Payment_Webhooks.md](../../spec/Spec_5_Payment_Webhooks.md) · [API_CONTRACT §5, §10](../../contract/API_CONTRACT_v1.2.md)

---

## 4. Admin Dashboard (`/admin/*` — Manager+ = role ≥ 4)

| # | Page | Route | Status | Wireframe | Notes |
|---|---|---|---|---|---|
| 4.1 | Admin Root | `/admin` | ✅ Done | — | Index redirect to /admin/overview |
| 4.2 | Overview (Live Floor) | `/admin/overview` | ✅ Done | — | Stat cards · TableCards · WS live orders · PrepPanel · Kiểm tra toggle |
| 4.3 | Products CRUD | `/admin/products` | ✅ Done | — | GET /products/all (not /products) · image upload |
| 4.4 | Categories CRUD | `/admin/categories` | ✅ Done | — | Sort order field |
| 4.5 | Toppings CRUD | `/admin/toppings` | ✅ Done | — | price field (not price_delta) |
| 4.6 | Combos CRUD | `/admin/combos` | ✅ Done | — | Multi-item combo builder |
| 4.7 | Staff CRUD | `/admin/staff` | ✅ Done | — | Role assignment · password reset |
| 4.8 | Marketing | `/admin/marketing` | ✅ Done | — | QR code generation per table · print-ready |
| 4.9 | Summary / Reports | `/admin/summary` | ✅ Done | — | Revenue analytics · date range filter |
| 4.10 | Ingredients / Stock | `/admin/ingredients` | ✅ Done | — | Stock movement log |

**Spec refs:** [Spec_9_Admin_Dashboard_Pages.md](../../spec/Spec_9_Admin_Dashboard_Pages.md) · [Spec_2_Products_API_v2_CORRECTED.md](../../spec/Spec_2_Products_API_v2_CORRECTED.md) · [Spec_7_Staff_Management.md](../../spec/Spec_7_Staff_Management.md)

---

## 5. Static / Legal

| # | Page | Route | Status | Notes |
|---|---|---|---|---|
| 5.1 | Privacy Policy | `/privacy-policy` | ✅ Done | Static content |
| 5.2 | Terms of Service | `/terms` | ✅ Done | Static content |

---

## Progress Summary

| Group | Total | ✅ Done | 🚧 In Progress | ⬜ Not Started |
|---|---|---|---|---|
| 1. Customer Shop | 9 | 9 | 0 | 0 |
| 2. Auth | 1 | 1 | 0 | 0 |
| 3. Staff Dashboard | 4 | 4 | 0 | 0 |
| 4. Admin Dashboard | 10 | 10 | 0 | 0 |
| 5. Static / Legal | 2 | 2 | 0 | 0 |
| **Total** | **26** | **26** | **0** | **0** |

---

## Wireframe Files

| Page | Wireframe File | Status |
|---|---|---|
| Menu & Catalog | — | ⬜ Not drawn |
| Checkout | — | ⬜ Not drawn |
| Order Tracking | — | ⬜ Not drawn |
| Login | — | ⬜ Not drawn |
| KDS | — | ⬜ Not drawn |
| POS | — | ⬜ Not drawn |
| Admin Overview | — | ⬜ Not drawn |

> Add wireframe path here when drawn via `/excalidraw <page-name>`.
