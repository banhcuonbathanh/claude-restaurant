// Package ai wraps the Anthropic Go SDK for the chat feature.
// It is the ONLY place that talks to the Anthropic API — services depend on
// the small Messenger surface, never on the SDK client directly.
package ai

import (
	"context"
	"os"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
)

// DefaultModel is used when AI_CHAT_MODEL is not set.
const DefaultModel = "claude-opus-4-8"

// Client is a thin wrapper carrying the SDK client + configured model.
type Client struct {
	api   anthropic.Client
	model anthropic.Model
}

// NewClientFromEnv builds a client from ANTHROPIC_API_KEY / AI_CHAT_MODEL.
// Returns nil when no API key is configured — callers treat nil as "chat disabled".
func NewClientFromEnv() *Client {
	key := os.Getenv("ANTHROPIC_API_KEY")
	if key == "" {
		return nil
	}
	model := os.Getenv("AI_CHAT_MODEL")
	if model == "" {
		model = DefaultModel
	}
	return &Client{
		api:   anthropic.NewClient(option.WithAPIKey(key)),
		model: anthropic.Model(model),
	}
}

// Model returns the configured model ID.
func (c *Client) Model() anthropic.Model { return c.model }

// CreateMessage performs one non-streaming Messages API call.
func (c *Client) CreateMessage(ctx context.Context, params anthropic.MessageNewParams) (*anthropic.Message, error) {
	params.Model = c.model
	return c.api.Messages.New(ctx, params)
}
