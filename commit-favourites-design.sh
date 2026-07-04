#!/usr/bin/env bash
# Commit ONLY the favourites design artefacts (prompt + rendered mockup).
# Scoped on purpose — leaves every other in-progress change in the working tree untouched.
set -euo pipefail
cd "$(dirname "$0")"

git add \
  docs/system/08_pages/customer/customer_favourites/DESIGN_PROMPT.md \
  docs/system/08_pages/customer/customer_favourites/claude_design/favourites.html

git commit -m "docs(favourites): add DESIGN_PROMPT + interactive mockup

Favourites redesign design-step artefacts:
- DESIGN_PROMPT.md: paste-ready prompt mirroring the mockup
- claude_design/favourites.html: interactive 390px mockup
  (hearted list + live total + canh quick-add, saved sets,
   Tự tạo suất builder with per-egg nhân + trong/ngoài placement)

Design only — no app code changed. NEW features (builder, canh
quick-add, live total, 📌 pin, egg placement) need MASTER_TASK
rows before implementation; egg placement also needs a BE/DB migration."

echo "✅ Committed. Review with: git show --stat HEAD"
