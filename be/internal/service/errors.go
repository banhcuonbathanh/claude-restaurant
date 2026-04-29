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

// Sentinel errors used by service layer.
var (
	ErrInvalidCredentials = &AppError{Status: http.StatusUnauthorized, Code: "AUTH_001", Message: "Tên đăng nhập hoặc mật khẩu không đúng"}
	ErrAccountDisabled    = &AppError{Status: http.StatusUnauthorized, Code: "AUTH_004", Message: "Tài khoản đã bị vô hiệu hóa"}
	ErrRateLimitExceeded  = &AppError{Status: http.StatusTooManyRequests, Code: "AUTH_005", Message: "Quá nhiều lần thử, vui lòng thử lại sau"}
	ErrNotFound           = &AppError{Status: http.StatusNotFound, Code: "COMMON_003", Message: "Không tìm thấy tài nguyên"}
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
