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
--   chef1     / chef1234
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
   'chef1',    '$2b$12$PF0unHx9h/mVo4bfEdGS8.7rAijTY5xx9BnOKjxQ//GDbkYhWbypS',
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

-- ── Seed Orders (5 table scenarios — shared across all pages) ─────────────────
-- Used by: Menu · KDS · POS · Admin Overview · Payment
--
-- ┌─────────┬──────────────────────────────────────────┬───────────┬─────────────────────┐
-- │ Table   │ Items                                    │ Total     │ Status              │
-- ├─────────┼──────────────────────────────────────────┼───────────┼─────────────────────┤
-- │ Bàn 01  │ 1× Combo Gia Đình                        │ 220,000 ₫ │ preparing           │
-- │         │ 1× Bánh Cuốn Tôm + Ruốc tôm             │           │ (some items in KDS) │
-- ├─────────┼──────────────────────────────────────────┼───────────┼─────────────────────┤
-- │ Bàn 02  │ 2× Bánh Cuốn Thịt + Thêm thịt           │ 185,000 ₫ │ pending             │
-- │         │ 1× Chả Giò  ·  2× Trà Đá                │           │ (just submitted)    │
-- ├─────────┼──────────────────────────────────────────┼───────────┼─────────────────────┤
-- │ Bàn 03  │ 1× Combo Đơn                             │ 170,000 ₫ │ ready               │
-- │         │ 1× Bánh Cuốn Thập Cẩm + Hành/Trứng      │           │ (all done, deliver) │
-- │         │ 1× Nem Rán                               │           │                     │
-- ├─────────┼──────────────────────────────────────────┼───────────┼─────────────────────┤
-- │ Bàn 04  │ 3× Bánh Cuốn Trứng + Hành phi           │ 270,000 ₫ │ delivered           │
-- │ (POS)   │ 1× Gỏi Cuốn + Thêm thịt + Thêm tôm     │           │ (awaiting payment)  │
-- │         │ 2× Nước Cam                              │           │                     │
-- ├─────────┼──────────────────────────────────────────┼───────────┼─────────────────────┤
-- │ Bàn 05  │ 2× Combo Gia Đình                        │ 435,000 ₫ │ confirmed · VIP     │
-- │ (VIP)   │ 1× Chả Lụa  ·  3× Cà Phê Sữa           │           │ (not yet preparing) │
-- └─────────┴──────────────────────────────────────────┴───────────┴─────────────────────┘

UPDATE tables
SET    status = 'occupied', updated_at = NOW()
WHERE  id IN (
  '22222222-2222-2222-2222-000000000001',
  '22222222-2222-2222-2222-000000000002',
  '22222222-2222-2222-2222-000000000003',
  '22222222-2222-2222-2222-000000000004',
  '22222222-2222-2222-2222-000000000005'
);

INSERT INTO orders
  (id, order_number, table_id, status, source, note, total_amount, created_by, created_at, updated_at)
