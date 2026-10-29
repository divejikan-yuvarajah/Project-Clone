import Anthropic from '@anthropic-ai/sdk';

// Server-side only — never import this file from a client component.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful personal AI assistant running inside a custom-built workspace app. Be concise and direct.';
