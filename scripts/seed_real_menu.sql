-- =============================================================================
-- scripts/seed_real_menu.sql — Menu thực tế của quán
-- Menu spec: docs/base/MENU_SPEC.md
--
-- Cách chạy (fresh DB — sau khi goose up đã chạy):
--   mysql -u root -p banhcuon < scripts/seed_real_menu.sql
--   (Docker):
--   docker compose exec mysql mysql -uroot -p$MYSQL_ROOT_PASSWORD banhcuon < /scripts/seed_real_menu.sql
--
-- File này REPLACE toàn bộ menu (categories, toppings, products, combos).
-- Staff và bàn giữ nguyên từ seed.sql — chạy seed.sql TRƯỚC file này.
-- Idempotent: safe to re-run.
--
-- ID prefix guide:
--   aaaaaaaa-... → categories
--   bbbbbbbb-... → toppings (nhân)
--   cccccccc-... → products (bánh + canh)
--   dddddddd-... → combos (suất)
--   eeeeeeee-... → combo_items
--   ffffffff-... → orders (demo)
--   00000000-... → order_items (demo)
-- =============================================================================

SET NAMES utf8mb4;

-- ── Xóa menu cũ (placeholder) theo FK reverse order ─────────────────────────
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM combo_items  WHERE combo_id  IN ('66666666-6666-6666-6666-000000000001','66666666-6666-6666-6666-000000000002');
DELETE FROM combos       WHERE id        IN ('66666666-6666-6666-6666-000000000001','66666666-6666-6666-6666-000000000002');
DELETE FROM product_toppings WHERE topping_id IN (
  '55555555-5555-5555-5555-000000000001','55555555-5555-5555-5555-000000000002',
  '55555555-5555-5555-5555-000000000003','55555555-5555-5555-5555-000000000004',
  '55555555-5555-5555-5555-000000000005','55555555-5555-5555-5555-000000000006'
);
DELETE FROM toppings WHERE id LIKE '55555555-%';
DELETE FROM products WHERE id LIKE '44444444-%';
DELETE FROM categories WHERE id LIKE '33333333-%';

SET FOREIGN_KEY_CHECKS = 1;

