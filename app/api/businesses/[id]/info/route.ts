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
  const result = await query(
    `SELECT id, name, slug, status, menu_completeness, business_type,
            description, address, maps_url, phone, hours, notes,
            instagram, facebook, tiktok, whatsapp, tripadvisor, website
     FROM businesses WHERE id = $1 AND user_id = $2`,
    [id, parseInt(session.user.id)]
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const businessId = parseInt(id);

  const owner = await query('SELECT id FROM businesses WHERE id = $1 AND user_id = $2', [businessId, parseInt(session.user.id)]);
  if (owner.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const body = await req.json() as Record<string, unknown>;
  const editable = ['name', 'description', 'address', 'maps_url', 'phone', 'hours', 'notes',
    'instagram', 'facebook', 'tiktok', 'whatsapp', 'tripadvisor', 'website'];
  const updates: string[] = [];
  const values: unknown[] = [];
  for (const f of editable) {
    if (f in body) {
      const v = typeof body[f] === 'string' ? (body[f] as string).trim() || null : body[f] ?? null;
      if (f === 'name' && !v) continue; // never clear the required name
      updates.push(`${f} = $${values.length + 1}`);
      values.push(v);
    }
  }
  if (updates.length === 0) return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });

  values.push(businessId);
  await query(`UPDATE businesses SET ${updates.join(', ')} WHERE id = $${values.length}`, values);
  return NextResponse.json({ success: true });
}
