---
tags: [moc]
---

# 📖 Guideline — How to Use This Vault

This vault is a **linked map of the Bánh Cuốn project** — code (BE + FE), docs, and business concepts as connected notes. It does not replace `docs/`; every note points back to the real source files.

## Opening

1. Obsidian → **Open folder as vault** → pick `obsidian-vault/` at the repo root.
2. Start from [[Home]] — the table of contents.

## Navigating

| Action | How |
|---|---|
| Follow a link | Click any `[[link]]` |
| Quick-open a note | `Ctrl/Cmd + O`, type its name |
| Graph view (the map) | `Ctrl/Cmd + G` or the graph icon |
| Local graph (one note's neighbours) | Open a note → `Ctrl/Cmd + P` → "local graph" |
| Search everything | `Ctrl/Cmd + Shift + F` |
| Back / forward | `Ctrl/Cmd + Alt + ←` / `→` |

## Folder layout

```
Home.md            ← start here
Guideline.md       ← this file
architecture/      ← Backend · Frontend · Infrastructure overviews
be/                ← one note per backend domain (Orders, Payment, Auth, …)
fe/                ← one note per frontend page/feature (Menu, KDS, Admin Overview, …)
concepts/          ← cross-cutting rules (Order Lifecycle, RBAC, Combo & Filling)
docs/              ← map of the docs/ tree (Specs, Contracts, Workflows, …)
```

## Reading a note

Every note follows the same shape:

- **What it is** — one-line purpose
- **Code** — real repo paths in `inline code` (open them in your editor, not Obsidian)
- **Rules / behaviour** — the constraints that matter, with `[[links]]` to the concept notes
- **Related** — neighbouring notes (BE ↔ FE ↔ docs)

## Graph view tips

- Notes carry frontmatter tags: `be`, `fe`, `docs`, `concept`, `architecture`, plus `domain/orders`-style tags.
- In graph view → **Groups** → add a group per tag (e.g. `tag:#be` orange, `tag:#fe` blue, `tag:#docs` green) to color the map by layer.
- The most connected dots ([[BE - Orders]], [[Concept - Order Lifecycle]]) are the heart of the system — start exploring there.

## Typical uses

- **"Where does X live?"** → `Ctrl/Cmd + O`, type the feature name, read its Code section.
- **Before touching order/payment logic** → read [[Concept - Order Lifecycle]] and follow its MUST-READ doc links.
- **Onboarding someone** → have them read [[Home]] → the 3 architecture notes → the 3 concept notes.

## Keeping it honest

- The vault was fact-checked against source on **2026-07-12**. It is a snapshot — code wins over notes.
- When a structure fact changes (file moved, column dropped, new page), update the matching note in the same session. One note per fact; link instead of duplicating (**one fact, one home** — same rule as `docs/`).
- Add a new note only for a new domain/page/concept; put it in the right folder, tag it, and link it from [[Home]].
- Known drift the vault already corrects (CLAUDE.md is stale on these): `order_items.filling` was dropped by migration 017; `AGENT_OS_check.md` is the real filename; `MASTER_v1.2.md` physically contains only §4 + §6.

## Housekeeping

- Obsidian creates a hidden `.obsidian/` settings folder in the vault on first open — add `obsidian-vault/.obsidian/` to `.gitignore` if you commit the vault.
