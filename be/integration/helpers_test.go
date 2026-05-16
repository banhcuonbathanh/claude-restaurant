//go:build integration

package integration

import (
	"io"
	"net/http"
	"strings"
	"testing"

	"banhcuon/be/internal/testhelper"
)

func doPatch(t *testing.T, ts *testhelper.TestServer, path, body, token string) *http.Response {
	t.Helper()
	var r io.Reader
	if body != "" {
		r = strings.NewReader(body)
	}
	req, _ := http.NewRequest(http.MethodPatch, ts.URL()+path, r)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("PATCH %s: %v", path, err)
	}
	return resp
}

func doDelete(t *testing.T, ts *testhelper.TestServer, path, token string) *http.Response {
	t.Helper()
	req, _ := http.NewRequest(http.MethodDelete, ts.URL()+path, nil)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("DELETE %s: %v", path, err)
	}
	return resp
}

// createOrder seeds a table + product, POSTs an order, and returns its ID.
// Fails the test immediately if the order cannot be created.
func createOrder(t *testing.T, ts *testhelper.TestServer, tok string) string {
	t.Helper()
	testhelper.SeedTable(t, ts.DB)
	testhelper.SeedProduct(t, ts.DB)
	body := `{"table_id":"` + testhelper.TestTableID + `","source":"pos","items":[{"product_id":"` + testhelper.TestProductID + `","quantity":2}]}`
	resp := doPost(t, ts, "/api/v1/orders", body, tok)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("createOrder: expected 201, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	id, _ := d["id"].(string)
	if id == "" {
		t.Fatal("createOrder: empty id in response")
	}
	return id
}

// advanceToReady walks an order through pending→confirmed→preparing→ready.
// All three PATCH calls must return 200.
func advanceToReady(t *testing.T, ts *testhelper.TestServer, orderID, tok string) {
	t.Helper()
	for _, s := range []string{"confirmed", "preparing", "ready"} {
		resp := doPatch(t, ts, "/api/v1/orders/"+orderID+"/status", `{"status":"`+s+`"}`, tok)
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("advanceToReady: PATCH status=%s: expected 200, got %d", s, resp.StatusCode)
		}
	}
}
