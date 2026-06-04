#!/bin/bash
set -e

docker compose up -d mysql redis

(cd be && set -a && source .env.local && set +a && go run ./cmd/server) &
BE_PID=$!

cd fe && npm run dev

kill $BE_PID 2>/dev/null
