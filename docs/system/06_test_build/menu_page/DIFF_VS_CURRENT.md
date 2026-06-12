# DIFF_VS_CURRENT — Test Results: docs/system vs. Reality

> The point of this build was to answer: **can docs/system + the wireframe folder alone
> produce the menu page?** Answer: **mostly yes for FE visuals and state rules; no for the
> newest contracts** — three doc layers lag the 2026-06-11 TOP-epic code. Every place I was
> forced to open production source is a handbook gap listed below.

---

## 1 · Verdict by build area

| Area | Buildable from docs alone? | Source of truth used |
|---|---|---|
| Design tokens, touch targets, z-stack | ✅ yes | `04_fe/DESIGN_SYSTEM.md` |
| State homes (Query/Zustand/useState) | ✅ yes | `04_fe/STATE_MANAGEMENT.md` + NEW_PAGE_GUIDE |
| Simple zones (B, C, banner, strip, J) | ✅ yes — classes verbatim in spec | `menu_spec.md` per-zone |
| Cart store contract | ⚠️ spec v3 logic yes, exact persist/migrate no | read `store/cart.ts` |
| Nhân-as-topping card pattern | ⚠️ v3 describes it; layout details no | read `ProductCard.tsx`, `ComboCard.tsx` |
| ComboModal interaction | ❌ v3 has one line ("→ ComboModal") | read `ComboModal.tsx` |
| OrderSummary post-TOP layout | ❌ canonical §Zone I still pre-TOP (filling badges, drinkConfig) | read `OrderSummary.tsx` |
| MenuHeader (v3 redesign) | ❌ canonical §Zone A still 4-icon version | read `MenuHeader.tsx` |
| BE create-order contract | ⚠️ v3 worked example excellent; handbook contradicts it | v3 §6 (code-verified) |

## 2 · Handbook gaps (each one = a forced source-read)

1. **`menu_spec.md` (canonical) was not refreshed after the TOP epic.** Its §Zone A header,
   §Zone I OrderSummary, §④ ProductCard/ToppingModal flow, and the POST payload (`filling`
   field, `TABLE_HAS_ACTIVE_ORDER` branch) all describe the pre-2026-06-11 page. v3 visual
   corrects the *logic* but not the *layout/classes* — so neither file alone suffices.
   → Fix: port the v3 refresh into the canonical per-zone sections (or mark them superseded).
2. **`03_be/BE_TECH_SUMMARY.md §6` worked example is stale**: step 4a still shows
   `GetActiveOrderByTable → 409 TABLE_HAS_ACTIVE_ORDER`. Code-verified behavior (v3): the
   order is **always created**; response carries `table_busy: true` and FE shows an info toast.
   `02_spec/ERROR_SPEC.md` also still lists `TABLE_HAS_ACTIVE_ORDER` (409) + its FE redirect branch.
3. **The project's codebase-graph structure docs (FE + BE, dated 2026-05-28)** — both miss the
   TOP/CANH-era reality: cart store fields (`orderNote`, `setCanhQty`, `updateComboItem`,
   `tableName`), 14 menu components (only 6 listed), `CART_CONFIG = 'cart-config-v3'` (graph
   says `'cart-config'`), favourites store shape (`ids: string[]` vs actual `items` objects).
   → Run `/codebase-graph refresh`.
4. **No "dev redraw" step in `NEW_PAGE_GUIDE.md`** — the guide jumps wireframe → code with no
   artifact where the developer states *how* they'll build it and where they deviate.
   → `DEV_PLAN.md` here is the proposed template (now referenced from the guide, Phase 2b).

## 3 · Deviations in this reference build vs production code

Target was **spec-exact as-built**, so deviations are deliberately minimal:

| File | Deviation | Reason |
|---|---|---|
| all | one-line `P-SYSTEST reference build` header comment | prevent confusion with production files |
| `fe/store/_auth-stub.ts` · `fe/lib/api-client-stub.ts` | auth store + axios client are stubs with the production contract documented in the header | features/auth and the interceptor chain are outside the menu slice |
| `fe/page.tsx` | error/empty branches inline plain markup instead of importing shared `<Button>`/`<EmptyState>` | shared atoms are outside the slice; classes match the design tokens |
| `be/repository/*` | sqlc call bodies sketched (`-- name:` queries named, bodies return `errSandbox`) | sandbox has no generated `internal/db` package to compile against |
| everything else | FE files mirror production behavior 1:1 (cart ids, classes, store contracts, payload rules) | that was the AC |

Known production quirks **kept on purpose** (they are the as-built spec):
- `products-all` fetched only to enrich combos client-side (IMP-2, open)
- Pattern B full-client load → flash on QR landing (IMP-3, open)
- `orderNote` persists while `items` don't (IMP-6, open)
- custom −/+ steppers instead of shared `<QuantityStepper>` (shared-index drift)

## 4 · Doc drift found incidentally (not blocking, worth fixing)

- The project task list's "Critical Rules": rows "Combo header price = 0 … `filling` on
  sub-items" and "1 table 1 active order — check before INSERT" predate migration 017 +
  the table_busy contract.
- `ToppingModal.tsx` is imported by nothing (v3 confirms) — dead file, safe to delete in a
  cleanup task.
- `docs/system/04_fe/FE_CODE_SUMMARY.md` not audited here — likely shares the graph staleness.
