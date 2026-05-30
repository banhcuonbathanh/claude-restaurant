// One-shot seed script — run once to insert demo accounts for all roles.
// Usage: go run ./be/cmd/seed/main.go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	bcryptpkg "banhcuon/be/pkg/bcrypt"
	_ "github.com/go-sql-driver/mysql"
)

type account struct {
	id       string
	username string
	fullName string
	role     string
	phone    string
}

var accounts = []account{
	{"seed-admin-001",    "admin",    "Quản Trị Viên", "admin",    "0900000001"},
	{"seed-manager-001",  "manager",  "Quản Lý",       "manager",  "0900000002"},
	{"seed-cashier-001",  "cashier",  "Thu Ngân",      "cashier",  "0900000003"},
	{"seed-chef-001",     "chef",     "Đầu Bếp",       "chef",     "0900000004"},
	{"seed-staff-001",    "staff",    "Nhân Viên",     "staff",    "0900000005"},
}

const password = "Admin@123"

func main() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "banhcuon:banhcuonpass@tcp(127.0.0.1:3306)/banhcuon?parseTime=true&charset=utf8mb4"
	}

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatalf("ping db: %v", err)
	}

	hash, err := bcryptpkg.Hash(password)
	if err != nil {
		log.Fatalf("bcrypt: %v", err)
	}

	const q = `INSERT INTO staff (id, username, password_hash, full_name, role, phone, is_active, created_at, updated_at)
	           VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
	           ON DUPLICATE KEY UPDATE
	             password_hash = VALUES(password_hash),
	             full_name     = VALUES(full_name),
	             role          = VALUES(role),
	             is_active     = 1`

	for _, a := range accounts {
		if _, err := db.Exec(q, a.id, a.username, hash, a.fullName, a.role, a.phone); err != nil {
			log.Printf("SKIP %s: %v", a.username, err)
			continue
		}
		fmt.Printf("✓ %-10s  role=%-10s  username=%-12s  password=%s\n", a.fullName, a.role, a.username, password)
	}
}
