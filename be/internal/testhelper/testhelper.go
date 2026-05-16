// Package testhelper provides a fully wired HTTP test server backed by a real
// MySQL database and Redis instance for integration tests.
//
// Usage: set TEST_DB_DSN (e.g. root:secret@tcp(localhost:3306)/banhcuon_test)
// and optionally TEST_REDIS_ADDR (default: localhost:6379). Tests that call
// NewTestServer are automatically skipped when TEST_DB_DSN is unset.
package testhelper

import (
	"context"
	"database/sql"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/pressly/goose/v3"
	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/handler"
	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/repository"
	"banhcuon/be/internal/service"
	"banhcuon/be/internal/sse"
	ws "banhcuon/be/internal/websocket"
	bcryptpkg "banhcuon/be/pkg/bcrypt"
)

const (
	TestAdminUsername = "testadmin"
	TestAdminPassword = "TestAdmin@123"
	TestAdminID       = "aaaaaaaa-aaaa-aaaa-aaaa-000000000001"
	// TestTableQRToken is exactly 64 hex chars, matching the tables.qr_token CHAR(64) column.
	TestTableQRToken = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
	TestTableID      = "bbbbbbbb-bbbb-bbbb-bbbb-000000000001"
	TestCategoryID   = "cccccccc-cccc-cccc-cccc-000000000001"
	TestProductID    = "dddddddd-dddd-dddd-dddd-000000000001"
	TestProductPrice = int64(45000)
)

var (
	hashOnce      sync.Once
	testAdminHash string
)

// TestServer wraps an httptest.Server with shared test DB and Redis.
type TestServer struct {
	DB     *sql.DB
	RDB    *redis.Client
	Client *http.Client // cookie-aware for multi-request scenarios
	srv    *httptest.Server
}

// URL returns the base URL of the test server (e.g. http://127.0.0.1:PORT).
func (ts *TestServer) URL() string { return ts.srv.URL }

