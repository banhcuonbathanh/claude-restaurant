go run ./be/cmd/seed/main.go

docker compose up -d --build be
docker compose up -d --build fe
BÃ n 01 http://localhost:3000/table/a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890
BÃ n 02 http://localhost:3000/table/b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012
BÃ n 03 http://localhost:3000/table/c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234
BÃ n 04 http://localhost:3000/table/d4e5f67890123456d4e5f67890123456d4e5f67890123456d4e5f67890123456
BÃ n 05 http://localhost:3000/table/e5f6789012345678e5f6789012345678e5f6789012345678e5f6789012345678
BÃ n VIP http://localhost:3000/table/f67890123456789af67890123456789af67890123456789af67890123456789a
Ban 01 http://localhost:3000/table/3aec3d0423c6af297bec727d3056c88757e6b05a69e6ca3dd064b388e2985371
Ban 02 http://localhost:3000/table/f9b1f40610c9c6b3950d31e2ecab5a03361885ca660f39312345286181bf8dfc
Ban 03 http://localhost:3000/table/ecc6cf5edac88e587c68c8144bdc56baff220ab0b7b1a9f629e525e7218eb90a
Ban 04 http://localhost:3000/table/8e9de69364ace184d567d54f8e9bfcc0dae8e6787892c2be3d6b43ef08cace80
Ban 05 http://localhost:3000/table/cbe1a45804c76147effeb31762b3be0d526cb91d6824c5cfc77daf5e8369b256
✓ Quản Trị Viên role=admin username=admin password=Admin@123
✓ Quản Lý role=manager username=manager password=Admin@123
✓ Thu Ngân role=cashier username=cashier password=Admin@123
✓ Đầu Bếp role=chef username=chef password=Admin@123
✓ Nhân Viên role=staff username=staff password=Admin@123

Terminal 1 — infra (run once):

docker compose up -d mysql redis

Terminal 2 — BE (stop Docker BE first: docker compose stop be):

cd be && set -a && source .env.local && set +a && go run ./cmd/server
Terminal 3 — FE with hot-reload:


cd fe && NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev