'use client';

import { useEffect } from 'react';
import type { Dish } from '@/components/MenuPanel';
import { getDishEmoji, formatPrice, capitalize, getCategoryGradient } from '@/lib/menu';

interface DishDetailProps {
  dish: Dish;
  onAsk: (dish: Dish) => void;
  onClose: () => void;
}

export function DishDetail({ dish, onAsk, onClose }: DishDetailProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const emoji = getDishEmoji(dish.name, dish.category);
  const gradient = getCategoryGradient(dish.category);
  const allergens = dish.allergens && dish.allergens !== 'ninguno' ? dish.allergens : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full sm:max-w-sm sm:mx-4 bg-[#241F1B] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">

        {/* Visual header */}
        <div className={`relative bg-gradient-to-b ${gradient} flex flex-col items-center justify-center pt-8 pb-6 shrink-0`}>
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/70 hover:text-white transition"
            aria-label="Volver"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="text-7xl mb-3 drop-shadow-lg">{emoji}</div>
          <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
            {capitalize(dish.category)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-white leading-tight flex-1">{dish.name}</h2>
            <span className="text-xl font-bold text-accent shrink-0">{formatPrice(dish.price)}</span>
          </div>

          {dish.description && (
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{dish.description}</p>
          )}

          {dish.ingredients && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ingredientes</p>
              <p className="text-sm text-gray-400 leading-relaxed">{dish.ingredients}</p>
            </div>
          )}

          {allergens && (
            <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-700/30 rounded-xl px-3 py-2.5">
              <span className="text-base shrink-0">⚠️</span>
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-0.5">Alérgenos</p>
                <p className="text-xs text-amber-200/70">{allergens}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-white/5 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition"
          >
            ← Carta
          </button>
          <button
            onClick={() => onAsk(dish)}
            className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-lite active:scale-95 text-white text-sm font-semibold transition-all"
          >
            Preguntar al asistente →
          </button>
        </div>
      </div>
    </div>
  );
}
