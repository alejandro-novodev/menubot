import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getBillingClient } from '@/lib/billing';

// GET — shows the mock payment page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subId = searchParams.get('subId') ?? '';
  const dbId = searchParams.get('dbId') ?? '';
  const plan = searchParams.get('plan') ?? '';
  const amount = searchParams.get('amount') ?? '0';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Simulador de Pago — MenuBot</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#09090b;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#18181b;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:32px;max-width:420px;width:100%;text-align:center}
    .badge{display:inline-block;background:#7c3aed;color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;letter-spacing:.5px;margin-bottom:20px;text-transform:uppercase}
    h1{font-size:22px;font-weight:700;margin-bottom:8px}
    .amount{font-size:36px;font-weight:800;color:#a78bfa;margin:16px 0}
    .meta{font-size:13px;color:#71717a;margin-bottom:24px;line-height:1.6}
    .separator{border:none;border-top:1px solid rgba(255,255,255,.08);margin:20px 0}
    .note{font-size:12px;color:#52525b;margin-bottom:20px;font-style:italic}
    .btn{display:block;width:100%;padding:13px;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .2s;margin-bottom:10px}
    .btn-success{background:#16a34a;color:#fff}
    .btn-fail{background:#991b1b;color:#fff}
    .btn:hover{opacity:.85}
    form{margin:0}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🔧 Simulador de pago</div>
    <h1>Flow.cl — Pago de suscripción</h1>
    <div class="amount">$${parseInt(amount).toLocaleString('es-CL')}</div>
    <div class="meta">
      Plan: <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong><br>
      Referencia: ${subId}
    </div>
    <hr class="separator">
    <div class="note">Este es un entorno de desarrollo. Elige el resultado del pago:</div>
    <form method="POST" action="/api/flow/mock-payment">
      <input type="hidden" name="subId" value="${subId}">
      <input type="hidden" name="dbId" value="${dbId}">
      <input type="hidden" name="plan" value="${plan}">
      <input type="hidden" name="amount" value="${amount}">
      <input type="hidden" name="result" value="success">
      <button type="submit" class="btn btn-success">✓ Simular pago exitoso</button>
    </form>
    <form method="POST" action="/api/flow/mock-payment">
      <input type="hidden" name="subId" value="${subId}">
      <input type="hidden" name="dbId" value="${dbId}">
      <input type="hidden" name="result" value="failed">
      <button type="submit" class="btn btn-fail">✗ Simular pago fallido</button>
    </form>
  </div>
</body>
</html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

// POST — processes the mock payment result
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const result = formData.get('result') as string;
  const dbId = formData.get('dbId') as string;
  const subId = formData.get('subId') as string;
  const plan = formData.get('plan') as string;
  const amount = parseInt(formData.get('amount') as string ?? '0');

  if (result === 'success' && dbId) {
    // Activate subscription
    await query(
      `UPDATE subscriptions
       SET status = 'active', payment_provider_id = $1, started_at = NOW(), ends_at = NOW() + INTERVAL '1 month'
       WHERE id = $2`,
      [subId, dbId]
    );

    // Get subscription + user info for billing
    const sub = await query<{ user_id: number; business_id: number; email: string; name: string }>(
      `SELECT s.user_id, s.business_id, u.email, u.name
       FROM subscriptions s JOIN users u ON u.id = s.user_id
       WHERE s.id = $1`,
      [dbId]
    );

    if (sub.rows.length > 0) {
      const { email, name, business_id } = sub.rows[0];

      // Activate business
      await query(`UPDATE businesses SET status = 'active' WHERE id = $1`, [business_id]);

      // Issue mock invoice
      try {
        const billing = getBillingClient();
        const invoice = await billing.issueInvoice({
          clientName: name,
          email,
          amountClp: amount,
          description: `Suscripción MenuBot — Plan ${plan}`,
          plan,
        });
        await query(
          `UPDATE subscriptions SET invoice_pdf_url = $1 WHERE id = $2`,
          [invoice.pdfUrl, dbId]
        );
      } catch (e) {
        console.error('Billing error (non-fatal):', e);
      }
    }

    return NextResponse.redirect(new URL('/dashboard?payment=success', req.url));
  }

  return NextResponse.redirect(new URL('/dashboard/onboarding?step=3&payment=failed', req.url));
}
