import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { name, description, businessType, slug: rawSlug } = await req.json() as {
      name: string;
      description?: string;
      businessType: string;
      slug?: string;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });
    }

    const baseSlug = slugify(rawSlug?.trim() || name.trim());

    // Ensure slug is unique
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await query('SELECT id FROM businesses WHERE slug = $1', [slug]);
      if (existing.rows.length === 0) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // Create business
    const bizResult = await query<{ id: number }>(
      `INSERT INTO businesses (user_id, name, slug, description, business_type, status)
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING id`,
      [parseInt(session.user.id), name.trim(), slug, description?.trim() || null, businessType]
    );
    const businessId = bizResult.rows[0].id;

    // Create 14-day trial subscription
    await query(
      `INSERT INTO subscriptions (user_id, business_id, plan, status, started_at, ends_at, price_clp)
       VALUES ($1, $2, 'trial', 'active', NOW(), NOW() + INTERVAL '14 days', 0)`,
      [parseInt(session.user.id), businessId]
    );

    return NextResponse.json({ success: true, businessId, slug });
  } catch (error) {
    console.error('Business create error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
