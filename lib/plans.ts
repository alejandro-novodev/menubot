// Central source of truth for subscription plans. All prices are in CLP.
// priceClp is NET (before 19% IVA). Use withIva() for the amount to charge.

export type Plan = 'starter' | 'pro' | 'multi' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_ORDER: Plan[] = ['starter', 'pro', 'multi', 'enterprise'];

export const IVA_RATE = 0.19;
export const ANNUAL_MONTHS_BILLED = 10;

export interface PlanFeatureLine {
  text: string;
  included: boolean;
}

export interface PlanConfig {
  id: Plan;
  name: string;
  subtitle: string;
  /** Net monthly price in CLP, or null for Enterprise (custom). */
  priceClp: number | null;
  includedBranches: number | null;
  extraBranchClp: number | null;
  /** Monthly AI conversation cap. null = unlimited (Enterprise). */
  conversationsLimit: number | null;
  featured?: boolean;
  ctaType: 'self-serve' | 'contact';
  features: PlanFeatureLine[];
}

export const PLANS: Record<Plan, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Para restaurantes que quieren modernizar su carta sin complicaciones.',
    priceClp: 14990,
    includedBranches: 1,
    extraBranchClp: null,
    conversationsLimit: 1500,
    ctaType: 'self-serve',
    features: [
      { text: '1 sucursal · 1.500 conversaciones/mes', included: true },
      { text: 'Chat IA embebido y QR listo para imprimir', included: true },
      { text: 'Actualizaciones de carta ilimitadas', included: true },
      { text: 'PDF de alérgenos (Res. 20 Minsal)', included: true },
      { text: 'División de cuenta y cálculo de propina', included: true },
      { text: 'Estadísticas básicas', included: true },
      { text: 'Soporte por email · 48–72 hrs', included: true },
      { text: 'Generador de descripciones con IA', included: false },
      { text: 'Captura de pedidos y reservas por chat', included: false },
      { text: 'Opiniones y reviews de comensales', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Para restaurantes que quieren crecer y conocer a sus clientes.',
    priceClp: 24990,
    includedBranches: 1,
    extraBranchClp: null,
    conversationsLimit: 5000,
    featured: true,
    ctaType: 'self-serve',
    features: [
      { text: 'Todo lo de Starter · 5.000 conversaciones/mes', included: true },
      { text: 'Generador de descripciones con IA', included: true },
      { text: 'Captura de pedidos (mesa → cocina en tiempo real)', included: true },
      { text: 'Reservas por chat con confirmación automática', included: true },
      { text: 'Motor de upsell inteligente configurable', included: true },
      { text: 'Opiniones post-visita + respuestas del dueño', included: true },
      { text: 'Branding personalizado (logo y colores)', included: true },
      { text: 'Analítica avanzada + resumen semanal por email', included: true },
      { text: 'Soporte por chat · 24 hrs hábiles', included: true },
      { text: 'Multi-sucursal · WhatsApp Business', included: false },
    ],
  },
  multi: {
    id: 'multi',
    name: 'Multi',
    subtitle: 'Para cadenas y grupos que manejan más de un local.',
    priceClp: 59990,
    includedBranches: 5,
    extraBranchClp: 8990,
    conversationsLimit: 15000,
    ctaType: 'self-serve',
    features: [
      { text: 'Todo lo de Pro · 15.000 conversaciones/mes', included: true },
      { text: 'Panel central multi-sucursal (hasta 5 locales)', included: true },
      { text: 'WhatsApp Business · mismo bot en tu número WA', included: true },
      { text: 'Exportación CSV y PDF de análisis y opiniones', included: true },
      { text: 'Locales adicionales a $8.990/mes neto', included: true },
      { text: 'Soporte dedicado · respuesta 12 hrs hábiles', included: true },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Para grandes operadores, cadenas con +5 locales o integradores.',
    priceClp: null,
    includedBranches: null,
    extraBranchClp: null,
    conversationsLimit: null,
    ctaType: 'contact',
    features: [
      { text: 'Conversaciones ilimitadas', included: true },
      { text: 'API + webhooks', included: true },
      { text: 'SSO · usuarios ilimitados', included: true },
      { text: 'Integración POS / delivery', included: true },
      { text: 'SLA garantizado · onboarding dedicado', included: true },
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
