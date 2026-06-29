import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

/** Called daily by Railway cron (or any HTTP scheduler).
 *  Secured by CRON_SECRET — add `Authorization: Bearer <secret>` header. */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const summary = {
    warned: 0,
    expired: 0,
    errors: [] as string[],
  };

  // --- 1. Send 3-day warning emails for expiring trials ---
  const soonExpiring = await query<{
    sub_id: number;
    user_id: number;
    email: string;
    name: string;
    ends_at: string;
    days_left: number;
  }>(`
    SELECT
      s.id AS sub_id, s.user_id,
      u.email, u.name,
      s.ends_at,
      EXTRACT(DAY FROM (s.ends_at - NOW()))::int AS days_left
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE s.plan = 'trial'
      AND s.status = 'active'
      AND s.ends_at > NOW()
      AND s.ends_at <= NOW() + INTERVAL '3 days'
      AND (s.warning_sent_at IS NULL OR s.warning_sent_at < NOW() - INTERVAL '23 hours')
  `);

  for (const row of soonExpiring.rows) {
    try {
      await sendEmail({
        to: row.email,
        subject: `⏳ Tu prueba de MenuBot vence en ${row.days_left} día${row.days_left !== 1 ? 's' : ''}`,
        html: buildTrialWarningEmail({ name: row.name, daysLeft: row.days_left }),
      });
      // Mark as warned so we don't spam
      await query(
        `UPDATE subscriptions SET warning_sent_at = NOW() WHERE id = $1`,
        [row.sub_id]
      ).catch(() => {}); // non-fatal if column doesn't exist yet
      summary.warned++;
    } catch (e) {
      summary.errors.push(`warn ${row.sub_id}: ${String(e)}`);
    }
  }

  // --- 2. Expire trials that have passed ends_at ---
  const expired = await query<{ id: number; business_id: number; user_id: number; email: string; name: string }>(`
    UPDATE subscriptions s
    SET status = 'cancelled'
    FROM users u
    WHERE u.id = s.user_id
      AND s.plan = 'trial'
      AND s.status = 'active'
      AND s.ends_at < NOW()
    RETURNING s.id, s.business_id, s.user_id, u.email, u.name
  `);

  for (const row of expired.rows) {
    try {
      // Suspend the business
      await query(`UPDATE businesses SET status = 'suspended' WHERE id = $1`, [row.business_id]);
      // Notify the user
      await sendEmail({
        to: row.email,
        subject: '⚠️ Tu prueba gratuita de MenuBot ha vencido',
        html: buildTrialExpiredEmail({ name: row.name }),
      });
      summary.expired++;
    } catch (e) {
      summary.errors.push(`expire ${row.id}: ${String(e)}`);
    }
  }

  console.log('[billing-check]', summary);
  return NextResponse.json(summary);
}

/** Also allow GET for easy manual triggering (Railway cron supports both). */
export async function GET(req: NextRequest) {
  return POST(req);
}

function buildTrialWarningEmail({ name, daysLeft }: { name: string; daysLeft: number }) {
  return `<!DOCTYPE html>
<html lang="es"><body style="font-family:system-ui,sans-serif;background:#faf7f2;margin:0;padding:32px 16px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e3dbd0">
  <div style="font-size:28px;margin-bottom:8px">⏳</div>
  <h1 style="font-size:20px;color:#1a1208;margin:0 0 8px">Hola ${name}, tu prueba vence pronto</h1>
  <p style="color:#4a3f2f;font-size:14px;line-height:1.6;margin:0 0 20px">
    Te quedan <strong>${daysLeft} día${daysLeft !== 1 ? 's' : ''}</strong> de prueba gratuita en MenuBot.
    Elige un plan para mantener tu carta activa y seguir atendiendo a tus clientes.
  </p>
  <a href="https://menubot-production.up.railway.app/dashboard/billing"
     style="display:inline-block;background:#c76b43;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
    Ver planes →
  </a>
  <p style="color:#8a7a66;font-size:12px;margin:24px 0 0;line-height:1.5">
    ¿Preguntas? Escríbenos a <a href="mailto:hola@menubot.cl" style="color:#c76b43">hola@menubot.cl</a>
  </p>
</div>
</body></html>`;
}

function buildTrialExpiredEmail({ name }: { name: string }) {
  return `<!DOCTYPE html>
<html lang="es"><body style="font-family:system-ui,sans-serif;background:#faf7f2;margin:0;padding:32px 16px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e3dbd0">
  <div style="font-size:28px;margin-bottom:8px">🔒</div>
  <h1 style="font-size:20px;color:#1a1208;margin:0 0 8px">Hola ${name}, tu prueba ha vencido</h1>
  <p style="color:#4a3f2f;font-size:14px;line-height:1.6;margin:0 0 20px">
    Tu periodo de prueba gratuita en MenuBot ha terminado y tu carta ha sido suspendida temporalmente.
    Activa tu suscripción para reactivarla en segundos — todos tus datos están intactos.
  </p>
  <a href="https://menubot-production.up.railway.app/dashboard/billing"
     style="display:inline-block;background:#c76b43;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
    Reactivar mi carta →
  </a>
  <p style="color:#8a7a66;font-size:12px;margin:24px 0 0;line-height:1.5">
    ¿Necesitas ayuda? <a href="mailto:hola@menubot.cl" style="color:#c76b43">hola@menubot.cl</a>
  </p>
</div>
</body></html>`;
}
