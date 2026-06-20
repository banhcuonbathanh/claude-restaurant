---
name: comparison-doc
description: Generate (or refresh) the 3-file Doc-vs-Code comparison set for one FE page — a deep 5-area audit of the page's doc-set against the real running code. Produces COMPARISON_DOC_VS_CODE_DETAILED.md (EN), COMPARISON_DOC_VS_CODE_DETAILED_VI.md (VI mirror), and COMPARISON_VISUAL_MOCKUP_VI.md (per-zone ①doc ②code ③fix + screenshots + feedback). Read-only audit — never edits app code or the page doc-set. Spawns as many subagents as needed (one per audit area / zone) to finish in one session, then rolls every finding up into COMPARISON_TRACKER.md. Usage: /comparison-doc <page-folder-name>. Model: docs/system/08_pages/customer/customer_menu/ (all 3 files).
---

Generate (or refresh) the **3-file Doc-vs-Code comparison set** for one FE page so the owner and you
share one honest, code-traced picture of **where the page's documentation has drifted from the
running code**. This is a **read-only audit**: it compares, it does not fix — it never edits app code
and never edits the page's own doc-set (`<page>.md`, `_be.md`, dataflow files, etc.). Its only writes
are the 3 comparison files and the shared `COMPARISON_TRACKER.md`.

The argument is: $ARGUMENTS — a page identifier: a folder name under `docs/system/08_pages/`
(e.g. `customer_menu`, `staff_kds`, `admin_overview`) or a route (e.g. `/menu`, `/pos`).

**The canonical output to copy the shape from** — the gold-standard set in
`docs/system/08_pages/customer/customer_menu/`:
- `COMPARISON_DOC_VS_CODE_DETAILED.md` — the EN deep audit (5 areas)
- `COMPARISON_DOC_VS_CODE_DETAILED_VI.md` — its exact Vietnamese mirror
- `COMPARISON_VISUAL_MOCKUP_VI.md` — the per-zone visual mockup (①②③ + 📷 + 💬)

**The 3 files this skill produces** (all land in the page's own folder
`docs/system/08_pages/<category>/<page>/`):

| # | File | Language | What it is | Built by |
|---|---|---|---|---|
| 1 | `COMPARISON_DOC_VS_CODE_DETAILED.md` | EN | 5-area audit: exec summary + 🔴 headlines + dead-code list + per-area tables + consolidated action list | **This session (anchor), fanned out via area agents** |
| 2 | `COMPARISON_DOC_VS_CODE_DETAILED_VI.md` | VI | exact structure-for-structure Vietnamese mirror of #1 | one translation agent |
| 3 | `COMPARISON_VISUAL_MOCKUP_VI.md` | VI | per-zone ① doc đang vẽ · ② code render thật (ASCII) · ③ đề xuất sửa + 📷 screenshot + 💬 feedback | this session / one agent per zone |

**Golden rule — code is the source of truth.** Every "Code reality" cell is a claim about the running
FE/Go code on the current branch. **Read the source, do not recall it.** Cite `file:line` for every
claim. If a fact cannot be confirmed from a file, write `❓ UNVERIFIED` — an honest gap beats a
confident lie. When the doc-set and the code disagree, **the code wins** and that disagreement IS the
finding: record it, never "resolve" it by trusting the doc.

**Read-only — this skill audits, it does not fix.** It must NOT touch app code, and it must NOT edit
the page's doc-set to make the drift go away. The whole point is to *surface* drift for the owner. Doc
fixes and code fixes are separate, ALIGNed tasks (CLAUDE.md MASTER-first) — this skill only writes the
3 comparison files + the tracker, and ends by *recommending* the top actions.

**Tracker + findings.** Every run produces **findings** (severity-tagged 🔴/🟡/🟢 rows: a doc claim,
the code reality with `file:line`, and a suggested action). Every finding rolls up into
`docs/system/08_pages/COMPARISON_TRACKER.md` (Step 7) — the single index of which pages have a
comparison set, when it was last run, and the headline drift each surfaced. **No finding may exist
only inside one comparison file** — the TRACKER must mention every 🔴 and every cross-page concern.

**Finish in one session — fan out with subagents.** A page has many components and several audit axes;
auditing them serially blows the session budget. So **spawn as many subagents as you need to finish in
a single session** — the rule of thumb is **one agent per independent audit area (Step 2) and, when a
page has many zones, one agent per zone for the visual mockup (Step 6)**. You (the Opus orchestrator)
stay the single writer of the EN anchor and the TRACKER; agents do the read-heavy doc-vs-code tracing
and report back with `file:line`-cited findings, which you stitch together and **hand-verify** before
writing.

---

## Parallel Execution — Spawn Subagents

The expensive part of this skill is comparing N doc sections against N code areas. That is
embarrassingly parallel. Fan it out so the whole set closes in one session.

