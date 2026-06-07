'use client';

import { LogoIcon } from '@/components/brand/Wordmark';

export interface ChatBubbleProps {
  message: string;
  role: 'user' | 'assistant';
}

export function ChatBubble({ message, role }: ChatBubbleProps) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{
          maxWidth: '82%',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: '16px 16px 4px 16px',
          padding: '11px 15px',
          fontFamily: 'var(--font-archivo, system-ui)',
          fontSize: 14, lineHeight: 1.45, fontWeight: 500,
        }}>
          {message}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, maxWidth: '88%' }}>
      <LogoIcon size={28} />
      <div style={{
        background: 'var(--mb-surface)',
        border: '1px solid var(--mb-line)',
        borderRadius: '4px 16px 16px 16px',
        padding: '11px 14px',
        fontFamily: 'var(--font-archivo, system-ui)',
        fontSize: 14, lineHeight: 1.5,
        color: 'var(--mb-ink)',
      }}>
        {message}
      </div>
    </div>
  );
}
