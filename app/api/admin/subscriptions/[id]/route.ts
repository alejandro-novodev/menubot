import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getPaymentClient } from '@/lib/payment';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const subId = parseInt(id);
  if (isNaN(subId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const { action } = await req.json() as { action: 'activate' | 'cancel' };

  if (action === 'activate') {
    await query(
      `UPDATE subscriptions
       SET status = 'active',
           started_at = COALESCE(started_at, NOW()),
           ends_at = NOW() + (CASE WHEN billing_cycle = 'annual' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END)
       WHERE id = $1`,
      [subId]
    );
    await query(
      `UPDATE businesses SET status = 'active'
       WHERE id = (SELECT business_id FROM subscriptions WHERE id = $1)`,
      [subId]
    );
    return NextResponse.json({ ok: true });
  }

  if (action === 'cancel') {
    const sub = await query<{ payment_provider_id: string | null }>(
      'SELECT payment_provider_id FROM subscriptions WHERE id = $1',
      [subId]
    );
    if (sub.rows[0]?.payment_provider_id) {
      try {
        const client = getPaymentClient();
        await client.cancelSubscription(sub.rows[0].payment_provider_id);
      } catch (e) {
        console.error('[Admin] provider cancel (non-fatal):', e);
      }
    }
    await query(`UPDATE subscriptions SET status = 'cancelled' WHERE id = $1`, [subId]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
}
