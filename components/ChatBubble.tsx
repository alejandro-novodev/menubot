'use client';

interface ChatBubbleProps {
  message: string;
  role: 'user' | 'assistant';
}

export function ChatBubble({ message, role }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-purple-700'
            : 'bg-gradient-to-br from-gray-600 to-gray-800 border border-white/10'
        }`}
      >
        {isUser ? '👤' : '🍜'}
      </div>

      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-none'
            : 'bg-gray-800 text-gray-100 rounded-bl-none border border-white/5'
        }`}
      >
        {message}
      </div>
    </div>
  );
}
