FROM golang:1.25-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy module files from repo root (go.mod lives at root)
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY be/ ./be/

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./be/cmd/server/

# goose CLI for running migrations at container start (see entrypoint.sh)
RUN CGO_ENABLED=0 go install github.com/pressly/goose/v3/cmd/goose@v3.24.2

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
