//go:build integration

package integration

import (
	"fmt"
	"net/http"
	"testing"

	"banhcuon/be/internal/testhelper"
)

// ─── Order tests ──────────────────────────────────────────────────────────────

// TestIntegration_Order_Create_Success verifies POST /orders with a valid table
// and product returns 201 and an order id.
func TestIntegration_Order_Create_Success(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	id := createOrder(t, ts, tok) // seeds table + product internally
	if id == "" {
		t.Fatal("expected non-empty order id")
	}
}

// TestIntegration_Order_Create_NoAuth verifies POST /orders without a token → 401.
func TestIntegration_Order_Create_NoAuth(t *testing.T) {
	ts := setup(t)
	testhelper.SeedTable(t, ts.DB)
	testhelper.SeedProduct(t, ts.DB)
	body := fmt.Sprintf(`{"table_id":"%s","source":"pos","items":[{"product_id":"%s","quantity":1}]}`,
		testhelper.TestTableID, testhelper.TestProductID)
	resp := doPost(t, ts, "/api/v1/orders", body, "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

// TestIntegration_Order_Create_DuplicateTable verifies that creating a second active
// order for the same table returns 409 (1-table-1-active-order rule).
func TestIntegration_Order_Create_DuplicateTable(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	// First order — must succeed.
	createOrder(t, ts, tok)

	// Second order for the same table must be rejected.
	body := fmt.Sprintf(`{"table_id":"%s","source":"pos","items":[{"product_id":"%s","quantity":1}]}`,
		testhelper.TestTableID, testhelper.TestProductID)
	resp := doPost(t, ts, "/api/v1/orders", body, tok)
	resp.Body.Close()
	if resp.StatusCode != http.StatusConflict {
		t.Fatalf("duplicate table: expected 409, got %d", resp.StatusCode)
	}
}

// TestIntegration_Order_Get verifies GET /orders/:id returns 200 with an items array.
func TestIntegration_Order_Get(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	id := createOrder(t, ts, tok)

	resp := doGet(t, ts, "/api/v1/orders/"+id, tok)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	if d["id"] != id {
		t.Fatalf("expected id=%s, got %v", id, d["id"])
	}
	items, ok := d["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatal("expected non-empty items array")
	}
}

// TestIntegration_Order_ListLive verifies GET /orders/live (cashier+) returns 200.
// Admin token satisfies the cashier+ requirement.
func TestIntegration_Order_ListLive(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	createOrder(t, ts, tok)

	resp := doGet(t, ts, "/api/v1/orders/live", tok)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	list, ok := data["data"].([]any)
	if !ok {
		t.Fatal("expected data array in response")
	}
	if len(list) == 0 {
		t.Fatal("expected at least one live order")
	}
}

// TestIntegration_Order_UpdateStatus_Transition verifies that
// pending → confirmed → preparing → ready all return 200.
func TestIntegration_Order_UpdateStatus_Transition(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	id := createOrder(t, ts, tok)
	// advanceToReady calls PATCH three times and fails the test on any non-200.
	advanceToReady(t, ts, id, tok)
}

// TestIntegration_Order_Cancel verifies DELETE /orders/:id returns 204.
// The order is still pending (qty_served = 0 → < 30%), so cancellation must succeed.
func TestIntegration_Order_Cancel(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	id := createOrder(t, ts, tok)

	resp := doDelete(t, ts, "/api/v1/orders/"+id, tok)
	resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", resp.StatusCode)
	}
}

// ─── Payment tests ────────────────────────────────────────────────────────────

// TestIntegration_Payment_Create_Cash verifies POST /payments for a ready order
// with method=cash returns 201 and a payment id.
func TestIntegration_Payment_Create_Cash(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	orderID := createOrder(t, ts, tok)
	advanceToReady(t, ts, orderID, tok)

	body := fmt.Sprintf(`{"order_id":"%s","method":"cash"}`, orderID)
	resp := doPost(t, ts, "/api/v1/payments", body, tok)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	if d["id"] == nil || d["id"] == "" {
		t.Fatal("expected payment id in response")
	}
}

// TestIntegration_Payment_Create_OrderNotReady verifies POST /payments for a
// pending (not-ready) order returns 409 ORDER_NOT_READY (Spec5 §6).
func TestIntegration_Payment_Create_OrderNotReady(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	orderID := createOrder(t, ts, tok) // order stays in pending status

	body := fmt.Sprintf(`{"order_id":"%s","method":"cash"}`, orderID)
	resp := doPost(t, ts, "/api/v1/payments", body, tok)
	resp.Body.Close()
	if resp.StatusCode != http.StatusConflict {
		t.Fatalf("expected 409 for non-ready order, got %d", resp.StatusCode)
	}
}

// TestIntegration_Payment_Get verifies GET /payments/:id returns 200 after creation.
func TestIntegration_Payment_Get(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)
	orderID := createOrder(t, ts, tok)
	advanceToReady(t, ts, orderID, tok)

	// Create the payment first.
	body := fmt.Sprintf(`{"order_id":"%s","method":"cash"}`, orderID)
	createResp := doPost(t, ts, "/api/v1/payments", body, tok)
	if createResp.StatusCode != http.StatusCreated {
		t.Fatalf("create payment: expected 201, got %d", createResp.StatusCode)
	}
	createData := decode(t, createResp)
	cd, _ := createData["data"].(map[string]any)
	paymentID, _ := cd["id"].(string)
	if paymentID == "" {
		t.Fatal("create payment: empty id")
	}

	// Now fetch it.
	resp := doGet(t, ts, "/api/v1/payments/"+paymentID, tok)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	if d["id"] != paymentID {
		t.Fatalf("expected payment id=%s, got %v", paymentID, d["id"])
	}
}
