# Customer Profile — `/profile`

> **TL;DR:** ✅ implemented · customer session · Profile page: avatar header, personal-info form
> (`useCustomerProfile` / `useUpdateProfile` hooks), quick-nav grid to other customer pages, and a
> save CTA bar. Groundwork for the 🔮 PLANNED online customer account (order from home).

---

## ASCII Wireframe

```
┌────────────────────────────────────────────────┐
│ [←] Hồ sơ                                      │ ← A CustomerTopNav
├────────────────────────────────────────────────┤
│           ┌────────┐                           │
│           │ avatar │  Nguyễn Văn A             │ ← B ProfileAvatarHeader
│           └────────┘                           │
├────────────────────────────────────────────────┤
│ THÔNG TIN CÁ NHÂN                              │ ← C PersonalInfoForm
│ [ Họ tên ______________ ]                      │
│ [ Số điện thoại _______ ]                      │
│ [ … ]                                          │
├────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │ ← D QuickNavGrid
│ │ Đơn hàng │ │Yêu thích │ │ Cài đặt  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
├────────────────────────────────────────────────┤
│           [ 💾 Lưu thay đổi ]                  │ ← E SaveCTABar
├────────────────────────────────────────────────┤
│ [Menu][Đơn Hàng][Yêu Thích][Theo Dõi][Cài Đặt] │ ← ClientBottomNav (shell)
└────────────────────────────────────────────────┘
  Loading: ProfilePageSkeleton (same layout, pulsing)
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| A Nav | `components/shared/CustomerTopNav` | — |
| B Avatar | `profile/components/ProfileAvatarHeader` | `useCustomerProfile` hook |
| C Form | `profile/components/PersonalInfoForm` | same hook (`UpdateProfileForm` shape) |
| D Quick nav | `profile/components/QuickNavGrid` | static links |
| E Save | `profile/components/SaveCTABar` | `useUpdateProfile` mutation |
| Skeleton | `profile/components/ProfilePageSkeleton` | loading state |

## Key Interactions

- Edit form fields → **Lưu thay đổi** → update-profile mutation → toast on success.
- Quick-nav tiles → `/order`, `/menu/favourites`, `/menu/settings`.
- Back arrow → previous page.

## Business Logic Used

- Profile fetch/update hooks → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (profile hooks)
- Customer role isolation (never part of staff hierarchy) → [../02_spec/BUSINESS_RULES.md §1 RBAC](../02_spec/BUSINESS_RULES.md#1-rbac-role-hierarchy)
- 🔮 PLANNED online account (login from home, pickup/delivery) extends this page →
  [../02_spec/BUSINESS_RULES.md §5 JWT / Auth Rules](../02_spec/BUSINESS_RULES.md#5-jwt--auth-rules)
