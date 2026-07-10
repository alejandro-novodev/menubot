'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { HeroShowcase } from '@/components/landing/HeroShowcase';
import { ContactModal } from '@/components/landing/ContactModal';
import { PlanGrid } from '@/components/landing/PlanGrid';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';

const STEPS = [
  { step: '01', icon: '🚀', title: 'Crea tu cuenta', desc: '14 días gratis, sin tarjeta. Configura el perfil de tu negocio en menos de un minuto.' },
  { step: '02', icon: '📄', title: 'Sube tu carta', desc: 'PDF, foto o imagen. La IA extrae los platos, precios e ingredientes automáticamente.' },
  { step: '03', icon: '💬', title: 'Comparte con tus clientes', desc: 'Imprime el QR o comparte el link. Tus clientes chatean sin apps ni descargas.' },
];

const FAQ = [
  { q: '¿Los precios incluyen IVA?', a: 'Sí. Los precios de los planes incluyen IVA (19%). También mostramos el valor neto en cada plan. Emitimos factura electrónica o boleta — si eres empresa usas la factura para recuperar el IVA en tu F29.' },
  { q: '¿Cómo funciona el período de prueba?', a: 'Tienes 14 días gratis con acceso completo. No se cobra nada hasta que termina el período. Cancela cuando quieras desde tu panel — sin llamadas, sin trámites.' },
  { q: '¿Necesito saber de tecnología?', a: 'No. Subes tu carta en PDF o texto, nosotros la procesamos y te entregamos un QR listo para las mesas. El proceso completo toma menos de 30 minutos.' },
  { q: '¿El bot habla otros idiomas?', a: 'Sí. Detecta el idioma del comensal y responde en consecuencia — inglés, portugués y más. Ideal para restaurantes con turismo internacional.' },
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí. Al subir el cambio es inmediato; al bajar se aplica al siguiente ciclo de facturación.' },
  { q: '¿Cuántas conversaciones incluye cada plan?', a: 'Starter: 1.500/mes · Pro: 5.000/mes · Multi: 15.000/mes · Enterprise: ilimitadas. Una "conversación" es una sesión de chat completa con un comensal. La mayoría de los locales no supera las 2.000 al mes.' },
  { q: '¿Qué pasa si supero las conversaciones de mi plan?', a: 'Tu asistente no se apaga: en los planes pagados el chat sigue atendiendo a tus clientes y te avisamos para ajustar el plan si tu local crece. Además puedes seguir tu consumo en tiempo real desde la sección "Uso" de tu panel.' },
  { q: '¿Sirve para cumplir con la normativa de alérgenos?', a: 'Sí. Todos los planes incluyen el exportador de PDF de alérgenos según la Resolución N° 20 del Minsal. El documento muestra cada plato con sus alérgenos declarados y puede presentarse en inspecciones sanitarias.' },
  { q: '¿Puedo generar descripciones para mis platos con IA?', a: 'Sí, disponible desde el plan Pro. El generador lee el nombre del plato y propone una descripción de una o dos frases en español chileno, los ingredientes principales y los alérgenos relevantes. Tú revisas y confirmas antes de guardar.' },
];

