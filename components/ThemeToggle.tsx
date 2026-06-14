'use client';

import { useTheme } from '@/components/ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className={`flex items-center justify-center transition ${className}`}
      style={{
        width: 34, height: 34, borderRadius: 999,
        border: '1px solid var(--mb-line)',
        background: 'var(--mb-surface)',
        color: 'var(--mb-ink)',
        cursor: 'pointer',
        fontSize: 16,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
