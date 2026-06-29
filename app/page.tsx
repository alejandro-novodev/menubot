'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppShowcase } from '@/components/landing/AppShowcase';
import { ContactModal } from '@/components/landing/ContactModal';
import { PlanGrid } from '@/components/landing/PlanGrid';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';

const HOW_IT_WORKS = [
  { step: '01', icon: '🚀', title: 'Crea tu cuenta', desc: '14 días gratis, sin tarjeta. Regístrate en menos de un minuto y configura el perfil de tu negocio.' },
  { step: '02', icon: '📄', title: 'Sube tu carta', desc: 'PDF, foto o imagen. La IA extrae todos los platos, precios e ingredientes automáticamente.' },
  { step: '03', icon: '💬', title: 'Comparte con tus clientes', desc: 'Un QR o link único. Tus clientes chatean con el asistente directamente, sin apps ni descargas.' },
];

const FAQ = [
  { q: '¿Los precios incluyen IVA?', a: 'Los precios que ves en el plan incluyen IVA (19%). El valor neto también se muestra en cada plan. Emitimos factura electrónica o boleta — si eres empresa puedes usar la factura para recuperar el IVA como crédito fiscal en tu F29.' },
  { q: '¿Cómo funciona el período de prueba?', a: 'Tienes 14 días gratis con acceso completo al plan que elijas. No se cobra nada hasta que termine el período de prueba. Puedes cancelar cuando quieras desde tu panel — sin llamadas, sin trámites.' },
  { q: '¿Necesito saber de tecnología para instalarlo?', a: 'No. Subes tu carta en formato PDF o texto, nosotros la procesamos y te entregamos un QR listo para imprimir y poner en las mesas. El proceso completo toma menos de 30 minutos.' },
  { q: '¿Qué pasa si actualizo mi carta?', a: 'Puedes actualizar la carta cuando quieras desde tu panel — el bot refleja los cambios en minutos. Las actualizaciones son ilimitadas en todos los planes.' },
  { q: '¿El bot habla otros idiomas además del español?', a: 'Sí. El bot detecta automáticamente el idioma del comensal y responde en consecuencia — inglés, portugués y más. Ideal para restaurantes con turismo internacional.' },
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí. Puedes subir o bajar de plan cuando quieras. Al subir el cambio es inmediato; al bajar se aplica al siguiente ciclo de facturación.' },
];

