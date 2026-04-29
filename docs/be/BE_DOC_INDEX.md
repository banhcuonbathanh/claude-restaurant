# BE Documentation Index — Phase 4 Navigation Guide

> **Purpose:** Single navigation guide for all BE implementation work.
> Every Phase 4 task starts here: find your domain → read the listed docs → implement.
> **Last verified:** 2026-04-30

---

## 1 — Scaffold Status (What Exists Now)

### ✅ Complete — do not recreate

| File | Notes |
|---|---|
| `be/internal/service/errors.go` | All sentinel errors (AppError, 14 vars) |
| `be/internal/service/deps.go` | Cross-service interfaces (ProductLookup, OrderReader, OrderWriter) + shared value types |
| `be/internal/handler/respond.go` | `respondError()` helper — use this everywhere |
| `be/pkg/jwt/jwt.go` | GenerateAccessToken, ParseToken |
| `be/pkg/bcrypt/bcrypt.go` | HashPassword(cost=12), ComparePassword |
| `be/pkg/redis/client.go` | Redis client init |
| `be/internal/db/` | sqlc-generated layer (models.go, querier.go, *.sql.go) |
| `be/migrations/001–007` | DB migrations (008 pending — run before Phase 4) |

### ⚠️ Stub — shell exists, body missing

| File | What's Missing |
|---|---|
| `be/cmd/server/main.go` | DI wiring, route registration (only `/health` right now) |
| `be/internal/middleware/auth.go` | Full Bearer parse, Redis is_active cache, context injection |
| `be/internal/middleware/rbac.go` | RequireRole(minValue) logic |
| `be/internal/repository/auth_repo.go` | All sqlc auth query wrappers |
| `be/internal/service/auth_service.go` | Login, Refresh, Logout, ValidateIsActive |
| `be/pkg/redis/bloom.go` | Add, Exists (Bloom filter wrappers) |
| `be/pkg/redis/pubsub.go` | Publish, Subscribe, Unsubscribe wrappers |

### ⬜ Not yet created — Phase 4 will create these

```
be/internal/model/                        ← request/response DTOs (create per handler)
be/internal/repository/product_repo.go
be/internal/repository/order_repo.go
be/internal/repository/payment_repo.go
be/internal/repository/file_repo.go
be/internal/repository/table_repo.go
be/internal/service/product_service.go
be/internal/service/order_service.go
be/internal/service/payment_service.go
be/internal/service/file_service.go
be/internal/service/table_service.go
be/internal/service/group_service.go
be/internal/handler/auth_handler.go
be/internal/handler/product_handler.go
be/internal/handler/order_handler.go
be/internal/handler/payment_handler.go
be/internal/handler/file_handler.go
be/internal/handler/table_handler.go
be/internal/handler/group_handler.go
be/internal/sse/handler.go               ← SSE order tracking
be/internal/sse/group_handler.go         ← SSE group tracking
be/internal/websocket/hub.go
be/internal/websocket/client.go
be/internal/websocket/handler.go
be/internal/payment/vnpay.go
be/internal/payment/momo.go
be/internal/payment/zalopay.go
```

---

## 2 — Reading Guide Per Domain

> **Rule:** Read only the docs listed for your domain. Do NOT read everything.
> Always read docs in the order listed — earlier docs provide context for later ones.

### 4.1 Auth (⚠️ FIRST — blocks everything)

| What | File | Section |
|---|---|---|
| Request/response shapes | `docs/contract/API_CONTRACT_v1.2.md` | §2 Auth |
| Login rate limit, max sessions, refresh token flow | `docs/spec/Spec1_Auth_Updated_v2.md` | B1 Business Logic |
| sqlc queries to wrap | `docs/spec/Spec1_Auth_Updated_v2.md` | B2 sqlc Queries |
| JWT payload, access/refresh TTL | `docs/MASTER_v1.2.md` | §6 JWT Config |
| RBAC role values (for RequireRole) | `docs/MASTER_v1.2.md` | §3 RBAC |
| Middleware order (Logger→Recovery→CORS→RateLimit→Auth→RBAC→Handler) | `docs/MASTER_v1.2.md` | §7.1 |
| Error codes: INVALID_CREDENTIALS, ACCOUNT_DISABLED, etc. | `docs/contract/ERROR_CONTRACT_v1.1.md` | §2, §3 |
| DB field names for staff table | `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` | staff section |

