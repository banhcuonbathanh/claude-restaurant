FROM golang:1.25-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# retry wrapper: network fetches (go mod download / go install) fail
# transiently when a download times out or a connection drops mid-way,
# making `go` exit 1 and aborting the whole image build. Retry up to 3x.
RUN printf '#!/bin/sh\nn=0\nuntil [ "$n" -ge 3 ]; do "$@" && exit 0; n=$((n+1)); echo "retry $n/3 after failure: $*" >&2; sleep 5; done\nexit 1\n' > /usr/local/bin/retry && chmod +x /usr/local/bin/retry

# Copy module files from repo root (go.mod lives at root)
COPY go.mod go.sum ./
# cache mount keeps the module cache across builds so a retry re-uses
# already-downloaded modules instead of re-fetching from scratch
RUN --mount=type=cache,target=/go/pkg/mod retry go mod download

# Copy source
COPY be/ ./be/

# Build binary
RUN --mount=type=cache,target=/go/pkg/mod --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./be/cmd/server/

# goose CLI for running migrations at container start (see entrypoint.sh).
# GOSUMDB=off: goose is not in the project go.sum, so `go install` would
# verify it against sum.golang.org — which is unreachable in this build
# network. The module is still fetched (and integrity-checked) via GOPROXY.
RUN --mount=type=cache,target=/go/pkg/mod --mount=type=cache,target=/root/.cache/go-build \
    retry env CGO_ENABLED=0 GOSUMDB=off go install github.com/pressly/goose/v3/cmd/goose@v3.24.2

# --- runtime ---
FROM golang:1.25-alpine
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /go/bin/goose /usr/local/bin/goose
COPY be/migrations/ /migrations/
COPY be/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
