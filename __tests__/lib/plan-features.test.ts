import { getFeatures, minPlanFor } from '@/lib/plan-features';

describe('getFeatures', () => {
  describe('trial plan', () => {
    it('gets Pro-level features during the 14-day trial', () => {
      const f = getFeatures('trial');
      expect(f.reviewsCollection).toBe(true);
      expect(f.customBranding).toBe(true);
      expect(f.advancedAnalytics).toBe(true);
      expect(f.billSplitInteractive).toBe(true);
      expect(f.menuTranslation).toBe(true);
      expect(f.aiMenuDescriptionGenerator).toBe(true);
      expect(f.weeklyInsightDigest).toBe(true);
    });

    it('trial does not get Multi-only features', () => {
      const f = getFeatures('trial');
      expect(f.multiBranch).toBe(false);
      expect(f.csvPdfExport).toBe(false);
      expect(f.whatsappChannel).toBe(false);
    });
  });

  describe('free plan', () => {
    it('has Starter feature set with a 100 conversation limit', () => {
      const f = getFeatures('free');
      expect(f.menuChat).toBe(true);
      expect(f.allergenPdf).toBe(true);
      expect(f.basicAnalytics).toBe(true);
      expect(f.conversationsLimit).toBe(100);
    });

    it('has no premium features', () => {
      const f = getFeatures('free');
      expect(f.reviewsCollection).toBe(false);
      expect(f.advancedAnalytics).toBe(false);
      expect(f.aiMenuDescriptionGenerator).toBe(false);
      expect(f.menuTranslation).toBe(false);
    });
  });

  describe('starter plan', () => {
    it('has core features only', () => {
      const f = getFeatures('starter');
      expect(f.menuChat).toBe(true);
      expect(f.allergenPdf).toBe(true);
      expect(f.billSplitBasic).toBe(true);
      expect(f.basicAnalytics).toBe(true);
    });

    it('has no premium features', () => {
      const f = getFeatures('starter');
      expect(f.reviewsCollection).toBe(false);
      expect(f.customBranding).toBe(false);
      expect(f.advancedAnalytics).toBe(false);
      expect(f.aiMenuDescriptionGenerator).toBe(false);
      expect(f.menuTranslation).toBe(false);
      expect(f.multiBranch).toBe(false);
      expect(f.whatsappChannel).toBe(false);
    });

    it('has a 1500 conversation limit', () => {
      expect(getFeatures('starter').conversationsLimit).toBe(1500);
    });
  });

  describe('pro plan', () => {
    it('has reviews, branding, orders, and reservations', () => {
      const f = getFeatures('pro');
      expect(f.reviewsCollection).toBe(true);
      expect(f.customBranding).toBe(true);
      expect(f.advancedAnalytics).toBe(true);
      expect(f.billSplitInteractive).toBe(true);
      expect(f.ownerResponseToReviews).toBe(true);
      expect(f.aiMenuDescriptionGenerator).toBe(true);
      expect(f.upsellEngine).toBe(true);
      expect(f.reservationsChat).toBe(true);
    });

    it('does not have multi-branch or WhatsApp', () => {
      const f = getFeatures('pro');
      expect(f.multiBranch).toBe(false);
      expect(f.csvPdfExport).toBe(false);
      expect(f.whatsappChannel).toBe(false);
      expect(f.apiWebhooks).toBe(false);
    });

    it('has a 5000 conversation limit', () => {
      expect(getFeatures('pro').conversationsLimit).toBe(5000);
    });
  });

  describe('multi plan', () => {
    it('has all Pro features plus multi-branch, WhatsApp, and CSV export', () => {
      const f = getFeatures('multi');
      expect(f.reviewsCollection).toBe(true);
      expect(f.multiBranch).toBe(true);
      expect(f.centralDashboard).toBe(true);
      expect(f.whatsappChannel).toBe(true);
      expect(f.csvPdfExport).toBe(true);
    });

    it('does not have API or white-label', () => {
      const f = getFeatures('multi');
      expect(f.apiWebhooks).toBe(false);
      expect(f.whiteLabel).toBe(false);
    });

    it('has a 15000 conversation limit', () => {
      expect(getFeatures('multi').conversationsLimit).toBe(15000);
    });
  });

  describe('enterprise plan', () => {
    it('has every feature enabled', () => {
      const f = getFeatures('enterprise');
      expect(f.reviewsCollection).toBe(true);
      expect(f.multiBranch).toBe(true);
      expect(f.csvPdfExport).toBe(true);
      expect(f.apiWebhooks).toBe(true);
      expect(f.whiteLabel).toBe(true);
      expect(f.sso).toBe(true);
      expect(f.supportDedicated).toBe(true);
    });

    it('has unlimited conversations', () => {
      expect(getFeatures('enterprise').conversationsLimit).toBeNull();
    });
  });

  describe('all plans include allergenPdf', () => {
    it('allergenPdf is true for starter', () => expect(getFeatures('starter').allergenPdf).toBe(true));
    it('allergenPdf is true for pro', () => expect(getFeatures('pro').allergenPdf).toBe(true));
    it('allergenPdf is true for multi', () => expect(getFeatures('multi').allergenPdf).toBe(true));
  });

  describe('edge cases', () => {
    it('null falls back to starter', () => {
      expect(getFeatures(null).reviewsCollection).toBe(false);
    });

    it('undefined falls back to starter', () => {
      expect(getFeatures(undefined).reviewsCollection).toBe(false);
    });

    it('unknown plan falls back to starter', () => {
      expect(getFeatures('unknown-plan').reviewsCollection).toBe(false);
    });
  });
});

describe('minPlanFor', () => {
  it('reviewsCollection requires pro', () => {
    expect(minPlanFor('reviewsCollection')).toBe('pro');
  });

  it('aiMenuDescriptionGenerator requires pro', () => {
    expect(minPlanFor('aiMenuDescriptionGenerator')).toBe('pro');
  });

  it('multiBranch requires multi', () => {
    expect(minPlanFor('multiBranch')).toBe('multi');
  });

  it('csvPdfExport requires multi', () => {
    expect(minPlanFor('csvPdfExport')).toBe('multi');
  });

  it('whatsappChannel requires multi', () => {
    expect(minPlanFor('whatsappChannel')).toBe('multi');
  });

  it('apiWebhooks requires enterprise', () => {
    expect(minPlanFor('apiWebhooks')).toBe('enterprise');
  });

  it('whiteLabel requires enterprise', () => {
    expect(minPlanFor('whiteLabel')).toBe('enterprise');
  });

  it('supportDedicated requires multi (dedicated support is a Multi+ feature)', () => {
    expect(minPlanFor('supportDedicated')).toBe('multi');
  });
});