**Critical rules (do not miss):**
- Wrong password and wrong username → same error (INVALID_CREDENTIALS) — no enumeration
- HMAC algorithm check: `t.Method == jwt.SigningMethodHMAC` before parsing
- Refresh token: SHA256-hash before storing in DB; Redis is fast-path, DB is fallback
- is_active check: Redis cache key `staff:active:{id}` TTL 5min → fallback DB

### 4.2 Products

| What | File | Section |
|---|---|---|
| All product/category/topping/combo endpoints | `docs/contract/API_CONTRACT_v1.2.md` | §3 |
| Business logic, Redis cache, soft delete | `docs/spec/Spec_2_Products_API_v2_CORRECTED.md` | all |
| Field names: `price` not `base_price`, `image_path` not `image_url` | `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` | — |
| Error codes: NOT_FOUND, PRODUCT_IN_USE | `docs/contract/ERROR_CONTRACT_v1.1.md` | §2 |
| Cross-service: ProductLookup interface | `be/internal/service/deps.go` | ProductLookup |

**Critical rules:**
- `image_path` stored in DB (relative), `image_url` assembled in response: `STORAGE_BASE_URL + "/" + image_path`
- Redis cache keys for products: TTL 5min, invalidate on every write
- Soft delete: set `is_active=false`, never hard DELETE; filter `WHERE is_active=1` in all list queries

### 4.3 Orders + SSE + Groups

| What | File | Section |
|---|---|---|
| Order endpoints + SSE spec | `docs/contract/API_CONTRACT_v1.2.md` | §4, §10.2 |
| State machine, combo expansion, 1-table-1-active, 30% cancel rule | `docs/spec/Spec_4_Orders_API.md` | all |
| Business rules (order, cancel, group) | `docs/MASTER_v1.2.md` | §4 |
| SSE reconnect config, heartbeat | `docs/MASTER_v1.2.md` | §5.2 |
| Cross-service: ProductLookup, OrderReader, OrderWriter | `be/internal/service/deps.go` | all |
| Field names: `qty_served`, `combo_ref_id`, `group_id` | `docs/task/BanhCuon_DB_SCHEMA_SUMMARY.md` | orders section |
| Error codes: TABLE_HAS_ACTIVE_ORDER, CANCEL_THRESHOLD | `docs/contract/ERROR_CONTRACT_v1.1.md` | §2 |

**Critical rules:**
- `order_items.status` does NOT exist as a DB column — derive from `qty_served`: 0→pending, 0<x<qty→preparing, x=qty→done
- `recalculateTotalAmount()` must be called after every `order_items` mutation
- Combo expansion: 1 parent row (combo_id set, product_id NULL) + N sub-item rows (combo_ref_id=parent.id)
- 1 table, 1 active order: check before CreateOrder → 409 TABLE_HAS_ACTIVE_ORDER
- SSE: `text/event-stream` header, `X-Accel-Buffering: no`, heartbeat every 15s (`": keep-alive"`)

### 4.4 WebSocket Hub

| What | File | Section |
|---|---|---|
| WS endpoint specs, event types | `docs/contract/API_CONTRACT_v1.2.md` | §10.1 |
| Reconnect config (maxAttempts=5, backoff) | `docs/MASTER_v1.2.md` | §5.1 |

**Critical rules:**
- WS auth via `?token=` query param (browser WS API cannot set custom headers)
- Hub uses `sync.RWMutex` for client map — no direct map access outside lock
- Goroutines must have `defer recover()` to prevent panics from crashing server
- Ping 30s / pong deadline 10s / read deadline 60s

### 4.5 Payments

| What | File | Section |
|---|---|---|
| Payment endpoints + webhook signatures | `docs/contract/API_CONTRACT_v1.2.md` | §5 |
| HMAC verification logic per gateway, idempotency | `docs/spec/Spec_5_Payment_Webhooks.md` | all |
| Business rules: order must be `ready` before payment | `docs/MASTER_v1.2.md` | §4 |
| Cross-service: OrderReader, OrderWriter | `be/internal/service/deps.go` | — |
| Error codes: ORDER_NOT_READY, PAYMENT_ALREADY_EXISTS | `docs/contract/ERROR_CONTRACT_v1.1.md` | §2 |

**Critical rules:**
- Webhook: HMAC verification is ALWAYS the first operation — before reading any body fields
- Idempotency: check `payments.status` before any DB write; if already `completed`, return 200 (no-op)
- Field name: `gateway_data` (not `webhook_payload`), payment status `completed` (not `success`)

### 4.6 QR / Tables