-- ── Categories ────────────────────────────────────────────────────────────────
INSERT INTO categories
  (id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Cuốn', 'Giò · bánh trứng · bánh cuốn — khách chọn nhân', 1, 1, NOW(), NOW()),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   'Canh', 'Canh kèm theo mỗi suất', 2, 1, NOW(), NOW()),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất / Combo', 'Suất ăn trọn bộ tiện lợi', 3, 1, NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();

-- ── Toppings (Nhân) ───────────────────────────────────────────────────────────
-- Nhân được chọn khi gọi từng bánh. Giá = 0 (tính trong giá bánh).
-- Rau mùi tàu là topping cho canh, cũng miễn phí.
INSERT INTO toppings
  (id, name, price, is_available, created_at, updated_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', 'Nhân thịt',    0, 1, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000002', 'Nhân mộc nhĩ', 0, 1, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000003', 'Rau mùi tàu',  0, 1, NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();

-- ── Products ─────────────────────────────────────────────────────────────────
INSERT INTO products
  (id, category_id, name, description, price, image_path, is_available, sort_order, created_at, updated_at)
VALUES
  -- Bánh Cuốn
  ('cccccccc-cccc-cccc-cccc-000000000001',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Giò', 'Giò lụa cắt khoanh, chọn nhân thịt hoặc nhân mộc nhĩ',
   9000, NULL, 1, 1, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000002',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Trứng Tái', 'Trứng lòng đào (half-cooked), chọn nhân',
   9000, NULL, 1, 2, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000003',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Trứng Chín', 'Trứng chín hoàn toàn, chọn nhân',
   9000, NULL, 1, 3, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000004',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Trứng Vàng', 'Trứng chiên vàng, chọn nhân',
   9000, NULL, 1, 4, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000005',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Cuốn', 'Bánh cuốn thuần, chọn nhân thịt hoặc nhân mộc nhĩ',
   4000, NULL, 1, 5, NOW(), NOW()),

  -- Canh
  ('cccccccc-cccc-cccc-cccc-000000000006',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   'Canh', 'Canh kèm theo, có thể thêm rau mùi tàu',
   0, NULL, 1, 1, NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), updated_at = NOW();

-- ── Product ↔ Topping links ───────────────────────────────────────────────────
-- Tất cả bánh (giò, trứng tái/chín/vàng, bánh cuốn) có thể chọn nhân thịt hoặc nhân mộc nhĩ.
-- Canh có thể thêm rau mùi tàu.

INSERT IGNORE INTO product_toppings (product_id, topping_id)
VALUES
  -- Giò → nhân thịt / nhân mộc nhĩ
  ('cccccccc-cccc-cccc-cccc-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),

  -- Bánh Trứng Tái → nhân thịt / nhân mộc nhĩ
  ('cccccccc-cccc-cccc-cccc-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),

  -- Bánh Trứng Chín → nhân thịt / nhân mộc nhĩ
  ('cccccccc-cccc-cccc-cccc-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),

  -- Bánh Trứng Vàng → nhân thịt / nhân mộc nhĩ
  ('cccccccc-cccc-cccc-cccc-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),

  -- Bánh Cuốn → nhân thịt / nhân mộc nhĩ
  ('cccccccc-cccc-cccc-cccc-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),

  -- Canh → rau mùi tàu
  ('cccccccc-cccc-cccc-cccc-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000003');

-- ── Combos (Suất) ─────────────────────────────────────────────────────────────
-- Giá = tổng thành phần. Điều chỉnh nếu quán muốn chiết khấu combo.
INSERT INTO combos
  (id, category_id, name, description, price, image_path, is_available, sort_order, created_at, updated_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-000000000001',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Đầy Đủ Trứng Chín',
   '1 Bánh Trứng Chín + 1 Giò + 3 Bánh Cuốn + Canh',
   30000, NULL, 1, 1, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000002',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Đầy Đủ Trứng Tái',
   '1 Bánh Trứng Tái + 1 Giò + 3 Bánh Cuốn + Canh',
   30000, NULL, 1, 2, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000003',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Giò',
   '1 Giò + 3 Bánh Cuốn + Canh',
   21000, NULL, 1, 3, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000004',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Trứng Bánh Không',
   '1 Bánh Trứng Vàng + 3 Bánh Cuốn (không nhân) + Canh',
   21000, NULL, 1, 4, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000005',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Bánh Chay',
   '3 Bánh Cuốn nhân mộc nhĩ + Canh — không thịt',
   12000, NULL, 1, 5, NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), updated_at = NOW();

-- ── Combo Items ───────────────────────────────────────────────────────────────
INSERT INTO combo_items
  (id, combo_id, product_id, quantity, created_at, updated_at)
VALUES
  -- Suất Đầy Đủ Trứng Chín
  ('eeeeeeee-eeee-eeee-eeee-000000000001', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000003', 1, NOW(), NOW()),  -- Bánh Trứng Chín ×1
  ('eeeeeeee-eeee-eeee-eeee-000000000002', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000001', 1, NOW(), NOW()),  -- Giò ×1
  ('eeeeeeee-eeee-eeee-eeee-000000000003', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000005', 3, NOW(), NOW()),  -- Bánh Cuốn ×3
  ('eeeeeeee-eeee-eeee-eeee-000000000004', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000006', 1, NOW(), NOW()),  -- Canh ×1

  -- Suất Đầy Đủ Trứng Tái
  ('eeeeeeee-eeee-eeee-eeee-000000000005', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000002', 1, NOW(), NOW()),  -- Bánh Trứng Tái ×1
  ('eeeeeeee-eeee-eeee-eeee-000000000006', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000001', 1, NOW(), NOW()),  -- Giò ×1
  ('eeeeeeee-eeee-eeee-eeee-000000000007', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000005', 3, NOW(), NOW()),  -- Bánh Cuốn ×3
  ('eeeeeeee-eeee-eeee-eeee-000000000008', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000006', 1, NOW(), NOW()),  -- Canh ×1

  -- Suất Giò
  ('eeeeeeee-eeee-eeee-eeee-000000000009', 'dddddddd-dddd-dddd-dddd-000000000003', 'cccccccc-cccc-cccc-cccc-000000000001', 1, NOW(), NOW()),  -- Giò ×1
  ('eeeeeeee-eeee-eeee-eeee-000000000010', 'dddddddd-dddd-dddd-dddd-000000000003', 'cccccccc-cccc-cccc-cccc-000000000005', 3, NOW(), NOW()),  -- Bánh Cuốn ×3
  ('eeeeeeee-eeee-eeee-eeee-000000000011', 'dddddddd-dddd-dddd-dddd-000000000003', 'cccccccc-cccc-cccc-cccc-000000000006', 1, NOW(), NOW()),  -- Canh ×1

  -- Suất Trứng Bánh Không
  ('eeeeeeee-eeee-eeee-eeee-000000000012', 'dddddddd-dddd-dddd-dddd-000000000004', 'cccccccc-cccc-cccc-cccc-000000000004', 1, NOW(), NOW()),  -- Bánh Trứng Vàng ×1
  ('eeeeeeee-eeee-eeee-eeee-000000000013', 'dddddddd-dddd-dddd-dddd-000000000004', 'cccccccc-cccc-cccc-cccc-000000000005', 3, NOW(), NOW()),  -- Bánh Cuốn ×3
  ('eeeeeeee-eeee-eeee-eeee-000000000014', 'dddddddd-dddd-dddd-dddd-000000000004', 'cccccccc-cccc-cccc-cccc-000000000006', 1, NOW(), NOW()),  -- Canh ×1

  -- Bánh Chay
  ('eeeeeeee-eeee-eeee-eeee-000000000015', 'dddddddd-dddd-dddd-dddd-000000000005', 'cccccccc-cccc-cccc-cccc-000000000005', 3, NOW(), NOW()),  -- Bánh Cuốn ×3
  ('eeeeeeee-eeee-eeee-eeee-000000000016', 'dddddddd-dddd-dddd-dddd-000000000005', 'cccccccc-cccc-cccc-cccc-000000000006', 1, NOW(), NOW())   -- Canh ×1

ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = NOW();

-- ── Demo Orders (3 bàn — để test KDS + POS + Admin Overview) ─────────────────
-- Chỉ chạy được nếu seed.sql đã tạo tables 22222222-*. Dùng FK_CHECKS=0 để skip an toàn.
SET FOREIGN_KEY_CHECKS = 0;
--
-- ┌────────┬────────────────────────────────────────────┬──────────┬───────────┐
-- │ Bàn   │ Gọi                                        │ Tổng     │ Status    │
-- ├────────┼────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 01 │ 2× Bánh Trứng Chín (nhân thịt)            │ 30,000 ₫ │ preparing │
-- │        │ 1× Bánh Cuốn (nhân mộc nhĩ) · 1× Canh    │          │           │
-- ├────────┼────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 02 │ 1× Suất Đầy Đủ Trứng Tái (combo)          │ 30,000 ₫ │ pending   │
-- │        │   ↳ 1 trứng tái + 1 giò + 3 bánh + canh  │          │           │
-- ├────────┼────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 03 │ 1× Suất Giò · 1× Bánh Trứng Vàng (thịt) │ 30,000 ₫ │ delivered │
-- └────────┴────────────────────────────────────────────┴──────────┴───────────┘

UPDATE tables
SET    status = 'occupied', updated_at = NOW()
WHERE  id IN (
  '22222222-2222-2222-2222-000000000001',
  '22222222-2222-2222-2222-000000000002',
  '22222222-2222-2222-2222-000000000003'
);

INSERT INTO orders
  (id, order_number, table_id, status, source, note, total_amount, created_by, created_at, updated_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-000000000001', 'ORD-20260603-001',
   '22222222-2222-2222-2222-000000000001',
   'preparing', 'qr', NULL, 30000, NULL, NOW(), NOW()),

  ('ffffffff-ffff-ffff-ffff-000000000002', 'ORD-20260603-002',
   '22222222-2222-2222-2222-000000000002',
   'pending', 'qr', 'Không cay', 30000, NULL, NOW(), NOW()),

  ('ffffffff-ffff-ffff-ffff-000000000003', 'ORD-20260603-003',
   '22222222-2222-2222-2222-000000000003',
   'delivered', 'pos', NULL, 30000,
   '11111111-1111-1111-1111-000000000004',
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

INSERT INTO order_items
  (id, order_id, product_id, combo_id, combo_ref_id,
   name, unit_price, quantity, qty_served, toppings_snapshot, note, created_at, updated_at)
VALUES

  -- ── Order 1 · Bàn 01 · preparing ─────────────────────────────────────────
  -- 2× Bánh Trứng Chín, nhân thịt (1 served, 1 pending)
  ('00000000-0000-0000-0000-000000000001',
   'ffffffff-ffff-ffff-ffff-000000000001',
   'cccccccc-cccc-cccc-cccc-000000000003', NULL, NULL,
   'Bánh Trứng Chín', 9000, 2, 1,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),

  -- 1× Bánh Cuốn, nhân mộc nhĩ
  ('00000000-0000-0000-0000-000000000002',
   'ffffffff-ffff-ffff-ffff-000000000001',
   'cccccccc-cccc-cccc-cccc-000000000005', NULL, NULL,
   'Bánh Cuốn', 4000, 1, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000002","name":"Nhân mộc nhĩ","price":0}]',
   NULL, NOW(), NOW()),

  -- 1× Canh (rau mùi tàu)
  ('00000000-0000-0000-0000-000000000003',
   'ffffffff-ffff-ffff-ffff-000000000001',
   'cccccccc-cccc-cccc-cccc-000000000006', NULL, NULL,
   'Canh', 0, 1, 1,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000003","name":"Rau mùi tàu","price":0}]',
   NULL, NOW(), NOW()),

  -- ── Order 2 · Bàn 02 · pending — Suất Đầy Đủ Trứng Tái (combo) ──────────
  -- Combo header
  ('00000000-0000-0000-0000-000000000004',
   'ffffffff-ffff-ffff-ffff-000000000002',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000002', NULL,
   'Suất Đầy Đủ Trứng Tái', 30000, 1, 0, NULL, NULL, NOW(), NOW()),

  -- ↳ Bánh Trứng Tái ×1 (nhân thịt)
  ('00000000-0000-0000-0000-000000000005',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000002', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Bánh Trứng Tái', 0, 1, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),

  -- ↳ Giò ×1 (nhân mộc nhĩ)
  ('00000000-0000-0000-0000-000000000006',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Giò', 0, 1, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000002","name":"Nhân mộc nhĩ","price":0}]',
   NULL, NOW(), NOW()),

  -- ↳ Bánh Cuốn ×3 (nhân thịt)
  ('00000000-0000-0000-0000-000000000007',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000005', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Bánh Cuốn', 0, 3, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),

  -- ↳ Canh ×1
  ('00000000-0000-0000-0000-000000000008',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000006', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Canh', 0, 1, 0, NULL, NULL, NOW(), NOW()),

  -- ── Order 3 · Bàn 03 · delivered (POS, all served 20 min ago) ────────────
  -- Suất Giò header
  ('00000000-0000-0000-0000-000000000009',
   'ffffffff-ffff-ffff-ffff-000000000003',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000003', NULL,
   'Suất Giò', 21000, 1, 1, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  -- ↳ Giò ×1
  ('00000000-0000-0000-0000-000000000010',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000009',
   'Giò', 0, 1, 1, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  -- ↳ Bánh Cuốn ×3
  ('00000000-0000-0000-0000-000000000011',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000005', NULL,
   '00000000-0000-0000-0000-000000000009',
   'Bánh Cuốn', 0, 3, 3, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  -- ↳ Canh ×1
  ('00000000-0000-0000-0000-000000000012',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000006', NULL,
   '00000000-0000-0000-0000-000000000009',
   'Canh', 0, 1, 1, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  -- Thêm lẻ: 1× Bánh Trứng Vàng (nhân thịt)
  ('00000000-0000-0000-0000-000000000013',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000004', NULL, NULL,
   'Bánh Trứng Vàng', 9000, 1, 1,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

SET FOREIGN_KEY_CHECKS = 1;
