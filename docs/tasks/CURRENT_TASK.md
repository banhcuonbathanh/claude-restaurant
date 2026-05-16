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
| 2026-05-16 | P11-1 | Add Items spec — POST /api/v1/orders/:id/items to Spec4 §5.2.1 | ✅ New section §5.2.1 written: request body, validation (status guard + ownership), response shape, 4 error codes, 8-step business rules (combo expand + recalc + SSE + KDS WS + orders-live WS events with full JSON schemas), 10-item AC checklist |
| 2026-05-16 | P7-5.3 | SSE reconnect + WS reconnect integration tests | ✅ 8/8 pass; new file: `realtime_test.go` (TestSSE x4 + TestWS x4); added SSE+WS routes to `testhelper.go buildRouter`; verified reconnect x3 + event delivery via Redis publish for both SSE and WS |
| 2026-05-16 | P7-5.2 | Order + Payment API integration tests | ✅ 21/21 pass; new files: `helpers_test.go` (doPatch/doDelete/createOrder/advanceToReady), `order_test.go` (10 tests); 3 production bugs fixed: NULL gateway_data scan, Secure cookie over HTTP, expanded buildRouter |
| 2026-05-16 | P7-9 | Compliance pages — /privacy-policy + /terms + cookie consent banner | ✅ 3 files created: privacy-policy/page.tsx + terms/page.tsx (server components, Vietnamese, ArrowLeft back link) + CookieConsent.tsx (localStorage `cookie_consent_accepted`, orange Đồng ý button); wired to root layout.tsx; tsc clean; PCI-DSS verified (no card data anywhere in FE) |
| 2026-05-16 | P9-8 | overview/page.tsx final assembly | ✅ Replaced 1079-line inline page with clean 200-line assembly; removed all mock data + USE_MOCK flag + inline PrepPanel/StatCard/EmptyTableCard/WS useEffect; wired useOverviewWS + StatCards + WaitingSection + PrepPanel + TableGrid; kept NewOrderPopup inline + SSE popup; 30s timer retained; tsc clean |
| 2026-05-16 | P7-4 | FE Store Tests — cart.store.test.ts + utils.test.ts | ✅ 6/6 pass; Vitest installed (vitest + vite-tsconfig-paths); `npm test` script added; all 4 cart tests + 2 utils tests green |
| 2026-05-16 | P7-3 | TestVNPayWebhook_ValidSignature + TestVNPayWebhook_InvalidSignature + TestVNPayWebhook_Idempotent + TestCreatePayment_OrderNotReady | ✅ 4/4 pass; all 16 service tests green. Added `paymentRedisClient` interface to `payment_service.go` (Publish only) for mock injection. Bonus fix: `rateLimitMax` was 50 (typo) → corrected to 5 per Spec1 comment; restored `TestLogin_RateLimitAfter5Fails` to green. |
| 2026-05-16 | P7-E2E-1 | Re-run Playwright suite + fix remaining failures | ✅ 9/9 pass, 0 flaky, ~14s. Two real bugs found while triaging: (a) global-setup didn't hide non-seed product pollution OR invalidate the BE `products:list` Redis cache → `.first()` grabbed a 4₫ "banh cuon" row; (b) WS pubsub forwarder at `be/internal/websocket/handler.go:60` panicked `send on closed channel` when hub closed `client.send` mid-flight → BE crashed → `ERR_EMPTY_RESPONSE` on the order POST. Fixes: added DB+Redis cleanup to `e2e/global-setup.ts`; added `defer recover()` to the pubsub goroutine to match the existing pattern at `client.go:38,66`. |
| 2026-05-16 | P7-E2E-0 | Fix dev DB seed so e2e tests can authenticate | ✅ No-op — dev DB already seeded correctly. Verified: admin/chef1/cashier1/manager1 all return HTTP 200 on `/api/v1/auth/login`; QR `a1b2c3d4…` resolves to Bàn 01 via `GET /api/v1/tables/qr/:token`. Original "wrong password" + "missing QR token" notes were stale. |
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
