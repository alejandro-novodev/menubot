import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SEED_RESTAURANTS } from '../db/seed-data';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    const schema = readFileSync(join(__dirname, '../db/schema.sql'), 'utf-8');
    await client.query(schema);
    console.log('✓ Schema ready');

    let totalDishes = 0;

    for (const { name, slug, description, dishes } of SEED_RESTAURANTS) {
      await client.query(
        `INSERT INTO restaurants (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [name, slug, description]
      );

      const { rows } = await client.query<{ id: number }>(
        'SELECT id FROM restaurants WHERE slug = $1',
        [slug]
      );
      const restaurantId = rows[0].id;

      await client.query('DELETE FROM dishes WHERE restaurant_id = $1', [restaurantId]);

      for (const dish of dishes) {
        await client.query(
          `INSERT INTO dishes (restaurant_id, name, description, ingredients, price, category, allergens)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [restaurantId, dish.name, dish.description, dish.ingredients, dish.price, dish.category, dish.allergens]
        );
      }

      console.log(`✓ ${name}: ${dishes.length} platos`);
      totalDishes += dishes.length;
    }

    console.log(`\n✓ Total: ${SEED_RESTAURANTS.length} restaurantes, ${totalDishes} platos`);
    console.log('✓ Done');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
