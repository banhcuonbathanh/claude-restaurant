package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"
)

// ─── Tool registry ────────────────────────────────────────────────────────────
//
// Read tools execute immediately inside the agent loop.
// Write tools NEVER execute in the loop — they become a pending proposal that
// the customer must confirm via POST /chat/confirm (the approval gate).

// chatWriteTools is the whitelist of confirm-gated tools.
var chatWriteTools = map[string]bool{
	"create_order": true,
	"cancel_order": true,
}

// chatToolDefs returns the tool schemas sent to the model.
func chatToolDefs() []anthropic.ToolUnionParam {
	getMenu := anthropic.ToolParam{
		Name:        "get_menu",
		Description: anthropic.String("Lấy thực đơn hiện tại (món lẻ + combo, kèm id, giá VND, tình trạng còn/hết). Gọi tool này TRƯỚC KHI trả lời bất kỳ câu hỏi nào về món ăn hoặc giá, và trước khi đề xuất đặt món."),
		InputSchema: anthropic.ToolInputSchemaParam{
			Properties: map[string]any{},
		},
	}
	getMyOrder := anthropic.ToolParam{
		Name:        "get_my_order",
		Description: anthropic.String("Xem đơn hàng hiện tại của khách (trạng thái, các món, tổng tiền). Gọi khi khách hỏi về đơn của họ. order_id lấy từ context nếu khách không nói."),
		InputSchema: anthropic.ToolInputSchemaParam{
			Properties: map[string]any{
				"order_id": map[string]any{"type": "string", "description": "UUID đơn hàng"},
			},
		},
	}
	createOrder := anthropic.ToolParam{
		Name:        "create_order",
		Description: anthropic.String("Đề xuất tạo đơn hàng mới cho khách. Chỉ dùng product_id/combo_id có thật từ get_menu. Hành động này cần khách bấm Xác nhận mới được thực thi."),
		InputSchema: anthropic.ToolInputSchemaParam{
			Properties: map[string]any{
				"items": map[string]any{
					"type":        "array",
					"description": "Danh sách món",
					"items": map[string]any{
						"type": "object",
						"properties": map[string]any{
							"product_id": map[string]any{"type": "string", "description": "UUID món lẻ (bỏ trống nếu là combo)"},
							"combo_id":   map[string]any{"type": "string", "description": "UUID combo (bỏ trống nếu là món lẻ)"},
							"quantity":   map[string]any{"type": "integer", "description": "Số lượng, >= 1"},
							"note":       map[string]any{"type": "string", "description": "Ghi chú cho món"},
						},
					},
				},
				"note": map[string]any{"type": "string", "description": "Ghi chú chung cho đơn"},
			},
			Required: []string{"items"},
		},
	}
	cancelOrder := anthropic.ToolParam{
		Name:        "cancel_order",
		Description: anthropic.String("Đề xuất huỷ đơn hàng của khách. Hành động này cần khách bấm Xác nhận mới được thực thi."),
		InputSchema: anthropic.ToolInputSchemaParam{
			Properties: map[string]any{
				"order_id": map[string]any{"type": "string", "description": "UUID đơn hàng cần huỷ"},
			},
			Required: []string{"order_id"},
		},
	}

	return []anthropic.ToolUnionParam{
		{OfTool: &getMenu},
		{OfTool: &getMyOrder},
		{OfTool: &createOrder},
		{OfTool: &cancelOrder},
	}
}

// ─── Tool input payloads ─────────────────────────────────────────────────────

type chatOrderItemInput struct {
	ProductID string `json:"product_id"`
	ComboID   string `json:"combo_id"`
	Quantity  int32  `json:"quantity"`
	Note      string `json:"note"`
}

type chatCreateOrderInput struct {
	Items []chatOrderItemInput `json:"items"`
	Note  string               `json:"note"`
}

type chatCancelOrderInput struct {
	OrderID string `json:"order_id"`
}

// ─── Read-tool executors ─────────────────────────────────────────────────────

// executeReadTool runs a read-only tool and returns the tool_result text.
// Results are kept compact on purpose (context management).
func (s *ChatService) executeReadTool(ctx context.Context, name string, input json.RawMessage, chatCtx ChatContext) (string, error) {
	switch name {
	case "get_menu":
		return s.toolGetMenu(ctx)
	case "get_my_order":
		var in struct {
			OrderID string `json:"order_id"`
		}
		_ = json.Unmarshal(input, &in)
		orderID := in.OrderID
		if orderID == "" {
			orderID = chatCtx.OrderID
		}
		return s.toolGetMyOrder(ctx, orderID, chatCtx)
	default:
		return "", fmt.Errorf("unknown tool %q", name)
	}
}

func (s *ChatService) toolGetMenu(ctx context.Context) (string, error) {
	products, err := s.products.ListProducts(ctx)
	if err != nil {
		return "", err
	}
	combos, err := s.products.ListCombos(ctx)
	if err != nil {
		return "", err
	}

	var b strings.Builder
	b.WriteString("MÓN LẺ (product_id | tên | giá VND | còn hàng):\n")
	for _, p := range products {
		b.WriteString(fmt.Sprintf("- %s | %s | %d | %v\n", p.ID, p.Name, p.Price, p.IsAvailable))
	}
	b.WriteString("\nCOMBO (combo_id | tên | giá VND | còn hàng):\n")
	for _, c := range combos {
		b.WriteString(fmt.Sprintf("- %s | %s | %d | %v\n", c.ID, c.Name, c.Price, c.IsAvailable))
	}
	return b.String(), nil
}

func (s *ChatService) toolGetMyOrder(ctx context.Context, orderID string, chatCtx ChatContext) (string, error) {
	if orderID == "" {
		return "Khách chưa có đơn hàng nào trong phiên này.", nil
	}
	od, err := s.orders.GetOrder(ctx, orderID, chatCtx.CallerID, chatCtx.CallerRole)
	if err != nil {
		return "", err
	}
	data, err := json.Marshal(od)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// ─── Proposal summary (shown on the FE ActionCard) ──────────────────────────

// proposalSummary builds the human-readable Vietnamese summary of a pending write.
func (s *ChatService) proposalSummary(ctx context.Context, tool string, input json.RawMessage) string {
	switch tool {
	case "create_order":
		var in chatCreateOrderInput
		if err := json.Unmarshal(input, &in); err != nil {
			return "Tạo đơn hàng mới"
		}
		var parts []string
		for _, it := range in.Items {
			name := it.ProductID
			if it.ComboID != "" {
				if c, err := s.products.GetComboSnapshot(ctx, it.ComboID); err == nil {
					name = c.Name
				}
			} else if p, err := s.products.GetProductSnapshot(ctx, it.ProductID); err == nil {
				name = p.Name
			}
			qty := it.Quantity
			if qty <= 0 {
				qty = 1
			}
			parts = append(parts, fmt.Sprintf("%d× %s", qty, name))
		}
		return "Tạo đơn: " + strings.Join(parts, ", ")
	case "cancel_order":
		return "Huỷ đơn hàng hiện tại"
	default:
		return tool
	}
}
