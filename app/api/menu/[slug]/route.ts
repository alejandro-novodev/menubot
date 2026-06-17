import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface DishRow {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  icon: string | null;
}

interface Restaurant {
  id: number;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const restResult = await query<Restaurant>(
      'SELECT id FROM restaurants WHERE slug = $1',
      [slug]
    );

    if (restResult.rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const dishResult = await query<DishRow>(
      `SELECT id, name, description, price, category, image, icon
       FROM dishes
       WHERE restaurant_id = $1
       ORDER BY category, name`,
      [restResult.rows[0].id]
    );

    const grouped: Record<string, DishRow[]> = {};
    for (const dish of dishResult.rows) {
      const cat = dish.category || 'Otros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(dish);
    }

    return NextResponse.json({ categories: grouped });
  } catch (error) {
    console.error('Menu fetch error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
