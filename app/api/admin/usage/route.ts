import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

interface BizUsageRow {
  business_id: number;
  business_name: string | null;
  plan: string | null;
  calls: string;
  conversations: string;
  input_tokens: string;
  output_tokens: string;
  cost_microusd: string;
  customer_cost_microusd: string;
  platform_cost_microusd: string;
}

/** Resolve ?month=YYYY-MM to [start, end) timestamps; defaults to current month. */
function monthRange(monthParam: string | null): { start: string; end: string; month: string } {
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth(); // 0-based
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number);
    if (m >= 1 && m <= 12) { year = y; month = m - 1; }
  }
  const start = new Date(Date.UTC(year, month, 1)).toISOString();
  const end = new Date(Date.UTC(year, month + 1, 1)).toISOString();
  return { start, end, month: `${year}-${String(month + 1).padStart(2, '0')}` };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { start, end, month } = monthRange(req.nextUrl.searchParams.get('month'));

  const [byBusiness, totals] = await Promise.all([
    query<BizUsageRow>(
      `SELECT u.business_id,
              b.name AS business_name,
              s.plan,
              COUNT(*) AS calls,
              COALESCE((SELECT COUNT(*) FROM chat_sessions cs
                        WHERE cs.business_id = u.business_id
                          AND cs.created_at >= $1 AND cs.created_at < $2), 0) AS conversations,
              SUM(u.input_tokens) AS input_tokens,
              SUM(u.output_tokens) AS output_tokens,
              SUM(u.cost_microusd) AS cost_microusd,
              SUM(u.cost_microusd) FILTER (WHERE u.key_source = 'customer') AS customer_cost_microusd,
              SUM(u.cost_microusd) FILTER (WHERE u.key_source = 'platform') AS platform_cost_microusd
       FROM api_usage u
       LEFT JOIN businesses b ON b.id = u.business_id
       LEFT JOIN subscriptions s ON s.business_id = u.business_id AND s.status = 'active'
       WHERE u.created_at >= $1 AND u.created_at < $2
       GROUP BY u.business_id, b.name, s.plan
       ORDER BY SUM(u.cost_microusd) DESC`,
      [start, end]
    ),
    query<{ calls: string; input_tokens: string; output_tokens: string; cost_microusd: string; platform_cost_microusd: string; customer_cost_microusd: string }>(
      `SELECT COUNT(*) AS calls,
              COALESCE(SUM(input_tokens), 0) AS input_tokens,
              COALESCE(SUM(output_tokens), 0) AS output_tokens,
              COALESCE(SUM(cost_microusd), 0) AS cost_microusd,
              COALESCE(SUM(cost_microusd) FILTER (WHERE key_source = 'platform'), 0) AS platform_cost_microusd,
              COALESCE(SUM(cost_microusd) FILTER (WHERE key_source = 'customer'), 0) AS customer_cost_microusd
       FROM api_usage
       WHERE created_at >= $1 AND created_at < $2`,
      [start, end]
    ),
  ]);

  const t = totals.rows[0];
  return NextResponse.json({
    month,
    totals: {
      calls: parseInt(t.calls),
      inputTokens: parseInt(t.input_tokens),
      outputTokens: parseInt(t.output_tokens),
      costMicroUsd: parseInt(t.cost_microusd),
      platformCostMicroUsd: parseInt(t.platform_cost_microusd),
      customerCostMicroUsd: parseInt(t.customer_cost_microusd),
    },
    businesses: byBusiness.rows.map((r) => ({
      businessId: r.business_id,
      businessName: r.business_name ?? (r.business_id ? `#${r.business_id}` : 'Plataforma'),
      plan: r.plan,
      calls: parseInt(r.calls),
      conversations: parseInt(r.conversations),
      inputTokens: parseInt(r.input_tokens),
      outputTokens: parseInt(r.output_tokens),
      costMicroUsd: parseInt(r.cost_microusd),
      customerCostMicroUsd: parseInt(r.customer_cost_microusd ?? '0'),
      platformCostMicroUsd: parseInt(r.platform_cost_microusd ?? '0'),
    })),
  });
}
