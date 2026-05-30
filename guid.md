http://localhost:3000/
http://localhost:8080/
docker compose build --no-cache
docker compose up -d --build be
docker compose up -d --build fe
docker compose down
docker compose up
docker compose build --no-cache

 docker compose build --no-cache fe 2>&1 | tail -8 && docker compose up -d fe 2>&1 | tail -4
 fe 2>&1 | tail -15



cd "/Users/monghoaivu/Desktop/code/claude restaurant" && docker compose build --no-cache fe 2>&1 | tail -8 && docker compose up -d fe 2>&1 | tail -4



§4 — Document architecture — expanded from 3 layers to 5:

Layer 1: Navigation (CLAUDE.md + README.md)
Layer 2: Onboarding (the 4 new cards — day 1 per role)
Layer 3: System guides (BE/FE/DevOps — the new guides)
Layer 4: Shared facts (MASTER, contracts, schema — was Layer 2)
Layer 5: Domain specs (was Layer 3)


Where to Find Everything
Current State of Coding
CLAUDE.md → "Current Work" section — what's done, what's next (3–5 bullets, high-level)

docs/TASKS.md → Phase Status Overview table — % complete per phase, always the source of truth

Master Task List
docs/TASKS.md — every task in the project, organized by phase:

Phase	Status	Next unblocked task
P0 Docs/Architecture	✅ done	—
P1 DB Migrations	🔄 87%	P1-8: run migration 008
P2 Feature Specs	✅ done	—
P3 sqlc Setup	✅ done	—
P4 Backend	🔄 ~15%	4.1-6 auth_handler.go (MUST BE NEXT)
P5 Frontend	⬜	blocked on P4.1
P6 DevOps	🔄 40%	6-1 .env.example (can run now)
P7 Testing/Go-Live	⬜	blocked on P4+P5
How to Do Each Task (Docs Needed Per Task)
docs/IMPLEMENTATION_WORKFLOW.md — the 7-step process every task must follow:


READ → PLAN → ALIGN → IMPLEMENT → SELF-REVIEW → TEST → DONE
For each task, Step 1 READ specifies exactly what to read:

What the task touches	Doc to read first
Any task	The task row in TASKS.md + relevant Spec (Spec1–7)
DB field names	docs/be/DB_SCHEMA_SUMMARY.md
Error codes	docs/contract/ERROR_CONTRACT_v1.1.md
Endpoint signatures	docs/contract/API_CONTRACT_v1.2.md
Auth/JWT	docs/core/MASTER_v1.2.md §3 + §6
Orders/Payments/Cancel rules	docs/core/MASTER_v1.2.md §4
SSE/WebSocket	docs/core/MASTER_v1.2.md §5
UI colors/fonts	docs/core/MASTER_v1.2.md §2
Backend coding patterns	docs/be/BE_SYSTEM_GUIDE.md
Frontend coding patterns	docs/fe/FE_SYSTEM_GUIDE.md
The Next Task Right Now
Task 4.1-6 — be/internal/handler/auth_handler.go

Docs to read before starting:

docs/spec/Spec1_Auth_Updated_v2.md — all 5 endpoints + AC
docs/contract/ERROR_CONTRACT_v1.1.md — error format
docs/contract/API_CONTRACT_v1.2.md — endpoint signatures
docs/be/BE_SYSTEM_GUIDE.md §10 Epic BE-2 — code patterns



# 1. Make sure you're on a stable base (usually main)
git checkout main

# 2. Update main (optional but recommended)
git pull origin main

# 3. Create and switch to the new 'test' branch
git checkout -b test

# 4. Merge the first feature branch
git merge feature/p5-1-auth-flow

# 5. Merge the second feature branch
git merge feature/p5-2-menu-cart

docker compose up -d --build fe

