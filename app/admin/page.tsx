'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';

interface Stats {
  businesses: { active: number; pending: number; suspended: number; total: number };
  mrr: number;
  recentBusinesses: BusinessRow[];
  waitlist: WaitlistRow[];
  users: UserRow[];
  pendingUsers: number;
  inviteOnly: boolean;
}

interface UserRow {
  id: number;
  name: string | null;
  email: string;
  role: string;
  approved: boolean;
  created_at: string;
}

interface BusinessRow {
  id: number;
  name: string;
  slug: string;
  status: string;
  menu_completeness: number;
  created_at: string;
  email: string;
  plan: string | null;
  trial_ends: string | null;
}

interface WaitlistRow {
  id: number;
  name: string;
  restaurant_name: string;
  email: string;
  plan: string | null;
  created_at: string;
}

const PLAN_LABELS: Record<string, string> = {
  trial: '🔓 Trial', starter: '⭐ Starter', pro: '🚀 Pro', multi: '🏢 Multi',
};
const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-900/40 text-emerald-400',
  pending: 'bg-yellow-900/40 text-yellow-400',
  suspended: 'bg-red-900/40 text-red-400',
};

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#241F1B] border border-white/5 rounded-2xl p-5">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);
  const [actioningUser, setActioningUser] = useState<number | null>(null);

  async function load() {
    const res = await fetch('/api/admin/stats');
    if (res.ok) setStats(await res.json() as Stats);
    setLoading(false);
  }

  // Inlined so setState runs only after the await (keeps
  // react-hooks/set-state-in-effect happy); `load` is reused by the actions.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/admin/stats');
      if (cancelled) return;
      if (res.ok) setStats(await res.json() as Stats);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function doAction(bizId: number, action: string, plan?: string) {
    setActioning(bizId);
    await fetch(`/api/admin/businesses/${bizId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, plan }),
    });
    await load();
    setActioning(null);
  }

  async function doUserAction(userId: number, action: 'approve' | 'revoke') {
    setActioningUser(userId);
    await fetch(`/api/admin/users/${userId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    await load();
    setActioningUser(null);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1A1613] flex items-center justify-center">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1613] text-white">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          <span className="flex items-center gap-2"><LogoIcon size={26} /><Wordmark size="md" /></span>
          <span className="ml-2 text-xs text-gray-500 font-normal">Admin</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition">← Dashboard</Link>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        {/* Access mode banner */}
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3 ${stats?.inviteOnly ? 'bg-accent/10 border border-accent/25 text-accent' : 'bg-emerald-900/30 border border-emerald-700/30 text-emerald-300'}`}>
          <span>
            {stats?.inviteOnly
              ? '🔒 Acceso por invitación — las cuentas nuevas necesitan tu aprobación para iniciar sesión.'
              : '🌐 Acceso público — cualquiera puede registrarse e iniciar sesión.'}
          </span>
          {(stats?.pendingUsers ?? 0) > 0 && (
            <span className="shrink-0 text-xs font-semibold bg-accent/20 px-2.5 py-1 rounded-full">{stats?.pendingUsers} pendiente{stats?.pendingUsers !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* KPIs */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Métricas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard label="Negocios activos" value={stats?.businesses.active ?? 0} />
            <KpiCard label="Pendientes" value={stats?.businesses.pending ?? 0} />
            <KpiCard label="Suspendidos" value={stats?.businesses.suspended ?? 0} />
            <KpiCard
              label="MRR estimado"
              value={`$${(stats?.mrr ?? 0).toLocaleString('es-CL')}`}
              sub="suscripciones activas (no trial)"
            />
          </div>
        </section>

        {/* Users / access control */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Usuarios ({stats?.users.length ?? 0})
          </h2>
          <div className="space-y-2">
            {(stats?.users ?? []).map(u => (
              <div key={u.id} className="bg-[#241F1B] border border-white/5 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">{u.name ?? u.email}</span>
                    {u.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">admin</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.approved ? 'bg-emerald-900/40 text-emerald-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                      {u.approved ? '● habilitado' : '○ pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {u.email} · registrado {new Date(u.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!u.approved && (
                    <button
                      onClick={() => doUserAction(u.id, 'approve')}
                      disabled={actioningUser === u.id}
                      className="text-xs bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      Habilitar
                    </button>
                  )}
                  {u.approved && u.role !== 'admin' && (
                    <button
                      onClick={() => doUserAction(u.id, 'revoke')}
                      disabled={actioningUser === u.id}
                      className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Businesses */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Negocios ({stats?.recentBusinesses.length ?? 0})
          </h2>
          <div className="space-y-2">
            {(stats?.recentBusinesses ?? []).map(biz => (
              <div key={biz.id} className="bg-[#241F1B] border border-white/5 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">{biz.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[biz.status] ?? 'bg-[#2E2823] text-gray-500'}`}>
                      {biz.status}
                    </span>
                    <span className="text-xs text-gray-600">{PLAN_LABELS[biz.plan ?? ''] ?? biz.plan ?? '—'}</span>
                    {biz.trial_ends && (
                      <span className="text-xs text-yellow-600">
                        trial hasta {new Date(biz.trial_ends).toLocaleDateString('es-CL')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {biz.email} · /chat/{biz.slug} · {biz.menu_completeness}% completo
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {biz.status !== 'active' && (
                    <button
                      onClick={() => doAction(biz.id, 'activate')}
                      disabled={actioning === biz.id}
                      className="text-xs bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      Activar
                    </button>
                  )}
                  {biz.status === 'active' && (
                    <button
                      onClick={() => doAction(biz.id, 'suspend')}
                      disabled={actioning === biz.id}
                      className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      Suspender
                    </button>
                  )}
                  <select
                    onChange={e => { if (e.target.value) doAction(biz.id, 'change_plan', e.target.value); e.target.value = ''; }}
                    className="text-xs bg-[#2E2823] border border-white/10 text-gray-400 px-2 py-1.5 rounded-lg outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Plan</option>
                    {['trial', 'starter', 'pro', 'multi'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <Link
                    href={`/chat/${biz.slug}`} target="_blank"
                    className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5 transition"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Waitlist */}
        {(stats?.waitlist.length ?? 0) > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Waitlist ({stats?.waitlist.length})
            </h2>
            <div className="space-y-2">
              {(stats?.waitlist ?? []).map(w => (
                <div key={w.id} className="bg-[#241F1B] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{w.name} — {w.restaurant_name}</p>
                    <p className="text-xs text-gray-500">{w.email} · Plan: {w.plan ?? '—'}</p>
                  </div>
                  <a
                    href={`mailto:${w.email}`}
                    className="text-xs text-accent hover:text-accent-lite px-3 py-1.5 bg-accent/15 rounded-lg transition"
                  >
                    Contactar →
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
