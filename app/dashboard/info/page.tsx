'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HoursEditor } from '@/components/dashboard/HoursEditor';

interface Info {
  name: string;
  description: string | null;
  address: string | null;
  maps_url: string | null;
  phone: string | null;
  hours: string | null;
  hours_json: string | null;
  notes: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  tripadvisor: string | null;
  website: string | null;
}

function InfoEditor() {
  const params = useSearchParams();
  const bizId = parseInt(params.get('biz') ?? '0');

  const [form, setForm] = useState<Partial<Info>>({});
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Inlined so setState runs only after the await (not in the effect's
  // synchronous body), keeping react-hooks/set-state-in-effect happy.
  useEffect(() => {
    if (!bizId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/businesses/${bizId}/info`);
      if (cancelled) return;
      if (res.ok) {
        const d = await res.json() as Info & { slug: string };
        setForm(d);
        setSlug(d.slug);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [bizId]);

  function set(key: keyof Info, val: string) { setForm(f => ({ ...f, [key]: val })); setSaved(false); }

  async function save() {
    if (!form.name?.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/businesses/${bizId}/info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? 'Error al guardar.'); return; }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const field = "w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition";

  return (
    <div className="min-h-screen app-bg app-ink flex flex-col">
      <header className="border-b app-line px-5 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="app-mut app-ink-hover transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold app-ink text-sm truncate">Información del restaurante</h1>
          <p className="text-xs app-mut">Esto ayuda al asistente a responder sobre tu local.</p>
        </div>
        {slug && <Link href={`/chat/${slug}`} target="_blank" className="text-xs text-accent hover:text-accent-lite transition shrink-0">Ver carta →</Link>}
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-lg mx-auto">
          {loading ? (
            <p className="app-mut text-sm">Cargando…</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs app-mut mb-1">Nombre del restaurante *</label>
                <input value={form.name ?? ''} onChange={e => set('name', e.target.value)} className={field} />
              </div>
              <div>
                <label className="block text-xs app-mut mb-1">Descripción</label>
                <textarea rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} className={`${field} resize-none`}
                  placeholder="Cocina peruana de autor, ambiente familiar…" />
              </div>
              <div>
                <label className="block text-xs app-mut mb-1">Dirección</label>
                <input value={form.address ?? ''} onChange={e => set('address', e.target.value)} className={field}
                  placeholder="Av. Siempre Viva 123, Providencia, Santiago" />
              </div>
              <div>
                <label className="block text-xs app-mut mb-1">Enlace de Google Maps</label>
                <input type="url" value={form.maps_url ?? ''} onChange={e => set('maps_url', e.target.value)} className={field}
                  placeholder="https://maps.app.goo.gl/…" />
                <p className="text-xs app-mut2 mt-1">En Google Maps: Compartir → Copiar enlace.</p>
              </div>
              <div>
                <label className="block text-xs app-mut mb-1">Teléfono</label>
                <input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} className={field} placeholder="+56 9 1234 5678" />
              </div>
              <HoursEditor
                hours={form.hours ?? null}
                hoursJson={form.hours_json ?? null}
                onChange={(h, hj) => { setForm(f => ({ ...f, hours: h, hours_json: hj })); setSaved(false); }}
              />
              <div>
                <label className="block text-xs app-mut mb-1">Información adicional para el asistente</label>
                <textarea rows={3} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} className={`${field} resize-none`}
                  placeholder="Estacionamiento, terraza pet-friendly, opciones veganas, formas de pago…" />
              </div>

              <div className="pt-2 border-t app-line">
                <h2 className="text-sm font-semibold app-ink mt-3 mb-1">Redes sociales y reseñas</h2>
                <p className="text-xs app-mut mb-3">Se muestran como enlaces en tu carta y el asistente puede compartirlos.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs app-mut mb-1">Instagram</label>
                    <input value={form.instagram ?? ''} onChange={e => set('instagram', e.target.value)} className={field} placeholder="https://instagram.com/turestaurante" />
                  </div>
                  <div>
                    <label className="block text-xs app-mut mb-1">Facebook</label>
                    <input value={form.facebook ?? ''} onChange={e => set('facebook', e.target.value)} className={field} placeholder="https://facebook.com/turestaurante" />
                  </div>
                  <div>
                    <label className="block text-xs app-mut mb-1">TikTok</label>
                    <input value={form.tiktok ?? ''} onChange={e => set('tiktok', e.target.value)} className={field} placeholder="https://tiktok.com/@turestaurante" />
                  </div>
                  <div>
                    <label className="block text-xs app-mut mb-1">WhatsApp</label>
                    <input value={form.whatsapp ?? ''} onChange={e => set('whatsapp', e.target.value)} className={field} placeholder="https://wa.me/56912345678" />
                  </div>
                  <div>
                    <label className="block text-xs app-mut mb-1">TripAdvisor</label>
                    <input value={form.tripadvisor ?? ''} onChange={e => set('tripadvisor', e.target.value)} className={field} placeholder="https://tripadvisor.com/…" />
                  </div>
                  <div>
                    <label className="block text-xs app-mut mb-1">Sitio web</label>
                    <input value={form.website ?? ''} onChange={e => set('website', e.target.value)} className={field} placeholder="https://turestaurante.cl" />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={save} disabled={saving}
                  className="bg-accent hover:bg-accent-lite disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition">
                  {saving ? 'Guardando…' : 'Guardar información'}
                </button>
                {saved && <span className="text-xs text-emerald-500">✓ Guardado</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen app-bg" />}>
      <InfoEditor />
    </Suspense>
  );
}
