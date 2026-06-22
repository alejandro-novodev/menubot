// Supported diner languages. Spanish is the source/default; the rest are
// offered to tourists. Adding a language = one entry here (chat + menu
// translation are dynamic). UI strings (lib/i18n) currently cover es/en/pt.

export type LangCode = 'es' | 'en' | 'pt';

export interface Language {
  code: LangCode;
  /** Native label shown in the picker. */
  label: string;
  flag: string;
  /** How to name the language to the AI ("respond in …"). */
  aiName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'es', label: 'Español', flag: '🇨🇱', aiName: 'español chileno' },
  { code: 'en', label: 'English', flag: '🇬🇧', aiName: 'English' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', aiName: 'português do Brasil' },
];

export const DEFAULT_LANG: LangCode = 'es';

const CODES = new Set(LANGUAGES.map((l) => l.code));

/** Normalize any input (e.g. 'en-US', 'PT', null) to a supported code. */
export function resolveLang(input?: string | null): LangCode {
  const base = (input ?? '').toLowerCase().split('-')[0];
  return CODES.has(base as LangCode) ? (base as LangCode) : DEFAULT_LANG;
}

export function aiNameFor(code: LangCode): string {
  return LANGUAGES.find((l) => l.code === code)?.aiName ?? LANGUAGES[0].aiName;
}
