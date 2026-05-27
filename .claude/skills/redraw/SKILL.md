---
description: Redraw an existing page wireframe as a v2 .excalidraw, incorporating UX/UI recommendations from its recomment/recommend.md. Usage: /redraw <page-folder-path>. Example: /redraw client_menu_page or /redraw admin_main/admin_main_product. Two-phase flow: Phase 1 audits the old drawing and plans zone-level changes, Phase 2 draws the improved v2 file.
---

You are generating a v2 Excalidraw wireframe that improves an existing v1 drawing.

The argument passed to this skill is the page folder path: **$ARGUMENTS**

The base wireframe directory is: `docs/fe/wireframes/`
Full page folder: `docs/fe/wireframes/$ARGUMENTS/`

---

## PHASE 1 — Audit & Change Plan (always run first, always wait for approval)

### 1a — Locate the source files

Run these steps in order:

1. **Find the existing excalidraw file** in `docs/fe/wireframes/$ARGUMENTS/` (top-level only, not subfolders).
   - List files in that folder. Pick the `.excalidraw` file. If multiple exist, pick the one with the highest version number or the most recent name.
   - Read the first 200 lines of it to understand the canvas size, zones present, and element IDs used.

2. **Find the recommendation file** at `docs/fe/wireframes/$ARGUMENTS/recomment/recommend.md`.
   - If it does not exist → STOP. Print: `🔴 STOP: No recomment/recommend.md found in docs/fe/wireframes/$ARGUMENTS/recomment/. Create that file first.`
   - If it exists → read it fully.

3. **Find the wireframe spec** (optional, read if exists):
   - Look for a `*_wireframe_v1.md` or `*_spec.md` in `docs/fe/wireframes/$ARGUMENTS/`.
   - If found, read it for zone labels and layout intent.

### 1b — Extract change list from recommend.md

From the recommendation file, produce a structured list of changes. For each recommendation:

```
Change N — [Zone or Element]: [one-line summary]
  Old: [what the v1 does / shows]
  New: [what v2 should do / show]
  Type: layout | interaction | visual | content | accessibility
```

Group changes by severity:
- **Must apply** — directly solvable in a static wireframe (layout changes, element reorganization, label fixes, added/removed zones)
- **Skip (needs prototype)** — things only testable in code (scroll performance, animation, A/B test)

Print the full change list.

### 1c — Output the v2 layout plan

After the change list, print a plan in this format:

```
📋 V2 LAYOUT PLAN — [Page Name]
Source file: docs/fe/wireframes/$ARGUMENTS/<original>.excalidraw
Output file: docs/fe/wireframes/$ARGUMENTS/recomment/<name>_ver2.excalidraw
Device: desktop | mobile  (inherit from v1)

Zones (what changes vs v1):
  ZoneA — [Name]: [UNCHANGED | MODIFIED: what changed | NEW: added | REMOVED]
  ZoneB — [Name]: ...
  ...

Applying N of M recommendations (skipping K prototype-only items).
```

### 1d — STOP and wait for approval

After printing the plan, write:

> **Waiting for approval.** Reply "ok" (or adjust the plan) before I draw v2. Once approved I will run Phase 2.

Do NOT proceed to Phase 2 until the user explicitly approves.

---

## PHASE 2 — Draw v2

Only begin after the user approves the Phase 1 plan.

### Style constants (inherit from v1, apply consistently)

```
strokeColor (default text/border): #1e293b
backgroundColor zones:             #f8fafc (neutral) | #fff7ed (orange tint) | #eef2ff (indigo tint)
accent / primary:                  #f97316  (orange-500)
accent text on orange:             #c2410c  (orange-700)
button green:  stroke #16a34a  bg #dcfce7   text #166534
button red:    stroke #dc2626  bg #fee2e2   text #dc2626
badge green:   stroke #16a34a  bg #f0fdf4   text #166534
badge yellow:  stroke #ca8a04  bg #fefce8   text #92400e
badge red:     stroke #dc2626  bg #fee2e2   text #dc2626
badge gray:    stroke #64748b  bg #f1f5f9   text #475569
roughness:     1
fontFamily:    2
fontSize:      page-title 20 · section-label 14 · body 12 · note 11 · small 10
strokeWidth:   2 for zone borders · 1 for inner elements
roundness:     {"type":3} for cards/badges/buttons · null for zone containers
```

