| 📋  HỆ THỐNG QUẢN LÝ QUÁN BÁNH CUỐN
API CONTRACT — Tài Liệu Giao Tiếp Frontend ↔ Backend
v1.2  ·  Go Gin · REST · WebSocket · SSE · JWT · RBAC  ·  Tháng 4/2026
Thay đổi từ v1.1: +POST /auth/guest (Issue #7) · +GET /orders/:id/events SSE · +WS endpoints · +order_items status derived (Issue #5) |
| --- |

| ℹ️ Tài liệu này định nghĩa toàn bộ API contract giữa Frontend (Next.js 14) và Backend (Go Gin). v1.2 thêm: POST /auth/guest cho QR customers (stateless JWT), GET /orders/:id/events (SSE), WS /ws/kds và /ws/orders-live. order_items.status được derive từ qty_served — không có ENUM column. |
| --- |

# Section 1 — Tổng Quan & Quy Ước
## 1.1 Base URL & Ports
| Backend API  :  http://localhost:8002/api/v1      (dev)
Frontend     :  http://localhost:3000             (dev)
Production   :  https://your-domain.com/api/v1   (via Caddy) |
| --- |

## 1.2 Request Format
• Content-Type: application/json  cho tất cả JSON requests
• Content-Type: multipart/form-data  cho file upload
• Authorization: Bearer <access_token>  cho authenticated endpoints

## 1.3 Response Format
| // Success — chỉ có "data", không có "success" field
{
  "data": { ... },
  "message": "optional"
}

// Error — theo ERROR_CONTRACT.docx (SINGLE SOURCE)
{
  "error":   "SCREAMING_SNAKE_CODE",
  "message": "Thông báo tiếng Việt cho user",
  "details": {}    // optional
} |
| --- |

## 1.4 ID Format
| ℹ️ Tất cả IDs là UUID string (CHAR(36)) — không phải integer. Ví dụ: "id": "550e8400-e29b-41d4-a716-446655440000" |
| --- |

## 1.5 HTTP Status Codes
| HTTP Code | Ý Nghĩa |
| --- | --- |
| 200 OK | Request thành công, có data trả về |
| 201 Created | Tạo mới resource thành công |
| 204 No Content | Thành công, không có data trả về (DELETE) |
| 400 Bad Request | Input validation lỗi — kiểm tra request body |
| 401 Unauthorized | Token thiếu hoặc hết hạn — gọi /auth/refresh |
| 403 Forbidden | Token hợp lệ nhưng không đủ quyền (RBAC) |
| 404 Not Found | Resource không tồn tại |
| 409 Conflict | Business rule violation |
| 422 Unprocessable | File type/size không hợp lệ |
| 429 Too Many Req | Rate limit exceeded |
| 500 Internal Err | Server error — không expose chi tiết ra client |

## 1.6 RBAC Role Hierarchy
| Customer < Chef < Cashier < Staff < Manager < Admin
Public    = Không cần token
Any auth  = Bất kỳ role nào có token hợp lệ
Chef+     = Chef, Cashier, Staff, Manager, Admin
Cashier+  = Cashier, Staff, Manager, Admin
Staff+    = Staff, Manager, Admin
Manager+  = Manager, Admin
Admin     = Admin only
Owner     = Customer chủ đơn hoặc Staff+
CV Svc    = CV Service (X-CV-Secret header)
Guest     = QR customer với guest JWT (customer role, sub='guest') |
| --- |

## 1.7 Authentication Flow
| ℹ️ Staff: Access Token 24h, Refresh Token 30d httpOnly cookie. Khi nhận 401, FE tự gọi /auth/refresh một lần, nếu thất bại → redirect /login. Guest (QR): 2h stateless JWT — không có refresh, quét lại QR khi hết hạn. |
| --- |

# Section 2 — Auth Endpoints
| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| POST | /api/v1/auth/login | Đăng nhập staff — trả access token + set refresh cookie | Public |
| POST | /api/v1/auth/refresh | Làm mới access token dùng refresh cookie | Public |
| POST | /api/v1/auth/logout | Xóa refresh token khỏi Redis, clear cookie | Any auth |
| GET | /api/v1/auth/me | Thông tin user đang đăng nhập | Any auth |
| POST | /api/v1/auth/guest | 🆕 Tạo guest JWT cho QR customer (stateless, 2h TTL) | Public |

## POST /auth/login — Request
| Field | Type | Required | Mô Tả |
| --- | --- | --- | --- |
| username | string | Required | Username của staff |
| password | string | Required | Password (bcrypt so sánh server-side) |

## POST /auth/login — Response 200
| {
  "data": {
    "access_token": "eyJhbGci...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID string
      "username": "nguyen_van_a",
      "full_name": "Nguyen Van A",
      "role": "manager",
      "email": "nva@banhcuon.vn"
    }
  }
}
// Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=Strict |
| --- |

