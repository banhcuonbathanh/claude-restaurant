# Current Task

> **One task at a time.** Fill this in at session START. Clear or update at session END.
> **No active task?** → Open `MASTER_TASK.md`, find next `⬜` task where all `Deps` are ✅.
> **Task rules** → `GUIDE_TASK.md` · **All tasks** → `MASTER_TASK.md`

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
| 2026-05-15 | P7-2.3 | TestItemStatusCycle + TestAutoReadyWhenAllItemsDone | ✅ Both tests pass; mockOrderRepo extended with 3 fn fields (getOrderItemByIDFn, updateQtyServedFn, updateOrderStatusFn); all 12 service tests green |
| 2026-05-15 | P7-2.2 | TestCancelOrder_Under30Percent + TestCancelOrder_Over30Percent | ✅ Both tests pass; mockOrderRepo extended with 3 fn fields; all 10 service tests green |
| 2026-05-15 | P7-2.1 | TestCreateOrder_ComboExpand + TestCreateOrder_DuplicateTable | ✅ Both tests pass; orderRedisClient interface added; all 8 service tests green |
| 2026-05-15 | P7-1.5 | Fix Spec4 §5/§7/§8 gaps — SSE+WS payload schemas + combo display rules + low_stock=min_stock | ✅ All 3 gaps fixed; Spec4 updated |
| 2026-05-15 | P7-1.3 | TestAccountDisabledImmediate + TestTokenRotation | ✅ Both tests pass; all 6 auth tests green; added setStaffActiveFn to mockAuthRepo |
| 2026-05-14 | P7-1.2 | TestMultiSessionLogin + TestLogoutSingleSession | ✅ Both tests pass; build clean; added tokenStore helper + 4 fn fields to mockAuthRepo |
| 2026-05-14 | P7-1.1 | Auth service test scaffolding + TestLogin_WrongPassword + TestLogin_RateLimitAfter5Fails | ✅ Both tests pass; build clean; added redisClient interface to auth_service.go |
| 2026-05-14 | P-UX2 | Favourites + Combo detail + Settings (P-UX2-1/2/3) | ✅ All 3 tasks complete; build clean |
| 2026-05-14 | P-PD-5 | Browser test golden path + regressions | ✅ 3 bugs fixed; all tests pass |
| 2026-05-12 | P-PD-4 | Zone D QtyStepper + Zone E sticky CTA footer | ✅ Zone D+E added, tsc clean |
| 2026-05-12 | P-PD-3 | Zone C ToppingSelector + live running total + skeleton | ✅ Zone C added, tsc clean |
| 2026-05-12 | P-PD-2 | Create route + Zone A (HeroImage) + Zone B + skeleton | ✅ page.tsx created, tsc clean |
| 2026-05-12 | P-PD-1 | Read Spec_3 §4 + verify API shape + cart store signature | ✅ All integration points confirmed — see findings |
| 2026-05-11 | SETUP | Create docs/tasks/ folder | ✅ GUIDE · MASTER · CURRENT · TEMPLATE created |
| — | — | — | — |
| — | — | — | — |
| — | — | — | — |
