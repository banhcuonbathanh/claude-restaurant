package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// ─── fakeChatAI ───────────────────────────────────────────────────────────────

// fakeChatAI plays back scripted responses, one per CreateMessage call.
type fakeChatAI struct {
	calls     []anthropic.MessageNewParams
	responses []*anthropic.Message
	err       error
}

func (f *fakeChatAI) CreateMessage(_ context.Context, params anthropic.MessageNewParams) (*anthropic.Message, error) {
	f.calls = append(f.calls, params)
	if f.err != nil {
		return nil, f.err
	}
	i := len(f.calls) - 1
	if i >= len(f.responses) {
		return nil, fmt.Errorf("fakeChatAI: no scripted response for call %d", i)
	}
	return f.responses[i], nil
}

var _ ChatAI = (*fakeChatAI)(nil)

// chatAIMessage builds an *anthropic.Message by unmarshalling raw API JSON —
// the only way the SDK's respjson metadata (v.JSON.Input.Raw(), ToParam) gets
// populated outside a real HTTP response.
func chatAIMessage(t *testing.T, raw string) *anthropic.Message {
	t.Helper()
	var m anthropic.Message
	if err := json.Unmarshal([]byte(raw), &m); err != nil {
		t.Fatalf("chatAIMessage: %v", err)
	}
	return &m
}

func chatTextResponse(t *testing.T, text string) *anthropic.Message {
	t.Helper()
	quoted, _ := json.Marshal(text)
	return chatAIMessage(t, fmt.Sprintf(
		`{"id":"msg_text","type":"message","role":"assistant","stop_reason":"end_turn","content":[{"type":"text","text":%s}]}`,
		quoted))
}

func chatToolUseResponse(t *testing.T, tool, input string) *anthropic.Message {
	t.Helper()
	return chatAIMessage(t, fmt.Sprintf(
		`{"id":"msg_tool","type":"message","role":"assistant","stop_reason":"tool_use","content":[{"type":"tool_use","id":"toolu_1","name":%q,"input":%s}]}`,
		tool, input))
}

// ─── fakeChatRedis ────────────────────────────────────────────────────────────

// fakeChatRedis is an in-memory chatRedisClient.
type fakeChatRedis struct {
	data map[string]string
}

func newFakeChatRedis() *fakeChatRedis { return &fakeChatRedis{data: map[string]string{}} }

func (f *fakeChatRedis) Get(ctx context.Context, key string) *redis.StringCmd {
	cmd := redis.NewStringCmd(ctx, "get", key)
	if v, ok := f.data[key]; ok {
		cmd.SetVal(v)
	} else {
		cmd.SetErr(redis.Nil)
	}
	return cmd
}

func (f *fakeChatRedis) Set(ctx context.Context, key string, value interface{}, _ time.Duration) *redis.StatusCmd {
	f.data[key] = fmt.Sprint(value)
	cmd := redis.NewStatusCmd(ctx, "set", key)
	cmd.SetVal("OK")
	return cmd
}

func (f *fakeChatRedis) Del(ctx context.Context, keys ...string) *redis.IntCmd {
	var n int64
	for _, k := range keys {
		if _, ok := f.data[k]; ok {
			delete(f.data, k)
			n++
		}
	}
	cmd := redis.NewIntCmd(ctx, "del")
	cmd.SetVal(n)
	return cmd
}

var _ chatRedisClient = (*fakeChatRedis)(nil)

// ─── mockChatProductRepo ─────────────────────────────────────────────────────

// mockChatProductRepo serves the two menu reads and the snapshot lookups the
// chat tools touch. The embedded nil interface panics loudly on anything else.
type mockChatProductRepo struct {
	repository.ProductRepository
}

const chatTestProductID = "prod-1"

func chatTestProduct() db.Product {
	return db.Product{
		ID:          chatTestProductID,
		CategoryID:  "cat-1",
		Name:        "Bánh Cuốn Thịt",
		Price:       "4000",
		IsAvailable: true,
	}
}

func (m *mockChatProductRepo) ListProductsAvailable(_ context.Context) ([]db.Product, error) {
	return []db.Product{chatTestProduct()}, nil
}
func (m *mockChatProductRepo) ListCategories(_ context.Context) ([]db.Category, error) {
	return nil, nil
}
func (m *mockChatProductRepo) GetToppingsByProductID(_ context.Context, _ string) ([]db.Topping, error) {
	return nil, nil
}
func (m *mockChatProductRepo) ListCombosAvailable(_ context.Context) ([]db.Combo, error) {
	return nil, nil
}
func (m *mockChatProductRepo) GetProductByID(_ context.Context, id string) (db.Product, error) {
	if id == chatTestProductID {
		return chatTestProduct(), nil
	}
	return db.Product{}, sql.ErrNoRows
}
func (m *mockChatProductRepo) GetComboByID(_ context.Context, _ string) (db.Combo, error) {
	return db.Combo{}, sql.ErrNoRows
}

