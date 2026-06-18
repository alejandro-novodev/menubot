import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import Link from 'next/link';
import { QRCard } from '@/components/dashboard/QRCard';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Business {
  id: number;
  name: string;
  slug: string;
  menu_completeness: number;
  status: string;
}

interface Subscription {
  plan: string;
  status: string;
  ends_at: string | null;
}

function TrialBanner({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) return null;
  const urgent = daysLeft <= 3;
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${urgent ? 'bg-red-900/30 border-b border-red-700/30 text-red-300' : 'bg-accent/15 border-b border-accent/25 text-accent'}`}>
      <span>
        {urgent ? '⚠️' : '⏳'}{' '}
        {daysLeft === 0
          ? 'Tu prueba gratuita termina hoy.'
          : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restantes de prueba gratuita.`}
      </span>
      <Link href="/dashboard/billing" className="text-xs font-semibold underline underline-offset-2 shrink-0 hover:opacity-80 transition">
        Elegir plan →
      </Link>
    </div>
  );
}

function CompletenessBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : 'bg-orange-500';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs app-mut mb-1">
        <span>Completeness</span>
        <span className={score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-orange-400'}>{score}%</span>
      </div>
      <div className="w-full app-surface2 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');

  const userId = parseInt(session.user.id);

  const [bizResult, subResult] = await Promise.all([
    query<Business>(
      'SELECT id, name, slug, menu_completeness, status FROM businesses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    ),
    query<Subscription>(
      `SELECT plan, status, ends_at FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [userId]
    ),
  ]);

  const businesses = bizResult.rows;
  const subscription = subResult.rows[0] ?? null;
  const hasBusiness = businesses.length > 0;

  // Calculate trial days left
  let trialDaysLeft = -1;
  if (subscription?.plan === 'trial' && subscription.ends_at) {
    const ms = new Date(subscription.ends_at).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen app-bg app-ink flex flex-col">
      {/* Trial banner */}
      {trialDaysLeft >= 0 && <TrialBanner daysLeft={trialDaysLeft} />}

      {/* Header */}
      <header className="border-b app-line px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          <span className="flex items-center gap-2"><LogoIcon size={26} /><Wordmark size="md" /></span>
        </Link>
        <div className="flex items-center gap-4 text-sm app-mut">
          {session.user.role === 'admin' && (
            <Link href="/admin" className="text-accent hover:text-accent-lite transition text-xs">Admin →</Link>
          )}
          <Link href="/dashboard/billing" className="app-mut app-ink-hover transition text-xs">Plan</Link>
          <span className="hidden sm:inline app-mut2">{session.user.email}</span>
          <Link href="/api/auth/signout" className="app-mut2 app-ink-hover transition text-xs">Salir</Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="app-mut text-sm">Hola, {session.user.name ?? session.user.email}</p>
          </div>
          {!hasBusiness && (
            <Link
              href="/dashboard/onboarding"
              className="bg-accent hover:bg-accent-lite text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              + Configurar negocio
            </Link>
          )}
        </div>

        {!hasBusiness ? (
          <div className="app-surface border app-line rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-lg font-semibold mb-2">Comienza configurando tu negocio</h2>
            <p className="app-mut text-sm mb-6">Sube tu carta y activa tu asistente de IA en minutos.</p>
            <Link
              href="/dashboard/onboarding"
              className="inline-block bg-accent hover:bg-accent-lite text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              Empezar →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map(biz => (
              <div key={biz.id} className="app-surface border app-line rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="font-semibold app-ink break-words">{biz.name}</h2>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${biz.status === 'active' ? 'bg-emerald-500 text-white' : 'app-surface2 app-mut'}`}>
                        {biz.status === 'active' ? '● Activo' : biz.status}
                      </span>
                    </div>
                    <p className="text-xs app-mut mt-0.5 break-all">menubot.cl/chat/{biz.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
                    <Link href={`/dashboard/info?biz=${biz.id}`} className="text-xs app-mut app-ink-hover app-soft app-soft-hover border app-line px-3 py-1.5 rounded-lg transition">
                      Información
                    </Link>
                    <Link href={`/dashboard/insights?biz=${biz.id}`} className="text-xs app-mut app-ink-hover app-soft app-soft-hover border app-line px-3 py-1.5 rounded-lg transition">
                      Conversaciones
                    </Link>
                    <Link href={`/dashboard/menu?biz=${biz.id}`} className="text-xs app-mut app-ink-hover app-soft app-soft-hover border app-line px-3 py-1.5 rounded-lg transition">
                      Gestionar carta
                    </Link>
                    <Link href={`/chat/${biz.slug}`} target="_blank" className="text-xs text-accent hover:text-accent-lite bg-accent/15 hover:bg-accent/20 border border-accent/25 px-3 py-1.5 rounded-lg transition">
                      Ver carta →
                    </Link>
                  </div>
                </div>
                <CompletenessBar score={biz.menu_completeness} />
                {biz.menu_completeness < 80 && (
                  <Link href={`/dashboard/menu?biz=${biz.id}`} className="block mt-2 text-xs text-accent hover:text-accent-lite transition">
                    Completar información →
                  </Link>
                )}
                <div className="mt-4">
                  <QRCard slug={biz.slug} businessName={biz.name} />
                </div>
              </div>
            ))}

            <Link
              href="/dashboard/onboarding"
              className="block app-surface border border-dashed app-line hover:border-accent/30 rounded-2xl p-5 text-center text-sm app-mut2 app-ink-hover transition"
            >
              + Agregar otro negocio
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
