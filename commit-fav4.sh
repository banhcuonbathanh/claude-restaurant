#!/usr/bin/env bash
# FAV-4 — 📌 "Ghim lên Menu": pin saved sets → menu Yêu thích rail for one-tap re-add.
# Git is blocked for Claude this session; run this yourself to commit FAV-4.
set -euo pipefail
cd "$(dirname "$0")"

git add \
  fe/src/store/favourites.ts \
  fe/src/lib/favourite-set-cart.ts \
  "fe/src/app/(shop)/menu/favourites/sets/page.tsx" \
  "fe/src/app/(shop)/menu/favourites/sets/components/SetCard.tsx" \
  fe/src/features/menu/components/FavouritesRail.tsx \
  "fe/src/app/(shop)/menu/page.tsx" \
  docs/tasks/CURRENT_TASK.md \
  docs/tasks/MASTER_TASK.md

git commit -m "feat(favourites): pin saved sets to menu Yêu thích rail (FAV-4)

- favourites store: pinned?:boolean on FavouriteSet + togglePinSet
  (deleteSet auto-drops the pin; no persist-version bump — optional field)
- new lib/favourite-set-cart.ts: favouriteSetToCartItems() — single
  apply-to-cart builder shared by /sets Áp dụng and the menu rail
- SetCard: 📌 pin toggle (aria-pressed + header prefix when pinned)
- FavouritesRail: render pinned-set cards (name · n món · ＋ Thêm) →
  one-tap adds all set items to cart + toast
- menu/page.tsx: showFavs gate also true when a pinned set exists

Scope: saved sets only (custom suats have no card surface yet).
Verified live (docker fe :3000): pin→rail→tap re-adds exact set;
unpin+reload→gone. tsc/lint/build green; vitest 107 pass / 2 pre-existing.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

echo "✅ FAV-4 committed."
