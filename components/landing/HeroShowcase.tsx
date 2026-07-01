'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const P = {
  bg: '#FAF6EF',
  surface: '#FFFFFF',
  ink: '#2B2421',
  mut: '#8C8178',
  mut2: '#B5ABA1',
  line: '#ECE3D7',
  accent: '#C76B43',
  accentSoft: 'rgba(199,107,67,0.10)',
};

// ── Mockups ────────────────────────────────────────────────────────────────

function ChatMock() {
  const bubble = (text: string, me: boolean) => (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '80%', fontSize: 12, lineHeight: 1.45, padding: '8px 12px',
        borderRadius: me ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: me ? P.accent : P.surface, color: me ? '#fff' : P.ink,
        border: me ? 'none' : `1px solid ${P.line}`,
      }}>{text}</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', gap: 9, background: P.surface }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>m.</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.ink }}>Asistente · El Mesón Austral</div>
          <div style={{ fontSize: 10, color: '#5BBF7B', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: 9, background: '#5BBF7B' }} />En línea
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 9, background: P.bg }}>
        {bubble('¿Tienen algo rico para compartir en la mesa? 🙌', true)}
        {bubble('¡Claro! Las Longanizas chillaneras a la parrilla son ideales para compartir 🔥', false)}
        {bubble('¿Y de fondo, qué me recomiendas?', true)}
        {bubble('El Asado de tira al carbón es lo más pedido — viene con ensalada chilena ⭐', false)}
      </div>
      <div style={{ padding: '10px 12px', borderTop: `1px solid ${P.line}`, background: P.surface, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, height: 32, borderRadius: 99, background: P.bg, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 11, color: P.mut2 }}>Escribe tu pregunta…</div>
        <div style={{ width: 32, height: 32, borderRadius: 99, background: P.accent, flexShrink: 0 }} />
      </div>
    </div>
  );
}

function MultiLangMock() {
  const dish = (icon: string, name: string, desc: string, price: string, tags: string[]) => (
    <div style={{ display: 'flex', gap: 9, padding: '8px 4px', alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: P.surface, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: P.ink }}>{name}</div>
        <div style={{ fontSize: 10.5, color: P.mut, lineHeight: 1.35 }}>{desc}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
          {tags.map(tag => (
            <span key={tag} style={{ fontSize: 9, fontWeight: 600, color: P.mut, border: `1px solid ${P.line}`, borderRadius: 99, padding: '2px 6px' }}>{tag}</span>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: P.ink, flexShrink: 0 }}>{price}</div>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg, overflow: 'hidden' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, background: P.surface }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: P.ink }}>El Mesón Austral</div>
          <div style={{ fontSize: 10.5, color: P.mut }}>Chilean cuisine · with menubot<span style={{ color: P.accent }}>.</span></div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: P.ink, border: `1px solid ${P.line}`, background: P.surface, borderRadius: 99, padding: '4px 8px', flexShrink: 0 }}>
          🇬🇧 EN <span style={{ color: P.mut2 }}>▾</span>
        </span>
      </div>
      <div style={{ padding: '0 12px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '10px 4px 2px' }}>STARTERS</div>
        {dish('🥟', 'Baked empanada', 'Beef, onion, hard egg and olive.', '$2.900', ['gluten', 'egg'])}
        {dish('🌭', 'Longanizas chillaneras', 'Grilled pork sausage with rustic bread.', '$7.500', ['gluten'])}
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '8px 4px 2px' }}>MAINS</div>
        {dish('🥩', 'Asado de tira', 'Grilled beef ribs with Chilean salad.', '$14.900', ['none'])}
      </div>
    </div>
  );
}