export default function Home() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function openModal(plan = '') { setSelectedPlan(plan); setModalOpen(true); }

  return (
    <div className="bg-[#FAF6EF] text-[#2B2421] min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#FAF6EF]/90 backdrop-blur-md border-b border-black/[0.07]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <LogoIcon size={28} />
            <Wordmark size="md" className="text-[#2B2421]" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/chat" className="text-sm text-[#6B6259] hover:text-[#2B2421] transition hidden sm:block">Ver demo</Link>
            {session?.user ? (
              <Link href="/dashboard" className="text-sm font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
                Mi panel →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-[#6B6259] hover:text-[#2B2421] transition">Iniciar sesión</Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
                  Registrarse gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-14">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#F2EAE0] blur-2xl" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: value proposition ── */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-black/10 bg-black/[0.035]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-[#5A524A] font-medium">Para restaurantes, bares y hoteles · 14 días gratis</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
              La carta que habla{' '}
              <span className="text-accent">con tus clientes</span>
            </h1>

            <p className="text-[#6B6259] text-lg leading-relaxed mb-8 max-w-lg">
              Un asistente de IA que explica cada plato, responde dudas sobre alérgenos
              e ingredientes, y recomienda según los gustos de cada comensal — 24/7, sin apps ni descargas.
            </p>

            {/* Benefit bullets */}
            <ul className="space-y-3 mb-9">
              {[
                { icon: '📄', text: 'Importa tu carta desde PDF, foto o imagen en segundos' },
                { icon: '🌍', text: 'Chat en español, inglés y portugués automáticamente' },
                { icon: '📲', text: 'QR listo para imprimir en mesas, Instagram y Google Maps' },
                { icon: '📊', text: 'Descubre qué preguntan tus clientes cada semana' },
              ].map(b => (
                <li key={b.text} className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-sm">{b.icon}</span>
                  <span className="text-[#4A423C] text-sm leading-snug pt-0.5">{b.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={session?.user ? '/dashboard' : '/auth/register'}
                className="rounded-xl bg-accent hover:bg-accent-lite active:scale-95 transition-all px-7 py-3 text-base font-semibold text-white text-center"
                style={{ boxShadow: '0 8px 24px rgba(199,107,67,0.3)' }}>
                {session?.user ? 'Ir a mi panel →' : 'Empezar gratis — 14 días →'}
              </Link>
              <Link
                href="/chat"
                className="rounded-xl bg-black/[0.035] hover:bg-black/[0.06] border border-black/10 transition px-7 py-3 text-base font-medium text-[#5A524A] text-center">
                Ver demo →
              </Link>
            </div>
            <p className="text-xs text-[#9A9087] mt-3">Sin tarjeta · Sin contrato · Cancela cuando quieras</p>
          </div>

          {/* ── Right: phone mockup ── */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 translate-y-4 scale-95 rounded-[48px] bg-accent/20 blur-2xl" />

              {/* Phone frame */}
              <div className="relative w-[300px] h-[590px] rounded-[44px] bg-[#1A1614] shadow-2xl border-4 border-[#2A2220] overflow-hidden">
                {/* Status bar */}
                <div className="flex justify-between items-center px-6 pt-3 pb-1 bg-[#FAF6EF]">
                  <span className="text-[10px] font-semibold text-[#2B2421]">9:41</span>
                  <div className="w-24 h-5 rounded-full bg-[#1A1614] mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                  <div className="flex gap-1 items-center">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="#2B2421"><rect x="0" y="3" width="2" height="7" rx="0.5"/><rect x="3" y="2" width="2" height="8" rx="0.5"/><rect x="6" y="0.5" width="2" height="9.5" rx="0.5"/><rect x="9" y="0" width="2" height="10" rx="0.5" opacity="0.3"/></svg>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#2B2421" strokeWidth="1.3"><path d="M1 4.5C2.8 2.1 5.3 1 7 1s4.2 1.1 6 3.5"/><path d="M3.5 6.5C4.7 5.2 5.9 4.5 7 4.5s2.3.7 3.5 2"/><circle cx="7" cy="9" r="1" fill="#2B2421" stroke="none"/></svg>
                    <svg width="20" height="10" viewBox="0 0 20 10" fill="#2B2421"><rect x="0" y="2" width="17" height="7" rx="1.5" fillOpacity="0.25"/><rect x="1" y="3" width="10" height="5" rx="1" /><rect x="18" y="3.5" width="2" height="4" rx="1" fillOpacity="0.4"/></svg>
                  </div>
                </div>

                {/* App screen: chat */}
                <div className="h-full bg-[#FAF6EF] flex flex-col text-[#2B2421]" style={{ fontFamily: 'system-ui' }}>
                  {/* Chat header */}
                  <div className="px-3 py-2 border-b border-[#ECE3D7] bg-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C76B43] flex items-center justify-center text-white font-bold text-xs">m.</div>
                    <div>
                      <div className="text-[11px] font-bold leading-none">Asistente · Bocas del Mar</div>
                      <div className="text-[9px] text-[#5BBF7B] flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5BBF7B] inline-block" />En línea
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 px-3 py-3 space-y-2.5 overflow-hidden">
                    {/* Menu preview strip */}
                    <div className="bg-white rounded-xl border border-[#ECE3D7] p-2.5 mb-1">
                      <div className="text-[9px] font-bold text-[#C76B43] tracking-wider mb-1.5">ENTRADAS</div>
                      {[
                        { e: '🥟', n: 'Empanadas de Pino', p: '$3.500' },
                        { e: '🐟', n: 'Ceviche Mixto', p: '$12.900' },
                      ].map(d => (
                        <div key={d.n} className="flex items-center gap-1.5 py-1">
                          <span className="text-sm">{d.e}</span>
                          <span className="text-[10px] font-medium flex-1">{d.n}</span>
                          <span className="text-[10px] font-bold">{d.p}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chat bubbles */}
                    {[
                      { text: '¿Algo sin gluten para compartir? 🙌', me: true },
                      { text: '¡Claro! El Ceviche Mixto es sin gluten y perfecto para compartir. ¿Te gusta el picante? 🌶️', me: false },
                      { text: 'Sí, me encanta', me: true },
                      { text: 'Entonces pídelo con ají extra — y de fondo te recomiendo el Lomo a lo Pobre ⭐', me: false },
                    ].map((b, i) => (
                      <div key={i} className={`flex ${b.me ? 'justify-end' : 'justify-start'}`}>
                        {!b.me && <div className="w-5 h-5 rounded-md bg-[#C76B43] flex items-center justify-center text-white text-[8px] font-bold mr-1.5 mt-0.5 shrink-0">m.</div>}
                        <div className="max-w-[75%] text-[11px] leading-[1.4] px-2.5 py-2 rounded-2xl"
                          style={{
                            background: b.me ? '#C76B43' : 'white',
                            color: b.me ? 'white' : '#2B2421',
                            borderRadius: b.me ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            border: b.me ? 'none' : '1px solid #ECE3D7',
                          }}>
                          {b.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="px-3 pb-4 pt-2 border-t border-[#ECE3D7] bg-white flex gap-2 items-center">
                    <div className="flex-1 h-8 rounded-full bg-[#FAF6EF] border border-[#ECE3D7] flex items-center px-3">
                      <span className="text-[10px] text-[#B5ABA1]">Escribe tu pregunta…</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#C76B43] shrink-0" />
                  </div>
                </div>
              </div>

              {/* Floating social proof badge */}
              <div className="absolute -left-16 top-24 bg-white rounded-2xl shadow-lg border border-black/[0.06] px-3 py-2.5 text-xs">
                <div className="font-bold text-[#2B2421] text-sm">+240</div>
                <div className="text-[#8C8178] text-[10px]">preguntas respondidas</div>
              </div>

              {/* Floating language badge */}
              <div className="absolute -right-12 bottom-28 bg-white rounded-2xl shadow-lg border border-black/[0.06] px-3 py-2 text-[10px] flex items-center gap-1.5">
                <span>🌍</span>
                <span className="text-[#2B2421] font-medium">ES · EN · PT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#FAF6EF] to-transparent" />
      </section>

      {/* Cómo funciona */}
      <section className="bg-[#F2EAE0] py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Activo en minutos</h2>
            <p className="text-[#6B6259]">Tres pasos y tu restaurante tiene su asistente de carta.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="bg-white shadow-sm rounded-2xl border border-black/[0.07] p-6 relative">
                <span className="absolute top-4 right-4 text-xs font-mono text-[#C0B6AA]">{step.step}</span>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="text-[#2B2421] font-semibold mb-2">{step.title}</h3>
                <p className="text-[#6B6259] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase — main feature demo */}
      <section className="py-20 px-5 bg-[#F2EAE0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold text-accent tracking-widest uppercase mb-3">El producto</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Todo lo que tu carta puede hacer</h2>
            <p className="text-[#6B6259] max-w-lg mx-auto text-base">Selecciona una funcionalidad o deja que avance solo — cada una está activa en tu restaurante desde el primer día.</p>
          </div>
          <AppShowcase />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Preguntas frecuentes</h2>
            <p className="text-[#6B6259] text-sm">¿Algo que no quedó claro? Escríbenos a <a href="mailto:hola@menubot.cl" className="text-accent hover:underline">hola@menubot.cl</a></p>
          </div>
          <div className="divide-y divide-black/[0.07]">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left flex justify-between items-center gap-4 py-4 text-sm font-semibold text-[#2B2421] hover:text-accent transition">
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

      {/* Pricing */}
      <section id="planes" className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold mb-3">Planes</h2>
            <p className="text-[#6B6259]">Precios en pesos chilenos. Los primeros 14 días son gratis en cualquier plan.</p>
          </div>
          <p className="text-center text-xs text-emerald-400 mb-10">✓ 14 días de prueba gratuita · Sin tarjeta · Cancela cuando quieras</p>
          <PlanGrid />
          <p className="text-center text-xs text-[#9A9087] mt-6">
            Ver el detalle completo en la{' '}
            <Link href="/pricing" className="text-accent hover:text-accent-lite transition underline underline-offset-2">página de planes</Link>.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#F2EAE0] py-20 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <Wordmark size="xl" className="text-[#2B2421] block mb-4" />
          <h2 className="text-3xl font-bold mb-3">¿Listo para empezar?</h2>
          <p className="text-[#6B6259] mb-8">
            Regístrate gratis, sube tu carta y activa tu asistente de IA en menos de 5 minutos.
          </p>
          <Link href="/auth/register"
            className="inline-block rounded-xl bg-accent hover:bg-accent-lite active:scale-95 transition-all px-9 py-3.5 text-base font-semibold text-white"
            style={{ boxShadow: '0 8px 24px rgba(199,107,67,0.3)' }}>
            Crear cuenta gratis →
          </Link>
          <p className="text-xs text-[#9A9087] mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-[#6B6259] hover:text-[#2B2421] transition underline underline-offset-2">Iniciar sesión</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.07] py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9A9087]">
          <span className="flex items-center gap-2">
            © {new Date().getFullYear()} Novodev SPA. Todos los derechos reservados.
            <span className="text-[#C0B6AA] font-mono" title="Versión desplegada">build {process.env.NEXT_PUBLIC_APP_VERSION}</span>
          </span>
          <div className="flex gap-5">
            <button onClick={() => openModal()} className="hover:text-[#6B6259] transition">Contacto</button>
            <Link href="/chat" className="hover:text-[#6B6259] transition">Demo</Link>
            <Link href="/auth/login" className="hover:text-[#6B6259] transition">Iniciar sesión</Link>
          </div>
        </div>
      </footer>

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialPlan={selectedPlan} />
    </div>
  );
}
