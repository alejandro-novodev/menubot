import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import Link from 'next/link';
import { BillingSection } from './BillingSection';

interface Business {
  id: number;
  name: string;
}

interface Subscription {
  plan: string;
  status: string;
  ends_at: string | null;
  billing_cycle: string | null;
  price_clp: number | null;
}

export default async function BillingPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');

  const userId = parseInt(session.user.id);

  const [bizResult, subResult] = await Promise.all([
    query<Business>('SELECT id, name FROM businesses WHERE user_id = $1 ORDER BY created_at LIMIT 1', [userId]),
    query<Subscription>(
      `SELECT plan, status, ends_at, billing_cycle, price_clp
       FROM subscriptions WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    ),
  ]);

  const business = bizResult.rows[0] ?? null;
  const subscription = subResult.rows[0] ?? null;

  let trialDaysLeft = -1;
  if (subscription?.plan === 'trial' && subscription.ends_at) {
    const ms = new Date(subscription.ends_at).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const activePaidPlan =
    subscription?.status === 'active' && subscription.plan !== 'trial'
      ? subscription.plan
      : null;

  return (
    <div className="min-h-screen app-bg app-ink flex flex-col">
      <header className="border-b app-line px-5 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="app-mut app-ink-hover transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="font-semibold">Plan y facturación</h1>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 space-y-8">
        {/* Current plan status */}
        {subscription && (
          <div className="app-surface border app-line rounded-2xl p-5">
            <p className="text-xs app-mut mb-1">Plan actual</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold capitalize">{subscription.plan}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                subscription.status === 'active'
                  ? 'bg-emerald-900/40 text-emerald-400'
                  : subscription.status === 'cancelled'
                  ? 'bg-red-900/40 text-red-400'
                  : 'bg-yellow-900/40 text-yellow-400'
              }`}>
                {{ active: 'activo', pending: 'pendiente', cancelled: 'cancelado', past_due: 'pago atrasado' }[subscription.status] ?? subscription.status}
              </span>
              {subscription.billing_cycle && subscription.plan !== 'trial' && (
                <span className="text-xs app-mut2">{subscription.billing_cycle === 'annual' ? 'Anual' : 'Mensual'}</span>
              )}
            </div>
            {trialDaysLeft >= 0 && (
              <p className={`text-sm mt-2 ${trialDaysLeft <= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
                {trialDaysLeft === 0
                  ? '⚠️ Tu prueba termina hoy.'
                  : `⏳ ${trialDaysLeft} día${trialDaysLeft !== 1 ? 's' : ''} restantes de prueba gratuita.`}
              </p>
            )}
          </div>
        )}

        {/* Plan selector */}
        <div>
          <h2 className="text-sm font-semibold app-mut mb-5">
            {activePaidPlan ? 'Cambiar plan' : 'Elige tu plan'}
          </h2>

          {business ? (
            <BillingSection businessId={business.id} currentPlan={activePaidPlan} />
          ) : (
            <div className="app-surface border app-line rounded-2xl p-8 text-center">
              <p className="app-mut text-sm mb-4">Primero configura tu negocio para poder suscribirte.</p>
              <Link
                href="/dashboard/onboarding"
                className="inline-block bg-accent hover:bg-accent-lite text-white font-semibold px-5 py-2 rounded-xl text-sm transition"
              >
                Configurar negocio →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
