'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
}

const SLUG_EMOJI: Record<string, string> = {
  'izakaya-nami': '🍜',
  'bocas-del-mar': '🐟',
};

const SLUG_BADGE: Record<string, string> = {
  'izakaya-nami': 'Japonés',
  'bocas-del-mar': 'Peruano',
};

export default function ChatIndexPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurants')
      .then(r => r.json())
      .then((data: { restaurants: Restaurant[] }) => setRestaurants(data.restaurants))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100svh', background: 'var(--mb-bg)', color: 'var(--mb-ink)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        borderBottom: '1px solid var(--mb-line)', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: 'var(--mb-head-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13, color: 'var(--mb-mut)', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver
        </Link>
        <Wordmark size="md" />
        <ThemeToggle />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em', color: 'var(--mb-ink)', margin: 0 }}>
              Elige un restaurante
            </h1>
            <p style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 14, color: 'var(--mb-mut)', margin: '8px 0 0' }}>
              Selecciona un local para ver su carta y chatear con el asistente.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '48px 0' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', display: 'inline-block', animation: `bounce 1.2s ease-in-out ${d}ms infinite` }} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--mb-mut)', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13.5 }}>
              <p style={{ margin: 0 }}>No hay restaurantes disponibles.</p>
              <p style={{ margin: '6px 0 0' }}>
                Ejecuta <code style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-line)', padding: '1px 6px', borderRadius: 6, fontSize: 12 }}>npm run seed</code> para cargar los datos.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {restaurants.map(r => (
                <Link
                  key={r.id}
                  href={`/chat/${r.slug}`}
                  className="mb-dish-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 15,
                    background: 'var(--mb-surface)', border: '1px solid var(--mb-line)',
                    borderRadius: 18, padding: 15, textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: 54, height: 54, borderRadius: 14, background: 'var(--mb-bg)',
                    border: '1px solid var(--mb-line)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, flexShrink: 0,
                  }}>
                    {SLUG_EMOJI[r.slug] ?? '🍽️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 600, fontSize: 15.5, letterSpacing: '-0.01em', color: 'var(--mb-ink)' }}>{r.name}</span>
                      {SLUG_BADGE[r.slug] && (
                        <span style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 11, fontWeight: 600, color: 'var(--mb-mut)', background: 'var(--mb-bg)', border: '1px solid var(--mb-line)', padding: '2px 8px', borderRadius: 999 }}>
                          {SLUG_BADGE[r.slug]}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12.5, lineHeight: 1.45, color: 'var(--mb-mut)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--mb-line)', padding: '18px 0', textAlign: 'center', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12, color: 'var(--mb-mut2)' }}>
        Un producto de <span style={{ color: 'var(--mb-mut)' }}>Novodev SPA</span>
      </footer>
    </div>
  );
}
