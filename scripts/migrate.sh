#!/bin/sh
set -e

# Wait for MySQL to accept connections, then run migrations and start the server.
# Requires: mysqladmin (mysql-client), goose binary in PATH.
# Env vars: DB_DSN, MYSQL_HOST (default: mysql), MYSQL_USER (default: banhcuon),
#           MYSQL_PASSWORD, MIGRATIONS_DIR (default: /migrations)

MYSQL_HOST="${MYSQL_HOST:-mysql}"
MYSQL_USER="${MYSQL_USER:-banhcuon}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"

echo "[migrate.sh] Waiting for MySQL at ${MYSQL_HOST}..."
until mysqladmin ping -h "${MYSQL_HOST}" -u "${MYSQL_USER}" -p"${MYSQL_PASSWORD}" --silent 2>/dev/null; do
  printf '.'
  sleep 2
done
echo ""
echo "[migrate.sh] MySQL ready."

echo "[migrate.sh] Running migrations from ${MIGRATIONS_DIR}..."
goose -dir "${MIGRATIONS_DIR}" mysql "${DB_DSN}" up
echo "[migrate.sh] Migrations done."

echo "[migrate.sh] Starting server..."
exec /app/server
