---
description: Apply whenever writing or reviewing Go backend code — handlers, services, repositories, middleware, or tests. Encodes the non-obvious rules and critical patterns for this project's Go/Gin/sqlc stack.
---

# Backend Go Skill — BanhCuon Project

## Architecture: strict layer boundaries

```
HTTP → handler → service → repository → db (sqlc-generated)
                               ↕
                            pkg/ (jwt · bcrypt · redis)
```

| Layer | Owns | Must NOT |
|---|---|---|
| `handler/` | gin.Context · bind JSON · call service · return response | Business logic · DB queries |
| `service/` | Business logic · state machine · error mapping | gin imports · direct DB calls |
| `repository/` | sqlc wrappers · transaction helpers | Business rules · HTTP concepts |
| `db/` | sqlc-generated — **never edit manually** | — |

---

## Response format (always use these helpers — never gin.H{} directly)

```go
// Success
respondSuccess(c, http.StatusOK, data)

// Error — use respondError, never raw gin.H
respondError(c, http.StatusNotFound, "NOT_FOUND", "Không tìm thấy tài nguyên")

// Error with extra details
respondError(c, http.StatusConflict, "TABLE_HAS_ACTIVE_ORDER",
    "Bàn đã có đơn đang xử lý",
    gin.H{"table_id": tableID, "active_order_id": orderID})
```

## AppError unwrapping (handler → service boundary)

```go
result, err := svc.DoSomething(ctx, input)
if err != nil {
    var appErr *service.AppError
    if errors.As(err, &appErr) {
        respondError(c, appErr.Status, appErr.Code, appErr.Message)
    } else {
        respondError(c, 500, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ")
    }
    return
}
```

---

## Critical gotchas (will silently break things)

### DB field names — use exact names, sqlc will fail otherwise

| Wrong | Correct |
|---|---|
| `base_price` | `price` |
| `image_url` | `image_path` |
| `webhook_payload` | `gateway_data` |
| `staff_id` | `created_by` |
| `success` (payment) | `completed` |
| `id: int` | `id: string` (CHAR 36 UUID) |

### binding tags on numeric fields

```go
// ❌ WRONG — rejects price=0 with 400 (treats 0 as missing)
Price int64 `binding:"required,min=0"`

// ✅ CORRECT — allows price=0 (free topping is valid)
Price int64 `binding:"min=0"`
```
Use `required` only for strings (non-empty) or pointers (non-nil). Never on numerics.

### Middleware must receive dependencies explicitly

```go
// ❌ WRONG — is_active check silently skipped, no compile error
func AuthRequired() gin.HandlerFunc { ... }

// ✅ CORRECT — dependency injected, interface enforces at compile time
func AuthRequired(checker IsActiveChecker) gin.HandlerFunc { ... }
```

### recalculateTotalAmount after every order_items mutation

```go
// Must be inside the same transaction after any INSERT/UPDATE on order_items
err = repo.RecalculateTotalAmount(ctx, tx, orderID)
```

Missing this = order total wrong silently.

### Always pass context with timeout

```go
ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
defer cancel()
result, err := repo.GetSomething(ctx, id)
```

---

## SSE headers (order tracking endpoint)

```go
c.Header("Content-Type", "text/event-stream")
c.Header("Cache-Control", "no-cache")
c.Header("X-Accel-Buffering", "no")
// Heartbeat every 15s
fmt.Fprintf(c.Writer, ": keep-alive\n\n")
c.Writer.Flush()
```

## WebSocket auth (query param, NOT Authorization header)

```go
// Browser WS API cannot set custom headers — use query param
token := c.Query("token")  // ?token=<access_token>
```

---

## Error code reference

| HTTP | Code | When |
|---|---|---|
| 400 | INVALID_INPUT | Missing field · wrong type |
| 401 | MISSING_TOKEN | No Authorization header |
| 401 | TOKEN_EXPIRED | JWT exp passed |
| 401 | INVALID_CREDENTIALS | Wrong username or password |
| 401 | REFRESH_TOKEN_INVALID | Refresh expired or revoked |
| 403 | FORBIDDEN | Valid token, insufficient role |
| 404 | NOT_FOUND | Resource not in DB |
| 409 | TABLE_HAS_ACTIVE_ORDER | 1 table → 1 active order violated |
| 409 | CANCEL_THRESHOLD | Cancel when ≥ 30% already served |
| 409 | ORDER_NOT_READY | Payment when order ≠ ready |
| 422 | UNSUPPORTED_FILE_TYPE | MIME not in allowlist |
| 429 | RATE_LIMIT_EXCEEDED | > 60 req/min/IP |
| 500 | INTERNAL_ERROR | Never expose internals |

---

## RBAC roles

| Role | Value | Key permissions |
|---|---|---|
| customer | 1 | POST /orders (own table) · GET /orders/:id (own) |
| chef | 2 | PATCH item qty_served |
| cashier | 3 | POST /payments · GET /orders/live |
| manager | 4 | CRUD products · create staff |
| admin | 5 | All endpoints |

Hierarchy: customer < chef < cashier < manager < admin
