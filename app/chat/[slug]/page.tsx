'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { MenuScreen, type MenuDish } from '@/components/customer/MenuScreen';
import { BillSplitter } from '@/components/customer/BillSplitter';
import { ReviewModal } from '@/components/customer/ReviewModal';
import type { Socials } from '@/components/customer/SocialLinks';
import { LogoIcon } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatPrice } from '@/lib/menu';
import { t } from '@/lib/i18n';
import { resolveLang, DEFAULT_LANG, type LangCode } from '@/lib/languages';
import Link from 'next/link';

interface Message { role: 'user' | 'assistant'; content: string; }
interface Restaurant { name: string; description: string; socials?: Socials | null; reviewsEnabled?: boolean; }
interface MenuData { categories: Record<string, MenuDish[]> }

const SUGGESTION_KEYS = ['sugg1', 'sugg2', 'sugg3', 'sugg4'];

function buildDishMessage(dish: MenuDish, lang: LangCode): string {
  const parts = [`**${dish.name}**`];
  if (dish.price) parts.push(`— ${formatPrice(dish.price)}`);
  if (dish.description) parts.push(`\n${dish.description}`);
  if (dish.allergens && dish.allergens !== 'ninguno') parts.push(`\n⚠️ ${t(lang, 'contains')}: ${dish.allergens}`);
  return parts.join(' ');
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
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

/** Welcoming empty state with tappable suggested questions */
function ChatWelcome({ restaurantName, onSuggest, lang }: { restaurantName: string; onSuggest: (text: string) => void; lang: LangCode }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '24px 20px', gap: 0,
    }}>
      <LogoIcon size={46} />
      <h2 style={{
        fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 700, fontSize: 19,
        letterSpacing: '-0.02em', color: 'var(--mb-ink)', margin: '16px 0 0',
      }}>
        {t(lang, 'welcomeTitle')}
      </h2>
      <p style={{
        fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13.5, lineHeight: 1.5,
        color: 'var(--mb-mut)', margin: '8px 0 0', maxWidth: 320,
      }}>
        {t(lang, 'welcomeSubtitle', { name: restaurantName || 'menubot' })}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 22, maxWidth: 380 }}>
        {SUGGESTION_KEYS.map(key => {
          const label = t(lang, key);
          return (
          <button
            key={key}
            onClick={() => onSuggest(label)}
            className="mb-suggest"
            style={{
              fontFamily: 'var(--font-archivo, system-ui)', fontSize: 13, fontWeight: 600,
              color: 'var(--mb-ink)', background: 'var(--mb-surface)',
              border: '1px solid var(--mb-line)', borderRadius: 999,
              padding: '9px 15px', cursor: 'pointer',
            }}
          >
            {label}
          </button>
          );
        })}
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
  onSuggest,
  onKeyDown,
  bottomRef,
  onBack,
  showBack,
  lang,
}: {
  restaurantName: string;
  messages: Message[];
  loading: boolean;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onSuggest: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onBack?: () => void;
  showBack?: boolean;
  lang: LangCode;
}) {
  const canSend = !!input.trim() && !loading;
  const isEmpty = messages.length === 0 && !loading;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 13px',
        borderBottom: '1px solid var(--mb-line)',
        background: 'var(--mb-head-bg)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        {showBack && onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--mb-mut)', display: 'flex' }} aria-label={t(lang, 'back')}>
            <svg width="13" height="18" viewBox="0 0 13 18" fill="none">
              <path d="M11 1.5L3.5 9 11 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <LogoIcon size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-space-grotesk, system-ui)', fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--mb-ink)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t(lang, 'assistant')} · {restaurantName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, fontFamily: 'var(--font-archivo, system-ui)', fontSize: 11.5, color: 'var(--mb-mut)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#5BBF7B', flexShrink: 0 }} />
            {t(lang, 'online')} · {t(lang, 'withMenubot')}<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <ThemeToggle />
          {!showBack && (
            <Link href="/" style={{ color: 'var(--mb-mut)', display: 'flex', textDecoration: 'none' }} aria-label="Inicio">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="mb-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {isEmpty ? (
          <ChatWelcome restaurantName={restaurantName} onSuggest={onSuggest} lang={lang} />
        ) : (
          <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '18px 16px 10px' }}>
            {messages.map((msg, i) => <ChatBubble key={i} message={msg.content} role={msg.role} />)}
            {loading && <LoadingDots />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--mb-line)', background: 'var(--mb-bg)', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 46, borderRadius: 999, background: 'var(--mb-surface)', border: '1px solid var(--mb-line)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <input
              type="text" value={input} onChange={e => onInput(e.target.value)} onKeyDown={onKeyDown} disabled={loading}
              placeholder={t(lang, 'inputPlaceholder')}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '0 18px', fontFamily: 'var(--font-archivo, system-ui)', fontSize: 14, color: 'var(--mb-ink)' }}
            />
          </div>
          <button
            onClick={onSend} disabled={!canSend}
            className="mb-send"
            style={{
              width: 46, height: 46, borderRadius: 999, border: 'none', flexShrink: 0, cursor: canSend ? 'pointer' : 'default',
              background: canSend ? 'var(--accent)' : 'var(--mb-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: canSend ? 'var(--shadow-accent)' : 'none',
            }}
            aria-label="Enviar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 15V3M9 3L3.5 8.5M9 3l5.5 5.5" stroke={canSend ? '#fff' : 'var(--mb-mut)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
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
  const [showBill, setShowBill] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<number | null>(null);
  // Detect the diner's language once (saved choice → browser locale → Spanish).
  // The loading spinner renders first, so no hydration mismatch on language.
  const [lang, setLang] = useState<LangCode>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    try { return resolveLang(localStorage.getItem('menubot_lang') ?? navigator.language); } catch { return DEFAULT_LANG; }
  });
  const changeLang = useCallback((l: LangCode) => {
    setLang(l);
    try { localStorage.setItem('menubot_lang', l); } catch { /* ignore */ }
  }, []);
  const sessionIdRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Loads restaurant + menu, and refetches the menu (translated) when the
  // diner changes language. Inlined so setState runs only after the await.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [rRes, mRes] = await Promise.all([
        fetch(`/api/restaurant/${slug}`),
        fetch(`/api/menu/${slug}?lang=${lang}`),
      ]);
      if (cancelled) return;
      const r = rRes.ok ? await rRes.json() as Restaurant : { name: 'menubot.', description: '' };
      const m = mRes.ok ? await mRes.json() as MenuData : { categories: {} };
      setRestaurant(r);
      setMenuData(m);
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, lang]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const askAssistant = useCallback(async (text: string, history: Message[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, restaurantSlug: slug, sessionId: sessionIdRef.current, lang }),
      });
      const data = await res.json() as { message: string; sessionId?: number | null; error?: string };
      if (data.sessionId) sessionIdRef.current = data.sessionId;
      setMessages(m => [...m, { role: 'assistant', content: data.message || data.error || t(lang, 'errorReply') }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: t(lang, 'errorReply') }]);
    } finally {
      setLoading(false);
    }
  }, [slug, lang]);

  const sendMessage = useCallback((override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    setMobileView('chat');
    const history: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setInput('');
    askAssistant(text, history);
  }, [input, loading, messages, askAssistant]);

  const handleDishSelect = useCallback((dish?: MenuDish) => {
    setMobileView('chat');
    if (dish) {
      setMessages(prev => [...prev, { role: 'assistant', content: buildDishMessage(dish, lang) }]);
    }
    // No dish → just open the chat (welcome state handles the rest)
  }, [lang]);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  if (dataLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--mb-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    socials: restaurant?.socials ?? null,
    onSplitBill: () => setShowBill(true),
    onReview: restaurant?.reviewsEnabled ? () => { setReviewSessionId(sessionIdRef.current); setShowReview(true); } : undefined,
    lang,
    onLang: changeLang,
  };

  const allDishes = Object.values(menuData?.categories ?? {}).flat();

  const chatProps = {
    restaurantName: restaurant?.name ?? '',
    messages,
    loading,
    input,
    onInput: setInput,
    onSend: () => sendMessage(),
    onSuggest: (text: string) => sendMessage(text),
    onKeyDown: handleKey,
    bottomRef,
    lang,
  };

  return (
    <div style={{ height: '100svh', background: 'var(--mb-bg)', display: 'flex', flexDirection: 'column' }}>
      {showBill && <BillSplitter dishes={allDishes} onClose={() => setShowBill(false)} lang={lang} />}
      {showReview && <ReviewModal slug={slug} sessionId={reviewSessionId} onClose={() => setShowReview(false)} lang={lang} />}

      {/* ── DESKTOP / TABLET: side by side ── */}
      <div
        className="hidden sm:flex"
        style={{ flex: 1, minHeight: 0, maxWidth: 1100, margin: '0 auto', width: '100%' }}
      >
        {/* Menu — left panel, scrollable */}
        <div className="mb-scroll" style={{ width: 384, flexShrink: 0, borderRight: '1px solid var(--mb-line)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <MenuScreen {...menuProps} showFloatingButton={false} sidebar={true} />
        </div>

        {/* Chat — right panel, fills remaining space */}
        <ChatPanel {...chatProps} showBack={false} />
      </div>

      {/* ── MOBILE: toggle menu / chat ── */}
      <div className="sm:hidden flex flex-col" style={{ flex: 1, minHeight: 0 }}>
        {mobileView === 'menu' ? (
          <div className="mb-scroll" style={{ flex: 1, overflowY: 'auto' }}>
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