## POST /auth/guest — NEW (Issue #7) — Request & Response
| 🆕  v1.2 NEW: Endpoint này cho phép QR customer lấy guest JWT để đặt món. Stateless — BE chỉ sign JWT, không lưu DB. Rate limit: 5 req/min per IP. |
| --- |

| Field | Type | Required | Mô Tả |
| --- | --- | --- | --- |
| qr_token | string | Required | Token từ QR code (CHAR(64) hex, unique per table) |

| // Response 200 — Guest JWT
{
  "data": {
    "access_token": "eyJhbGci...",    // Guest JWT, 2h TTL
    "expires_in": 7200,                // seconds
    "table": {
      "id": "7f3d2b1a-...",           // UUID string
      "name": "Ban 01",
      "capacity": 4,
      "status": "available"
    }
  }
}

// Guest JWT payload (decoded):
// { sub: 'guest', role: 'customer', table_id: '<UUID>', jti: '<UUID>', exp: now+7200 }

// Error cases:
// 404 — qr_token không tồn tại hoặc table is_active = false
// 409 — table đã có active order (trả active_order_id trong details)
// 429 — rate limit (5 req/min per IP) |
| --- |

| ⚠️  QUAN TRỌNG: Không có refresh cho guest token. FE phải detect 401 + sub='guest' → redirect về /table/:tableId để quét QR lại, KHÔNG gọi /auth/refresh như staff flow. |
| --- |

# Section 3 — Products & Catalog
| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| GET | /api/v1/products | List tất cả sản phẩm active kèm toppings | Public |
| GET | /api/v1/products/:id | Chi tiết một sản phẩm | Public |
| POST | /api/v1/products | Tạo sản phẩm mới | Manager+ |
| PUT | /api/v1/products/:id | Cập nhật sản phẩm | Manager+ |
| DELETE | /api/v1/products/:id | Soft-delete — set is_active=false | Admin |
| GET | /api/v1/categories | List tất cả categories active (đã sort) | Public |
| GET | /api/v1/toppings | List tất cả toppings active | Public |
| GET | /api/v1/combos | List combos kèm combo_items expanded | Public |

# Section 4 — Orders
| ℹ️ Order State Machine: pending → confirmed → preparing → ready → delivered │ cancelled. Huỷ đơn chỉ được phép khi tổng qty_served / tổng quantity < 30%. 1 bàn chỉ được phép 1 ACTIVE order cùng lúc. order_items status được DERIVE từ qty_served — xem MASTER.docx §4.1.1. |
| --- |

| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| POST | /api/v1/orders | Tạo đơn mới (online hoặc POS offline) | Customer+ |
| GET | /api/v1/orders/:id | Chi tiết đơn — kiểm tra ownership | Owner / Staff+ |
| PATCH | /api/v1/orders/:id/status | Cập nhật status đơn | Chef+ |
| PATCH | /api/v1/orders/items/:id | Update qty_served — trigger deduct kho | Chef+ |
| DELETE | /api/v1/orders/:id | Huỷ đơn nếu < 30% done | Owner / Manager+ |
| GET | /api/v1/orders/live | List tất cả đơn đang active | Staff+ |
| GET | /api/v1/orders/:id/events | 🆕 SSE stream — order tracking realtime | Owner / Staff+ |

## POST /orders — Request Body
| Field | Type | Required | Mô Tả |
| --- | --- | --- | --- |
| table_id | string (UUID) | Optional | UUID bàn (QR/POS) — null nếu online delivery |
| source | string | Required | "online" │ "qr" │ "pos" |
| note | string | Optional | Ghi chú đơn |
| customer_name | string | Optional | Tên khách (cho online/delivery) |
| customer_phone | string | Optional | SĐT khách |
| items | array | Required | Danh sách món đặt (xem sub-schema bên dưới) |

### items[] sub-schema
| Field | Type | Required | Mô Tả |
| --- | --- | --- | --- |
| product_id | string (UUID) | Optional | UUID sản phẩm (null nếu là combo header) |
| combo_id | string (UUID) | Optional | UUID combo — BE tự expand thành sub-items |
| quantity | integer | Required | Số lượng (> 0) |
| toppings | array | Optional | [{ topping_id: UUID, quantity: int }] — snapshot giá tại thời điểm đặt |
| note | string | Optional | Ghi chú riêng cho món |

