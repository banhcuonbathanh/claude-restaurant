#!/bin/bash
# Commit script for FIX-OL (online checkout UX fixes) — run manually: bash commit-fix-ol.sh
set -e
cd "$(dirname "$0")"
git add \
  "fe/src/app/(shop)/checkout/page.tsx" \
  fe/src/features/menu/components/CartDrawer.tsx \
  "fe/src/app/(shop)/orders/page.tsx" \
  fe/src/features/order/components/TableInfoBanner.tsx \
  fe/src/features/order/components/WholeFloorPrepList.tsx \
  docs/tasks/MASTER_TASK.md
git commit -m "fix(shop): online checkout UX — submit bar above nav, drawer a11y, online labels (FIX-OL-1..3)

- checkout: fixed submit bar was covered by ClientBottomNav (z-20) → lifted above nav
- CartDrawer: closed drawer stays out of a11y tree (aria-hidden + invisible)
- orders tracking: online orders show 'Đơn Online' labels instead of 'Bàn ?'

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
echo "Committed. You can delete this script: rm commit-fix-ol.sh"
