'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';
import { PLAN_ORDER, PLANS, withIva, annualMonthly, formatClp, type PlanConfig } from '@/lib/plans';

const FAQ = [
  { q: '¿Los precios incluyen IVA?', a: 'Sí. Los precios que ves incluyen IVA (19%). El valor neto también se muestra en cada plan. Emitimos factura electrónica o boleta — si eres empresa puedes usar la factura para recuperar el IVA como crédito fiscal en tu F29.' },
  { q: '¿Cómo funciona el período de prueba?', a: 'Tienes 14 días gratis con acceso completo al plan que elijas. No se cobra nada hasta que termine el período de prueba. Puedes cancelar cuando quieras desde tu panel — sin llamadas, sin trámites.' },
  { q: '¿Necesito saber de tecnología para instalarlo?', a: 'No. Subes tu carta en formato PDF o texto, nosotros la procesamos y te entregamos un QR listo para imprimir. El proceso completo toma menos de 30 minutos.' },
  { q: '¿Qué pasa si actualizo mi carta?', a: 'Puedes actualizar la carta cuando quieras desde tu panel — el bot refleja los cambios en minutos. Las actualizaciones son ilimitadas en todos los planes.' },
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí. Puedes subir o bajar de plan cuando quieras. Al subir el cambio es inmediato; al bajar se aplica al siguiente ciclo de facturación.' },
  { q: '¿El bot habla otros idiomas además del español?', a: 'Sí. El bot detecta automáticamente el idioma del comensal y responde en consecuencia — inglés, portugués y más. Ideal para restaurantes con turismo internacional.' },
];

const ENTERPRISE_TAGS = ['API + webhooks', 'SSO usuarios ilimitados', 'Integración POS / delivery', 'SLA garantizado', 'Onboarding dedicado', 'White-label opcional', 'Precio por volumen'];

