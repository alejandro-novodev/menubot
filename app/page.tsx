'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DishWordCloud } from '@/components/landing/DishWordCloud';
import { ChatPreview } from '@/components/landing/ChatPreview';
import { ContactModal } from '@/components/landing/ContactModal';
import { Wordmark } from '@/components/brand/Wordmark';

const PRICING = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$9.990',
    description: 'Para restaurantes que están comenzando.',
    features: [
      { text: '1 restaurante', ok: true },
      { text: '500 chats / mes', ok: true },
      { text: 'Asistente en español', ok: true },
      { text: 'Extracción PDF e imágenes', ok: true },
      { text: 'QR y link compartible', ok: true },
      { text: 'Analytics', ok: false },
      { text: 'Marca blanca', ok: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$24.990',
    description: 'Para restaurantes que quieren crecer.',
    featured: true,
    features: [
      { text: '1 restaurante', ok: true },
      { text: 'Chats ilimitados', ok: true },
      { text: 'Asistente en español', ok: true },
      { text: 'Extracción PDF e imágenes', ok: true },
      { text: 'QR y link compartible', ok: true },
      { text: 'Analytics básico', ok: true },
      { text: 'Marca blanca', ok: false },
    ],
  },
  {
    id: 'multi',
    name: 'Multi',
    price: '$59.990',
    description: 'Para cadenas y grupos gastronómicos.',
    features: [
      { text: 'Hasta 5 locales', ok: true },
      { text: 'Chats ilimitados', ok: true },
      { text: 'Asistente en español', ok: true },
      { text: 'Extracción PDF e imágenes', ok: true },
      { text: 'QR y link compartible', ok: true },
      { text: 'Analytics avanzado', ok: true },
      { text: 'Marca blanca', ok: true },
    ],
  },
];

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  function openModal(plan = '') { setSelectedPlan(plan); setModalOpen(true); }

  return (
    <div className="bg-gray-950 text-white min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-gray-950/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <Wordmark size="md" className="text-white" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/chat" className="text-sm text-gray-400 hover:text-white transition hidden sm:block">Ver demo</Link>
            <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition">Iniciar sesión</Link>
            <Link href="/auth/register" className="text-sm font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
              Registrarse gratis
            </Link>
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
            <Link href="/auth/register"
              className="rounded-xl bg-accent hover:bg-accent-lite active:scale-95 transition-all px-7 py-3 text-base font-semibold text-white shadow-lg w-full sm:w-auto"
              style={{ boxShadow: '0 8px 24px rgba(199,107,67,0.3)' }}>
              Empezar gratis — 14 días →
            </Link>
            <Link href="/chat"
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition px-7 py-3 text-base font-medium text-gray-300 w-full sm:w-auto text-center">
              Ver demo →
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-4">Sin tarjeta · Sin contrato · Cancela cuando quieras</p>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-950 to-transparent" />
      </section>

      {/* Cómo funciona */}
      <section className="bg-gray-900 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Activo en minutos</h2>
            <p className="text-gray-400">Tres pasos y tu restaurante tiene su asistente de carta.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="bg-gray-950/60 rounded-2xl border border-white/5 p-6 relative">
                <span className="absolute top-4 right-4 text-xs font-mono text-gray-700">{step.step}</span>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Míralo en acción</h2>
            <p className="text-gray-400">Así responde el asistente en <span className="text-white font-medium">Izakaya Nami</span>, nuestro restaurante de prueba.</p>
          </div>
          <ChatPreview />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Todo lo que incluye</h2>
            <p className="text-gray-400">Desde la importación del menú hasta el QR listo para imprimir.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-gray-950/50 border border-white/5 rounded-2xl p-5">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold mb-3">Planes</h2>
            <p className="text-gray-400">Precios en pesos chilenos. Los primeros 14 días son gratis en cualquier plan.</p>
          </div>
          <p className="text-center text-xs text-emerald-400 mb-10">✓ 14 días de prueba gratuita · Sin tarjeta · Cancela cuando quieras</p>
          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {PRICING.map(plan => (
              <div key={plan.id} className={`relative flex flex-col rounded-2xl p-6 ${plan.featured ? 'border border-accent/40 bg-accent/5 shadow-lg' : 'bg-gray-900 border border-white/5'}`}
                style={plan.featured ? { boxShadow: '0 0 40px rgba(199,107,67,0.1)' } : {}}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">Más popular</span>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className={`text-lg font-semibold mb-1 ${plan.featured ? 'text-accent' : 'text-white'}`}>{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">/mes</span>
                </div>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 shrink-0 ${f.ok ? 'text-accent' : 'text-gray-700'}`}>{f.ok ? '✓' : '—'}</span>
                      <span className={f.ok ? 'text-gray-300' : 'text-gray-600'}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/auth/register?plan=${plan.id}`}
                  className={`block text-center rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    plan.featured ? 'bg-accent hover:bg-accent-lite text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/10'
                  }`}>
                  Empezar gratis →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">
            ¿Necesitas un plan personalizado?{' '}
            <button onClick={() => openModal()} className="text-accent hover:text-accent-lite transition underline underline-offset-2">
              Solicitar contacto
            </button>
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gray-900 py-20 px-5 text-center">
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
          <span>© {new Date().getFullYear()} Novodev SPA. Todos los derechos reservados.</span>
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
