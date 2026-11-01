// Rough per-million-token pricing — update if Anthropic changes rates.
// Current numbers: https://platform.claude.com/docs/en/about-claude/pricing
const PRICING_PER_MILLION_TOKENS: Record<string, { input: number; output: number }> = {
  'claude-haiku-5-5': { input: 1, output: 5 },
  'claude-sonnet-5': { input: 3, output: 15 },
  'claude-opus-5-5': { input: 5, output: 25 },
};

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const rates = PRICING_PER_MILLION_TOKENS[model];
  if (!rates) return 0;
  const inputCost = (inputTokens / 1_000_000) * rates.input;
  const outputCost = (outputTokens / 1_000_000) * rates.output;
  return Number((inputCost + outputCost).toFixed(6));
}
