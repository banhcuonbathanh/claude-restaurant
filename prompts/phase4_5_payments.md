# Phase 4.5 — Payments Backend
> ⚠️ Always confirm before running payment code — real money involved.
> Use sandbox credentials ONLY. Never commit real keys.
> Dependency: Task 4.3 orders working ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §4.3 §9 (payment rules, gateway env vars)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec_5_Payment_Webhooks.docx`
- [ ] `Task/Task 1 data base/006_payments_sql_v1.2.docx`
- [ ] `contract/API_CONTRACT_v1.1.docx` §5

---

## Prompt

```
You are the System Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §4.3+§9, ERROR_CONTRACT, Spec_5_Payments, 
006_payments.sql, and API_CONTRACT §5 above.

⚠️ This is payment code. Use sandbox credentials only. Ask me to confirm 
before running any code that touches payment APIs.

## Task: Build payments backend (Task 4.5)

### Step 1: be/internal/payment/vnpay.go
- CreatePaymentURL(orderID, amount string) (qrURL, gatewayRef string, err error)
- VerifyWebhook(params map[string]string, hashSecret string) bool
  Verification steps (exact order):
  1. Remove vnp_SecureHash from params
  2. Sort params alphabetically by key
  3. Concatenate: key=value&key=value
  4. HMAC-SHA512(hashSecret, queryString)
  5. Compare with vnp_SecureHash — false if mismatch

### Step 2: be/internal/payment/momo.go
- CreatePayment(orderID, amount string) (qrURL, orderId string, err error)
- VerifyCallback(payload MoMoWebhook, secretKey string) bool — HMAC-SHA256

### Step 3: be/internal/payment/zalopay.go
- CreateOrder(orderID, amount string) (qrURL, appTransID string, err error)
- VerifyCallback(payload ZaloPayCallback, key1 string) bool — HMAC-SHA256

### Step 4: be/internal/handler/payment_handler.go

POST /api/v1/payments:
1. Get order → verify order.status == 'ready' → else 409
2. Check no existing payment → else 409 PAYMENT_001
3. COD: create payment status='completed', UPDATE order.status='delivered'
4. QR/online: call gateway API → create payment status='pending' → return qr_code_url

POST /api/v1/webhooks/vnpay (PUBLIC — NO JWT):
🔴 Step 1 MUST be HMAC verification — reject invalid before any DB access
1. VerifyWebhook → if false → return 400 PAYMENT_002, stop
2. Verify amount matches payment.amount in DB
3. Check payment.status → if 'completed' already → return 200 immediately (idempotency)
4. UPDATE payment: status='completed', gateway_ref, gateway_data, paid_at=NOW()
5. UPDATE order.status='delivered'
6. Broadcast WS payment_success to cashier clients
7. Return exactly: {"RspCode": "00", "Message": "Confirm Success"}

POST /api/v1/webhooks/momo — same pattern, HMAC-SHA256
POST /api/v1/webhooks/zalopay — same pattern

### Step 5: be/internal/jobs/payment_timeout.go
Listen to Redis keyspace notifications for payment_timeout:{id} expiry.
On expiry: if payment.status still 'pending' → UPDATE to 'failed'.

## Definition of Done
- [ ] POST /payments rejected when order.status ≠ 'ready' → 409
- [ ] COD: status='completed' + order.status='delivered' immediately
- [ ] QR: returns qr_code_url, status='pending'
- [ ] Webhook with wrong HMAC → rejected, no DB changes
- [ ] Webhook called twice → second call returns 200, no DB update
- [ ] Amount mismatch → log + reject
- [ ] Raw webhook body stored in gateway_data JSON column
- [ ] WS broadcasts payment_success after successful webhook
- [ ] No real API keys committed — only sandbox/REPLACE values
- [ ] go build ./... passes
```
