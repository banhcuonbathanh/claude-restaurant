# Phase 5.1 — Auth Frontend
> Dependency: Task 4.1 auth backend working ✅ + API_CONTRACT v1.2 exists ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §2 §6.3 (design tokens, FE interceptor pattern)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec1_Auth_Updated_v2.docx`
- [ ] `claude/CLAUDE_FE.docx`
- [ ] `contract/API_CONTRACT_v1.1.docx` §2

---

## Prompt

```
You are the FE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §2+§6.3, ERROR_CONTRACT, Spec1_Auth, 
CLAUDE_FE.docx, and API_CONTRACT §2 above.

## Task: Build auth frontend (Task 5.1)

### Step 1: fe/src/lib/api-client.ts
Single axios instance — ALL API calls go through this, nothing else.
- baseURL: process.env.NEXT_PUBLIC_API_URL
- withCredentials: true (so httpOnly cookie sends on every request)
- Request interceptor: attach Authorization: Bearer {accessToken from Zustand store}
- Response interceptor:
  - on 401: call POST /auth/refresh → update Zustand store → retry original request ONCE
  - on second 401: clearAuth() → redirect to /login
  - on TOKEN_EXPIRED error code: same as 401 flow
  - on ACCOUNT_DISABLED error code: clearAuth() → redirect to /login with message

### Step 2: fe/src/features/auth/auth.store.ts
Zustand store (Zustand v4 with immer or plain):
interface AuthStore {
  user: Staff | null
  accessToken: string | null    ← IN MEMORY ONLY — never localStorage
  setAuth: (user: Staff, token: string) => void
  clearAuth: () => void
}
🔴 accessToken MUST stay in memory. Never call localStorage.setItem for tokens.
On page refresh: accessToken is null. App must call GET /auth/me on mount to restore.

### Step 3: fe/src/features/auth/auth.api.ts
- login(username, password) → POST /auth/login
- logout() → POST /auth/logout
- refreshToken() → POST /auth/refresh → returns { accessToken }
- getMe() → GET /auth/me → returns Staff

### Step 4: fe/src/app/(auth)/login/page.tsx
React Hook Form + Zod:
  username: z.string().min(3)
  password: z.string().min(6)
On submit: login() → setAuth() → redirect by role:
  chef → /kds, cashier → /pos, manager/admin → /orders/live, customer/guest → /menu
Show generic inline error on failure (never reveal if username or password was wrong).
Use design tokens from MASTER §2 — no hardcoded hex colors.

### Step 5: fe/src/components/guards/AuthGuard.tsx
If no accessToken in store: call getMe() → on success setAuth() → render children.
If getMe() fails: redirect to /login.

### Step 6: fe/src/components/guards/RoleGuard.tsx  
Read role from store. Compare role hierarchy value. If insufficient: show 403 page.
Role values: customer=1, chef=2, cashier=2, staff=3, manager=4, admin=5.

## Definition of Done
- [ ] Access token NEVER in localStorage (open DevTools → Application → no token)
- [ ] Page refresh → app calls GET /auth/me → session restored silently
- [ ] 401 response → token refreshed → original request retried automatically
- [ ] Second 401 (refresh failed) → redirect to /login
- [ ] Wrong role → 403 page shown (not redirected, not blank)
- [ ] npx tsc --noEmit passes — no `any` types
- [ ] No color hex in code — Tailwind classes only
```
