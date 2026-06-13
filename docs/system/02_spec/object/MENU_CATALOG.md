# Seed Data Catalog — Products · Combos · Toppings · Categories · Staff · Tables

> **What this is:** the full inventory of *actual data instances* the system seeds — every category,
> topping, product, combo, staff account, and table. This is the **data**, not the schema.
> For the field shapes of each object, see the schema home files:
> [Product](OBJECT_MODEL_PRODUCT.md) · [Combo](OBJECT_MODEL_COMBO.md) · [Topping](OBJECT_MODEL_TOPPING.md)
> · [Category](OBJECT_MODEL_CATEGORY.md) · [Staff](OBJECT_MODEL_STAFF.md) · [Table](OBJECT_MODEL_TABLE.md)
> · [Order](OBJECT_MODEL_ORDER.md) · index → [OBJECT_MODELS.md](OBJECT_MODELS.md).
>
> **Traced from source:** menu (categories/toppings/products/combos) from
> [`scripts/seed_real_menu.sql`](../../../../scripts/seed_real_menu.sql) (menu spec: `docs/base/MENU_SPEC.md`);
> staff + tables from [`scripts/seed.sql`](../../../../scripts/seed.sql) (these are *not* replaced by
> the real-menu seed). Prices in VND (₫). When a seed changes, regenerate this file.
> **Code wins** — if anything here disagrees with the seed, fix this file.

---

## At a glance

| Type | Count | Notes |
|---|---|---|
| Categories | 3 | Bánh Cuốn · Canh · Suất / Combo |
| Toppings (nhân) | 3 | all free (₫0) — price baked into the dish |
| Products | 6 | 5 bánh + 1 canh |
| Combos (suất) | 5 | each = fixed set of products |
| Staff accounts | 4 | admin · manager · chef · cashier |
| Tables | 6 | Bàn 01–05 + Bàn VIP |

> ID prefix guide: menu seed → `aaaa…` categories · `bbbb…` toppings · `cccc…` products ·
> `dddd…` combos · `eeee…` combo_items. Base seed → `1111…` staff · `2222…` tables.
> Short IDs below are the `…0000000N` suffix.

---

## 1. Categories

| # | Name | Description | Sort | Active |
|---|---|---|---|---|
| 01 | **Bánh Cuốn** | Giò · bánh trứng · bánh cuốn — khách chọn nhân | 1 | ✅ |
| 02 | **Canh** | Canh kèm theo mỗi suất | 2 | ✅ |
| 03 | **Suất / Combo** | Suất ăn trọn bộ tiện lợi | 3 | ✅ |

---

## 2. Toppings (Nhân)

All toppings are free — `price = 0`. Cost is already included in the dish price.

| # | Name | Price | Available | Used by |
|---|---|---|---|---|
| 01 | **Nhân thịt** | ₫0 | ✅ | all 5 bánh |
| 02 | **Nhân mộc nhĩ** | ₫0 | ✅ | all 5 bánh |
| 03 | **Rau mùi tàu** | ₫0 | ✅ | Canh only |

---

## 3. Products

| # | Name | Category | Price | Selectable toppings |
|---|---|---|---|---|
| 01 | **Giò** | Bánh Cuốn | ₫9,000 | Nhân thịt · Nhân mộc nhĩ |
| 02 | **Bánh Trứng Tái** | Bánh Cuốn | ₫9,000 | Nhân thịt · Nhân mộc nhĩ |
| 03 | **Bánh Trứng Chín** | Bánh Cuốn | ₫9,000 | Nhân thịt · Nhân mộc nhĩ |
| 04 | **Bánh Trứng Vàng** | Bánh Cuốn | ₫9,000 | Nhân thịt · Nhân mộc nhĩ |
| 05 | **Bánh Cuốn** | Bánh Cuốn | ₫4,000 | Nhân thịt · Nhân mộc nhĩ |
| 06 | **Canh** | Canh | ₫0 | Rau mùi tàu |

