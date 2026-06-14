'use client';

import { LogoIcon } from '@/components/brand/Wordmark';

export interface ChatBubbleProps {
  message: string;
  role: 'user' | 'assistant';
}

/**
 * Minimal, dependency-free renderer for the lightweight markdown the assistant
 * emits: **bold** spans and `---` dividers. Newlines are preserved via the
 * container's `white-space: pre-wrap`, so no explicit <br/> handling is needed.
 */
function renderContent(message: string) {
  const parts = message.split(/(\*\*[^*]+\*\*|\s*-{3,}\s*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    if (/^\s*-{3,}\s*$/.test(part)) {
      return <span key={i} style={{ display: 'block', height: 1, background: 'currentColor', opacity: 0.18, margin: '10px 0' }} />;
    }
    return part;
  });
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
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {renderContent(message)}
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
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {renderContent(message)}
      </div>
    </div>
  );
}
