#!/usr/bin/env bash
# FAV-1 commit — run from repo root. Scopes the commit to ONLY the FAV-1 files
# (leaves the pre-existing uncommitted docs changes for you to handle separately).
set -euo pipefail

# Optional: move FAV work onto a feature branch (recommended — you are on a docs branch).
# git checkout -b feature/fav-favourites-redesign

git add \
  "fe/src/app/(shop)/menu/favourites/page.tsx" \
  "fe/src/app/(shop)/menu/favourites/components/FavouritesFooter.tsx" \
  "fe/src/app/(shop)/menu/favourites/components/FavouriteSegmentTabs.tsx" \
  "fe/src/app/(shop)/menu/favourites/components/CanhQuickAdd.tsx" \
  "fe/src/app/(shop)/menu/favourites/build/page.tsx" \
  "docs/tasks/MASTER_TASK.md"

git commit -m "feat(favourites): FAV-1 canh quick-add + live total + segmented tabs + footer fix

- Add 'Canh — thêm nhanh' block (có rau / không rau, additive via setCanhQty, ✓ flash)
- Add live-total row in footer (n món · Tổng = Σ card qty×price, recomputed live)
- Drop the two footer buttons; keep only the '🛒 Thêm tất cả vào giỏ' CTA
- Add FavouriteSegmentTabs (Yêu thích · Bộ đã lưu · Tự tạo suất) as the replacement
  nav (removing the footer buttons otherwise orphaned /sets + /build)
- Fix FavouritesFooter ↔ ClientBottomNav collision (offset footer above the nav)
- Add /menu/favourites/build stub until FAV-2-FE-1

Verified live (docker fe :3000): canh add bumps cart badge, live total matches sum,
CTA tappable above nav. tsc/lint/build green; vitest 107 pass / 2 pre-existing fail.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

echo "✅ FAV-1 committed."