VALUES
  ('88888888-8888-8888-8888-000000000001', 'ORD-20260518-001',
   '22222222-2222-2222-2222-000000000001',
   'preparing', 'qr', 'Trẻ em ăn nhạt', 220000, NULL, NOW(), NOW()),

  ('88888888-8888-8888-8888-000000000002', 'ORD-20260518-002',
   '22222222-2222-2222-2222-000000000002',
   'pending', 'qr', NULL, 185000, NULL, NOW(), NOW()),

  ('88888888-8888-8888-8888-000000000003', 'ORD-20260518-003',
   '22222222-2222-2222-2222-000000000003',
   'ready', 'qr', 'Không cay · ít muối', 170000, NULL, NOW(), NOW()),

  ('88888888-8888-8888-8888-000000000004', 'ORD-20260518-004',
   '22222222-2222-2222-2222-000000000004',
   'delivered', 'pos', 'Cay nhiều', 270000,
   '11111111-1111-1111-1111-000000000004',
   DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW()),

  ('88888888-8888-8888-8888-000000000005', 'ORD-20260518-005',
   '22222222-2222-2222-2222-000000000005',
   'confirmed', 'qr', 'VIP khách · ưu tiên', 435000, NULL, NOW(), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

INSERT INTO order_items
  (id, order_id, product_id, combo_id, combo_ref_id,
   name, unit_price, quantity, qty_served, toppings_snapshot, note, created_at, updated_at)
VALUES

  -- ── Order 1 · Bàn 01 · preparing (mixed qty_served — partial kitchen progress) ──

  -- Combo Gia Đình × 1  header
  ('99999999-9999-9999-9999-000000000001',
   '88888888-8888-8888-8888-000000000001',
   NULL, '66666666-6666-6666-6666-000000000001', NULL,
   'Combo Gia Đình', 160000, 1, 0, NULL, NULL, NOW(), NOW()),

  -- ↳ Bánh Cuốn Thịt × 2  (not yet served)
  ('99999999-9999-9999-9999-000000000002',
   '88888888-8888-8888-8888-000000000001',
   '44444444-4444-4444-4444-000000000001', NULL,
   '99999999-9999-9999-9999-000000000001',
   'Bánh Cuốn Thịt', 0, 2, 0, NULL, NULL, NOW(), NOW()),

  -- ↳ Nem Rán × 2  (1 served, 1 pending)
  ('99999999-9999-9999-9999-000000000003',
   '88888888-8888-8888-8888-000000000001',
   '44444444-4444-4444-4444-000000000005', NULL,
   '99999999-9999-9999-9999-000000000001',
   'Nem Rán', 0, 2, 1, NULL, NULL, NOW(), NOW()),

  -- ↳ Trà Đá × 2  (both served — drinks done first)
  ('99999999-9999-9999-9999-000000000004',
   '88888888-8888-8888-8888-000000000001',
   '44444444-4444-4444-4444-000000000009', NULL,
   '99999999-9999-9999-9999-000000000001',
   'Trà Đá', 0, 2, 2, NULL, NULL, NOW(), NOW()),

  -- Bánh Cuốn Tôm × 1  standalone  + Ruốc tôm topping
  ('99999999-9999-9999-9999-000000000005',
   '88888888-8888-8888-8888-000000000001',
   '44444444-4444-4444-4444-000000000002', NULL, NULL,
   'Bánh Cuốn Tôm', 50000, 1, 0,
   '[{"id":"55555555-5555-5555-5555-000000000002","name":"Ruốc tôm","price":10000}]',
   NULL, NOW(), NOW()),

  -- ── Order 2 · Bàn 02 · pending (nothing started) ─────────────────────────

  -- Bánh Cuốn Thịt × 2  standalone  + Thêm thịt topping
  ('99999999-9999-9999-9999-000000000006',
   '88888888-8888-8888-8888-000000000002',
   '44444444-4444-4444-4444-000000000001', NULL, NULL,
   'Bánh Cuốn Thịt', 45000, 2, 0,
   '[{"id":"55555555-5555-5555-5555-000000000004","name":"Thêm thịt","price":20000}]',
   NULL, NOW(), NOW()),

  -- Chả Giò × 1  standalone
  ('99999999-9999-9999-9999-000000000007',
   '88888888-8888-8888-8888-000000000002',
   '44444444-4444-4444-4444-000000000006', NULL, NULL,
   'Chả Giò', 35000, 1, 0, NULL, NULL, NOW(), NOW()),

  -- Trà Đá × 2  standalone
  ('99999999-9999-9999-9999-000000000008',
   '88888888-8888-8888-8888-000000000002',
   '44444444-4444-4444-4444-000000000009', NULL, NULL,
   'Trà Đá', 10000, 2, 0, NULL, NULL, NOW(), NOW()),

  -- ── Order 3 · Bàn 03 · ready (all qty_served = quantity) ─────────────────

  -- Combo Đơn × 1  header  (fully served)
  ('99999999-9999-9999-9999-000000000009',
   '88888888-8888-8888-8888-000000000003',
   NULL, '66666666-6666-6666-6666-000000000002', NULL,
   'Combo Đơn', 60000, 1, 1, NULL, NULL, NOW(), NOW()),

  -- ↳ Bánh Cuốn Tôm × 1
  ('99999999-9999-9999-9999-000000000010',
   '88888888-8888-8888-8888-000000000003',
   '44444444-4444-4444-4444-000000000002', NULL,
   '99999999-9999-9999-9999-000000000009',
   'Bánh Cuốn Tôm', 0, 1, 1, NULL, NULL, NOW(), NOW()),

  -- ↳ Nước Chanh × 1
  ('99999999-9999-9999-9999-000000000011',
   '88888888-8888-8888-8888-000000000003',
   '44444444-4444-4444-4444-000000000010', NULL,
   '99999999-9999-9999-9999-000000000009',
   'Nước Chanh', 0, 1, 1, NULL, NULL, NOW(), NOW()),

  -- Bánh Cuốn Thập Cẩm × 1  standalone  + Hành phi + Trứng chiên
  ('99999999-9999-9999-9999-000000000012',
   '88888888-8888-8888-8888-000000000003',
   '44444444-4444-4444-4444-000000000003', NULL, NULL,
   'Bánh Cuốn Thập Cẩm', 55000, 1, 1,
   '[{"id":"55555555-5555-5555-5555-000000000001","name":"Hành phi","price":5000},{"id":"55555555-5555-5555-5555-000000000003","name":"Trứng chiên","price":15000}]',
   NULL, NOW(), NOW()),

  -- Nem Rán × 1  standalone
  ('99999999-9999-9999-9999-000000000013',
   '88888888-8888-8888-8888-000000000003',
   '44444444-4444-4444-4444-000000000005', NULL, NULL,
   'Nem Rán', 35000, 1, 1, NULL, NULL, NOW(), NOW()),

  -- ── Order 4 · Bàn 04 · delivered · cashier-created (POS) ─────────────────

  -- Bánh Cuốn Trứng × 3  standalone  + Hành phi
  ('99999999-9999-9999-9999-000000000014',
   '88888888-8888-8888-8888-000000000004',
   '44444444-4444-4444-4444-000000000004', NULL, NULL,
   'Bánh Cuốn Trứng', 40000, 3, 3,
   '[{"id":"55555555-5555-5555-5555-000000000001","name":"Hành phi","price":5000}]',
   NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW()),

  -- Gỏi Cuốn × 1  standalone  + Thêm thịt + Thêm tôm
  ('99999999-9999-9999-9999-000000000015',
   '88888888-8888-8888-8888-000000000004',
   '44444444-4444-4444-4444-000000000008', NULL, NULL,
   'Gỏi Cuốn', 40000, 1, 1,
   '[{"id":"55555555-5555-5555-5555-000000000004","name":"Thêm thịt","price":20000},{"id":"55555555-5555-5555-5555-000000000005","name":"Thêm tôm","price":25000}]',
   NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW()),

  -- Nước Cam × 2  standalone
  ('99999999-9999-9999-9999-000000000016',
   '88888888-8888-8888-8888-000000000004',
   '44444444-4444-4444-4444-000000000011', NULL, NULL,
   'Nước Cam', 25000, 2, 2, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW()),

  -- ── Order 5 · Bàn 05 · confirmed · VIP (nothing sent to kitchen yet) ──────

  -- Combo Gia Đình × 2  header
  ('99999999-9999-9999-9999-000000000017',
   '88888888-8888-8888-8888-000000000005',
   NULL, '66666666-6666-6666-6666-000000000001', NULL,
   'Combo Gia Đình', 160000, 2, 0, NULL, NULL, NOW(), NOW()),

  -- ↳ Bánh Cuốn Thịt × 4  (2 combos × 2 each)
  ('99999999-9999-9999-9999-000000000018',
   '88888888-8888-8888-8888-000000000005',
   '44444444-4444-4444-4444-000000000001', NULL,
   '99999999-9999-9999-9999-000000000017',
   'Bánh Cuốn Thịt', 0, 4, 0, NULL, NULL, NOW(), NOW()),

  -- ↳ Nem Rán × 4
  ('99999999-9999-9999-9999-000000000019',
   '88888888-8888-8888-8888-000000000005',
   '44444444-4444-4444-4444-000000000005', NULL,
   '99999999-9999-9999-9999-000000000017',
   'Nem Rán', 0, 4, 0, NULL, NULL, NOW(), NOW()),

  -- ↳ Trà Đá × 4
  ('99999999-9999-9999-9999-000000000020',
   '88888888-8888-8888-8888-000000000005',
   '44444444-4444-4444-4444-000000000009', NULL,
   '99999999-9999-9999-9999-000000000017',
   'Trà Đá', 0, 4, 0, NULL, NULL, NOW(), NOW()),

  -- Chả Lụa × 1  standalone
  ('99999999-9999-9999-9999-000000000021',
   '88888888-8888-8888-8888-000000000005',
   '44444444-4444-4444-4444-000000000007', NULL, NULL,
   'Chả Lụa', 25000, 1, 0, NULL, NULL, NOW(), NOW()),

  -- Cà Phê Sữa × 3  standalone
  ('99999999-9999-9999-9999-000000000022',
   '88888888-8888-8888-8888-000000000005',
   '44444444-4444-4444-4444-000000000012', NULL, NULL,
   'Cà Phê Sữa', 30000, 3, 0, NULL, NULL, NOW(), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── New category: Súp & Canh ──────────────────────────────────────────────────
INSERT INTO categories
  (id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-000000000005', 'Súp & Canh', 'Các loại súp và canh', 5, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── New products ─────────────────────────────────────────────────────────────
INSERT INTO products
  (id, category_id, name, description, price, image_path, is_available, sort_order, created_at, updated_at)
VALUES
  -- Súp & Canh
  ('44444444-4444-4444-4444-000000000013',
   '33333333-3333-3333-3333-000000000005',
   'Nước Dùng', 'Nước dùng xương heo hầm (1 bình)', 15000, NULL, 1, 1, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000014',
   '33333333-3333-3333-3333-000000000005',
   'Canh Rau', 'Canh rau củ thanh đạm', 20000, NULL, 1, 2, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000015',
   '33333333-3333-3333-3333-000000000005',
   'Súp Gà', 'Súp gà ngô non, cà rốt', 30000, NULL, 1, 3, NOW(), NOW()),

  -- Đồ Uống (thêm)
  ('44444444-4444-4444-4444-000000000016',
   '33333333-3333-3333-3333-000000000003',
   'Sinh Tố Xoài', 'Sinh tố xoài tươi xay sữa', 35000, NULL, 1, 5, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000017',
   '33333333-3333-3333-3333-000000000003',
   'Nước Dừa', 'Nước dừa xiêm tươi nguyên trái', 20000, NULL, 1, 6, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000018',
   '33333333-3333-3333-3333-000000000003',
   'Bia Saigon', 'Bia Saigon Special (330ml)', 25000, NULL, 1, 7, NOW(), NOW()),

  -- Topping đơn lẻ (Món Phụ) — cũng tồn tại trong bảng toppings để dùng làm snapshot
  ('44444444-4444-4444-4444-000000000019',
   '33333333-3333-3333-3333-000000000002',
   'Trứng Chiên', 'Trứng chiên vàng ăn kèm (1 quả)', 15000, NULL, 1, 5, NOW(), NOW()),

  ('44444444-4444-4444-4444-000000000020',
   '33333333-3333-3333-3333-000000000002',
   'Ruốc Tôm', 'Ruốc tôm khô rắc thêm (1 phần)', 10000, NULL, 1, 6, NOW(), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;

-- ── Update order totals ───────────────────────────────────────────────────────
UPDATE orders SET total_amount = 250000, updated_at = NOW()
  WHERE id = '88888888-8888-8888-8888-000000000001';  -- Bàn 01 +Nước Dùng ×2

UPDATE orders SET total_amount = 235000, updated_at = NOW()
  WHERE id = '88888888-8888-8888-8888-000000000002';  -- Bàn 02 +Sinh Tố ×1 +Trứng Chiên ×1

UPDATE orders SET total_amount = 190000, updated_at = NOW()
  WHERE id = '88888888-8888-8888-8888-000000000003';  -- Bàn 03 +Canh Rau ×1

UPDATE orders SET total_amount = 320000, updated_at = NOW()
  WHERE id = '88888888-8888-8888-8888-000000000004';  -- Bàn 04 +Bia Saigon ×2

UPDATE orders SET total_amount = 535000, updated_at = NOW()
  WHERE id = '88888888-8888-8888-8888-000000000005';  -- Bàn 05 +Súp Gà ×2 +Nước Dừa ×2

-- ── New order_items ───────────────────────────────────────────────────────────
INSERT INTO order_items
  (id, order_id, product_id, combo_id, combo_ref_id,
   name, unit_price, quantity, qty_served, toppings_snapshot, note, created_at, updated_at)
VALUES
  -- Order 1 · Bàn 01 · preparing
  ('99999999-9999-9999-9999-000000000023',
   '88888888-8888-8888-8888-000000000001',
   '44444444-4444-4444-4444-000000000013', NULL, NULL,
   'Nước Dùng', 15000, 2, 0, NULL, NULL, NOW(), NOW()),

  -- Order 2 · Bàn 02 · pending
  ('99999999-9999-9999-9999-000000000024',
   '88888888-8888-8888-8888-000000000002',
   '44444444-4444-4444-4444-000000000016', NULL, NULL,
   'Sinh Tố Xoài', 35000, 1, 0, NULL, NULL, NOW(), NOW()),

  ('99999999-9999-9999-9999-000000000025',
   '88888888-8888-8888-8888-000000000002',
   '44444444-4444-4444-4444-000000000019', NULL, NULL,
   'Trứng Chiên', 15000, 1, 0, NULL, NULL, NOW(), NOW()),

  -- Order 3 · Bàn 03 · ready (served)
  ('99999999-9999-9999-9999-000000000026',
   '88888888-8888-8888-8888-000000000003',
   '44444444-4444-4444-4444-000000000014', NULL, NULL,
   'Canh Rau', 20000, 1, 1, NULL, NULL, NOW(), NOW()),

  -- Order 4 · Bàn 04 · delivered (served, 30 min ago)
  ('99999999-9999-9999-9999-000000000027',
   '88888888-8888-8888-8888-000000000004',
   '44444444-4444-4444-4444-000000000018', NULL, NULL,
   'Bia Saigon', 25000, 2, 2, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW()),

  -- Order 5 · Bàn 05 · confirmed VIP
  ('99999999-9999-9999-9999-000000000028',
   '88888888-8888-8888-8888-000000000005',
   '44444444-4444-4444-4444-000000000015', NULL, NULL,
   'Súp Gà', 30000, 2, 0, NULL, NULL, NOW(), NOW()),

  ('99999999-9999-9999-9999-000000000029',
   '88888888-8888-8888-8888-000000000005',
   '44444444-4444-4444-4444-000000000017', NULL, NULL,
   'Nước Dừa', 20000, 2, 0, NULL, NULL, NOW(), NOW())

ON DUPLICATE KEY UPDATE updated_at = updated_at;
