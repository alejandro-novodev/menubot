import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SEED_RESTAURANTS } from '@/db/seed-data';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await query(schema);

    let totalDishes = 0;

    for (const { name, slug, description, dishes } of SEED_RESTAURANTS) {
      await query(
        `INSERT INTO restaurants (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [name, slug, description]
      );

      const { rows } = await query<{ id: number }>(
        'SELECT id FROM restaurants WHERE slug = $1',
        [slug]
      );
      const restaurantId = rows[0].id;

      // Delete existing dishes to avoid duplicates on re-seed
      await query('DELETE FROM dishes WHERE restaurant_id = $1', [restaurantId]);

      for (const dish of dishes) {
        await query(
          `INSERT INTO dishes (restaurant_id, name, description, ingredients, price, category, allergens)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [restaurantId, dish.name, dish.description, dish.ingredients, dish.price, dish.category, dish.allergens]
        );
      }

      totalDishes += dishes.length;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${SEED_RESTAURANTS.length} restaurants and ${totalDishes} dishes`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
