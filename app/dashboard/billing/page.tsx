import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import Link from 'next/link';
import { BillingClient } from './BillingClient';

interface Business {
  id: number;
  name: string;
  slug: string;
}

interface Subscription {
  plan: string;
  status: string;
  ends_at: string | null;
  price_clp: number | null;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9990,
    description: 'Para restaurantes que están comenzando.',
    features: ['1 restaurante', '500 chats / mes', 'Asistente en español', 'Soporte por email'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 24990,
    description: 'Para restaurantes que quieren crecer.',
    featured: true,
    features: ['1 restaurante', 'Chats ilimitados', 'Asistente en español', 'Analytics básico', 'Soporte por email'],
  },
  {
    id: 'multi',
    name: 'Multi',
    price: 59990,
    description: 'Para cadenas y grupos gastronómicos.',
    features: ['Hasta 5 locales', 'Chats ilimitados', 'Analytics avanzado', 'Marca blanca', 'Soporte prioritario'],
  },
];

export default async function BillingPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');

  const userId = parseInt(session.user.id);

  const [bizResult, subResult] = await Promise.all([
    query<Business>('SELECT id, name, slug FROM businesses WHERE user_id = $1 ORDER BY created_at LIMIT 1', [userId]),
    query<Subscription>(
      `SELECT plan, status, ends_at, price_clp FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
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

  return (
    <div className="min-h-screen bg-[#1A1613] text-white flex flex-col">
      <header className="border-b border-white/5 px-5 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <h1 className="font-semibold">Plan y facturación</h1>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 space-y-8">
        {/* Current plan */}
        {subscription && (
          <div className="bg-[#241F1B] border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Plan actual</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold capitalize">{subscription.plan}</span>
              <span className="text-xs bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full">{subscription.status}</span>
            </div>
            {trialDaysLeft >= 0 && (
              <p className="text-sm text-yellow-400 mt-2">
                ⏳ {trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''} restantes de prueba gratuita
              </p>
            )}
          </div>
        )}

        {/* Plan cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-4">
            {subscription?.plan !== 'trial' ? 'Cambiar plan' : 'Elige tu plan'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div key={plan.id} className={`relative rounded-2xl p-5 flex flex-col ${plan.featured ? 'bg-accent/10 border border-accent/40' : 'bg-[#241F1B] border border-white/5'}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">Más popular</span>
                  </div>
                )}
                <h3 className={`font-semibold mb-1 ${plan.featured ? 'text-accent' : 'text-white'}`}>{plan.name}</h3>
                <p className="text-gray-500 text-xs mb-3">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold">${plan.price.toLocaleString('es-CL')}</span>
                  <span className="text-gray-500 text-sm">/mes</span>
                </div>
                <ul className="space-y-1.5 flex-1 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs text-gray-300 flex gap-1.5">
                      <span className="text-accent">✓</span>{f}
                    </li>
                  ))}
                </ul>
                {business ? (
                  <BillingClient
                    planId={plan.id}
                    businessId={business.id}
                    isCurrent={subscription?.plan === plan.id}
                    isFeatured={plan.featured}
                  />
                ) : (
                  <Link href="/dashboard/onboarding" className="block text-center text-xs text-gray-500 py-2">
                    Configura tu negocio primero
                  </Link>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 text-center mt-4">
            {process.env.NODE_ENV === 'development' ? '🔧 Modo desarrollo — pagos simulados' : 'Pagos procesados por Flow.cl · SSL · Sin contratos'}
          </p>
        </div>
      </main>
    </div>
  );
}