### Layout rules — MOBILE (customer-facing pages)

- Canvas width: 420px, element width 390px, left margin x=15
- Stack zones top→bottom with 12px gap between
- Sticky footer zone: mark with `"(sticky bottom)"` in label
- CTA button: full-width orange rect with white text

### Layout rules — DESKTOP (admin pages)

- Canvas width: 1200px, left margin x=20
- Sidebar (if present): 220px wide
- Main content area: starts at x=240, width=940px
- Table rows: 40px height; header row: 44px with bg `#f1f5f9`
- KPI cards: 220×90px, 4-up row with 16px gaps

### JSON element skeleton

Every element needs these fields (do not omit any):

```json
{
  "id": "unique-string",
  "type": "rectangle" | "text",
  "x": 0, "y": 0, "width": 0, "height": 0,
  "angle": 0,
  "strokeColor": "#1e293b",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "groupIds": [],
  "roundness": null,
  "seed": <unique integer>,
  "version": 2,
  "versionNonce": <same as seed>,
  "isDeleted": false,
  "boundElements": [],
  "updated": 1746316800000,
  "index": "a0",
  "link": null,
  "locked": false,
  "frameId": null
}
```

Text elements also need: `"text"`, `"fontSize"`, `"fontFamily": 2`, `"textAlign": "left"`, `"verticalAlign": "top"`, `"containerId": null`, `"originalText"` (same as text), `"lineHeight": 1.35`, `"autoResize": true`

Increment `"index"` alphabetically: `"a0"`, `"a1"`, ..., `"a9"`, `"aA"`, `"aB"`, ... `"aZ"`, `"aa"`, `"ab"` ...

Use fresh `id` strings (e.g. `"v2-zone-a"`, `"v2-nav-bg"`) — do not reuse IDs from the v1 file.

### V2 annotation rules

For every zone that changed from v1:
- Add a small annotation badge at the top-right corner of the zone: orange rect (`bg #fff7ed`, stroke `#f97316`), text `"v2: [short reason]"`, fontSize 10.
- For brand-new zones: badge text `"v2: NEW"`
- For removed zones: do not draw them; instead add a text note on the canvas `"── [ZoneName] REMOVED (see recommend.md) ──"` in gray (`#94a3b8`).

### V2 change markers

At the bottom of the canvas (below all zones), add a "Change Log" section:
- Section label: `"── V2 Changes Applied ──"` (dark text, fontSize 14)
- One text element per applied change: `"✓ [Change N]: [one-line summary]"` (fontSize 11, color `#166534`)
- One text element per skipped change: `"⊘ [Change N]: [one-line summary] — skipped (prototype-only)"` (fontSize 11, color `#94a3b8`)

### Root JSON structure

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [ ... ],
  "appState": {
    "gridSize": null,
    "viewBackgroundColor": "#ffffff",
    "theme": "light"
  },
  "files": {}
}
```

### Output path

Derive the v2 filename from the source excalidraw filename:
- If source is `menu_ver1_done.excalidraw` → output `menu_ver2.excalidraw`
- If source is `categories.excalidraw` → output `categories_ver2.excalidraw`
- If source already has `ver2` → output `ver3.excalidraw` (increment)
- General rule: strip `_done` suffix, replace `ver1` with `ver2`, or append `_ver2` before `.excalidraw`

Write the file to: `docs/fe/wireframes/$ARGUMENTS/recomment/<derived-name>.excalidraw`

After writing the .excalidraw file, **update the progress tracker**:

1. Open `docs/fe/wireframes/shared/_INDEX_REDRAW_PROGRESS.md`.
2. Find the row where the "Page Folder" column matches `$ARGUMENTS`.
3. Change `⬜` → `✅` in the Status column.
4. Fill in today's date (YYYY-MM-DD) in the Completed column.
5. If the V1 Source or V2 Output columns still say `_(find on run)_`, replace them with the actual filenames discovered in Phase 1.

Then print:

```
✅ V2 done: docs/fe/wireframes/$ARGUMENTS/recomment/<derived-name>.excalidraw
   Zones drawn: [list]
   Changes applied: N of M recommendations
   Progress tracker updated: docs/fe/wireframes/shared/_INDEX_REDRAW_PROGRESS.md
   Open in VS Code with the Excalidraw extension, or drag into excalidraw.com
```

Do NOT generate a markdown summary or any other files beyond the .excalidraw and the tracker update.
