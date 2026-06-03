import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { query } from '@/lib/db';
import { buildContactEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, restaurantName, email, plan, message } = await req.json() as {
      name: string;
      restaurantName: string;
      email: string;
      plan?: string;
      message?: string;
    };

    if (!name?.trim() || !restaurantName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Nombre, restaurante y email son requeridos.' }, { status: 400 });
    }

    const n = name.trim();
    const r = restaurantName.trim();
    const e = email.trim();
    const p = plan?.trim() || undefined;
    const m = message?.trim() || undefined;

    // Save to DB
    await query(
      `INSERT INTO waitlist (name, restaurant_name, email, plan, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [n, r, e, p ?? null, m ?? null]
    );

    // Send notification email (non-blocking — don't fail the request if email fails)
    if (process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: 'MenuBot <onboarding@resend.dev>',
        to: 'alejandro.luza@gmail.com',
        subject: `[MenuBot] Nueva solicitud — ${r}`,
        html: buildContactEmail({ name: n, restaurantName: r, email: e, plan: p, message: m }),
      }).catch((err) => console.error('Email send error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
