# Phase 3.3 — Go Module Init + be/ Folder Structure
> Do this AFTER sqlc setup (3.1) is complete

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §1 §9 (tech stack + env vars)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `qui_trinh/BanhCuon_Project_Checklist.md` (Phase 3 section)

---

## Prompt

```
You are the Lead Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §1+§9, ERROR_CONTRACT, and the Project Checklist above.

## Task: Initialize Go 1.22 module + create be/ folder structure

1. Initialize Go module:
   go mod init github.com/[yourorg]/banhcuon

2. Install these dependencies:
   - github.com/gin-gonic/gin
   - github.com/golang-jwt/jwt/v5
   - github.com/redis/go-redis/v9
   - github.com/go-sql-driver/mysql
   - golang.org/x/crypto
   - github.com/shopspring/decimal
   - github.com/pressly/goose/v3

3. Create this exact folder structure with empty placeholder files:
   be/
   ├── cmd/server/main.go
   ├── internal/
   │   ├── handler/        (empty, add .gitkeep)
   │   ├── service/        (empty, add .gitkeep)
   │   ├── repository/     (empty, add .gitkeep)
   │   ├── middleware/     (empty, add .gitkeep)
   │   ├── model/          (empty, add .gitkeep)
   │   ├── websocket/      (empty, add .gitkeep)
   │   ├── sse/            (empty, add .gitkeep)
   │   ├── payment/        (empty, add .gitkeep)
   │   └── jobs/           (empty, add .gitkeep)
   └── pkg/
       ├── jwt/            (empty, add .gitkeep)
       ├── bcrypt/         (empty, add .gitkeep)
       └── redis/          (empty, add .gitkeep)

4. Write a minimal cmd/server/main.go that:
   - Imports gin
   - Creates a router with r.GET("/health", ...) returning 200 {"status":"ok"}
   - Reads PORT from os.Getenv("PORT"), defaults to "8080"
   - Starts server

5. Create .env.example with all vars from MASTER §9 using REPLACE placeholders.

## Definition of Done
- [ ] go mod tidy runs without error
- [ ] go build ./... passes
- [ ] go run ./cmd/server responds to GET /health with 200
- [ ] No hardcoded env vars — all via os.Getenv()
- [ ] .env file is NOT committed (only .env.example)
```
