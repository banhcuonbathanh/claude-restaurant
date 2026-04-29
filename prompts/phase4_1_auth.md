# Phase 4.1 — Auth Backend
> Most critical task. Auth middleware must work before ANY other Phase 4 task starts.
> Dependency: Phase 3 complete ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §3 §4 §6 §7 §8 (RBAC, business rules, JWT, error codes, Redis keys)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec1_Auth_Updated_v2.docx`
- [ ] `Task/Task 1 data base/001_auth_sql_v1.2.docx`
- [ ] `Task/Task 2 sqlc set up and auth queries/SQLC_SETUP.docx` §3-4 (Querier interface)
- [ ] `contract/API_CONTRACT_v1.1.docx` §2 (auth endpoints)

---

## Prompt

```
You are the BE Dev for the BanhCuon system. This is the most security-critical task.

I have pasted CLAUDE.md, MASTER §3+§4+§6+§7+§8, ERROR_CONTRACT, Spec1_Auth, 
001_auth.sql, SQLC_SETUP §3-4, and API_CONTRACT §2 above.

## Task: Build auth backend (Task 4.1)

Build in this strict order — do not skip ahead:

### Step 1: pkg/jwt/jwt.go
- Claims struct: StaffID string, Role string, jti string
- GenerateAccessToken(staffID, role, secret string, ttl time.Duration) (string, error)
- ParseToken(tokenStr, secret string) (*Claims, error)
🔴 CRITICAL: Verify t.Method == jwt.SigningMethodHMAC BEFORE calling ParseWithClaims
   — algorithm confusion attack if skipped

### Step 2: pkg/bcrypt/bcrypt.go
- HashPassword(password string) (string, error) — cost = 12
- ComparePassword(hash, password string) bool

### Step 3: be/internal/repository/auth_repo.go
Wrap sqlc-generated queries. Methods:
- GetStaffByUsername, GetStaffByID, CreateRefreshToken
- GetRefreshToken, DeleteRefreshToken, DeleteRefreshTokensByStaff
- SetStaffActive, ListActiveSessionsByStaff

### Step 4: be/internal/service/auth_service.go
Implement Login, Refresh, Logout, ValidateIsActive, ValidateAccessToken.

Login flow:
1. Check Redis login_fail:{ip} — if >= 5, return 429
2. GetStaffByUsername → if not found, return ErrInvalidCredentials (NEVER reveal why)
3. ComparePassword → if fail, INCR login_fail:{ip} TTL 15min, return ErrInvalidCredentials
4. Generate access token (24h) + raw refresh token (32 bytes random hex)
5. SHA256 hash refresh token → store in Redis auth:refresh:{staffID}:{prefix} TTL 30d
6. Also store in DB refresh_tokens (fallback on Redis miss)
7. Enforce max 5 sessions: delete oldest by last_used_at if count > 5

ValidateIsActive:
- Check Redis auth:staff:{staffID} (TTL 5min cache)
- On miss: query DB → set cache
- Never query DB on every request

### Step 5: be/internal/middleware/auth.go + rbac.go
AuthRequired: parse Bearer token → ValidateAccessToken → check is_active → set context.
RequireRole(minValue int): get role from context, compare hierarchy value, 403 if insufficient.

### Step 6: be/internal/handler/auth_handler.go
- POST /api/v1/auth/login → service.Login() → set httpOnly cookie → return access token
- POST /api/v1/auth/refresh → read cookie → service.Refresh() → return new token
- POST /api/v1/auth/logout → read cookie → service.Logout() → clear cookie
- GET /api/v1/auth/me → AuthRequired middleware → return staff from context
- POST /api/v1/auth/guest → SKIP (blocked by Issue #7)

### Step 7: Wire routes in cmd/server/main.go

## Definition of Done
- [ ] Wrong password returns identical error to wrong username
- [ ] 6th login attempt from same IP within 1min → 429
- [ ] Two separate logins → 2 different refresh tokens → both valid
- [ ] Logout session 1 → session 2 still works
- [ ] Admin deactivates staff → DEL Redis cache → next request → 401 ACCOUNT_DISABLED
- [ ] is_active check does NOT hit DB on every request (Redis cache)
- [ ] All error responses: {"error": "AUTH_001", "message": "..."}
- [ ] No token in localStorage — access token only in memory (validated in next FE phase)
- [ ] go build ./... passes
```
