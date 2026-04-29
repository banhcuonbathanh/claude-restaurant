| 📋
HỆ THỐNG QUẢN LÝ QUÁN BÁNH CUỐN
SPEC 4 — Orders API (Backend)
Model: Sonnet · Branch: feat/4-orders-api · Phụ thuộc: specs/2.md + specs/1.md
Go Gin · sqlc · WebSocket · SSE · Redis Pub/Sub |
| --- |

| ℹ️  Orders API — State machine, combo expand, SSE cho customer tracking, WebSocket cho KDS và live orders. Core business logic của toàn hệ thống. |
| --- |

**Model:** Sonnet | **Branch:** `feat/4-orders-api` | **Phụ thuộc:** `specs/2.md` (Products) + `specs/1.md` (Auth)

**1. Mục Tiêu**
Xây dựng Orders API đầy đủ: tạo đơn, cập nhật trạng thái, theo dõi realtime qua SSE và WebSocket.
Đây là core business logic của hệ thống — KDS, POS, và order tracking đều phụ thuộc spec này.

**2. Phạm Vi**
| Phần | Nội Dung |
| --- | --- |
| Backend | CRUD orders, state machine, SSE stream cho customer, WS broadcast cho KDS |
| Frontend dùng | /order/[id] SSE (spec 3), /kitchen WS, /cashier POS, /orders/live WS |
| Không thuộc spec này | Payment processing (spec 5), Inventory deduction (gọi inventory service khi item done) |

**3. Database Schema**
| orders ( |
| --- |
| id               INT PK AUTO_INCREMENT, |
| table_id         VARCHAR(20),              -- null nếu order online |
| customer_name    VARCHAR(100) NOT NULL, |
| customer_phone   VARCHAR(20) NOT NULL, |
| status           ENUM('pending','confirmed','preparing','ready','delivered','cancelled') DEFAULT 'pending', |
| payment_method   ENUM('vnpay','momo','zalopay','cod') NOT NULL, |
| total_amount     DECIMAL(12,0) NOT NULL, |
| note             TEXT, |
| created_by_role  ENUM('customer','cashier','staff') NOT NULL, |
| staff_id         INT REFERENCES staff(id),  -- null nếu customer tự đặt |
| created_at       DATETIME DEFAULT NOW(), |
| updated_at       DATETIME DEFAULT NOW() ON UPDATE NOW() |
| ) |
|  |
| order_items ( |
| id               INT PK AUTO_INCREMENT, |
| order_id         INT NOT NULL REFERENCES orders(id), |
| product_id       INT REFERENCES products(id),   -- null nếu là combo item |
| combo_id         INT REFERENCES combos(id),     -- null nếu là product |
| combo_ref_id     INT REFERENCES order_items(id), -- null nếu là parent combo row |
| name             VARCHAR(200) NOT NULL,          -- snapshot tên tại thời điểm order |
| quantity         INT NOT NULL DEFAULT 1, |
| qty_served       INT NOT NULL DEFAULT 0, |
| unit_price       DECIMAL(10,0) NOT NULL,         -- snapshot giá |
| topping_snapshot JSON,                           -- snapshot toppings đã chọn |
| status           ENUM('pending','preparing','done') DEFAULT 'pending', |
| flagged          BOOLEAN DEFAULT false,           -- 🚩 flag từ bếp |
| created_at       DATETIME DEFAULT NOW() |
| ) |

| ℹ️  **Combo expand logic:** Khi order 1 Combo Gia Đình → tạo 1 row combo parent + N rows sub-items (product_id của từng món, `combo_ref_id` trỏ về combo row). Kitchen thấy từng sub-item riêng lẻ để track qty_served chính xác. |
| --- |

**4. Order State Machine**
| pending → confirmed → preparing → ready → delivered |
| --- |
| ↘ cancelled  (chỉ khi SUM(qty_served) / SUM(quantity) < 30%) |

| Transition | Who | Điều kiện |
| --- | --- | --- |
| pending → confirmed | Cashier/Staff/Manager | Manual confirm hoặc auto sau 30s |
| confirmed → preparing | Auto | Khi Chef click item đầu tiên |
| preparing → ready | Auto | Khi tất cả items đều done |
| ready → delivered | Cashier/Staff | Sau khi thanh toán xong (spec 5) |
| any → cancelled | Customer/Cashier | SUM(qty_served)/SUM(quantity) < 0.30 |

