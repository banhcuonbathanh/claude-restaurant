// Package service contains business logic for the BanhCuon system.
package service

import (
	"errors"
	"net/http"
)

// AppError is a structured error that maps to an HTTP response.
// Handlers use errors.As(err, &appErr) to extract status and error code.
type AppError struct {
	Status  int
	Code    string
	Message string
}

func (e *AppError) Error() string {
	return e.Code + ": " + e.Message
}

// Sentinel errors — codes match ERROR_CONTRACT_v1.1.md (SINGLE SOURCE).
var (
	ErrInvalidCredentials    = &AppError{Status: http.StatusUnauthorized, Code: "INVALID_CREDENTIALS", Message: "Tên đăng nhập hoặc mật khẩu không đúng"}
	ErrAccountDisabled       = &AppError{Status: http.StatusUnauthorized, Code: "ACCOUNT_DISABLED", Message: "Tài khoản đã bị vô hiệu hóa"}
	ErrRateLimitExceeded     = &AppError{Status: http.StatusTooManyRequests, Code: "RATE_LIMIT_EXCEEDED", Message: "Quá nhiều lần thử, vui lòng thử lại sau"}
	ErrRefreshTokenInvalid   = &AppError{Status: http.StatusUnauthorized, Code: "REFRESH_TOKEN_INVALID", Message: "Refresh token không hợp lệ hoặc đã hết hạn"}
	ErrNotFound              = &AppError{Status: http.StatusNotFound, Code: "NOT_FOUND", Message: "Không tìm thấy tài nguyên"}
	ErrForbidden             = &AppError{Status: http.StatusForbidden, Code: "FORBIDDEN", Message: "Không đủ quyền truy cập"}
	ErrTableHasActiveOrder   = &AppError{Status: http.StatusConflict, Code: "TABLE_HAS_ACTIVE_ORDER", Message: "Bàn đã có đơn đang xử lý"}
	ErrOrderNotReady         = &AppError{Status: http.StatusConflict, Code: "ORDER_NOT_READY", Message: "Đơn hàng chưa sẵn sàng thanh toán"}
	ErrCancelThreshold       = &AppError{Status: http.StatusConflict, Code: "CANCEL_THRESHOLD", Message: "Không thể huỷ khi đã phục vụ từ 30% trở lên"}
	ErrPaymentAlreadyExists  = &AppError{Status: http.StatusConflict, Code: "PAYMENT_ALREADY_EXISTS", Message: "Đơn hàng đã có thanh toán"}
	ErrInternalError         = &AppError{Status: http.StatusInternalServerError, Code: "INTERNAL_ERROR", Message: "Lỗi máy chủ nội bộ"}
	ErrInvalidInput          = &AppError{Status: http.StatusBadRequest, Code: "INVALID_INPUT", Message: "Dữ liệu đầu vào không hợp lệ"}
	ErrAlreadyGrouped        = &AppError{Status: http.StatusConflict, Code: "ORDER_ALREADY_GROUPED", Message: "Đơn hàng đã thuộc nhóm khác"}
)

// NewAppError creates a new AppError.
func NewAppError(status int, code, message string) *AppError {
	return &AppError{Status: status, Code: code, Message: message}
}

// IsAppError reports whether err is an *AppError.
func IsAppError(err error) bool {
	var e *AppError
	return errors.As(err, &e)
}
