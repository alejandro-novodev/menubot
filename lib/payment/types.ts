export interface SubscriptionParams {
  plan: string;
  priceClp: number;        // net (pre-IVA) monthly equivalent
  billingCycle: 'monthly' | 'annual';
  userEmail: string;
  userName: string;
  businessId: number;
  subscriptionDbId: number;
  returnUrl: string;
  confirmationUrl: string; // server-to-server webhook from Flow
}

export interface CreateSubscriptionResult {
  paymentUrl: string;
  providerSubscriptionId: string;
}

export interface PaymentClient {
  createSubscription(params: SubscriptionParams): Promise<CreateSubscriptionResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  verifyWebhook(params: Record<string, string>): boolean;
}
