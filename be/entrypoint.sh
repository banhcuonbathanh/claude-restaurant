#!/bin/sh
set -e

# Run pending goose migrations, then start the server.
# Retries goose itself instead of pinging MySQL so no mysql-client is needed;
# compose's service_healthy gate makes the first attempt usually succeed.
# Env: DB_DSN (required), MIGRATIONS_DIR (default /migrations),
#      MIGRATE_MAX_ATTEMPTS (default 30, 2s apart)

MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"
MAX_ATTEMPTS="${MIGRATE_MAX_ATTEMPTS:-30}"

i=1
until goose -dir "${MIGRATIONS_DIR}" mysql "${DB_DSN}" up; do
  if [ "$i" -ge "$MAX_ATTEMPTS" ]; then
    echo "[entrypoint] migrations failed after ${MAX_ATTEMPTS} attempts, aborting" >&2
    exit 1
  fi
  echo "[entrypoint] DB not ready (attempt ${i}/${MAX_ATTEMPTS}), retrying in 2s..."
  i=$((i + 1))
  sleep 2
done

echo "[entrypoint] migrations up to date, starting server"
exec /app/server
