'use client';

import { useState } from 'react';
import { PLANS, withIva, annualMonthly, formatClp } from '@/lib/plans';

interface Props {
  businessId: number;
  currentPlan: string | null;
}

const SELF_SERVE: Array<keyof typeof PLANS> = ['starter', 'pro', 'multi'];

export function BillingSection({ businessId, currentPlan }: Props) {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch('/api/flow/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, businessId, billingCycle: cycle }),
      });
      const data = await res.json() as { paymentUrl?: string; error?: string };
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error ?? 'Error al iniciar el pago.');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {/* Annual / monthly toggle */}
      <div className="flex items-center justify-center gap-3 mb-6 select-none">
        <button
          onClick={() => setCycle('monthly')}
          className={`text-sm transition ${cycle === 'monthly' ? 'font-semibold app-ink' : 'app-mut hover:app-ink'}`}
        >
          Mensual
        </button>
        <button
          onClick={() => setCycle(c => c === 'monthly' ? 'annual' : 'monthly')}
          aria-label="Cambiar ciclo de facturación"
          className="relative w-11 h-6 rounded-full bg-accent/30 focus:outline-none"
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-accent shadow transition-all duration-200 ${cycle === 'annual' ? 'left-5' : 'left-0.5'}`}
          />
        </button>
        <button
          onClick={() => setCycle('annual')}
          className={`text-sm transition flex items-center gap-1.5 ${cycle === 'annual' ? 'font-semibold app-ink' : 'app-mut hover:app-ink'}`}
        >
          Anual
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-700/30 px-1.5 py-0.5 rounded-full">
            2 meses gratis
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {SELF_SERVE.map(id => {
          const plan = PLANS[id];
          const net = cycle === 'annual' ? annualMonthly(plan.priceClp!) : plan.priceClp!;
          const withTax = withIva(net);
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-5 flex flex-col ${plan.featured ? 'bg-accent/10 border border-accent/40' : 'app-surface border app-line'}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Más popular
                  </span>
                </div>
              )}

              <h3 className={`font-semibold mb-1 ${plan.featured ? 'text-accent' : 'app-ink'}`}>{plan.name}</h3>
              <p className="app-mut text-xs mb-3 leading-relaxed">{plan.subtitle}</p>

              <div className="mb-0.5">
                <span className="text-2xl font-bold">{formatClp(net)}</span>
                <span className="app-mut text-sm">/mes neto</span>
              </div>
              <p className="text-xs app-mut2 mb-4">{formatClp(withTax)}/mes c/IVA</p>

              <ul className="space-y-1.5 flex-1 mb-4">
                {plan.features.filter(f => f.included).map(f => (
                  <li key={f.text} className="text-xs app-mut flex gap-1.5 items-start">
                    <span className="text-accent shrink-0 mt-px">✓</span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full text-center text-xs app-mut py-2 border app-line rounded-xl">
                  ✓ Plan actual
                </div>
              ) : (
                <button
                  onClick={() => checkout(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                    plan.featured
                      ? 'bg-accent hover:bg-accent-lite text-white'
                      : 'app-surface2 app-soft-hover app-ink border app-line'
                  }`}
                >
                  {loading === plan.id ? 'Procesando...' : 'Elegir plan →'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Enterprise band */}
      <div className="mt-4 app-surface border app-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Enterprise</h3>
          <p className="text-xs app-mut mt-0.5">API · SSO · SLA garantizado · White-label · +5 sucursales</p>
        </div>
        <a
          href="mailto:hola@menubot.cl?subject=MenuBot%20Enterprise"
          className="shrink-0 text-sm font-semibold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-5 py-2.5 rounded-xl transition text-center"
        >
          Hablar con ventas →
        </a>
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center mt-4">{error}</p>
      )}

      <p className="text-xs app-mut2 text-center mt-3">
        {process.env.NODE_ENV === 'development'
          ? '🔧 Modo desarrollo — pagos simulados'
          : 'Pagos procesados por Flow.cl · SSL · Sin contratos'}
        {' '}· Precios en CLP · IVA 19% incluido en precio final
      </p>
    </div>
  );
}
