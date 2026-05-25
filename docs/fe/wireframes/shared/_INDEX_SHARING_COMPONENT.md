# Shared Component Index

> Check here **before** building anything new.
> If a component exists → mark it `✅ reuse` in your page spec Component Map.
> If it doesn't exist → build it, then add a row here.

---

## How to reference in a page spec

In your Component Map (Step 5), write the component name and point to this file:

| Zone | Component | Reuse? | File |
|------|-----------|--------|------|
| J | `Button` | ✅ reuse → [shared/Button] | `components/ui/button.tsx` |
| — | `MyNewThing` | new | `components/menu/MyNewThing.tsx` |

---

## Tier 1 — UI Atoms (`components/ui/`)

> Lowest-level building blocks. Use these inside every other component.

| Component | File | Variants | Notes |
|-----------|------|----------|-------|
| `Button` | `ui/button.tsx` | **variant:** default · secondary · destructive · success · warning · outline · ghost · link — **size:** sm · default · lg · xl · icon · icon-sm · icon-lg | Min touch target: `h-10` (40px). Use `size="lg"` for primary CTA |
| `Badge` | `ui/badge.tsx` | **variant:** default · secondary · success · warning · urgent · outline · muted | Use `success` for available, `urgent` for out-of-stock |
| `Input` | `ui/input.tsx` | — | Styled text input. Wrap with `Label` for forms |
| `Label` | `ui/label.tsx` | — | For form fields only |
| `Card` | `ui/card.tsx` | `Card` · `CardHeader` · `CardContent` · `CardFooter` · `CardTitle` · `CardDescription` | Admin and dashboard pages. Not used in customer flow |

---

## Tier 2 — Shared Components (`components/shared/`)

> Cross-cutting components used by multiple page domains.

| Component | File | Key Props | When to use |
|-----------|------|-----------|-------------|
| `StatusBadge` | `shared/StatusBadge.tsx` | `status: OrderStatus` | Anywhere an order status needs a styled label. Statuses: pending · confirmed · preparing · ready · delivered · cancelled |
| `EmptyState` | `shared/EmptyState.tsx` | `icon?: string` · `message: string` | Any empty list or zero-result state. Default icon: 🍜 |
| `ConnectionErrorBanner` | `shared/ConnectionErrorBanner.tsx` | none | SSE disconnect. Fixed top banner. Use on KDS, Order tracking pages |
| `CookieConsent` | `shared/CookieConsent.tsx` | — | Layout-level only. Do not use inside pages |

---

## Tier 3 — Menu Feature Components (`components/menu/`)

> Built for the menu page but reusable in similar customer-flow pages.

| Component | File | Key Props | When to use |
|-----------|------|-----------|-------------|
| `ProductCard` | `menu/ProductCard.tsx` | `product: Product` | Any page that lists products. Handles add-to-cart + favourite toggle internally |
| `ComboCard` | `menu/ComboCard.tsx` | `combo: Combo` | Any page that lists combos |
| `CategoryTabs` | `menu/CategoryTabs.tsx` | `categories` · `selected` · `onSelect` | Horizontal scroll category filter. Sticky-aware |
| `CartDrawer` | `menu/CartDrawer.tsx` | `open` · `onClose` · `addToOrderId?` | Slide-in cart panel. Also handles "add to existing order" flow |
| `ToppingModal` | `menu/ToppingModal.tsx` | `product` · `open` · `onClose` · `onConfirm` | Bottom sheet for topping selection. Used inside `ProductCard` |
| `ComboModal` | `menu/ComboModal.tsx` | `combo` · `open` · `onClose` · `onConfirm` | Bottom sheet for combo detail. Used inside `ComboCard` |

---

## Tier 4 — Guards (`components/guards/`)

> Route protection. Wrap page content, not layouts.

| Component | File | Key Props | When to use |
|-----------|------|-----------|-------------|
| `AuthGuard` | `guards/AuthGuard.tsx` | — | All protected pages (staff, admin). Redirects unauthenticated users |
| `RoleGuard` | `guards/RoleGuard.tsx` | `allowedRoles: Role[]` | Admin and manager-only pages |

---

## Order Domain (`components/order/`)

| Component | File | Key Props | When to use |
|-----------|------|-----------|-------------|
| `OrderDetailSheet` | `order/OrderDetailSheet.tsx` | — | Order tracking page (`/order/[id]`) |

---

## Global Stores (Zustand)

> State that crosses page boundaries. Do not duplicate in local state.

| Store | File | What it owns |
|-------|------|-------------|
| `useCartStore` | `store/cart.ts` | Cart items · total · itemCount · activeOrderId |
| `useFavouritesStore` | `store/favourites.ts` | Favourite product/combo IDs (localStorage persisted) |
| `useSettingsStore` | `store/settings.ts` | tableLabel · customerName · guestToken |
| `useAuthStore` | `store/auth.ts` | Current user · role · JWT |

---

*Last updated: 2026-05-25*
*Add new components here the moment they are built — not after.*
