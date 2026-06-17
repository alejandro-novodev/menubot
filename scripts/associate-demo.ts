import { config } from 'dotenv';
config({ path: '.env.local' });

/**
 * One-off admin op:
 *  - promote the given user to `admin`
 *  - adopt every legacy `restaurants` row as a `business` owned by that user,
 *    linking its dishes via dishes.business_id so they appear in the dashboard
 *    and are served by the public chat resolver.
 * Idempotent: safe to re-run.
 */
const EMAIL = process.env.ASSOCIATE_EMAIL || 'alejandro.luza@gmail.com';

(async () => {
  const { query } = await import('../lib/db');
  const { calcMenuCompleteness } = await import('../lib/completeness');

  const u = await query<{ id: number }>(`SELECT id FROM users WHERE email = $1`, [EMAIL]);
  if (!u.rows[0]) { console.error(`User ${EMAIL} not found`); process.exit(1); }
  const userId = u.rows[0].id;

  await query(`UPDATE users SET role = 'admin' WHERE id = $1`, [userId]);
  console.log(`✓ user ${userId} (${EMAIL}) → role admin`);

  const rests = await query<{ id: number; name: string; slug: string; description: string | null }>(
    `SELECT id, name, slug, description FROM restaurants ORDER BY id`
  );

  for (const r of rests.rows) {
    const existing = await query<{ id: number }>(`SELECT id FROM businesses WHERE slug = $1`, [r.slug]);
    let bizId: number;
    if (existing.rows[0]) {
      bizId = existing.rows[0].id;
      await query(`UPDATE businesses SET user_id = $1 WHERE id = $2`, [userId, bizId]);
      console.log(`• ${r.slug}: business ${bizId} exists → owner = ${userId}`);
    } else {
      const ins = await query<{ id: number }>(
        `INSERT INTO businesses (user_id, name, slug, description, business_type, status)
         VALUES ($1, $2, $3, $4, 'restaurant', 'active') RETURNING id`,
        [userId, r.name, r.slug, r.description]
      );
      bizId = ins.rows[0].id;
      console.log(`• ${r.slug}: created business ${bizId}`);
    }

    const upd = await query(
      `UPDATE dishes SET business_id = $1
       WHERE restaurant_id = $2 AND (business_id IS NULL OR business_id <> $1)`,
      [bizId, r.id]
    );
    const dishes = await query(
      `SELECT description, price, category, ingredients, allergens FROM dishes WHERE business_id = $1`,
      [bizId]
    );
    const score = calcMenuCompleteness(dishes.rows);
    await query(`UPDATE businesses SET menu_completeness = $1 WHERE id = $2`, [score, bizId]);
    console.log(`    linked ${upd.rowCount} dishes · ${dishes.rows.length} total · completeness ${score}%`);
  }

  console.log('Done.');
  process.exit(0);
})();
