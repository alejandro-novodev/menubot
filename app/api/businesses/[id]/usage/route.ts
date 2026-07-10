import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getChatQuota } from '@/lib/quota';
import { getPlan } from '@/lib/plans';

export const runtime = 'nodejs';

interface FeatureUsageRow {
  feature: string;
  calls: string;
  input_tokens: string;
  output_tokens: string;
  cache_read_tokens: string;
  cache_creation_tokens: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const businessId = parseInt(id);

  const biz = await query<{ id: number; name: string }>(
    'SELECT id, name FROM businesses WHERE id = $1 AND user_id = $2',
    [businessId, parseInt(session.user.id)]
  );
  if (biz.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const sub = await query<{ plan: string; ends_at: string | null }>(
    `SELECT plan, ends_at FROM subscriptions WHERE business_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
    [businessId]
  );
  const endsAt = sub.rows[0]?.ends_at ?? null;

  const quota = await getChatQuota(businessId);

  // Month-to-date token detail by feature. Cost stays internal — not exposed here.
  const tokens = await query<FeatureUsageRow>(
    `SELECT feature,
            COUNT(*) AS calls,
            SUM(input_tokens) AS input_tokens,
            SUM(output_tokens) AS output_tokens,
            SUM(cache_read_tokens) AS cache_read_tokens,
            SUM(cache_creation_tokens) AS cache_creation_tokens
     FROM api_usage
     WHERE business_id = $1 AND created_at >= date_trunc('month', NOW())
     GROUP BY feature
     ORDER BY feature`,
    [businessId]
  );

  return NextResponse.json({
    businessName: biz.rows[0].name,
    plan: quota.plan,
    planName: quota.plan === 'trial' ? 'Trial' : getPlan(quota.plan).name,
    endsAt,
    conversations: {
      used: quota.used,
      limit: quota.limit,
      ratio: quota.ratio,
      warn: quota.warn,
      blocked: quota.blocked,
    },
    tokens: tokens.rows.map((t) => ({
      feature: t.feature,
      calls: parseInt(t.calls),
      inputTokens: parseInt(t.input_tokens),
      outputTokens: parseInt(t.output_tokens),
      cacheReadTokens: parseInt(t.cache_read_tokens),
      cacheCreationTokens: parseInt(t.cache_creation_tokens),
    })),
  });
}