## GET /orders/:id/events — SSE Stream (NEW v1.2)
| 🆕  v1.2: Endpoint SSE cho order tracking. Customer và Staff+ subscribe để nhận realtime updates về tiến độ đơn. Ref: MASTER.docx §5.2 cho full SSE config. |
| --- |

| // Request
GET /api/v1/orders/:id/events
Authorization: Bearer <access_token>    // Header auth (SSE supports headers)
Accept: text/event-stream

// Server sends on connect: initial state
event: order_init
data: { "type": "order_init", "data": { <full order object> } }

// Ongoing events:
event: order_status_changed
data: { "type": "order_status_changed", "data": { "order_id": "...", "status": "preparing" } }

event: item_progress
data: { "type": "item_progress", "data": {
  "order_id": "...", "item_id": "...",
  "qty_served": 1, "quantity": 2,
  "item_status": "preparing",    // derived: pending|preparing|done
  "progress_pct": 50
} }

event: order_completed
data: { "type": "order_completed", "data": { "order_id": "..." } }

// Heartbeat every 15s:
: keep-alive

// Config: maxAttempts=5, baseDelay=1000ms, maxDelay=30000ms |
| --- |

| ⚠️  item_status field: Derived từ qty_served theo MASTER §4.1.1. BE tính toán và include trong SSE payload — FE không cần derive lại. |
| --- |

# Section 5 — Payments
| ℹ️ Payment chỉ được tạo khi order.status = "ready". Webhook endpoints được ký (signed) bởi gateway — BE verify signature trước khi xử lý. |
| --- |

| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| POST | /api/v1/payments | Tạo payment cho order có status=ready | Cashier+ |
| POST | /api/v1/payments/webhook/vnpay | VNPay IPN webhook (signature verified) | Public (signed) |
| POST | /api/v1/payments/webhook/momo | MoMo webhook (signature verified) | Public (signed) |
| POST | /api/v1/payments/webhook/zalopay | ZaloPay webhook (signature verified) | Public (signed) |

# Section 6 — Tables
| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| GET | /api/v1/tables | List tất cả bàn (kèm status) | Staff+ |
| POST | /api/v1/tables | Tạo bàn mới | Manager+ |
| PATCH | /api/v1/tables/:id | Cập nhật bàn (name, capacity, status) | Manager+ |
| GET | /api/v1/tables/qr/:token | Decode QR token → trả table info + active order (nếu có) | Public |

## GET /tables/qr/:token — Response 200
| {
  "data": {
    "table": {
      "id": "7f3d2b1a-...",  // UUID string
      "name": "Ban 01",
      "capacity": 4,
      "status": "available"
    },
    "active_order": null  // hoặc order object nếu đang có đơn active
  }
}

// Rate limit: 10 req/min per IP |
| --- |

# Section 7 — File Upload
| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| POST | /api/v1/files/upload | Upload ảnh/file — trả object_path để lưu vào record | Staff+ |
| DELETE | /api/v1/files/:id | Đánh dấu is_orphan=true — cleanup job xóa sau 24h | Staff+ |

# Section 8 — Inventory (Phase 2)
| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| GET | /api/v1/inventory | Danh sách tồn kho + threshold | Manager+ |
| POST | /api/v1/inventory | Tạo nguyên liệu mới | Manager+ |
| PATCH | /api/v1/inventory/:id | Cập nhật qty / threshold / tên | Manager+ |
| DELETE | /api/v1/inventory/:id | Xóa nguyên liệu (chưa có recipe dùng) | Admin |
| GET | /api/v1/inventory/low-stock | Danh sách nguyên liệu sắp hết | Manager+ |
| GET | /api/v1/products/:id/recipe | Công thức nguyên liệu của một sản phẩm | Manager+ |
| PUT | /api/v1/products/:id/recipe | Upsert toàn bộ công thức (replace) | Manager+ |
| POST | /api/v1/inventory/:id/adjust | Điều chỉnh thủ công + ghi log | Manager+ |
| GET | /api/v1/inventory/:id/logs | Lịch sử thay đổi kho (có pagination) | Manager+ |