| What | File | Section |
|---|---|---|
| Table endpoints + QR token decode | `docs/contract/API_CONTRACT_v1.2.md` | §6 |
| Guest JWT flow, table assignment, active-order-on-scan conflict | `docs/spec/Spec_6_QR_POS.md` | all |
| Guest JWT payload (`sub='guest'`) | `docs/MASTER_v1.2.md` | §6.4 |
| RBAC for table endpoints | `docs/contract/API_CONTRACT_v1.2.md` | §6 Role column |

### 4.7 File Upload

| What | File | Section |
|---|---|---|
| Upload endpoint spec | `docs/contract/API_CONTRACT_v1.2.md` | §7 |
| Allowed MIME types, max size | `docs/contract/API_CONTRACT_v1.2.md` | §7 |
| Error codes: UNSUPPORTED_FILE_TYPE, FILE_TOO_LARGE | `docs/contract/ERROR_CONTRACT_v1.1.md` | §2 |

---

## 3 — DI Wiring Pattern (main.go skeleton)

> Use this as the template when wiring Phase 4 code into main.go.
> Add each domain group as its feature is completed (4.1 → 4.2 → 4.3 …).

```go
func main() {
    // ── 1. Config ──────────────────────────────────────────────────────────
    jwtSecret  := os.Getenv("JWT_SECRET")
    dbDSN      := os.Getenv("DB_DSN")
    redisAddr  := os.Getenv("REDIS_ADDR")
    storageURL := os.Getenv("STORAGE_BASE_URL")

    // ── 2. DB (run goose migrations first) ─────────────────────────────────
    sqlDB, _ := sql.Open("mysql", dbDSN)
    queries  := db.New(sqlDB)        // sqlc-generated

    // ── 3. Redis ───────────────────────────────────────────────────────────
    rdb := redis.NewClient(&redis.Options{Addr: redisAddr})

    // ── 4. Repos ───────────────────────────────────────────────────────────
    authRepo    := repository.NewAuthRepo(queries)
    productRepo := repository.NewProductRepo(queries)
    orderRepo   := repository.NewOrderRepo(queries)
    paymentRepo := repository.NewPaymentRepo(queries)
    fileRepo    := repository.NewFileRepo(queries)
    tableRepo   := repository.NewTableRepo(queries)

    // ── 5. Services (order matters — inject interfaces, not concrete types) ─
    authSvc    := service.NewAuthService(authRepo, rdb, jwtSecret)
    productSvc := service.NewProductService(productRepo, rdb, storageURL)
    orderSvc   := service.NewOrderService(orderRepo, rdb, productSvc)   // ProductLookup
    paymentSvc := service.NewPaymentService(paymentRepo, orderSvc, orderSvc) // OrderReader + OrderWriter
    fileSvc    := service.NewFileService(fileRepo, storageURL)
    tableSvc   := service.NewTableService(tableRepo, rdb, jwtSecret)
    groupSvc   := service.NewGroupService(orderRepo, rdb)

    // ── 6. Middleware ──────────────────────────────────────────────────────
    hub    := websocket.NewHub()
    go hub.Run()
    authMW := middleware.NewAuthMiddleware(rdb, jwtSecret)

    // ── 7. Handlers ────────────────────────────────────────────────────────
    authH    := handler.NewAuthHandler(authSvc)
    productH := handler.NewProductHandler(productSvc)
    orderH   := handler.NewOrderHandler(orderSvc)
    paymentH := handler.NewPaymentHandler(paymentSvc)
    fileH    := handler.NewFileHandler(fileSvc)
    tableH   := handler.NewTableHandler(tableSvc)
    groupH   := handler.NewGroupHandler(groupSvc)

    // ── 8. Routes ──────────────────────────────────────────────────────────
    // Middleware order (MASTER §7.1): Logger → Recovery → CORS → RateLimit → Auth → RBAC → Handler
    r := gin.New()
    r.Use(gin.Logger(), gin.Recovery(), middleware.CORS())

    r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

    v1 := r.Group("/api/v1")

    // Auth (public)
    authR := v1.Group("/auth")
    authR.POST("/login", authH.Login)
    authR.POST("/refresh", authH.Refresh)
    authR.POST("/guest", authH.Guest)
    authR.Use(authMW.RequireAuth())
    authR.POST("/logout", authH.Logout)
    authR.GET("/me", authH.Me)

    // Products (public read, Manager+[4] write)
    prodR := v1.Group("/products")
    prodR.GET("", productH.List)
    prodR.GET("/:id", productH.Get)
    prodR.Use(authMW.RequireAuth())
    prodR.POST("", middleware.RequireRole(4), productH.Create)
    prodR.PUT("/:id", middleware.RequireRole(4), productH.Update)
    prodR.DELETE("/:id", middleware.RequireRole(5), productH.Delete) // Admin[5]
    v1.GET("/categories", productH.ListCategories)
    v1.GET("/toppings", productH.ListToppings)
    v1.GET("/combos", productH.ListCombos)

    // Orders (Customer+[1] create, Staff+[3] manage)
    orderR := v1.Group("/orders").Use(authMW.RequireAuth())
    orderR.POST("", orderH.Create)
    orderR.GET("/live", middleware.RequireRole(3), orderH.ListLive)
    orderR.GET("/:id", orderH.Get)
    orderR.PATCH("/:id/status", middleware.RequireRole(2), orderH.UpdateStatus) // Chef+[2]
    orderR.DELETE("/:id", orderH.Cancel)
    orderR.GET("/:id/events", orderH.SSEStream)
    orderR.POST("/group", middleware.RequireRole(3), groupH.CreateGroup)
    orderR.GET("/group/:id", groupH.GetGroup)
    v1.PATCH("/orders/items/:id", authMW.RequireAuth(), middleware.RequireRole(2), orderH.UpdateItemServed)

    // Payments (Cashier+[3])
    payR := v1.Group("/payments").Use(authMW.RequireAuth(), middleware.RequireRole(3))
    payR.POST("", paymentH.Create)
    v1.POST("/payments/webhook/vnpay", paymentH.VNPayWebhook)   // public — signature verified internally
    v1.POST("/payments/webhook/momo", paymentH.MoMoWebhook)
    v1.POST("/payments/webhook/zalopay", paymentH.ZaloPayWebhook)

    // Tables (Staff+[3] manage, public QR decode)
    tableR := v1.Group("/tables")
    tableR.GET("/qr/:token", tableH.DecodeQR)
    tableR.Use(authMW.RequireAuth())
    tableR.GET("", middleware.RequireRole(3), tableH.List)
    tableR.POST("", middleware.RequireRole(4), tableH.Create)
    tableR.PATCH("/:id", middleware.RequireRole(4), tableH.Update)

    // Files (Staff+[3])
    fileR := v1.Group("/files").Use(authMW.RequireAuth(), middleware.RequireRole(3))
    fileR.POST("/upload", fileH.Upload)
    fileR.DELETE("/:id", fileH.Delete)

    // WebSocket (auth via ?token= query param)
    wsR := v1.Group("/ws")
    wsR.GET("/kds", middleware.WSAuth(jwtSecret, 2), websocket.KDSHandler(hub))         // Chef+[2]
    wsR.GET("/orders-live", middleware.WSAuth(jwtSecret, 3), websocket.LiveHandler(hub)) // Staff+[3]

    r.Run(":" + os.Getenv("PORT"))
}
```