function PricingCard({ plan, annual }: { plan: PlanConfig; annual: boolean }) {
  const featured = !!plan.featured;
  const isCustom = plan.priceClp === null;
  const net = isCustom ? null : annual ? annualMonthly(plan.priceClp!) : plan.priceClp!;
  const total = net !== null ? withIva(net) : null;
  const extraNet = plan.extraBranchClp !== null ? (annual ? annualMonthly(plan.extraBranchClp!) : plan.extraBranchClp!) : null;

  return (
    <div className={`relative flex flex-col rounded-2xl border p-7 transition hover:-translate-y-0.5 ${
      featured
        ? 'border-[#C76B43] shadow-[0_0_0_3px_rgba(199,107,67,0.12),0_12px_40px_rgba(26,18,8,0.10)] -translate-y-1'
        : 'border-[#E3DBD0] shadow-[0_1px_3px_rgba(26,18,8,0.08),0_4px_16px_rgba(26,18,8,0.06)] bg-white'
    } bg-white`}>
      {featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C76B43] text-white text-[11px] font-semibold px-3.5 py-1 rounded-full tracking-wide uppercase whitespace-nowrap">
          ⭐ Más popular
        </div>
      )}

      <div className="mb-5">
        <div className="text-xl font-bold text-[#1A1208] mb-1">{plan.name}</div>
        <div className="text-[#8A7A66] text-xs leading-snug min-h-[2.5em]">{plan.subtitle}</div>
      </div>

      {isCustom ? (
        <div className="mb-6">
          <div className="text-3xl font-bold text-[#1A1208]">A medida</div>
          <div className="text-xs text-[#8A7A66] mt-1">Conversemos según tu operación.</div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-xs text-[#8A7A66] mb-0.5">Neto: <span className="font-semibold text-[#4A3F2F] text-sm">{formatClp(net!)}</span>/mes</div>
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="text-4xl font-bold text-[#1A1208] leading-none">{formatClp(total!)}</span>
            <span className="text-sm text-[#8A7A66]">/mes c/IVA</span>
          </div>
          <div className="text-[11px] text-[#8A7A66]">
            Precio final · <strong className="text-[#4A3F2F]">IVA incluido (19%)</strong> · Factura o boleta
          </div>
          {extraNet !== null && (
            <div className="text-[11px] text-[#8A7A66] mt-1.5">
              Base hasta {plan.includedBranches} sucursales · +{formatClp(withIva(extraNet))}/sucursal adicional c/IVA
            </div>
          )}
          {annual && (
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 rounded-full">
              2 meses gratis con facturación anual
            </div>
          )}
        </div>
      )}

      {plan.ctaType === 'contact' ? (
        <a href="mailto:hola@menubot.cl?subject=Plan%20Enterprise"
          className="block w-full text-center rounded-xl py-3 text-sm font-semibold border border-[#E3DBD0] text-[#1A1208] hover:border-[#8A7A66] transition mb-5">
          Habla con nosotros →
        </a>
      ) : (
        <Link href={`/auth/register?plan=${plan.id}`}
          className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition mb-5 ${
            featured
              ? 'bg-[#C76B43] hover:bg-[#9A6020] text-white'
              : 'bg-[#F0EBE0] hover:bg-[#E3DBD0] text-[#1A1208]'
          }`}>
          Probar 14 días gratis
        </Link>
      )}

      <hr className="border-[#F0EBE0] mb-4" />

      <ul className="flex-1 space-y-2.5">
        {plan.features.map(f => (
          <li key={f.text} className="flex items-start gap-2.5 text-xs">
            <span className={`shrink-0 mt-0.5 font-bold ${f.included ? 'text-[#2D6A4F]' : 'text-[#E3DBD0]'}`}>
              {f.included ? '✓' : '✕'}
            </span>
            <span className={f.included ? 'text-[#4A3F2F]' : 'text-[#8A7A66]'}>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1208]" style={{ fontFamily: 'var(--font-archivo, system-ui)' }}>

      {/* Nav */}
      <nav className="border-b border-black/[0.07] px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon size={26} />
          <Wordmark size="md" className="text-[#2B2421]" />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/auth/login" className="text-[#6B6259] hover:text-[#2B2421] transition">Iniciar sesión</Link>
          <Link href="/auth/register" className="font-semibold bg-[#C76B43] hover:bg-[#9A6020] text-white px-4 py-1.5 rounded-xl transition">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C76B43] block mb-3">MenuBot · Planes y precios</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 tracking-tight">
            Tu carta digital<br />
            <em className="not-italic text-[#C76B43]">que responde sola.</em>
          </h1>
          <p className="text-[#4A3F2F] text-base max-w-md mx-auto leading-relaxed">
            El chatbot de IA que atiende las dudas de tus comensales — ingredientes, alérgenos, recomendaciones y más. Sin interrumpir a tu equipo.
          </p>
        </div>

        {/* Annual/monthly toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-medium ${!annual ? 'text-[#1A1208]' : 'text-[#8A7A66]'}`}>Pago mensual</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6.5 rounded-full border transition-colors ${annual ? 'bg-[#C76B43] border-[#C76B43]' : 'bg-[#E3DBD0] border-[#E3DBD0]'}`}
            style={{ height: 26 }}
            aria-label="Cambiar ciclo de facturación">
            <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${annual ? 'left-[3px] translate-x-[22px]' : 'left-[3px]'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-[#1A1208]' : 'text-[#8A7A66]'}`}>Anual</span>
          <span className="bg-[#D8F3DC] text-[#2D6A4F] text-[11px] font-semibold px-2 py-0.5 rounded-full">2 meses gratis</span>
        </div>

        <p className="text-center text-[11px] text-[#2D6A4F] mb-10">✓ 14 días de prueba gratuita · Sin tarjeta · Cancela cuando quieras</p>

        {/* Plan cards — only Starter, Pro, Multi (3 cols) */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {PLAN_ORDER.filter(id => id !== 'enterprise').map(id => (
            <PricingCard key={id} plan={PLANS[id]} annual={annual} />
          ))}
        </div>

        {/* Enterprise */}
        <div className="rounded-2xl bg-[#1A1208] text-white p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
          <div className="flex-1">
            <div className="text-xl font-bold mb-1.5">Enterprise</div>
            <p className="text-[#B8A990] text-sm leading-relaxed max-w-lg">
              Para grupos gastronómicos, cadenas con +5 locales o integradores que necesitan API, SLA garantizado y configuración a medida.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {ENTERPRISE_TAGS.map(tag => (
                <span key={tag} className="bg-white/[0.08] border border-white/[0.12] rounded-full text-[11px] px-2.5 py-0.5 text-[#E0D5C5]">{tag}</span>
              ))}
            </div>
          </div>
          <a href="mailto:hola@menubot.cl?subject=Plan%20Enterprise"
            className="shrink-0 bg-[#C76B43] hover:bg-[#9A6020] text-white font-semibold text-sm px-6 py-3 rounded-xl transition whitespace-nowrap">
            Habla con nosotros
          </a>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Preguntas frecuentes</h2>
          <div className="divide-y divide-[#E3DBD0]">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left flex justify-between items-center gap-4 py-4 text-sm font-semibold text-[#1A1208] hover:text-[#C76B43] transition">
                  <span>{item.q}</span>
                  <span className={`text-[#8A7A66] text-lg transition-transform shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <p className="pb-4 text-sm text-[#4A3F2F] leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
