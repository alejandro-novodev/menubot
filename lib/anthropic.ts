// Central Anthropic client resolution + usage recording.
// Paid businesses with an active provisioned key use their own key; everything
// else (free, trial, demo, platform-level calls) uses the NovodevSPA org key.
// Any failure resolving a customer key degrades to the platform key — a bad or
// missing key must never break the diner-facing chat.

import Anthropic from '@anthropic-ai/sdk';
import { query } from './db';
import { decryptSecret } from './crypto';
import { getBusinessPlan } from './subscription';
import { isPaidPlan } from './plans';
import { estimateCostMicroUsd } from './ai-pricing';

export type Feature = 'chat' | 'menu_extract' | 'dish_generate' | 'translate' | 'insights';
export type KeySource = 'platform' | 'customer';

// One client per distinct API key; keyed by the key string itself (in-memory only).
const clientCache = new Map<string, Anthropic>();

function clientFor(apiKey: string): Anthropic {
  let client = clientCache.get(apiKey);
  if (!client) {
    client = new Anthropic({ apiKey });
    clientCache.set(apiKey, client);
  }
  return client;
}

function platformClient(): { client: Anthropic; keySource: KeySource } {
  return { client: clientFor(process.env.ANTHROPIC_API_KEY ?? ''), keySource: 'platform' };
}

export async function getAnthropicClient(
  businessId?: number | null
): Promise<{ client: Anthropic; keySource: KeySource }> {
  if (businessId == null) return platformClient();
  try {
    const plan = await getBusinessPlan(businessId);
    if (!isPaidPlan(plan)) return platformClient();
    const r = await query<{ api_key_encrypted: string | null }>(
      `SELECT api_key_encrypted FROM anthropic_accounts WHERE business_id = $1 AND status = 'active'`,
      [businessId]
    );
    const encrypted = r.rows[0]?.api_key_encrypted;
    if (!encrypted) return platformClient();
    return { client: clientFor(decryptSecret(encrypted)), keySource: 'customer' };
  } catch (err) {
    console.warn(`[anthropic] customer key resolution failed for business ${businessId} — falling back to platform key:`, err);
    return platformClient();
  }
}

/**
 * Record one API call's token usage. Fire-and-forget: callers must NOT await
 * this on the response path, and a failed insert only logs.
 */
export function recordUsage(p: {
  businessId: number | null;
  feature: Feature;
  model: string;
  keySource: KeySource;
  usage: Anthropic.Usage | undefined;
}): void {
  if (!p.usage) return;
  const cost = estimateCostMicroUsd(p.model, p.usage);
  void query(
    `INSERT INTO api_usage (business_id, feature, model, key_source, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_microusd)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      p.businessId,
      p.feature,
      p.model,
      p.keySource,
      p.usage.input_tokens ?? 0,
      p.usage.output_tokens ?? 0,
      p.usage.cache_read_input_tokens ?? 0,
      p.usage.cache_creation_input_tokens ?? 0,
      cost,
    ]
  ).catch((err) => console.error('[usage] insert failed (non-fatal):', err));
}
