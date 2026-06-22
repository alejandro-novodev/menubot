// Feature gating. Single source of truth for which features each plan unlocks.
// Use getFeatures(plan) everywhere a feature is conditionally shown or blocked,
// instead of hardcoding plan name checks.

import type { Plan } from './plans';

export interface PlanFeatures {
  /** Post-visit reviews/opinions collection (stored in MenuBot). */
  hasReviews: boolean;
  /** Custom branding: logo + colors. */
  hasCustomBranding: boolean;
  /** Advanced analytics: per-category breakdown + recent conversation summaries. */
  hasAdvancedAnalytics: boolean;
  /** Central multi-branch dashboard + per-branch data. */
  hasMultiBranch: boolean;
  /** CSV/PDF export of reviews and analytics. */
  hasCSVExport: boolean;
  /** REST API + webhooks. */
  hasAPI: boolean;
  /** Interactive bill split (per-person dish selection). Starter is calculator-only. */
  hasInteractiveBillSplit: boolean;
  /** Translated menu display for tourists (chat-in-any-language is free for all). */
  hasMenuTranslation: boolean;
  /** Email alerts for new reviews / unusual activity. */
  hasEmailAlerts: boolean;
  /** Owner can respond to reviews from the dashboard. */
  hasOwnerResponse: boolean;
  /** White-label option. */
  hasWhiteLabel: boolean;
  /** SSO + unlimited dashboard users. */
  hasSSOUsers: boolean;
  /** Guaranteed / dedicated SLA. */
  hasDedicatedSLA: boolean;
}

const STARTER: PlanFeatures = {
  hasReviews: false,
  hasCustomBranding: false,
  hasAdvancedAnalytics: false,
  hasMultiBranch: false,
  hasCSVExport: false,
  hasAPI: false,
  hasInteractiveBillSplit: false,
  hasMenuTranslation: false,
  hasEmailAlerts: false,
  hasOwnerResponse: false,
  hasWhiteLabel: false,
  hasSSOUsers: false,
  hasDedicatedSLA: false,
};

const PRO: PlanFeatures = {
  ...STARTER,
  hasReviews: true,
  hasCustomBranding: true,
  hasAdvancedAnalytics: true,
  hasInteractiveBillSplit: true,
  hasMenuTranslation: true,
  hasEmailAlerts: true,
  hasOwnerResponse: true,
};

const MULTI: PlanFeatures = {
  ...PRO,
  hasMultiBranch: true,
  hasCSVExport: true,
};

const ENTERPRISE: PlanFeatures = {
  ...MULTI,
  hasAPI: true,
  hasWhiteLabel: true,
  hasSSOUsers: true,
  hasDedicatedSLA: true,
};

const FEATURES_BY_PLAN: Record<Plan, PlanFeatures> = {
  starter: STARTER,
  pro: PRO,
  multi: MULTI,
  enterprise: ENTERPRISE,
};

/**
 * Feature flags for a plan. During the 14-day trial (plan = 'trial') users get
 * Pro-level features so they can preview the full product. Unknown/missing
 * plans fall back to Starter.
 */
export function getFeatures(plan: string | null | undefined): PlanFeatures {
  if (plan === 'trial') return PRO;
  return FEATURES_BY_PLAN[(plan ?? 'starter') as Plan] ?? STARTER;
}

/** The lowest plan that unlocks a given feature — used by upgrade prompts. */
export function minPlanFor(feature: keyof PlanFeatures): Plan {
  const order: Plan[] = ['starter', 'pro', 'multi', 'enterprise'];
  return order.find((p) => FEATURES_BY_PLAN[p][feature]) ?? 'enterprise';
}