**The pattern:**
1. **List the units of work** first — the audit areas (Step 1), then (if needed) the zones for the
   visual mockup. Each unit = one agent.
2. **Spawn one agent per unit, in parallel** (multiple `Agent` calls in a single response). Default
   model **Sonnet 4.6** (`model: "sonnet"`) — doc-vs-code tracing is normal work per
   `docs/MODEL_SELECTION.md`; keep this Opus session as the orchestrator.
3. **Give each agent a self-contained brief**: the exact doc file(s) and code file(s) to read, the
   branch, the audit axis, the table shape to return, and the rule *"read the source, do not recall
   it; cite `file:line` for every Code-reality cell; if you cannot pin a fact to a line, return
   `❓ UNVERIFIED`; a 🔴 means a hard contradiction — flag it but do NOT trust your own 🔴, the
   orchestrator re-verifies."* An agent starts cold — spell out every path.
4. **Collect every agent's report before you write.** The agent's final message is the tool result.
5. **You remain the only writer** of the EN anchor (`COMPARISON_DOC_VS_CODE_DETAILED.md`) and of
   `COMPARISON_TRACKER.md`. Never let two agents write the same file.

**Which agent type:** Step-2 audit agents and Step-6 zone agents are read-the-code-then-report —
prefer `general-purpose` (can grep + read widely) or `Explore` (read-only fan-out). The Step-5
translation agent WRITES one file — use `general-purpose`.

**When NOT to fan out:** don't spawn an agent to do one trivial thing. Fan out when there are **3+
audit areas** (there are 5 by default) or **4+ zones** in the visual mockup. A small page can be done
inline. The goal is finishing in one session, not maximizing agent count.

---

## Step 0 — Read the tracker, resolve the page, gather its doc-set + code

0. **Read** `docs/system/08_pages/COMPARISON_TRACKER.md` (create it from the template in Step 7 if it
   does not exist yet). Find this page's row — a filled row means this is a **refresh** (note prior
   headline findings; re-verify they still hold). If absent, you'll add the row in Step 7.
1. **Resolve the page folder.** From `$ARGUMENTS`, find the page folder under
   `docs/system/08_pages/<category>/<page>/` (use `PAGES_INDEX.md` to map a route → folder). If you
   can't resolve it, STOP and ask the owner which page they mean.
2. **Read the page's doc-set in full** — every file that describes this page: `<page>.md` (Zones table
   = your map of what the doc *claims* each component looks like), `<page>_be.md`, and any
   `_crosscomponent_dataflow.md` / `_crosspage_dataflow.md` / `_loading.md` present. These are the
   "Doc says" side of every comparison.
3. **Locate the page's real code** — the "Code reality" side:
   - FE: `fe/src/app/.../<page>/page.tsx` + every component/hook/store it renders
     (`fe/src/features/<page>/components/*`, `fe/src/store/*`, `fe/src/lib/*`, `fe/src/hooks/*`,
     `fe/src/types/*`, `fe/src/lib/storage-keys.ts`).
   - BE (only the endpoints this page calls): `be/internal/handler|service/*`, sqlc queries.
4. **Note the branch** (`git branch --show-current`) — it goes in every file's provenance header.

If the page has no `page.tsx` yet (🔮 PLANNED) → STOP and tell the owner the comparison would be
speculative; offer a doc-only structural review clearly labelled `(planned, not yet coded)`.

## Step 1 — Define the audit areas (the units of work)