**5. API Endpoints**
**5.1 Orders CRUD**
| Method | Path | Role | Mô tả |
| --- | --- | --- | --- |
| POST | /api/v1/orders | Customer/Cashier+ | Tạo đơn mới |
| GET | /api/v1/orders | Cashier+ | Danh sách orders (filter by status, date) |
| GET | /api/v1/orders/:id | Auth | Lấy chi tiết đơn (customer chỉ xem của mình) |
| PATCH | /api/v1/orders/:id/status | Cashier+ | Update order status |
| DELETE | /api/v1/orders/:id | Customer/Cashier+ | Huỷ đơn (< 30% done) |

**5.2 Order Items**
| Method | Path | Role | Mô tả |
| --- | --- | --- | --- |
| PATCH | /api/v1/orders/:id/items/:itemId/status | Chef+ | Cycle status (KDS click) |
| PATCH | /api/v1/orders/:id/items/:itemId/flag | Chef+ | Toggle flag 🚩 |

**5.3 Real-time**
| Method | Path | Role | Mô tả |
| --- | --- | --- | --- |
| GET | /api/v1/orders/:id/sse | Auth | SSE stream cho customer order tracking |
| WS | /api/v1/ws/kitchen | Chef+ | WebSocket: tất cả orders mới + item updates |
| WS | /api/v1/ws/orders-live | Cashier+ | WebSocket: orders live grid |

**6. Request / Response**
**POST /orders**
| // Request — Customer (guest token) hoặc Cashier |
| --- |
| { |
| "customer_name": "Nguyễn Văn A", |
| "customer_phone": "0901234567", |
| "note": "Ít cay", |
| "payment_method": "cod", |
| "table_id": "A3",          // null nếu order online |
| "items": [ |
| { |
| "product_id": 1, |
| "combo_id": null, |
| "quantity": 2, |
| "unit_price": 55000,   // base_price + topping delta — FE tính |
| "topping_snapshot": [ |
| { "id": 1, "name": "Chả lụa", "price_delta": 10000 } |
| ] |
| }, |
| { |
| "product_id": null, |
| "combo_id": 1, |
| "quantity": 1, |
| "unit_price": 180000, |
| "topping_snapshot": null |
| } |
| ] |
| } |
|  |
| // Response 201 |
| { |
| "id": 1234, |
| "status": "pending", |
| "total_amount": 290000, |
| "created_at": "2026-04-09T14:30:00Z" |
| } |

**Validation**
- Cart không được rỗng
- product_id hoặc combo_id phải có 1 (không được cả 2 null)
- unit_price > 0
- table_id nếu có: kiểm tra không có ACTIVE order ở bàn đó (status IN pending,confirmed,preparing,ready)
- 1 table → max 1 ACTIVE order — trả 409 nếu vi phạm
**Combo expand (trong transaction)**
| // Khi item có combo_id: |
| --- |
| // 1. Query combo_items từ DB |
| // 2. Tạo 1 order_item row cho combo (combo_id set, product_id null) |
| // 3. Tạo N sub-item rows (product_id của mỗi món, combo_ref_id = combo_item.id) |
| // 4. Kitchen sẽ thấy sub-items; customer tracking thấy cả 2 |

**GET /orders/:id**
| // Response 200 |
| --- |
| { |
| "id": 1234, |
| "status": "preparing", |
| "table_id": "A3", |
| "customer_name": "Nguyễn Văn A", |
| "customer_phone": "0901234567", |
| "payment_method": "cod", |
| "total_amount": 290000, |
| "note": "Ít cay", |
| "created_at": "2026-04-09T14:30:00Z", |
| "items": [ |
| { |
| "id": 1, |
| "product_id": 1, |
| "name": "Bánh Cuốn Thịt", |
| "quantity": 2, |
| "qty_served": 1, |
| "unit_price": 55000, |
| "status": "preparing", |
| "topping_snapshot": [...], |
| "flagged": false, |
| "combo_ref_id": null |
| } |
| ] |
| } |

**PATCH /orders/:id/items/:itemId/status**
| // Request — Chef click KDS |
| --- |
| // Không cần body — server tự cycle: pending → preparing → done |
| {} |
|  |
| // Response 200 |
| { |
| "item_id": 1, |
| "new_status": "done", |
| "qty_served": 2, |
| "order_status": "ready"   // nếu tất cả items done |
| } |
|  |
| // Side effects: |
| // 1. Update item status trong DB (transaction) |
| // 2. Trigger inventory deduction nếu status → done (gọi inventory service) |
| // 3. Nếu tất cả items done → auto update order.status = "ready" |
| // 4. Broadcast SSE event "item_progress" tới customer |
| // 5. Broadcast WS event tới /ws/kitchen và /ws/orders-live |

