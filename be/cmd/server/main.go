package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gin-gonic/gin"
	"github.com/pressly/goose/v3"
)

func main() {
	// Run migrations before starting the server
	if dsn := os.Getenv("DB_DSN"); dsn != "" {
		migrationsDir := os.Getenv("MIGRATIONS_DIR")
		if migrationsDir == "" {
			migrationsDir = "/migrations"
		}
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			log.Fatalf("open db for migrations: %v", err)
		}
		goose.SetLogger(goose.NopLogger())
		if err := goose.SetDialect("mysql"); err != nil {
			log.Fatalf("goose dialect: %v", err)
		}
		if err := goose.Up(db, migrationsDir); err != nil {
			log.Fatalf("goose up: %v", err)
		}
		db.Close()
		log.Println("migrations OK")
	}

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
