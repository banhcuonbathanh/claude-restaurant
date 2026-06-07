# Rule 02 — Design (tokens · typography · primitives · spacing · mobile)

> Read before: any styling, color, typography, button/badge/input, spacing, or layout work.
> Living registry: `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` Tier 1 (UI atoms) + Tier 2 (shared). Source of token values: `docs/core/MASTER_v1.2.md §2` + `fe/tailwind.config.ts` + `fe/src/app/globals.css`.

---

## 1. Never hardcode hex — token classes only

| Token | Tailwind class | Use case |
|---|---|---|
| Primary accent | `bg-primary` · `text-primary` | Prices · badges · active states · primary CTA |
| Page background | `bg-background` | Page bg |
| Card | `bg-card` | Cards · modals · sheets |
| Success | `text-success` / `bg-success/10` | Done / available |
| Warning | `text-warning` | Preparing · KDS 10–20 min |
| Urgent | `text-urgent` | Cancelled · >20 min · out of stock |
| Foreground | `text-foreground` | Main text |
| Muted text | `text-muted-fg` | Placeholders · secondary labels |
| Border | `border-border` | Dividers · outlines |
| Muted bg | `bg-muted` | Disabled · secondary surfaces |

```tsx
// ❌ WRONG
<div className="bg-[#FF7A1A] text-[#9CA3AF]" />
// ✅ CORRECT
<div className="bg-primary text-muted-fg" />
```

Typography: body = `font-body` (Be Vietnam Pro) · headings = `font-display` (Playfair Display).

---

## 2. Use the shadcn primitives — do not hand-roll

Actionable controls use the atoms in `src/components/ui/`. Check Tier 1 of the sharing index before styling a raw element.

### Buttons — the standard

**Every actionable button uses `<Button>` from `@/components/ui/button` with a `variant` + `size`.** Do not style a raw `<button>` with `bg-primary … rounded-… px-…` — that is a `<Button variant="default">`.

```tsx
import { Button } from '@/components/ui/button'

// primary CTA
<Button onClick={onCheckout} size="lg">Thanh toán</Button>
// secondary / cancel
<Button variant="secondary" onClick={onClose}>Hủy</Button>
// destructive
<Button variant="destructive" onClick={onDelete}>Xóa</Button>
// inline text action
<Button variant="link" onClick={onView}>Xem đơn</Button>
```

Variants: `default · secondary · destructive · success · warning · outline · ghost · link`.
Sizes: `sm · default · lg · xl · icon · icon-sm · icon-lg`. Primary CTAs → `size="lg"`.

**Raw `<button>` is allowed only for:** icon-only tap targets inside a component (cart icon, close ✕, stepper ±), nav pills, or genuinely bespoke chrome that no variant covers. When you do, keep `min-h-[44px]`/`min-w-[44px]` for touch.

> Migration note: the codebase still has many legacy raw `<button>`s. The **rule going forward** is `<Button>`. When you touch a file with a legacy action button, convert that button to `<Button>` (don't mass-migrate untouched files unless asked).

### Other atoms
`Badge` (status chips — `success`=available, `urgent`=out-of-stock) · `Input` + `Label` (forms) · `Card`/`CardHeader`/`CardContent` (admin/dashboard only, not customer flow) · `ProgressBar`. Reuse `shared/` components (`StatusBadge`, `EmptyState`, `KPICard`, `Pagination`, `QuantityStepper`, nav bars…) before building.

---

## 3. Mobile-first + touch

- Customer flow is **mobile-first**; admin is desktop-first with responsive grids.
- Min touch target **44×44px** (`min-h-[44px]`). `Button` default `h-10` (40px) is the floor; use `size="lg"` for primary taps.
- Responsive grid idiom used across the app: `flex flex-col gap-3 sm:hidden` (mobile list) + `hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3` (tablet/desktop).
- iOS: add `pb-safe` for bottom nav over the home indicator.

---

## 4. Match the wireframe

When building/altering a page's look, the `.excalidraw` + `*_wireframe_v1.md` in that page's `docs/fe/wireframes/<page>/` folder is the visual source of truth. Zones, order, and spacing come from there — don't invent layout.

---

## References
- `docs/fe/wireframes/shared/_INDEX_SHARING_COMPONENT.md` — atoms (Tier 1) + shared (Tier 2) catalog.
- `fe/src/components/ui/button.tsx` — variant/size source.
- `docs/core/MASTER_v1.2.md §2` — design tokens + KDS urgency colors.
- Structure of the component you're styling → rule 01.
