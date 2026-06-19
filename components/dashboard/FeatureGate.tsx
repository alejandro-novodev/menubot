'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { PLANS, type Plan } from '@/lib/plans';

/**
 * Inline plan gate (not a modal). When the feature is available, renders the
 * children as-is. When it isn't, renders the children grayed/disabled with an
 * upgrade prompt below it — so the section stays visible as a teaser.
 */
export function FeatureGate({
  enabled,
  requiredPlan,
  title,
  description,
  children,
}: {
  enabled: boolean;
  requiredPlan: Plan;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  if (enabled) return <>{children}</>;

  const planName = PLANS[requiredPlan].name;

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      <div className="mt-3 rounded-xl border app-line app-soft p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="shrink-0 mt-0.5 text-accent" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold app-ink">{title ?? `Disponible en el plan ${planName}`}</p>
            {description && <p className="text-xs app-mut mt-0.5 leading-relaxed">{description}</p>}
          </div>
        </div>
        <Link
          href="/pricing"
          className={cn(buttonVariants({ size: 'sm' }), 'shrink-0 bg-accent text-white hover:bg-accent-lite border-0 px-3.5')}
        >
          Mejorar a {planName} →
        </Link>
      </div>
    </div>
  );
}
