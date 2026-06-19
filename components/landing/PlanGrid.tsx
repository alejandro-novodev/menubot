'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PLAN_ORDER, PLANS, withIva, annualMonthly, formatClp, type PlanConfig,
} from '@/lib/plans';

const CONTACT_HREF = 'mailto:hola@menubot.cl?subject=Plan%20Enterprise';

function PlanCard({ plan, annual }: { plan: PlanConfig; annual: boolean }) {
  const featured = !!plan.featured;
  const isCustom = plan.priceClp === null;
  const net = plan.priceClp === null ? null : annual ? annualMonthly(plan.priceClp) : plan.priceClp;

  return (
    <div className={`relative flex flex-col rounded-2xl p-6 ${featured ? 'border border-accent/40 bg-accent/5' : 'bg-[#241F1B] border border-white/5'}`}
      style={featured ? { boxShadow: '0 0 40px rgba(199,107,67,0.12)' } : {}}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">Más popular</span>
        </div>
      )}

      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-1 ${featured ? 'text-accent' : 'text-white'}`}>{plan.name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed min-h-[2.5rem]">{plan.subtitle}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        {isCustom ? (
          <>
            <div className="text-2xl font-bold text-white">Personalizado</div>
            <p className="text-gray-500 text-xs mt-1">Conversemos según tu operación.</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{formatClp(net!)}</span>
              <span className="text-gray-500 text-sm">/mes</span>
            </div>
            <p className="text-gray-600 text-xs mt-1">
              + IVA · ≈ {formatClp(withIva(net!))} con IVA
              {annual && <span className="text-emerald-400"> · facturado anual</span>}
            </p>
          </>
        )}
        {plan.extraBranchClp != null && (
          <p className="text-gray-500 text-xs mt-2">
            Incluye {plan.includedBranches} sucursales · +{formatClp(plan.extraBranchClp)}/mes por sucursal adicional
          </p>
        )}
      </div>

      <ul className="flex-1 space-y-2 mb-6">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 shrink-0 ${f.included ? 'text-accent' : 'text-gray-700'}`}>{f.included ? '✓' : '✕'}</span>
            <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>{f.text}</span>
          </li>
        ))}
      </ul>

      {plan.ctaType === 'contact' ? (
        <a href={CONTACT_HREF}
          className="w-full text-center rounded-xl py-2.5 text-sm font-semibold transition bg-[#2E2823] hover:bg-[#3A332D] text-gray-200 border border-white/10">
          Contáctanos →
        </a>
      ) : (
        <Link href={`/auth/register?plan=${plan.id}`}
          className={`w-full text-center rounded-xl py-2.5 text-sm font-semibold transition ${featured ? 'bg-accent hover:bg-accent-lite text-white' : 'bg-[#2E2823] hover:bg-[#3A332D] text-gray-200 border border-white/10'}`}>
          Empezar →
        </Link>
      )}
    </div>
  );
}

export function PlanGrid() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Monthly / annual toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {([['monthly', 'Mensual'], ['annual', 'Anual']] as const).map(([key, label]) => {
            const on = (key === 'annual') === annual;
            return (
              <button key={key} onClick={() => setAnnual(key === 'annual')}
                className={`text-sm font-medium px-4 py-1.5 rounded-full transition ${on ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}>
                {label}{key === 'annual' && <span className={`ml-1.5 text-xs ${on ? 'text-white/80' : 'text-emerald-400'}`}>2 meses gratis</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 items-start">
        {PLAN_ORDER.map((id) => <PlanCard key={id} plan={PLANS[id]} annual={annual} />)}
      </div>

      <p className="text-center text-gray-600 text-xs mt-8">
        Precios netos en pesos chilenos (CLP). Se agrega 19% de IVA. Cancela cuando quieras.
      </p>
    </div>
  );
}
