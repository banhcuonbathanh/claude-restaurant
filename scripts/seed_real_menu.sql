-- =============================================================================
-- scripts/seed_real_menu.sql — Menu thực tế của quán
-- Menu spec: docs/base/MENU_SPEC.md  ·  Doc: docs/system/03_be/SEED_DATA.md
--
-- Cách chạy (fresh DB — sau khi goose up đã chạy):
--   mysql -u root -p banhcuon < scripts/seed_real_menu.sql
--   (Docker):
--   docker compose exec mysql mysql -uroot -p$MYSQL_ROOT_PASSWORD banhcuon < /scripts/seed_real_menu.sql
--
-- File này REPLACE toàn bộ menu (categories, toppings, products, combos).
-- Staff và bàn giữ nguyên từ seed.sql — chạy seed.sql TRƯỚC file này.
-- Menu IDs (aaaa…/cccc…) GIỐNG seed.sql → chạy chung idempotent, an toàn re-run.
--
-- ID prefix guide:
--   aaaaaaaa-... → categories
--   bbbbbbbb-... → toppings (nhân)
--   cccccccc-... → products (bánh + giò + canh)
--   dddddddd-... → combos (suất)
--   eeeeeeee-... → combo_items
--   ffffffff-... → orders (demo)
--   00000000-... → order_items (demo)
-- =============================================================================

SET NAMES utf8mb4;

-- ── Xóa menu placeholder cũ (nếu DB từng chạy bản seed.sql cũ) ───────────────
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM order_items  WHERE order_id IN (
  '88888888-8888-8888-8888-000000000001','88888888-8888-8888-8888-000000000002',
  '88888888-8888-8888-8888-000000000003','88888888-8888-8888-8888-000000000004',
  '88888888-8888-8888-8888-000000000005');
DELETE FROM orders       WHERE id LIKE '88888888-%';
DELETE FROM combo_items  WHERE combo_id IN ('66666666-6666-6666-6666-000000000001','66666666-6666-6666-6666-000000000002');
DELETE FROM combos       WHERE id LIKE '66666666-%';
DELETE FROM product_toppings WHERE topping_id LIKE '55555555-%' OR product_id LIKE '44444444-%';
DELETE FROM toppings     WHERE id LIKE '55555555-%';
DELETE FROM products     WHERE id LIKE '44444444-%';
DELETE FROM categories   WHERE id LIKE '33333333-%';

SET FOREIGN_KEY_CHECKS = 1;

-- ── Categories (3) ──────────────────────────────────────────────────────────
INSERT INTO categories
  (id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất', 'Suất ăn trọn bộ tiện lợi', 1, 1, NOW(), NOW()),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
   'Trứng', 'Bánh trứng — tái · chín · vàng', 2, 1, NOW(), NOW()),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Cuốn', 'Bánh cuốn — khách chọn nhân', 3, 1, NOW(), NOW()),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
   'Giò', 'giò nhỏ 5 phút', 4, 1, NOW(), NOW()),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   'Canh', 'Canh kèm theo mỗi suất', 5, 1, NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), sort_order = VALUES(sort_order), updated_at = NOW();

-- ── Toppings = Nhân (2) — giá 0, tính trong giá bánh ────────────────────────
INSERT INTO toppings
  (id, name, price, is_available, created_at, updated_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', 'Nhân thịt',    0, 1, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000002', 'Nhân thịt mộc nhĩ', 0, 1, NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), updated_at = NOW();

-- ── Products (9) ────────────────────────────────────────────────────────────
INSERT INTO products
  (id, category_id, name, description, price, image_path, is_available, sort_order, created_at, updated_at)
