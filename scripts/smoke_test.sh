#!/bin/sh
# scripts/smoke_test.sh — post-deploy smoke test
#
# Usage:
#   ./scripts/smoke_test.sh                          # default: http://localhost
#   BASE_URL=https://banhcuon.vn ./scripts/smoke_test.sh
#
# Exit 0 = all checks pass
# Exit 1 = one or more checks failed

set -e

BASE_URL="${BASE_URL:-http://localhost}"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$actual" = "$expected" ]; then
    printf "  \033[32m✓\033[0m %s (%s)\n" "$name" "$actual"
    PASS=$((PASS + 1))
  else
    printf "  \033[31m✗\033[0m %s — expected %s, got %s\n" "$name" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

check_post() {
  local name="$1"
  local url="$2"
  local body="$3"
  local expected="$4"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -X POST -H "Content-Type: application/json" -d "$body" "$url" 2>/dev/null || echo "000")
  if [ "$actual" = "$expected" ]; then
    printf "  \033[32m✓\033[0m %s (%s)\n" "$name" "$actual"
    PASS=$((PASS + 1))
  else
    printf "  \033[31m✗\033[0m %s — expected %s, got %s\n" "$name" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

echo "Smoke test: $BASE_URL"
echo "────────────────────────────────"

echo "Infrastructure"
check "BE health"          "$BASE_URL/health"                200
check "FE home"            "$BASE_URL/"                     200

echo ""
echo "Public API"
check "GET /api/v1/products"    "$BASE_URL/api/v1/products"   200
check "GET /api/v1/categories"  "$BASE_URL/api/v1/categories" 200
check "GET /api/v1/combos"      "$BASE_URL/api/v1/combos"     200

echo ""
echo "Auth"
check_post "Login admin"    "$BASE_URL/api/v1/auth/login" \
  '{"username":"admin","password":"admin123"}'   200
check_post "Login cashier"  "$BASE_URL/api/v1/auth/login" \
  '{"username":"cashier1","password":"cashier123"}' 200
check_post "Login bad creds" "$BASE_URL/api/v1/auth/login" \
  '{"username":"admin","password":"wrongpassword123"}'      401

echo ""
echo "────────────────────────────────"
printf "Results: \033[32m%d passed\033[0m, \033[31m%d failed\033[0m\n" "$PASS" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
