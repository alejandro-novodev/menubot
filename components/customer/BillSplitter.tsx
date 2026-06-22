'use client';

import { useMemo, useState } from 'react';
import { calcBill } from '@/lib/bill';
import { formatPrice } from '@/lib/menu';
import { t } from '@/lib/i18n';
import type { LangCode } from '@/lib/languages';
import type { MenuDish } from '@/components/customer/MenuScreen';

const TIP_PRESETS = [0, 10] as const;

function Stepper({ value, onDec, onInc, lang }: { value: number; onDec: () => void; onInc: () => void; lang: LangCode }) {
  const btn: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--mb-line)',
    background: 'var(--mb-surface)', color: 'var(--mb-ink)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, lineHeight: 1,
    fontFamily: 'var(--font-space-grotesk, system-ui)',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button style={{ ...btn, opacity: value <= 0 ? 0.4 : 1 }} onClick={onDec} aria-label={t(lang, 'removeOne')}>−</button>
      <span style={{ minWidth: 18, textAlign: 'center', fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 700, fontSize: 15, color: 'var(--mb-ink)' }}>{value}</span>
      <button style={btn} onClick={onInc} aria-label={t(lang, 'addOne')}>+</button>
    </div>
  );
}

export function BillSplitter({ dishes, onClose, lang = 'es' }: { dishes: MenuDish[]; onClose: () => void; lang?: LangCode }) {
  const priced = useMemo(() => dishes.filter((d) => d.price != null), [dishes]);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [search, setSearch] = useState('');
  const [tipPct, setTipPct] = useState<number>(10);
  const [people, setPeople] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return priced;
    return priced.filter((d) => d.name.toLowerCase().includes(q) || (d.category ?? '').toLowerCase().includes(q));
  }, [priced, search]);

  const bill = useMemo(() => {
    const items = priced
      .filter((d) => (qty[d.id] ?? 0) > 0)
      .map((d) => ({ name: d.name, price: d.price as number, qty: qty[d.id] }));
    return calcBill(items, tipPct, people);
  }, [priced, qty, tipPct, people]);

  const itemCount = bill.lines.reduce((n, l) => n + l.qty, 0);
  const set = (id: number, v: number) => setQty((m) => ({ ...m, [id]: Math.max(0, v) }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '92vh', background: 'var(--mb-bg)',
          borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--mb-line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🧮</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--mb-ink)' }}>{t(lang, 'billTitle')}</h2>
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12, color: 'var(--mb-mut)' }}>{t(lang, 'billSubtitle')}</p>
          </div>
          <button onClick={onClose} aria-label={t(lang, 'close')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mb-mut)', padding: 4, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px 8px' }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(lang, 'searchDish')}
            style={{ width: '100%', height: 40, borderRadius: 10, border: '1px solid var(--mb-line)', background: 'var(--mb-surface)', padding: '0 14px', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 14, color: 'var(--mb-ink)', outline: 'none' }}
          />
        </div>

        {/* Dish list */}
        <div className="mb-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
          {filtered.map((d) => {
            const q = qty[d.id] ?? 0;
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 10, background: q > 0 ? 'var(--accent-soft)' : 'transparent' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 600, fontSize: 14, color: 'var(--mb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 700, fontSize: 12.5, color: 'var(--mb-mut)' }}>{formatPrice(d.price as number)}</div>
                </div>
                <Stepper value={q} onDec={() => set(d.id, q - 1)} onInc={() => set(d.id, q + 1)} lang={lang} />
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--mb-mut)', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13 }}>{t(lang, 'noResults')}</p>
          )}
        </div>

        {/* Footer / totals */}
        <div style={{ borderTop: '1px solid var(--mb-line)', padding: '12px 16px 16px', background: 'var(--mb-surface)' }}>
          {/* Propina + personas */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12.5, color: 'var(--mb-mut)' }}>{t(lang, 'tip')}</span>
              {TIP_PRESETS.map((p) => (
                <button key={p} onClick={() => setTipPct(p)} className="mb-chip" data-active={tipPct === p}
                  style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: '5px 11px', cursor: 'pointer',
                    color: tipPct === p ? '#fff' : 'var(--mb-mut)', background: tipPct === p ? 'var(--accent)' : 'transparent', border: tipPct === p ? '1px solid var(--accent)' : '1px solid var(--mb-chip-line)' }}>
                  {p === 0 ? t(lang, 'tipNone') : `${p}%`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12.5, color: 'var(--mb-mut)' }}>{t(lang, 'people')}</span>
              <Stepper value={people} onDec={() => setPeople((n) => Math.max(1, n - 1))} onInc={() => setPeople((n) => n + 1)} lang={lang} />
            </div>
          </div>

          {/* Numbers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13, color: 'var(--mb-mut)' }}>
            <Row label={`${t(lang, 'subtotal')} (${itemCount} ${itemCount === 1 ? t(lang, 'itemOne') : t(lang, 'itemMany')})`} value={formatPrice(bill.subtotal)} />
            {bill.tip > 0 && <Row label={`${t(lang, 'tip')} ${bill.tipPct}%`} value={formatPrice(bill.tip)} />}
            <Row label={t(lang, 'total')} value={formatPrice(bill.total)} strong />
          </div>

          <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13, fontWeight: 600, color: 'var(--mb-ink)' }}>{t(lang, 'eachPays')}{people > 1 ? ` (÷${people})` : ''}</span>
            <span style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--accent)' }}>{formatPrice(bill.perPerson)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ color: strong ? 'var(--mb-ink)' : 'var(--mb-mut)', fontWeight: strong ? 700 : 400, fontSize: strong ? 15 : 13 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', color: 'var(--mb-ink)', fontWeight: strong ? 800 : 600, fontSize: strong ? 16 : 13.5 }}>{value}</span>
    </div>
  );
}
