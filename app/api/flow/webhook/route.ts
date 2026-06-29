import { NextRequest, NextResponse } from 'next/server';
import { FlowPaymentClient } from '@/lib/payment/flow-client';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

const flow = new FlowPaymentClient();

/** Parse form-encoded or JSON body into a plain string-string map. */
async function parseParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const json = await req.json() as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, String(v)]));
  }
  const text = await req.text();
  return Object.fromEntries(new URLSearchParams(text));
}

export async function POST(req: NextRequest) {
  const params = await parseParams(req);

  // Skip signature check in mock mode
  const isMock = process.env.MOCK_PAYMENTS === 'true';
  if (!isMock && !flow.verifyWebhook(params)) {
    console.error('[Flow webhook] invalid signature');
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const token = params.token;
  if (!token) {
    return new NextResponse('Missing token', { status: 400 });
  }

  // Fetch full payment details from Flow
  let payment: Record<string, unknown>;
  try {
    payment = await flow.getPaymentStatus(token);
  } catch (err) {
    console.error('[Flow webhook] getPaymentStatus error:', err);
    return new NextResponse('Upstream error', { status: 502 });
  }

  console.log('[Flow webhook] payment:', JSON.stringify(payment));

  // Flow status 2 = paid/approved
  if (payment.status !== 2) {
    // Failed payment — mark subscription as failed
    const commerceOrder = String(payment.commerceOrder ?? '');
    if (commerceOrder) {
      await query(
        `UPDATE subscriptions SET status = 'past_due' WHERE id = $1 AND status = 'pending'`,
        [commerceOrder]
      );
      await notifyPaymentFailed(commerceOrder, payment);
    }
    return NextResponse.json({ ok: false, status: payment.status });
  }

  // Successful payment
  const commerceOrder = String(payment.commerceOrder ?? '');
  const flowOrderId = String(payment.flowOrder ?? '');

  // Activate the subscription — read billing_cycle from DB to compute ends_at
  const updated = await query<{ id: number; user_id: number; business_id: number; plan: string; billing_cycle: string }>(
    `UPDATE subscriptions
     SET status = 'active',
         payment_provider_id = COALESCE(NULLIF(payment_provider_id, ''), $1),
         started_at = NOW(),
         ends_at = NOW() + (CASE WHEN billing_cycle = 'annual' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END)
     WHERE id = $2 AND status IN ('pending', 'past_due')
     RETURNING id, user_id, business_id, plan, billing_cycle`,
    [flowOrderId, commerceOrder]
  );

  if (updated.rows.length === 0) {
    // Already activated (duplicate webhook) — return 200 so Flow doesn't retry
    return NextResponse.json({ ok: true, note: 'already_processed' });
  }

  const { user_id, business_id, plan, billing_cycle } = updated.rows[0];

  // Activate the business
  await query(`UPDATE businesses SET status = 'active' WHERE id = $1`, [business_id]);

  // Send confirmation email
  const userRes = await query<{ email: string; name: string }>(
    'SELECT email, name FROM users WHERE id = $1',
    [user_id]
  );
  if (userRes.rows.length > 0) {
    const { email, name } = userRes.rows[0];
    await sendEmail({
      to: email,
      subject: `✅ Tu suscripción MenuBot ${plan} está activa`,
      html: buildConfirmationEmail({ name, plan, billingCycle: billing_cycle }),
    }).catch(err => console.error('[Flow webhook] email error (non-fatal):', err));
  }

  return NextResponse.json({ ok: true });
}

async function notifyPaymentFailed(subscriptionId: string, payment: Record<string, unknown>) {
  const sub = await query<{ user_id: number; plan: string }>(
    'SELECT user_id, plan FROM subscriptions WHERE id = $1',
    [subscriptionId]
  );
  if (sub.rows.length === 0) return;

  const userRes = await query<{ email: string; name: string }>(
    'SELECT email, name FROM users WHERE id = $1',
    [sub.rows[0].user_id]
  );
  if (userRes.rows.length === 0) return;

  const { email, name } = userRes.rows[0];
  await sendEmail({
    to: email,
    subject: '⚠️ No pudimos procesar tu pago en MenuBot',
    html: buildFailedEmail({ name, plan: sub.rows[0].plan }),
  }).catch(err => console.error('[Flow webhook] failed-email error (non-fatal):', err));
}

function buildConfirmationEmail({ name, plan, billingCycle }: { name: string; plan: string; billingCycle: string }) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const cycleLabel = billingCycle === 'annual' ? 'anual' : 'mensual';
  return `<!DOCTYPE html>
<html lang="es"><body style="font-family:system-ui,sans-serif;background:#faf7f2;margin:0;padding:32px 16px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e3dbd0">
  <div style="font-size:28px;margin-bottom:8px">🎉</div>
  <h1 style="font-size:20px;color:#1a1208;margin:0 0 8px">¡Bienvenido a menubot, ${name}!</h1>
  <p style="color:#4a3f2f;font-size:14px;line-height:1.6;margin:0 0 20px">
    Tu suscripción al plan <strong>${planLabel}</strong> (${cycleLabel}) ya está activa.
    Tu carta digital con IA está lista para atender a tus clientes.
  </p>
  <a href="https://menubot-production.up.railway.app/dashboard"
     style="display:inline-block;background:#c76b43;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
    Ir a mi panel →
  </a>
  <p style="color:#8a7a66;font-size:12px;margin:24px 0 0;line-height:1.5">
    Si tienes preguntas escríbenos a <a href="mailto:hola@menubot.cl" style="color:#c76b43">hola@menubot.cl</a>
  </p>
</div>
</body></html>`;
}

function buildFailedEmail({ name, plan }: { name: string; plan: string }) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  return `<!DOCTYPE html>
<html lang="es"><body style="font-family:system-ui,sans-serif;background:#faf7f2;margin:0;padding:32px 16px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e3dbd0">
  <div style="font-size:28px;margin-bottom:8px">⚠️</div>
  <h1 style="font-size:20px;color:#1a1208;margin:0 0 8px">Hola ${name}, hubo un problema con tu pago</h1>
  <p style="color:#4a3f2f;font-size:14px;line-height:1.6;margin:0 0 20px">
    No pudimos procesar el pago de tu suscripción <strong>${planLabel}</strong> en MenuBot.
    Por favor actualiza tu método de pago para mantener tu carta activa.
  </p>
  <a href="https://menubot-production.up.railway.app/dashboard/billing"
     style="display:inline-block;background:#c76b43;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
    Actualizar método de pago →
  </a>
  <p style="color:#8a7a66;font-size:12px;margin:24px 0 0;line-height:1.5">
    ¿Necesitas ayuda? Escríbenos a <a href="mailto:hola@menubot.cl" style="color:#c76b43">hola@menubot.cl</a>
  </p>
</div>
</body></html>`;
}
