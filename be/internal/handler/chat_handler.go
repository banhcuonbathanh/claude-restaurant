package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/service"
)

// ChatHandler exposes the AI chat endpoints.
//   POST /api/v1/chat          → SSE stream (events: text · proposal · done · error)
//   POST /api/v1/chat/confirm  → JSON (executes/rejects the pending proposal)
type ChatHandler struct {
	svc *service.ChatService
}

func NewChatHandler(svc *service.ChatService) *ChatHandler {
	return &ChatHandler{svc: svc}
}

type chatRequest struct {
	SessionID string `json:"session_id"`
	Message   string `json:"message" binding:"required"`
	TableID   string `json:"table_id"`
	OrderID   string `json:"order_id"`
}

// Chat handles one conversation turn over SSE.
func (h *ChatHandler) Chat(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Body không hợp lệ")
		return
	}
	claims := middleware.ClaimsFromContext(c)

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		respondError(c, http.StatusInternalServerError, "COMMON_002", "Streaming không được hỗ trợ")
		return
	}
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")
	c.Writer.WriteHeader(http.StatusOK)

	emit := func(event string, payload any) {
		data, err := json.Marshal(payload)
		if err != nil {
			return
		}
		fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", event, data)
		flusher.Flush()
	}

	err := h.svc.Chat(c.Request.Context(), service.ChatInput{
		ChatContext: service.ChatContext{
			SessionID:  req.SessionID,
			TableID:    req.TableID,
			OrderID:    req.OrderID,
			CallerID:   claims.Subject,
			CallerRole: claims.Role,
		},
		Message: req.Message,
	}, emit)
	if err != nil {
		// Headers already sent — errors must travel as an SSE event, not a status code.
		code, message := "CHAT_003", "Trợ lý AI đang gặp sự cố"
		if appErr, okErr := err.(*service.AppError); okErr {
			code, message = appErr.Code, appErr.Message
		}
		emit("error", map[string]string{"code": code, "message": message})
	}
}

type chatConfirmRequest struct {
	SessionID string `json:"session_id" binding:"required"`
	ActionID  string `json:"action_id" binding:"required"`
	Approve   *bool  `json:"approve" binding:"required"`
}

// Confirm executes or rejects the pending proposal (the human approval gate).
func (h *ChatHandler) Confirm(c *gin.Context) {
	var req chatConfirmRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Body không hợp lệ")
		return
	}
	claims := middleware.ClaimsFromContext(c)

	result, err := h.svc.Confirm(c.Request.Context(), service.ConfirmInput{
		SessionID:  req.SessionID,
		ActionID:   req.ActionID,
		Approve:    *req.Approve,
		CallerID:   claims.Subject,
		CallerRole: claims.Role,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, result)
}
