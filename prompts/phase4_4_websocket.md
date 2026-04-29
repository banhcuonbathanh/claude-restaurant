# Phase 4.4 — WebSocket Hub
> Dependency: Task 4.3 orders working ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §5.1 §8 (WS config, Redis pub/sub keys)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `contract/API_CONTRACT_v1.1.docx` §10.1 (WS event types per role)
- [ ] `qui_trinh/BanhCuon_Project_Checklist.md` (Task 4.4 section)

---

## Prompt

```
You are the System Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §5.1+§8, ERROR_CONTRACT, API_CONTRACT §10.1, 
and the Project Checklist Task 4.4 section above.

## Task: Build WebSocket hub + 3 WS endpoints (Task 4.4)

### Step 1: be/pkg/redis/pubsub.go
- Publish(ctx, channel, message string) error
- Subscribe(ctx, channels ...string) *redis.PubSub
- Unsubscribe(sub *redis.PubSub, channels ...string) error

### Step 2: be/pkg/redis/bloom.go
- Add(ctx, key, value string) error
- Exists(ctx, key, value string) (bool, error)
Used for: bloom:order_exists, bloom:product_ids

### Step 3: be/internal/websocket/hub.go
Hub struct:
  clients    map[*Client]bool
  broadcast  chan []byte
  register   chan *Client
  unregister chan *Client
  mu         sync.RWMutex

Run() goroutine: handle register/unregister/broadcast channels.
Ping every 30s → close connection if no Pong within 10s.
Tag each client with role so hub can broadcast role-filtered events.

### Step 4: be/internal/websocket/handler.go + client.go
Handler: upgrade HTTP → WebSocket.
Auth: read JWT from ?token= query param 
🚨 WebSocket browser cannot set custom headers — token MUST be in query param.
Parse + validate token → get role → register client with hub.
Set read deadline 60s, write deadline 10s.

### Step 5: Wire 3 WS endpoints in cmd/server/main.go
- WS /api/v1/ws/kds          — RequireRole(2) Chef+
  Receives: new_order, item_updated, order_cancelled
- WS /api/v1/ws/orders-live  — RequireRole(2) Cashier+
  Receives: order_created, order_status_changed, item_progress
- WS /api/v1/ws/payments     — RequireRole(2) Cashier+
  Receives: payment_success

## Definition of Done
- [ ] WS client connects with valid ?token= JWT — receives events
- [ ] WS client with invalid token → 401 immediately
- [ ] Hub broadcasts new_order to /kds clients when order created
- [ ] Ping sent every 30s → connection closed if no Pong in 10s
- [ ] Role filter: chef events don't go to cashier clients and vice versa
- [ ] go build ./... passes
```
