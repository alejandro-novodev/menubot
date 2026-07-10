'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';

interface KeyRow {
  businessId: number;
  businessName: string;
  slug: string;
  plan: string;
  workspaceId: string | null;
  workspaceName: string | null;
  apiKeyHint: string | null;
  status: string;
  provisionedAt: string | null;
  needsProvisioning: boolean;
}

interface KeysData {
  adminApiConfigured: boolean;
  keys: KeyRow[];
}

export default function AdminKeysPage() {
  const [data, setData] = useState<KeysData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [pasting, setPasting] = useState<number | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/keys');
    if (res.ok) setData(await res.json() as KeysData);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/admin/keys');
      if (cancelled) return;
      if (res.ok) setData(await res.json() as KeysData);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function doAction(businessId: number, action: string, apiKey?: string) {
    setBusy(businessId);
    setError(null);
    const res = await fetch(`/api/admin/keys/${businessId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, apiKey }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Error desconocido' })) as { error?: string };
      setError(body.error ?? 'La operación falló.');
    } else {
      setPasting(null);
      setKeyInput('');
    }
    await load();
    setBusy(null);
  }

  const pending = data?.keys.filter((k) => k.needsProvisioning) ?? [];
  const active = data?.keys.filter((k) => !k.needsProvisioning) ?? [];

  return (
    <div className="min-h-screen bg-[#1A1613] text-white">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">API Keys de Anthropic</h1>

        {data && !data.adminApiConfigured && (
          <div className="rounded-xl px-4 py-3 text-sm bg-yellow-900/30 border border-yellow-700/30 text-yellow-300">
            ⚠️ ANTHROPIC_ADMIN_KEY no está configurada — la creación de workspaces está deshabilitada. Puedes crear el workspace manualmente en la Console y pegar la key igual.
          </div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm bg-red-900/30 border border-red-700/30 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                Pendientes de aprovisionar ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-6">Todos los planes pagados tienen su key. 🎉</p>
              ) : (
                <div className="space-y-2">
                  {pending.map((k) => (
                    <div key={k.businessId} className="bg-[#241F1B] border border-white/5 rounded-xl px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-medium text-white text-sm">{k.businessName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent capitalize">{k.plan}</span>
                        {k.status === 'revoked' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400">key revocada</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Step 1: workspace */}
                        {!k.workspaceId ? (
                          <button
                            onClick={() => doAction(k.businessId, 'create_workspace')}
                            disabled={busy === k.businessId || !data?.adminApiConfigured}
                            className="bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                          >
                            ① Crear workspace
                          </button>
                        ) : (
                          <span className="text-gray-500">① Workspace <code className="text-gray-400">{k.workspaceId.slice(0, 18)}…</code> ✓</span>
                        )}

                        {/* Step 2: Console link */}
                        {k.workspaceId && (
                          <a
                            href={`https://console.anthropic.com/settings/workspaces/${k.workspaceId}/keys`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#2E2823] hover:bg-[#38312B] text-gray-300 px-3 py-1.5 rounded-lg transition"
                          >
                            ② Crear key en Console →
                          </a>
                        )}

                        {/* Step 3: paste key */}
                        {pasting === k.businessId ? (
                          <span className="flex items-center gap-2">
                            <input
                              type="password"
                              value={keyInput}
                              onChange={(e) => setKeyInput(e.target.value)}
                              placeholder="sk-ant-…"
                              autoFocus
                              className="bg-[#2E2823] border border-white/10 text-gray-200 px-3 py-1.5 rounded-lg outline-none focus:border-accent/60 w-64"
                            />
                            <button
                              onClick={() => doAction(k.businessId, 'save_key', keyInput)}
                              disabled={busy === k.businessId || !keyInput.trim()}
                              className="bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => { setPasting(null); setKeyInput(''); }}
                              className="text-gray-500 hover:text-gray-300 px-2 py-1.5 transition"
                            >
                              Cancelar
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => { setPasting(k.businessId); setKeyInput(''); }}
                            disabled={busy === k.businessId}
                            className="bg-[#2E2823] hover:bg-[#38312B] text-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                          >
                            ③ Pegar key
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                Keys activas ({active.length})
              </h2>
              {active.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-6">Ninguna key de cliente activa todavía.</p>
              ) : (
                <div className="space-y-2">
                  {active.map((k) => (
                    <div key={k.businessId} className="bg-[#241F1B] border border-white/5 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white text-sm">{k.businessName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent capitalize">{k.plan}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400">● activa</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <code>sk-ant-…{k.apiKeyHint}</code>
                          {k.workspaceId && <> · workspace <code>{k.workspaceId.slice(0, 18)}…</code></>}
                          {k.provisionedAt && <> · desde {new Date(k.provisionedAt).toLocaleDateString('es-CL')}</>}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 text-xs">
                        <button
                          onClick={() => { setPasting(k.businessId); setKeyInput(''); }}
                          className="bg-[#2E2823] hover:bg-[#38312B] text-gray-300 px-3 py-1.5 rounded-lg transition"
                        >
                          Rotar
                        </button>
                        <button
                          onClick={() => doAction(k.businessId, 'revoke')}
                          disabled={busy === k.businessId}
                          className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                        >
                          Revocar
                        </button>
                      </div>
                      {pasting === k.businessId && (
                        <div className="w-full flex items-center gap-2 text-xs">
                          <input
                            type="password"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="sk-ant-… (nueva key)"
                            autoFocus
                            className="bg-[#2E2823] border border-white/10 text-gray-200 px-3 py-1.5 rounded-lg outline-none focus:border-accent/60 flex-1 max-w-sm"
                          />
                          <button
                            onClick={() => doAction(k.businessId, 'save_key', keyInput)}
                            disabled={busy === k.businessId || !keyInput.trim()}
                            className="bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => { setPasting(null); setKeyInput(''); }}
                            className="text-gray-500 hover:text-gray-300 px-2 py-1.5 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