VALUES
  -- Bánh Cuốn
  ('cccccccc-cccc-cccc-cccc-000000000001',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Cuốn Thịt', 'Bánh cuốn nhân thịt', 4000, NULL, 1, 1, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000002',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Cuốn Mộc Nhĩ', 'Bánh cuốn nhân mộc nhĩ', 4000, NULL, 1, 2, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000003',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   'Bánh Chay', 'Bánh cuốn chay — không thịt', 2500, NULL, 1, 3, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000004',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
   'Bánh Trứng Tái', 'Trứng lòng đào, chọn nhân', 9000, NULL, 1, 1, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000005',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
   'Bánh Trứng Chín', 'Trứng chín, chọn nhân', 9000, NULL, 1, 2, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000006',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
   'Bánh Trứng Vàng', 'Trứng chiên vàng, chọn nhân', 9000, NULL, 1, 3, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000007',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
   'Giò', 'Giò lụa cắt khoanh', 9000, NULL, 1, 1, NOW(), NOW()),

  -- Canh
  ('cccccccc-cccc-cccc-cccc-000000000008',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   'Canh có rau', 'Canh kèm rau mùi tàu', 0, NULL, 1, 1, NOW(), NOW()),

  ('cccccccc-cccc-cccc-cccc-000000000009',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   'Canh không rau', 'Canh không rau', 0, NULL, 1, 2, NOW(), NOW())

ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), description = VALUES(description),
  price = VALUES(price), sort_order = VALUES(sort_order), updated_at = NOW();

