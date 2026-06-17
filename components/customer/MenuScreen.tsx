'use client';

import { useState } from 'react';
import { LogoIcon } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getDishEmoji, formatPrice, capitalize } from '@/lib/menu';

export interface MenuDish {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  ingredients: string | null;
  allergens: string | null;
  image?: string | null;
  icon?: string | null;
  is_recommended?: boolean;
}

interface Props {
  restaurantName: string;
  cuisine: string;
  categories: Record<string, MenuDish[]>;
  onAsk: (dish?: MenuDish) => void;
  /** Hide the floating button on desktop (chat is always visible) */
  showFloatingButton?: boolean;
  /** In sidebar mode, remove max-width centering + own header toggle */
  sidebar?: boolean;
}

const CATEGORY_ORDER = [
  'chef', 'ceviches', 'tiraditos', 'entradas', 'carnes', 'pescados',
  'principales', 'postres', 'cócteles', 'piscos', 'cervezas', 'sin alcohol', 'kids',
];

function AllergenBadge({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-archivo, system-ui)',
      fontSize: 11, fontWeight: 600,
      color: 'var(--mb-badge-ink)',
      border: '1px solid var(--mb-badge-line)',
      borderRadius: 999, padding: '3px 9px', lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: '#D49A4E', flexShrink: 0 }} />
      {label}
    </span>
  );
}

function DishRow({ dish, onTap }: { dish: MenuDish; onTap: () => void }) {
  const allergens = dish.allergens && dish.allergens !== 'ninguno'
    ? dish.allergens.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <button
      onClick={onTap}
      className="mb-dish-row"
      aria-label={`Preguntar sobre ${dish.name}`}
      style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', gap: 13, padding: '12px 11px', alignItems: 'flex-start',
      }}
    >
      {/* Emoji avatar — visual anchor for each dish */}
      <span
        aria-hidden
        style={{
          flexShrink: 0, width: 42, height: 42, borderRadius: 12,
          background: 'var(--mb-surface)', border: '1px solid var(--mb-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 21, lineHeight: 1, marginTop: 1, overflow: 'hidden',
        }}
      >
        {dish.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={dish.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (dish.icon || getDishEmoji(dish.name, dish.category ?? ''))}
      </span>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{
          fontFamily: 'var(--font-space-grotesk, system-ui)',
          fontWeight: 600, fontSize: 15,
          letterSpacing: '-0.01em',
          color: 'var(--mb-ink)',
        }}>{dish.is_recommended && <span title="Recomendación del chef">⭐ </span>}{dish.name}</span>
        {dish.description && (
          <p style={{
            margin: 0, fontFamily: 'var(--font-archivo, system-ui)',
            fontSize: 12.5, lineHeight: 1.45, color: 'var(--mb-mut)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {dish.description}
          </p>
        )}
        {allergens.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {allergens.map(a => <AllergenBadge key={a} label={a} />)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0, paddingTop: 2 }}>
        {dish.price != null && (
          <span style={{
            fontFamily: 'var(--font-space-grotesk, system-ui)',
            fontWeight: 700, fontSize: 14.5,
            color: 'var(--mb-ink)', whiteSpace: 'nowrap',
          }}>
            {formatPrice(dish.price)}
          </span>
        )}
        <span className="mb-dish-cta" style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontFamily: 'var(--font-archivo, system-ui)', fontSize: 11, fontWeight: 600,
          color: 'var(--mb-mut)', whiteSpace: 'nowrap',
        }}>
          Preguntar
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
  );
}

export function MenuScreen({ restaurantName, cuisine, categories, onAsk, showFloatingButton = true, sidebar = false }: Props) {
  const sorted = Object.keys(categories).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a), bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });

  // '' = show every category (default). Otherwise filter to one.
  const [active, setActive] = useState('');
  const visibleCats = active ? [active] : sorted;

  const totalDishes = sorted.reduce((n, c) => n + (categories[c]?.length ?? 0), 0);

  return (
    <div
      style={{
        ...(sidebar ? {} : { maxWidth: 480, margin: '0 auto' }),
        minHeight: '100%',
        display: 'flex', flexDirection: 'column',
        background: 'var(--mb-bg)',
        color: 'var(--mb-ink)',
        position: 'relative',
        paddingBottom: showFloatingButton ? 96 : 12,
      }}
    >
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        padding: '18px 20px 12px',
        background: 'var(--mb-head-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--mb-line)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-space-grotesk, system-ui)',
            fontWeight: 700, fontSize: 23, letterSpacing: '-0.03em',
            lineHeight: 1.05, margin: 0, color: 'var(--mb-ink)',
          }}>{restaurantName}</h1>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, marginTop: 6,
            fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12, color: 'var(--mb-mut)',
          }}>
            {cuisine && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cuisine}</span>}
            {cuisine && <span style={{ width: 3, height: 3, borderRadius: 99, background: 'var(--mb-mut2)', flexShrink: 0 }} />}
            <span style={{ flexShrink: 0 }}>con menubot<span style={{ color: 'var(--accent)' }}>.</span></span>
          </div>
        </div>
        {!sidebar && <ThemeToggle />}
      </div>

      {/* Category chips */}
      <div className="mb-noscroll" style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '12px 20px 6px', flexShrink: 0,
        position: 'sticky', top: 0,
      }}>
        {[{ key: '', label: 'Todo' }, ...sorted.map(c => ({ key: c, label: capitalize(c) }))].map(chip => {
          const isActive = active === chip.key;
          return (
            <button
              key={chip.key || 'all'}
              onClick={() => setActive(chip.key)}
              className="mb-chip"
              data-active={isActive}
              style={{
                fontFamily: 'var(--font-archivo, system-ui)',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                borderRadius: 999, padding: '7px 14px', lineHeight: 1, cursor: 'pointer',
                color: isActive ? '#fff' : 'var(--mb-mut)',
                background: isActive ? 'var(--accent)' : 'transparent',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--mb-chip-line)',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Tap-to-ask hint */}
      <div style={{
        padding: '4px 20px 2px', flexShrink: 0,
        fontFamily: 'var(--font-archivo, system-ui)', fontSize: 11.5,
        color: 'var(--mb-mut2)', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: 'var(--accent)' }}>💬</span>
        Toca cualquier plato para preguntarle al asistente.
      </div>

      {/* Dish sections */}
      <div style={{ flex: 1, padding: '6px 9px 0' }}>
        {visibleCats.map(cat => (
          <div key={cat} style={{ marginBottom: 6 }}>
            <div style={{
              fontFamily: 'var(--font-archivo, system-ui)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--accent)',
              margin: '16px 11px 4px',
            }}>{capitalize(cat)}</div>
            {(categories[cat] ?? []).map(dish => (
              <DishRow key={dish.id} dish={dish} onTap={() => onAsk(dish)} />
            ))}
          </div>
        ))}
        {totalDishes === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px', color: 'var(--mb-mut)',
            fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13,
          }}>
            La carta aún no está disponible.
          </div>
        )}
      </div>

      {/* Floating "Preguntar" button — only on mobile menu view */}
      {showFloatingButton && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <button
            onClick={() => onAsk()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 999,
              padding: '12px 20px 12px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-archivo, system-ui)',
              fontWeight: 600, fontSize: 14.5,
              boxShadow: 'var(--shadow-accent)', whiteSpace: 'nowrap',
            }}
          >
            <LogoIcon size={26} />
            Preguntar a menubot.
          </button>
        </div>
      )}
    </div>
  );
}
