'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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

const SLUG_ACCENT: Record<string, string> = {
  'izakaya-nami': 'from-purple-500/10 border-purple-500/20 hover:border-purple-500/50',
  'bocas-del-mar': 'from-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
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
      .then((r) => r.json())
      .then((data: { restaurants: Restaurant[] }) => setRestaurants(data.restaurants))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver
        </Link>
        <Link href="/" className="font-semibold text-base">
          🍜 Menu<span className="text-purple-400">Bot</span>
        </Link>
        <div className="w-16" />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-white mb-2">Elige un restaurante</h1>
            <p className="text-gray-400 text-sm">Selecciona un local para chatear con su asistente de carta.</p>
          </div>

          {loading ? (
            <div className="flex justify-center gap-1.5 py-12">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <p>No hay restaurantes disponibles.</p>
              <p className="mt-1">Ejecuta <code className="bg-gray-800 px-1 rounded text-xs">npm run seed</code> para cargar los datos.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {restaurants.map((r) => (
                <Link
                  key={r.id}
                  href={`/chat/${r.slug}`}
                  className={`group flex items-center gap-4 bg-gradient-to-r ${SLUG_ACCENT[r.slug] ?? 'from-gray-800/50 border-white/10 hover:border-white/20'} to-transparent border rounded-2xl p-4 transition-all duration-200`}
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-3xl shrink-0">
                    {SLUG_EMOJI[r.slug] ?? '🍽️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-white">{r.name}</span>
                      {SLUG_BADGE[r.slug] && (
                        <span className="text-xs text-gray-500 bg-gray-800 border border-white/5 px-2 py-0.5 rounded-full">
                          {SLUG_BADGE[r.slug]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{r.description}</p>
                  </div>
                  <div className="text-gray-600 group-hover:text-gray-300 transition shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-xs text-gray-600">
        Un producto de <span className="text-gray-500">Novodev SPA</span>
      </footer>
    </div>
  );
}
