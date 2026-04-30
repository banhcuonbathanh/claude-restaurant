// Package payment implements HMAC signature helpers for VNPay, MoMo, and ZaloPay.
package payment

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"
)

// VNPayCreateURL builds a redirect URL for VNPay QR/ATM payment.
// Spec: HMAC-SHA512 over sorted query params (hash key excluded).
func VNPayCreateURL(orderID, amount, orderInfo, returnURL string) (string, error) {
	secretKey := os.Getenv("VNPAY_HASH_SECRET")
	tmnCode := os.Getenv("VNPAY_TMN_CODE")
	baseURL := os.Getenv("VNPAY_BASE_URL")
	if secretKey == "" || tmnCode == "" || baseURL == "" {
		return "", fmt.Errorf("vnpay: missing env vars (VNPAY_HASH_SECRET, VNPAY_TMN_CODE, VNPAY_BASE_URL)")
	}

	now := time.Now()
	params := map[string]string{
		"vnp_Version":    "2.1.0",
		"vnp_Command":    "pay",
		"vnp_TmnCode":    tmnCode,
		"vnp_Amount":     amount + "00", // VNPay uses 100× multiplier
		"vnp_CurrCode":   "VND",
		"vnp_TxnRef":     orderID,
		"vnp_OrderInfo":  orderInfo,
		"vnp_OrderType":  "other",
		"vnp_Locale":     "vn",
		"vnp_ReturnUrl":  returnURL,
		"vnp_IpAddr":     "127.0.0.1",
		"vnp_CreateDate": now.Format("20060102150405"),
		"vnp_ExpireDate": now.Add(15 * time.Minute).Format("20060102150405"),
	}

	signData := buildVNPaySignString(params)
	sig := vnpayHMAC(secretKey, signData)

	q := url.Values{}
	for k, v := range params {
		q.Set(k, v)
	}
	q.Set("vnp_SecureHash", sig)
	return baseURL + "?" + q.Encode(), nil
}

// VNPayVerifyWebhook validates the HMAC signature on an incoming VNPay IPN/callback.
// Per spec: remove vnp_SecureHash + vnp_SecureHashType, sort remaining keys, concat, HMAC-SHA512.
// Returns (true, nil) if valid, (false, nil) if signature mismatch.
func VNPayVerifyWebhook(params map[string]string) (bool, error) {
	secretKey := os.Getenv("VNPAY_HASH_SECRET")
	if secretKey == "" {
		return false, fmt.Errorf("vnpay: VNPAY_HASH_SECRET not set")
	}

	received := params["vnp_SecureHash"]
	if received == "" {
		return false, nil
	}

	// Build sign string without hash fields
	filtered := make(map[string]string, len(params))
	for k, v := range params {
		if k != "vnp_SecureHash" && k != "vnp_SecureHashType" {
			filtered[k] = v
		}
	}

	signData := buildVNPaySignString(filtered)
	expected := vnpayHMAC(secretKey, signData)
	return strings.EqualFold(expected, received), nil
}

// buildVNPaySignString sorts keys alphabetically and concatenates as key=value&key=value.
func buildVNPaySignString(params map[string]string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		if params[k] != "" {
			parts = append(parts, k+"="+params[k])
		}
	}
	return strings.Join(parts, "&")
}

func vnpayHMAC(secret, data string) string {
	mac := hmac.New(sha512.New, []byte(secret))
	mac.Write([]byte(data))
	return hex.EncodeToString(mac.Sum(nil))
}