// ─── helpers ──────────────────────────────────────────────────────────────────

// unreachableRedis returns a real client pointed at a closed port so the
// ProductService cache layer misses fast instead of panicking on nil.
func unreachableRedis() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:        "127.0.0.1:1",
		DialTimeout: 50 * time.Millisecond,
		MaxRetries:  -1,
	})
}

func newTestChatService(ai ChatAI, orderRepo repository.OrderRepository, rdb chatRedisClient) *ChatService {
	products := &ProductService{repo: &mockChatProductRepo{}, rdb: unreachableRedis()}
	orders := newTestOrderService(orderRepo, &mockProductLookup{})
	return NewChatService(ai, products, orders, rdb)
}

type chatEvent struct {
	name    string
	payload map[string]any
}

func chatEmitRecorder(events *[]chatEvent) ChatEmitter {
	return func(event string, payload any) {
		p, _ := payload.(map[string]any)
		*events = append(*events, chatEvent{name: event, payload: p})
	}
}

func eventNames(events []chatEvent) []string {
	names := make([]string, 0, len(events))
	for _, e := range events {
		names = append(names, e.name)
	}
	return names
}

func assertAppError(t *testing.T, err error, wantStatus int, wantCode string) {
	t.Helper()
	var ae *AppError
	if !errors.As(err, &ae) {
		t.Fatalf("expected *AppError, got %T: %v", err, err)
	}
	if ae.Status != wantStatus || ae.Code != wantCode {
		t.Fatalf("AppError = %d %s, want %d %s", ae.Status, ae.Code, wantStatus, wantCode)
	}
}

func chatCustomerCtx(sessionID string) ChatContext {
	return ChatContext{
		SessionID:  sessionID,
		TableID:    "table-1",
		CallerID:   "table-1",
		CallerRole: "customer",
	}
}

func seedPendingCreateOrder(t *testing.T, rdb *fakeChatRedis, sessionID, actionID string) {
	t.Helper()
	action := pendingAction{
		ActionID:   actionID,
		Tool:       "create_order",
		Input:      json.RawMessage(fmt.Sprintf(`{"items":[{"product_id":%q,"quantity":2}]}`, chatTestProductID)),
		Summary:    "Tạo đơn: 2× Bánh Cuốn Thịt",
		TableID:    "table-1",
		CallerID:   "table-1",
		CallerRole: "customer",
	}
	data, err := json.Marshal(action)
	if err != nil {
		t.Fatalf("seed pending: %v", err)
	}
	rdb.data[chatPendingKey(sessionID)] = string(data)
}

// ─── Chat loop: read tool executes inline ─────────────────────────────────────

// TestChat_ReadToolExecutesInline: a get_menu tool_use runs immediately, its
// result goes back to the model, the loop continues to a final answer, and no
// pending action is created.
func TestChat_ReadToolExecutesInline(t *testing.T) {
	ai := &fakeChatAI{responses: []*anthropic.Message{
		chatToolUseResponse(t, "get_menu", `{}`),
		chatTextResponse(t, "Quán có Bánh Cuốn Thịt giá 4.000đ ạ."),
	}}
	rdb := newFakeChatRedis()
	svc := newTestChatService(ai, &mockOrderRepo{}, rdb)

	var events []chatEvent
	err := svc.Chat(context.Background(), ChatInput{
		ChatContext: chatCustomerCtx("sess-read"),
		Message:     "quán có món gì?",
	}, chatEmitRecorder(&events))
	if err != nil {
		t.Fatalf("Chat failed: %v", err)
	}

	if got := len(ai.calls); got != 2 {
		t.Fatalf("expected 2 model calls (tool round + answer), got %d", got)
	}
	// The second call must carry the tool_result with real menu data.
	secondMsgs, _ := json.Marshal(ai.calls[1].Messages)
	if !strings.Contains(string(secondMsgs), "tool_result") {
		t.Fatal("second model call: expected a tool_result block")
	}
	if !strings.Contains(string(secondMsgs), "Bánh Cuốn Thịt") {
		t.Fatal("second model call: tool_result should contain the real menu row")
	}

	names := eventNames(events)
	if fmt.Sprint(names) != fmt.Sprint([]string{"text", "done"}) {
		t.Fatalf("events = %v, want [text done]", names)
	}
	if _, ok := rdb.data[chatPendingKey("sess-read")]; ok {
		t.Fatal("read tool must not create a pending action")
	}
	if _, ok := rdb.data[chatHistoryKey("sess-read")]; !ok {
		t.Fatal("expected conversation history to be saved")
	}
}