The default set is **5 areas** (mirror `customer_menu`'s detailed doc). Keep only the areas that apply
to this page:

| # | Area | Doc side | Code side |
|---|---|---|---|
| 1 | **Component visuals** | the Zones table + ASCII in `<page>.md` | each component's real render (`*.tsx`) |
| 2 | **Cross-component dataflow** | `_crosscomponent_dataflow.md` | the page's Zustand store(s), selectors, props |
| 3 | **Cross-page dataflow** | `_crosspage_dataflow.md` | persist whitelist, cache keys, SSE, route handoffs |
| 4 | **Loading behaviour** | `_loading.md` | query order, `enabled` gates, skeletons, error states |
| 5 | **FE⇄BE data model** | `_be.md` Object Model + flags | DTO serializers, FE types, nullability, payload builders |

Drop an area if the page genuinely has nothing in it (e.g. a static page with no BE calls → no area 5;
no shared store → no area 2). Also list the **zones** from `<page>.md` — you need them for Step 6.

## Step 2 — Fan out: one agent per audit area (the core)

> **Spawn one `general-purpose`/`Explore` agent per applicable area, all in one response**
> (`model: "sonnet"`). Each brief MUST be self-contained — the agent starts cold:
> - **The axis** (e.g. "Area 1 — Component visuals").
> - **The Doc side**: exact file + sections to read (e.g. `<page>.md` Zones table + the zone ASCII).
> - **The Code side**: exact files to trace (list the components / store / hooks for that axis).
> - **The branch.**
> - **Return shape**: a markdown table `Component/Topic | Doc says | Code reality (file:line) | Sev
>   (🔴/🟡/🟢) | Solution`, plus a short verdict line, plus a list of any **dead/unreachable code** it
>   noticed (zero-import components, unreachable modals).
> - **The non-negotiables**: "Code wins — trace from source on the current branch, do not recall;
>   cite `file:line` for every Code-reality cell; `❓ UNVERIFIED` for anything you can't pin to a line;
>   a 🔴 = a hard contradiction (wrong data source, missing call, dead flow) — flag it but expect the
>   orchestrator to re-verify; 🟡 = real but minor (copy, extra states); 🟢 = cosmetic/provenance."
> - **What to return**: the filled table + verdict + dead-code list.

Collect all area reports before writing. Keep each agent's `file:line` citations verbatim — do not
paraphrase a line number; if one looks off, re-open the file yourself.

## Step 3 — Hand-verify every 🔴 (do not skip)

A 🔴 finding becomes a headline and may imply a real product bug — so **never trust an agent's 🔴
blind.** For each 🔴 an agent returned, **re-open the cited file yourself** (Read/Grep) and confirm the
contradiction with your own eyes. If it doesn't hold, downgrade or drop it. If a claim can't be pinned
to a line at all → `❓ UNVERIFIED`. The model file's headline findings (MenuHeader source,
TableConfirmModal handoff, dead ToppingModal, OrderSummary richness) were all hand-verified with greps
cited inline — match that bar.

## Step 4 — Write the EN anchor: `COMPARISON_DOC_VS_CODE_DETAILED.md`

