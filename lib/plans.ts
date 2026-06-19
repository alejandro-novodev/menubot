// Central source of truth for the subscription plans. All prices are in CLP,
// NET (before 19% IVA). Used by the pricing page, billing, and as the reference
// for feature gating (see lib/plan-features.ts).

export type Plan = 'starter' | 'pro' | 'multi' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_ORDER: Plan[] = ['starter', 'pro', 'multi', 'enterprise'];

/** 19% IVA, applied on top of the net prices below. */
export const IVA_RATE = 0.19;

/** Annual billing charges 10 months (2 months free). */
export const ANNUAL_MONTHS_BILLED = 10;

export interface PlanFeatureLine {
  text: string;
  included: boolean;
}

export interface PlanConfig {
  id: Plan;
  name: string;
  /** Target customer, shown as a subtitle on the pricing card. */
  subtitle: string;
  /** Net monthly price in CLP, or null for custom (Enterprise). */
  priceClp: number | null;
  /** Branches included in the base price. */
  includedBranches: number;
  /** Price per extra branch beyond the included limit, or null if N/A. */
  extraBranchClp: number | null;
  /** Whether to highlight this plan ("Más popular"). */
  featured?: boolean;
  /** 'self-serve' → Flow checkout; 'contact' → contact sales (Enterprise). */
  ctaType: 'self-serve' | 'contact';
  /** Feature lines for the pricing display (included ✓ / not included ✗). */
  features: PlanFeatureLine[];
}

export const PLANS: Record<Plan, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Para un local que está partiendo.',
    priceClp: 9990,
    includedBranches: 1,
    extraBranchClp: null,
    ctaType: 'self-serve',
    features: [
      { text: '1 sucursal', included: true },
      { text: 'Chat de carta integrado', included: true },
      { text: 'Código QR por mesa', included: true },
      { text: 'Actualización de menú', included: true },
      { text: 'Analytics básico', included: true },
      { text: 'Dividir cuenta (calculadora)', included: true },
      { text: 'Reseñas de clientes', included: false },
      { text: 'Marca personalizada', included: false },
      { text: 'Multi-sucursal', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Para locales que quieren crecer.',
    priceClp: 24990,
    includedBranches: 1,
    extraBranchClp: null,
    featured: true,
    ctaType: 'self-serve',
    features: [
      { text: 'Todo lo de Starter', included: true },
      { text: 'Reseñas de clientes y respuestas', included: true },
      { text: 'Marca personalizada (logo, colores)', included: true },
      { text: 'Analytics avanzado', included: true },
      { text: 'Dividir cuenta interactiva', included: true },
      { text: 'Alertas por email', included: true },
      { text: 'Multi-sucursal', included: false },
      { text: 'API y webhooks', included: false },
    ],
  },
  multi: {
    id: 'multi',
    name: 'Multi',
    subtitle: 'Para cadenas y grupos gastronómicos.',
    priceClp: 59990,
    includedBranches: 5,
    extraBranchClp: 8990,
    ctaType: 'self-serve',
    features: [
      { text: 'Todo lo de Pro', included: true },
      { text: 'Hasta 5 sucursales', included: true },
      { text: 'Panel multi-sucursal', included: true },
      { text: 'Reseñas y analytics por sucursal', included: true },
      { text: 'Menús diferenciados por sucursal', included: true },
      { text: 'Reportes consolidados', included: true },
      { text: 'Exportar reseñas y analytics (CSV/PDF)', included: true },
      { text: 'API y webhooks', included: false },
      { text: 'SLA dedicado', included: false },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Para operaciones grandes y franquicias.',
    priceClp: null,
    includedBranches: 5,
    extraBranchClp: null,
    ctaType: 'contact',
    features: [
      { text: 'Todo lo de Multi', included: true },
      { text: '5+ sucursales', included: true },
      { text: 'API REST + webhooks', included: true },
      { text: 'SSO y usuarios ilimitados', included: true },
      { text: 'Integraciones POS / delivery', included: true },
      { text: 'SLA garantizado', included: true },
      { text: 'Onboarding dedicado', included: true },
      { text: 'Facturación anual (2 meses gratis)', included: true },
      { text: 'Opción marca blanca', included: true },
    ],
  },
};

export function getPlan(plan: string | null | undefined): PlanConfig {
  return PLANS[(plan ?? 'starter') as Plan] ?? PLANS.starter;
}

/** Net price → price including IVA, rounded to the nearest peso. */
export function withIva(net: number): number {
  return Math.round(net * (1 + IVA_RATE));
}

/** Net monthly price under annual billing (2 months free): net × 10/12. */
export function annualMonthly(net: number): number {
  return Math.round((net * ANNUAL_MONTHS_BILLED) / 12);
}

/** Format an integer CLP amount with thousands separators, e.g. 24990 → "$24.990". */
export function formatClp(n: number): string {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
