package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gin-gonic/gin"
	"github.com/pressly/goose/v3"
	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/handler"
	"banhcuon/be/internal/jobs"
	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/repository"
	"banhcuon/be/internal/service"
	"banhcuon/be/internal/sse"
	ws "banhcuon/be/internal/websocket"
)

func main() {
	// ── 1. Config ──────────────────────────────────────────────────────────────
	dbDSN := os.Getenv("DB_DSN")
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// ── 2. DB + Migrations ────────────────────────────────────────────────────
	sqlDB, err := sql.Open("mysql", dbDSN)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if dbDSN != "" {
		migrationsDir := os.Getenv("MIGRATIONS_DIR")
		if migrationsDir == "" {
			migrationsDir = "/migrations"
		}
		goose.SetLogger(goose.NopLogger())
		if err := goose.SetDialect("mysql"); err != nil {
			log.Fatalf("goose dialect: %v", err)
		}
		if err := goose.Up(sqlDB, migrationsDir); err != nil {
			log.Fatalf("goose up: %v", err)
		}
		log.Println("migrations OK")
	}

	// ── 3. Redis ──────────────────────────────────────────────────────────────
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("redis ping failed (continuing): %v", err)
	}

	// ── 4. Repos ──────────────────────────────────────────────────────────────
	authRepo       := repository.NewAuthRepo(sqlDB)
	productRepo    := repository.NewProductRepo(sqlDB)
	orderRepo      := repository.NewOrderRepo(sqlDB)
	paymentRepo    := repository.NewPaymentRepo(sqlDB)
	fileRepo       := repository.NewFileRepo(sqlDB)
	tableRepo      := repository.NewTableRepo(sqlDB)
	staffRepo      := repository.NewStaffRepo(sqlDB)
	analyticsRepo  := repository.NewAnalyticsRepo(sqlDB)
	ingredientRepo := repository.NewIngredientRepo(sqlDB)

	// ── 5. Services ───────────────────────────────────────────────────────────
	authSvc        := service.NewAuthService(authRepo, rdb)
	productSvc     := service.NewProductService(productRepo, rdb)
	orderSvc       := service.NewOrderService(orderRepo, rdb, productSvc)
	paymentSvc     := service.NewPaymentService(paymentRepo, orderSvc, orderSvc, rdb)
	groupSvc       := service.NewGroupService(orderRepo, rdb)
	staffSvc       := service.NewStaffService(staffRepo, rdb)
	analyticsSvc   := service.NewAnalyticsService(analyticsRepo)
	ingredientSvc  := service.NewIngredientService(ingredientRepo)

	// ── 6. WebSocket Hub ──────────────────────────────────────────────────────
	hub := ws.NewHub()
	go hub.Run()

	// ── 7. Handlers ───────────────────────────────────────────────────────────
	authH        := handler.NewAuthHandler(authSvc)
	productH     := handler.NewProductHandler(productSvc)
	orderH       := handler.NewOrderHandler(orderSvc)
	paymentH     := handler.NewPaymentHandler(paymentSvc)
	groupH       := handler.NewGroupHandler(groupSvc)
	fileH        := handler.NewFileHandler(fileRepo)
	tableH       := handler.NewTableHandler(tableRepo)
	staffH       := handler.NewStaffHandler(staffSvc)
	analyticsH   := handler.NewAnalyticsHandler(analyticsSvc)
	ingredientH  := handler.NewIngredientHandler(ingredientSvc)

	// ── 8. Router ─────────────────────────────────────────────────────────────
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	corsOrigins := os.Getenv("CORS_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:3000"
	}
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", corsOrigins)
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization,Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Static file serving for uploaded images
	if storagePath := os.Getenv("STORAGE_BASE_PATH"); storagePath != "" {
		r.Static("/uploads", storagePath+"/uploads")
	}

	v1 := r.Group("/api/v1")

	// authMW wraps AuthRequired with is_active check (Spec1 §10).
	authMW := middleware.AuthRequired(authSvc)

	// ── Auth (public + authenticated) ─────────────────────────────────────────
	authR := v1.Group("/auth")
	authR.POST("/login", authH.Login)
	authR.POST("/refresh", authH.Refresh)
	authR.POST("/guest", authH.Guest)
	{
		protected := authR.Group("")
		protected.Use(authMW)
		protected.POST("/logout", authH.Logout)
		protected.GET("/me", authH.Me)
	}

	// ── Products (public GET, Manager+ write) ─────────────────────────────────
	prodR := v1.Group("/products")
	prodR.GET("", productH.ListProducts)
	prodR.GET("/:id", productH.GetProduct)
	{
		mgr := prodR.Group("")
		mgr.Use(authMW, middleware.AtLeast("manager"))
		mgr.GET("/all", productH.ListAllProducts) // includes unavailable — Manager+
		mgr.POST("", productH.CreateProduct)
		mgr.PATCH("/:id", productH.UpdateProduct)
		mgr.PATCH("/:id/availability", productH.UpdateProduct)
	}
	{
		adm := prodR.Group("")
		adm.Use(authMW, middleware.AtLeast("admin"))
		adm.DELETE("/:id", productH.DeleteProduct)
	}

	// Categories
	catR := v1.Group("/categories")
	catR.GET("", productH.ListCategories)
	{
		mgr := catR.Group("")
		mgr.Use(authMW, middleware.AtLeast("manager"))
		mgr.POST("", productH.CreateCategory)
		mgr.PATCH("/:id", productH.UpdateCategory)
	}
	{
		adm := catR.Group("")
		adm.Use(authMW, middleware.AtLeast("admin"))
		adm.DELETE("/:id", productH.DeleteCategory)
	}

	// Toppings
	topR := v1.Group("/toppings")
	topR.GET("", productH.ListToppings)
	{
		mgr := topR.Group("")
		mgr.Use(authMW, middleware.AtLeast("manager"))
		mgr.POST("", productH.CreateTopping)
		mgr.PATCH("/:id", productH.UpdateTopping)
	}
	{
		adm := topR.Group("")
		adm.Use(authMW, middleware.AtLeast("admin"))
		adm.DELETE("/:id", productH.DeleteTopping)
	}

	// Combos
	comboR := v1.Group("/combos")
	comboR.GET("", productH.ListCombos)
	{
		mgr := comboR.Group("")
		mgr.Use(authMW, middleware.AtLeast("manager"))
		mgr.POST("", productH.CreateCombo)
	}
	{
		adm := comboR.Group("")
		adm.Use(authMW, middleware.AtLeast("admin"))
		adm.DELETE("/:id", productH.DeleteCombo)
	}

	// ── Orders ────────────────────────────────────────────────────────────────
	orderR := v1.Group("/orders")
	orderR.Use(authMW)
	orderR.POST("", orderH.Create)
	orderR.GET("/live", middleware.AtLeast("cashier"), orderH.ListLive)
	orderR.GET("/:id", orderH.Get)
	orderR.PATCH("/:id/status", middleware.AtLeast("chef"), orderH.UpdateStatus)
	orderR.DELETE("/:id", orderH.Cancel)
	orderR.GET("/:id/events", sse.StreamOrder(rdb))
	orderR.POST("/group", middleware.AtLeast("cashier"), groupH.CreateGroup)
	orderR.GET("/group/:id", groupH.GetGroup)
	orderR.POST("/group/:id/orders", middleware.AtLeast("cashier"), groupH.AddToGroup)
	orderR.DELETE("/group/:id/orders/:orderId", middleware.AtLeast("cashier"), groupH.RemoveFromGroup)
	orderR.DELETE("/group/:id", middleware.AtLeast("manager"), groupH.DisbandGroup)
	orderR.GET("/group/:id/events", sse.StreamGroup(rdb, groupSvc))

	// Order items (chef updates qty_served)
	v1.PATCH("/orders/items/:id", authMW, middleware.AtLeast("chef"), orderH.UpdateItemServed)

	// ── Payments ──────────────────────────────────────────────────────────────
	payR := v1.Group("/payments")
	payR.Use(authMW, middleware.AtLeast("cashier"))
	payR.POST("", paymentH.Create)
	payR.GET("/:id", paymentH.GetPayment)

	// Webhooks — public, HMAC verified inside handler
	v1.POST("/payments/webhook/vnpay", paymentH.VNPayWebhook)
	v1.POST("/payments/webhook/momo", paymentH.MoMoWebhook)
	v1.POST("/payments/webhook/zalopay", paymentH.ZaloPayWebhook)

	// ── Tables ────────────────────────────────────────────────────────────────
	tableR := v1.Group("/tables")
	tableR.GET("/qr/:token", tableH.DecodeQR) // public
	{
		staff := tableR.Group("")
		staff.Use(authMW, middleware.AtLeast("cashier"))
		staff.GET("", tableH.ListTables)
	}
	{
		mgr := tableR.Group("")
		mgr.Use(authMW, middleware.AtLeast("manager"))
		mgr.POST("", tableH.CreateTable)
		mgr.PATCH("/:id", tableH.UpdateTable)
	}

	// ── Staff ─────────────────────────────────────────────────────────────────
	staffR := v1.Group("/staff")
	staffR.Use(authMW, middleware.AtLeast("manager"))
	staffR.GET("", staffH.ListStaff)
	staffR.POST("", staffH.CreateStaff)
	staffR.GET("/:id", staffH.GetStaff)
	staffR.PATCH("/:id", staffH.UpdateStaff)
	staffR.PATCH("/:id/status", staffH.SetStaffStatus)
	{
		adm := staffR.Group("")
		adm.Use(middleware.AtLeast("admin"))
		adm.DELETE("/:id", staffH.DeleteStaff)
	}

	// ── Admin Analytics + Ingredients ────────────────────────────────────────
	adminR := v1.Group("/admin")
	adminR.Use(authMW, middleware.AtLeast("manager"))
	adminR.GET("/summary", analyticsH.GetSummary)
	adminR.GET("/top-dishes", analyticsH.GetTopDishes)
	adminR.GET("/staff-performance", analyticsH.GetStaffPerformance)
	adminR.GET("/ingredients", ingredientH.ListIngredients)
	adminR.GET("/ingredients/low-stock", ingredientH.ListLowStock)
	adminR.POST("/ingredients", ingredientH.CreateIngredient)
	adminR.GET("/ingredients/:id", ingredientH.GetIngredient)
	adminR.PATCH("/ingredients/:id", ingredientH.UpdateIngredient)
	adminR.GET("/ingredients/:id/movements", ingredientH.ListStockMovements)
	adminR.POST("/stock-movements", ingredientH.CreateStockMovement)
	{
		admIngR := adminR.Group("")
		admIngR.Use(middleware.AtLeast("admin"))
		admIngR.DELETE("/ingredients/:id", ingredientH.DeleteIngredient)
	}

	// ── Files ─────────────────────────────────────────────────────────────────
	fileR := v1.Group("/files")
	fileR.Use(authMW, middleware.AtLeast("cashier"))
	fileR.POST("/upload", fileH.Upload)

	// ── Admin SSE ─────────────────────────────────────────────────────────────
	v1.GET("/sse/admin", authMW, middleware.AtLeast("manager"), sse.StreamAdmin(rdb))

	// ── WebSocket ─────────────────────────────────────────────────────────────
	wsR := v1.Group("/ws")
	wsR.GET("/kds", ws.KDSHandler(hub, rdb))
	wsR.GET("/orders-live", ws.LiveHandler(hub, rdb))

	// ── Background Jobs ───────────────────────────────────────────────────────
	jobCtx, jobCancel := context.WithCancel(context.Background())
	defer jobCancel()
	go jobs.StartPaymentTimeoutWatcher(jobCtx, sqlDB, rdb)
	go jobs.StartFileCleanup(jobCtx, sqlDB)

	// ── Graceful Shutdown ─────────────────────────────────────────────────────
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Printf("server listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("server shutdown: %v", err)
	}
	log.Println("server stopped")
}
