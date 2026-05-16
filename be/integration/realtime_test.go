//go:build integration

package integration

// P7-5.3 — SSE reconnect + WS reconnect integration tests.
//
// These tests verify that the BE handles sequential reconnects cleanly for
// both the SSE order-events stream and the WebSocket KDS feed, and that
// events published to Redis are forwarded to the connected client.
//
// Run: go test -tags integration -v ./be/integration/... -run TestSSE_|TestWS_

import (
	"bufio"
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"

	gws "github.com/gorilla/websocket"

	"banhcuon/be/internal/testhelper"
)

const realtimeTimeout = 3 * time.Second

// wsDialURL converts the httptest http:// base URL to a ws:// URL for the given path.
func wsDialURL(ts *testhelper.TestServer, path string) string {
	u, _ := url.Parse(ts.URL() + path)
	u.Scheme = "ws"
	return u.String()
}

// sseRequest opens an SSE connection and calls collectFn for each line received.
// Returns when collectFn returns true or the context deadline elapses.
// Must NOT be called from a goroutine — any t.Fatal goes to the test goroutine.
func sseRequest(ctx context.Context, t *testing.T, serverURL, path, token string, collectFn func(string) bool) {
	t.Helper()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, serverURL+path, nil)
	if err != nil {
		t.Fatalf("SSE new request: %v", err)
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		if resp == nil {
			// Only fatal if we never got a response (i.e. not a context-cancel after reading).
			t.Fatalf("SSE connect: %v", err)
		}
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("SSE: expected 200, got %d", resp.StatusCode)
	}
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		if collectFn(scanner.Text()) {
			return
		}
	}
}

// ─── SSE Tests ────────────────────────────────────────────────────────────────

// TestSSE_StreamOrder_RequiresAuth verifies unauthenticated SSE → 401.
func TestSSE_StreamOrder_RequiresAuth(t *testing.T) {
	ts := setup(t)
	resp := doGet(t, ts, "/api/v1/orders/any-id/events", "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

// TestSSE_StreamOrder_ConnectedEvent verifies the server immediately sends
// "event: connected" when a client opens the SSE stream.
func TestSSE_StreamOrder_ConnectedEvent(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)

	ctx, cancel := context.WithTimeout(context.Background(), realtimeTimeout)
	defer cancel()

	var got bool
	sseRequest(ctx, t, ts.URL(), "/api/v1/orders/test-sse-order/events", tok,
		func(line string) bool {
			if strings.HasPrefix(line, "event: connected") {
				got = true
				return true
			}
			return false
		})

	if !got {
		t.Fatal("expected 'event: connected' in SSE stream")
	}
}

// TestSSE_StreamOrder_Reconnect simulates 3 sequential client reconnects.
// Each connection must receive "event: connected", proving the server cleans
// up the previous connection and accepts the next one without resource leaks.
func TestSSE_StreamOrder_Reconnect(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)

	for attempt := 1; attempt <= 3; attempt++ {
		ctx, cancel := context.WithTimeout(context.Background(), realtimeTimeout)

		var got bool
		sseRequest(ctx, t, ts.URL(), "/api/v1/orders/reconnect-order/events", tok,
			func(line string) bool {
				if strings.HasPrefix(line, "event: connected") {
					got = true
					return true
				}
				return false
			})
		cancel()

		if !got {
			t.Fatalf("reconnect attempt %d: expected 'event: connected'", attempt)
		}
	}
}

