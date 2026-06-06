export interface SubscriptionParams {
  plan: string;
  priceClp: number;
  userEmail: string;
  userName: string;
  businessId: number;
  subscriptionDbId: number;
  returnUrl: string;
}

export interface CreateSubscriptionResult {
  paymentUrl: string;
  providerSubscriptionId: string;
}

export interface PaymentClient {
  createSubscription(params: SubscriptionParams): Promise<CreateSubscriptionResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  verifyWebhook(payload: string, signature: string): boolean;
}
