package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/middleware"
	"banhcuon/be/internal/repository"
	"banhcuon/be/internal/service"
)

const maxFileSize = 10 << 20 // 10 MB

var allowedMIME = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
}

// FileHandler handles /files/* endpoints.
type FileHandler struct {
	repo repository.FileRepository
}

// NewFileHandler creates a FileHandler.
func NewFileHandler(repo repository.FileRepository) *FileHandler {
	return &FileHandler{repo: repo}
}

// Upload handles POST /files/upload (Staff+)
func (h *FileHandler) Upload(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxFileSize+1024)

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		respondError(c, http.StatusBadRequest, "INVALID_INPUT", "File không hợp lệ")
		return
	}
	defer file.Close()

	if header.Size > maxFileSize {
		respondError(c, http.StatusUnprocessableEntity, "FILE_TOO_LARGE", "File vượt quá 10MB")
		return
	}

	// Detect MIME from first 512 bytes
	buf := make([]byte, 512)
	n, _ := file.Read(buf)
	detected := http.DetectContentType(buf[:n])
	// Normalize: some images detected as "image/jpeg; charset=..."
	mimeType := strings.Split(detected, ";")[0]
	if !allowedMIME[mimeType] {
		respondError(c, http.StatusUnprocessableEntity, "UNSUPPORTED_FILE_TYPE", "Chỉ chấp nhận image/jpeg, image/png, image/webp")
		return
	}

	ext := filepath.Ext(header.Filename)
	id := service.NewPublicUUID()
	objectPath := fmt.Sprintf("uploads/%s%s", id, ext)

	storageBase := os.Getenv("STORAGE_BASE_PATH")
	if storageBase != "" {
		fullPath := filepath.Join(storageBase, objectPath)
		if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
			respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi lưu file")
			return
		}
		if err := c.SaveUploadedFile(header, fullPath); err != nil {
			respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi lưu file")
			return
		}
	}

	staffID := middleware.StaffIDFromContext(c)
	if err := h.repo.CreateFileAttachment(c.Request.Context(), db.CreateFileAttachmentParams{
		ID:           id,
		ObjectPath:   objectPath,
		OriginalName: header.Filename,
		MimeType:     mimeType,
		SizeBytes:    header.Size,
		UploadedBy:   sql.NullString{String: staffID, Valid: staffID != ""},
	}); err != nil {
		respondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Lỗi ghi DB")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": gin.H{
		"id":          id,
		"object_path": objectPath,
	}})
}
