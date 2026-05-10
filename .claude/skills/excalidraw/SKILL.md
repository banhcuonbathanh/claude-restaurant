---
description: Generate an Excalidraw wireframe file for a FE page. Usage: /excalidraw <page-name>. Reads the zone table from the spec or conversation, writes docs/fe/wireframes/<page-name>.excalidraw in the project's existing style.
---

You are generating an Excalidraw wireframe file for the BanhCuon restaurant project.

The argument passed to this skill is the page name: **$ARGUMENTS**

---

## Step 1 — Gather zone information

Check in order (stop at first hit):
1. Is there a zone table in the current conversation? → use it directly.
2. Does `docs/fe/wireframes/$ARGUMENTS.md` exist? → read it for zones.
3. Does a relevant spec file mention the page? → read that spec's UI section.
4. If none found → STOP and ask the user to provide the zone table before continuing.

From the zone source, extract:
- Page title and route
- Each zone: name, label, data source, interactions, conditional? (yes/no)

---

## Step 2 — Generate the Excalidraw JSON

Write `docs/fe/wireframes/$ARGUMENTS.excalidraw` using **this exact style** (match the existing project files):

### Style constants
```
strokeColor (default text/border): #1e293b
backgroundColor zones:            #f8fafc (neutral) | #fff7ed (orange tint) | #eef2ff (indigo tint)
accent / primary:                  #f97316  (orange-500)
accent text on orange:             #c2410c  (orange-700)
button green:  stroke #16a34a  bg #dcfce7   text #166534
button red:    stroke #dc2626  bg #fee2e2   text #dc2626
badge green:   stroke #16a34a  bg #f0fdf4   text #166534
roughness:     1
fontFamily:    2   (use for ALL text elements)
fontSize:      header 18 · zone-label 13 · body 12 · note 11 · small 10
strokeWidth:   2 for zone borders · 1 for inner elements
roundness:     {"type":3} for cards/badges/buttons · null for zone containers
```

### Layout rules
- Mobile-first: canvas width 420px, element width 390px, left margin x=15
- Each zone is a rectangle + a text label above it
- Zone label format: `"── Zone X — ZoneName ──"` as a text element just above the zone rect
- Stack zones top→bottom with 12px gap between
- Sticky footer zone: mark with `"(sticky bottom)"` in label
- Conditional zones: mark with `"(if ...)"` in label
- Loading skeleton: add a separate frame to the right (+500px x offset), same zones but rectangles filled with `#e2e8f0` and no text
- CTA button: full-width orange rect (`backgroundColor: "#f97316"`, `strokeColor: "#ea580c"`) with white text

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

### Page header (always include)
- Dark navbar rect: y=0, height=52, width=420, bg `#1e293b`
- Back arrow text `"←"` and page title in white, fontSize 16
- Cart icon + badge on right side

### Zone heights (use these as defaults, adjust for content)
- Header/navbar: 52px
- Hero image zone: 220px
- Text/description zone: 80px
- Topping list (per item): 28px, full list adds 16px padding top+bottom
- Qty stepper zone: 72px
- CTA footer: 64px
- Conditional/badge zone: 48px

---

## Step 3 — Write the file

Output the complete file at `docs/fe/wireframes/$ARGUMENTS.excalidraw`.

The root JSON structure must be:
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

---

## Step 4 — Done

Print:
```
✅ Wireframe written: docs/fe/wireframes/$ARGUMENTS.excalidraw
   Zones: [list zone names]
   Open in VS Code with the Excalidraw extension, or drag into excalidraw.com
```

Do NOT generate a markdown summary of the zones — the file is the output.
