import Link from 'next/link';

const MESSAGES = [
  { role: 'assistant', text: '¡Hola! Soy el asistente de carta de Izakaya Nami. ¿En qué te puedo ayudar? 😊' },
  { role: 'user', text: '¿Qué me recomiendas para empezar?' },
  { role: 'assistant', text: 'Te recomiendo el Karaage — pollo frito crocante marinado en soya y jengibre. ¡Es uno de los favoritos! También el Gyoza está muy bueno. ¿Tienes alguna preferencia o restricción alimentaria?' },
  { role: 'user', text: '¿El Takoyaki tiene mariscos?' },
  { role: 'assistant', text: 'Sí, el Takoyaki lleva pulpo, así que contiene mariscos. Si prefieres evitar mariscos, el Karaage o el Edamame son excelentes opciones sin ese ingrediente 🦑' },
];

export function ChatPreview() {
  return (
    <div className="relative max-w-sm mx-auto">
      {/* Phone frame */}
      <div className="rounded-2xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 border-b border-white/5 px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-base shrink-0">
            🍜
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-none">Izakaya Nami</p>
            <p className="text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              en línea
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="px-3 py-4 space-y-3 bg-gray-950">
          {MESSAGES.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} className={`flex items-end gap-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs shrink-0">
                    🍜
                  </div>
                )}
                <div
                  className={`max-w-[82%] text-xs px-3 py-2 rounded-xl leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-200 rounded-bl-none border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input bar */}
        <div className="bg-gray-900 border-t border-white/5 px-3 py-2.5 flex items-center gap-2">
          <div className="flex-1 bg-gray-800/70 rounded-lg px-3 py-1.5 text-xs text-gray-500 border border-white/5">
            Escribe tu pregunta...
          </div>
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-purple-600/5 rounded-3xl blur-2xl -z-10" />

      <div className="mt-6 text-center">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition font-medium"
        >
          Explorar demo completa →
        </Link>
      </div>
    </div>
  );
}
