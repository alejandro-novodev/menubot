import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resolveMenuSource } from '@/lib/menuSource';
import { resolveLang } from '@/lib/languages';
import { getBusinessPlan } from '@/lib/subscription';
import { getFeatures } from '@/lib/plan-features';
import { translateMenu } from '@/lib/translate';

export const runtime = 'nodejs';

interface DishRow {
  id: number;
  name: string;
  description: string | null;
  ingredients: string | null;
  allergens: string | null;
  price: number;
  category: string;
  image: string | null;
  icon: string | null;
  is_recommended: boolean;
  available: boolean;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const lang = resolveLang(req.nextUrl.searchParams.get('lang'));

    const source = await resolveMenuSource(slug);
    if (!source) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const dishResult = await query<DishRow>(
      `SELECT id, name, description, ingredients, allergens, price, category, image, icon, is_recommended, available
       FROM dishes
       WHERE ${source.dishColumn} = $1
       ORDER BY category, name`,
      [source.id]
    );
    let dishes = dishResult.rows;

    // Translated menu is a Pro+ feature; the source stays Spanish otherwise.
    if (lang !== 'es' && source.dishColumn === 'business_id') {
      const features = getFeatures(await getBusinessPlan(source.id));
      if (features.menuTranslation) {
        const tr = await translateMenu(
          dishes.map((d) => ({ id: d.id, name: d.name, description: d.description, ingredients: d.ingredients, allergens: d.allergens, category: d.category })),
          lang
        );
        dishes = dishes.map((d) => {
          const t = tr.get(d.id);
          return t ? { ...d, description: t.description, ingredients: t.ingredients, allergens: t.allergens, category: t.category ?? d.category } : d;
        });
      }
    }

    const grouped: Record<string, DishRow[]> = {};
    for (const dish of dishes) {
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
