---
description: Scaffold, lint, or export a DESIGN.md file — the AI-friendly design system spec. Usage: /design [subcommand]. Subcommands: scaffold (default), lint, export, diff. Reads globals.css + tailwind.config.ts automatically.
---

You are managing the project's `DESIGN.md` — a machine-readable + human-readable design system specification.

The argument passed to this skill is: **$ARGUMENTS**

Parse `$ARGUMENTS`:
- No argument (empty) → run **scaffold** flow
- `lint` → run **lint** flow
- `export [format]` → run **export** flow (format: `tailwind` | `css`, default `tailwind`)
- `diff <file1> <file2>` → run **diff** flow

---

## DESIGN.md Format Reference

A valid `DESIGN.md` has two layers:

**Layer 1 — YAML front matter** (machine-readable tokens between `---` delimiters):
```yaml
---
colors:
  primary: "#FF7A1A"
  background: "#0A0F1E"
  card: "#1F2937"
  foreground: "#F9FAFB"
  muted: "#374151"
  muted-fg: "#9CA3AF"
  border: "#2D3748"
  success: "#3DB870"
  warning: "#FCD34D"
  urgent: "#FC8181"

dimensions:
  radius: "8px"
  radius-lg: "12px"
  spacing-unit: "4px"
  touch-target: "44px"

typography:
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0"
  heading:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "20px"
    fontWeight: "700"
    lineHeight: "1.3"
    letterSpacing: "-0.01em"
  small:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "1.35"
    letterSpacing: "0"

components:
  Button:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "body"
    rounded: "8px"
    padding: "12px 24px"
    height: "44px"
  Button-hover:
    backgroundColor: "#E56B15"
  BadgeSuccess:
    backgroundColor: "#F0FDF4"
    textColor: "{colors.success}"
    rounded: "4px"
    padding: "2px 8px"
  BadgeWarning:
    backgroundColor: "#FEFCE8"
    textColor: "#92400E"
    rounded: "4px"
    padding: "2px 8px"
  BadgeUrgent:
    backgroundColor: "#FEE2E2"
    textColor: "{colors.urgent}"
    rounded: "4px"
    padding: "2px 8px"
  Card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "8px"
    padding: "16px"
---
```

**Layer 2 — Markdown body** (human-readable rationale):
Sections in order: Overview · Colors · Typography · Layout · Elevation & Depth · Shapes · Components · Do's and Don'ts

Token references use `{category.name}` syntax (e.g. `{colors.primary}`).

---

## FLOW: scaffold

### Step 1 — Auto-detect existing tokens

Read these files in order (stop if found):
1. `fe/src/app/globals.css` → extract all `--color-*`, `--radius`, `--font-*` CSS variables
2. `fe/tailwind.config.ts` → extract colors, fontFamily, borderRadius from `theme.extend`
3. `docs/core/MASTER_v1.2.md §2` → extract any design token tables

Print what was found:
```
🔍 Token extraction:
  Source: fe/src/app/globals.css
  Colors found: primary=#FF7A1A, background=#0A0F1E, card=#1F2937, ...
  Radius: 0.5rem → 8px
  Font: Be Vietnam Pro (from body rule)
```

If no sources found → ask the user to provide token values before continuing.

### Step 2 — Plan

Print the plan:

```
📋 DESIGN.md SCAFFOLD PLAN

Output: docs/design/DESIGN.md
Source: fe/src/app/globals.css + fe/tailwind.config.ts

YAML tokens to include:
  Colors: primary · background · card · foreground · muted · muted-fg · border · success · warning · urgent
  Dimensions: radius · touch-target · spacing-unit
  Typography: body · heading · small
  Components: Button · Button-hover · BadgeSuccess · BadgeWarning · BadgeUrgent · Card

Markdown sections:
  ## Overview         ← project purpose + design philosophy
  ## Colors           ← palette with hex values + usage rules
  ## Typography       ← type scale + font families
  ## Layout           ← grid, spacing, responsive breakpoints
  ## Shapes           ← border radius scale
  ## Components       ← Button, Badge, Card usage rules
  ## Do's and Don'ts  ← token rules, hardcode rules, touch target rules
```

**STOP. Waiting for approval.** Reply "ok" to generate the file, or correct any detail above.

### Step 3 — Generate `docs/design/DESIGN.md`

Only after user approves.

1. Create folder `docs/design/` if it doesn't exist
2. Write `docs/design/DESIGN.md` with:
   - YAML front matter populated from extracted tokens
   - Full markdown body with all 8 sections
   - Real hex values (not placeholders)
   - Token references in components (e.g. `backgroundColor: "{colors.primary}"`)
   - Vietnamese design rationale where relevant (this is a Vietnamese restaurant app)

