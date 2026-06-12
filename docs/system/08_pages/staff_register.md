# Register — `/register`

> **TL;DR:** ✅ implemented · public · Account registration form, same centered-card pattern as
> `/login` (RHF + Zod, `Input`/`Label`/`Button` atoms). Calls `features/auth/auth.api.register`
> and logs the new user in on success. Note: staff accounts are normally created by managers via
> `/admin/staff`; this page mainly serves the 🔮 PLANNED customer-account path.

---

## ASCII Wireframe

```
┌────────────────────────────────────────────────┐
│        ┌──────────────────────────────┐        │
│        │      Quán Bánh Cuốn          │        │
│        │      Tạo tài khoản mới       │        │
│        │                              │        │
│        │ Tên đăng nhập                │        │
│        │ [__________________________] │        │
│        │ Họ tên                       │        │
│        │ [__________________________] │        │
│        │ Mật khẩu                     │        │
│        │ [__________________________] │        │
│        │ Xác nhận mật khẩu            │        │
│        │ [__________________________] │        │
│        │  ⚠ inline Zod errors         │        │
│        │                              │        │
│        │ [        Đăng ký          ]  │        │
│        │                              │        │
│        │ Đã có tài khoản? Đăng nhập   │        │ ← link → /login
│        └──────────────────────────────┘        │
└────────────────────────────────────────────────┘
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Card + form | inline JSX in `(auth)/register/page.tsx` with `Input`/`Label`/`Button` atoms | RHF + Zod |
| Submit | `features/auth/auth.api.register` | `POST /auth/register` → `useAuthStore.setAuth` |
| Login link | `Link` | → `/login` |

## Key Interactions

- Submit → register, auto-login, redirect by role (same role map as `/login`).
- `USERNAME_TAKEN`-class errors surface inline on the form.
- Already logged in → redirected away on mount.

## Business Logic Used

- Auth store + redirect map → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (auth store)
- Default role of self-registered accounts + RBAC → [../02_spec/BUSINESS_RULES.md §1 RBAC](../02_spec/BUSINESS_RULES.md#1-rbac-role-hierarchy)
- Token rules → [../02_spec/BUSINESS_RULES.md §5 JWT / Auth Rules](../02_spec/BUSINESS_RULES.md#5-jwt--auth-rules)