**RBAC role values** (from MASTER §3):
| Role | Value |
|---|---|
| customer | 1 |
| chef | 2 |
| cashier / staff | 3 |
| manager | 4 |
| admin | 5 |

---

## 4 — Layer Rules (Strict — No Exceptions)

```
handler → service → repository → db (sqlc)
```

| Layer | Owns | Must NOT contain |
|---|---|---|
| `handler/` | gin.Context, bind JSON, call service, return response | Business logic, DB queries |
| `service/` | Business logic, state machine, error mapping | gin imports, direct DB calls |
| `repository/` | sqlc query wrappers, transaction helpers | Business rules, HTTP concepts |
| `db/` | sqlc-generated — DO NOT edit manually | — |
| `middleware/` | Auth, RBAC, rate limit | Business logic |
| `pkg/` | Reusable utilities (jwt, bcrypt, redis) | Import from internal/ |

---

## 5 — Common Patterns

### respondError (handler layer)
```go
// From be/internal/handler/respond.go — always use this
respondError(c, http.StatusNotFound, "NOT_FOUND", "Không tìm thấy tài nguyên")
respondError(c, http.StatusConflict, "TABLE_HAS_ACTIVE_ORDER", "Bàn đã có đơn",
    gin.H{"active_order_id": orderID})
```

### AppError unwrapping (handler → service boundary)
```go
result, err := svc.DoSomething(ctx, ...)
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

### Context timeout (always pass ctx)
```go
ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
defer cancel()
result, err := repo.GetSomething(ctx, id)
```

### Soft delete filter (all list queries)
```go
-- In query/*.sql — always filter:
WHERE deleted_at IS NULL
-- OR
WHERE is_active = 1
```

---

*BanhCuon System · BE Documentation Index · v1.0 · 2026-04-30*