**Markdown body content guide:**

**## Overview**
- Project: Hệ Thống Quản Lý Quán Bánh Cuốn
- Stack: Next.js 14 + Tailwind v3 + TypeScript
- Philosophy: dark-mode first, mobile-first, touch-optimized (44px targets), orange accent

**## Colors**
- Table with: Token name · Hex · Tailwind class · Usage
- Call out: never hardcode hex — always use `bg-primary`, `text-foreground`, etc.
- WCAG notes: check foreground (#F9FAFB) on card (#1F2937) — must meet AA

**## Typography**
- Font: Be Vietnam Pro (primary), system-sans (fallback)
- Scale: 20px heading · 14px body · 12px small · 10px micro
- Rules: no bold below 12px, line-height ≥ 1.35

**## Layout**
- Breakpoints: mobile 375px · tablet 768px · desktop 1280px
- Touch target: min 44×44px on all interactive elements
- Spacing unit: 4px base (use multiples: 4, 8, 12, 16, 24, 32)
- Admin pages: 1200px canvas, 220px sidebar
- Customer pages: 390px content width

**## Elevation & Depth**
- No box-shadow on dark backgrounds (use border instead)
- Use `glow-primary` utility for CTAs
- Card depth: bg-card with border-border

**## Shapes**
- Radius scale: 4px (badge) · 8px (card, button) · 12px (modal) · full (avatar)

**## Components**
- Button: full DESIGN.md component spec
- Badge variants: success · warning · urgent · gray
- Card: standard container pattern

**## Do's and Don'ts**
```
✅ DO: use bg-primary, text-foreground, border-border
❌ DON'T: hardcode #FF7A1A or any hex in component files
✅ DO: min-h-[44px] on all buttons and interactive elements
❌ DON'T: use text-white — use text-foreground or explicit role-based tokens
✅ DO: import from storage-keys.ts for localStorage keys
❌ DON'T: create new CSS variables — extend tailwind.config.ts instead
```

### Step 4 — Print completion

```
✅ /design scaffold complete

File created:
  docs/design/DESIGN.md

Tokens captured: [N colors] · [N dimensions] · [N typography styles] · [N components]

Next steps:
  1. Review the file — fill any [TBD] rationale sections
  2. Run /design lint to validate token references and WCAG contrast
  3. Run /design export to regenerate tailwind.config.ts from DESIGN.md
  4. Commit: "docs: add DESIGN.md design system spec"
```

---

## FLOW: lint

Validates `docs/design/DESIGN.md` against 7 rules.

### Step 1 — Read the file

Read `docs/design/DESIGN.md`. If not found, print:
```
🔴 STOP: docs/design/DESIGN.md not found. Run /design scaffold first.
```

### Step 2 — Run all 7 lint rules

| Rule | Check | Pass | Fail |
|------|-------|------|------|
| R1 — Broken references | Every `{category.name}` resolves to a defined token | ✅ | ❌ list broken refs |
| R2 — Primary color exists | `colors.primary` is defined | ✅ | ❌ missing |
| R3 — WCAG contrast AA | `foreground` on `background` ≥ 4.5:1 · `foreground` on `card` ≥ 4.5:1 | ✅ | ❌ ratio + tokens |
| R4 — Orphaned tokens | Every token in YAML is referenced in markdown body or components | ✅ warn | ⚠️ list unused |
| R5 — Typography section | At least one typography token defined + `## Typography` section in markdown | ✅ | ❌ missing |
| R6 — Section order | Markdown sections follow: Overview → Colors → Typography → Layout → Elevation → Shapes → Components → Do's | ✅ | ❌ wrong order |
| R7 — Touch target | `dimensions.touch-target` defined and ≥ `44px` | ✅ | ❌ missing or < 44px |

**WCAG contrast calculation:**
Use relative luminance formula. For hex colors:
- Linearize each RGB channel: if c/255 ≤ 0.04045, then c/255/12.92; else ((c/255+0.055)/1.055)^2.4
- L = 0.2126R + 0.7152G + 0.0722B
- Contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05)

Pre-computed for this project's tokens (verify if values changed):
- #F9FAFB on #0A0F1E ≈ 16.8:1 ✅ (AAA)
- #F9FAFB on #1F2937 ≈ 11.2:1 ✅ (AAA)
- #FF7A1A on #0A0F1E ≈ 4.8:1 ✅ (AA)
- #FF7A1A on #1F2937 ≈ 3.9:1 ⚠️ (fails AA — do not use as text on card bg)

### Step 3 — Print findings

