import type { BillingClient } from './types';
import { MockBillingClient } from './mock-client';
import { BsaleBillingClient } from './bsale-client';

export function getBillingClient(): BillingClient {
  if (process.env.MOCK_BILLING === 'true') {
    return new MockBillingClient();
  }
  return new BsaleBillingClient();
}

export type { BillingClient, InvoiceParams, IssueInvoiceResult } from './types';
