package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/payment"
	"banhcuon/be/internal/service"
)

// PaymentHandler handles /payments/* and /webhooks/* endpoints.
type PaymentHandler struct {
	svc *service.PaymentService
}

// NewPaymentHandler creates a PaymentHandler.
func NewPaymentHandler(svc *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{svc: svc}
}

type createPaymentReq struct {
	OrderID string `json:"order_id" binding:"required"`
	Method  string `json:"method" binding:"required,oneof=vnpay momo zalopay cash"`
}

// Create handles POST /payments (Cashier+)
func (h *PaymentHandler) Create(c *gin.Context) {
	var req createPaymentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "Dữ liệu đầu vào không hợp lệ")
		return
	}

	result, err := h.svc.CreatePayment(c.Request.Context(), service.CreatePaymentInput{
		OrderID: req.OrderID,
		Method:  req.Method,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{
		"id":          result.ID,
		"pay_url":     result.PayURL,
		"qr_code_url": result.QRCodeURL,
	}})
}

// GetPayment handles GET /payments/:id (Cashier+)
func (h *PaymentHandler) GetPayment(c *gin.Context) {
	p, err := h.svc.GetPayment(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": p})
}

// VNPayWebhook handles POST /webhooks/vnpay (Public — HMAC signed)
// CRITICAL: signature verification is FIRST, before reading any body fields.
func (h *PaymentHandler) VNPayWebhook(c *gin.Context) {
	// VNPay sends params as query string in IPN
	params := make(map[string]string)
	for k, vs := range c.Request.URL.Query() {
		if len(vs) > 0 {
			params[k] = vs[0]
		}
	}
	// Also read from form body if POST
	if err := c.Request.ParseForm(); err == nil {
		for k, vs := range c.Request.Form {
			if _, exists := params[k]; !exists && len(vs) > 0 {
				params[k] = vs[0]
			}
		}
	}

	// Signature check is FIRST — per Spec5 and BE_SYSTEM_GUIDE §4.4
	valid, err := payment.VNPayVerifyWebhook(params)
	if err != nil || !valid {
		// VNPay expects RspCode=97 for invalid signature
		c.JSON(http.StatusOK, gin.H{"RspCode": "97", "Message": "Fail checksum"})
		return
	}

	if err := h.svc.HandleVNPayWebhook(c.Request.Context(), params, true); err != nil {
		c.JSON(http.StatusOK, gin.H{"RspCode": "99", "Message": "Fail"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"RspCode": "00", "Message": "Confirm Success"})
}

// MoMoWebhook handles POST /webhooks/momo (Public — HMAC signed)
func (h *PaymentHandler) MoMoWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"resultCode": 1, "message": "Bad request"})
		return
	}

	// Signature check FIRST
	valid, payload, err := payment.MoMoVerifyCallback(body)
	if err != nil || !valid {
		c.JSON(http.StatusOK, gin.H{"resultCode": 1, "message": "Invalid signature"})
		return
	}

	if err := h.svc.HandleMoMoWebhook(c.Request.Context(), payload, true); err != nil {
		c.JSON(http.StatusOK, gin.H{"resultCode": 1, "message": "Error"})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

// ZaloPayWebhook handles POST /webhooks/zalopay (Public — HMAC signed)
func (h *PaymentHandler) ZaloPayWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"return_code": 0, "return_message": "Bad request"})
		return
	}

	// Signature check FIRST
	valid, payload, err := payment.ZaloPayVerifyCallback(body)
	if err != nil || !valid {
		c.JSON(http.StatusOK, gin.H{"return_code": 0, "return_message": "Invalid MAC"})
		return
	}

	if err := h.svc.HandleZaloPayWebhook(c.Request.Context(), payload, true); err != nil {
		c.JSON(http.StatusOK, gin.H{"return_code": 0, "return_message": "Error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"return_code": 1, "return_message": "Success"})
}
