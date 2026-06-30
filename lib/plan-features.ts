// Feature gating. Single source of truth for which features each plan unlocks.
// Use getFeatures(plan) everywhere — never hardcode plan name checks in routes or UI.

import type { Plan } from './plans';

export interface PlanFeatures {
  // Core
  menuChat: boolean;
  qrWidget: boolean;
  menuUpdates: boolean;
  tableRouting: boolean;
  conversationsLimit: number | null;

  // Analytics
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  csvPdfExport: boolean;

  // Compliance
  allergenPdf: boolean;

  // Guest-facing features
  billSplitBasic: boolean;
  billSplitInteractive: boolean;
  menuTranslation: boolean;
  upsellEngine: boolean;
  reservationsChat: boolean;

  // Owner features
  aiMenuDescriptionGenerator: boolean;
  reviewsCollection: boolean;
  ownerResponseToReviews: boolean;
  customBranding: boolean;
  emailAlerts: boolean;
  weeklyInsightDigest: boolean;

  // Scale
  multiBranch: boolean;
  centralDashboard: boolean;
  whatsappChannel: boolean;

  // Support
  supportEmail48h: boolean;
  supportChat24h: boolean;
  supportDedicated: boolean;

  // API
  apiWebhooks: boolean;
  sso: boolean;
  whiteLabel: boolean;
}

const BASE: Partial<PlanFeatures> = {
  menuChat: true,
  qrWidget: true,
  menuUpdates: true,
  tableRouting: true,
  allergenPdf: true,
  billSplitBasic: true,
  basicAnalytics: true,
  supportEmail48h: true,
};

const STARTER: PlanFeatures = {
  ...BASE as PlanFeatures,
  conversationsLimit: 1500,
  advancedAnalytics: false,
  csvPdfExport: false,
  billSplitInteractive: false,
  menuTranslation: false,
  upsellEngine: false,
  reservationsChat: false,
  aiMenuDescriptionGenerator: false,
  reviewsCollection: false,
  ownerResponseToReviews: false,
  customBranding: false,
  emailAlerts: false,
  weeklyInsightDigest: false,
  multiBranch: false,
  centralDashboard: false,
  whatsappChannel: false,
  supportChat24h: false,
  supportDedicated: false,
  apiWebhooks: false,
  sso: false,
  whiteLabel: false,
};

const PRO: PlanFeatures = {
  ...STARTER,
  conversationsLimit: 5000,
  advancedAnalytics: true,
  billSplitInteractive: true,
  menuTranslation: true,
  upsellEngine: true,
  reservationsChat: true,
  aiMenuDescriptionGenerator: true,
  reviewsCollection: true,
  ownerResponseToReviews: true,
  customBranding: true,
  emailAlerts: true,
  weeklyInsightDigest: true,
  supportEmail48h: false,
  supportChat24h: true,
};

const MULTI: PlanFeatures = {
  ...PRO,
  conversationsLimit: 15000,
  csvPdfExport: true,
  multiBranch: true,
  centralDashboard: true,
  whatsappChannel: true,
  supportChat24h: false,
  supportDedicated: true,
};

const ENTERPRISE: PlanFeatures = {
  ...MULTI,
  conversationsLimit: null,
  apiWebhooks: true,
  sso: true,
  whiteLabel: true,
};

const FEATURES_BY_PLAN: Record<Plan, PlanFeatures> = {
  starter: STARTER,
  pro: PRO,
  multi: MULTI,
  enterprise: ENTERPRISE,
};

/**
 * Returns feature flags for a given plan. Trial gets Pro-level features so
 * users can experience the full product during the 14-day free period.
 * Unknown or missing plans fall back to Starter.
 */
export function getFeatures(plan: string | null | undefined): PlanFeatures {
  if (plan === 'trial') return PRO;
  return FEATURES_BY_PLAN[(plan ?? 'starter') as Plan] ?? STARTER;
}

/** The lowest plan that first unlocks a given feature — used in upgrade prompts. */
export function minPlanFor(feature: keyof PlanFeatures): Plan {
  const order: Plan[] = ['starter', 'pro', 'multi', 'enterprise'];
  return order.find((p) => {
    const val = FEATURES_BY_PLAN[p][feature];
    return val === true || (typeof val === 'number' && val > 0);
  }) ?? 'enterprise';
}
