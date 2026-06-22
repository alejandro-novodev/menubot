'use client';

import { useEffect, useRef, useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

const PLANS = ['Starter', 'Pro', 'Multi', 'Otro'];

export function ContactModal({ isOpen, onClose, initialPlan = '' }: ContactModalProps) {
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState(initialPlan);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPlan(initialPlan);
      setSuccess(false);
      setError('');
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialPlan]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, restaurantName, email, plan, message }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setSuccess(true);
      setName(''); setRestaurantName(''); setEmail(''); setPlan(''); setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8178] hover:text-[#2B2421] transition text-xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold text-[#2B2421] mb-1">Solicitar acceso</h2>
        <p className="text-sm text-[#6B6259] mb-5">Te contactamos para configurar tu restaurante.</p>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-[#2B2421] font-medium">¡Gracias! Te contactaremos pronto.</p>
            <p className="text-[#6B6259] text-sm mt-1">Revisa tu correo en los próximos días.</p>
            <button onClick={onClose} className="mt-5 text-sm text-accent hover:text-accent-lite transition">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-[#6B6259] mb-1">Nombre *</label>
              <input
                ref={firstInputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F5EFE6] border border-black/10 rounded-xl px-3 py-2.5 text-sm text-[#2B2421] placeholder-[#B3A99E] outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6B6259] mb-1">Nombre del restaurante *</label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full bg-[#F5EFE6] border border-black/10 rounded-xl px-3 py-2.5 text-sm text-[#2B2421] placeholder-[#B3A99E] outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
                placeholder="Nombre de tu local"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6B6259] mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5EFE6] border border-black/10 rounded-xl px-3 py-2.5 text-sm text-[#2B2421] placeholder-[#B3A99E] outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6B6259] mb-1">Plan de interés</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-[#F5EFE6] border border-black/10 rounded-xl px-3 py-2.5 text-sm text-[#2B2421] outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
              >
                <option value="">Sin preferencia</option>
                {PLANS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B6259] mb-1">Mensaje (opcional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full bg-[#F5EFE6] border border-black/10 rounded-xl px-3 py-2.5 text-sm text-[#2B2421] placeholder-[#B3A99E] outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition resize-none"
                placeholder="¿Algo más que quieras comentar?"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-lite disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl py-2.5 text-sm transition-all mt-1"
            >
              {loading ? 'Enviando...' : 'Solicitar acceso →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
