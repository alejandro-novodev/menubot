import type { PaymentClient, SubscriptionParams, CreateSubscriptionResult } from './types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class MockPaymentClient implements PaymentClient {
  async createSubscription(params: SubscriptionParams): Promise<CreateSubscriptionResult> {
    await delay(500);
    const mockId = `mock_sub_${params.subscriptionDbId}_${Date.now()}`;
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const paymentUrl = `${base}/api/flow/mock-payment?subId=${mockId}&dbId=${params.subscriptionDbId}&plan=${params.plan}&amount=${params.priceClp}`;
    console.log(`[MOCK PAYMENT] Suscripción ${mockId} para ${params.userEmail} — Plan ${params.plan} $${params.priceClp} (${params.billingCycle})`);
    return { paymentUrl, providerSubscriptionId: mockId };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    await delay(300);
    console.log(`[MOCK PAYMENT] Cancelando suscripción ${providerSubscriptionId}`);
  }

  verifyWebhook(_params: Record<string, string>): boolean {
    return true;
  }
}
