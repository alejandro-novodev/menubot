import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const businessId = parseInt(id);

  const bizCheck = await query(
    'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
    [businessId, parseInt(session.user.id)]
  );
  if (bizCheck.rows.length === 0) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const dishes = await query(
    `SELECT id, name, description, price, category, ingredients, allergens
     FROM dishes WHERE business_id = $1 ORDER BY category, name`,
    [businessId]
  );

  return NextResponse.json({ dishes: dishes.rows });
}
