// Simulate a customer scanning a QR code and placing an order.
// Calls the real API: POST /auth/guest → GET /products → POST /orders.
//
// Usage:
//
//	go run ./be/cmd/demo_order/main.go
//	go run ./be/cmd/demo_order/main.go --table "Bàn 2" --items 4
//	go run ./be/cmd/demo_order/main.go --api http://localhost:8080 --table "Bàn 1"
package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// ── API response shapes ───────────────────────────────────────────────────────

type guestResp struct {
	Data struct {
		AccessToken string `json:"access_token"`
		Table       struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"table"`
	} `json:"data"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

type product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

type productsResp struct {
	Data []product `json:"data"`
}

type orderItem struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type createOrderReq struct {
	TableID string      `json:"table_id"`
	Source  string      `json:"source"`
	Items   []orderItem `json:"items"`
}

// POST /orders returns only the new order ID.
type createOrderResp struct {
	Data    struct{ ID string `json:"id"` } `json:"data"`
	Error   string                          `json:"error"`
	Message string                          `json:"message"`
}

// GET /orders/:id returns the full order.
type orderDetail struct {
	Data struct {
		ID          string `json:"id"`
		OrderNumber string `json:"order_number"`
		Status      string `json:"status"`
		TotalAmount int    `json:"total_amount"`
		TableName   string `json:"table_name"`
		Items       []struct {
			Name      string `json:"name"`
			Quantity  int    `json:"quantity"`
			UnitPrice int    `json:"unit_price"`
		} `json:"items"`
	} `json:"data"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

// ── helpers ───────────────────────────────────────────────────────────────────

func postJSON(url, token string, body any) ([]byte, error) {
	b, _ := json.Marshal(body)
	req, _ := http.NewRequest(http.MethodPost, url, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

func getJSON(url, token string) ([]byte, error) {
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

func formatVND(v int) string {
	s := fmt.Sprintf("%d", v)
	out := ""
	for i, c := range s {
		if i > 0 && (len(s)-i)%3 == 0 {
			out += "."
		}
		out += string(c)
	}
	return out + "đ"
}

// ── main ──────────────────────────────────────────────────────────────────────

func main() {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	apiURL := flag.String("api", "http://localhost:8080", "BE base URL")
	tableName := flag.String("table", "", "Table name to order from (default: random)")
	numItems := flag.Int("items", 3, "Number of distinct products to order (1–6)")
	flag.Parse()

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "banhcuon:banhcuonpass@tcp(127.0.0.1:3306)/banhcuon?parseTime=true&charset=utf8mb4"
	}

	// ── 1. Pick a table ───────────────────────────────────────────────────────
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatalf("ping db: %v", err)
	}

	type tableRow struct{ name, qrToken string }
	var tables []tableRow
	rows, err := db.Query(`SELECT name, qr_token FROM tables WHERE is_active=1 AND deleted_at IS NULL ORDER BY name`)
	if err != nil {
		log.Fatalf("query tables: %v", err)
	}
	for rows.Next() {
		var t tableRow
		if err := rows.Scan(&t.name, &t.qrToken); err != nil {
			log.Printf("scan: %v", err)
			continue
		}
		tables = append(tables, t)
	}
	rows.Close()

	if len(tables) == 0 {
		log.Fatal("No active tables found. Create tables first (see command.md).")
	}

	chosen := tables[rng.Intn(len(tables))]
	if *tableName != "" {
		found := false
		for _, t := range tables {
			if t.name == *tableName {
				chosen = t
				found = true
				break
			}
		}
		if !found {
			log.Fatalf("Table %q not found. Available: %v", *tableName, func() []string {
				var ns []string
				for _, t := range tables {
					ns = append(ns, t.name)
				}
				return ns
			}())
		}
	}

	fmt.Println()
	fmt.Printf("=== Demo Order — %s ===\n", chosen.name)
	fmt.Println()
	fmt.Printf("Step 1  Scanning QR for %s...\n", chosen.name)

	// ── 2. Guest login (scan QR) ──────────────────────────────────────────────
	raw, err := postJSON(*apiURL+"/api/v1/auth/guest", "", map[string]string{"qr_token": chosen.qrToken})
	if err != nil {
		log.Fatalf("guest login: %v", err)
	}
	var gr guestResp
	if err := json.Unmarshal(raw, &gr); err != nil {
		log.Fatalf("parse guest resp: %v\nraw: %s", err, raw)
	}
	if gr.Error != "" {
		log.Fatalf("guest login error: %s — %s", gr.Error, gr.Message)
	}
	token := gr.Data.AccessToken
	tableID := gr.Data.Table.ID
	fmt.Printf("        ✓ Got guest JWT for %s (table_id=%s)\n\n", gr.Data.Table.Name, tableID)

	// ── 3. Browse menu ────────────────────────────────────────────────────────
	fmt.Println("Step 2  Browsing menu...")
	raw, err = getJSON(*apiURL+"/api/v1/products", token)
	if err != nil {
		log.Fatalf("get products: %v", err)
	}
	var pr productsResp
	if err := json.Unmarshal(raw, &pr); err != nil {
		log.Fatalf("parse products: %v\nraw: %s", err, raw)
	}
	// filter out free items (price=0) — guest wouldn't normally order those
	var available []product
	for _, p := range pr.Data {
		if p.Price > 0 {
			available = append(available, p)
		}
	}
	if len(available) == 0 {
		log.Fatal("No priced products available. Run seed_real_menu.sql first.")
	}

	fmt.Printf("        ✓ Found %d products\n\n", len(available))

	// ── 4. Pick items randomly ────────────────────────────────────────────────
	n := *numItems
	if n > len(available) {
		n = len(available)
	}
	// shuffle and take first n
	rng.Shuffle(len(available), func(i, j int) { available[i], available[j] = available[j], available[i] })
	picked := available[:n]

	fmt.Println("Step 3  Adding to cart:")
	var items []orderItem
	for _, p := range picked {
		qty := rng.Intn(3) + 1 // 1–3
		fmt.Printf("        + %-25s x%d  (%s)\n", p.Name, qty, formatVND(int(p.Price)))
		items = append(items, orderItem{ProductID: p.ID, Quantity: qty})
	}
	fmt.Println()

	// ── 5. Place order ────────────────────────────────────────────────────────
	fmt.Println("Step 4  Placing order...")
	raw, err = postJSON(*apiURL+"/api/v1/orders", token, createOrderReq{
		TableID: tableID,
		Source:  "qr",
		Items:   items,
	})
	if err != nil {
		log.Fatalf("create order: %v", err)
	}
	var created createOrderResp
	if err := json.Unmarshal(raw, &created); err != nil {
		log.Fatalf("parse create order resp: %v\nraw: %s", err, raw)
	}
	if created.Error != "" {
		log.Fatalf("order error: %s — %s", created.Error, created.Message)
	}

	// ── 6. Fetch full order details ───────────────────────────────────────────
	raw, err = getJSON(*apiURL+"/api/v1/orders/"+created.Data.ID, token)
	if err != nil {
		log.Fatalf("get order: %v", err)
	}
	var od orderDetail
	if err := json.Unmarshal(raw, &od); err != nil {
		log.Fatalf("parse order detail: %v\nraw: %s", err, raw)
	}
	if od.Error != "" {
		log.Fatalf("get order error: %s — %s", od.Error, od.Message)
	}

	fmt.Println()
	fmt.Println("=== Order Placed ✓ ===")
	fmt.Printf("  Order  : %s\n", od.Data.OrderNumber)
	fmt.Printf("  Status : %s\n", od.Data.Status)
	fmt.Printf("  Table  : %s\n", od.Data.TableName)
	fmt.Println("  Items  :")
	for _, it := range od.Data.Items {
		fmt.Printf("           %-25s x%d  %s\n", it.Name, it.Quantity, formatVND(it.UnitPrice*it.Quantity))
	}
	fmt.Printf("  Total  : %s\n", formatVND(od.Data.TotalAmount))
	fmt.Println()
	fmt.Printf("Track: http://localhost:3000/order/%s\n", od.Data.ID)
	fmt.Println()
}
