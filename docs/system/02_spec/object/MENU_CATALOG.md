# Menu Catalog — All Products · Combos · Toppings · Categories

> **What this is:** the full inventory of *actual menu data instances* — every category,
> topping, product, and combo the system seeds. This is the **data**, not the schema.
> For the field shapes of each object, see the schema home files:
> [Product](OBJECT_MODEL_PRODUCT.md) · [Combo](OBJECT_MODEL_COMBO.md) · [Order](OBJECT_MODEL_ORDER.md)
> · index → [OBJECT_MODELS.md](OBJECT_MODELS.md).
>
> **Traced from source:** [`scripts/seed_real_menu.sql`](../../../../scripts/seed_real_menu.sql)
> (menu spec: `docs/base/MENU_SPEC.md`). Prices in VND (₫). When the seed changes, regenerate this file.
> **Code wins** — if a price here disagrees with the seed, fix this file.

---

## At a glance

| Type | Count | Notes |
|---|---|---|
| Categories | 3 | Bánh Cuốn · Canh · Suất / Combo |
| Toppings (nhân) | 3 | all free (₫0) — price baked into the dish |
| Products | 6 | 5 bánh + 1 canh |
| Combos (suất) | 5 | each = fixed set of products |

> ID prefix guide (from the seed): `aaaa…` categories · `bbbb…` toppings · `cccc…` products ·
> `dddd…` combos · `eeee…` combo_items. Short IDs below are the `…0000000N` suffix.

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
