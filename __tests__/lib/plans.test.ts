import { withIva, annualMonthly, formatClp, getPlan, isPaidPlan, PLANS, PLAN_ORDER, IVA_RATE, ANNUAL_MONTHS_BILLED } from '@/lib/plans';

describe('withIva', () => {
  it('adds 19% IVA and rounds to nearest peso', () => {
    expect(withIva(9990)).toBe(Math.round(9990 * 1.19));
    expect(withIva(24990)).toBe(Math.round(24990 * 1.19));
    expect(withIva(59990)).toBe(Math.round(59990 * 1.19));
  });

  it('returns an integer', () => {
    expect(Number.isInteger(withIva(9990))).toBe(true);
    expect(Number.isInteger(withIva(24990))).toBe(true);
  });

  it('reflects the IVA_RATE constant', () => {
    expect(withIva(1000)).toBe(Math.round(1000 * (1 + IVA_RATE)));
  });
});

describe('annualMonthly', () => {
  it('gives 2 months free (charges 10 out of 12)', () => {
    const net = 24990;
    expect(annualMonthly(net)).toBe(Math.round((net * ANNUAL_MONTHS_BILLED) / 12));
  });

  it('annual price is lower than monthly', () => {
    expect(annualMonthly(9990)).toBeLessThan(9990);
    expect(annualMonthly(24990)).toBeLessThan(24990);
  });

  it('returns an integer', () => {
    expect(Number.isInteger(annualMonthly(9990))).toBe(true);
    expect(Number.isInteger(annualMonthly(59990))).toBe(true);
  });
});

describe('formatClp', () => {
  it('formats with thousands separator (dot)', () => {
    expect(formatClp(24990)).toBe('$24.990');
    expect(formatClp(9990)).toBe('$9.990');
    expect(formatClp(59990)).toBe('$59.990');
  });

  it('formats numbers under 1000 without separator', () => {
    expect(formatClp(990)).toBe('$990');
    expect(formatClp(0)).toBe('$0');
  });

  it('rounds floats before formatting', () => {
    expect(formatClp(9990.6)).toBe('$9.991');
    expect(formatClp(9990.4)).toBe('$9.990');
  });

  it('handles large numbers with multiple separators', () => {
    expect(formatClp(1000000)).toBe('$1.000.000');
  });
});

describe('getPlan', () => {
  it('returns the correct plan config for valid plan names', () => {
    expect(getPlan('starter').id).toBe('starter');
    expect(getPlan('pro').id).toBe('pro');
    expect(getPlan('multi').id).toBe('multi');
    expect(getPlan('enterprise').id).toBe('enterprise');
  });

  it('falls back to starter for null', () => {
    expect(getPlan(null).id).toBe('starter');
  });

  it('falls back to starter for undefined', () => {
    expect(getPlan(undefined).id).toBe('starter');
  });

  it('falls back to starter for unknown plan name', () => {
    expect(getPlan('unknown').id).toBe('starter');
  });
});

describe('isPaidPlan', () => {
  it('paid plans are starter, pro, multi, enterprise', () => {
    expect(isPaidPlan('starter')).toBe(true);
    expect(isPaidPlan('pro')).toBe(true);
    expect(isPaidPlan('multi')).toBe(true);
    expect(isPaidPlan('enterprise')).toBe(true);
  });

  it('free, trial, null and unknown are not paid', () => {
    expect(isPaidPlan('free')).toBe(false);
    expect(isPaidPlan('trial')).toBe(false);
    expect(isPaidPlan(null)).toBe(false);
    expect(isPaidPlan('unknown')).toBe(false);
  });
});

describe('PLANS config', () => {
  it('free costs nothing and has a 100 conversation cap', () => {
    expect(PLANS.free.priceClp).toBe(0);
    expect(PLANS.free.conversationsLimit).toBe(100);
  });

  it('free is not in the public pricing order', () => {
    expect(PLAN_ORDER).not.toContain('free');
  });

  it('starter has a price', () => {
    expect(PLANS.starter.priceClp).toBeGreaterThan(0);
  });

  it('pro is more expensive than starter', () => {
    expect(PLANS.pro.priceClp!).toBeGreaterThan(PLANS.starter.priceClp!);
  });

  it('multi is more expensive than pro', () => {
    expect(PLANS.multi.priceClp!).toBeGreaterThan(PLANS.pro.priceClp!);
  });

  it('enterprise has null priceClp (custom pricing)', () => {
    expect(PLANS.enterprise.priceClp).toBeNull();
  });

  it('pro is the featured plan', () => {
    expect(PLANS.pro.featured).toBe(true);
  });

  it('multi includes 5 branches', () => {
    expect(PLANS.multi.includedBranches).toBe(5);
  });

  it('enterprise uses contact CTA', () => {
    expect(PLANS.enterprise.ctaType).toBe('contact');
  });
});
