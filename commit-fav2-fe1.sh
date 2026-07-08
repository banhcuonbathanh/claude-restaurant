#!/usr/bin/env bash
# FAV-2-FE-1 commit — run from repo root. Scopes the commit to ONLY the
# FAV-2-FE-1 files (leaves other uncommitted changes for you to handle separately).
# NOTE: run ./commit-fav1.sh first if FAV-1 is not yet committed — this task
# rewrites build/page.tsx which FAV-1 first created as a stub.
set -euo pipefail

git add \
  "fe/src/app/(shop)/menu/favourites/build/page.tsx" \
  "fe/src/app/(shop)/menu/favourites/components/SuatBuilder.tsx" \
  "docs/tasks/MASTER_TASK.md" \
  "docs/tasks/CURRENT_TASK.md"

git commit -m "feat(favourites): FAV-2-FE-1 'Tự tạo suất' builder view (local state)

- New SuatBuilder: rows = client's favourite products (♥) grouped by category,
  + canh có/không rau (0đ) at the bottom per mockup View C
- Per-product nhân pills (single-select, data-driven from product.toppings) +
  free-text ghi chú; options panel opens on qty>0, collapses on qty=0
- Live sticky summary bar (n món · total); 'Lưu suất này' disabled at 0
  (save persistence + món-lẻ ordering deferred to FAV-2-FE-2)
- Rewrote build/page.tsx (was a stub) to fetch /products, resolve fav products

Local state only — no store/order/save wiring yet. Verified live (docker fe
:3000): total 2 món·13.000đ, egg panel open/collapse, Giò stepper-only.
tsc/lint/npm run build green.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

echo "✅ FAV-2-FE-1 committed."
