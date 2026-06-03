import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await query<Restaurant>(
      'SELECT id, name, slug, description FROM restaurants WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Restaurant fetch error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
