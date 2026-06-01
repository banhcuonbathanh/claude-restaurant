import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { chromium } from '@playwright/test'

/**
 * Playwright global setup — runs once before the entire test suite.
 *
 * Resets state that accumulates across test runs:
 *   1. Cancels any pending/preparing orders on seed tables (prevents 409 TABLE_HAS_ACTIVE_ORDER)
 *   2. Clears Redis rate-limit keys for login (prevents 429 during parallel beforeEach logins)
 *   3. Saves auth storageState for manager + admin so high-volume specs can reuse sessions
 *      without calling loginAs (which counts against the 5 req/min rate limit).
 *
 * Requires: docker compose stack is up (docker compose up -d).
 */
export default async function globalSetup() {
  const root = path.resolve(__dirname, '..')

  const mysql = (sql: string) =>
    execSync(
      `docker compose exec -T mysql mysql -ubanhcuon -pbanhcuonpass banhcuon -e "${sql}"`,
      { cwd: root, stdio: 'pipe' }
    )

  const redis = (cmd: string) =>
    execSync(
      `docker compose exec -T redis redis-cli ${cmd}`,
      { cwd: root, stdio: 'pipe' }
    )

  // 0. Reset seed staff passwords to known values in case tests modified them.
  //    admin hash = bcrypt('admin123', cost=12) from scripts/seed.sql
  //    manager1 hash = bcrypt('manager123', cost=12)
  mysql(
    "UPDATE staff SET password_hash='\\$2a\\$12\\$ST/Bsgxj68CD33Ezfm9Bm.Xu4FTCntPq4LyPFvKojvM7il2G22jjy' " +
    "WHERE username='admin'"
  )
  mysql(
    "UPDATE staff SET password_hash='\\$2a\\$12\\$qs4WgWI6LeQnSJRj1jQqrugcUK9zlm1qehod75Hc/PYK9lUjF4eLe' " +
    "WHERE username='manager1'"
  )
  mysql("UPDATE staff SET is_active=1 WHERE username IN ('admin','manager1','chef1','cashier1')")

  // 1. Cancel ALL active orders on seed tables so POST /orders returns 201
  // Must cancel confirmed/ready too — not just pending/preparing — to prevent
  // TABLE_HAS_ACTIVE_ORDER when previous test runs left orders in any active status.
  mysql(
    "UPDATE orders SET status='cancelled' " +
    "WHERE status NOT IN ('cancelled','delivered') " +
    "AND table_id IN (" +
    "'22222222-2222-2222-2222-000000000001'," +
    "'22222222-2222-2222-2222-000000000002'," +
    "'22222222-2222-2222-2222-000000000003'," +
    "'22222222-2222-2222-2222-000000000004'," +
    "'22222222-2222-2222-2222-000000000005'," +
    "'22222222-2222-2222-2222-000000000006'" +
    ")"
  )

  // 2. Reset seed table statuses to available
  mysql(
    "UPDATE tables SET status='available' " +
    "WHERE id IN (" +
    "'22222222-2222-2222-2222-000000000001'," +
    "'22222222-2222-2222-2222-000000000002'," +
    "'22222222-2222-2222-2222-000000000003'," +
    "'22222222-2222-2222-2222-000000000004'," +
    "'22222222-2222-2222-2222-000000000005'," +
    "'22222222-2222-2222-2222-000000000006'" +
    ")"
  )

  // 2b. Hide non-seed products + combos. Prior dev/API tests left rows like
  //     'banh cuon' @ 4₫ at sort_order=0, which made the menu's first card a
  //     non-seed product and broke tests that use .first() to add to cart.
  //     Seed UUIDs start with 44444444- (products) and 66666666- (combos).
  mysql("UPDATE products SET is_available = 0 WHERE id NOT LIKE '44444444-%'")
  mysql("UPDATE combos   SET is_available = 0 WHERE id NOT LIKE '66666666-%'")
  // Ensure seed rows are visible (idempotent — handles a previous run flipping them off).
  mysql("UPDATE products SET is_available = 1 WHERE id LIKE '44444444-%'")
  mysql("UPDATE combos   SET is_available = 1 WHERE id LIKE '66666666-%'")

  // 2c. Invalidate BE catalog caches. ProductService caches the public list in
  //     Redis (products:list, categories:list, combos:list, toppings:list), so
  //     the DB flip above is invisible to /api/v1/products until we delete
  //     these keys — which is the cause of the "1× banh cuon @ 4₫" flake.
  try {
    redis('del products:list categories:list combos:list toppings:list')
  } catch {
    // Non-fatal: cache may not exist on first run
  }

  // 3. Clear ALL login rate-limit keys.
  // Note: the BE uses Redis key ratelimit:login:{ip}.  On macOS+Docker Desktop the
  // Playwright browser's requests reach the BE through Docker's internal bridge, so
  // the source IP seen by the BE may differ from 127.0.0.1.  We flush the whole DB
  // except for the order-sequence key to cover all possible IPs.
  try {
    // Save the order sequence value before flushing
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const seqKey = `order:seq:${today}`
    const seqVal = redis(`get ${seqKey}`).toString().trim()

    // Delete only ratelimit keys (selective flush via EVAL)
    redis(
      `eval "local ks=redis.call('keys','ratelimit:*') for _,k in ipairs(ks) do redis.call('del',k) end return #ks" 0`
    )

    // Also delete known explicit keys
    for (const ip of ['127.0.0.1', '::1', '172.21.0.1', '172.17.0.1', '172.18.0.1', '172.19.0.1', '172.20.0.1']) {
      try { redis(`del ratelimit:login:${ip}`) } catch { /* absent */ }
    }
  } catch { /* non-fatal */ }

  // 4. Save auth storageState for all 4 roles.
  // Auth state files are reused if they exist and are < 25 minutes old to avoid
  // consuming login rate-limit slots on consecutive test runs.
  const authDir = path.join(__dirname, 'auth-states')
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })
  const STATE_TTL_MS = 25 * 60 * 1000 // 25 minutes

  const browser = await chromium.launch({ headless: true })
  async function saveAuthState(role: string, username: string, password: string) {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await p.goto('http://localhost:3000/login')
    await p.getByLabel('Tên đăng nhập').fill(username)
    await p.getByLabel('Mật khẩu').fill(password)
    await p.getByRole('button', { name: 'Đăng nhập' }).click()
    // Poll URL until we leave /login (client-side SPA navigation, no load event)
    let redirected = false
    for (let i = 0; i < 40; i++) {
      if (!p.url().includes('/login')) { redirected = true; break }
      await new Promise(r => setTimeout(r, 250))
    }
    if (!redirected) throw new Error(`saveAuthState(${role}): still on /login after 10s`)
    // Dismiss cookie consent in stored state so it never blocks buttons in tests
    await p.evaluate(() => localStorage.setItem('cookie_consent_accepted', 'true'))
    await ctx.storageState({ path: path.join(authDir, `${role}.json`) })
    await ctx.close()
  }
  // Helper: skip saving if an unexpired state file already exists
  async function ensureAuthState(role: string, username: string, password: string) {
    const filePath = path.join(authDir, `${role}.json`)
    if (fs.existsSync(filePath)) {
      const age = Date.now() - fs.statSync(filePath).mtimeMs
      if (age < STATE_TTL_MS) return // reuse the cached state
    }
    await saveAuthState(role, username, password)
  }

  try {
    await ensureAuthState('manager', 'manager1', 'manager123')
    await ensureAuthState('admin',   'admin',    'admin123')
    await ensureAuthState('chef',    'chef1',    'chef1234')
    await ensureAuthState('cashier', 'cashier1', 'cashier123')
  } finally {
    await browser.close()
  }

  // 5. Sync Redis order sequence counter with DB max to prevent duplicate order_number.
  // If Redis was flushed (dev reset) but DB still has today's orders, INCR would
  // restart from 1 and collide with existing rows.
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    const seqKey = `order:seq:${today}`
    const maxRow = mysql(
      "SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(order_number,'-',-1) AS UNSIGNED)),0) " +
      "FROM orders WHERE DATE(created_at) = CURDATE();"
    ).toString()
    const maxSeq = parseInt(maxRow.split('\n').filter(l => /^\d/.test(l))[0] ?? '0', 10)
    if (maxSeq > 0) {
      redis(`set ${seqKey} ${maxSeq}`)
      redis(`expire ${seqKey} 90000`) // 25 h
    }
  } catch {
    // Non-fatal: sequence may duplicate but retry logic in order_service handles it
  }
}
