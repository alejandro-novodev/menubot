interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export function Wordmark({ size = 'md', className = '' }: WordmarkProps) {
  return (
    <span
      className={`${SIZES[size]} font-semibold tracking-[-0.035em] ${className}`}
      style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)' }}
    >
      menubot<span style={{ color: 'var(--accent)' }}>.</span>
    </span>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  const radius = Math.round(size * 0.22);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'var(--accent)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)',
        fontWeight: 600,
        fontSize: size * 0.44,
        letterSpacing: '-0.04em',
        color: '#fff',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      m<span style={{ color: 'var(--mb-bg, #1A1613)' }}>.</span>
    </span>
  );
}
