'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { MenuScreen, type MenuDish } from '@/components/customer/MenuScreen';
import { LogoIcon } from '@/components/brand/Wordmark';
import { formatPrice } from '@/lib/menu';
import Link from 'next/link';

interface Message { role: 'user' | 'assistant'; content: string; }
interface Restaurant { name: string; description: string; }
interface MenuData { categories: Record<string, MenuDish[]> }

function buildDishMessage(dish: MenuDish): string {
  const parts = [`**${dish.name}**`];
  if (dish.price) parts.push(`— ${formatPrice(dish.price)}`);
  if (dish.description) parts.push(`\n${dish.description}`);
  if (dish.ingredients) parts.push(`\nIngredientes: ${dish.ingredients}`);
  if (dish.allergens && dish.allergens !== 'ninguno') parts.push(`\n⚠️ Contiene: ${dish.allergens}`);
  return parts.join(' ');
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
      <LogoIcon size={28} />
      <div style={{
        background: 'var(--mb-surface)', border: '1px solid var(--mb-line)',
        borderRadius: '4px 16px 16px 16px', padding: '13px 16px',
      }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[0, 150, 300].map(d => (
            <span key={d} style={{
              width: 6, height: 6, borderRadius: 99,
              background: 'var(--mb-mut)',
              animation: `bounce 1.2s ease-in-out ${d}ms infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [view, setView] = useState<'menu' | 'chat'>('menu');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch restaurant + menu
  useEffect(() => {
    async function load() {
      const [rRes, mRes] = await Promise.all([
        fetch(`/api/restaurant/${slug}`),
        fetch(`/api/menu/${slug}`),
      ]);
      const r = rRes.ok ? await rRes.json() as Restaurant : { name: 'MenuBot', description: '' };
      const m = mRes.ok ? await mRes.json() as MenuData : { categories: {} };
      setRestaurant(r);
      setMenuData(m);
      setDataLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const openChat = useCallback((dish?: MenuDish) => {
    setView('chat');
    if (messages.length === 0) {
      // Initial greeting
      const greeting = restaurant
        ? `Hola, soy el asistente de carta de **${restaurant.name}**. ¿En qué te puedo ayudar? Puedes preguntarme sobre cualquier plato, ingredientes o recomendaciones. 😊`
        : '¡Hola! Soy el asistente de carta. ¿En qué te puedo ayudar?';
      const init: Message[] = [{ role: 'assistant', content: greeting }];
      if (dish) init.push({ role: 'assistant', content: buildDishMessage(dish) });
      setMessages(init);
    } else if (dish) {
      setMessages(m => [...m, { role: 'assistant', content: buildDishMessage(dish) }]);
    }
  }, [messages.length, restaurant]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    if (!overrideText) setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, restaurantSlug: slug }),
      });
      const data = await res.json() as { message: string; error?: string };
      setMessages(m => [...m, { role: 'assistant', content: data.message || data.error || 'Error al responder.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Hubo un error. Por favor intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, slug]);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  if (dataLoading) {
    return (
      <div data-theme="dark" style={{ minHeight: '100vh', background: 'var(--mb-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 150, 300].map(d => (
            <span key={d} style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', animation: `bounce 1.2s ease-in-out ${d}ms infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── MENU SCREEN ─────────────────────────────────────────────────────────── */
  if (view === 'menu') {
    return (
      <div data-theme="dark" style={{ minHeight: '100vh', background: 'var(--mb-bg)' }}>
        {/* Back to home (minimal) */}
        <Link
          href="/"
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 50,
            width: 32, height: 32, borderRadius: 999,
            background: 'var(--mb-surface)', border: '1px solid var(--mb-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--mb-mut)', textDecoration: 'none',
          }}
          aria-label="Inicio"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>

        <MenuScreen
          restaurantName={restaurant?.name ?? ''}
          cuisine={restaurant?.description ?? ''}
          categories={menuData?.categories ?? {}}
          onAsk={openChat}
        />
      </div>
    );
  }

  /* ── CHAT SCREEN ─────────────────────────────────────────────────────────── */
  return (
    <div
      data-theme="dark"
      style={{
        height: '100svh', display: 'flex', flexDirection: 'column',
        background: 'var(--mb-bg)', maxWidth: 460, margin: '0 auto',
      }}
    >
      {/* Chat header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--mb-line)',
        background: 'var(--mb-head-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 5,
        flexShrink: 0,
      }}>
        <button
          onClick={() => setView('menu')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--mb-mut)', display: 'flex' }}
          aria-label="Volver a la carta"
        >
          <svg width="13" height="18" viewBox="0 0 13 18" fill="none">
            <path d="M11 1.5L3.5 9 11 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-space-grotesk, system-ui)',
            fontWeight: 600, fontSize: 15.5, letterSpacing: '-0.02em',
            color: 'var(--mb-ink)', lineHeight: 1.2,
          }}>
            {restaurant?.name}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginTop: 2,
            fontFamily: 'var(--font-archivo, system-ui)', fontSize: 11.5, color: 'var(--mb-mut)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#5BBF7B' }} />
            Carta digital · con menubot<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        <button
          onClick={() => setView('menu')}
          style={{
            background: 'var(--mb-surface)', border: '1px solid var(--mb-line)',
            borderRadius: 999, padding: '6px 12px',
            fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12, fontWeight: 600,
            color: 'var(--accent)', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Ver carta
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, i) => <ChatBubble key={i} message={msg.content} role={msg.role} />)}
        {loading && <LoadingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 14px 20px', borderTop: '1px solid var(--mb-line)',
        background: 'var(--mb-bg)', display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, height: 44, borderRadius: 999,
          background: 'var(--mb-surface)', border: '1px solid var(--mb-line)',
          display: 'flex', alignItems: 'center', overflow: 'hidden',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Escribe tu pregunta…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              padding: '0 16px',
              fontFamily: 'var(--font-archivo, system-ui)', fontSize: 14,
              color: 'var(--mb-ink)',
            }}
          />
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: 999, border: 'none',
            background: input.trim() && !loading ? 'var(--accent)' : 'var(--mb-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            boxShadow: input.trim() && !loading ? '0 4px 12px rgba(199,107,67,0.4)' : 'none',
            flexShrink: 0,
          }}
          aria-label="Enviar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 15V3M9 3L3.5 8.5M9 3l5.5 5.5" stroke={input.trim() && !loading ? '#fff' : 'var(--mb-mut)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
