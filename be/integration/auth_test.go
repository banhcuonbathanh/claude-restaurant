//go:build integration

// Package integration contains end-to-end HTTP tests for the BanhCuon API.
// Each test spins up a real Gin server backed by a MySQL test DB and Redis DB 15.
//
// Prerequisites:
//   - export TEST_DB_DSN="root:secret@tcp(localhost:3306)/banhcuon_test?parseTime=true"
//   - export TEST_REDIS_ADDR="localhost:6379"   (optional, default localhost:6379)
//   - export JWT_SECRET="..."                   (optional, a default is set if absent)
//   - The banhcuon_test database must exist (CREATE DATABASE banhcuon_test;)
//
// Run: go test -tags integration -v ./be/integration/...
//
// Do NOT add t.Parallel() — tests share Redis DB 15 and run sequentially.
package integration

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"banhcuon/be/internal/testhelper"
)

// ─── helpers ──────────────────────────────────────────────────────────────────

// setup returns a fresh TestServer with all tables truncated and the test admin seeded.
func setup(t *testing.T) *testhelper.TestServer {
	t.Helper()
	ts := testhelper.NewTestServer(t)
	testhelper.TruncateAll(t, ts.DB)
	testhelper.SeedAdmin(t, ts.DB)
	return ts
}

func doPost(t *testing.T, ts *testhelper.TestServer, path, body, token string) *http.Response {
	t.Helper()
	var r io.Reader
	if body != "" {
		r = strings.NewReader(body)
	}
	req, _ := http.NewRequest(http.MethodPost, ts.URL()+path, r)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("POST %s: %v", path, err)
	}
	return resp
}

func doGet(t *testing.T, ts *testhelper.TestServer, path, token string) *http.Response {
	t.Helper()
	req, _ := http.NewRequest(http.MethodGet, ts.URL()+path, nil)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("GET %s: %v", path, err)
	}
	return resp
}

func decode(t *testing.T, resp *http.Response) map[string]any {
	t.Helper()
	defer resp.Body.Close()
	var m map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&m); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	return m
}

