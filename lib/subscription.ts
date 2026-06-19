import { query } from './db';

/**
 * The plan string for a business, from its active subscription. Defaults to
 * 'starter' when there is no active subscription. May be 'trial' — pass the
 * result through getFeatures(), which treats trial as Pro.
 */
export async function getBusinessPlan(businessId: number): Promise<string> {
  const r = await query<{ plan: string }>(
    `SELECT plan FROM subscriptions WHERE business_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
    [businessId]
  );
  return r.rows[0]?.plan ?? 'starter';
}
