// Per-model Anthropic pricing used to estimate the cost of each API call.
// Rates are USD per million tokens (MTok). $X per MTok ⇒ X micro-USD per token,
// so cost in micro-USD is a straight tokens × rate sum.

export interface ModelRates {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheReadPerMTok: number;
  cacheWritePerMTok: number;
}

export const MODEL_RATES: Record<string, ModelRates> = {
  'claude-sonnet-4-6': { inputPerMTok: 3, outputPerMTok: 15, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75 },
  'claude-sonnet-4-20250514': { inputPerMTok: 3, outputPerMTok: 15, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75 },
  'claude-haiku-4-5-20251001': { inputPerMTok: 1, outputPerMTok: 5, cacheReadPerMTok: 0.1, cacheWritePerMTok: 1.25 },
};

const FALLBACK_RATES = MODEL_RATES['claude-sonnet-4-6'];

export interface UsageTokens {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

export function estimateCostMicroUsd(model: string, u: UsageTokens): number {
  const rates = MODEL_RATES[model];
  if (!rates) console.warn(`[ai-pricing] unknown model "${model}" — using Sonnet rates`);
  const r = rates ?? FALLBACK_RATES;
  return Math.round(
    (u.input_tokens ?? 0) * r.inputPerMTok +
    (u.output_tokens ?? 0) * r.outputPerMTok +
    (u.cache_read_input_tokens ?? 0) * r.cacheReadPerMTok +
    (u.cache_creation_input_tokens ?? 0) * r.cacheWritePerMTok
  );
}

/** Format integer micro-USD as a dollar string, e.g. 12_345_678 → "$12.35". */
export function formatMicroUsd(microUsd: number): string {
  return '$' + (microUsd / 1_000_000).toFixed(2);
}
