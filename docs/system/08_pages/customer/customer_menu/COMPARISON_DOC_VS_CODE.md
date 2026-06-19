# Customer Menu — Doc vs. Code Comparison

> **Scope:** compares the `customer_menu` doc-set against the actual `/menu` code in this working
> tree. **Read-only audit — no code or docs were changed to produce this.**
> Compared files: `customer_menu.md` · `customer_menu_be.md` ⇄
> `fe/src/app/(shop)/menu/page.tsx` · `fe/src/features/menu/components/*` · `fe/src/store/cart.ts` ·
> `fe/src/lib/order-payload.ts` · `be/internal/handler/product_handler.go`.
> Date: 2026-06-20.

---

## TL;DR

The doc-set is **highly accurate** against current code. Every substantive *behavioral* claim
holds true. The gaps are **path / provenance / completeness / dead-code**, not behavior.
Net actionable items: **3 doc fixes** + **1 code-cleanup task**.

---

## 1 · Verified Correct (no action needed)

| Doc claim | Code reality | Match |
|---|---|---|
| Search ≥2 chars runs, 1 char disables query | `enabled: searchQuery.length === 0 \|\| >= 2` (page.tsx:76) | ✅ |
| Canh gate keys off `id.startsWith('canh_')` | page.tsx:40 | ✅ |
| `tableId` set → confirm modal, else → `/checkout` | page.tsx:49 | ✅ |
| **BE ignores `category_id` / `search` / `is_available`** | `ListProducts` has 0 `c.Query` calls; `ProductList` does no client filter | ✅ flag still true |
| Combo enrichment in `page.tsx:86-105` useMemo | exact lines | ✅ |
| "NO filling column" (nhân = topping) | migration 016 added it, **017 dropped it** → none now; FE sends `topping_ids` only | ✅ true again |
| TableConfirmModal: `source:'qr'` → POST `/orders` → GET → `ORDER_CACHE` → `router.replace('/order/<id>')` + `table_busy` toast | TableConfirmModal.tsx:20-50 | ✅ |
| `partialize` keeps only `orderNote` + `activeOrderId` | cart.ts:153 | ✅ |

---

## 2 · Differences Found

| # | Where | Doc says | Code reality | Severity | Suggestion |
|---|---|---|---|---|---|
| 1 | `customer_menu.md` Zones table (lines 221-233) | Component path `features/menu/MenuHeader` etc. | Real path is `features/menu/`**`components`**`/MenuHeader` (see page.tsx imports) | 🟡 Medium — misleads navigation | Add the missing `/components/` segment to all 13 rows |
| 2 | Provenance header — `customer_menu.md:256`, `customer_menu_be.md:5` | "traced on branch `experience_claude.md_system_1`" | Current branch `experience_claude.md_system_1_test_iphon2_change_code` | 🟢 Low — provenance only | Update branch name, or pin to a commit sha so it doesn't rot per-branch |
| 3 | Zones table completeness | Lists 13 zones; stops at E/F | E/F have real child components never named (see §3) | 🟢 Low | Add a one-line "child components" note under E and F |
| 4 | Dead code exposed by the audit | Doc (correctly) silent on `DrinkCustomize` + `OrderNote` | Both files exist but have **zero imports** | 🟢 Low — code smell, not a doc bug | Delete the two unused files (separate code task) |

---

## 3 · Finding #3 in Detail — the 6 "extra" components

The menu folder has 6 components the Zones table never mentions. Tracing real imports splits
them into two groups with **different fixes**:

| Component | Imported by | Role | Status |
|---|---|---|---|
| `ComboCard` | `ComboSection.tsx` (Zone E) | Combo card rendered inside E | ✅ used — child of E |
| `ComboModal` | `ComboCard.tsx` | Combo-edit overlay opened from a combo card | ✅ used — grandchild of E |
| `ProductCard` | `ProductList.tsx` (Zone F) | Mobile list-row variant | ✅ used — child of F |
| `ProductGridCard` | `ProductList.tsx` (Zone F) | Tablet/desktop grid-card variant | ✅ used — child of F |
| `DrinkCustomize` | **nothing** | — | 🔴 dead code |
| `OrderNote` | **nothing** | — | 🔴 dead code (`OrderSummary` handles the note inline: OrderSummary.tsx:47,62,300) |

**Group A (real children — document them):** `ComboCard`, `ComboModal`, `ProductCard`,
`ProductGridCard`. Pure doc edit — e.g.:
> *E renders `ComboCard` → opens `ComboModal`; F renders `ProductCard` (mobile) / `ProductGridCard` (grid).*

**Group B (dead code — delete, do NOT document):** `DrinkCustomize`, `OrderNote`.

---

## 4 · Recommended Next Steps (in order)

| Step | Type | Action | Files |
|---|---|---|---|
| 1 | Doc fix | Add `/components/` to Zones-table paths (Diff #1) | `customer_menu.md` |
| 2 | Doc fix | Add child-component note under E/F (Diff #3 / Group A) | `customer_menu.md` |
| 3 | Doc fix | Refresh provenance branch/sha (Diff #2) | `customer_menu.md`, `customer_menu_be.md` |
| 4 | Code task | Verify-then-delete `DrinkCustomize.tsx` + `OrderNote.tsx` (Diff #4 / Group B) — confirm unreferenced via build first | `fe/src/features/menu/components/` |

> Per `CLAUDE.md` (MASTER-first + scope contract): steps 1–3 are one doc task; step 4 is a
> separate code task and must be registered in `MASTER_TASK.md` before any file is deleted.
