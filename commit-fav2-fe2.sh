#!/usr/bin/env bash
# FAV-2-FE-2 commit — run from repo root. Scopes the commit to ONLY the
# FAV-2-FE-2 files. Run ./commit-fav2-fe1.sh first if FAV-2-FE-1 is not committed.
set -euo pipefail

git add \
  "fe/src/types/cart.ts" \
  "fe/src/lib/order-payload.ts" \
  "fe/src/store/favourites.ts" \
  "fe/src/app/(shop)/menu/favourites/components/SuatBuilder.tsx" \
  "fe/src/app/(shop)/menu/favourites/components/SaveSuatModal.tsx" \
  "docs/tasks/MASTER_TASK.md" \
  "docs/tasks/CURRENT_TASK.md"

git commit -m "feat(favourites): FAV-2-FE-2 save custom suất + order as món-lẻ

- 'Lưu suất này' opens SaveSuatModal: name + món-lẻ summary (nhân + ghi chú)
- On confirm: persist the suất recipe AND add its lines to the cart (one step)
- favourites store: add CustomSuat/SuatLine + persisted suats[] + addSuat/deleteSuat
- CartItem gains note?; order-payload emits it on standalone product rows
- Suất is ordered as món-lẻ product lines (combo_id null) — no combos DB write

Verified live (docker fe :3000, full online checkout): POST /orders sent 3
món-lẻ rows (bánh cuốn w/ nhân topping + ghi chú note, giò, canh) → 201, total
13.000đ, no double-count, nothing written to combos. Suất persisted with
product_id+qty+toppingId+note. tsc/lint/build green; order-payload tests 5/5.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

echo "✅ FAV-2-FE-2 committed."
