'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FeatureGate } from '@/components/dashboard/FeatureGate';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  shareConsent: boolean;
  ownerResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
}
interface ReviewsData {
  plan: string;
  reviewsEnabled: boolean;
  canRespond: boolean;
  count: number;
  average: number;
  reviews: Review[];
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span style={{ fontSize: size, color: '#E8A33D', letterSpacing: 1 }} aria-label={`${value} de 5`}>
      {'★'.repeat(value)}<span className="app-mut2">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

function ReviewCard({ review, bizId, canRespond, onSaved }: { review: Review; bizId: number; canRespond: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.ownerResponse ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/businesses/${bizId}/reviews/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: draft }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  return (
    <div className="app-surface border app-line rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <Stars value={review.rating} />
        <div className="flex items-center gap-2">
          {review.shareConsent && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">compartible</span>}
          <span className="text-xs app-mut2">{fmtDate(review.createdAt)}</span>
        </div>
      </div>
      {review.comment && <p className="text-sm app-ink leading-relaxed">{review.comment}</p>}

      {/* Owner response */}
      {review.ownerResponse && !editing ? (
        <div className="mt-3 border-l-2 border-accent/40 pl-3">
          <p className="text-xs font-semibold text-accent mb-0.5">Tu respuesta</p>
          <p className="text-sm app-mut">{review.ownerResponse}</p>
          {canRespond && <button onClick={() => { setDraft(review.ownerResponse ?? ''); setEditing(true); }} className="text-xs text-accent hover:text-accent-lite transition mt-1">Editar</button>}
        </div>
      ) : canRespond && (editing || !review.ownerResponse) ? (
        <div className="mt-3">
          {editing || review.ownerResponse === null ? (
            editing ? (
              <div className="space-y-2">
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="Escribe una respuesta…"
                  className="w-full app-surface2 border app-line rounded-lg px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition resize-none" />
                <div className="flex gap-2">
                  <button onClick={save} disabled={saving} className="text-xs bg-accent hover:bg-accent-lite text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar'}</button>
                  <button onClick={() => setEditing(false)} className="text-xs app-mut app-ink-hover px-3 py-1.5 rounded-lg transition">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="text-xs text-accent hover:text-accent-lite app-soft app-soft-hover border app-line px-3 py-1.5 rounded-lg transition">Responder</button>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const SAMPLE: Review[] = [
  { id: 's1', rating: 5, comment: 'Excelente atención y el ceviche estaba perfecto. Volveremos.', shareConsent: true, ownerResponse: null, respondedAt: null, createdAt: new Date(0).toISOString() },
  { id: 's2', rating: 4, comment: 'Muy rico todo, la espera fue un poco larga.', shareConsent: false, ownerResponse: null, respondedAt: null, createdAt: new Date(0).toISOString() },
];

function ReviewsView() {
  const params = useSearchParams();
  const bizId = parseInt(params.get('biz') ?? '0');
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!bizId) return;
    const res = await fetch(`/api/businesses/${bizId}/reviews`);
    if (res.ok) setData(await res.json() as ReviewsData);
    setLoading(false);
  }, [bizId]);

  useEffect(() => {
    if (!bizId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/businesses/${bizId}/reviews`);
      if (cancelled) return;
      if (res.ok) setData(await res.json() as ReviewsData);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [bizId]);

  return (
    <div className="min-h-screen app-bg app-ink flex flex-col">
      <header className="border-b app-line px-5 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="app-mut app-ink-hover transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold app-ink text-sm truncate">Reseñas de clientes</h1>
          <p className="text-xs app-mut">Opiniones después de la visita.</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <p className="app-mut text-sm">Cargando…</p>
          ) : !data?.reviewsEnabled ? (
            <FeatureGate enabled={false} requiredPlan="pro"
              title="Reseñas de clientes — disponible en el plan Pro"
              description="Recibe opiniones después de la visita y responde a tus clientes desde aquí.">
              <div className="space-y-3">
                {SAMPLE.map((r) => <ReviewCard key={r.id} review={r} bizId={bizId} canRespond={false} onSaved={() => {}} />)}
              </div>
            </FeatureGate>
          ) : data.count === 0 ? (
            <div className="app-surface border app-line rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h2 className="text-lg font-semibold mb-2">Aún no hay reseñas</h2>
              <p className="app-mut text-sm">Tus clientes pueden dejar una opinión desde la carta. Aquí verás sus comentarios y podrás responder.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="app-surface border app-line rounded-2xl p-5 flex items-center gap-5">
                <div>
                  <div className="text-3xl font-bold app-ink leading-none">{data.average.toFixed(1)}</div>
                  <div className="mt-1"><Stars value={Math.round(data.average)} size={13} /></div>
                </div>
                <div className="text-sm app-mut">{data.count} reseña{data.count !== 1 ? 's' : ''}</div>
              </div>
              <div className="space-y-3">
                {data.reviews.map((r) => <ReviewCard key={r.id} review={r} bizId={bizId} canRespond={data.canRespond} onSaved={load} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen app-bg" />}>
      <ReviewsView />
    </Suspense>
  );
}
