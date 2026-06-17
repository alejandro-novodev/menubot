import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { calcMenuCompleteness } from '@/lib/completeness';

async function verifyDishOwner(dishId: number, userId: number): Promise<boolean> {
  const res = await query(
    `SELECT d.id FROM dishes d
     JOIN businesses b ON b.id = d.business_id
     WHERE d.id = $1 AND b.user_id = $2`,
    [dishId, userId]
  );
  return res.rows.length > 0;
}

async function refreshCompleteness(dishId: number) {
  const res = await query<{ business_id: number }>(
    'SELECT business_id FROM dishes WHERE id = $1', [dishId]
  );
  if (!res.rows[0]) return;
  const bizId = res.rows[0].business_id;
  const dishes = await query(
    'SELECT description, price, category, ingredients, allergens FROM dishes WHERE business_id = $1',
    [bizId]
  );
  const score = calcMenuCompleteness(dishes.rows);
  await query('UPDATE businesses SET menu_completeness = $1 WHERE id = $2', [score, bizId]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const dishId = parseInt(id);
  if (!await verifyDishOwner(dishId, parseInt(session.user.id))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json() as Record<string, unknown>;
  const fields = ['name', 'description', 'price', 'category', 'ingredients', 'allergens', 'image', 'icon'];
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const f of fields) {
    if (f in body) {
      updates.push(`${f} = $${values.length + 1}`);
      values.push(body[f] ?? null);
    }
  }

  if (updates.length === 0) return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });

  values.push(dishId);
  await query(`UPDATE dishes SET ${updates.join(', ')} WHERE id = $${values.length}`, values);
  await refreshCompleteness(dishId);

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const dishId = parseInt(id);
  if (!await verifyDishOwner(dishId, parseInt(session.user.id))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  await query('DELETE FROM dishes WHERE id = $1', [dishId]);
  await refreshCompleteness(dishId);

  return NextResponse.json({ success: true });
}
