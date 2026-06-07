'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver
        </Link>
        <Wordmark size="md" className="text-white" />
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-white mb-2">Elige un restaurante</h1>
            <p className="text-gray-500 text-sm">Selecciona un local para ver su carta y chatear con el asistente.</p>
          </div>

          {loading ? (
            <div className="flex justify-center gap-1.5 py-12">
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', display: 'inline-block', animation: `bounce 1.2s ease-in-out ${d}ms infinite` }} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <p>No hay restaurantes disponibles.</p>
              <p className="mt-1">Ejecuta <code className="bg-gray-800 px-1 rounded text-xs">npm run seed</code> para cargar los datos.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {restaurants.map(r => (
                <Link
                  key={r.id}
                  href={`/chat/${r.slug}`}
                  className="group flex items-center gap-4 bg-gray-900 border border-white/5 hover:border-white/15 rounded-2xl p-4 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-3xl shrink-0">
                    {SLUG_EMOJI[r.slug] ?? '🍽️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-white text-sm">{r.name}</span>
                      {SLUG_BADGE[r.slug] && (
                        <span className="text-xs text-gray-600 bg-gray-800 border border-white/5 px-2 py-0.5 rounded-full">
                          {SLUG_BADGE[r.slug]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{r.description}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-700 group-hover:text-gray-400 transition shrink-0">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-xs text-gray-700">
        Un producto de <span className="text-gray-600">Novodev SPA</span>
      </footer>
    </div>
  );
}
