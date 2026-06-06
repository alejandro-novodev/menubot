import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json() as {
      name: string;
      email: string;
      password: string;
    };

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Todos los campos son requeridos.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query<{ id: number }>(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'owner') RETURNING id`,
      [name.trim(), email.trim(), hash]
    );

    return NextResponse.json({ success: true, userId: result.rows[0].id });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
