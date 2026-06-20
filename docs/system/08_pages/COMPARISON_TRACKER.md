# Comparison Doc Tracker — Doc vs. Code

> One row per page that has a `/comparison-doc` set. Every 🔴 finding and every cross-page concern from
> a run MUST land here — no finding may live only inside a comparison file. **Code wins**; these are
> read-only audits, not fixes. The set per page = 3 files in the page folder:
> `COMPARISON_DOC_VS_CODE_DETAILED.md` (EN) · `..._DETAILED_VI.md` (VI mirror) ·
> `COMPARISON_VISUAL_MOCKUP_VI.md` (per-zone ①②③ + 📷 + 💬).
>
> Built by `/comparison-doc <page-folder-name>` — see `.claude/skills/comparison-doc/SKILL.md`.

| Page | Last Run | Branch | 🔴 | 🟡 | 🟢 | Files | Headline drift / concerns |
|---|---|---|---|---|---|---|---|
| customer_menu | 2026-06-20 | experience_claude.md_system_1_test_iphon2_change_code | 7 | 13 | 10 | [EN](customer/customer_menu/COMPARISON_DOC_VS_CODE_DETAILED.md) · [VI](customer/customer_menu/COMPARISON_DOC_VS_CODE_DETAILED_VI.md) · [Mockup](customer/customer_menu/COMPARISON_VISUAL_MOCKUP_VI.md) | `MenuHeader` reads `useSettingsStore().tableLabel`, not `useCartStore.tableName` → table label blank after QR scan (real code bug); `TableConfirmModal` 201 handoff does **not** call `setActiveOrderId` (doc wrong); `ToppingModal` is dead code (0 imports) — nhân picked via inline pills; `ComboModal` rendered but unreachable; `OrderSummary` far richer than the I-zone ASCII (canh steppers + dish table + save-state note) |

## Cross-Page Concerns
<!-- findings that touch >1 page: a shared store field, a shared hook/SSE, a shared endpoint, or a bug root.
     Name the pages + the shared file:line + whether it's a doc drift or a code bug + where it's logged. -->

- _(none yet — add a bullet when a run surfaces drift that touches more than one page.)_
