'use client';

import { useEffect, useState } from 'react';
import { getDishEmoji, formatPrice, capitalize } from '@/lib/menu';

export interface Dish {
  id: number;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: string;
  allergens: string;
}

interface MenuPanelProps {
  slug: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectDish: (dish: Dish) => void;
}

const CATEGORY_ORDER = ['chef', 'ceviches', 'tiraditos', 'entradas', 'carnes', 'pescados', 'principales', 'kids', 'postres', 'cócteles', 'piscos', 'cervezas', 'sin alcohol'];

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
        <div className="fixed inset-0 bg-black/50 z-20 sm:hidden" onClick={onToggle} />
      )}

      {/* Panel */}
      <aside className={`
        fixed sm:relative inset-y-0 right-0 z-30 sm:z-auto
        flex flex-col bg-gray-900 border-l border-white/5
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 translate-x-0' : 'w-72 translate-x-full sm:translate-x-0 sm:w-0 sm:overflow-hidden'}
      `}>
        <div className="w-72 flex flex-col h-full">
          {/* Header */}
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

          {/* Dishes */}
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
                  <div className="px-4 py-2 sticky top-0 bg-gray-900/95 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      {capitalize(cat)}
                    </span>
                  </div>
                  {categories[cat].map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => onSelectDish(dish)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition text-left group"
                    >
                      {/* Emoji photo */}
                      <div className="w-11 h-11 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-2xl shrink-0 group-hover:border-purple-500/30 transition">
                        {getDishEmoji(dish.name, dish.category)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition leading-snug">
                          {dish.name}
                        </p>
                        {dish.description && (
                          <p className="text-xs text-gray-600 truncate mt-0.5 leading-snug">
                            {dish.description}
                          </p>
                        )}
                        <p className="text-xs text-purple-400 font-semibold mt-0.5">
                          {formatPrice(dish.price)}
                        </p>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-700 group-hover:text-gray-400 transition shrink-0">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/5 shrink-0">
            <p className="text-xs text-gray-600 text-center">Toca un plato para ver más</p>
          </div>
        </div>
      </aside>
    </>
  );
}
