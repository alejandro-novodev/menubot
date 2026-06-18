'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface TopQuestion { topic: string; count: number; }
interface RecentSession { id: number; summary: string | null; messageCount: number; createdAt: string; pending: boolean; }
interface Insights {
  businessName: string;
  totalSessions: number;
  totalMessages: number;
  topQuestions: TopQuestion[];
  recent: RecentSession[];
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="app-surface border app-line rounded-2xl p-4 flex-1 min-w-[120px]">
      <div className="text-2xl font-bold app-ink">{value}</div>
      <div className="text-xs app-mut mt-0.5">{label}</div>
    </div>
  );
}

function InsightsView() {
  const params = useSearchParams();
  const bizId = parseInt(params.get('biz') ?? '0');

  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  // Button handler (event-driven setState is fine here).
  const load = useCallback(async () => {
    if (!bizId) return;
    setLoading(true);
    const res = await fetch(`/api/businesses/${bizId}/insights`);
    if (res.ok) setData(await res.json() as Insights);
    setLoading(false);
  }, [bizId]);

  // Initial load — inlined so setState runs only after the await (not in the
  // effect's synchronous body), keeping react-hooks/set-state-in-effect happy.
  useEffect(() => {
    if (!bizId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/businesses/${bizId}/insights`);
      if (cancelled) return;
      if (res.ok) setData(await res.json() as Insights);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [bizId]);

  const maxCount = data?.topQuestions[0]?.count ?? 1;

  return (
    <div className="min-h-screen app-bg app-ink flex flex-col">
      <header className="border-b app-line px-5 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="app-mut app-ink-hover transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold app-ink text-sm truncate">Lo que preguntan tus clientes</h1>
          <p className="text-xs app-mut">{data?.businessName ?? 'Conversaciones del asistente'}</p>
        </div>
        <button onClick={load} disabled={loading}
          className="text-xs app-mut app-ink-hover app-soft app-soft-hover border app-line px-3 py-1.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-2xl mx-auto">
          {loading && !data ? (
            <p className="app-mut text-sm">Analizando conversaciones…</p>
          ) : !data || data.totalSessions === 0 ? (
            <div className="app-surface border app-line rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">💬</div>
              <h2 className="text-lg font-semibold mb-2">Aún no hay conversaciones</h2>
              <p className="app-mut text-sm">Cuando tus clientes usen el asistente desde el QR, aquí verás qué preguntan más y un resumen de cada conversación.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Volume */}
              <div className="flex gap-3 flex-wrap">
                <Stat label="Conversaciones" value={data.totalSessions} />
                <Stat label="Mensajes" value={data.totalMessages} />
              </div>

              {/* Preguntas más frecuentes */}
              <section>
                <h2 className="text-sm font-semibold app-ink mb-3">Preguntas más frecuentes</h2>
                {data.topQuestions.length === 0 ? (
                  <p className="app-mut text-sm">Todavía estamos resumiendo las conversaciones. Vuelve a actualizar en un momento.</p>
                ) : (
                  <div className="space-y-2">
                    {data.topQuestions.map((q) => (
                      <div key={q.topic} className="flex items-center gap-3">
                        <div className="flex-1 app-soft border app-line rounded-lg overflow-hidden relative h-8">
                          <div className="absolute inset-y-0 left-0 bg-accent/15" style={{ width: `${Math.max(8, (q.count / maxCount) * 100)}%` }} />
                          <span className="absolute inset-0 flex items-center px-3 text-xs app-ink capitalize">{q.topic}</span>
                        </div>
                        <span className="text-xs app-mut w-10 text-right tabular-nums">{q.count}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Resúmenes recientes */}
              <section>
                <h2 className="text-sm font-semibold app-ink mb-3">Conversaciones recientes</h2>
                <div className="space-y-2">
                  {data.recent.map((s) => (
                    <div key={s.id} className="app-surface border app-line rounded-xl p-3">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-xs app-mut2">{fmtDate(s.createdAt)}</span>
                        <span className="text-xs app-mut2">{s.messageCount} mensajes</span>
                      </div>
                      <p className="text-sm app-ink">
                        {s.pending ? <span className="app-mut2 italic">Resumiendo…</span> : s.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen app-bg" />}>
      <InsightsView />
    </Suspense>
  );
}
