---
description: Generate a multi-panel Excalidraw "doc knowledge map" for a page, modelled on customer_menu.excalidraw — NOT a single mockup but a 14-panel map of the page's whole doc-set (wireframe + dataflow + BE + object model + loading + scenario + live-state + lifecycle + DB rows + realtime + failure map). Usage: /excalidraw-map <page-folder-name>. Reads the page's 6-file doc-set, plans the panels (approval gate), then builds the .excalidraw by running Python panel scripts that import the shared excalib helper library. Model output: docs/system/08_pages/customer/customer_menu/customer_menu.excalidraw.
---

You are generating a **multi-panel Excalidraw knowledge map** for one FE page of
the BanhCuon project — the same treatment as
`docs/system/08_pages/customer/customer_menu/customer_menu.excalidraw`.

> Note: the reference `customer_menu.excalidraw` was hand-built with 15 panels
> (it includes a "Lens Mockups" panel). This skill no longer emits that panel —
> the catalog is now 14 panels and panel numbering is contiguous 1–14.

The argument is the page folder name or path: **$ARGUMENTS**

> This is NOT the `/excalidraw` skill (that draws one page mockup). This skill
> draws the page's ENTIRE doc-set as a panel map: wireframe + every dataflow +
> BE + object model + loading + scenario + the dark deep-dive panels.
> (No "Lens Mockups" panel — that one is intentionally dropped.)

Read `PANEL_CATALOG.md` (in this skill folder) before planning — it lists the 14
canonical panels and which doc each one sources.

---

## PHASE 0 — Resolve the page folder & read its docs

1. Resolve `$ARGUMENTS` to a folder under `docs/system/08_pages/`. Accept either a
   bare name (`order_tracking`) or a full path. If ambiguous or not found → list
   the candidate folders and ask which one.
2. Read the page's doc-set (the gold-standard 6-file set, produced by
   `/page-doc-set`):
   - `<page>.md` · `<page>_be.md` · `<page>_crosscomponent_dataflow.md` ·
     `<page>_crosspage_dataflow.md` · `<page>_loading.md` · `SCENARIO_<PAGE>.md`
3. 🔴 STOP if the doc-set is missing or thin. The map is only as good as the docs.
   Tell the owner which files are missing and recommend running `/page-doc-set
   <page>` first. Do not invent content to fill gaps.

---

## PHASE 1 — Plan the panels (always; wait for approval)

From the docs, decide WHICH panels from `PANEL_CATALOG.md` this page actually
supports (a page rarely needs all 14 — e.g. a read-only page may skip panels
9/10/14). For each chosen panel, write one line: source doc + what it will show,
specialized to THIS page's real content (zone names, endpoints, store shape,
scenario beats — taken from the docs, not generic).

Print the plan exactly like the model did (`excalidraw.md` in the customer_menu
folder is the reference shape):

```
📋 LAYOUT PLAN — <Page Name> (<route>) — full doc knowledge map
Output: docs/system/08_pages/<area>/<page>/<page>.excalidraw
Canvas: ~<W>×<H>px · panels left→right, top→bottom · light 1–8, dark 9–N

PANEL 1 — Page Wireframe — from <page>.md
  <zone list with data sources, taken from the doc>
PANEL 2 — Cross-Component Dataflow — from <page>_crosscomponent_dataflow.md
  <the actual hub + selectors + flow steps>
...
PANEL N — <Title> — from <doc>
  <specifics>

Skipped: <panels not applicable + why>
```

Then write:

> **Waiting for approval.** Reply "ok" (or adjust the panels) before I build.

Do NOT write any file until the owner approves.

---

## PHASE 2 — Build the panels (one Python script per panel/group)

Only after approval. Output path: `<page-folder>/<page>.excalidraw`.

**Checkpoint first** (per CLAUDE.md scope guardrail):
`git add -A && git commit -m "checkpoint: before <page> excalidraw-map"`.