-- ── Product ↔ Topping links ─────────────────────────────────────────────────
-- Bánh cuốn (thịt, mộc nhĩ) + trứng (tái, chín, vàng) chọn nhân thịt / nhân mộc nhĩ.
-- Bánh Chay = bánh không (không nhân). Giò + Canh không có topping.
INSERT IGNORE INTO product_toppings (product_id, topping_id)
VALUES
  ('cccccccc-cccc-cccc-cccc-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),
  ('cccccccc-cccc-cccc-cccc-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),
  ('cccccccc-cccc-cccc-cccc-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),
  ('cccccccc-cccc-cccc-cccc-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),
  ('cccccccc-cccc-cccc-cccc-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  ('cccccccc-cccc-cccc-cccc-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002');

-- ── Combos / Suất (5) — giá = tổng thành phần (auto-sum) ─────────────────────
INSERT INTO combos
  (id, category_id, name, description, price, image_path, is_available, sort_order, created_at, updated_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-000000000001',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Đầy Đủ Trứng Tái',
   '1 Bánh Trứng Tái + 3 Bánh Cuốn + 1 Giò + Canh có rau',
   30000, NULL, 1, 1, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000002',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Đầy Đủ Trứng Chín',
   '1 Bánh Trứng Chín + 3 Bánh Cuốn + 1 Giò + Canh có rau',
   30000, NULL, 1, 2, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000003',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Giò',
   '1 Giò + 4 Bánh Cuốn + Canh có rau',
   25000, NULL, 1, 3, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000004',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Trứng Tái',
   '1 Bánh Trứng Tái + 4 Bánh Cuốn + Canh có rau',
   25000, NULL, 1, 4, NOW(), NOW()),

  ('dddddddd-dddd-dddd-dddd-000000000005',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   'Suất Trứng Chín',
   '1 Bánh Trứng Chín + 4 Bánh Cuốn + Canh có rau',
   25000, NULL, 1, 5, NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price), sort_order = VALUES(sort_order), updated_at = NOW();

-- ── Combo Items ─────────────────────────────────────────────────────────────
-- "bánh cuốn" trong suất = Bánh Cuốn Thịt (cccc…001)
INSERT INTO combo_items
  (id, combo_id, product_id, quantity, created_at, updated_at)
VALUES
  -- Suất Đầy Đủ Trứng Tái  (9k + 3×4k + 9k + 0 = 30k)
  ('eeeeeeee-eeee-eeee-eeee-000000000001', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000004', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000002', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000001', 3, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000003', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000007', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000004', 'dddddddd-dddd-dddd-dddd-000000000001', 'cccccccc-cccc-cccc-cccc-000000000008', 1, NOW(), NOW()),

  -- Suất Đầy Đủ Trứng Chín  (9k + 3×4k + 9k + 0 = 30k)
  ('eeeeeeee-eeee-eeee-eeee-000000000005', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000005', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000006', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000001', 3, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000007', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000007', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000008', 'dddddddd-dddd-dddd-dddd-000000000002', 'cccccccc-cccc-cccc-cccc-000000000008', 1, NOW(), NOW()),

  -- Suất Giò  (9k + 4×4k + 0 = 25k)
  ('eeeeeeee-eeee-eeee-eeee-000000000009', 'dddddddd-dddd-dddd-dddd-000000000003', 'cccccccc-cccc-cccc-cccc-000000000007', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000010', 'dddddddd-dddd-dddd-dddd-000000000003', 'cccccccc-cccc-cccc-cccc-000000000001', 4, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000011', 'dddddddd-dddd-dddd-dddd-000000000003', 'cccccccc-cccc-cccc-cccc-000000000008', 1, NOW(), NOW()),

  -- Suất Trứng Tái  (9k + 4×4k + 0 = 25k)
  ('eeeeeeee-eeee-eeee-eeee-000000000012', 'dddddddd-dddd-dddd-dddd-000000000004', 'cccccccc-cccc-cccc-cccc-000000000004', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000013', 'dddddddd-dddd-dddd-dddd-000000000004', 'cccccccc-cccc-cccc-cccc-000000000001', 4, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000014', 'dddddddd-dddd-dddd-dddd-000000000004', 'cccccccc-cccc-cccc-cccc-000000000008', 1, NOW(), NOW()),

  -- Suất Trứng Chín  (9k + 4×4k + 0 = 25k)
  ('eeeeeeee-eeee-eeee-eeee-000000000015', 'dddddddd-dddd-dddd-dddd-000000000005', 'cccccccc-cccc-cccc-cccc-000000000005', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000016', 'dddddddd-dddd-dddd-dddd-000000000005', 'cccccccc-cccc-cccc-cccc-000000000001', 4, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000017', 'dddddddd-dddd-dddd-dddd-000000000005', 'cccccccc-cccc-cccc-cccc-000000000008', 1, NOW(), NOW())

ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = NOW();

-- ── Demo Orders (3 bàn — test KDS + POS + Admin Overview) ───────────────────
-- Cần tables 22222222-* từ seed.sql. Dùng FK_CHECKS=0 để skip an toàn.
SET FOREIGN_KEY_CHECKS = 0;
--
-- ┌────────┬──────────────────────────────────────────────┬──────────┬───────────┐
-- │ Bàn   │ Gọi                                          │ Tổng     │ Status    │
-- ├────────┼──────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 01 │ 2× Bánh Trứng Chín (nhân thịt)              │ 22,000 ₫ │ preparing │
-- │        │ 1× Bánh Cuốn Thịt · 1× Canh có rau          │          │           │
-- ├────────┼──────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 02 │ 1× Suất Đầy Đủ Trứng Tái (combo)            │ 30,000 ₫ │ pending   │
-- ├────────┼──────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 03 │ 1× Suất Giò · 1× Bánh Trứng Vàng (thịt)    │ 34,000 ₫ │ delivered │
-- └────────┴──────────────────────────────────────────────┴──────────┴───────────┘

UPDATE tables
SET    status = 'occupied', updated_at = NOW()
WHERE  id IN (
  '22222222-2222-2222-2222-000000000001',
  '22222222-2222-2222-2222-000000000002',
  '22222222-2222-2222-2222-000000000003');

INSERT INTO orders
  (id, order_number, table_id, status, source, note, total_amount, created_by, created_at, updated_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-000000000001', 'ORD-20260623-001',
   '22222222-2222-2222-2222-000000000001',
   'preparing', 'qr', NULL, 22000, NULL, NOW(), NOW()),

  ('ffffffff-ffff-ffff-ffff-000000000002', 'ORD-20260623-002',
   '22222222-2222-2222-2222-000000000002',
   'pending', 'qr', 'Không cay', 30000, NULL, NOW(), NOW()),

  ('ffffffff-ffff-ffff-ffff-000000000003', 'ORD-20260623-003',
   '22222222-2222-2222-2222-000000000003',
   'delivered', 'pos', NULL, 34000,
   '11111111-1111-1111-1111-000000000004',
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

INSERT INTO order_items
  (id, order_id, product_id, combo_id, combo_ref_id,
   name, unit_price, quantity, qty_served, toppings_snapshot, note, created_at, updated_at)
VALUES

  -- ── Order 1 · Bàn 01 · preparing ─────────────────────────────────────────
  ('00000000-0000-0000-0000-000000000001',
   'ffffffff-ffff-ffff-ffff-000000000001',
   'cccccccc-cccc-cccc-cccc-000000000005', NULL, NULL,
   'Bánh Trứng Chín', 9000, 2, 1,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000002',
   'ffffffff-ffff-ffff-ffff-000000000001',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL, NULL,
   'Bánh Cuốn Thịt', 4000, 1, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000003',
   'ffffffff-ffff-ffff-ffff-000000000001',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL, NULL,
   'Canh có rau', 0, 1, 1, NULL, NULL, NOW(), NOW()),

  -- ── Order 2 · Bàn 02 · pending — Suất Đầy Đủ Trứng Tái (combo) ──────────
  ('00000000-0000-0000-0000-000000000004',
   'ffffffff-ffff-ffff-ffff-000000000002',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000001', NULL,
   'Suất Đầy Đủ Trứng Tái', 30000, 1, 0, NULL, NULL, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000005',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000004', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Bánh Trứng Tái', 0, 1, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000006',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Bánh Cuốn Thịt', 0, 3, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000007',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000007', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Giò', 0, 1, 0, NULL, NULL, NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000008',
   'ffffffff-ffff-ffff-ffff-000000000002',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL,
   '00000000-0000-0000-0000-000000000004',
   'Canh có rau', 0, 1, 0, NULL, NULL, NOW(), NOW()),

  -- ── Order 3 · Bàn 03 · delivered (POS, served 20 min ago) ───────────────
  ('00000000-0000-0000-0000-000000000009',
   'ffffffff-ffff-ffff-ffff-000000000003',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000003', NULL,
   'Suất Giò', 25000, 1, 1, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  ('00000000-0000-0000-0000-000000000010',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000007', NULL,
   '00000000-0000-0000-0000-000000000009',
   'Giò', 0, 1, 1, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  ('00000000-0000-0000-0000-000000000011',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000009',
   'Bánh Cuốn Thịt', 0, 4, 4, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  ('00000000-0000-0000-0000-000000000012',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL,
   '00000000-0000-0000-0000-000000000009',
   'Canh có rau', 0, 1, 1, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),

  ('00000000-0000-0000-0000-000000000013',
   'ffffffff-ffff-ffff-ffff-000000000003',
   'cccccccc-cccc-cccc-cccc-000000000006', NULL, NULL,
   'Bánh Trứng Vàng', 9000, 1, 1,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Thêm cases: gia đình (mẹ + 2 người lớn + 2 trẻ) & đôi khách lớn tuổi ────
--
-- ┌────────┬─────────────────────────────────────────────────────┬──────────┬───────────┐
-- │ Bàn   │ Gọi                                                 │ Tổng     │ Status    │
-- ├────────┼─────────────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 04 │ Gia đình: 1 Suất Đầy Đủ Chín (mẹ) ·                │ 103,000 ₫│ preparing │
-- │        │ 2 Suất Giò (2 người lớn) · 2 Bánh Chay (2 trẻ)     │          │           │
-- │        │ [gọi thêm] 2 Bánh Trứng Vàng · [thêm] 2 Canh có rau │          │           │
-- ├────────┼─────────────────────────────────────────────────────┼──────────┼───────────┤
-- │ Bàn 05 │ Đôi lớn tuổi: 1 Suất Trứng Tái (bà) ·              │  50,000 ₫│ pending   │
-- │        │ 1 Suất Trứng Chín (ông)                             │          │           │
-- └────────┴─────────────────────────────────────────────────────┴──────────┴───────────┘

UPDATE tables
SET    status = 'occupied', updated_at = NOW()
WHERE  id IN (
  '22222222-2222-2222-2222-000000000004',
  '22222222-2222-2222-2222-000000000005');

INSERT INTO orders
  (id, order_number, table_id, status, source, note, total_amount, created_by, created_at, updated_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-000000000004', 'ORD-20260623-004',
   '22222222-2222-2222-2222-000000000004',
   'preparing', 'qr', 'Gia đình — 2 trẻ em ăn nhạt', 103000, NULL, NOW(), NOW()),

  ('ffffffff-ffff-ffff-ffff-000000000005', 'ORD-20260623-005',
   '22222222-2222-2222-2222-000000000005',
   'pending', 'qr', 'Khách lớn tuổi — ăn nhạt, ít dầu mỡ', 50000, NULL, NOW(), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

INSERT INTO order_items
  (id, order_id, product_id, combo_id, combo_ref_id,
   name, unit_price, quantity, qty_served, toppings_snapshot, note, created_at, updated_at)
VALUES

  -- ── Order 4 · Bàn 04 · preparing — Gia đình ──────────────────────────────
  -- Mẹ: Suất Đầy Đủ Trứng Chín (combo)
  ('00000000-0000-0000-0000-000000000014',
   'ffffffff-ffff-ffff-ffff-000000000004',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000002', NULL,
   'Suất Đầy Đủ Trứng Chín', 30000, 1, 0, NULL, NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000005', NULL,
   '00000000-0000-0000-0000-000000000014',
   'Bánh Trứng Chín', 0, 1, 1,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000016',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000014',
   'Bánh Cuốn Thịt', 0, 3, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000017',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000007', NULL,
   '00000000-0000-0000-0000-000000000014',
   'Giò', 0, 1, 0, NULL, NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000018',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL,
   '00000000-0000-0000-0000-000000000014',
   'Canh có rau', 0, 1, 1, NULL, NULL, NOW(), NOW()),

  -- 2 người lớn: Suất Giò ×2 (combo)
  ('00000000-0000-0000-0000-000000000019',
   'ffffffff-ffff-ffff-ffff-000000000004',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000003', NULL,
   'Suất Giò', 25000, 2, 0, NULL, NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000020',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000007', NULL,
   '00000000-0000-0000-0000-000000000019',
   'Giò', 0, 2, 0, NULL, NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000021',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000019',
   'Bánh Cuốn Thịt', 0, 8, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000022',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL,
   '00000000-0000-0000-0000-000000000019',
   'Canh có rau', 0, 2, 0, NULL, NULL, NOW(), NOW()),

  -- 2 trẻ em: 2 Bánh Chay (bánh không — no nhân)
  ('00000000-0000-0000-0000-000000000023',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000003', NULL, NULL,
   'Bánh Chay', 2500, 2, 0, NULL, NULL, NOW(), NOW()),

  -- [Gọi thêm sau] 2 Bánh Trứng Vàng (nhân thịt)
  ('00000000-0000-0000-0000-000000000024',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000006', NULL, NULL,
   'Bánh Trứng Vàng', 9000, 2, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   'Gọi thêm', NOW(), NOW()),

  -- [Gọi thêm canh] 2 Canh có rau
  ('00000000-0000-0000-0000-000000000025',
   'ffffffff-ffff-ffff-ffff-000000000004',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL, NULL,
   'Canh có rau', 0, 2, 0, NULL, 'Gọi thêm', NOW(), NOW()),

  -- ── Order 5 · Bàn 05 · pending — Đôi khách lớn tuổi ──────────────────────
  -- Bà: Suất Trứng Tái (combo)
  ('00000000-0000-0000-0000-000000000026',
   'ffffffff-ffff-ffff-ffff-000000000005',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000004', NULL,
   'Suất Trứng Tái', 25000, 1, 0, NULL, NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000027',
   'ffffffff-ffff-ffff-ffff-000000000005',
   'cccccccc-cccc-cccc-cccc-000000000004', NULL,
   '00000000-0000-0000-0000-000000000026',
   'Bánh Trứng Tái', 0, 1, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000028',
   'ffffffff-ffff-ffff-ffff-000000000005',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000026',
   'Bánh Cuốn Thịt', 0, 4, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000029',
   'ffffffff-ffff-ffff-ffff-000000000005',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL,
   '00000000-0000-0000-0000-000000000026',
   'Canh có rau', 0, 1, 0, NULL, NULL, NOW(), NOW()),

  -- Ông: Suất Trứng Chín (combo)
  ('00000000-0000-0000-0000-000000000030',
   'ffffffff-ffff-ffff-ffff-000000000005',
   NULL, 'dddddddd-dddd-dddd-dddd-000000000005', NULL,
   'Suất Trứng Chín', 25000, 1, 0, NULL, NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000031',
   'ffffffff-ffff-ffff-ffff-000000000005',
   'cccccccc-cccc-cccc-cccc-000000000005', NULL,
   '00000000-0000-0000-0000-000000000030',
   'Bánh Trứng Chín', 0, 1, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000032',
   'ffffffff-ffff-ffff-ffff-000000000005',
   'cccccccc-cccc-cccc-cccc-000000000001', NULL,
   '00000000-0000-0000-0000-000000000030',
   'Bánh Cuốn Thịt', 0, 4, 0,
   '[{"id":"bbbbbbbb-bbbb-bbbb-bbbb-000000000001","name":"Nhân thịt","price":0}]',
   NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000033',
   'ffffffff-ffff-ffff-ffff-000000000005',
   'cccccccc-cccc-cccc-cccc-000000000008', NULL,
   '00000000-0000-0000-0000-000000000030',
   'Canh có rau', 0, 1, 0, NULL, NULL, NOW(), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

SET FOREIGN_KEY_CHECKS = 1;
