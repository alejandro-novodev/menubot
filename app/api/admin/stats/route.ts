import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const [bizStats, subStats, recentBiz, recentWaitlist, recentUsers, subscriptions] = await Promise.all([
    query<{ status: string; count: string }>(`
      SELECT status, COUNT(*) as count FROM businesses GROUP BY status
    `),
    query<{ plan: string; status: string; count: string; mrr: string }>(`
      SELECT plan, status, COUNT(*) as count, COALESCE(SUM(price_clp),0) as mrr
      FROM subscriptions GROUP BY plan, status
    `),
    query<{ id: number; name: string; slug: string; status: string; menu_completeness: number; created_at: string; email: string; plan: string; trial_ends: string | null; is_demo: boolean }>(`
      SELECT b.id, b.name, b.slug, b.status, b.menu_completeness, b.created_at,
             COALESCE(b.is_demo, false) as is_demo,
             u.email, s.plan,
             CASE WHEN s.plan = 'trial' THEN s.ends_at::text ELSE NULL END as trial_ends
      FROM businesses b
      JOIN users u ON u.id = b.user_id
      LEFT JOIN subscriptions s ON s.business_id = b.id AND s.status = 'active'
      ORDER BY b.created_at DESC
      LIMIT 50
    `),
    query<{ id: number; name: string; restaurant_name: string; email: string; plan: string; created_at: string }>(`
      SELECT id, name, restaurant_name, email, plan, created_at
      FROM waitlist ORDER BY created_at DESC LIMIT 20
    `),
    query<{ id: number; name: string; email: string; role: string; approved: boolean; created_at: string }>(`
      SELECT id, name, email, role, approved, created_at
      FROM users ORDER BY approved ASC, created_at DESC LIMIT 100
    `),
    query<{
      id: number; plan: string; status: string; billing_cycle: string;
      price_clp: number | null; ends_at: string | null; started_at: string | null;
      created_at: string; payment_provider_id: string | null;
      user_name: string | null; user_email: string;
      business_name: string; business_slug: string;
    }>(`
      SELECT
        s.id, s.plan, s.status, s.billing_cycle, s.price_clp,
        s.ends_at::text AS ends_at, s.started_at::text AS started_at,
        s.created_at::text AS created_at,
        s.payment_provider_id,
        u.name AS user_name, u.email AS user_email,
        b.name AS business_name, b.slug AS business_slug
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      JOIN businesses b ON b.id = s.business_id
      ORDER BY s.created_at DESC
      LIMIT 100
    `),
  ]);

  const pendingUsers = recentUsers.rows.filter(u => !u.approved).length;

  const bizByStatus = Object.fromEntries(bizStats.rows.map(r => [r.status, parseInt(r.count)]));
  const mrr = subStats.rows
    .filter(r => r.status === 'active' && r.plan !== 'trial')
    .reduce((sum, r) => sum + parseInt(r.mrr), 0);

  // ARR: annual subs charged yearly (price_clp is monthly net), monthly subs × 12
  const arr = subscriptions.rows
    .filter(r => r.status === 'active' && r.plan !== 'trial' && r.price_clp)
    .reduce((sum, r) => {
      const monthly = r.price_clp!;
      return sum + (r.billing_cycle === 'annual' ? monthly * 10 : monthly * 12);
    }, 0);

  return NextResponse.json({
    businesses: {
      active: bizByStatus.active ?? 0,
      pending: bizByStatus.pending ?? 0,
      suspended: bizByStatus.suspended ?? 0,
      total: Object.values(bizByStatus).reduce((a, b) => a + b, 0),
    },
    mrr,
    arr,
    recentBusinesses: recentBiz.rows,
    waitlist: recentWaitlist.rows,
    users: recentUsers.rows,
    subscriptions: subscriptions.rows,
    pendingUsers,
    inviteOnly: process.env.INVITE_ONLY !== 'false',
  });
}
