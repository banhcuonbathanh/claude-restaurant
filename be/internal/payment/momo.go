package payment

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// MoMoCreatePaymentResult holds what the handler needs after creating a MoMo payment.
type MoMoCreatePaymentResult struct {
	PayURL    string
	QRCodeURL string
	RequestID string
}

// MoMoCreatePayment builds and signs the MoMo create-payment request body.
// Returns the signed payload for forwarding to MoMo API.
func MoMoCreatePayment(orderID, amount, orderInfo, redirectURL, ipnURL string) (map[string]any, error) {
	partnerCode := os.Getenv("MOMO_PARTNER_CODE")
	accessKey := os.Getenv("MOMO_ACCESS_KEY")
	secretKey := os.Getenv("MOMO_SECRET_KEY")
	if partnerCode == "" || accessKey == "" || secretKey == "" {
		return nil, fmt.Errorf("momo: missing env vars")
	}

	requestID := fmt.Sprintf("%s-%d", orderID, time.Now().UnixMilli())
	rawHash := fmt.Sprintf("accessKey=%s&amount=%s&extraData=&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=payWithMethod",
		accessKey, amount, ipnURL, orderID, orderInfo, partnerCode, redirectURL, requestID)

	sig := momoHMAC(secretKey, rawHash)

	return map[string]any{
		"partnerCode": partnerCode,
		"requestId":   requestID,
		"amount":      amount,
		"orderId":     orderID,
		"orderInfo":   orderInfo,
		"redirectUrl": redirectURL,
		"ipnUrl":      ipnURL,
		"requestType": "payWithMethod",
		"extraData":   "",
		"lang":        "vi",
		"signature":   sig,
	}, nil
}

// MoMoVerifyCallback validates the HMAC-SHA256 signature on a MoMo IPN callback.
// Returns true if valid.
func MoMoVerifyCallback(body []byte) (bool, map[string]any, error) {
	secretKey := os.Getenv("MOMO_SECRET_KEY")
	accessKey := os.Getenv("MOMO_ACCESS_KEY")
	if secretKey == "" {
		return false, nil, fmt.Errorf("momo: MOMO_SECRET_KEY not set")
	}

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return false, nil, fmt.Errorf("momo: unmarshal: %w", err)
	}

	received, _ := payload["signature"].(string)
	orderID, _ := payload["orderId"].(string)
	requestID, _ := payload["requestId"].(string)
	amount := fmt.Sprintf("%v", payload["amount"])
	resultCode := fmt.Sprintf("%v", payload["resultCode"])
	message, _ := payload["message"].(string)

	rawHash := fmt.Sprintf("accessKey=%s&amount=%s&extraData=&message=%s&orderId=%s&orderInfo=&orderType=momo_wallet&partnerCode=%s&payType=qr&requestId=%s&responseTime=%v&resultCode=%s&transId=%v",
		accessKey, amount, message, orderID, os.Getenv("MOMO_PARTNER_CODE"), requestID,
		payload["responseTime"], resultCode, payload["transId"])

	expected := momoHMAC(secretKey, rawHash)
	return expected == received, payload, nil
}

// MoMoCallAPI sends the signed create-payment payload to MoMo's API and returns
// the payUrl and qrCodeUrl from the response.
func MoMoCallAPI(payload map[string]any) (payURL, qrCodeURL string, err error) {
	endpoint := os.Getenv("MOMO_ENDPOINT")
	if endpoint == "" {
		return "", "", fmt.Errorf("momo: MOMO_ENDPOINT not set")
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "", "", fmt.Errorf("momo: marshal payload: %w", err)
	}
	resp, err := http.Post(endpoint, "application/json", bytes.NewReader(body)) //nolint:gosec
	if err != nil {
		return "", "", fmt.Errorf("momo: http post: %w", err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	var result map[string]any
	if err := json.Unmarshal(raw, &result); err != nil {
		return "", "", fmt.Errorf("momo: unmarshal response: %w", err)
	}
	payURL, _ = result["payUrl"].(string)
	qrCodeURL, _ = result["qrCodeUrl"].(string)
	return payURL, qrCodeURL, nil
}

func momoHMAC(secret, data string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(data))
	return hex.EncodeToString(mac.Sum(nil))
}