Path: `docs/system/08_pages/<category>/<page>/COMPARISON_DOC_VS_CODE_DETAILED.md`. Mirror the model's
section order exactly (omit a section only if its area doesn't apply):

1. **H1 + Scope blockquote** — one-line scope; the 5 axes; "Read-only — no code or docs changed";
   "Produced by N parallel Sonnet agents; 🔴 items re-verified by hand"; any exclusions; the date.
2. **`## Executive Summary`** — the per-area verdict table: `Area | Verdict | 🔴 | 🟡 | 🟢`.
3. **🔴 RAISE-MY-VOICE headline findings** — a numbered list of the hand-verified 🔴s, each stating the
   wrong doc claim, the code reality with `file:line`, and why it matters (flag real product bugs).
4. **Dead/unreachable components found** — bullets for zero-import / unreachable code the audit caught.
5. **One `## Area N — <name>` section per area** — a verdict line + the findings table
   (`… | Doc says | Code reality (file:line) | Sev | Solution`), then a "Verified-matching:" line for
   the parts that were correct.
6. **`## Consolidated Action List (priority order)`** — `# | Type (🔴 Code bug / 🔴 Doc fix / 🟡 … /
   🟢 …) | Action | Target file`, ending with the CLAUDE.md note: "doc fixes are one task; each code
   change must be registered in `MASTER_TASK.md` before any file is touched."

Use `---` separators between sections, matching the model.

## Step 5 — VI mirror: `COMPARISON_DOC_VS_CODE_DETAILED_VI.md` (one translation agent)

Spawn **one `general-purpose` agent** (`model: "sonnet"`) to produce the Vietnamese mirror. Brief:
- **Source**: the EN file you just wrote (give the full path).
- **Output**: `…/<page>/COMPARISON_DOC_VS_CODE_DETAILED_VI.md`.
- **Rule**: "Translate **structure-for-structure** — same headings, same tables, same row order, same
  severity tags, same `file:line`. Translate prose to natural Vietnamese; **keep all code identifiers,
  file paths, `file:line`, component names, and field names in English/verbatim**. Do not re-audit, do
  not add or drop findings — this is a faithful mirror. Model the tone on
  `customer_menu/COMPARISON_DOC_VS_CODE_DETAILED_VI.md` (e.g. 'Tóm Tắt Điều Hành', 'NHỮNG PHÁT HIỆN
  PHẢI LÊN TIẾNG', 'Tài liệu nói / Code thực tế / Mức / Giải pháp')."
- **Return**: the path written + confirmation the section/row count matches the EN file.

Verify the returned VI file has the same number of area sections and findings as the EN anchor.

## Step 6 — VI visual mockup: `COMPARISON_VISUAL_MOCKUP_VI.md`

This is the per-zone "drawing" comparison. For **each zone** worth showing (the ones with real visual
drift — typically the 🔴/🟡 components from Area 1), produce a block in the model's shape. With **4+
zones, fan out one agent per zone**; otherwise do it inline.

Each zone block (copy `customer_menu/COMPARISON_VISUAL_MOCKUP_VI.md` exactly):
```
## 🔴 Zone <X> — <Component>
Nguồn code: `<Component>.tsx:<lines>`

### ① Doc đang vẽ (`<page>.md:<lines>`)
<the ASCII the doc currently draws>

### ② Code render THẬT
<ASCII of what the code actually renders, with ◀── annotations citing file:line and the real data source>

### ③ Đề xuất sửa doc
<corrected ASCII + a FLAG 🔴 line naming any real code bug behind the drift>

| 📷 Ảnh chụp thật | 💬 Feedback của bạn |
|---|---|
| ![<Component> thật](./screenshots/<zone>_real.png)<br>⚠ **Bằng chứng:** <what the screenshot proves> |  |
```
End the file with a **`## Tổng hợp việc cần làm`** table: `Zone | Sửa doc | Sửa code (đăng ký MASTER
trước)`.

**Header blockquote** must state the screenshot status. **Screenshots are optional and gated on the
stack being up:**
- If `docker compose` + Playwright are available, capture real screenshots into
  `./screenshots/<zone>_real.png` (model the spec on `e2e/tests/capture-menu-zones.spec.ts` —
  iPhone 390×844 viewport, real flow into the page). Header: `✅ ĐÃ CHỤP (<date>)` + how.
- If the stack is **not** up, write the ②/③ ASCII from the code anyway, leave the 📷 column as
  `⏳ chưa chụp — cần \`docker compose up -d --build fe\` + Playwright`, and set the header status to
  `⏳ CHƯA CHỤP`. Never block the file on screenshots; never invent a screenshot.

The 💬 feedback column is **always left empty** — it is the owner's to fill; you react to it next run.

## Step 7 — Roll every finding into `COMPARISON_TRACKER.md`

Path: `docs/system/08_pages/COMPARISON_TRACKER.md` (sibling of `BE_DOC_TRACKER.md`). If it doesn't
exist, create it with this shape:

```markdown
# Comparison Doc Tracker — Doc vs. Code

> One row per page that has a /comparison-doc set. Every 🔴 finding and every cross-page concern from
> a run MUST land here — no finding may live only inside a comparison file. Code wins; these are audits.

| Page | Last Run | Branch | 🔴 | 🟡 | 🟢 | Files | Headline drift / concerns |
|---|---|---|---|---|---|---|---|

## Cross-Page Concerns
<!-- findings that touch >1 page: shared store field, shared hook, shared endpoint, a bug root -->
```

Then:
1. **Upsert this page's row** — Last Run = today, the branch, the 🔴/🟡/🟢 counts, links to the 3
   files produced, and a **one-line headline-drift summary** (condense the Step-3 verified 🔴s, e.g.
   "MenuHeader reads settings.tableLabel not cart.tableName; 201 handoff omits setActiveOrderId;
   ToppingModal dead"). Mirror the density of an existing row.
2. **Add a Cross-Page Concerns bullet** for any finding that touches >1 page — a shared store field, a
   shared hook/SSE, a shared endpoint, a bug root — naming the pages + the shared `file:line` + whether
   it's a doc drift or a code bug. If a run extends an existing bullet, append to it (don't duplicate).
3. **Gate before reporting:** every Step-3 🔴 and every cross-page fact this run proved must appear in
   the TRACKER. If one lives only in a comparison file, add it here before closing.

> ⚠️ The TRACKER and the 3 comparison files are the ONLY files this skill writes. Do **not** edit the
> page's doc-set, README, PAGES_INDEX, or any app code — surfacing the drift is the deliverable; fixing
> it is a separate ALIGNed task.

## Step 8 — Report

Print a short summary:
```
COMPARISON DOC SET — <page>
───────────────────────────
Branch audited:  <branch>
Agents spawned:  <N>  (area <A> / zone <Z> / translate 1)  — or "none (done inline)"

Files written:
  1 COMPARISON_DOC_VS_CODE_DETAILED.md      <created | refreshed>
  2 COMPARISON_DOC_VS_CODE_DETAILED_VI.md   <created | refreshed>
  3 COMPARISON_VISUAL_MOCKUP_VI.md          <created | refreshed>  (screenshots: ✅ captured | ⏳ pending)

Findings:        🔴 <n>  🟡 <n>  🟢 <n>   (across <A> areas)
🔴 headlines (hand-verified):
  - <one line each, with file:line>
Dead/unreachable code:  <list or none>
❓ Unverified:   <n>  (list each: area → cell)

Tracker:  COMPARISON_TRACKER.md row updated → <page>  ·  cross-page bullets: <n or none>
```
List every 🔴 headline and every `❓ UNVERIFIED` cell. **If the audit surfaced a real code bug** (not
just stale docs), end by offering to register the top one in `MASTER_TASK.md` — do NOT start the fix
unprompted (separate ALIGNed task per CLAUDE.md).