function MenuMock() {
  const dish = (icon: string, name: string, desc: string, price: string, star?: boolean) => (
    <div style={{ display: 'flex', gap: 9, padding: '8px 4px', alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: P.surface, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: P.ink }}>{star && <span>⭐ </span>}{name}</div>
        <div style={{ fontSize: 10.5, color: P.mut, lineHeight: 1.35 }}>{desc}</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: P.ink, flexShrink: 0 }}>{price}</div>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg, overflow: 'hidden' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}`, background: P.surface }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: P.ink }}>El Mesón Austral</div>
        <div style={{ fontSize: 10.5, color: P.mut }}>Cocina chilena de raíz · con menubot<span style={{ color: P.accent }}>.</span></div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: P.surface, borderBottom: `1px solid ${P.line}` }}>
        {['Todo', 'Entradas', 'Carnes'].map((c, i) => (
          <span key={c} style={{ fontSize: 10.5, fontWeight: 600, padding: '4px 10px', borderRadius: 99, color: i === 0 ? '#fff' : P.mut, background: i === 0 ? P.accent : 'transparent', border: `1px solid ${i === 0 ? P.accent : P.line}` }}>{c}</span>
        ))}
      </div>
      <div style={{ padding: '0 12px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '8px 4px 2px' }}>ENTRADAS</div>
        {dish('🥟', 'Empanada de pino', 'Carne picada, cebolla, huevo y aceituna.', '$2.900', true)}
        {dish('🌭', 'Longanizas chillaneras', 'Parrilla con pan amasado y pebre.', '$7.500')}
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: P.accent, margin: '8px 4px 2px' }}>CARNES A LA PARRILLA</div>
        {dish('🥩', 'Asado de tira', 'Al carbón con ensalada chilena y papas.', '$14.900', true)}
        {dish('🦪', 'Mariscal caliente', 'Almejas, choritos y machas al vapor.', '$16.900')}
      </div>
    </div>
  );
}

function BillMock() {
  const row = (name: string, price: string, qty: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 9, background: qty > 0 ? P.accentSoft : 'transparent' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: P.ink }}>{name}</div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: P.mut }}>{price}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${P.line}`, background: P.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.ink, fontSize: 13 }}>−</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: P.ink, minWidth: 10, textAlign: 'center' }}>{qty}</span>
        <span style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${P.line}`, background: P.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.ink, fontSize: 13 }}>+</span>
      </div>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', gap: 8, background: P.surface }}>
        <span style={{ fontSize: 16 }}>🧮</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: P.ink }}>Dividir la cuenta</div>
          <div style={{ fontSize: 10, color: P.mut }}>Elige los platos y divídela.</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '8px 10px' }}>
        {row('Asado de tira', '$14.900', 2)}
        {row('Empanada de pino', '$2.900', 1)}
        {row('Pisco sour artesanal', '$5.900', 3)}
      </div>
      <div style={{ borderTop: `1px solid ${P.line}`, padding: '10px 14px 14px', background: P.surface }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: P.mut, marginBottom: 3 }}>
          <span>Total · propina 10%</span>
          <span style={{ color: P.ink, fontWeight: 600 }}>$52.250</span>
        </div>
        <div style={{ marginTop: 8, padding: '11px 13px', borderRadius: 11, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: P.ink }}>Cada uno paga (÷3)</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: P.accent }}>$17.417</span>
        </div>
      </div>
    </div>
  );
}

function InsightsMock() {
  const q = (label: string, count: number, pct: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <div style={{ flex: 1, position: 'relative', height: 28, borderRadius: 7, background: P.surface, border: `1px solid ${P.line}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: P.accentSoft }} />
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 11, color: P.ink }}>{label}</span>
      </div>
      <span style={{ fontSize: 10.5, color: P.mut, width: 24, textAlign: 'right' }}>{count}×</span>
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${P.line}`, background: P.surface }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: P.ink }}>Lo que preguntan tus clientes</div>
        <div style={{ fontSize: 10, color: P.mut }}>El Mesón Austral · últimos 7 días</div>
      </div>
      <div style={{ display: 'flex', gap: 7, padding: '10px 12px 6px' }}>
        {[['128', 'conversaciones'], ['12', 'sin gluten']].map(([n, l]) => (
          <div key={l} style={{ flex: 1, border: `1px solid ${P.line}`, borderRadius: 12, padding: '8px 10px', background: P.surface }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: P.ink }}>{n}</div>
            <div style={{ fontSize: 9.5, color: P.mut }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '6px 12px' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: P.ink, marginBottom: 7 }}>Preguntas más frecuentes</div>
        {q('opciones sin gluten', 12, 100)}
        {q('recomendaciones', 9, 75)}
        {q('opciones veganas', 6, 50)}
        {q('ubicación y horario', 4, 34)}
        <div style={{ fontSize: 10.5, fontWeight: 700, color: P.ink, margin: '10px 0 7px' }}>Conversación reciente</div>
        <div style={{ border: `1px solid ${P.line}`, borderRadius: 10, padding: '8px 10px', background: P.surface }}>
          <div style={{ fontSize: 9.5, color: P.mut2, marginBottom: 2 }}>hace 12 min · 4 mensajes</div>
          <div style={{ fontSize: 11, color: P.ink, lineHeight: 1.4 }}>Cliente preguntó por opciones sin gluten y pidió recomendación de entradas.</div>
        </div>
      </div>
    </div>
  );
}

function ReviewsMock() {
  const stars = (n: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? '#F59E0B' : P.line, fontSize: 12 }}>★</span>
  ));
  const review = (initial: string, name: string, n: number, text: string, reply?: string) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: P.accent, flexShrink: 0 }}>{initial}</div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: P.ink, lineHeight: 1.2 }}>{name}</div>
          <div style={{ display: 'flex' }}>{stars(n)}</div>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: P.ink, lineHeight: 1.4, padding: '8px 10px', background: P.surface, border: `1px solid ${P.line}`, borderRadius: 10, margin: 0 }}>{text}</p>
      {reply && (
        <div style={{ marginTop: 5, marginLeft: 10, padding: '7px 10px', background: P.accentSoft, borderRadius: '0 10px 10px 10px', borderLeft: `3px solid ${P.accent}` }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: P.accent, marginBottom: 2 }}>Respuesta del dueño</div>
          <p style={{ fontSize: 11, color: P.ink, lineHeight: 1.4, margin: 0 }}>{reply}</p>
        </div>
      )}
    </div>
  );
  return (
    <div style={{ height: '100%', background: P.bg, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${P.line}`, background: P.surface }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: P.ink }}>Opiniones de clientes</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <div style={{ display: 'flex' }}>{Array.from({length:5},(_,i)=><span key={i} style={{color:'#F59E0B',fontSize:12}}>★</span>)}</div>
          <span style={{ fontSize: 10.5, color: P.mut }}>4.8 · 24 opiniones</span>
        </div>
      </div>
      <div style={{ padding: '10px 12px', overflowY: 'auto', height: 'calc(100% - 60px)' }}>
        {review('C', 'Carlos M.', 5, '¡El asado de tira estaba increíble! El bot me ayudó a elegir y acertó perfectamente.', '¡Gracias Carlos! Nos alegra que hayas disfrutado. ¡Vuelve pronto! 🎉')}
        {review('M', 'María T.', 4, 'Muy buena atención. El asistente respondió todas mis dudas sobre alérgenos al instante.')}
      </div>
    </div>
  );
}

