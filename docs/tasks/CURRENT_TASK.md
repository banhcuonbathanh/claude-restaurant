# Current Task

> **One task at a time.** Fill this in at session START. Clear or update at session END.
> **No active task?** → Open `MASTER_TASK.md`, find next `⬜` task where all `Deps` are ✅.
> **Task rules** → `GUIDE_TASK.md` · **All tasks** → `MASTER_TASK.md`

---

## Active Task

| Field | Value |
|---|---|
| **Task ID** | P-PD-2 |
| **Owner** | FE |
| **Title** | Create route file + Zone A (HeroImage) + Zone B (name, badge, price, description) + loading skeleton |
| **Session goal** | Scaffold product detail page with Zones A & B wired to GET /products/:id |
| **Branch** | feature/P-PD-product-detail |
| **Started** | 2026-05-12 |
| **Blocked by** | — |
| **Stopped at** | ✅ DONE — page.tsx created, tsc clean |
| **Notes** | Route: fe/src/app/(shop)/menu/product/[id]/page.tsx · image prefix env var is NEXT_PUBLIC_STORAGE_URL (matches ProductCard) · CartItem uses `price` not `unit_price` · total/itemCount are functions · Next: P-PD-3 (ToppingSelector) |

---

## How to use this file

### At session START — fill in the block above:
1. Pick next `⬜` task from `MASTER_TASK.md` where all `Deps` are ✅
2. Check `Sessions = 1` — if not, break it down in `MASTER_TASK.md` first
3. Set **Task ID**, **Owner**, **Title**, **Session goal**, **Branch**, **Started**
4. Mark task `🔄` in `MASTER_TASK.md`
5. Run `git checkout -b feature/{ID}-{short-name}`

### At session END — update the block:
- **Task fully done** → mark ✅ in `MASTER_TASK.md`, then set all fields above to `—`
- **Task partially done** → fill in **Stopped at** (exact function/file/line) + **Notes**
- **Task blocked** → fill in **Blocked by** + mark `🔴` in `MASTER_TASK.md`

---

## Session History (last 5)

| Date | Task ID | Title | Outcome |
|---|---|---|---|
| 2026-05-12 | P-PD-2 | Create route + Zone A (HeroImage) + Zone B + skeleton | ✅ page.tsx created, tsc clean |
| 2026-05-12 | P-PD-1 | Read Spec_3 §4 + verify API shape + cart store signature | ✅ All integration points confirmed — see findings |
| 2026-05-11 | SETUP | Create docs/tasks/ folder | ✅ GUIDE · MASTER · CURRENT · TEMPLATE created |
| — | — | — | — |
| — | — | — | — |
| — | — | — | — |
