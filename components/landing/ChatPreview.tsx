import Link from 'next/link';
import { LogoIcon } from '@/components/brand/Wordmark';

const MESSAGES = [
  { role: 'assistant', text: '¡Hola! Soy el asistente de carta de Izakaya Nami. ¿En qué te puedo ayudar? 😊' },
  { role: 'user', text: '¿Qué me recomiendas para empezar?' },
  { role: 'assistant', text: 'Te recomiendo el Karaage — pollo frito crocante marinado en soya y jengibre. ¡Es uno de los favoritos! ¿Tienes alguna preferencia o restricción alimentaria?' },
  { role: 'user', text: '¿El Takoyaki tiene mariscos?' },
  { role: 'assistant', text: 'Sí, el Takoyaki lleva pulpo, así que contiene mariscos. Si prefieres evitarlos, el Karaage o el Edamame son excelentes opciones 🦑' },
];

export function ChatPreview() {
  return (
    <div className="relative max-w-sm mx-auto">
      {/* Phone frame */}
      <div className="rounded-2xl border border-white/10 bg-[#241F1B] shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="bg-[#241F1B] border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <LogoIcon size={34} />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-none tracking-tight">Izakaya Nami</p>
            <p className="text-white/55 text-[11px] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5BBF7B] inline-block" />
              En línea · con menubot<span className="text-accent">.</span>
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="px-3 py-4 space-y-3 bg-[#1A1613]">
          {MESSAGES.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && <LogoIcon size={24} />}
                <div
                  className={`max-w-[80%] text-xs px-3 py-2 leading-relaxed ${
                    isUser
                      ? 'bg-accent text-white rounded-[16px_16px_4px_16px] font-medium'
                      : 'bg-[#2E2823] text-white/85 rounded-[4px_16px_16px_16px] border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input bar */}
        <div className="bg-[#241F1B] border-t border-white/5 px-3 py-2.5 flex items-center gap-2">
          <div className="flex-1 bg-[#2E2823] rounded-full px-4 py-2 text-xs text-white/40 border border-white/5">
            Escribe tu pregunta…
          </div>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(199,107,67,0.4)]">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 15V3M9 3L3.5 8.5M9 3l5.5 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl -z-10" />

      <div className="mt-6 text-center">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-lite transition font-medium"
        >
          Explorar demo completa →
        </Link>
      </div>
    </div>
  );
}
