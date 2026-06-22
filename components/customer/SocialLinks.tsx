'use client';

import { t } from '@/lib/i18n';
import type { LangCode } from '@/lib/languages';

export interface Socials {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  tripadvisor?: string | null;
  website?: string | null;
}

const ICONS: Record<keyof Socials, { label: string; path: React.ReactNode }> = {
  instagram: {
    label: 'Instagram',
    path: <><rect x="2" y="2" width="20" height="20" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" /></>,
  },
  facebook: {
    label: 'Facebook',
    path: <path d="M14.5 8.5h2V5.6h-2.4c-2 0-3.1 1.2-3.1 3.2v1.7H9v2.9h2v6.1h3v-6.1h2.2l.4-2.9H14v-1.3c0-.5.2-.7.7-.7Z" fill="currentColor" stroke="none" />,
  },
  tiktok: {
    label: 'TikTok',
    path: <path d="M14 3.5c.3 2.1 1.6 3.4 3.8 3.6v2.6c-1.3.1-2.5-.3-3.6-1v4.9c0 3.1-2.3 5.1-5 4.8-2.3-.2-3.9-2-3.8-4.3.1-2.3 2-3.9 4.3-3.7v2.7c-1-.2-1.9.3-2 1.3-.1.9.5 1.6 1.4 1.6 1 .1 1.7-.6 1.7-1.7V3.5H14Z" fill="currentColor" stroke="none" />,
  },
  whatsapp: {
    label: 'WhatsApp',
    path: <path d="M12 3.8a8 8 0 0 0-6.9 12l-1.1 4 4.1-1.1A8 8 0 1 0 12 3.8Zm4.3 11c-.2.5-1 1-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.2-.9-3.5-3.1-3.6-3.3-.1-.1-.9-1.2-.9-2.2 0-1.1.6-1.6.8-1.8.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4l.7 1.6c0 .2.1.3 0 .4l-.3.5-.3.3c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.3.1.4-.1l.6-.7c.2-.2.3-.2.5-.1l1.5.8c.2.1.4.2.4.3.1.1.1.5-.1 1Z" fill="currentColor" stroke="none" />,
  },
  tripadvisor: {
    label: 'TripAdvisor',
    path: <><circle cx="7.5" cy="13" r="3" /><circle cx="16.5" cy="13" r="3" /><path d="M7.5 13h.01M16.5 13h.01M4.5 9.5c4-2.5 11-2.5 15 0" /></>,
  },
  website: {
    label: 'Sitio web',
    path: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 2.5 15 0 18M12 3c-2.5 2.7-2.5 15 0 18" /></>,
  },
};

const ORDER: (keyof Socials)[] = ['instagram', 'facebook', 'tiktok', 'whatsapp', 'website', 'tripadvisor'];

export function SocialLinks({ socials, lang = 'es' }: { socials?: Socials | null; lang?: LangCode }) {
  if (!socials) return null;
  const present = ORDER.filter((k) => socials[k]);
  if (present.length === 0) return null;

  const hasReview = !!socials.tripadvisor;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '22px 20px 26px', borderTop: '1px solid var(--mb-line)', marginTop: 8,
    }}>
      <span style={{ fontFamily: 'var(--font-archivo, system-ui)', fontSize: 12, color: 'var(--mb-mut)' }}>
        {hasReview ? t(lang, 'followReview') : t(lang, 'follow')}
      </span>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {present.map((k) => (
          <a
            key={k}
            href={socials[k] as string}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={ICONS[k].label}
            title={ICONS[k].label}
            className="mb-social"
            style={{
              width: 40, height: 40, borderRadius: 999,
              border: '1px solid var(--mb-line)', background: 'var(--mb-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--mb-mut)', textDecoration: 'none',
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[k].path}
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
