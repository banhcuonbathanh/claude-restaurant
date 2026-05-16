import { execSync } from 'child_process'
import path from 'path'

/**
 * Playwright global setup — runs once before the entire test suite.
 *
 * Resets state that accumulates across test runs:
 *   1. Cancels any pending/preparing orders on seed tables (prevents 409 TABLE_HAS_ACTIVE_ORDER)
 *   2. Clears Redis rate-limit keys for login (prevents 429 during parallel beforeEach logins)
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

  // 3. Clear login rate-limit keys so parallel admin beforeEach hooks don't hit 429
  try {
    const keys = redis('keys "ratelimit:*"').toString().trim()
    if (keys && keys !== '') {
      for (const key of keys.split('\n').filter(Boolean)) {
        redis(`del "${key.trim()}"`)
      }
    }
  } catch {
    // No keys to delete — that's fine
  }

  // 4. Sync Redis order sequence counter with DB max to prevent duplicate order_number.
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
