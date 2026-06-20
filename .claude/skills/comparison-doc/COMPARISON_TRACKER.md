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

---

## Pages — Copy-Paste Queue

> Every page folder under `08_pages/`. Copy the command, paste it, run. Mark **Status** ✅ when its
> 3-file set is done (and add its row to the table above). 33 pages · 1 done · 32 to go.

### customer/ (13)

| Status | Page | Command |
|---|---|---|
| ✅ | customer_menu | `/comparison-doc customer_menu` |
| ⬜ | customer_welcome | `/comparison-doc customer_welcome` |
| ⬜ | customer_table_qr | `/comparison-doc customer_table_qr` |
| ⬜ | customer_introduction | `/comparison-doc customer_introduction` |
| ⬜ | customer_product_detail | `/comparison-doc customer_product_detail` |
| ⬜ | customer_combo_detail | `/comparison-doc customer_combo_detail` |
| ⬜ | customer_favourites | `/comparison-doc customer_favourites` |
| ⬜ | customer_checkout | `/comparison-doc customer_checkout` |
| ⬜ | customer_order_list | `/comparison-doc customer_order_list` |
| ⬜ | customer_order_detail | `/comparison-doc customer_order_detail` |
| ⬜ | customer_tracking | `/comparison-doc customer_tracking` |
| ⬜ | customer_profile | `/comparison-doc customer_profile` |
| ⬜ | customer_settings | `/comparison-doc customer_settings` |

### staff/ (5)

| Status | Page | Command |
|---|---|---|
| ⬜ | staff_login | `/comparison-doc staff_login` |
| ⬜ | staff_register | `/comparison-doc staff_register` |
| ⬜ | staff_kds | `/comparison-doc staff_kds` |
| ⬜ | staff_pos | `/comparison-doc staff_pos` |
| ⬜ | staff_cashier_payment | `/comparison-doc staff_cashier_payment` |

### admin/ (13)

| Status | Page | Command |
|---|---|---|
| ⬜ | admin_overview | `/comparison-doc admin_overview` |
| ⬜ | admin_summary | `/comparison-doc admin_summary` |
| ⬜ | admin_products | `/comparison-doc admin_products` |
| ⬜ | admin_categories | `/comparison-doc admin_categories` |
| ⬜ | admin_toppings | `/comparison-doc admin_toppings` |
| ⬜ | admin_combos | `/comparison-doc admin_combos` |
| ⬜ | admin_ingredients | `/comparison-doc admin_ingredients` |
| ⬜ | admin_storage | `/comparison-doc admin_storage` |
| ⬜ | admin_staff | `/comparison-doc admin_staff` |
| ⬜ | admin_task_board | `/comparison-doc admin_task_board` |
| ⬜ | admin_todo_list | `/comparison-doc admin_todo_list` |
| ⬜ | admin_training | `/comparison-doc admin_training` |
| ⬜ | admin_marketing | `/comparison-doc admin_marketing` |

### public/ (2)

| Status | Page | Command |
|---|---|---|
| ⬜ | public_landing | `/comparison-doc public_landing` |
| ⬜ | public_legal | `/comparison-doc public_legal` |

> **Run all in one go:** paste them in sequence, or batch via `/loop` —
> `/loop /comparison-doc <next ⬜ page>` and advance through the queue.
