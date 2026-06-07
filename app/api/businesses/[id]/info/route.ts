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
  const result = await query<{ id: number; name: string; slug: string; status: string; menu_completeness: number; business_type: string }>(
    `SELECT id, name, slug, status, menu_completeness, business_type
     FROM businesses WHERE id = $1 AND user_id = $2`,
    [id, parseInt(session.user.id)]
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}
