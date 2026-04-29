// pkg/bcrypt/bcrypt.go
// Password hashing and verification.
// Ref: 001_auth.sql — password_hash VARCHAR(255), bcrypt cost=12.
package bcrypt

import (
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

const cost = 12

// ErrInvalidCredentials is returned on password mismatch.
// SECURITY: auth_service MUST return a generic error message to callers —
// never reveal whether the username doesn't exist vs password is wrong.
// Ref: SQLC_SETUP.docx §3 — GetStaffByUsername comment.
var ErrInvalidCredentials = errors.New("invalid credentials")

// Hash returns a bcrypt hash of the plaintext password at cost=12.
func Hash(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), cost)
	if err != nil {
		return "", fmt.Errorf("bcrypt.Hash: %w", err)
	}
	return string(b), nil
}

// Verify returns nil if plain matches the stored hash, ErrInvalidCredentials otherwise.
// Timing-safe: bcrypt.CompareHashAndPassword is constant-time.
func Verify(hash, plain string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
	if err != nil {
		// Map any error (mismatch or malformed hash) to ErrInvalidCredentials —
		// prevents distinguishing "bad hash" from "wrong password" externally.
		return ErrInvalidCredentials
	}
	return nil
}
