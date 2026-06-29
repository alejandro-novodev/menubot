import crypto from 'crypto';
import type { PaymentClient, SubscriptionParams, CreateSubscriptionResult } from './types';

const FLOW_API_URL = process.env.FLOW_API_URL ?? 'https://www.flow.cl/app/web/api';

function sign(params: Record<string, string>, secret: string): string {
  const keys = Object.keys(params).sort();
  const toSign = keys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', secret).update(toSign).digest('hex');
}

export class FlowPaymentClient implements PaymentClient {
  private apiKey = process.env.FLOW_API_KEY!;
  private secretKey = process.env.FLOW_SECRET_KEY!;

  async createSubscription(params: SubscriptionParams): Promise<CreateSubscriptionResult> {
    const body: Record<string, string> = {
      apiKey: this.apiKey,
      planId: params.plan,              // must match the plan ID created in Flow dashboard
      email: params.userEmail,
      commerceOrder: String(params.subscriptionDbId), // our DB id — returned in webhook
      subject: `MenuBot ${params.plan} — ${params.billingCycle === 'annual' ? 'Anual' : 'Mensual'}`,
      urlConfirmation: params.confirmationUrl,
      urlReturn: params.returnUrl,
      toDate: '',
      trial: '0',
    };
    body.s = sign(body, this.secretKey);

    const res = await fetch(`${FLOW_API_URL}/subscription/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });
    const data = await res.json() as { url: string; token: string; subscriptionId: string };
    return {
      paymentUrl: `${data.url}?token=${data.token}`,
      providerSubscriptionId: data.subscriptionId,
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    const body: Record<string, string> = { apiKey: this.apiKey, subscriptionId: providerSubscriptionId };
    body.s = sign(body, this.secretKey);
    await fetch(`${FLOW_API_URL}/subscription/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });
  }

  /** Verify an incoming webhook from Flow.
   *  Flow signs by sorting all params (excluding 's'), concatenating key+value, then HMAC-SHA256. */
  verifyWebhook(params: Record<string, string>): boolean {
    const { s, ...rest } = params;
    if (!s) return false;
    const expected = sign(rest, this.secretKey);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(s));
  }

  /** Fetch payment status from Flow by token (used inside the webhook handler). */
  async getPaymentStatus(token: string): Promise<Record<string, unknown>> {
    const p: Record<string, string> = { apiKey: this.apiKey, token };
    p.s = sign(p, this.secretKey);
    const qs = new URLSearchParams(p);
    const res = await fetch(`${FLOW_API_URL}/payment/getStatus?${qs}`);
    return res.json() as Promise<Record<string, unknown>>;
  }
}
