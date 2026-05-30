// Print QR URLs for all active tables so you can open them in a browser
// or scan with a phone (replace localhost with your local IP for mobile).
// Usage: go run ./be/cmd/qr/main.go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "banhcuon:banhcuonpass@tcp(127.0.0.1:3306)/banhcuon?parseTime=true&charset=utf8mb4"
	}

	host := os.Getenv("FE_HOST")
	if host == "" {
		host = "http://localhost:3000"
	}

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatalf("ping db: %v", err)
	}

	rows, err := db.Query(`SELECT name, qr_token FROM tables WHERE is_active = 1 ORDER BY name`)
	if err != nil {
		log.Fatalf("query: %v", err)
	}
	defer rows.Close()

	fmt.Println()
	fmt.Println("=== QR URLs (open in browser or scan with phone) ===")
	fmt.Println()

	count := 0
	for rows.Next() {
		var name, token string
		if err := rows.Scan(&name, &token); err != nil {
			log.Printf("scan: %v", err)
			continue
		}
		fmt.Printf("%-12s  %s/table/%s\n", name, host, token)
		count++
	}

	if count == 0 {
		fmt.Println("No active tables found. Run migrations first.")
	}

	fmt.Println()
	fmt.Printf("Tip: on mobile, replace 'localhost' with your LAN IP\n")
	fmt.Printf("     e.g.  FE_HOST=http://192.168.1.x:3000 go run ./be/cmd/qr/main.go\n")
	fmt.Println()
}
