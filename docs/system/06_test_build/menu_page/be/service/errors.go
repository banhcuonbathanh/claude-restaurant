// P-SYSTEST reference build — AppError + sentinels per ERROR_SPEC.md §3. Not compiled into the app.
package service

import "net/http"

type AppError struct {
	Status  int
	Code    string
	Message string
}

func (e *AppError) Error() string { return e.Code + ": " + e.Message }

var (
	ErrNotFound = &AppError{Status: http.StatusNotFound, Code: "NOT_FOUND", Message: "Không tìm thấy tài nguyên"}
	ErrInvalid  = &AppError{Status: http.StatusBadRequest, Code: "INVALID_INPUT", Message: "Dữ liệu không hợp lệ"}
)
