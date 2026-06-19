# Panel Catalog — page knowledge-map

The canonical panels behind `customer_menu.excalidraw`, generalized so the same
treatment applies to any page folder. Each panel reads from ONE primary doc in
the page's 6-file doc-set (see `/page-doc-set`). A page rarely needs all 14 —
pick the panels its docs actually support, in this order.

| # | Panel | Primary source doc | What it shows |
|---|---|---|---|
| 1 | **Page Wireframe** | `<page>.md` | The device mockup (mobile 420px / desktop 1200px): every zone A,B,C… with its label, data source, conditional gate, sticky/overlay notes. Light theme. |
| 2 | **Cross-Component Dataflow** | `<page>_crosscomponent_dataflow.md` | The store-as-hub diagram: server (TanStack) · client (Zustand) · local (useState); selectors/derived values; the in-page "no arrow zone→zone" rule + the key flow steps. |
| 3 | **BE View** | `<page>_be.md` | Endpoint table (method · path · auth · cache); auth model; Redis caching (TTL, keys, fail-open); error behaviour. |
| 4 | **Object Model FE⇄BE⇄DB** | `<page>.md` §Object Model | Each domain entity (raw vs enriched), the READ/WRITE pipeline arrows, FE↔BE↔DB field mapping. |
| 5 | **Cross-Page Dataflow** | `<page>_crosspage_dataflow.md` | In-browser hub (localStorage keys · URL params) vs BE hub (the row of truth); status lifecycle machine; which other pages read/write this state; durability matrix (survives F5 / dies). |
| 6 | **Loading States** | `<page>_loading.md` | The layers (route spinner → Suspense → per-query); which queries skeleton vs not; main-content state branch; gating. |
| 7 | **Scenario Timeline** | `SCENARIO_<PAGE>.md` | The page's own concrete walkthrough: beat-by-beat timeline, derived totals, peak snapshot, the mechanics it exercises. |
| 8 | **Flags / Known Mismatches** | all docs | Collected doc-vs-code drift, ignored params, null→"" conventions, missing rate-limits, manual steps. |
| 9 | **Live State Objects** | `_crosscomponent` + `_be` | Dark cards: the REAL object shapes (Zustand store · TanStack cache · BE model) + ONE concrete example threaded through all three. |
| 10 | **Object Lifecycle (moving)** | `_crosscomponent` + `_loading` + `_be` | The SAME objects from Panel 9 MOVING: per-beat lanes — Action · store-snapshot-after (← what changed) · components reacting · TanStack/BE reaction. |
| 11 | **DB Row-Level View** | `_be.md` + migrations | The actual SQL rows this page writes/reads, every column, plus CHECK/derived-status rules. |
| 12 | **Realtime Fan-out** | `_crosspage` + SSE/WS code | One commit → Redis pub/sub → channels → BE SSE/WS handlers → FE hooks → which OTHER screens light up. |
| 13 | **Failure / Edge Map** | all docs + code | Every unhappy path: 4xx validations, retries on unique constraints, Redis-down fallback, tx rollback. |
| 14 | **One Field, All Layers** | trace one field | A single field traced tap → Zustand → payload → service snapshot → SQL column → read-back → render. |

## Layout convention
- Panels flow **left→right, top→bottom**. Panels 1–8 are light theme (page-wireframe
  family); panels 9–14 are the dark deep-dive family (`excalib` defaults are dark).
- Give each panel a generous coordinate band so they never overlap. The
  customer_menu set used: panels 1–8 in `x:40..3600 / y:40..2600`, then stacked the
  dark panels downward (`y` ≈ 2700, 4000, 7120, 9000…). Pick non-overlapping bands;
  leave ≥200px gutters.
- Every panel starts with `ex.panel_header(x, y, "PANEL N · Title", "one-line subtitle")`.

## Source of truth
Everything drawn must come from the page's doc-set or the actual code — never
invented. If a fact isn't in the docs, trace it in source and cite the file in the
panel script's docstring (the customer_menu scripts cite `be/...`, `fe/...`).
