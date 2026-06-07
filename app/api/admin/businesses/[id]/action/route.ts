import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const { action, plan } = await req.json() as { action: 'activate' | 'suspend' | 'change_plan'; plan?: string };

  if (action === 'activate') {
    await query(`UPDATE businesses SET status = 'active' WHERE id = $1`, [id]);
    // Ensure active subscription exists
    const existing = await query(
      `SELECT id FROM subscriptions WHERE business_id = $1 AND status = 'active'`, [id]
    );
    if (existing.rows.length === 0) {
      const biz = await query<{ user_id: number }>('SELECT user_id FROM businesses WHERE id = $1', [id]);
      if (biz.rows[0]) {
        await query(
          `INSERT INTO subscriptions (user_id, business_id, plan, status, started_at, ends_at, price_clp)
           VALUES ($1, $2, 'trial', 'active', NOW(), NOW() + INTERVAL '14 days', 0)
           ON CONFLICT DO NOTHING`,
          [biz.rows[0].user_id, id]
        );
      }
    }
  } else if (action === 'suspend') {
    await query(`UPDATE businesses SET status = 'suspended' WHERE id = $1`, [id]);
    await query(`UPDATE subscriptions SET status = 'cancelled' WHERE business_id = $1 AND status = 'active'`, [id]);
  } else if (action === 'change_plan' && plan) {
    await query(
      `UPDATE subscriptions SET plan = $1 WHERE business_id = $2 AND status = 'active'`,
      [plan, id]
    );
  }

  return NextResponse.json({ success: true });
}