### Mechanism — reuse the shared library, do NOT re-declare helpers
The customer_menu build used 4 hand-written scripts that each re-declared
`rect()`/`text()`. We extracted those into `excalib.py` in this skill folder.
Every panel script imports it:

```python
#!/usr/bin/env python3
"""PANEL N for <page>.excalidraw — <what> — sourced from <doc(s)> / <code files>."""
import sys; sys.path.insert(0, ".claude/skills/excalidraw-map")
import excalib as ex

FP = "docs/system/08_pages/<area>/<page>/<page>.excalidraw"
ex.reset("p<N>")          # unique id prefix per panel → ids never collide
E = []

X, Y = 40, 40             # this panel's coordinate band (non-overlapping)
E += ex.panel_header(X, Y, "PANEL N · Title", "one-line subtitle from the doc")
# ... build with ex.rect / ex.text / ex.arrow / ex.card / ex.badge ...

ex.append(FP, E)          # FIRST panel uses ex.save(FP, E); all others ex.append
print(f"PANEL N: added {len(E)} elements")
```

Rules:
- **First panel** → `ex.save(FP, E)` (creates the doc). **Every later panel** →
  `ex.append(FP, E)` (APPEND-ONLY, deletes nothing). This lets you build & verify
  one panel at a time and re-run safely.
- **`ex.reset("pN")`** at the top of each script — gives that panel a unique id
  prefix so re-running or combining never produces duplicate ids.
- **Coordinate bands:** give each panel its own non-overlapping rectangle of
  canvas (≥200px gutters). Light panels 1–8 across the top rows; dark panels 9–N
  stacked below. Track the running `y` like the model scripts did.
- **Palette:** use `excalib` constants (`ex.CARD_BG`, `ex.C_ZUS`, `ex.C_TAN`,
  `ex.C_ORD`, …). Keep the role→colour mapping consistent across panels
  (client=amber, server cache=green/cyan, BE/order=orange/green, cross-page=violet,
  failure=red).
- **Fonts:** `ff=2` for labels/prose, `ff=3` (mono) for code shapes, JSON
  examples, SQL rows.
- **Content is traced, never invented.** Pull zone names, endpoints, store fields,
  scenario beats, SQL columns straight from the doc-set or source. Cite source
  files in each script's docstring.

### Where to put the scripts
Write them to `scripts/excalidraw/<page>/panel_NN.py` (create the dir). Keep them —
they are the reproducible build and let the owner re-render after a doc change.
Run each with `python3 scripts/excalidraw/<page>/panel_NN.py` from the repo root.

### Build loop
Build panels in catalog order. After each script runs, it prints the element
count and running total — sanity-check it's growing and the script exited 0. If a
panel needs facts not in the docs, STOP and ask rather than guessing.

---

## PHASE 3 — Verify & report

1. Validate the JSON and element count:
   `python3 -c "import json;d=json.load(open('<FP>'));print(len(d['elements']),'elements')"`
2. If the Excalidraw VS Code extension / MCP is available, open or screenshot to
   confirm panels don't overlap. Otherwise tell the owner to open it in VS Code
   (Excalidraw extension) or drag into excalidraw.com.
3. **Update `TRACKER.md`** (this skill folder): flip this page's row to ✅, bump
   the per-area + total counts, and add any doc-vs-code drift / skipped-panel
   notes to that page's Findings cell and the Findings log.
4. Print:

```
✅ <page>.excalidraw built — <N> panels, <M> elements
   Panels: <list>
   Scripts: scripts/excalidraw/<page>/panel_*.py  (re-run to re-render)
   Skipped panels: <list + why>
```

Do NOT write a markdown summary of the panels — the .excalidraw IS the output.
(The per-page layout plan you printed in Phase 1 may be saved as
`<page-folder>/excalidraw.md` if the owner wants it, mirroring customer_menu.)