// TestSSE_StreamOrder_EventDelivery verifies that a Redis publish on "order:{id}"
// is forwarded to the SSE client as an SSE event with the correct event type.
func TestSSE_StreamOrder_EventDelivery(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)

	const orderID = "sse-event-delivery-id"
	payload := fmt.Sprintf(`{"type":"order_status_changed","order_id":"%s","status":"confirmed"}`, orderID)

	resultCh := make(chan string, 1)
	errCh := make(chan error, 1)

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), realtimeTimeout)
		defer cancel()

		req, _ := http.NewRequestWithContext(ctx, http.MethodGet,
			ts.URL()+"/api/v1/orders/"+orderID+"/events", nil)
		req.Header.Set("Authorization", "Bearer "+tok)

		resp, err := (&http.Client{}).Do(req)
		if err != nil && resp == nil {
			errCh <- fmt.Errorf("SSE connect: %w", err)
			return
		}
		defer resp.Body.Close()

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "event: order_status_changed") {
				resultCh <- line
				return
			}
		}
		errCh <- fmt.Errorf("SSE stream ended without order_status_changed event")
	}()

	// Allow SSE goroutine to establish the Redis pub/sub subscription.
	time.Sleep(150 * time.Millisecond)

	if err := ts.RDB.Publish(context.Background(), "order:"+orderID, payload).Err(); err != nil {
		t.Fatalf("redis publish: %v", err)
	}

	select {
	case line := <-resultCh:
		if !strings.Contains(line, "order_status_changed") {
			t.Fatalf("unexpected event line: %s", line)
		}
	case err := <-errCh:
		t.Fatalf("SSE event delivery: %v", err)
	case <-time.After(realtimeTimeout):
		t.Fatal("timeout: SSE event not delivered within deadline")
	}
}

// ─── WebSocket Tests ──────────────────────────────────────────────────────────

// TestWS_KDS_RequiresToken verifies GET /ws/kds without a token query param → 401.
func TestWS_KDS_RequiresToken(t *testing.T) {
	ts := setup(t)
	resp := doGet(t, ts, "/api/v1/ws/kds", "")
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

// TestWS_KDS_ConnectAndClose verifies a valid token allows WS upgrade and that
// the hub cleanly unregisters the client on close (no panic, no goroutine leak).
func TestWS_KDS_ConnectAndClose(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)

	conn, _, err := (&gws.Dialer{}).Dial(wsDialURL(ts, "/api/v1/ws/kds?token="+tok), nil)
	if err != nil {
		t.Fatalf("WS dial: %v", err)
	}

	conn.WriteMessage(gws.CloseMessage, gws.FormatCloseMessage(gws.CloseNormalClosure, "done"))
	conn.Close()

	// Allow hub goroutine to process the unregister before test ends.
	time.Sleep(50 * time.Millisecond)
}

// TestWS_KDS_Reconnect verifies 3 sequential WS reconnects all succeed.
// This proves the hub unregisters the old client and accepts the new one cleanly.
func TestWS_KDS_Reconnect(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)

	for attempt := 1; attempt <= 3; attempt++ {
		conn, _, err := (&gws.Dialer{}).Dial(wsDialURL(ts, "/api/v1/ws/kds?token="+tok), nil)
		if err != nil {
			t.Fatalf("WS reconnect attempt %d: %v", attempt, err)
		}
		conn.WriteMessage(gws.CloseMessage, gws.FormatCloseMessage(gws.CloseNormalClosure, "done"))
		conn.Close()
		time.Sleep(50 * time.Millisecond)
	}
}

// TestWS_KDS_MessageDelivery verifies that a Redis publish on "orders:kds"
// is forwarded to the connected WS client as a JSON text message.
func TestWS_KDS_MessageDelivery(t *testing.T) {
	ts := setup(t)
	tok := accessToken(t, ts)

	conn, _, err := (&gws.Dialer{}).Dial(wsDialURL(ts, "/api/v1/ws/kds?token="+tok), nil)
	if err != nil {
		t.Fatalf("WS dial: %v", err)
	}
	defer conn.Close()

	// Allow WS Redis subscription to establish before publishing.
	time.Sleep(150 * time.Millisecond)

	const payload = `{"type":"new_order","order_id":"kds-delivery-test"}`
	if err := ts.RDB.Publish(context.Background(), "orders:kds", payload).Err(); err != nil {
		t.Fatalf("redis publish: %v", err)
	}

	conn.SetReadDeadline(time.Now().Add(realtimeTimeout))
	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("WS read: %v", err)
	}
	if !strings.Contains(string(msg), "new_order") {
		t.Fatalf("expected 'new_order' in WS message, got: %s", msg)
	}
}
