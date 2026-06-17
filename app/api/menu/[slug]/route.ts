import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resolveMenuSource } from '@/lib/menuSource';

interface DishRow {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  icon: string | null;
  is_recommended: boolean;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const source = await resolveMenuSource(slug);
    if (!source) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const dishResult = await query<DishRow>(
      `SELECT id, name, description, price, category, image, icon, is_recommended
       FROM dishes
       WHERE ${source.dishColumn} = $1
       ORDER BY category, name`,
      [source.id]
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
