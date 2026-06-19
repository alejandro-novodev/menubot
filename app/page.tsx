'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { DishWordCloud } from '@/components/landing/DishWordCloud';
import { AppShowcase } from '@/components/landing/AppShowcase';
import { ContactModal } from '@/components/landing/ContactModal';
import { PlanGrid } from '@/components/landing/PlanGrid';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';

const HOW_IT_WORKS = [
  { step: '01', icon: '🚀', title: 'Crea tu cuenta', desc: '14 días gratis, sin tarjeta. Regístrate en menos de un minuto y configura el perfil de tu negocio.' },
  { step: '02', icon: '📄', title: 'Sube tu carta', desc: 'PDF, foto o imagen. La IA extrae todos los platos, precios e ingredientes automáticamente.' },
  { step: '03', icon: '💬', title: 'Comparte con tus clientes', desc: 'Un QR o link único. Tus clientes chatean con el asistente directamente, sin apps ni descargas.' },
];

const FEATURES = [
  { icon: '🤖', title: 'IA que entiende tu carta', desc: 'Lee platos étnicos, nombres difíciles y preparaciones complejas. Responde en español chileno.' },
  { icon: '📄', title: 'Importa desde PDF o foto', desc: 'Sube el menú impreso, una foto del pizarrón o un PDF digital. La IA lo procesa en segundos.' },
  { icon: '📊', title: 'Score de completeness', desc: 'Sabe exactamente qué información falta en tu carta y te guía para completarla paso a paso.' },
  { icon: '📲', title: 'QR listo para imprimir', desc: 'Descarga el QR de tu carta en alta resolución. Ponlo en las mesas, en Instagram o en Google Maps.' },
  { icon: '🔗', title: 'Link corto compartible', desc: 'Una URL corta para compartir en WhatsApp, Instagram bio o Google Business Profile.' },
  { icon: '🍺', title: 'Más que restaurantes', desc: 'Bares, hoteles, spas, retail — cualquier negocio con una carta o catálogo puede usar menubot.' },
];

export default function Home() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  function openModal(plan = '') { setSelectedPlan(plan); setModalOpen(true); }

  return (
    <div className="bg-[#1A1613] text-white min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#1A1613]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <LogoIcon size={28} />
            <Wordmark size="md" className="text-white" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/chat" className="text-sm text-gray-400 hover:text-white transition hidden sm:block">Ver demo</Link>
            {session?.user ? (
              <Link href="/dashboard" className="text-sm font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
                Mi panel →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition">Iniciar sesión</Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
                  Registrarse gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        <DishWordCloud />
        <div className="relative z-10 text-center px-5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-white/10 bg-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-300 font-medium">14 días gratis · Sin tarjeta de crédito</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-5">
            Que ningún cliente se pierda{' '}
            <span className="text-accent">lo mejor de tu carta</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-9">
            Tu asistente de carta con IA explica cada plato, responde dudas sobre ingredientes y
            alérgenos, y recomienda qué pedir según los gustos de cada cliente — para que siempre
            pidan con confianza y vuelvan por más.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={session?.user ? '/dashboard' : '/auth/register'}
              className="rounded-xl bg-accent hover:bg-accent-lite active:scale-95 transition-all px-7 py-3 text-base font-semibold text-white shadow-lg w-full sm:w-auto"
              style={{ boxShadow: '0 8px 24px rgba(199,107,67,0.3)' }}>
              {session?.user ? 'Ir a mi panel →' : 'Empezar gratis — 14 días →'}
            </Link>
            <Link href="/chat"
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition px-7 py-3 text-base font-medium text-gray-300 w-full sm:w-auto text-center">
              Ver demo →
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-4">Sin tarjeta · Sin contrato · Cancela cuando quieras</p>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#1A1613] to-transparent" />
      </section>

      {/* Cómo funciona */}
      <section className="bg-[#241F1B] py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Activo en minutos</h2>
            <p className="text-gray-400">Tres pasos y tu restaurante tiene su asistente de carta.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="bg-[#1A1613]/60 rounded-2xl border border-white/5 p-6 relative">
                <span className="absolute top-4 right-4 text-xs font-mono text-gray-700">{step.step}</span>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Conoce menubot por dentro</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Una carta que conversa, recomienda, divide la cuenta y te cuenta qué quieren tus clientes.</p>
          </div>
          <AppShowcase />
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#241F1B] py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Todo lo que incluye</h2>
            <p className="text-gray-400">Desde la importación del menú hasta el QR listo para imprimir.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-[#1A1613]/50 border border-white/5 rounded-2xl p-5">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
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
            <p className="text-gray-400">Precios en pesos chilenos. Los primeros 14 días son gratis en cualquier plan.</p>
          </div>
          <p className="text-center text-xs text-emerald-400 mb-10">✓ 14 días de prueba gratuita · Sin tarjeta · Cancela cuando quieras</p>
          <PlanGrid />
          <p className="text-center text-xs text-gray-600 mt-6">
            Ver el detalle completo en la{' '}
            <Link href="/pricing" className="text-accent hover:text-accent-lite transition underline underline-offset-2">página de planes</Link>.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#241F1B] py-20 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <Wordmark size="xl" className="text-white block mb-4" />
          <h2 className="text-3xl font-bold mb-3">¿Listo para empezar?</h2>
          <p className="text-gray-400 mb-8">
            Regístrate gratis, sube tu carta y activa tu asistente de IA en menos de 5 minutos.
          </p>
          <Link href="/auth/register"
            className="inline-block rounded-xl bg-accent hover:bg-accent-lite active:scale-95 transition-all px-9 py-3.5 text-base font-semibold text-white"
            style={{ boxShadow: '0 8px 24px rgba(199,107,67,0.3)' }}>
            Crear cuenta gratis →
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition underline underline-offset-2">Iniciar sesión</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-2">
            © {new Date().getFullYear()} Novodev SPA. Todos los derechos reservados.
            <span className="text-gray-700 font-mono" title="Versión desplegada">build {process.env.NEXT_PUBLIC_APP_VERSION}</span>
          </span>
          <div className="flex gap-5">
            <button onClick={() => openModal()} className="hover:text-gray-400 transition">Contacto</button>
            <Link href="/chat" className="hover:text-gray-400 transition">Demo</Link>
            <Link href="/auth/login" className="hover:text-gray-400 transition">Iniciar sesión</Link>
          </div>
        </div>
      </footer>

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialPlan={selectedPlan} />
    </div>
  );
}
