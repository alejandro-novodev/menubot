import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';
import { SEED_DEMO_BUSINESSES } from '../db/seed-data';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedDemo() {
  const client = await pool.connect();
  try {
    // Add is_demo column if it doesn't exist (idempotent)
    await client.query(`
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false
    `);
    console.log('✓ is_demo column ready');

    // Find admin user
    const adminResult = await client.query<{ id: number; email: string }>(
      `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1`
    );
    if (adminResult.rows.length === 0) {
      console.error('✗ No admin user found. Create an admin user first.');
      process.exit(1);
    }
    const adminId = adminResult.rows[0].id;
    console.log(`✓ Admin user: ${adminResult.rows[0].email} (id=${adminId})`);

    // Remove existing demo businesses (dishes cascade-delete via FK)
    const oldDemos = await client.query<{ id: number; name: string }>(
      'SELECT id, name FROM businesses WHERE is_demo = true'
    );
    for (const biz of oldDemos.rows) {
      await client.query('DELETE FROM subscriptions WHERE business_id = $1', [biz.id]);
      await client.query('DELETE FROM dishes WHERE business_id = $1', [biz.id]);
      await client.query('DELETE FROM businesses WHERE id = $1', [biz.id]);
      console.log(`  ↳ Removed old demo: ${biz.name}`);
    }

    let totalDishes = 0;

    // Demo contact/location info (fictional — for showcase only)
    const DEMO_INFO: Record<string, { address: string; phone: string; hours: string }> = {
      'el-meson-austral':   { address: 'Los Alerces 1847, Barrio Italia, Santiago',        phone: '+56 2 2345 6789', hours: 'Lun–Dom 12:00–23:00' },
      'hotel-los-quillayes':{ address: 'Av. Las Quillayes 9900, Lo Barnechea, Santiago',   phone: '+56 2 2456 7890', hours: 'Recepción 24 horas' },
      'bar-el-condor':      { address: 'Pasaje El Cóndor 242, Barrio Lastarria, Santiago', phone: '+56 9 8765 4321', hours: 'Mar–Sáb 19:00–02:00' },
      'cafe-temporada':     { address: 'Av. del Parque 3301, Barrio Italia, Santiago',     phone: '+56 9 5678 9012', hours: 'Lun–Vie 07:30–19:00 · Sáb–Dom 09:00–17:00' },
    };

    for (const biz of SEED_DEMO_BUSINESSES) {
      const demo = DEMO_INFO[biz.slug] ?? {};
      // Insert business
      const bizResult = await client.query<{ id: number }>(
        `INSERT INTO businesses (user_id, name, slug, description, business_type, is_demo, status, menu_completeness, address, phone, hours)
         VALUES ($1, $2, $3, $4, $5, true, 'active', 85, $6, $7, $8)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name,
               description = EXCLUDED.description,
               business_type = EXCLUDED.business_type,
               is_demo = true,
               status = 'active',
               address = EXCLUDED.address,
               phone = EXCLUDED.phone,
               hours = EXCLUDED.hours
         RETURNING id`,
        [adminId, biz.name, biz.slug, biz.description, biz.businessType, demo.address ?? null, demo.phone ?? null, demo.hours ?? null]
      );
      const businessId = bizResult.rows[0].id;

      // Clear existing dishes for this business
      await client.query('DELETE FROM dishes WHERE business_id = $1', [businessId]);

      // Insert dishes
      for (const dish of biz.dishes) {
        await client.query(
          `INSERT INTO dishes (business_id, name, description, ingredients, price, category, allergens)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [businessId, dish.name, dish.description, dish.ingredients, dish.price, dish.category, dish.allergens]
        );
      }

      // Upsert active subscription (Pro plan, no expiry)
      await client.query(
        `INSERT INTO subscriptions (user_id, business_id, plan, status, billing_cycle, started_at, price_clp)
         VALUES ($1, $2, 'pro', 'active', 'monthly', NOW(), 0)
         ON CONFLICT DO NOTHING`,
        [adminId, businessId]
      );

      console.log(`✓ ${biz.name} [${biz.businessType}]: ${biz.dishes.length} items`);
      totalDishes += biz.dishes.length;
    }

    console.log(`\n✓ Demo seed complete: ${SEED_DEMO_BUSINESSES.length} businesses, ${totalDishes} total items`);
    console.log('  Slugs available at /chat/<slug>:');
    SEED_DEMO_BUSINESSES.forEach(b => console.log(`    /chat/${b.slug}`));
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemo().catch(err => {
  console.error('Demo seed failed:', err);
  process.exit(1);
});
