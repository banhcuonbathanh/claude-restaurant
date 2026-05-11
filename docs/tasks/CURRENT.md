# Current Task

> **One task at a time.** Fill this in at session START. Clear or update at session END.
> **No active task?** → Open `MASTER.md`, find next `⬜` task where all `Deps` are ✅.
> **Task rules** → `GUIDE.md` · **All tasks** → `MASTER.md`

---

## Active Task

| Field | Value |
|---|---|
| **Task ID** | — |
| **Owner** | — |
| **Title** | — |
| **Session goal** | — |
| **Branch** | — |
| **Started** | — |
| **Blocked by** | — |
| **Stopped at** | — |
| **Notes** | — |

---

## How to use this file

### At session START — fill in the block above:
1. Pick next `⬜` task from `MASTER.md` where all `Deps` are ✅
2. Check `Sessions = 1` — if not, break it down in `MASTER.md` first
3. Set **Task ID**, **Owner**, **Title**, **Session goal**, **Branch**, **Started**
4. Mark task `🔄` in `MASTER.md`
5. Run `git checkout -b feature/{ID}-{short-name}`

### At session END — update the block:
- **Task fully done** → mark ✅ in `MASTER.md`, then set all fields above to `—`
- **Task partially done** → fill in **Stopped at** (exact function/file/line) + **Notes**
- **Task blocked** → fill in **Blocked by** + mark `🔴` in `MASTER.md`

---

## Session History (last 5)

| Date | Task ID | Title | Outcome |
|---|---|---|---|
| 2026-05-11 | SETUP | Create docs/tasks/ folder | ✅ GUIDE · MASTER · CURRENT · TEMPLATE created |
| — | — | — | — |
| — | — | — | — |
| — | — | — | — |
| — | — | — | — |
