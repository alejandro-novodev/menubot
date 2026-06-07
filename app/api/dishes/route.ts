import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { calcMenuCompleteness } from '@/lib/completeness';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { businessId, name, description, price, category, ingredients, allergens } = await req.json() as {
    businessId: number;
    name: string;
    description?: string;
    price?: number;
    category?: string;
    ingredients?: string;
    allergens?: string;
  };

  if (!businessId || !name?.trim()) {
    return NextResponse.json({ error: 'businessId y name son requeridos.' }, { status: 400 });
  }

  const bizCheck = await query(
    'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
    [businessId, parseInt(session.user.id)]
  );
  if (bizCheck.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const result = await query<{ id: number }>(
    `INSERT INTO dishes (business_id, name, description, price, category, ingredients, allergens)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [businessId, name.trim(), description ?? null, price ?? null, category ?? null, ingredients ?? null, allergens ?? null]
  );

  // Refresh completeness
  const dishes = await query(
    'SELECT description, price, category, ingredients, allergens FROM dishes WHERE business_id = $1',
    [businessId]
  );
  const score = calcMenuCompleteness(dishes.rows);
  await query('UPDATE businesses SET menu_completeness = $1 WHERE id = $2', [score, businessId]);

  return NextResponse.json({ success: true, dishId: result.rows[0].id, completeness: score });
}