function QRMock() {
  // Fixed QR finder pattern cells (deterministic)
  const CELLS: [number, number][] = [
    // Top-left finder
    ...[0,1,2,3,4,5,6].flatMap(r => [0,1,2,3,4,5,6].map(c => [r,c] as [number,number])).filter(([r,c]) =>
      r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
    ),
    // Top-right finder
    ...[0,1,2,3,4,5,6].flatMap(r => [10,11,12,13,14,15,16].map(c => [r,c] as [number,number])).filter(([r,c]) =>
      r === 0 || r === 6 || c === 10 || c === 16 || (r >= 2 && r <= 4 && c >= 12 && c <= 14)
    ),
    // Bottom-left finder
    ...[10,11,12,13,14,15,16].flatMap(r => [0,1,2,3,4,5,6].map(c => [r,c] as [number,number])).filter(([r,c]) =>
      r === 10 || r === 16 || c === 0 || c === 6 || (r >= 12 && r <= 14 && c >= 2 && c <= 4)
    ),
    // Data dots (fixed positions, simulates data region)
    [8,8],[8,10],[8,12],[8,14],[9,9],[9,11],[9,13],
    [10,8],[10,10],[10,12],[11,9],[11,11],[11,13],[11,15],
    [12,8],[12,10],[12,14],[13,9],[13,11],[13,12],[13,14],
    [14,9],[14,11],[14,13],[15,8],[15,10],[15,12],[15,14],
    [7,8],[7,10],[7,12],[7,14],[7,16],
    [8,7],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],
  ];
  const S = 6; // cell size px
  const G = 17; // grid size
  const set = new Set(CELLS.map(([r,c]) => `${r},${c}`));

  return (
    <div style={{ height: '100%', background: P.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: 14 }}>

      {/* Card */}
      <div style={{ background: P.surface, border: `1px solid ${P.line}`, borderRadius: 16, padding: '18px 20px', width: '100%', maxWidth: 220, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.ink, marginBottom: 2 }}>El Mesón Austral</div>
        <div style={{ fontSize: 10, color: P.mut, marginBottom: 14 }}>Escanea para ver la carta</div>

        {/* QR grid */}
        <div style={{ display: 'inline-block', background: '#fff', padding: 8, borderRadius: 8, border: `1px solid ${P.line}`, marginBottom: 12 }}>
          <svg width={G * S} height={G * S} viewBox={`0 0 ${G * S} ${G * S}`}>
            {Array.from({ length: G }, (_, r) =>
              Array.from({ length: G }, (_, c) =>
                set.has(`${r},${c}`) ? (
                  <rect key={`${r}-${c}`} x={c*S+1} y={r*S+1} width={S-1} height={S-1} rx={1} fill="#1A1614" />
                ) : null
              )
            )}
          </svg>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 7, fontWeight: 800 }}>m.</div>
          <span style={{ fontSize: 9.5, color: P.mut }}>menubot.cl/chat/el-meson-austral</span>
        </div>
      </div>

      {/* Info pill */}
      <div style={{ padding: '9px 14px', background: P.accentSoft, border: `1px solid rgba(199,107,67,0.2)`, borderRadius: 12, textAlign: 'center', width: '100%', maxWidth: 220 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: P.accent }}>QR listo para imprimir</div>
        <div style={{ fontSize: 10, color: P.mut, marginTop: 2 }}>Descárgalo desde tu panel en segundos</div>
      </div>
    </div>
  );
}

