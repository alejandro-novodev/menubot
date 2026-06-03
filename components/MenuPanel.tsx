'use client';

import { useEffect, useState } from 'react';

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface MenuPanelProps {
  slug: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectDish: (dish: Dish) => void;
}

const CATEGORY_ORDER = ['entradas', 'principales', 'postres', 'bebidas'];

function getDishEmoji(name: string, category: string): string {
  const n = name.toLowerCase();
  if (n.includes('karaage') || n.includes('pollo')) return '🍗';
  if (n.includes('takoyaki') || n.includes('pulpo')) return '🐙';
  if (n.includes('gyoza') || n.includes('dumpling')) return '🥟';
  if (n.includes('edamame') || n.includes('soya')) return '🫛';
  if (n.includes('ramen') || n.includes('sopa')) return '🍜';
  if (n.includes('sashimi') || n.includes('ceviche') || n.includes('pescado')) return '🐟';
  if (n.includes('matcha') || n.includes('choco')) return '🍫';
  if (category === 'postres') return '🍮';
  if (category === 'bebidas') return '🥤';
  return '🍽️';
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CL')}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function MenuPanel({ slug, isOpen, onToggle, onSelectDish }: MenuPanelProps) {
  const [categories, setCategories] = useState<Record<string, Dish[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`/api/menu/${slug}`);
        if (!res.ok) return;
        const data = await res.json() as { categories: Record<string, Dish[]> };
        setCategories(data.categories);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [slug]);

  const sortedCategories = Object.keys(categories).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 sm:hidden"
          onClick={onToggle}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed sm:relative inset-y-0 right-0 z-30 sm:z-auto
          flex flex-col bg-gray-900 border-l border-white/5
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-72 translate-x-0' : 'w-72 translate-x-full sm:translate-x-0 sm:w-0 sm:overflow-hidden'}
        `}
      >
        <div className="w-72 flex flex-col h-full">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base">🗂️</span>
              <span className="text-sm font-semibold text-white">La Carta</span>
            </div>
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Cerrar carta"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Dishes list */}
          <div className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            ) : sortedCategories.length === 0 ? (
              <p className="text-center text-gray-600 text-xs py-8">Sin platos disponibles</p>
            ) : (
              sortedCategories.map((cat) => (
                <div key={cat} className="mb-1">
                  <div className="px-4 py-2 sticky top-0 bg-gray-900">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      {capitalize(cat)}
                    </span>
                  </div>
                  {categories[cat].map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => onSelectDish(dish)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 active:bg-white/10 transition text-left group"
                    >
                      {/* Emoji "photo" */}
                      <div className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-xl shrink-0 group-hover:border-purple-500/30 transition">
                        {getDishEmoji(dish.name, dish.category)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition">
                          {dish.name}
                        </p>
                        <p className="text-xs text-purple-400 font-medium mt-0.5">
                          {formatPrice(dish.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/5 shrink-0">
            <p className="text-xs text-gray-600 text-center">Toca un plato para saber más</p>
          </div>
        </div>
      </aside>
    </>
  );
}