// ─── Chat loop: write tool is held as a proposal ─────────────────────────────

// TestChat_WriteToolBecomesPendingProposal: create_order NEVER executes inside
// the loop — it suspends the loop, saves a pending action, and emits `proposal`.
func TestChat_WriteToolBecomesPendingProposal(t *testing.T) {
	createCalled := false
	orderRepo := &mockOrderRepo{
		createOrderFn: func(_ context.Context, _ repository.CreateOrderWithItemsInput) error {
			createCalled = true
			return nil
		},
	}
	ai := &fakeChatAI{responses: []*anthropic.Message{
		chatToolUseResponse(t, "create_order",
			fmt.Sprintf(`{"items":[{"product_id":%q,"quantity":2}]}`, chatTestProductID)),
	}}
	rdb := newFakeChatRedis()
	svc := newTestChatService(ai, orderRepo, rdb)

	var events []chatEvent
	err := svc.Chat(context.Background(), ChatInput{
		ChatContext: chatCustomerCtx("sess-write"),
		Message:     "cho tôi 2 bánh cuốn thịt",
	}, chatEmitRecorder(&events))
	if err != nil {
		t.Fatalf("Chat failed: %v", err)
	}

	if createCalled {
		t.Fatal("INVARIANT BROKEN: create_order executed without confirmation")
	}
	if got := len(ai.calls); got != 1 {
		t.Fatalf("loop must suspend on a write tool: expected 1 model call, got %d", got)
	}

	names := eventNames(events)
	if fmt.Sprint(names) != fmt.Sprint([]string{"proposal", "done"}) {
		t.Fatalf("events = %v, want [proposal done]", names)
	}

	raw, ok := rdb.data[chatPendingKey("sess-write")]
	if !ok {
		t.Fatal("expected a pending action in redis")
	}
	var action pendingAction
	if err := json.Unmarshal([]byte(raw), &action); err != nil {
		t.Fatalf("decode pending: %v", err)
	}
	if action.Tool != "create_order" {
		t.Fatalf("pending tool = %q, want create_order", action.Tool)
	}
	if action.CallerID != "table-1" || action.CallerRole != "customer" {
		t.Fatalf("pending caller = %s/%s, want table-1/customer", action.CallerID, action.CallerRole)
	}
	if got := events[0].payload["action_id"]; got != action.ActionID {
		t.Fatalf("proposal action_id = %v, want %s (must match the stored pending)", got, action.ActionID)
	}
	if !strings.Contains(action.Summary, "2× Bánh Cuốn Thịt") {
		t.Fatalf("pending summary = %q, want it to name 2× Bánh Cuốn Thịt", action.Summary)
	}
}

// ─── Confirm: approve executes deterministically ─────────────────────────────

func TestChatConfirm_ApproveExecutes(t *testing.T) {
	var captured *repository.CreateOrderWithItemsInput
	orderRepo := &mockOrderRepo{
		createOrderFn: func(_ context.Context, in repository.CreateOrderWithItemsInput) error {
			captured = &in
			return nil
		},
		getOrderByIDFn: func(_ context.Context, id string) (db.Order, error) {
			return db.Order{
				ID:          id,
				OrderNumber: "ORD-20260708-0001",
				TableID:     sql.NullString{String: "table-1", Valid: true},
				Status:      db.OrdersStatusPending,
			}, nil
		},
	}
	rdb := newFakeChatRedis()
	svc := newTestChatService(&fakeChatAI{}, orderRepo, rdb)
	seedPendingCreateOrder(t, rdb, "sess-ok", "act-1")

	res, err := svc.Confirm(context.Background(), ConfirmInput{
		SessionID:  "sess-ok",
		ActionID:   "act-1",
		Approve:    true,
		CallerID:   "table-1",
		CallerRole: "customer",
	})
	if err != nil {
		t.Fatalf("Confirm failed: %v", err)
	}

	if captured == nil {
		t.Fatal("expected OrderService.CreateOrder to run on approve")
	}
	if len(captured.Items) != 1 || captured.Items[0].Quantity != 2 {
		t.Fatalf("created items = %+v, want 1 row with quantity 2", captured.Items)
	}
	if res.Status != "executed" {
		t.Fatalf("status = %q, want executed", res.Status)
	}
	if !res.DataUpdated {
		t.Fatal("expected data_updated = true")
	}
	if res.OrderNumber != "ORD-20260708-0001" {
		t.Fatalf("order_number = %q, want ORD-20260708-0001", res.OrderNumber)
	}
	if _, ok := rdb.data[chatPendingKey("sess-ok")]; ok {
		t.Fatal("pending action must be consumed on approve")
	}
	if !strings.Contains(rdb.data[chatHistoryKey("sess-ok")], "ORD-20260708-0001") {
		t.Fatal("expected the created order_number appended to history")
	}
}