ocker compose up -d --build fe 2>&1 | tail -20
cd fe && npm run dev
That runs on port 3000 as well (you'd need to stop the Docker fe container first with docker compose stop fe).


http://localhost:3000/menu


http://localhost:3000


http://localhost:3000/admin

Field	Value
Username	admin
Password	Admin@123
Role	admin


Swagger UI: http://localhost:8090/swagger/

Open the URL
Expand POST /api/v1/auth/login → Try it out → body: {"username":"admin","password":"<your-password>"} → Execute
Copy access_token from response
Click Authorize (top right padlock) → paste token → Authorize
Now test every endpoint one by one — Categories, Products, Toppings, Staff all have full CRUD






Step 2 — Create a table (one-time, if none exist yet)

Log in as manager first to get a token, then:


curl -s -X POST http://localhost:8080/api/v1/tables \
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bàn 01", "capacity": 4}'
You'll get back {"data": {"id": "...", "qr_token": "abcdef...64chars..."}}.

Step 3 — Get the QR link without curl

Go to http://localhost:3000/admin/marketing — the page now fetches real tables from the API and shows each table's correct QR code. Click the Test button on any card → it opens the QR URL in a new tab.

Step 4 — The QR flow

The URL is: http://localhost:3000/table/{qr_token}

Opening it:

Calls POST /auth/guest { qr_token } → gets a guest JWT + table info
Saves auth + sets tableId in cart store
Redirects to /menu
Browse and add items → cart shows → click Thanh toán
Fill name + phone + payment method → submit
Order created → redirect to /order/:id
Admin overview (/admin/overview) gets the new-order popup immediately
Root cause of the old bug: The marketing page was hardcoding URLs like /table/1 (just a number) — the BE requires a 64-char hex qr_token. Now it fetches real table data with real tokens.


curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
Login credentials:

Username: admin · Password: Admin@123
5 tables created. To test the full QR → menu → order flow, open any of these URLs in an incognito/private window:


http://localhost:3000/table/3aec3d0423c6af297bec727d3056c88757e6b05a69e6ca3dd064b388e2985371  ← Ban 01
http://localhost:3000/table/f9b1f40610c9c6b3950d31e2ecab5a03361885ca660f39312345286181bf8dfc  ← Ban 02
Flow:

Open a table URL → auto-logs in as guest → redirects to /menu
Add items → open cart → Thanh toán
In another tab, log into http://localhost:3000/login as admin → go to /admin/overview → you'll see the new-order popup appear
To get QR codes visually: go to http://localhost:3000/admin/marketing — all 5 tables now show with real QR codes and a Test button to open each one directly.

From now on — if Redis ever resets and a duplicate collision occurs, the service automatically retries up to 3 times with a fresh sequence number. You'll never see that error again.


# Stack must be running with seed applied
docker compose up -d

cd e2e

npm run test:guest    # Flow 1 — 4 tests
npm run test:kds      # Flow 2 — 2 tests (needs WS, so stack must be fully up)
npm run test:admin    # Flow 3 — 3 tests

npm test              # All 9 at once
npm run report        # Open HTML report after run


Login works. The seed uses admin123, not Admin@123. All 4 accounts are now available:

Username	Password	Role
admin	admin123	admin
manager1	manager123	manager
chef1	chef1234	chef
cashier1	cashier123	cashier


Part 1 — Extend /codebase-graph 
Part 2 — Add a Phase 0c to /dev-page
 /batch-audit skill


 check me sequence as below 
assuming that user login already .
user go to menu select combo and dish then click at thanh toan. then go to check out to fill all information then client go to 
http://localhost:3000/order
i follow that and see 
Chưa có đơn hàng nào

Quét mã QR tại bàn để bắt đầu đặt món
i suppose to see all dish i order please check and check how adming overview interact with abvoe sequence
All accounts created. Here's your login table:

Username	Password	Role	Access
admin	Admin@123	admin	Admin dashboard + all
manager	Admin@123	manager	Admin dashboard + all
cashier	Admin@123	cashier	POS / cashier view
chef	Admin@123	chef	Kitchen display (KDS)
staff	Admin@123	staff	General staff access
All use the same password Admin@123. The seed script is idempotent — re-running it will update existing accounts, not duplicate them.

1. seed cript to create staff
# 1. Ensure DB is running
docker compose up -d

# 2. Run the seed script
go run ./be/cmd/seed/main.go

✓ Quản Trị Viên  role=admin       username=admin        password=Admin@123
✓ Quản Lý        role=manager     username=manager      password=Admin@123
✓ Thu Ngân        role=cashier     username=cashier      password=Admin@123
✓ Đầu Bếp        role=chef        username=chef         password=Admin@123
✓ Nhân Viên      role=staff       username=staff        password=Admin@123


Option 2 — Delete only transactional data (keep products/staff)
If you only want to clear orders, payments, etc. but keep the menu:


docker compose exec mysql mysql -uroot -proot banhcuon -e "
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE order_groups;
SET FOREIGN_KEY_CHECKS=1;
"

2.  seed cript to create qr

# default — localhost:3000
go run ./be/cmd/qr/main.go

# mobile / phone on same WiFi
FE_HOST=http://192.168.1.42:3000 go run ./be/cmd/qr/main.go




BÃ n 01       http://localhost:3000/table/a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890
BÃ n 02       http://localhost:3000/table/b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012
BÃ n 03       http://localhost:3000/table/c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234
BÃ n 04       http://localhost:3000/table/d4e5f67890123456d4e5f67890123456d4e5f67890123456d4e5f67890123456
BÃ n 05       http://localhost:3000/table/e5f6789012345678e5f6789012345678e5f6789012345678e5f6789012345678
BÃ n VIP      http://localhost:3000/table/f67890123456789af67890123456789af67890123456789af67890123456789a
Ban 01        http://localhost:3000/table/3aec3d0423c6af297bec727d3056c88757e6b05a69e6ca3dd064b388e2985371
Ban 02        http://localhost:3000/table/f9b1f40610c9c6b3950d31e2ecab5a03361885ca660f39312345286181bf8dfc
Ban 03        http://localhost:3000/table/ecc6cf5edac88e587c68c8144bdc56baff220ab0b7b1a9f629e525e7218eb90a
Ban 04        http://localhost:3000/table/8e9de69364ace184d567d54f8e9bfcc0dae8e6787892c2be3d6b43ef08cace80
Ban 05        http://localhost:3000/table/cbe1a45804c76147effeb31762b3be0d526cb91d6824c5cfc77daf5e8369b256