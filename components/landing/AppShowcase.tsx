'use client';

import { useEffect, useState } from 'react';

/**
 * Landing "see the app" showcase: one phone frame whose screen swaps between
 * lightweight, real-looking mockups of the core features. Auto-advances; pauses
 * once the visitor picks a feature. Mockups use a fixed light palette so they
 * read as real phone screenshots against the dark landing section.
 */

const P = {
  bg: '#FAF6EF',
  surface: '#FFFFFF',
  surface2: '#F3ECE1',
  ink: '#2B2421',
  mut: '#8C8178',
  mut2: '#B5ABA1',
  line: '#ECE3D7',
  accent: '#C76B43',
  accentSoft: 'rgba(199,107,67,0.12)',
};

// ── Mockups ────────────────────────────────────────────────────────────────
function ChatMock() {
  const bubble = (text: string, me: boolean) => (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '80%', fontSize: 12.5, lineHeight: 1.4, padding: '9px 12px',
        borderRadius: me ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: me ? P.accent : P.surface, color: me ? '#fff' : P.ink,
        border: me ? 'none' : `1px solid ${P.line}`,
      }}>{text}</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>m.</div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: P.ink }}>Asistente · Bocas del Mar</div>
          <div style={{ fontSize: 10.5, color: '#5BBF7B', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: 9, background: '#5BBF7B' }} />En línea</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 9, background: P.bg }}>
        {bubble('¿Algo sin gluten para compartir? 🙌', true)}
        {bubble('¡Claro! El Ceviche Mixto es sin gluten y perfecto para compartir. ¿Te gusta el picante? 🌶️', false)}
        {bubble('Sí, me encanta', true)}
        {bubble('Entonces pídelo con ají extra — y de fondo te recomiendo el Lomo a lo Pobre ⭐', false)}
      </div>
      <div style={{ padding: 10, borderTop: `1px solid ${P.line}`, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, height: 34, borderRadius: 99, background: P.surface, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, color: P.mut2 }}>Escribe tu pregunta…</div>
        <div style={{ width: 34, height: 34, borderRadius: 99, background: P.accent }} />
      </div>
    </div>
  );
}

