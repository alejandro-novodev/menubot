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
    <div className={`relative flex flex-col rounded-2xl p-6 ${featured ? 'border border-accent/40 bg-accent/5 shadow-md' : 'bg-white border border-black/[0.07] shadow-sm'}`}
      style={featured ? { boxShadow: '0 0 40px rgba(199,107,67,0.12)' } : {}}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">Más popular</span>
        </div>
      )}

      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-1 ${featured ? 'text-accent' : 'text-[#2B2421]'}`}>{plan.name}</h3>
        <p className="text-[#8C8178] text-xs leading-relaxed min-h-[2.5rem]">{plan.subtitle}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        {isCustom ? (
          <>
            <div className="text-2xl font-bold text-[#2B2421]">Personalizado</div>
            <p className="text-[#8C8178] text-xs mt-1">Conversemos según tu operación.</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#2B2421]">{formatClp(net!)}</span>
              <span className="text-[#8C8178] text-sm">/mes</span>
            </div>
            <p className="text-[#9A9087] text-xs mt-1">
              + IVA · ≈ {formatClp(withIva(net!))} con IVA
              {annual && <span className="text-emerald-400"> · facturado anual</span>}
            </p>
          </>
        )}
        {plan.extraBranchClp != null && (
          <p className="text-[#8C8178] text-xs mt-2">
            Incluye {plan.includedBranches} sucursales · +{formatClp(plan.extraBranchClp)}/mes por sucursal adicional
          </p>
        )}
      </div>

      <ul className="flex-1 space-y-2 mb-6">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 shrink-0 ${f.included ? 'text-accent' : 'text-[#C0B6AA]'}`}>{f.included ? '✓' : '✕'}</span>
            <span className={f.included ? 'text-[#3A332E]' : 'text-[#9A9087]'}>{f.text}</span>
          </li>
        ))}
      </ul>

      {plan.ctaType === 'contact' ? (
        <a href={CONTACT_HREF}
          className="w-full text-center rounded-xl py-2.5 text-sm font-semibold transition bg-black/[0.04] hover:bg-black/[0.08] text-[#2B2421] border border-black/10">
          Contáctanos →
        </a>
      ) : (
        <Link href={`/auth/register?plan=${plan.id}`}
          className={`w-full text-center rounded-xl py-2.5 text-sm font-semibold transition ${featured ? 'bg-accent hover:bg-accent-lite text-white' : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#2B2421] border border-black/10'}`}>
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
        <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/[0.04] p-1">
          {([['monthly', 'Mensual'], ['annual', 'Anual']] as const).map(([key, label]) => {
            const on = (key === 'annual') === annual;
            return (
              <button key={key} onClick={() => setAnnual(key === 'annual')}
                className={`text-sm font-medium px-4 py-1.5 rounded-full transition ${on ? 'bg-accent text-white' : 'text-[#8C8178] hover:text-[#2B2421]'}`}>
                {label}{key === 'annual' && <span className={`ml-1.5 text-xs ${on ? 'text-white/80' : 'text-emerald-400'}`}>2 meses gratis</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 items-start">
        {PLAN_ORDER.map((id) => <PlanCard key={id} plan={PLANS[id]} annual={annual} />)}
      </div>

      <p className="text-center text-[#9A9087] text-xs mt-8">
        Precios netos en pesos chilenos (CLP). Se agrega 19% de IVA. Cancela cuando quieras.
      </p>
    </div>
  );
}
