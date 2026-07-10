// Monthly conversation quota per business. A "conversation" is one
// chat_sessions row — the same unit the plans advertise ("conversaciones/mes").

import { query } from './db';
import { getBusinessPlan } from './subscription';
import { getFeatures } from './plan-features';

export interface QuotaStatus {
  plan: string;
  limit: number | null;
  used: number;
  ratio: number;
  /** Only the free tier is hard-blocked; paid plans and trial never block. */
  blocked: boolean;
  warn: boolean;
}

export async function getChatQuota(businessId: number): Promise<QuotaStatus> {
  const plan = await getBusinessPlan(businessId);
  const limit = getFeatures(plan).conversationsLimit;

  const r = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM chat_sessions
     WHERE business_id = $1 AND created_at >= date_trunc('month', NOW())`,
    [businessId]
  );
  const used = parseInt(r.rows[0]?.count ?? '0');

  const ratio = limit ? used / limit : 0;
  return {
    plan,
    limit,
    used,
    ratio,
    blocked: plan === 'free' && limit !== null && used >= limit,
    warn: limit !== null && used >= 0.8 * limit,
  };
}