// ── Phone frame ─────────────────────────────────────────────────────────────

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 284, flexShrink: 0 }}>
      <div style={{ borderRadius: 38, padding: 9, background: '#211C19', boxShadow: '0 24px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'relative', borderRadius: 30, overflow: 'hidden', background: P.bg, height: 516 }}>
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 64, height: 4, borderRadius: 9, background: 'rgba(0,0,0,0.18)', zIndex: 5 }} />
          <div style={{ paddingTop: 18, height: '100%', boxSizing: 'border-box' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slides ───────────────────────────────────────────────────────────────────

const SLIDES = [
  { key: 'chat',     icon: '💬', title: 'Asistente que conoce tu carta',     desc: 'Responde sobre ingredientes, alérgenos y maridajes, y recomienda según los gustos de cada cliente — 24/7.',        render: ChatMock },
  { key: 'lang',     icon: '🌍', title: 'Carta en el idioma del comensal',   desc: 'Turistas de todo el mundo leen tu carta en inglés, portugués y más. El bot detecta el idioma automáticamente.',    render: MultiLangMock },
  { key: 'menu',     icon: '📖', title: 'Carta digital, siempre al día',      desc: 'Fotos, descripciones y sugerencias del chef destacadas. Actualización instantánea desde tu panel.',               render: MenuMock },
  { key: 'bill',     icon: '🧮', title: 'Divide la cuenta sin calculadora',   desc: 'Tus clientes suman lo que pidieron, agregan propina y dividen el total — con los precios reales de tu carta.',    render: BillMock },
  { key: 'insights', icon: '📊', title: 'Descubre qué quieren tus clientes', desc: 'Cada conversación se resume: preguntas frecuentes, tendencias y la demanda que aún no estás cubriendo.',           render: InsightsMock },
  { key: 'reviews',  icon: '⭐', title: 'Reseñas y respuestas del dueño',    desc: 'Los comensales califica su visita. Tú respondes desde el panel — fidelización real sin esfuerzo.',                render: ReviewsMock },
  { key: 'qr',       icon: '📱', title: 'QR listo para tus mesas',           desc: 'Un QR único por local. Imprime la lámina o compártelo en Instagram, Google Maps y WhatsApp.',                      render: QRMock },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function HeroShowcase() {
  const { data: session } = useSession();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive(a => (a + 1) % SLIDES.length), 4200);
    return () => clearInterval(id);
  }, [paused]);

  function pick(i: number) { setActive(i); setPaused(true); }
  const Active = SLIDES[active].render;

  return (
    <section id="producto" className="pt-20 pb-12 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10 xl:gap-14 items-start">

          {/* ── Left: intro + all features ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border border-black/[0.08] bg-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-[#5A524A] font-medium">Para restaurantes, bares y hoteles · 14 días gratis</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              La carta que habla<br />
              <span className="text-accent">con tus clientes</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#6B6259] text-base leading-relaxed mb-6 max-w-md">
              Un asistente de IA que conoce tu menú, atiende en cualquier idioma
              y convierte cada visita en datos útiles para tu negocio.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-2">
              <Link
                href={session?.user ? '/dashboard' : '/auth/register'}
                className="rounded-xl bg-accent hover:bg-accent-lite active:scale-95 transition-all px-7 py-2.5 text-sm font-semibold text-white"
                style={{ boxShadow: '0 6px 20px rgba(199,107,67,0.28)' }}
              >
                {session?.user ? 'Ir a mi panel →' : 'Empezar gratis — 14 días →'}
              </Link>
              <a
                href="#como-funciona"
                className="rounded-xl bg-white hover:bg-[#F3ECE1] border border-black/10 transition px-7 py-2.5 text-sm font-medium text-[#5A524A]"
              >
                Cómo funciona ↓
              </a>
            </div>
            <p className="text-xs text-[#9A9087] mb-7">Sin tarjeta · Sin contrato · Cancela cuando quieras</p>

            {/* Mobile phone — visible between intro and features */}
            <div className="lg:hidden my-6 flex flex-col items-center">
              <Phone><Active /></Phone>
              <div className="flex items-center gap-2 mt-4">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => pick(i)}
                    aria-label={s.title}
                    className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-accent' : 'w-2 bg-black/15 hover:bg-black/30'}`}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-black/[0.07]" />
              <span className="text-xs font-semibold text-[#9A9087] uppercase tracking-widest whitespace-nowrap">Todo lo que incluye</span>
              <div className="flex-1 h-px bg-black/[0.07]" />
            </div>

            {/* Feature grid — all 7 visible at once, 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SLIDES.map((s, i) => {
                const on = i === active;
                return (
                  <button
                    key={s.key}
                    onClick={() => pick(i)}
                    className={`text-left rounded-2xl border transition-all duration-200 ${
                      on
                        ? 'border-accent/40 bg-accent/[0.08] shadow-sm'
                        : 'border-black/[0.07] bg-white hover:border-black/[0.14] hover:shadow-sm'
                    }`}
                    style={{ padding: on ? '12px 14px 14px' : '12px 14px' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{s.icon}</span>
                      <span className={`font-semibold text-sm leading-snug ${on ? 'text-accent' : 'text-[#2B2421]'}`}>
                        {s.title}
                      </span>
                    </div>
                    {on && (
                      <p className="text-xs text-[#6B6259] leading-relaxed mt-2 pl-8">
                        {s.desc}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: phone (sticky on desktop) ── */}
          <div className="hidden lg:flex flex-col items-center sticky top-20">
            <Phone><Active /></Phone>
            {/* Dots */}
            <div className="flex items-center gap-2 mt-5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => pick(i)}
                  aria-label={s.title}
                  className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-accent' : 'w-2 bg-black/15 hover:bg-black/30'}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
