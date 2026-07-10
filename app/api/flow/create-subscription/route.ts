import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getPaymentClient } from '@/lib/payment';
import { PLANS, withIva, annualMonthly, isPaidPlan } from '@/lib/plans';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { plan, businessId, billingCycle = 'monthly' } = await req.json() as {
    plan: string;
    businessId: number;
    billingCycle?: 'monthly' | 'annual';
  };

  const planConfig = PLANS[plan as keyof typeof PLANS];
  // Free is not purchasable; enterprise has custom pricing (contact CTA).
  if (!planConfig || planConfig.priceClp === null || !isPaidPlan(plan)) {
    return NextResponse.json({ error: 'Plan inválido.' }, { status: 400 });
  }

  const netMonthly = billingCycle === 'annual' ? annualMonthly(planConfig.priceClp) : planConfig.priceClp;
  const chargeClp = billingCycle === 'annual'
    ? withIva(netMonthly * 12)  // one annual charge
    : withIva(netMonthly);       // monthly charge

  const userId = parseInt(session.user.id);

  // Cancel any existing active subscription for this business
  await query(
    `UPDATE subscriptions SET status = 'cancelled' WHERE business_id = $1 AND status = 'active'`,
    [businessId]
  );

  // Create pending subscription record
  const sub = await query<{ id: number }>(
    `INSERT INTO subscriptions (user_id, business_id, plan, status, price_clp, billing_cycle)
     VALUES ($1, $2, $3, 'pending', $4, $5) RETURNING id`,
    [userId, businessId, plan, netMonthly, billingCycle]
  );
  const subscriptionDbId = sub.rows[0].id;

  const base = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';
  const returnUrl = `${base}/dashboard?payment=success`;
  const confirmationUrl = `${base}/api/flow/webhook`;

  const paymentClient = getPaymentClient();
  const { paymentUrl, providerSubscriptionId } = await paymentClient.createSubscription({
    plan,
    priceClp: chargeClp,
    billingCycle,
    userEmail: session.user.email!,
    userName: session.user.name ?? session.user.email!,
    businessId,
    subscriptionDbId,
    returnUrl,
    confirmationUrl,
  });

  // Store the Flow subscription ID
  await query(
    `UPDATE subscriptions SET payment_provider_id = $1 WHERE id = $2`,
    [providerSubscriptionId, subscriptionDbId]
  );

  return NextResponse.json({ paymentUrl });
}