// NewTestServer creates a fully wired HTTP test server with real MySQL and Redis.
// Skips the test automatically if TEST_DB_DSN is not set.
// Registers t.Cleanup to close the server and flush the test Redis DB.
//
// Do NOT run integration tests in parallel — they share Redis DB 15.
func NewTestServer(t *testing.T) *TestServer {
	t.Helper()

	dsn := os.Getenv("TEST_DB_DSN")
	if dsn == "" {
		t.Skip("TEST_DB_DSN not set — skipping integration test")
	}
	if os.Getenv("JWT_SECRET") == "" {
		os.Setenv("JWT_SECRET", "integration-test-secret-key-must-be-32chars!")
	}

	sqlDB, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatalf("testhelper: open db: %v", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	goose.SetLogger(goose.NopLogger())
	if err := goose.SetDialect("mysql"); err != nil {
		t.Fatalf("testhelper: goose dialect: %v", err)
	}
	if err := goose.Up(sqlDB, migrationsDir()); err != nil {
		t.Fatalf("testhelper: goose up: %v", err)
	}

	redisAddr := os.Getenv("TEST_REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr, DB: 15})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		t.Fatalf("testhelper: redis ping: %v", err)
	}

	gin.SetMode(gin.TestMode)
	r := buildRouter(sqlDB, rdb)
	srv := httptest.NewServer(r)

	jar, _ := cookiejar.New(nil)
	ts := &TestServer{
		DB:     sqlDB,
		RDB:    rdb,
		Client: &http.Client{Jar: jar},
		srv:    srv,
	}
	t.Cleanup(func() {
		srv.Close()
		rdb.FlushDB(context.Background())
		sqlDB.Close()
	})
	return ts
}

// SeedAdmin inserts the test admin account into staff (idempotent via ON DUPLICATE KEY).
// The bcrypt hash is computed once per process (cost=12, ~250ms).
func SeedAdmin(t *testing.T, sqlDB *sql.DB) {
	t.Helper()
	hashOnce.Do(func() {
		h, err := bcryptpkg.Hash(TestAdminPassword)
		if err != nil {
			panic("testhelper: bcrypt.Hash: " + err.Error())
		}
		testAdminHash = h
	})
	_, err := sqlDB.Exec(`
		INSERT INTO staff (id, username, password_hash, full_name, role, is_active)
		VALUES (?, ?, ?, 'Integration Admin', 'admin', 1)
		ON DUPLICATE KEY UPDATE is_active=1
	`, TestAdminID, TestAdminUsername, testAdminHash)
	if err != nil {
		t.Fatalf("testhelper: seed admin: %v", err)
	}
}

// SeedTable inserts a test table row with TestTableQRToken (idempotent).
// Required for Guest endpoint tests.
func SeedTable(t *testing.T, sqlDB *sql.DB) {
	t.Helper()
	_, err := sqlDB.Exec("INSERT INTO `tables` (id, name, qr_token, capacity, status, is_active) "+
		"VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', 'Test Table', ?, 4, 'available', 1) "+
		"ON DUPLICATE KEY UPDATE is_active=1",
		TestTableQRToken)
	if err != nil {
		t.Fatalf("testhelper: seed table: %v", err)
	}
}

// TruncateAll clears all application tables. Call at the start of each test to
// guarantee a clean state regardless of any leftover data.
func TruncateAll(t *testing.T, sqlDB *sql.DB) {
	t.Helper()
	tables := []string{
		"stock_movements",
		"product_ingredients",
		"order_items",
		"payments",
		"orders",
		"order_sequences",
		"`tables`",
		"combo_items",
		"combos",
		"product_toppings",
		"toppings",
		"products",
		"categories",
		"refresh_tokens",
		"staff",
		"file_attachments",
		"ingredients",
	}
	if _, err := sqlDB.Exec("SET FOREIGN_KEY_CHECKS=0"); err != nil {
		t.Fatalf("testhelper: disable FK: %v", err)
	}
	for _, tbl := range tables {
		if _, err := sqlDB.Exec("TRUNCATE TABLE " + tbl); err != nil {
			t.Logf("testhelper: truncate %s: %v (table may not exist yet)", tbl, err)
		}
	}
	if _, err := sqlDB.Exec("SET FOREIGN_KEY_CHECKS=1"); err != nil {
		t.Fatalf("testhelper: re-enable FK: %v", err)
	}
}

// buildRouter wires auth + order + payment routes for integration tests.
func buildRouter(sqlDB *sql.DB, rdb *redis.Client) *gin.Engine {
	authRepo    := repository.NewAuthRepo(sqlDB)
	productRepo := repository.NewProductRepo(sqlDB)
	orderRepo   := repository.NewOrderRepo(sqlDB)
	paymentRepo := repository.NewPaymentRepo(sqlDB)
	tableRepo   := repository.NewTableRepo(sqlDB)

	authSvc    := service.NewAuthService(authRepo, rdb)
	productSvc := service.NewProductService(productRepo, rdb)
	orderSvc   := service.NewOrderService(orderRepo, tableRepo, rdb, productSvc)
	paymentSvc := service.NewPaymentService(paymentRepo, orderSvc, orderSvc, rdb)

	authH    := handler.NewAuthHandler(authSvc)
	orderH   := handler.NewOrderHandler(orderSvc)
	paymentH := handler.NewPaymentHandler(paymentSvc)

	authMW := middleware.AuthRequired(authSvc)

	r := gin.New()
	v1 := r.Group("/api/v1")

	// Auth
	auth := v1.Group("/auth")
	auth.POST("/login", authH.Login)
	auth.POST("/refresh", authH.Refresh)
	auth.POST("/guest", authH.Guest)
	{
		protected := auth.Group("")
		protected.Use(authMW)
		protected.POST("/logout", authH.Logout)
		protected.GET("/me", authH.Me)
	}

	// Orders
	orderR := v1.Group("/orders")
	orderR.Use(authMW)
	orderR.POST("", orderH.Create)
	orderR.GET("/live", middleware.AtLeast("cashier"), orderH.ListLive)
	orderR.GET("/:id", orderH.Get)
	orderR.PATCH("/:id/status", middleware.AtLeast("chef"), orderH.UpdateStatus)
	orderR.DELETE("/:id", orderH.Cancel)
	orderR.GET("/:id/events", sse.StreamOrder(rdb))

	// WebSocket (hub runs for the lifetime of the test server)
	hub := ws.NewHub()
	go hub.Run()
	wsR := v1.Group("/ws")
	wsR.GET("/kds", ws.KDSHandler(hub, rdb))

	// Payments
	payR := v1.Group("/payments")
	payR.Use(authMW, middleware.AtLeast("cashier"))
	payR.POST("", paymentH.Create)
	payR.GET("/:id", paymentH.GetPayment)

	return r
}

// SeedCategory inserts a test category (idempotent).
func SeedCategory(t *testing.T, sqlDB *sql.DB) {
	t.Helper()
	_, err := sqlDB.Exec(
		"INSERT INTO categories (id, name, is_active) VALUES (?, 'Test Category', 1) ON DUPLICATE KEY UPDATE is_active=1",
		TestCategoryID)
	if err != nil {
		t.Fatalf("testhelper: seed category: %v", err)
	}
}

// SeedProduct inserts a test category + product (idempotent). Callers get a product
// with TestProductID at TestProductPrice (45,000 VND).
func SeedProduct(t *testing.T, sqlDB *sql.DB) {
	t.Helper()
	SeedCategory(t, sqlDB)
	_, err := sqlDB.Exec(
		"INSERT INTO products (id, category_id, name, price, is_available) VALUES (?, ?, 'Test Banh Cuon', ?, 1) ON DUPLICATE KEY UPDATE is_available=1",
		TestProductID, TestCategoryID, TestProductPrice)
	if err != nil {
		t.Fatalf("testhelper: seed product: %v", err)
	}
}

// migrationsDir resolves the path to be/migrations/ relative to this source file.
func migrationsDir() string {
	_, file, _, _ := runtime.Caller(0)
	// file = .../be/internal/testhelper/testhelper.go
	return filepath.Join(filepath.Dir(file), "../../migrations")
}
