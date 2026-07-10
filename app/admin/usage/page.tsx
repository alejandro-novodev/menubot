'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';

interface BizUsage {
  businessId: number | null;
  businessName: string;
  plan: string | null;
  calls: number;
  conversations: number;
  inputTokens: number;
  outputTokens: number;
  costMicroUsd: number;
  customerCostMicroUsd: number;
  platformCostMicroUsd: number;
}

interface UsageData {
  month: string;
  totals: {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    costMicroUsd: number;
    platformCostMicroUsd: number;
    customerCostMicroUsd: number;
  };
  businesses: BizUsage[];
}

function usd(microUsd: number): string {
  return '$' + (microUsd / 1_000_000).toFixed(2);
}

function num(n: number): string {
  return n.toLocaleString('es-CL');
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#241F1B] border border-white/5 rounded-2xl p-5">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminUsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/usage?month=${m}`);
    if (res.ok) setData(await res.json() as UsageData);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/usage?month=${month}`);
      if (cancelled) return;
      if (res.ok) setData(await res.json() as UsageData);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [month]);

  return (
    <div className="min-h-screen bg-[#1A1613] text-white">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Uso y costos de IA</h1>
          <input
            type="month"
            value={month}
            max={currentMonth()}
            onChange={(e) => { setMonth(e.target.value); load(e.target.value); }}
            className="text-xs bg-[#2E2823] border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg outline-none [color-scheme:dark]"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : data ? (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiCard label="Costo total estimado" value={usd(data.totals.costMicroUsd)} sub="USD, mes seleccionado" />
              <KpiCard label="Costo key NovodevSPA" value={usd(data.totals.platformCostMicroUsd)} sub="free / trial / demo" />
              <KpiCard label="Costo keys de clientes" value={usd(data.totals.customerCostMicroUsd)} sub="planes pagados" />
              <KpiCard label="Llamadas a la API" value={num(data.totals.calls)} sub={`${num(data.totals.inputTokens + data.totals.outputTokens)} tokens`} />
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                Por negocio ({data.businesses.length})
              </h2>
              {data.businesses.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-6">Sin actividad de IA este mes.</p>
              ) : (
                <div className="overflow-x-auto bg-[#241F1B] border border-white/5 rounded-2xl">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 text-left border-b border-white/5">
                        <th className="px-4 py-3 font-medium">Negocio</th>
                        <th className="px-4 py-3 font-medium">Plan</th>
                        <th className="px-4 py-3 font-medium text-right">Conversaciones</th>
                        <th className="px-4 py-3 font-medium text-right">Llamadas</th>
                        <th className="px-4 py-3 font-medium text-right">Tokens in</th>
                        <th className="px-4 py-3 font-medium text-right">Tokens out</th>
                        <th className="px-4 py-3 font-medium text-right">Costo est.</th>
                        <th className="px-4 py-3 font-medium">Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.businesses.map((b, i) => (
                        <tr key={b.businessId ?? `platform-${i}`} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 text-white">{b.businessName}</td>
                          <td className="px-4 py-3 text-gray-400 capitalize">{b.plan ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-400 text-right">{num(b.conversations)}</td>
                          <td className="px-4 py-3 text-gray-400 text-right">{num(b.calls)}</td>
                          <td className="px-4 py-3 text-gray-400 text-right">{num(b.inputTokens)}</td>
                          <td className="px-4 py-3 text-gray-400 text-right">{num(b.outputTokens)}</td>
                          <td className="px-4 py-3 text-white text-right font-medium">{usd(b.costMicroUsd)}</td>
                          <td className="px-4 py-3">
                            {b.customerCostMicroUsd > 0 ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400">cliente</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#2E2823] text-gray-500">plataforma</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <p className="text-sm text-gray-600 text-center py-6">No se pudo cargar el uso.</p>
        )}
      </main>
    </div>
  );
}