| ℹ️  **Inventory rollback:** Nếu inventory deduction thất bại → rollback cả transaction, trả **409** (không phải 500) cho KDS. KDS hiện toast "Hết nguyên liệu, không thể cập nhật". |
| --- |

**7. SSE Implementation (Go)**
| // GET /api/v1/orders/:id/sse |
| --- |
| func (h *OrderHandler) StreamOrderSSE(c *gin.Context) { |
| orderID := c.Param("id") |
|  |
| c.Header("Content-Type", "text/event-stream") |
| c.Header("Cache-Control", "no-cache") |
| c.Header("Connection", "keep-alive") |
|  |
| // Subscribe Redis Pub/Sub channel: "order:{orderID}" |
| sub := h.redis.Subscribe(ctx, fmt.Sprintf("order:%s", orderID)) |
| defer sub.Close() |
|  |
| // Send initial state |
| order := h.service.GetOrder(orderID) |
| sendSSEEvent(c, "order_init", order) |
|  |
| // Stream events |
| for msg := range sub.Channel() { |
| sendSSEEvent(c, msg.Type, msg.Payload) |
| if msg.Type == "order_completed" { return } |
| } |
| } |
|  |
| // Event types published to Redis: |
| // order_status_changed: { order_id, status } |
| // item_progress: { order_id, item_id, qty_served, status } |
| // order_completed: { order_id } |

**8. WebSocket (Go)**
| // WS /api/v1/ws/kitchen |
| --- |
| // Hub pattern: 1 goroutine per connection |
| // Events pushed to kitchen: |
| // - new_order: khi order mới tạo |
| // - item_updated: khi item status thay đổi |
| // - order_cancelled: khi order bị huỷ |
|  |
| // WS /api/v1/ws/orders-live |
| // Events: |
| // - order_created: { order summary } |
| // - order_status_changed: { order_id, status } |
| // - item_progress: { order_id, item_id, qty_served } |
|  |
| // Low-stock broadcast (Manager/Admin only): |
| // Chỉ gửi tới client có role manager hoặc admin |
| // Event: low_stock_alert { item_id, item_name, current_qty, min_alert_level } |

**9. Business Rules Quan Trọng**
| Rule | Xử lý |
| --- | --- |
| 1 bàn 1 đơn active | Kiểm tra trước khi tạo → 409 nếu vi phạm |
| Chỉ tạo Payment khi ready | Check trong Payment handler (spec 5) |
| Huỷ < 30% | DELETE /orders/:id kiểm tra: SUM(qty_served)/SUM(quantity) < 0.30 → 409 nếu không |
| Customer chỉ xem đơn của mình | GET /orders/:id: kiểm tra JWT sub match với order's guest token |
| Inventory deduction khi item done | Gọi inventory service trong same transaction — rollback → 409 |
| Combo expand trong transaction | Tất cả rows tạo trong 1 DB transaction — rollback nếu bất kỳ fail |

**10. File Structure**
| Backend: |
| --- |
| internal/ |
| orders/ |
| handler.go          // HTTP + SSE + WS handlers |
| service.go          // Business logic, state machine |
| hub.go              // WebSocket hub (goroutine-safe) |
| repository/ |
| orders_queries.sql  // sqlc SQL |
| orders.go           // sqlc generated |

**11. Acceptance Criteria**
- [ ] POST /orders tạo đúng order_items (kể cả combo expand)
- [ ] 1 bàn 1 active order — trả 409 khi vi phạm
- [ ] State machine đúng thứ tự — không skip
- [ ] Chef click KDS → status cycle → SSE push tới customer
- [ ] Inventory deduction thất bại → rollback → 409 (không 500)
- [ ] Huỷ đơn < 30% → success; ≥ 30% → 409
- [ ] Customer không xem được đơn của người khác
- [ ] WS Kitchen nhận new_order ngay khi tạo
- [ ] SSE reconnect phía client (spec 3) hoạt động bình thường

🍜 BanhCuon System · SPEC 4 — Orders API (Backend) · ECC-Free · Tháng 4 / 2026