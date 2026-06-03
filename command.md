# Dev Commands — Bánh Cuốn Restaurant

---

## Quick Build

```bash
docker compose up -d --build be
docker compose up -d --build fe
docker compose up -d --build be fe
```

---

## Local Dev (Hot Reload)

```bash
# Terminal 1 — Infra (run once)
docker compose up -d mysql redis

# Terminal 2 — BE (stop Docker BE first)
docker compose stop be
cd be && set -a && source .env.local && set +a && go run ./cmd/server

# Terminal 3 — FE
cd fe && NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
# or simply:
cd fe && npm run dev
```

---

## Seed Data

### Run order

> **Always run `seed.sql` first.** `seed_real_menu.sql` inserts demo orders that reference table IDs created by `seed.sql` — skipping step 1 causes a FK constraint error.

```bash
# Step 1 — full dev/demo dataset (staff + tables + placeholder menu + demo orders)
docker compose exec -T mysql mysql -uroot -prootpass banhcuon < scripts/seed.sql

# Step 2 — replace placeholder menu with the real one (run AFTER seed.sql)
docker compose exec -T mysql mysql -uroot -prootpass banhcuon < scripts/seed_real_menu.sql

# Staff accounts only — Go bcrypt version (use when MySQL is local, not Docker)
go run ./be/cmd/seed/main.go
```

### What each seed does

#### `go run ./be/cmd/seed/main.go`
Seeds 5 staff accounts only via Go + bcrypt. Password for all: `Admin@123`.

| Account | Role |
|---------|------|
| admin | admin |
| manager | manager |
| cashier | cashier |
| chef | chef |
| staff | staff |

#### `scripts/seed.sql`
```bash
docker compose exec -T mysql mysql -uroot -prootpass banhcuon < scripts/seed.sql
```
Seeds staff accounts and tables. Password for all: `Admin@123`.

| Account | Role |
|---------|------|
| admin | admin |
| manager1 | manager |
| chef1 | chef |
| cashier1 | cashier |

#### `scripts/seed_real_menu.sql`
```bash
docker compose exec -T mysql mysql -uroot -prootpass banhcuon < scripts/seed_real_menu.sql
```
Replaces the placeholder menu with the actual stall menu. Run after `seed.sql`. Deletes all 33333333/44444444/55555555 IDs first, then inserts:

| Table | What |
|-------|------|
| `categories` | 3: Bánh Cuốn, Canh, Suất / Combo |
| `toppings` | 3 nhân: Nhân thịt, Nhân mộc nhĩ, Rau mùi tàu — all free |
| `products` | 6: Giò, Bánh Trứng Tái/Chín/Vàng, Bánh Cuốn (4,000đ), Canh (free) |
| `combos` | 5 suất: Đầy Đủ Trứng Chín/Tái, Suất Giò, Trứng Bánh Không, Bánh Chay |
| `orders` | 3 fresh demo orders (Bàn 01 preparing, Bàn 02 pending, Bàn 03 delivered) |
| `order_items` | All items for those 3 orders with topping snapshots |

#### Delete all data
```bash
docker compose exec -T mysql mysql -uroot -prootpass banhcuon <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE order_items;
TRUNCATE orders;
TRUNCATE combo_items;
TRUNCATE combos;
TRUNCATE product_toppings;
TRUNCATE toppings;
TRUNCATE products;
TRUNCATE categories;
TRUNCATE tables;
TRUNCATE staff;
SET FOREIGN_KEY_CHECKS = 1;
SQL
```
Truncates all tables in FK-safe order. Re-run `seed.sql` → `seed_real_menu.sql` after to restore.

---

## Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Quản Trị Viên (admin) | `admin` | `Admin@123` |
| Quản Lý (manager) | `manager` | `Admin@123` |
| Thu Ngân (cashier) | `cashier` | `Admin@123` |
| Đầu Bếp (chef) | `chef` | `Admin@123` |
| Nhân Viên (staff) | `staff` | `Admin@123` |

---

## Table QR Links (Seeded)

### Set A
| Table | URL |
|-------|-----|
| Bàn 01 | http://localhost:3000/table/a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890 |
| Bàn 02 | http://localhost:3000/table/b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012 |
| Bàn 03 | http://localhost:3000/table/c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234 |
| Bàn 04 | http://localhost:3000/table/d4e5f67890123456d4e5f67890123456d4e5f67890123456d4e5f67890123456 |
| Bàn 05 | http://localhost:3000/table/e5f6789012345678e5f6789012345678e5f6789012345678e5f6789012345678 |
| Bàn VIP | http://localhost:3000/table/f67890123456789af67890123456789af67890123456789af67890123456789a |

### Set B
| Table | URL |
|-------|-----|
| Bàn 01 | http://localhost:3000/table/3aec3d0423c6af297bec727d3056c88757e6b05a69e6ca3dd064b388e2985371 |
| Bàn 02 | http://localhost:3000/table/f9b1f40610c9c6b3950d31e2ecab5a03361885ca660f39312345286181bf8dfc |
| Bàn 03 | http://localhost:3000/table/ecc6cf5edac88e587c68c8144bdc56baff220ab0b7b1a9f629e525e7218eb90a |
| Bàn 04 | http://localhost:3000/table/8e9de69364ace184d567d54f8e9bfcc0dae8e6787892c2be3d6b43ef08cace80 |
| Bàn 05 | http://localhost:3000/table/cbe1a45804c76147effeb31762b3be0d526cb91d6824c5cfc77daf5e8369b256 |

---

## Ports

| Service | Port |
|---------|------|
| FE | 3000 |
| BE | 8080 |
| MySQL | 3306 |
| Redis | 6379 |
| RedisInsight | 8001 |