function MenuMock() {
  const dish = (icon: string, name: string, desc: string, price: string, star?: boolean) => (
    <div style={{ display: 'flex', gap: 10, padding: '9px 4px', alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: P.surface, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{star && <span>⭐ </span>}{name}</div>
        <div style={{ fontSize: 11, color: P.mut, lineHeight: 1.35 }}>{desc}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, flexShrink: 0 }}>{price}</div>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg, overflow: 'hidden' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}` }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: P.ink, letterSpacing: '-0.02em' }}>Bocas del Mar</div>
        <div style={{ fontSize: 11, color: P.mut }}>Cocina peruana de autor · con menubot<span style={{ color: P.accent }}>.</span></div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '10px 14px' }}>
        {['Todo', 'Entradas', 'Fondos'].map((c, i) => (
          <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 99, color: i === 0 ? '#fff' : P.mut, background: i === 0 ? P.accent : 'transparent', border: `1px solid ${i === 0 ? P.accent : P.line}` }}>{c}</span>
        ))}
      </div>
      <div style={{ padding: '0 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '8px 4px 2px' }}>ENTRADAS</div>
        {dish('🥟', 'Empanadas de Pino', 'Carne, cebolla, huevo y aceituna.', '$3.500', true)}
        {dish('🐟', 'Ceviche Mixto', 'Pescado y mariscos en leche de tigre.', '$12.900')}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '10px 4px 2px' }}>FONDOS</div>
        {dish('🥩', 'Lomo a lo Pobre', 'Lomo, papas fritas, huevo y cebolla.', '$14.900', true)}
        {dish('🍤', 'Risotto de Camarón', 'Arroz cremoso con camarones salteados.', '$13.500')}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '10px 4px 2px' }}>POSTRES</div>
        {dish('🍮', 'Suspiro Limeño', 'Manjar y merengue al oporto.', '$5.200')}
      </div>
    </div>
  );
}

function BillMock() {
  const row = (name: string, price: string, qty: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 9, background: qty > 0 ? P.accentSoft : 'transparent' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: P.ink }}>{name}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.mut }}>{price}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.ink, fontSize: 14 }}>−</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: P.ink, minWidth: 10, textAlign: 'center' }}>{qty}</span>
        <span style={{ width: 24, height: 24, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.ink, fontSize: 14 }}>+</span>
      </div>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 17 }}>🧮</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: P.ink }}>Dividir la cuenta</div>
          <div style={{ fontSize: 10.5, color: P.mut }}>Elige los platos y divídela.</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '8px 10px' }}>
        {row('Lomo a lo Pobre', '$14.900', 2)}
        {row('Ceviche Mixto', '$12.900', 1)}
        {row('Pisco Sour', '$5.800', 3)}
      </div>
      <div style={{ borderTop: `1px solid ${P.line}`, padding: '10px 14px 14px', background: P.surface }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: P.mut, marginBottom: 3 }}><span>Total · propina 10% incluida</span><span style={{ color: P.ink, fontWeight: 600 }}>$66.110</span></div>
        <div style={{ marginTop: 8, padding: '11px 13px', borderRadius: 11, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: P.ink }}>Cada uno paga (÷3)</span>
          <span style={{ fontSize: 19, fontWeight: 800, color: P.accent }}>$22.037</span>
        </div>
      </div>
    </div>
  );
}

function InsightsMock() {
  const q = (label: string, count: number, pct: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ flex: 1, position: 'relative', height: 30, borderRadius: 8, background: P.surface, border: `1px solid ${P.line}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: P.accentSoft }} />
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 11px', fontSize: 11.5, color: P.ink }}>{label}</span>
      </div>
      <span style={{ fontSize: 11, color: P.mut, width: 26, textAlign: 'right' }}>{count}×</span>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: P.ink }}>Lo que preguntan tus clientes</div>
        <div style={{ fontSize: 10.5, color: P.mut }}>Bocas del Mar · últimos 7 días</div>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px 4px' }}>
        {[['128', 'conversaciones'], ['12', 'sin gluten']].map(([n, l]) => (
          <div key={l} style={{ flex: 1, border: `1px solid ${P.line}`, borderRadius: 12, padding: '9px 11px', background: P.surface }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: P.ink }}>{n}</div>
            <div style={{ fontSize: 10, color: P.mut }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.ink, marginBottom: 8 }}>Preguntas más frecuentes</div>
        {q('opciones sin gluten', 12, 100)}
        {q('recomendaciones', 9, 75)}
        {q('opciones veganas', 6, 50)}
        {q('ubicación y horario', 4, 34)}
        <div style={{ fontSize: 11, fontWeight: 700, color: P.ink, margin: '14px 0 8px' }}>Conversaciones recientes</div>
        {[
          'Cliente preguntó por opciones sin gluten y pidió recomendaciones de entradas.',
          'Buscaba un plato sin mariscos para alguien con alergia; le sugerí el Lomo.',
        ].map((s, i) => (
          <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 10, padding: '9px 11px', background: P.surface, marginBottom: 7 }}>
            <div style={{ fontSize: 10, color: P.mut2, marginBottom: 3 }}>hace {i === 0 ? '12 min' : '1 h'} · 4 mensajes</div>
            <div style={{ fontSize: 11.5, color: P.ink, lineHeight: 1.4 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiLangMock() {
  const dish = (icon: string, name: string, desc: string, price: string, tags: string[]) => (
    <div style={{ display: 'flex', gap: 10, padding: '9px 4px', alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: P.surface, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{name}</div>
        <div style={{ fontSize: 11, color: P.mut, lineHeight: 1.35 }}>{desc}</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
          {tags.map((tag) => (
            <span key={tag} style={{ fontSize: 9.5, fontWeight: 600, color: P.mut, border: `1px solid ${P.line}`, borderRadius: 99, padding: '2px 7px' }}>{tag}</span>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, flexShrink: 0 }}>{price}</div>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg, overflow: 'hidden' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: P.ink, letterSpacing: '-0.02em' }}>Bocas del Mar</div>
          <div style={{ fontSize: 11, color: P.mut }}>Peruvian cuisine · with menubot<span style={{ color: P.accent }}>.</span></div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: P.ink, border: `1px solid ${P.line}`, background: P.surface, borderRadius: 99, padding: '5px 9px', flexShrink: 0 }}>
          🇬🇧 EN <span style={{ color: P.mut2 }}>▾</span>
        </span>
      </div>
      <div style={{ padding: '0 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '10px 4px 2px' }}>STARTERS</div>
        {dish('🐟', 'Ceviche Mixto', 'Fish and seafood in tiger’s milk.', '$12.900', ['fish', 'shellfish'])}
        {dish('🥟', 'Empanadas de Pino', 'Beef, onion, egg and olive.', '$3.500', ['gluten'])}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '10px 4px 2px' }}>MAINS</div>
        {dish('🥩', 'Lomo a lo Pobre', 'Steak, fries, fried egg and onion.', '$14.900', ['egg'])}
      </div>
    </div>
  );
}

const SLIDES = [
  { key: 'chat', icon: '💬', title: 'Un asistente que conoce tu carta', desc: 'Responde sobre ingredientes, alérgenos y maridajes, y recomienda según los gustos de cada cliente — 24/7, en español.', render: ChatMock },
  { key: 'lang', icon: '🌍', title: 'Tu carta en el idioma de tus clientes', desc: 'Turistas de todo el mundo leen tu carta y conversan con el asistente en su idioma (inglés, portugués y más). Ideal para zonas turísticas.', render: MultiLangMock },
  { key: 'menu', icon: '📖', title: 'Tu carta digital, siempre al día', desc: 'Fotos, descripciones y las sugerencias del chef destacadas. Tus clientes escanean el QR y la ven al instante.', render: MenuMock },
  { key: 'bill', icon: '🧮', title: 'Dividir la cuenta, sin calculadora', desc: 'Tus clientes suman lo que pidieron, agregan la propina y la dividen entre todos — con los precios reales de tu carta.', render: BillMock },
  { key: 'insights', icon: '📊', title: 'Descubre qué quieren tus clientes', desc: 'Cada conversación se resume para ti: las preguntas más frecuentes y la demanda que aún no estás cubriendo.', render: InsightsMock },
];

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 288, maxWidth: '100%', flexShrink: 0 }}>
      <div style={{ borderRadius: 38, padding: 9, background: '#211C19', boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'relative', borderRadius: 30, overflow: 'hidden', background: P.bg, height: 524 }}>
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 70, height: 5, borderRadius: 9, background: 'rgba(0,0,0,0.18)', zIndex: 5 }} />
          {children}
        </div>
      </div>
    </div>
  );
}