// ─── Confirm: reject clears without executing ────────────────────────────────

func TestChatConfirm_RejectClearsPending(t *testing.T) {
	createCalled := false
	orderRepo := &mockOrderRepo{
		createOrderFn: func(_ context.Context, _ repository.CreateOrderWithItemsInput) error {
			createCalled = true
			return nil
		},
	}
	rdb := newFakeChatRedis()
	svc := newTestChatService(&fakeChatAI{}, orderRepo, rdb)
	seedPendingCreateOrder(t, rdb, "sess-no", "act-1")

	res, err := svc.Confirm(context.Background(), ConfirmInput{
		SessionID:  "sess-no",
		ActionID:   "act-1",
		Approve:    false,
		CallerID:   "table-1",
		CallerRole: "customer",
	})
	if err != nil {
		t.Fatalf("Confirm failed: %v", err)
	}

	if createCalled {
		t.Fatal("reject must not execute the order")
	}
	if res.Status != "rejected" {
		t.Fatalf("status = %q, want rejected", res.Status)
	}
	if res.DataUpdated {
		t.Fatal("reject must not report data_updated")
	}
	if _, ok := rdb.data[chatPendingKey("sess-no")]; ok {
		t.Fatal("pending action must be consumed on reject")
	}
	if !strings.Contains(rdb.data[chatHistoryKey("sess-no")], "Khách đã từ chối") {
		t.Fatal("expected the rejection appended to history")
	}
}

// ─── Confirm: wrong action_id / caller / session → CHAT_002 ──────────────────

func TestChatConfirm_InvalidRequestsRejected(t *testing.T) {
	newSvc := func(t *testing.T) (*ChatService, *fakeChatRedis, *bool) {
		createCalled := false
		orderRepo := &mockOrderRepo{
			createOrderFn: func(_ context.Context, _ repository.CreateOrderWithItemsInput) error {
				createCalled = true
				return nil
			},
		}
		rdb := newFakeChatRedis()
		return newTestChatService(&fakeChatAI{}, orderRepo, rdb), rdb, &createCalled
	}

	t.Run("no pending action", func(t *testing.T) {
		svc, _, createCalled := newSvc(t)
		_, err := svc.Confirm(context.Background(), ConfirmInput{
			SessionID: "sess-empty", ActionID: "act-1", Approve: true,
			CallerID: "table-1", CallerRole: "customer",
		})
		assertAppError(t, err, 404, "CHAT_002")
		if *createCalled {
			t.Fatal("nothing may execute without a pending action")
		}
	})

	t.Run("wrong action_id", func(t *testing.T) {
		svc, rdb, createCalled := newSvc(t)
		seedPendingCreateOrder(t, rdb, "sess-bad-aid", "act-1")
		_, err := svc.Confirm(context.Background(), ConfirmInput{
			SessionID: "sess-bad-aid", ActionID: "act-WRONG", Approve: true,
			CallerID: "table-1", CallerRole: "customer",
		})
		assertAppError(t, err, 403, "CHAT_002")
		if *createCalled {
			t.Fatal("wrong action_id must not execute the pending action")
		}
		if _, ok := rdb.data[chatPendingKey("sess-bad-aid")]; !ok {
			t.Fatal("a mismatched confirm must not consume the pending action")
		}
	})

	t.Run("wrong caller", func(t *testing.T) {
		svc, rdb, createCalled := newSvc(t)
		seedPendingCreateOrder(t, rdb, "sess-bad-caller", "act-1")
		_, err := svc.Confirm(context.Background(), ConfirmInput{
			SessionID: "sess-bad-caller", ActionID: "act-1", Approve: true,
			CallerID: "table-OTHER", CallerRole: "customer",
		})
		assertAppError(t, err, 403, "CHAT_002")
		if *createCalled {
			t.Fatal("another caller must not execute the pending action")
		}
		if _, ok := rdb.data[chatPendingKey("sess-bad-caller")]; !ok {
			t.Fatal("a mismatched confirm must not consume the pending action")
		}
	})
}

