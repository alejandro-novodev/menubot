'use client';

import { useState } from 'react';
import { LANGUAGES, type LangCode } from '@/lib/languages';

/** Compact flag dropdown for the diner to switch language. */
export function LanguagePicker({ value, onChange }: { value: LangCode; onChange: (l: LangCode) => void }) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Idioma / Language"
        className="mb-social"
        style={{
          height: 34, padding: '0 10px', borderRadius: 999,
          border: '1px solid var(--mb-line)', background: 'var(--mb-surface)',
          color: 'var(--mb-ink)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13, fontWeight: 600,
        }}
      >
        <span style={{ fontSize: 15 }}>{current.flag}</span>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.03em' }}>{current.code}</span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 41, minWidth: 150,
            background: 'var(--mb-surface)', border: '1px solid var(--mb-line)', borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)', overflow: 'hidden', padding: 4,
          }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { onChange(l.code); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
                  background: l.code === value ? 'var(--accent-soft)' : 'transparent',
                  border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13.5,
                  color: l.code === value ? 'var(--accent)' : 'var(--mb-ink)', fontWeight: l.code === value ? 700 : 500,
                }}
              >
                <span style={{ fontSize: 16 }}>{l.flag}</span>{l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
