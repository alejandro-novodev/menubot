'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { MenuPanel, type Dish } from '@/components/MenuPanel';
import { DishDetail } from '@/components/DishDetail';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Restaurant {
  name: string;
  description: string;
}

function LoadingDots() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="flex-none w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border border-white/10 flex items-center justify-center text-base shrink-0">
        🍜
      </div>
      <div className="bg-gray-800 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3.5 shadow-sm">
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export default function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Open panel by default on desktop after mount
  useEffect(() => {
    if (window.innerWidth >= 640) setPanelOpen(true);
  }, []);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/restaurant/${slug}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json() as Restaurant;
        setRestaurant(data);
        setMessages([{
          role: 'assistant',
          content: `¡Bienvenido/a a ${data.name}! 👋\n\nPuedes explorar la carta completa en el panel derecho — toca cualquier plato para ver ingredientes, alérgenos y precio.\n\nSi tienes alguna duda, quieres una recomendación o necesitas saber si algo lleva gluten, mariscos u otro alérgeno, pregúntame aquí directamente. Estoy para ayudarte a elegir bien. 🍽️`,
        }]);
      } catch {
        setRestaurant({ name: 'MenuBot', description: '' });
        setMessages([{ role: 'assistant', content: '¡Hola! Soy el asistente de carta. ¿En qué te puedo ayudar?' }]);
      } finally {
        setRestaurantLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      setMessages([...newMessages, { role: 'assistant', content: data.message || data.error || 'Error al responder.' }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Hubo un error. Por favor intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, slug]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleSelectDish(dish: Dish) {
    setSelectedDish(dish);
  }

  function handleAskDish(dish: Dish) {
    setSelectedDish(null);
    if (window.innerWidth < 640) setPanelOpen(false);
    sendMessage(`¿Qué es ${dish.name}? Cuéntame sobre este plato.`);
  }

  if (restaurantLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* ── Chat column ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex-none bg-gray-900/90 backdrop-blur-md border-b border-white/5 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition shrink-0" aria-label="Volver al inicio">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-lg shadow-md shadow-purple-900/40 shrink-0">
              🍜
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-white truncate">{restaurant?.name}</h1>
                <span className="flex items-center gap-1 text-xs text-emerald-400 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  en línea
                </span>
              </div>
              {restaurant?.description && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{restaurant.description}</p>
              )}
            </div>
            {/* Carta toggle */}
            <button
              onClick={() => setPanelOpen(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 border ${
                panelOpen
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Ver carta"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {panelOpen
                  ? <path d="M18 6L6 18M6 6l12 12" />
                  : <><path d="M3 12h18M3 6h18M3 18h18" /></>}
              </svg>
              <span className="hidden sm:inline">Carta</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-5">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg.content} role={msg.role} />
            ))}
            {loading && <LoadingDots />}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Input */}
        <footer className="flex-none bg-gray-900/90 backdrop-blur-md border-t border-white/5 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <input
              type="text"
              className="flex-1 bg-gray-800/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 flex items-center justify-center text-white transition-all shrink-0 shadow-md shadow-purple-900/30"
              aria-label="Enviar"
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            Un producto de <span className="text-gray-500">Novodev SPA</span>
          </p>
        </footer>
      </div>

      {/* ── Menu panel ── */}
      <MenuPanel
        slug={slug}
        isOpen={panelOpen}
        onToggle={() => setPanelOpen(p => !p)}
        onSelectDish={handleSelectDish}
      />

      {/* ── Dish detail overlay ── */}
      {selectedDish && (
        <DishDetail
          dish={selectedDish}
          onAsk={handleAskDish}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </div>
  );
}
