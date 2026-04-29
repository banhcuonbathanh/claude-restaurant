// Package bcrypt wraps golang.org/x/crypto/bcrypt for password hashing.
// cost=12 matches 001_auth.sql comment.
package bcrypt

import (
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

const cost = 12

// ErrInvalidCredentials is returned on password mismatch.
// SECURITY: callers must return an identical error for wrong username and wrong password —
// never reveal which field was wrong.
var ErrInvalidCredentials = errors.New("invalid credentials")

// Hash returns a bcrypt hash of plain at cost=12.
func Hash(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), cost)
	if err != nil {
		return "", fmt.Errorf("bcrypt.Hash: %w", err)
	}
	return string(b), nil
}

// Verify returns nil if plain matches hash, ErrInvalidCredentials otherwise.
// Timing-safe: bcrypt.CompareHashAndPassword is constant-time.
func Verify(hash, plain string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
	if err != nil {
		return ErrInvalidCredentials
	}
	return nil
}
