import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import Link from 'next/link';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getChatQuota, type QuotaStatus } from '@/lib/quota';
import { getPlan } from '@/lib/plans';

export const dynamic = 'force-dynamic';

interface Business {
  id: number;
  name: string;
  slug: string;
}

interface FeatureUsageRow {
  business_id: number;
  feature: string;
  calls: string;
  input_tokens: string;
  output_tokens: string;
}

const FEATURE_LABELS: Record<string, string> = {
  chat: 'Chat con clientes',
  menu_extract: 'Carta digitalizada',
  dish_generate: 'Descripciones IA',
  translate: 'Traducciones',
  insights: 'Análisis de conversaciones',
};

function QuotaBar({ quota }: { quota: QuotaStatus }) {
  if (quota.limit === null) {
    return (
      <div className="flex justify-between text-xs app-mut mb-1">
        <span>Conversaciones este mes</span>
        <span className="text-emerald-400">{quota.used} · Ilimitado</span>
      </div>
    );
  }
  const pct = Math.min(100, Math.round(quota.ratio * 100));
  // Keep a visible sliver when there is any usage at all.
  const barPct = quota.used > 0 ? Math.max(pct, 2) : 0;
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-emerald-500';
  const textColor = pct >= 100 ? 'text-red-400' : pct >= 80 ? 'text-yellow-400' : 'text-emerald-400';
  return (
    <div>
      <div className="flex justify-between text-xs app-mut mb-1">
        <span>Conversaciones este mes</span>
        <span className={textColor}>{quota.used} / {quota.limit}</span>
      </div>
      <div className="w-full app-surface2 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${barPct}%` }} />
      </div>
    </div>
  );
}

export default async function UsagePage() {
  const session = await auth();
  if (!session) redirect('/auth/login');

  const userId = parseInt(session.user.id);

  const bizResult = await query<Business>(
    'SELECT id, name, slug FROM businesses WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  const businesses = bizResult.rows;

  const quotas = new Map<number, QuotaStatus>();
  for (const biz of businesses) {
    quotas.set(biz.id, await getChatQuota(biz.id));
  }

  const bizIds = businesses.map((b) => b.id);
  const tokensResult = bizIds.length
    ? await query<FeatureUsageRow>(
        `SELECT business_id, feature,
                COUNT(*) AS calls,
                SUM(input_tokens) AS input_tokens,
                SUM(output_tokens) AS output_tokens
         FROM api_usage
         WHERE business_id = ANY($1) AND created_at >= date_trunc('month', NOW())
         GROUP BY business_id, feature
         ORDER BY feature`,
        [bizIds]
      )
    : { rows: [] as FeatureUsageRow[] };

  const tokensByBiz = new Map<number, FeatureUsageRow[]>();
  for (const row of tokensResult.rows) {
    const list = tokensByBiz.get(row.business_id) ?? [];
    list.push(row);
    tokensByBiz.set(row.business_id, list);
  }

  const rawMonth = new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

  return (
    <div className="min-h-screen app-bg app-ink flex flex-col">
      <header className="border-b app-line px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <span className="flex items-center gap-2"><LogoIcon size={24} /><Wordmark size="md" /></span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-xs app-mut app-ink-hover app-soft app-soft-hover border app-line px-2.5 py-1.5 rounded-lg transition">
            ← Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Uso</h1>
          <p className="app-mut text-sm">{monthName}</p>
        </div>

        {businesses.length === 0 ? (
          <div className="app-surface border app-line rounded-2xl p-8 text-center">
            <p className="app-mut text-sm">Aún no tienes negocios configurados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((biz) => {
              const quota = quotas.get(biz.id)!;
              const tokens = tokensByBiz.get(biz.id) ?? [];
              const planName = quota.plan === 'trial' ? '⏳ Trial' : getPlan(quota.plan).name;
              return (
                <div key={biz.id} className="app-surface border app-line rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center flex-wrap gap-2 min-w-0">
                      <h2 className="font-semibold app-ink break-words">{biz.name}</h2>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full app-surface2 app-mut whitespace-nowrap">
                        Plan {planName}
                      </span>
                    </div>
                  </div>

                  <QuotaBar quota={quota} />

                  {quota.warn && (
                    <div className={`mt-3 text-xs rounded-lg px-3 py-2 ${quota.blocked ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/20 text-yellow-500'}`}>
                      {quota.blocked
                        ? 'Alcanzaste el límite de conversaciones de este mes. Tus clientes seguirán viendo la carta, pero el chat quedó pausado.'
                        : 'Estás cerca de tu límite mensual de conversaciones.'}{' '}
                      <Link href="/dashboard/billing" className="font-semibold underline underline-offset-2 hover:opacity-80">
                        Mejora tu plan →
                      </Link>
                    </div>
                  )}

                  {tokens.length > 0 && (
                    <details className="mt-4">
                      <summary className="text-xs app-mut cursor-pointer select-none app-ink-hover transition">
                        Detalle de tokens de IA
                      </summary>
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="app-mut2 text-left">
                              <th className="py-1.5 pr-3 font-medium">Función</th>
                              <th className="py-1.5 pr-3 font-medium text-right">Llamadas</th>
                              <th className="py-1.5 pr-3 font-medium text-right">Tokens entrada</th>
                              <th className="py-1.5 font-medium text-right">Tokens salida</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tokens.map((t) => (
                              <tr key={t.feature} className="border-t app-line">
                                <td className="py-1.5 pr-3 app-ink">{FEATURE_LABELS[t.feature] ?? t.feature}</td>
                                <td className="py-1.5 pr-3 text-right app-mut">{parseInt(t.calls).toLocaleString('es-CL')}</td>
                                <td className="py-1.5 pr-3 text-right app-mut">{parseInt(t.input_tokens).toLocaleString('es-CL')}</td>
                                <td className="py-1.5 text-right app-mut">{parseInt(t.output_tokens).toLocaleString('es-CL')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  )}
                  {tokens.length === 0 && (
                    <p className="mt-4 text-xs app-mut2">Sin actividad de IA este mes.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
