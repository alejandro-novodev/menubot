import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getPaymentClient } from '@/lib/payment';

const PLAN_PRICES: Record<string, number> = {
  starter: 9990,
  pro: 24990,
  multi: 59990,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { plan, businessId } = await req.json() as { plan: string; businessId: number };

  if (!PLAN_PRICES[plan]) return NextResponse.json({ error: 'Plan inválido.' }, { status: 400 });

  const priceClp = PLAN_PRICES[plan];
  const userId = parseInt(session.user.id);

  // Cancel existing active subscription for this business
  await query(
    `UPDATE subscriptions SET status = 'cancelled' WHERE business_id = $1 AND status = 'active'`,
    [businessId]
  );

  // Create pending subscription
  const sub = await query<{ id: number }>(
    `INSERT INTO subscriptions (user_id, business_id, plan, status, price_clp)
     VALUES ($1, $2, $3, 'pending', $4) RETURNING id`,
    [userId, businessId, plan, priceClp]
  );
  const subscriptionDbId = sub.rows[0].id;

  const returnUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/dashboard?payment=success`;
  const paymentClient = getPaymentClient();
  const { paymentUrl } = await paymentClient.createSubscription({
    plan,
    priceClp,
    userEmail: session.user.email!,
    userName: session.user.name ?? session.user.email!,
    businessId,
    subscriptionDbId,
    returnUrl,
  });

  return NextResponse.json({ paymentUrl });
}