**Descriptions**
- **Giò** — Giò lụa cắt khoanh, chọn nhân thịt hoặc nhân mộc nhĩ
- **Bánh Trứng Tái** — Trứng lòng đào (half-cooked), chọn nhân
- **Bánh Trứng Chín** — Trứng chín hoàn toàn, chọn nhân
- **Bánh Trứng Vàng** — Trứng chiên vàng, chọn nhân
- **Bánh Cuốn** — Bánh cuốn thuần, chọn nhân thịt hoặc nhân mộc nhĩ
- **Canh** — Canh kèm theo, có thể thêm rau mùi tàu

---

## 4. Combos (Suất)

Each combo is a fixed set of products at a set price (category: **Suất / Combo**).

| # | Name | Price | Contents |
|---|---|---|---|
| 01 | **Suất Đầy Đủ Trứng Chín** | ₫30,000 | 1× Bánh Trứng Chín · 1× Giò · 3× Bánh Cuốn · 1× Canh |
| 02 | **Suất Đầy Đủ Trứng Tái** | ₫30,000 | 1× Bánh Trứng Tái · 1× Giò · 3× Bánh Cuốn · 1× Canh |
| 03 | **Suất Giò** | ₫21,000 | 1× Giò · 3× Bánh Cuốn · 1× Canh |
| 04 | **Suất Trứng Bánh Không** | ₫21,000 | 1× Bánh Trứng Vàng · 3× Bánh Cuốn (không nhân) · 1× Canh |
| 05 | **Bánh Chay** | ₫12,000 | 3× Bánh Cuốn (nhân mộc nhĩ) · 1× Canh — không thịt |

> Combo price is the **listed combo price**, not the sum of item prices. Per the OC epic, the
> combo header carries the price and child `order_items` are stored at `unit_price = 0` to avoid
> double-counting — see [Combo schema](OBJECT_MODEL_COMBO.md) and [Order schema](OBJECT_MODEL_ORDER.md).

---

## 5. Staff accounts

Seeded in [`scripts/seed.sql`](../../../../scripts/seed.sql) (bcrypt cost 12). Schema → [Staff](OBJECT_MODEL_STAFF.md).
`job_title` / `shifts` / `responsibilities` are NULL for all seeded accounts.

| # | Username | Password | Full name | Role | Phone | Email | Active |
|---|---|---|---|---|---|---|---|
| 01 | **admin** | `admin123` | Nguyễn Admin | admin | 0901000001 | admin@banhcuon.vn | ✅ |
| 02 | **manager1** | `manager123` | Trần Quản Lý | manager | 0901000002 | manager@banhcuon.vn | ✅ |
| 03 | **chef1** | `chef1234` | Lê Đầu Bếp | chef | 0901000003 | — | ✅ |
| 04 | **cashier1** | `cashier123` | Phạm Thu Ngân | cashier | 0901000004 | — | ✅ |

> 🔒 Dev credentials only. `password_hash` is never serialized; `performance_score` is a hardcoded `0`
> placeholder (not stored) — see [Staff §3](OBJECT_MODEL_STAFF.md).

---

## 6. Tables

Seeded in [`scripts/seed.sql`](../../../../scripts/seed.sql). Each has a 64-char hex `qr_token` (the QR
payload that starts a guest order). Schema → [Table](OBJECT_MODEL_TABLE.md).

| # | Name | Capacity | Status (seed) | Active |
|---|---|---|---|---|
| 01 | **Bàn 01** | 4 | available | ✅ |
| 02 | **Bàn 02** | 4 | available | ✅ |
| 03 | **Bàn 03** | 6 | available | ✅ |
| 04 | **Bàn 04** | 2 | available | ✅ |
| 05 | **Bàn 05** | 4 | available | ✅ |
| 06 | **Bàn VIP** | 8 | available | ✅ |

> The demo orders in `seed_real_menu.sql` flip **Bàn 01–03** to `occupied`. `status` is otherwise
> driven by the order lifecycle, not set by hand — see [Table §3](OBJECT_MODEL_TABLE.md).
