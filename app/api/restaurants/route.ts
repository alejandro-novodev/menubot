import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export async function GET() {
  try {
    const result = await query<Restaurant>(
      'SELECT id, name, slug, description FROM restaurants ORDER BY name'
    );
    return NextResponse.json({ restaurants: result.rows });
  } catch (error) {
    console.error('Restaurants fetch error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