# Section 9 — Dashboard & Reports (Phase 2)
| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| GET | /api/v1/dashboard/summary | 4 KPI: revenue, orders, active, low-stock | Manager+ |
| GET | /api/v1/dashboard/revenue-by-hour | Doanh thu theo 24 giờ hôm nay | Manager+ |
| GET | /api/v1/dashboard/top-products | Top 10 sản phẩm bán chạy | Manager+ |
| GET | /api/v1/reports/revenue | Revenue report với granularity | Manager+ |
| GET | /api/v1/reports/orders | Orders report có filter | Manager+ |
| GET | /api/v1/reports/products | Products report theo kỳ | Manager+ |
| GET | /api/v1/reports/revenue/export | CSV export revenue (streaming) | Manager+ |
| GET | /api/v1/reports/orders/export | CSV export orders (streaming) | Manager+ |

# Section 10 — Realtime: WebSocket & SSE
## 10.1 WebSocket — Kitchen & Live Orders
| 🆕  v1.2: WebSocket endpoints được document đầy đủ. 2 endpoints WS riêng biệt — /ws/kds cho Chef, /ws/orders-live cho Staff+. |
| --- |

| // WS Endpoint 1: Kitchen Display System
ws://{host}/api/v1/ws/kds
Auth: ?token=<access_token>    // query param (WS browser cannot set headers)
Role: Chef+

// WS Endpoint 2: Live Orders Monitor
ws://{host}/api/v1/ws/orders-live
Auth: ?token=<access_token>
Role: Staff+

// Reconnect config (dùng chung cho mọi WS + SSE):
const WS_RECONNECT = {
  maxAttempts:   5,
  baseDelay:     1000,   // ms, x2 mỗi lần retry (exponential backoff)
  maxDelay:      30000,  // ms cap
  showBannerAfter: 3,    // lần thất bại trước khi hiện banner 'Mất kết nối'
} |
| --- |

### WS Event Types — Server → Client
| Event Type | Payload | Gửi Tới | Mô Tả |
| --- | --- | --- | --- |
| new_order | order object | Staff+ (/kds + /orders-live) | Đơn mới vừa được tạo |
| order_updated | { order_id, status } | Staff+ | Order status thay đổi |
| item_progress | { order_id, item_id, qty_served, quantity, item_status, progress_pct } | Staff+ | qty_served của 1 item thay đổi |
| order_completed | { order_id } | Any auth | Tất cả items done → order ready |
| payment_success | { payment_id, order_id } | Cashier+ | Payment webhook confirmed |
| low_stock | { item_id, current_qty, threshold } | Manager+ | Nguyên liệu xuống dưới threshold |

| ℹ️  item_status trong WS: Cũng derived từ qty_served (MASTER §4.1.1) — BE tính và include trong payload. Giống SSE item_progress payload. |
| --- |

## 10.2 SSE — Order Tracking
| ℹ️ Xem GET /orders/:id/events trong Section 4 cho full spec. Ref: MASTER.docx §5.2 cho reconnect config. |
| --- |

# Section 11 — CV Integration (Phase 3)
| Method | Endpoint | Mô Tả | Role |
| --- | --- | --- | --- |
| POST | /api/v1/cv/counts | Nhận dish counts từ cv-service (X-CV-Secret) | CV Svc |
| GET | /api/v1/cv/counts | Lịch sử dish counts có pagination | Manager+ |
| GET | /api/v1/cv/snapshot | Latest JPEG snapshot từ camera bếp | Manager+ |
| GET | /api/v1/cv/health | CV service health check status | Manager+ |
| GET | /api/v1/cv/cameras | Danh sách cameras đã đăng ký | Manager+ |

# Section 12 — Error Codes
| → SINGLE SOURCE: ERROR_CONTRACT.docx Không định nghĩa error codes trong file này. Mọi error code, HTTP mapping, Go handler pattern, FE interceptor pattern → xem ERROR_CONTRACT.docx. v1.1 CHANGE: Section 11 (v1.0) đã xoá để tránh duplicate. |
| --- |

# Changelog
| Version | Date | Changes |
| --- | --- | --- |
| v1.0 | Tháng 4/2026 | Initial release |
| v1.1 | Tháng 4/2026 | UUID string IDs, bỏ 'success' field, Section 12 → pointer sang ERROR_CONTRACT |
| v1.2 | Tháng 4/2026 | +POST /auth/guest (Issue #7 resolved — stateless guest JWT 2h TTL) · +GET /orders/:id/events SSE · +WS /ws/kds + /ws/orders-live explicit doc · +item_status derived field · order_items status Approach B (Issue #5 resolved) |

| 📋  BanhCuon System  ·  API CONTRACT  ·  v1.2  ·  Issue #5 + #7 RESOLVED  ·  Tháng 4/2026 |
| --- |
