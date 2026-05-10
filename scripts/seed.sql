-- =============================================================================
-- scripts/seed.sql — Development seed data
-- Run AFTER goose migrations are applied:
--   mysql -u root -p banhcuon < scripts/seed.sql
--   OR inside Docker:
--   docker compose exec mysql mysql -uroot -p$MYSQL_ROOT_PASSWORD banhcuon < /scripts/seed.sql
--
-- Staff credentials (bcrypt cost=12):
--   admin     / admin123
--   manager1  / manager123
--   chef1     / chef123
--   cashier1  / cashier123
--
-- Idempotent: safe to re-run (ON DUPLICATE KEY UPDATE is a no-op on match).
-- =============================================================================

-- ── Staff ─────────────────────────────────────────────────────────────────────
INSERT INTO staff
  (id, username, password_hash, full_name, role, phone, email, is_active, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-000000000001',
   'admin',    '$2a$12$ST/Bsgxj68CD33Ezfm9Bm.Xu4FTCntPq4LyPFvKojvM7il2G22jjy',
   'Nguyễn Admin',  'admin',   '0901000001', 'admin@banhcuon.vn',   1, NOW(), NOW()),

  ('11111111-1111-1111-1111-000000000002',
   'manager1', '$2a$12$qs4WgWI6LeQnSJRj1jQqrugcUK9zlm1qehod75Hc/PYK9lUjF4eLe',
   'Trần Quản Lý',  'manager', '0901000002', 'manager@banhcuon.vn', 1, NOW(), NOW()),

  ('11111111-1111-1111-1111-000000000003',
   'chef1',    '$2a$12$er5IPH7W0Uc2tj9psYbTeeKlrOr9u/npQa364lRUzZx5Cal0YkQv2',
   'Lê Đầu Bếp',    'chef',    '0901000003', NULL,                  1, NOW(), NOW()),

  ('11111111-1111-1111-1111-000000000004',
   'cashier1', '$2a$12$rNRWznQxfSjJjN3opRrkoeBcwey03e8iJ4fUnZoV2wVbbieHcZQkS',
   'Phạm Thu Ngân',  'cashier', '0901000004', NULL,                  1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Tables (qr_token = 64-char random hex) ────────────────────────────────────
INSERT INTO tables
  (id, name, qr_token, capacity, status, is_active, created_at, updated_at)
VALUES
  ('22222222-2222-2222-2222-000000000001', 'Bàn 01',
   'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
   4, 'available', 1, NOW(), NOW()),

  ('22222222-2222-2222-2222-000000000002', 'Bàn 02',
   'b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012',
   4, 'available', 1, NOW(), NOW()),

  ('22222222-2222-2222-2222-000000000003', 'Bàn 03',
   'c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234',
   6, 'available', 1, NOW(), NOW()),

  ('22222222-2222-2222-2222-000000000004', 'Bàn 04',
   'd4e5f67890123456d4e5f67890123456d4e5f67890123456d4e5f67890123456',
   2, 'available', 1, NOW(), NOW()),

  ('22222222-2222-2222-2222-000000000005', 'Bàn 05',
   'e5f6789012345678e5f6789012345678e5f6789012345678e5f6789012345678',
   4, 'available', 1, NOW(), NOW()),

  ('22222222-2222-2222-2222-000000000006', 'Bàn VIP',
   'f67890123456789af67890123456789af67890123456789af67890123456789a',
   8, 'available', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Categories ────────────────────────────────────────────────────────────────
INSERT INTO categories
  (id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-000000000001', 'Bánh Cuốn',  'Các loại bánh cuốn đặc trưng', 1, 1, NOW(), NOW()),
  ('33333333-3333-3333-3333-000000000002', 'Món Phụ',    'Nem, chả, gỏi cuốn và các món ăn kèm', 2, 1, NOW(), NOW()),
  ('33333333-3333-3333-3333-000000000003', 'Đồ Uống',    'Nước uống các loại', 3, 1, NOW(), NOW()),
  ('33333333-3333-3333-3333-000000000004', 'Combo',      'Suất ăn trọn gói tiết kiệm',  4, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Toppings ─────────────────────────────────────────────────────────────────
INSERT INTO toppings
  (id, name, price, is_available, created_at, updated_at)
VALUES
  ('55555555-5555-5555-5555-000000000001', 'Hành phi',       5000,  1, NOW(), NOW()),
  ('55555555-5555-5555-5555-000000000002', 'Ruốc tôm',      10000,  1, NOW(), NOW()),
  ('55555555-5555-5555-5555-000000000003', 'Trứng chiên',   15000,  1, NOW(), NOW()),
  ('55555555-5555-5555-5555-000000000004', 'Thêm thịt',     20000,  1, NOW(), NOW()),
  ('55555555-5555-5555-5555-000000000005', 'Thêm tôm',      25000,  1, NOW(), NOW()),
  ('55555555-5555-5555-5555-000000000006', 'Chả lụa thêm',  15000,  1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Products ─────────────────────────────────────────────────────────────────
INSERT INTO products
  (id, category_id, name, description, price, image_path, is_available, sort_order, created_at, updated_at)
VALUES
  -- Bánh Cuốn
  ('44444444-4444-4444-4444-000000000001',
   '33333333-3333-3333-3333-000000000001',
   'Bánh Cuốn Thịt', 'Bánh cuốn nhân thịt heo xay, hành phi', 45000, NULL, 1, 1, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000002',
   '33333333-3333-3333-3333-000000000001',
   'Bánh Cuốn Tôm', 'Bánh cuốn nhân tôm tươi, nấm mèo', 50000, NULL, 1, 2, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000003',
   '33333333-3333-3333-3333-000000000001',
   'Bánh Cuốn Thập Cẩm', 'Nhân thịt + tôm + nấm mèo', 55000, NULL, 1, 3, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000004',
   '33333333-3333-3333-3333-000000000001',
   'Bánh Cuốn Trứng', 'Bánh cuốn nhân trứng gà', 40000, NULL, 1, 4, NOW(), NOW()),

  -- Món Phụ
  ('44444444-4444-4444-4444-000000000005',
   '33333333-3333-3333-3333-000000000002',
   'Nem Rán', 'Nem rán giòn, nhân thịt + miến', 35000, NULL, 1, 1, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000006',
   '33333333-3333-3333-3333-000000000002',
   'Chả Giò', 'Chả giò chiên vàng giòn', 35000, NULL, 1, 2, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000007',
   '33333333-3333-3333-3333-000000000002',
   'Chả Lụa', 'Chả lụa Huế truyền thống (1 khoanh)', 25000, NULL, 1, 3, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000008',
   '33333333-3333-3333-3333-000000000002',
   'Gỏi Cuốn', 'Gỏi cuốn tôm thịt, bún, rau sống', 40000, NULL, 1, 4, NOW(), NOW()),

  -- Đồ Uống
  ('44444444-4444-4444-4444-000000000009',
   '33333333-3333-3333-3333-000000000003',
   'Trà Đá', 'Trà đá miễn phí (1 bình)', 10000, NULL, 1, 1, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000010',
   '33333333-3333-3333-3333-000000000003',
   'Nước Chanh', 'Nước chanh tươi pha mật ong', 20000, NULL, 1, 2, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000011',
   '33333333-3333-3333-3333-000000000003',
   'Nước Cam', 'Nước cam vắt tươi nguyên chất', 25000, NULL, 1, 3, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000012',
   '33333333-3333-3333-3333-000000000003',
   'Cà Phê Sữa', 'Cà phê phin + sữa đặc', 30000, NULL, 1, 4, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Product ↔ Topping links ───────────────────────────────────────────────────
-- Bánh Cuốn Thịt: hành phi, ruốc tôm, thêm thịt
INSERT IGNORE INTO product_toppings (product_id, topping_id) VALUES
  ('44444444-4444-4444-4444-000000000001', '55555555-5555-5555-5555-000000000001'),
  ('44444444-4444-4444-4444-000000000001', '55555555-5555-5555-5555-000000000002'),
  ('44444444-4444-4444-4444-000000000001', '55555555-5555-5555-5555-000000000004');

-- Bánh Cuốn Tôm: hành phi, ruốc tôm, thêm tôm
INSERT IGNORE INTO product_toppings (product_id, topping_id) VALUES
  ('44444444-4444-4444-4444-000000000002', '55555555-5555-5555-5555-000000000001'),
  ('44444444-4444-4444-4444-000000000002', '55555555-5555-5555-5555-000000000002'),
  ('44444444-4444-4444-4444-000000000002', '55555555-5555-5555-5555-000000000005');

-- Bánh Cuốn Thập Cẩm: all toppings
INSERT IGNORE INTO product_toppings (product_id, topping_id) VALUES
  ('44444444-4444-4444-4444-000000000003', '55555555-5555-5555-5555-000000000001'),
  ('44444444-4444-4444-4444-000000000003', '55555555-5555-5555-5555-000000000002'),
  ('44444444-4444-4444-4444-000000000003', '55555555-5555-5555-5555-000000000003'),
  ('44444444-4444-4444-4444-000000000003', '55555555-5555-5555-5555-000000000004'),
  ('44444444-4444-4444-4444-000000000003', '55555555-5555-5555-5555-000000000005');

-- Bánh Cuốn Trứng: hành phi, trứng chiên
INSERT IGNORE INTO product_toppings (product_id, topping_id) VALUES
  ('44444444-4444-4444-4444-000000000004', '55555555-5555-5555-5555-000000000001'),
  ('44444444-4444-4444-4444-000000000004', '55555555-5555-5555-5555-000000000003');

-- Gỏi Cuốn: thêm tôm, thêm thịt
INSERT IGNORE INTO product_toppings (product_id, topping_id) VALUES
  ('44444444-4444-4444-4444-000000000008', '55555555-5555-5555-5555-000000000004'),
  ('44444444-4444-4444-4444-000000000008', '55555555-5555-5555-5555-000000000005');

-- ── Combos ───────────────────────────────────────────────────────────────────
INSERT INTO combos
  (id, category_id, name, description, price, image_path, is_available, sort_order, created_at, updated_at)
VALUES
  ('66666666-6666-6666-6666-000000000001',
   '33333333-3333-3333-3333-000000000004',
   'Combo Gia Đình',
   'Bánh Cuốn Thịt ×2 + Nem Rán ×2 + Trà Đá ×2 — tiết kiệm 20k',
   160000, NULL, 1, 1, NOW(), NOW()),

  ('66666666-6666-6666-6666-000000000002',
   '33333333-3333-3333-3333-000000000004',
   'Combo Đơn',
   'Bánh Cuốn Tôm ×1 + Nước Chanh ×1 — suất ăn nhanh',
   60000, NULL, 1, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Combo items ───────────────────────────────────────────────────────────────
INSERT INTO combo_items
  (id, combo_id, product_id, quantity, created_at, updated_at)
VALUES
  -- Combo Gia Đình
  ('77777777-7777-7777-7777-000000000001',
   '66666666-6666-6666-6666-000000000001',
   '44444444-4444-4444-4444-000000000001', 2, NOW(), NOW()),  -- Bánh Cuốn Thịt ×2

  ('77777777-7777-7777-7777-000000000002',
   '66666666-6666-6666-6666-000000000001',
   '44444444-4444-4444-4444-000000000005', 2, NOW(), NOW()),  -- Nem Rán ×2

  ('77777777-7777-7777-7777-000000000003',
   '66666666-6666-6666-6666-000000000001',
   '44444444-4444-4444-4444-000000000009', 2, NOW(), NOW()),  -- Trà Đá ×2

  -- Combo Đơn
  ('77777777-7777-7777-7777-000000000004',
   '66666666-6666-6666-6666-000000000002',
   '44444444-4444-4444-4444-000000000002', 1, NOW(), NOW()),  -- Bánh Cuốn Tôm ×1

  ('77777777-7777-7777-7777-000000000005',
   '66666666-6666-6666-6666-000000000002',
   '44444444-4444-4444-4444-000000000010', 1, NOW(), NOW())   -- Nước Chanh ×1
ON DUPLICATE KEY UPDATE updated_at = updated_at;
