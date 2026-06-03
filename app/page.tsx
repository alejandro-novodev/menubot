'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DishWordCloud } from '@/components/landing/DishWordCloud';
import { PricingCard } from '@/components/landing/PricingCard';
import { ChatPreview } from '@/components/landing/ChatPreview';
import { ContactModal } from '@/components/landing/ContactModal';

const PRICING = [
  {
    name: 'Starter',
    price: '$9.990',
    description: 'Para restaurantes que están comenzando.',
    features: [
      { text: '1 restaurante', included: true },
      { text: '500 chats / mes', included: true },
      { text: 'Asistente en español', included: true },
      { text: 'Analytics básico', included: false },
      { text: 'Marca blanca', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$24.990',
    description: 'Para restaurantes que quieren crecer.',
    featured: true,
    features: [
      { text: '1 restaurante', included: true },
      { text: 'Chats ilimitados', included: true },
      { text: 'Asistente en español', included: true },
      { text: 'Analytics básico', included: true },
      { text: 'Marca blanca', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
  },
  {
    name: 'Multi',
    price: '$59.990',
    description: 'Para cadenas y grupos gastronómicos.',
    features: [
      { text: 'Hasta 5 locales', included: true },
      { text: 'Chats ilimitados', included: true },
      { text: 'Asistente en español', included: true },
      { text: 'Analytics avanzado', included: true },
      { text: 'Marca blanca', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
  },
];

const HOW_IT_WORKS = [
  {
    icon: '📄',
    title: 'Sube tu menú',
    desc: 'PDF, foto, Excel o texto libre. La IA analiza el formato que ya tienes y extrae cada plato automáticamente.',
  },
  {
    icon: '🤖',
    title: 'La IA lo procesa',
    desc: 'Un agente te hace preguntas para completar descripciones, precios, ingredientes y categorías de cada plato.',
  },
  {
    icon: '💬',
    title: 'Comparte con tus clientes',
    desc: 'Un link único que tus clientes abren para chatear con el asistente de tu carta. Sin apps, sin descargas.',
  },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  function openModal(plan = '') {
    setSelectedPlan(plan);
    setModalOpen(true);
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <span>🍜</span>
            <span>Menu<span className="text-purple-400">Bot</span></span>
          </Link>
          <button
            onClick={() => openModal()}
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition"
          >
            Solicitar acceso →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        <DishWordCloud />
        <div className="relative z-10 text-center px-5 max-w-2xl mx-auto">
          <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-4">
            Powered by Claude AI
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-5">
            La carta de tu restaurante,{' '}
            <span className="text-purple-400">explicada por IA</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-9">
            MenuBot entiende platos étnicos y poco conocidos. Tus clientes preguntan en español,
            la IA responde con detalle, ingredientes y recomendaciones personalizadas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openModal()}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all px-7 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/30 w-full sm:w-auto"
            >
              Solicitar acceso
            </button>
            <Link
              href="/chat"
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition px-7 py-3 text-base font-medium text-gray-300 w-full sm:w-auto text-center"
            >
              Ver demo →
            </Link>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-950 to-transparent" />
      </section>

      {/* How it works */}
      <section className="bg-gray-900 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Cómo funciona</h2>
            <p className="text-gray-400">En tres pasos, tu restaurante tiene su asistente de carta listo.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="bg-gray-950/60 rounded-2xl border border-white/5 p-6">
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Míralo en acción</h2>
            <p className="text-gray-400">
              Así responde el asistente en{' '}
              <span className="text-white font-medium">Izakaya Nami</span>, nuestro restaurante de prueba.
            </p>
          </div>
          <ChatPreview />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-900 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Planes</h2>
            <p className="text-gray-400">Precios en pesos chilenos, sin contratos largos.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan) => (
              <PricingCard
                key={plan.name}
                {...plan}
                onContact={(p) => openModal(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">¿Listo para empezar?</h2>
          <p className="text-gray-400 mb-8">
            Cuéntanos sobre tu restaurante y configuramos tu asistente de carta en menos de 24 horas.
          </p>
          <button
            onClick={() => openModal()}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all px-8 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/30"
          >
            Solicitar acceso →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Novodev SPA. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer transition">Términos</span>
            <span className="hover:text-gray-400 cursor-pointer transition">Privacidad</span>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={selectedPlan}
      />
    </div>
  );
}
