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
  if (dish.allergens && dish.allergens !== 'ninguno') parts.push(`\n⚠️ Contiene: ${dish.allergens}`);
  return parts.join(' ');
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
      <LogoIcon size={28} />
      <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-line)', borderRadius: '4px 16px 16px 16px', padding: '13px 16px' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 150, 300].map(d => (
            <span key={d} style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--mb-mut)', display: 'inline-block', animation: `bounce 1.2s ease-in-out ${d}ms infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Chat panel — shared between mobile and desktop views */
function ChatPanel({
  restaurantName,
  messages,
  loading,
  input,
  onInput,
  onSend,
  onKeyDown,
  bottomRef,
  onBack,
  showBack,
}: {
  restaurantName: string;
  messages: Message[];
  loading: boolean;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onBack?: () => void;
  showBack?: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--mb-line)',
        background: 'var(--mb-head-bg)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        {showBack && onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--mb-mut)', display: 'flex' }} aria-label="Volver">
            <svg width="13" height="18" viewBox="0 0 13 18" fill="none">
              <path d="M11 1.5L3.5 9 11 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 600, fontSize: 15.5, letterSpacing: '-0.02em', color: 'var(--mb-ink)', lineHeight: 1.2 }}>
            {restaurantName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, fontFamily: 'var(--font-archivo, system-ui)', fontSize: 11.5, color: 'var(--mb-mut)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#5BBF7B' }} />
            Asistente de carta · con menubot<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        {!showBack && (
          <Link href="/" style={{ color: 'var(--mb-mut)', display: 'flex', textDecoration: 'none' }} aria-label="Inicio">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--mb-mut)', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13 }}>
            Selecciona un plato de la carta o escribe tu pregunta.
          </div>
        )}
        {messages.map((msg, i) => <ChatBubble key={i} message={msg.content} role={msg.role} />)}
        {loading && <LoadingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px 16px', borderTop: '1px solid var(--mb-line)', background: 'var(--mb-bg)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, height: 44, borderRadius: 999, background: 'var(--mb-surface)', border: '1px solid var(--mb-line)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <input
            type="text" value={input} onChange={e => onInput(e.target.value)} onKeyDown={onKeyDown} disabled={loading}
            placeholder="Escribe tu pregunta…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '0 16px', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 14, color: 'var(--mb-ink)' }}
          />
        </div>
        <button
          onClick={onSend} disabled={loading || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: 999, border: 'none', flexShrink: 0, cursor: input.trim() ? 'pointer' : 'default',
            background: input.trim() && !loading ? 'var(--accent)' : 'var(--mb-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: input.trim() && !loading ? '0 4px 12px rgba(199,107,67,0.4)' : 'none',
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

export default function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [mobileView, setMobileView] = useState<'menu' | 'chat'>('menu');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [rRes, mRes] = await Promise.all([
        fetch(`/api/restaurant/${slug}`),
        fetch(`/api/menu/${slug}`),
      ]);
      const r = rRes.ok ? await rRes.json() as Restaurant : { name: 'menubot.', description: '' };
      const m = mRes.ok ? await mRes.json() as MenuData : { categories: {} };
      setRestaurant(r);
      setMenuData(m);
      setDataLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleDishSelect = useCallback((dish?: MenuDish) => {
    // On mobile: switch to chat view
    setMobileView('chat');

    if (dish) {
      const dishMsg: Message = { role: 'assistant', content: buildDishMessage(dish) };
      setMessages(prev => {
        const withGreeting = prev.length === 0 && restaurant
          ? [{ role: 'assistant' as const, content: `Hola, soy el asistente de carta de **${restaurant.name}**. Selecciona cualquier plato o escríbeme. 😊` }]
          : prev;
        return [...withGreeting, dishMsg];
      });
    } else {
      // Open chat without dish context
      setMessages(prev => prev.length === 0 && restaurant
        ? [{ role: 'assistant' as const, content: `Hola, soy el asistente de carta de **${restaurant.name}**. ¿En qué te puedo ayudar? Puedes preguntarme sobre cualquier plato, ingredientes o recomendaciones. 😊` }]
        : prev
      );
    }
  }, [restaurant]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
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
            <span key={d} style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', display: 'inline-block', animation: `bounce 1.2s ease-in-out ${d}ms infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  const menuProps = {
    restaurantName: restaurant?.name ?? '',
    cuisine: restaurant?.description ?? '',
    categories: menuData?.categories ?? {},
    onAsk: handleDishSelect,
  };

  const chatProps = {
    restaurantName: restaurant?.name ?? '',
    messages,
    loading,
    input,
    onInput: setInput,
    onSend: sendMessage,
    onKeyDown: handleKey,
    bottomRef,
  };

  return (
    <div data-theme="dark" style={{ height: '100svh', background: 'var(--mb-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── DESKTOP / TABLET: side by side ── */}
      <div
        className="hidden sm:flex"
        style={{ flex: 1, minHeight: 0, maxWidth: 1024, margin: '0 auto', width: '100%' }}
      >
        {/* Menu — left panel, scrollable */}
        <div style={{ width: 340, flexShrink: 0, borderRight: '1px solid var(--mb-line)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <MenuScreen {...menuProps} showFloatingButton={false} sidebar={true} />
        </div>

        {/* Chat — right panel, fills remaining space */}
        <ChatPanel {...chatProps} showBack={false} />
      </div>

      {/* ── MOBILE: toggle menu / chat ── */}
      <div className="sm:hidden" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {mobileView === 'menu' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <MenuScreen {...menuProps} showFloatingButton={true} />
          </div>
        ) : (
          <ChatPanel
            {...chatProps}
            showBack={true}
            onBack={() => setMobileView('menu')}
          />
        )}
      </div>
    </div>
  );
}
