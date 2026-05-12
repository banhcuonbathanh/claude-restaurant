# Current Task

> **One task at a time.** Fill this in at session START. Clear or update at session END.
> **No active task?** → Open `MASTER_TASK.md`, find next `⬜` task where all `Deps` are ✅.
> **Task rules** → `GUIDE_TASK.md` · **All tasks** → `MASTER_TASK.md`

---

## Active Task

| Field | Value |
|---|---|
| **Task ID** | P-PD-1 |
| **Owner** | FE |
| **Title** | Read Spec_3 §4 + verify API response shape + cart store signature |
| **Session goal** | Confirm all integration points before writing any code for product detail page |
| **Branch** | feature/P-PD-product-detail |
| **Started** | 2026-05-12 |
| **Blocked by** | — |
| **Stopped at** | — |
| **Notes** | Wireframe at docs/fe/wireframes/product-detail.excalidraw · Route: (shop)/menu/product/[id] |

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
| 2026-05-11 | SETUP | Create docs/tasks/ folder | ✅ GUIDE · MASTER · CURRENT · TEMPLATE created |
| — | — | — | — |
| — | — | — | — |
| — | — | — | — |
| — | — | — | — |