func accessToken(t *testing.T, ts *testhelper.TestServer) string {
	t.Helper()
	resp := doPost(t, ts, "/api/v1/auth/login",
		`{"username":"testadmin","password":"TestAdmin@123"}`, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("login for token: expected 200, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	tok, _ := d["access_token"].(string)
	if tok == "" {
		t.Fatal("login for token: empty access_token")
	}
	return tok
}

// ─── Auth tests ───────────────────────────────────────────────────────────────

// TestIntegration_Login_Success verifies POST /auth/login with valid credentials
// returns 200, an access_token, and sets the httpOnly refresh_token cookie.
func TestIntegration_Login_Success(t *testing.T) {
	ts := setup(t)
	resp := doPost(t, ts, "/api/v1/auth/login",
		`{"username":"testadmin","password":"TestAdmin@123"}`, "")

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	if d["access_token"] == nil || d["access_token"] == "" {
		t.Fatal("expected access_token in response body")
	}

	var cookieSet bool
	for _, c := range resp.Cookies() {
		if c.Name == "refresh_token" {
			cookieSet = true
			break
		}
	}
	if !cookieSet {
		t.Fatal("expected refresh_token httpOnly cookie to be set")
	}
}

// TestIntegration_Login_WrongPassword verifies wrong password → 401.
func TestIntegration_Login_WrongPassword(t *testing.T) {
	ts := setup(t)
	resp := doPost(t, ts, "/api/v1/auth/login",
		`{"username":"testadmin","password":"WrongPass@123"}`, "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

// TestIntegration_Login_MissingFields verifies empty JSON body → 400 INVALID_INPUT.
func TestIntegration_Login_MissingFields(t *testing.T) {
	ts := setup(t)
	resp := doPost(t, ts, "/api/v1/auth/login", `{}`, "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
}

// TestIntegration_Login_RateLimit verifies that 6 failed attempts from the same
// IP within the window returns 429 on the 6th attempt (Spec1 §4.1 AC-5).
func TestIntegration_Login_RateLimit(t *testing.T) {
	ts := setup(t)
	body := `{"username":"testadmin","password":"WrongPass@123"}`
	for i := 1; i <= 5; i++ {
		resp := doPost(t, ts, "/api/v1/auth/login", body, "")
		resp.Body.Close()
		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("attempt %d: expected 401, got %d", i, resp.StatusCode)
		}
	}
	resp := doPost(t, ts, "/api/v1/auth/login", body, "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("attempt 6: expected 429 (rate limit), got %d", resp.StatusCode)
	}
}

// TestIntegration_Refresh_ValidCookie verifies login → refresh cookie → POST /auth/refresh
// returns a new access_token (Spec1 §4.2).
func TestIntegration_Refresh_ValidCookie(t *testing.T) {
	ts := setup(t)

	// Login — sets refresh_token cookie in ts.Client's jar.
	loginResp := doPost(t, ts, "/api/v1/auth/login",
		`{"username":"testadmin","password":"TestAdmin@123"}`, "")
	loginResp.Body.Close()
	if loginResp.StatusCode != http.StatusOK {
		t.Fatalf("login: expected 200, got %d", loginResp.StatusCode)
	}

	// Refresh — cookie jar automatically includes the refresh_token cookie.
	refreshResp := doPost(t, ts, "/api/v1/auth/refresh", "", "")
	if refreshResp.StatusCode != http.StatusOK {
		t.Fatalf("refresh: expected 200, got %d", refreshResp.StatusCode)
	}
	data := decode(t, refreshResp)
	d, _ := data["data"].(map[string]any)
	if d["access_token"] == nil || d["access_token"] == "" {
		t.Fatal("refresh: expected access_token in response")
	}
}

// TestIntegration_Refresh_NoCookie verifies POST /auth/refresh without a cookie → 401.
func TestIntegration_Refresh_NoCookie(t *testing.T) {
	ts := setup(t)
	// Use a plain client with no cookie jar.
	req, _ := http.NewRequest(http.MethodPost, ts.URL()+"/api/v1/auth/refresh", nil)
	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		t.Fatalf("refresh request: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

// TestIntegration_Guest_ValidQRToken verifies POST /auth/guest with a known 64-char
// QR token returns 200 + guest access_token + table info (Spec1 §4.5).
func TestIntegration_Guest_ValidQRToken(t *testing.T) {
	ts := setup(t)
	testhelper.SeedTable(t, ts.DB)

	resp := doPost(t, ts, "/api/v1/auth/guest",
		`{"qr_token":"`+testhelper.TestTableQRToken+`"}`, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	if d["access_token"] == nil || d["access_token"] == "" {
		t.Fatal("expected access_token in guest response")
	}
	if d["table"] == nil {
		t.Fatal("expected table info in guest response")
	}
}

// TestIntegration_Guest_InvalidToken verifies an unknown QR token → 404.
func TestIntegration_Guest_InvalidToken(t *testing.T) {
	ts := setup(t)
	resp := doPost(t, ts, "/api/v1/auth/guest",
		`{"qr_token":"0000000000000000000000000000000000000000000000000000000000000000"}`, "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", resp.StatusCode)
	}
}

// TestIntegration_Me_WithToken verifies GET /auth/me returns the authenticated staff profile.
func TestIntegration_Me_WithToken(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)

	resp := doGet(t, ts, "/api/v1/auth/me", tok)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 from /me, got %d", resp.StatusCode)
	}
	data := decode(t, resp)
	d, _ := data["data"].(map[string]any)
	if d["username"] != testhelper.TestAdminUsername {
		t.Fatalf("expected username=%s, got %v", testhelper.TestAdminUsername, d["username"])
	}
}

// TestIntegration_Me_NoToken verifies GET /auth/me without an Authorization header → 401.
func TestIntegration_Me_NoToken(t *testing.T) {
	ts := setup(t)
	resp := doGet(t, ts, "/api/v1/auth/me", "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

// TestIntegration_Logout verifies POST /auth/logout revokes the refresh token so
// subsequent calls to POST /auth/refresh return 401 (Spec1 §4.2).
func TestIntegration_Logout(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts) // also sets cookie in ts.Client.Jar

	// Logout — cookie is sent automatically by ts.Client.
	logoutResp := doPost(t, ts, "/api/v1/auth/logout", "", tok)
	logoutResp.Body.Close()
	if logoutResp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204 from /logout, got %d", logoutResp.StatusCode)
	}

	// The refresh token is now revoked — refresh must return 401.
	refreshResp := doPost(t, ts, "/api/v1/auth/refresh", "", "")
	refreshResp.Body.Close()
	if refreshResp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 after logout (token revoked), got %d", refreshResp.StatusCode)
	}
}
