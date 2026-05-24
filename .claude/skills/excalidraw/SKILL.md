---
description: Generate an Excalidraw wireframe file for a FE page. Usage: /excalidraw <page-name>. Three-phase flow: Phase 1 plans zones and layout, Phase 2 draws the main page, Phase 3 draws modals. User must approve the plan before drawing begins.
---

You are generating an Excalidraw wireframe file for the BanhCuon restaurant project.

The argument passed to this skill is the page name: **$ARGUMENTS**

---

## PHASE 1 — Plan (always run first, always wait for approval)

### 1a — Gather zone information

Check in order (stop at first hit):
1. Is there a zone table or layout description in the current conversation? → use it directly.
2. Does `docs/fe/wireframes/$ARGUMENTS.md` exist? → read it for zones.
3. Does a relevant spec file mention the page? → read that spec's UI section.
4. If none found → STOP and ask the user to provide the zone table before continuing.

From the zone source, extract:
- Page title and route
- Each zone: name, label, data source, interactions, conditional? (yes/no)
- Any modals the page needs

### 1b — Output a layout plan (text only, no file written yet)

Print the plan in this format:

```
📋 LAYOUT PLAN — [Page Name]
Route: /...
Device: desktop | mobile

Zones (main page):
  ZoneA — [Name]: [one-line description] | data: [source]
  ZoneB — [Name]: ...
  ...

Modals (drawn in Phase 3):
  Modal 1 — [Name]: [trigger + one-line description]
  ...

Approximate canvas: [W]×[H]px
```

### 1c — STOP and wait for approval

After printing the plan, write:

> **Waiting for approval.** Reply "ok" (or adjust the zones) before I draw. Once approved I will run Phase 2.

Do NOT proceed to Phase 2 until the user explicitly approves.

---

## PHASE 2 — Draw the main page

Only begin after the user approves the Phase 1 plan.

### Style constants
```
strokeColor (default text/border): #1e293b
backgroundColor zones:            #f8fafc (neutral) | #fff7ed (orange tint) | #eef2ff (indigo tint)
accent / primary:                  #f97316  (orange-500)
accent text on orange:             #c2410c  (orange-700)
button green:  stroke #16a34a  bg #dcfce7   text #166534
button red:    stroke #dc2626  bg #fee2e2   text #dc2626
badge green:   stroke #16a34a  bg #f0fdf4   text #166534
badge yellow:  stroke #ca8a04  bg #fefce8   text #92400e
badge red:     stroke #dc2626  bg #fee2e2   text #dc2626
badge gray:    stroke #64748b  bg #f1f5f9   text #475569
roughness:     1
fontFamily:    2   (use for ALL text elements)
fontSize:      page-title 20 · section-label 14 · body 12 · note 11 · small 10
strokeWidth:   2 for zone borders · 1 for inner elements
roundness:     {"type":3} for cards/badges/buttons · null for zone containers
```

### Layout rules — DESKTOP (admin pages)
- Canvas width: 1200px, left margin x=20
- Sidebar (if present): 220px wide, full height
- Main content area: starts at x=240, width=940px
- Each zone is a rectangle + a text label above it
- Zone label format: `"── Zone X — ZoneName ──"` as a text element just above the zone rect
- Stack zones top→bottom with 16px gap between
- Table rows: 40px height each; header row: 44px with bg `#f1f5f9`
- KPI metric cards: 220×90px, 4-up in a row with 16px gaps
- Conditional zones: mark with `"(if ...)"` in label
- Loading skeleton: add a separate frame to the right (+1300px x offset), same zones but rectangles filled with `#e2e8f0` and no text

### Layout rules — MOBILE (customer-facing pages)
- Canvas width: 420px, element width 390px, left margin x=15
- Stack zones top→bottom with 12px gap between
- Sticky footer zone: mark with `"(sticky bottom)"` in label
- CTA button: full-width orange rect with white text

### JSON skeleton
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

### Admin page header (always include for admin pages)
- Dark top bar: y=0, height=56, width=1200, bg `#1e293b`
- Logo/brand text left, nav links center, user avatar right
- Breadcrumb bar below: y=56, height=36, bg `#f1f5f9`, text `"Admin > Section > Page"`

### Write the file

Output the complete file at `docs/fe/wireframes/$ARGUMENTS.excalidraw`.

Root JSON structure:
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

After writing, print:
```
✅ Phase 2 done: docs/fe/wireframes/$ARGUMENTS.excalidraw
   Zones drawn: [list]
   Ready for Phase 3 — modals. Reply "draw modals" when ready.
```

---

## PHASE 3 — Draw modals

Only begin after the user says "draw modals" (or equivalent).

Each modal identified in the Phase 1 plan gets its own frame on the canvas, placed to the right of the main page (+1400px x offset for desktop, +500px for mobile).

### Modal style rules
- Modal overlay: semi-transparent dark rect (bg `#1e293b`, opacity 40), full canvas width/height
- Modal card: white rect, width 560px (desktop) / 390px (mobile), rounded (`{"type":3}`), shadow via strokeWidth 2
- Modal header: bg `#f8fafc`, height 56px, title left, ✕ close button right
- Modal body: padding 24px, form fields stacked 16px apart
- Modal footer: border-top, 56px height, right-aligned Cancel + Submit buttons
- Form field: label text above (fontSize 12, color `#64748b`) + input rect (height 40px, radius `{"type":3}`, stroke `#cbd5e1`)
- Required field: add `"*"` in red after label

Each modal is a self-contained frame in the elements array.

After writing modals into the same `.excalidraw` file, print:
```
✅ Phase 3 done — modals added to docs/fe/wireframes/$ARGUMENTS.excalidraw
   Modals drawn: [list]
   Open in VS Code with the Excalidraw extension, or drag into excalidraw.com
```

Do NOT generate a markdown summary of the zones — the file is the output.
