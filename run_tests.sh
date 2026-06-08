#!/usr/bin/env bash
# run_tests.sh — run all service unit tests
# Usage: ./run_tests.sh [filter]
#   ./run_tests.sh                   # run all service tests
#   ./run_tests.sh TestLogin         # run only TestLogin* tests
#   ./run_tests.sh TestVNPay         # run only VNPay tests

set -euo pipefail

FILTER="${1:-}"
PKG="./be/internal/service/..."

cd "$(dirname "$0")"

echo "=============================="
echo "  Service Unit Tests"
echo "=============================="

if [ -n "$FILTER" ]; then
  echo "Filter: $FILTER"
  go test "$PKG" -run "$FILTER" -v -count=1
else
  echo "Running all tests..."
  go test "$PKG" -v -count=1
fi

echo ""
echo "=============================="
echo "  Done"
echo "=============================="