// ─── History compaction ──────────────────────────────────────────────────────

func chatTurnsN(n int) []chatTurn {
	turns := make([]chatTurn, 0, n)
	for i := 1; i <= n; i++ {
		role := "user"
		if i%2 == 0 {
			role = "assistant"
		}
		turns = append(turns, chatTurn{Role: role, Text: fmt.Sprintf("turn-%d", i)})
	}
	return turns
}

func loadStoredHistory(t *testing.T, rdb *fakeChatRedis, sessionID string) chatHistory {
	t.Helper()
	raw, ok := rdb.data[chatHistoryKey(sessionID)]
	if !ok {
		t.Fatal("expected history saved in redis")
	}
	var h chatHistory
	if err := json.Unmarshal([]byte(raw), &h); err != nil {
		t.Fatalf("decode stored history: %v", err)
	}
	return h
}

// TestChatSaveHistory_CompactionSummarizes: >20 turns folds the overflow into the
// rolling summary and keeps the last 12 turns verbatim.
func TestChatSaveHistory_CompactionSummarizes(t *testing.T) {
	ai := &fakeChatAI{responses: []*anthropic.Message{
		chatTextResponse(t, "Khách thích bánh cuốn thịt."),
	}}
	rdb := newFakeChatRedis()
	svc := newTestChatService(ai, &mockOrderRepo{}, rdb)

	svc.saveHistory(context.Background(), "sess-compact", chatHistory{Turns: chatTurnsN(25)})

	if got := len(ai.calls); got != 1 {
		t.Fatalf("expected exactly 1 summarize call, got %d", got)
	}
	// Overflow = turns 1..13 (25 − 12 kept). The summarize input must contain
	// the folded turns and none of the kept ones.
	sumInput, _ := json.Marshal(ai.calls[0].Messages)
	if !strings.Contains(string(sumInput), "turn-1") || !strings.Contains(string(sumInput), "turn-13") {
		t.Fatal("summarize input should contain the overflow turns (turn-1 … turn-13)")
	}
	if strings.Contains(string(sumInput), "turn-14") {
		t.Fatal("summarize input must not contain kept turns (turn-14+)")
	}

	h := loadStoredHistory(t, rdb, "sess-compact")
	if h.Summary != "Khách thích bánh cuốn thịt." {
		t.Fatalf("summary = %q, want the summarizer output", h.Summary)
	}
	if len(h.Turns) != chatKeepTurns {
		t.Fatalf("kept %d turns, want %d", len(h.Turns), chatKeepTurns)
	}
	if h.Turns[0].Text != "turn-14" || h.Turns[len(h.Turns)-1].Text != "turn-25" {
		t.Fatalf("kept window = %s … %s, want turn-14 … turn-25",
			h.Turns[0].Text, h.Turns[len(h.Turns)-1].Text)
	}
}

// TestChatSaveHistory_CompactionFallbackOnAIError: when the summarizer is down the
// history hard-caps to the last 20 turns and the old summary survives untouched.
func TestChatSaveHistory_CompactionFallbackOnAIError(t *testing.T) {
	ai := &fakeChatAI{err: errors.New("api down")}
	rdb := newFakeChatRedis()
	svc := newTestChatService(ai, &mockOrderRepo{}, rdb)

	svc.saveHistory(context.Background(), "sess-fallback", chatHistory{
		Summary: "tóm tắt cũ",
		Turns:   chatTurnsN(25),
	})

	h := loadStoredHistory(t, rdb, "sess-fallback")
	if h.Summary != "tóm tắt cũ" {
		t.Fatalf("summary = %q, want the old summary preserved on fallback", h.Summary)
	}
	if len(h.Turns) != chatMaxTurns {
		t.Fatalf("kept %d turns, want hard cap %d", len(h.Turns), chatMaxTurns)
	}
	if h.Turns[0].Text != "turn-6" || h.Turns[len(h.Turns)-1].Text != "turn-25" {
		t.Fatalf("kept window = %s … %s, want turn-6 … turn-25 (latest turns never lost)",
			h.Turns[0].Text, h.Turns[len(h.Turns)-1].Text)
	}
}