```
📋 /design lint — docs/design/DESIGN.md

R1 Broken references:    ✅ none
R2 Primary color:        ✅ colors.primary = #FF7A1A
R3 WCAG contrast:        ✅ foreground/background 16.8:1 · foreground/card 11.2:1
                         ⚠️ primary/card = 3.9:1 — fails AA for text use
R4 Orphaned tokens:      ⚠️ colors.muted not referenced in markdown body
R5 Typography section:   ✅ 3 styles defined + ## Typography present
R6 Section order:        ✅ correct
R7 Touch target:         ✅ 44px defined

Summary: 0 errors · 2 warnings

Recommended fixes:
  1. Never use {colors.primary} as text color on card background (contrast 3.9:1 < 4.5:1)
     → Use {colors.primary} for borders/accents only on card bg; use {colors.foreground} for text
  2. Add a usage note for colors.muted in ## Colors section
```

---

## FLOW: export

Converts `docs/design/DESIGN.md` YAML tokens to code.

### Step 1 — Read the file

Read `docs/design/DESIGN.md`. If not found → stop with same error as lint.

### Step 2 — Determine format

`$ARGUMENTS` second token:
- `tailwind` (default) → output Tailwind `theme.extend` JSON
- `css` → output CSS custom properties block

### Step 3 — Generate and print output (do not write file unless user confirms)

**Tailwind format:**
```typescript
// Generated from docs/design/DESIGN.md
// Paste into fe/tailwind.config.ts → theme.extend

theme: {
  extend: {
    colors: {
      primary:    'var(--color-primary)',    // #FF7A1A
      background: 'var(--color-background)', // #0A0F1E
      card:       'var(--color-card)',        // #1F2937
      foreground: 'var(--color-foreground)', // #F9FAFB
      muted:      'var(--color-muted)',       // #374151
      'muted-fg': 'var(--color-muted-fg)',    // #9CA3AF
      border:     'var(--color-border)',      // #2D3748
      success:    'var(--color-success)',     // #3DB870
      warning:    'var(--color-warning)',     // #FCD34D
      urgent:     'var(--color-urgent)',      // #FC8181
    },
    fontFamily: {
      body:    ['Be Vietnam Pro', 'sans-serif'],
      display: ['Be Vietnam Pro', 'serif'],
    },
    borderRadius: {
      sm:   '4px',
      DEFAULT: '8px',
      lg:   '12px',
      full: '9999px',
    },
  },
}
```

**CSS format:**
```css
/* Generated from docs/design/DESIGN.md */
/* Paste into fe/src/app/globals.css → :root */

:root {
  --color-primary:    #FF7A1A;
  --color-background: #0A0F1E;
  --color-card:       #1F2937;
  --color-foreground: #F9FAFB;
  --color-muted:      #374151;
  --color-muted-fg:   #9CA3AF;
  --color-border:     #2D3748;
  --color-success:    #3DB870;
  --color-warning:    #FCD34D;
  --color-urgent:     #FC8181;
  --radius:           8px;
}
```

Ask: "Do you want me to write this directly to `fe/tailwind.config.ts` / `fe/src/app/globals.css`? (y/n)"

Only write if user confirms.

### Step 4 — Print diff from current (if writing)

Before writing, compare against the current file. Only show lines that differ:

```
📋 Changes to fe/tailwind.config.ts:
  + borderRadius.sm: '4px'        (new)
  + borderRadius.full: '9999px'   (new)
  ~ fontFamily.body: ['Be Vietnam Pro', 'sans-serif'] → same (no change)
```

---

## FLOW: diff

Compares two DESIGN.md files for token-level changes.

Parse `$ARGUMENTS` as: `diff <file1> <file2>`

Read both files. For each token category (colors, dimensions, typography, components), output:

```
📋 /design diff

File A: docs/design/DESIGN.md
File B: docs/design/DESIGN.md.bak  (or any two paths)

Colors:
  ~ primary:    #FF7A1A → #F97316  (changed)
  + accent:     #6366F1             (added in B)
  - ring:       #FF7A1A             (removed in B)

Components:
  ~ Button.height: 44px → 48px     (changed — check touch target)
  + InputField: (new component in B)

⚠️ Regressions (B is worse than A):
  - Button.height 48px > 44px: acceptable
  - primary contrast on card: was 3.9:1, now check #F97316 on #1F2937
```

If files are identical → print "✅ No differences found."

---

## Error Handling

| Situation | Action |
|-----------|--------|
| `docs/design/DESIGN.md` not found | Print 🔴 STOP + guide to run scaffold |
| Malformed YAML front matter | Print the line + explain fix |
| Broken token reference | List every `{x.y}` that doesn't resolve |
| Unknown subcommand | Print: `Unknown subcommand. Valid: scaffold · lint · export · diff` |