export function AppShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 4800);
    return () => clearInterval(id);
  }, [paused]);

  function pick(i: number) { setActive(i); setPaused(true); }
  const Active = SLIDES[active].render;

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      {/* Feature list (desktop) */}
      <div className="hidden lg:flex flex-col gap-2 order-2 lg:order-1">
        {SLIDES.map((s, i) => {
          const on = i === active;
          return (
            <button key={s.key} onClick={() => pick(i)}
              className={`text-left rounded-2xl border p-4 transition ${on ? 'border-accent/40 bg-accent/10' : 'border-black/[0.07] bg-white shadow-sm hover:border-black/15'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <h3 className={`font-semibold text-sm ${on ? 'text-accent' : 'text-[#2B2421]'}`}>{s.title}</h3>
              </div>
              <p className={`text-xs leading-relaxed mt-2 transition-all ${on ? 'text-[#6B6259] max-h-24 opacity-100' : 'text-[#9A9087] max-h-0 opacity-0 overflow-hidden'}`}>{s.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Phone */}
      <div className="flex flex-col items-center order-1 lg:order-2">
        <Phone><Active /></Phone>

        {/* Mobile: active title + desc */}
        <div className="lg:hidden text-center mt-6 max-w-xs">
          <h3 className="text-accent font-semibold text-sm flex items-center justify-center gap-2">{SLIDES[active].icon} {SLIDES[active].title}</h3>
          <p className="text-[#6B6259] text-xs leading-relaxed mt-2">{SLIDES[active].desc}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-6">
          {SLIDES.map((s, i) => (
            <button key={s.key} onClick={() => pick(i)} aria-label={s.title}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-accent' : 'w-2 bg-black/15 hover:bg-black/30'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
