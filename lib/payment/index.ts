import type { PaymentClient } from './types';
import { MockPaymentClient } from './mock-client';
import { FlowPaymentClient } from './flow-client';

export function getPaymentClient(): PaymentClient {
  if (process.env.MOCK_PAYMENTS === 'true') {
    return new MockPaymentClient();
  }
  return new FlowPaymentClient();
}

export type { PaymentClient, SubscriptionParams, CreateSubscriptionResult } from './types';
