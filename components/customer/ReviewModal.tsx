'use client';

import { useState } from 'react';

/** Post-visit review form for diners. Stored in MenuBot; optional share consent. */
export function ReviewModal({ slug, sessionId, onClose }: { slug: string; sessionId: number | null; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'form' | 'sending' | 'done' | 'error'>('form');

  async function submit() {
    if (rating < 1) return;
    setState('sending');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, rating, comment, shareConsent: consent, sessionId }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 460, background: 'var(--mb-bg)', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--mb-line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⭐</span>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--mb-ink)' }}>¿Cómo estuvo tu experiencia?</h2>
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12, color: 'var(--mb-mut)' }}>Tu opinión ayuda al restaurante a mejorar.</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mb-mut)', padding: 4, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ padding: '18px' }}>
          {state === 'done' ? (
            <div style={{ textAlign: 'center', padding: '20px 8px' }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🙏</div>
              <p style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 700, fontSize: 16, color: 'var(--mb-ink)', margin: 0 }}>¡Gracias por tu opinión!</p>
              <button onClick={onClose} style={{ marginTop: 16, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 22px', fontFamily: 'var(--font-archivo, system-ui)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Listo</button>
            </div>
          ) : (
            <>
              {/* Stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}
                    aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, lineHeight: 1, padding: 2, color: (hover || rating) >= n ? '#E8A33D' : 'var(--mb-line)' }}>
                    {(hover || rating) >= n ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={500}
                placeholder="Cuéntanos qué te pareció (opcional)…"
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--mb-line)', background: 'var(--mb-surface)', padding: '10px 12px', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 14, color: 'var(--mb-ink)', outline: 'none', resize: 'none' }} />

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--accent)' }} />
                <span style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12.5, color: 'var(--mb-mut)', lineHeight: 1.4 }}>
                  Permito que el restaurante comparta mi opinión públicamente.
                </span>
              </label>

              {state === 'error' && <p style={{ color: '#d9534f', fontSize: 12.5, marginTop: 12, fontFamily: 'var(--font-archivo, system-ui)' }}>No se pudo enviar. Intenta de nuevo.</p>}

              <button onClick={submit} disabled={rating < 1 || state === 'sending'}
                style={{ width: '100%', marginTop: 16, background: rating < 1 ? 'var(--mb-surface)' : 'var(--accent)', color: rating < 1 ? 'var(--mb-mut)' : '#fff', border: rating < 1 ? '1px solid var(--mb-line)' : 'none', borderRadius: 12, padding: '12px', fontFamily: 'var(--font-archivo, system-ui)', fontWeight: 700, fontSize: 14.5, cursor: rating < 1 ? 'default' : 'pointer' }}>
                {state === 'sending' ? 'Enviando…' : 'Enviar opinión'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