const NAV_LINKS = [
  { label: 'El producto', href: '#producto' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Precios', href: '#precios' },
  { label: 'Demo', href: '/chat/el-meson-austral' },
];

export default function Home() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function openModal(plan = '') { setSelectedPlan(plan); setModalOpen(true); }

  return (
    <div className="bg-[#FAF6EF] text-[#2B2421] min-h-screen">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#FAF6EF]/95 backdrop-blur-md border-b border-black/[0.07]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <LogoIcon size={28} />
            <Wordmark size="md" className="text-[#2B2421]" />
          </Link>

          {/* Desktop anchor links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[#6B6259] hover:text-[#2B2421] transition px-3 py-1.5 rounded-lg hover:bg-black/[0.04]"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Auth CTAs */}
          <div className="flex items-center gap-2">
            {session?.user ? (
              <Link href="/dashboard" className="text-sm font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
                Mi panel →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block text-sm text-[#6B6259] hover:text-[#2B2421] transition px-3 py-1.5">
                  Iniciar sesión
                </Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
                  Registrarse gratis
                </Link>
              </>
            )}

            {/* Mobile nav toggle */}
            <button
              onClick={() => setMobileNavOpen(o => !o)}
              className="md:hidden p-2 rounded-lg hover:bg-black/[0.05] transition"
              aria-label="Menú"
            >
              {mobileNavOpen
                ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="2" x2="16" y2="16"/><line x1="16" y1="2" x2="2" y2="16"/></svg>
                : <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="5" x2="16" y2="5"/><line x1="2" y1="9" x2="16" y2="9"/><line x1="2" y1="13" x2="16" y2="13"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-black/[0.07] bg-[#FAF6EF] px-5 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNavOpen(false)}
                className="text-sm text-[#6B6259] hover:text-[#2B2421] transition py-2.5 border-b border-black/[0.05] last:border-0"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero + all features merged ── */}
      <HeroShowcase />

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="py-16 px-5 border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold text-accent tracking-widest uppercase mb-3">El proceso</span>
            <h2 className="text-3xl font-bold mb-3">Activo en minutos</h2>
            <p className="text-[#6B6259]">Tres pasos y tu restaurante tiene su asistente de carta.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map(step => (
              <div key={step.step} className="bg-white rounded-2xl border border-black/[0.07] p-6 relative">
                <span className="absolute top-4 right-4 text-xs font-mono text-[#C0B6AA]">{step.step}</span>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="text-[#2B2421] font-semibold mb-2">{step.title}</h3>
                <p className="text-[#6B6259] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Visual flow connector */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-[#9A9087]">
            <span className="w-2 h-2 rounded-full bg-accent/40" />
            <span className="w-2 h-2 rounded-full bg-accent/40" />
            <span className="w-2 h-2 rounded-full bg-accent/40" />
            <span className="ml-2">Tu carta digital lista en &lt; 30 min</span>
          </div>
        </div>
      </section>

      {/* ── Comparison: MenuBot vs QR clásico ── */}
      <section className="py-16 px-5 border-t border-black/[0.06] bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold text-accent tracking-widest uppercase mb-3">¿Por qué no el QR clásico?</span>
            <h2 className="text-3xl font-bold mb-3">Una carta que responde, no solo muestra</h2>
            <p className="text-[#6B6259] text-sm">El QR clásico es un PDF online. MenuBot es un asistente que conoce tu carta.</p>
          </div>
          <div className="rounded-2xl border border-black/[0.09] overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-[#FAF6EF]">
              <div className="px-4 py-3 text-[#6B6259]">Funcionalidad</div>
              <div className="px-4 py-3 text-center text-[#9A9087]">QR clásico</div>
              <div className="px-4 py-3 text-center text-accent">MenuBot</div>
            </div>
            {[
              ['Carta digital con QR', true, true],
              ['Asistente IA 24/7', false, true],
              ['Multiidioma automático', false, true],
              ['Recomendaciones personalizadas', false, true],
              ['División de cuenta sin calculadora', false, true],
              ['PDF alérgenos (Res. 20 Minsal)', false, true],
              ['Analytics de conversaciones', false, true],
              ['Reseñas y respuestas del dueño', false, true],
              ['Generador de descripciones con IA', false, true],
            ].map(([feat, classic, mb], i) => (
              <div key={i} className={`grid grid-cols-3 text-sm border-t border-black/[0.06] ${i % 2 === 0 ? '' : 'bg-[#FAF6EF]/40'}`}>
                <div className="px-4 py-3 text-[#2B2421]">{feat as string}</div>
                <div className="px-4 py-3 text-center">{classic ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-[#C0B6AA]">—</span>}</div>
                <div className="px-4 py-3 text-center">{mb ? <span className="text-accent font-bold">✓</span> : <span className="text-[#C0B6AA]">—</span>}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#9A9087] mt-4">Precio QR clásico: gratis. MenuBot: desde $14.990/mes + IVA — el costo de 3 cafés al día.</p>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="precios" className="py-16 px-5 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <span className="inline-block text-xs font-semibold text-accent tracking-widest uppercase mb-3">Precios</span>
            <h2 className="text-3xl font-bold mb-3">Planes simples, sin sorpresas</h2>
            <p className="text-[#6B6259]">Precios en pesos chilenos. Los primeros 14 días son gratis en cualquier plan.</p>
          </div>
          <p className="text-center text-xs text-emerald-600 mb-10">✓ 14 días de prueba gratuita · Sin tarjeta · Cancela cuando quieras</p>
          <PlanGrid />
          <p className="text-center text-xs text-[#9A9087] mt-6">
            Ver el detalle completo en la{' '}
            <Link href="/pricing" className="text-accent hover:text-accent-lite transition underline underline-offset-2">página de planes</Link>.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-5 border-t border-black/[0.06]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Preguntas frecuentes</h2>
            <p className="text-[#6B6259] text-sm">
              ¿Algo que no quedó claro? Escríbenos a{' '}
              <a href="mailto:hola@menubot.cl" className="text-accent hover:underline">hola@menubot.cl</a>
            </p>
          </div>
          <div className="divide-y divide-black/[0.07]">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left flex justify-between items-center gap-4 py-4 text-sm font-semibold text-[#2B2421] hover:text-accent transition"
                >
                  <span>{item.q}</span>
                  <span className={`text-[#9A9087] text-lg transition-transform shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <p className="pb-4 text-sm text-[#6B6259] leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-16 px-5 border-t border-black/[0.06] text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
            <LogoIcon size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-3">¿Listo para empezar?</h2>
          <p className="text-[#6B6259] mb-8">
            Regístrate gratis, sube tu carta y activa tu asistente de IA en menos de 5 minutos.
          </p>
          <Link
            href="/auth/register"
            className="inline-block rounded-xl bg-accent hover:bg-accent-lite active:scale-95 transition-all px-9 py-3.5 text-base font-semibold text-white"
            style={{ boxShadow: '0 8px 24px rgba(199,107,67,0.28)' }}
          >
            Crear cuenta gratis →
          </Link>
          <p className="text-xs text-[#9A9087] mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-[#6B6259] hover:text-[#2B2421] transition underline underline-offset-2">Iniciar sesión</Link>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/[0.07] py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9A9087]">
          <span className="flex items-center gap-2">
            <LogoIcon size={16} />
            © {new Date().getFullYear()} Novodev SPA · Todos los derechos reservados.
          </span>
          <div className="flex gap-5">
            <button onClick={() => openModal()} className="hover:text-[#6B6259] transition">Contacto</button>
            <Link href="/chat/el-meson-austral" className="hover:text-[#6B6259] transition">Demo</Link>
            <a href="#precios" className="hover:text-[#6B6259] transition">Precios</a>
            <Link href="/auth/login" className="hover:text-[#6B6259] transition">Iniciar sesión</Link>
          </div>
        </div>
      </footer>

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialPlan={selectedPlan} />
    </div>
  );
}
