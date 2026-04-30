package payment

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// ZaloPayCreatePayment builds the ZaloPay create-order payload with MAC.
func ZaloPayCreatePayment(orderID, amount, description string) (map[string]any, error) {
	appID := os.Getenv("ZALOPAY_APP_ID")
	key1 := os.Getenv("ZALOPAY_KEY1")
	if appID == "" || key1 == "" {
		return nil, fmt.Errorf("zalopay: missing env vars (ZALOPAY_APP_ID, ZALOPAY_KEY1)")
	}

	appTransID := fmt.Sprintf("%s_%s", time.Now().Format("060102"), orderID)
	appTime := fmt.Sprintf("%d", time.Now().UnixMilli())
	itemJSON := `[]`

	rawMAC := fmt.Sprintf("%s|%s|%s|%s|%s|%s|%s",
		appID, appTransID, "BanhCuon App", amount, appTime, itemJSON, description)
	mac := zaloPayHMAC(key1, rawMAC)

	return map[string]any{
		"app_id":       appID,
		"app_trans_id": appTransID,
		"app_user":     "banhcuon",
		"app_time":     appTime,
		"item":         itemJSON,
		"embed_data":   `{"redirecturl":""}`,
		"amount":       amount,
		"description":  description,
		"mac":          mac,
	}, nil
}

// ZaloPayVerifyCallback validates the MAC on a ZaloPay callback.
// Returns true if valid.
func ZaloPayVerifyCallback(body []byte) (bool, map[string]any, error) {
	key2 := os.Getenv("ZALOPAY_KEY2")
	if key2 == "" {
		return false, nil, fmt.Errorf("zalopay: ZALOPAY_KEY2 not set")
	}

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return false, nil, fmt.Errorf("zalopay: unmarshal: %w", err)
	}

	data, _ := payload["data"].(string)
	received, _ := payload["mac"].(string)

	expected := zaloPayHMAC(key2, data)
	return expected == received, payload, nil
}

func zaloPayHMAC(secret, data string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(data))
	return hex.EncodeToString(mac.Sum(nil))
}
