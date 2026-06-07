'use client';

import { useState } from 'react';
import { LogoIcon } from '@/components/brand/Wordmark';

export interface MenuDish {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  ingredients: string | null;
  allergens: string | null;
}

interface Props {
  restaurantName: string;
  cuisine: string;
  categories: Record<string, MenuDish[]>;
  onAsk: (dish?: MenuDish) => void;
}

const CATEGORY_ORDER = [
  'chef', 'ceviches', 'tiraditos', 'entradas', 'carnes', 'pescados',
  'principales', 'postres', 'cócteles', 'piscos', 'cervezas', 'sin alcohol', 'kids',
];

function formatClp(n: number) {
  return `$${n.toLocaleString('es-CL')}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

function DishRow({ dish, last, onTap }: { dish: MenuDish; last: boolean; onTap: () => void }) {
  const allergens = dish.allergens && dish.allergens !== 'ninguno'
    ? dish.allergens.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <button
      onClick={onTap}
      style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', gap: 14, padding: '13px 0',
        borderBottom: last ? 'none' : '1px solid var(--mb-line)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{
          fontFamily: 'var(--font-space-grotesk, system-ui)',
          fontWeight: 600, fontSize: 15.5,
          letterSpacing: '-0.02em',
          color: 'var(--mb-ink)',
        }}>{dish.name}</span>
        {dish.description && (
          <p style={{ margin: 0, fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--mb-mut)' }}>
            {dish.description}
          </p>
        )}
        {allergens.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {allergens.map(a => <AllergenBadge key={a} label={a} />)}
          </div>
        )}
      </div>
      {dish.price != null && (
        <span style={{
          fontFamily: 'var(--font-space-grotesk, system-ui)',
          fontWeight: 600, fontSize: 15,
          color: 'var(--accent)', whiteSpace: 'nowrap', paddingTop: 1,
        }}>
          {formatClp(dish.price)}
        </span>
      )}
    </button>
  );
}

export function MenuScreen({ restaurantName, cuisine, categories, onAsk }: Props) {
  const allCats = Object.keys(categories);
  const sorted = [...allCats].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a), bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });

  const [active, setActive] = useState(sorted[0] ?? '');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const visibleCats = active ? [active] : sorted;

  return (
    <div
      data-theme={theme}
      style={{
        maxWidth: 460, margin: '0 auto', minHeight: '100%',
        display: 'flex', flexDirection: 'column',
        background: 'var(--mb-bg)',
        color: 'var(--mb-ink)',
        position: 'relative',
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        padding: '18px 20px 14px',
        background: 'var(--mb-head-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--mb-line)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-space-grotesk, system-ui)',
            fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em',
            lineHeight: 1.05, margin: 0, color: 'var(--mb-ink)',
          }}>{restaurantName}</h1>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 5,
            fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12, color: 'var(--mb-mut)',
          }}>
            <span>{cuisine}</span>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: 'var(--mb-mut2)' }} />
            <span>con menubot<span style={{ color: 'var(--accent)' }}>.</span></span>
          </div>
        </div>
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          aria-label="Cambiar modo"
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: 999,
            border: '1px solid var(--mb-line)',
            background: 'var(--mb-surface)', color: 'var(--mb-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 15,
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Category chips */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '13px 20px 5px', flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        {sorted.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(a => a === cat ? '' : cat)}
            style={{
              fontFamily: 'var(--font-archivo, system-ui)',
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              borderRadius: 999, padding: '7px 14px', lineHeight: 1, cursor: 'pointer',
              color: active === cat ? '#fff' : 'var(--mb-ink)',
              background: active === cat ? 'var(--accent)' : 'transparent',
              border: active === cat ? 'none' : '1px solid var(--mb-chip-line)',
            }}
          >
            {capitalize(cat)}
          </button>
        ))}
      </div>

      {/* Dish sections */}
      <div style={{ flex: 1, padding: '8px 20px 0' }}>
        {visibleCats.map(cat => (
          <div key={cat}>
            <div style={{
              fontFamily: 'var(--font-archivo, system-ui)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--accent)',
              margin: '18px 0 2px',
            }}>{cat}</div>
            {(categories[cat] ?? []).map((dish, i, arr) => (
              <DishRow
                key={dish.id}
                dish={dish}
                last={i === arr.length - 1}
                onTap={() => onAsk(dish)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Floating "Preguntar" button */}
      <div style={{
        position: 'fixed', bottom: 26,
        left: '50%', transform: 'translateX(-50%)', zIndex: 20,
      }}>
        <button
          onClick={() => onAsk()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 999,
            padding: '12px 20px 12px 12px',
            cursor: 'pointer',
            fontFamily: 'var(--font-archivo, system-ui)',
            fontWeight: 600, fontSize: 14.5,
            boxShadow: 'var(--shadow-accent)',
            whiteSpace: 'nowrap',
          }}
        >
          <LogoIcon size={26} />
          Preguntar a menubot.
        </button>
      </div>
    </div>
  );
}
