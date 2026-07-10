import { config } from 'dotenv';
config({ path: '.env.local' });

import { hash } from 'bcryptjs';

/**
 * Seeds one test account per plan tier, each with an active business and an
 * active subscription, for testing plan gating, quotas, and billing flows.
 *
 *   npm run seed:test-users
 *
 * Idempotent: re-running refreshes plan, password, and menu. Manual-only —
 * never wired into build/deploy. Password for every account: MenubotTest123!
 */
const PASSWORD = 'MenubotTest123!';

const ACCOUNTS = [
  { plan: 'free', email: 'test-free@menubot.local', name: 'Test Free', biz: 'Test Free Café', slug: 'test-free', priceClp: 0 },
  { plan: 'starter', email: 'test-starter@menubot.local', name: 'Test Starter', biz: 'Test Starter Bistró', slug: 'test-starter', priceClp: 14990 },
  { plan: 'pro', email: 'test-pro@menubot.local', name: 'Test Pro', biz: 'Test Pro Restaurant', slug: 'test-pro', priceClp: 24990 },
  { plan: 'multi', email: 'test-multi@menubot.local', name: 'Test Multi', biz: 'Test Multi Grupo', slug: 'test-multi', priceClp: 59990 },
  { plan: 'enterprise', email: 'test-enterprise@menubot.local', name: 'Test Enterprise', biz: 'Test Enterprise Hotel', slug: 'test-enterprise', priceClp: null },
];

const DISHES = [
  { name: 'Empanadas de Pino', description: 'Carne, cebolla, huevo y aceituna.', ingredients: 'carne, cebolla, huevo, aceituna', price: 3500, category: 'entradas', allergens: 'gluten', is_recommended: true, icon: '🥟' },
  { name: 'Lomo a lo Pobre', description: 'Lomo, papas fritas, huevo y cebolla.', ingredients: 'res, papa, huevo, cebolla', price: 14900, category: 'principales', allergens: 'huevo', is_recommended: true, icon: '🥩' },
  { name: 'Risotto de Camarón', description: 'Arroz cremoso con camarones salteados.', ingredients: 'arroz, camarón, mantequilla, parmesano', price: 13500, category: 'principales', allergens: 'mariscos, lácteos', is_recommended: false, icon: '🍤' },
  { name: 'Suspiro Limeño', description: 'Manjar y merengue al oporto.', ingredients: 'leche, huevo, oporto', price: 5200, category: 'postres', allergens: 'huevo, lácteos', is_recommended: false, icon: '🍮' },
  { name: 'Pisco Sour', description: 'Pisco, limón, jarabe y clara.', ingredients: 'pisco, limón, jarabe, clara de huevo', price: 5800, category: 'bebidas', allergens: 'huevo', is_recommended: true, icon: '🍸' },
];

(async () => {
  const { query } = await import('../lib/db');
  const passwordHash = await hash(PASSWORD, 10);
  const results: Array<{ email: string; plan: string; slug: string }> = [];

  // Test admin (no business) — for exercising /admin with a known login.
  const ADMIN_EMAIL_TEST = 'test-admin@menubot.local';
  const adminExisting = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL_TEST]);
  if (adminExisting.rows.length) {
    await query("UPDATE users SET role = 'admin', approved = true, password_hash = $1 WHERE id = $2", [passwordHash, adminExisting.rows[0].id]);
  } else {
    await query(
      "INSERT INTO users (name, email, role, approved, password_hash) VALUES ('Test Admin', $1, 'admin', true, $2)",
      [ADMIN_EMAIL_TEST, passwordHash]
    );
  }
  results.push({ email: ADMIN_EMAIL_TEST, plan: '(admin)', slug: '—' });

  for (const acc of ACCOUNTS) {
    // 1. Upsert the user (password login enabled, pre-approved).
    const existing = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [acc.email]);
    let userId: number;
    if (existing.rows.length) {
      userId = existing.rows[0].id;
      await query(
        "UPDATE users SET name = $1, role = 'owner', approved = true, password_hash = $2 WHERE id = $3",
        [acc.name, passwordHash, userId]
      );
    } else {
      const r = await query<{ id: number }>(
        "INSERT INTO users (name, email, role, approved, password_hash) VALUES ($1, $2, 'owner', true, $3) RETURNING id",
        [acc.name, acc.email, passwordHash]
      );
      userId = r.rows[0].id;
    }

    // 2. Upsert the business.
    const bizExisting = await query<{ id: number }>('SELECT id FROM businesses WHERE slug = $1', [acc.slug]);
    let bizId: number;
    if (bizExisting.rows.length) {
      bizId = bizExisting.rows[0].id;
      await query(
        `UPDATE businesses SET user_id = $1, name = $2, status = 'active', business_type = 'restaurant', menu_completeness = 85 WHERE id = $3`,
        [userId, acc.biz, bizId]
      );
    } else {
      const r = await query<{ id: number }>(
        `INSERT INTO businesses (user_id, name, slug, status, business_type, description, menu_completeness)
         VALUES ($1, $2, $3, 'active', 'restaurant', $4, 85) RETURNING id`,
        [userId, acc.biz, acc.slug, `Negocio de prueba — plan ${acc.plan}.`]
      );
      bizId = r.rows[0].id;
    }

    // 3. Refresh the sample menu.
    await query('DELETE FROM dishes WHERE business_id = $1', [bizId]);
    for (const d of DISHES) {
      await query(
        `INSERT INTO dishes (business_id, name, description, ingredients, price, category, allergens, is_recommended, icon)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [bizId, d.name, d.description, d.ingredients, d.price, d.category, d.allergens, d.is_recommended, d.icon]
      );
    }

    // 4. Reset to a single active subscription for the account's plan.
    //    ends_at: NULL for free/enterprise (no renewal), +1 month for paid.
    await query("UPDATE subscriptions SET status = 'cancelled' WHERE business_id = $1 AND status <> 'cancelled'", [bizId]);
    const endsAt = acc.plan === 'free' || acc.plan === 'enterprise' ? null : "NOW() + interval '1 month'";
    await query(
      `INSERT INTO subscriptions (user_id, business_id, plan, status, price_clp, billing_cycle, started_at, ends_at)
       VALUES ($1, $2, $3, 'active', $4, 'monthly', NOW(), ${endsAt ?? 'NULL'})`,
      [userId, bizId, acc.plan, acc.priceClp]
    );

    results.push({ email: acc.email, plan: acc.plan, slug: acc.slug });
  }

  console.log('Test users seeded. Password for all accounts:', PASSWORD);
  console.table(results);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
