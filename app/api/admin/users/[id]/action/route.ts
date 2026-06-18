import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id);
  const { action } = await req.json() as { action: 'approve' | 'revoke' };

  // Never let an admin lock themselves (or another admin) out.
  const target = await query<{ role: string }>('SELECT role FROM users WHERE id = $1', [userId]);
  if (target.rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  if (action === 'revoke' && target.rows[0].role === 'admin') {
    return NextResponse.json({ error: 'No puedes revocar a un administrador' }, { status: 400 });
  }

  if (action === 'approve') {
    await query('UPDATE users SET approved = true WHERE id = $1', [userId]);
  } else if (action === 'revoke') {
    await query('UPDATE users SET approved = false WHERE id = $1', [userId]);
  } else {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
