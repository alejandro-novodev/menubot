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
    subtitle: 'Para restaurantes que quieren modernizar su carta sin complicaciones.',
    priceClp: 9990,
    includedBranches: 1,
    extraBranchClp: null,
    ctaType: 'self-serve',
    features: [
      { text: '1 sucursal · chat de menú embebido', included: true },
      { text: 'Widget instalable en tu web o carta QR', included: true },
      { text: 'Actualizaciones de carta ilimitadas', included: true },
      { text: 'Estadísticas básicas (conversaciones, preguntas frecuentes)', included: true },
      { text: 'División de cuenta y cálculo de propina', included: true },
      { text: 'Soporte por email · 48–72 hrs', included: true },
      { text: 'Opiniones y reviews de comensales', included: false },
      { text: 'Branding personalizado (logo y colores)', included: false },
      { text: 'Analítica avanzada y exportación', included: false },
      { text: 'Multi-sucursal', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Para restaurantes que quieren conocer y fidelizar a sus clientes.',
    priceClp: 24990,
    includedBranches: 1,
    extraBranchClp: null,
    featured: true,
    ctaType: 'self-serve',
    features: [
      { text: 'Todo lo de Starter', included: true },
      { text: 'Opiniones post-visita · el comensal califica y comenta', included: true },
      { text: 'Respuestas del dueño a cada opinión desde el panel', included: true },
      { text: 'Branding personalizado · tu logo y colores en el chat', included: true },
      { text: 'Analítica avanzada · desglose por categoría y tendencias', included: true },
      { text: 'Alertas por email ante opiniones o actividad inusual', included: true },
      { text: 'Soporte por chat · 24 hrs hábiles', included: true },
      { text: 'Multi-sucursal · panel centralizado', included: false },
      { text: 'Exportación CSV / PDF de reportes', included: false },
    ],
  },
  multi: {
    id: 'multi',
    name: 'Multi',
    subtitle: 'Para cadenas y grupos que manejan más de un local.',
    priceClp: 59990,
    includedBranches: 5,
    extraBranchClp: 8990,
    ctaType: 'self-serve',
    features: [
      { text: 'Todo lo de Pro', included: true },
      { text: 'Panel central multi-sucursal · una sola vista para todos tus locales', included: true },
      { text: 'Menús diferenciados por sucursal', included: true },
      { text: 'Reportes consolidados del grupo', included: true },
      { text: 'Exportación CSV y PDF de análisis y opiniones', included: true },
      { text: 'Hasta 5 sucursales · locales adicionales a $8.990/mes neto', included: true },
      { text: 'Soporte por chat · respuesta 12 hrs hábiles', included: true },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Para grupos gastronómicos, cadenas con +5 locales o integradores que necesitan API y SLA garantizado.',
    priceClp: null,
    includedBranches: 5,
    extraBranchClp: null,
    ctaType: 'contact',
    features: [
      { text: 'API + webhooks', included: true },
      { text: 'SSO usuarios ilimitados', included: true },
      { text: 'Integración POS / delivery', included: true },
      { text: 'SLA garantizado', included: true },
      { text: 'Onboarding dedicado', included: true },
      { text: 'White-label opcional', included: true },
      { text: 'Precio por volumen', included: true },
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
