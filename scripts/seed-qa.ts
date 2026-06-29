import { config } from 'dotenv';
config({ path: '.env.local' });

/**
 * Seeds an isolated QA account for Claude to navigate the logged-in UI.
 * - owner role, approved, but password_hash = NULL → NOT loginable via any form
 *   (credentials authorize returns null without a hash). Access is only via a
 *   dev session minted locally from AUTH_SECRET.
 * - its own "QA Test" business + a small sample menu, so real businesses
 *   (Bocas del Mar / Izakaya) are never touched.
 * Idempotent: re-running refreshes the business + menu.
 */
const EMAIL = 'qa@menubot.local';
const SLUG = 'qa-test';

const WEEK = [
  { open: true, shifts: [{ from: '12:00', to: '23:00' }] }, // Lun
  { open: true, shifts: [{ from: '12:00', to: '23:00' }] }, // Mar
  { open: true, shifts: [{ from: '12:00', to: '23:00' }] }, // Mié
  { open: true, shifts: [{ from: '12:00', to: '23:00' }] }, // Jue
  { open: true, shifts: [{ from: '12:00', to: '00:00' }] }, // Vie
  { open: true, shifts: [{ from: '13:00', to: '16:00' }, { from: '19:00', to: '00:00' }] }, // Sáb
  { open: false, shifts: [{ from: '12:00', to: '23:00' }] }, // Dom
];

const DISHES = [
  { name: 'Empanadas de Pino', description: 'Carne, cebolla, huevo y aceituna.', ingredients: 'carne, cebolla, huevo, aceituna', price: 3500, category: 'entradas', allergens: 'gluten', is_recommended: true, icon: '🥟' },
  { name: 'Ceviche Mixto', description: 'Pescado y mariscos en leche de tigre.', ingredients: 'pescado, mariscos, limón, cebolla morada', price: 12900, category: 'entradas', allergens: 'pescado, mariscos', is_recommended: false, icon: '🐟' },
  { name: 'Lomo a lo Pobre', description: 'Lomo, papas fritas, huevo y cebolla.', ingredients: 'res, papa, huevo, cebolla', price: 14900, category: 'principales', allergens: 'huevo', is_recommended: true, icon: '🥩' },
  { name: 'Risotto de Camarón', description: 'Arroz cremoso con camarones salteados.', ingredients: 'arroz, camarón, mantequilla, parmesano', price: 13500, category: 'principales', allergens: 'mariscos, lácteos', is_recommended: false, icon: '🍤' },
  { name: 'Suspiro Limeño', description: 'Manjar y merengue al oporto.', ingredients: 'leche, huevo, oporto', price: 5200, category: 'postres', allergens: 'huevo, lácteos', is_recommended: false, icon: '🍮' },
  { name: 'Pisco Sour', description: 'Pisco, limón, jarabe y clara.', ingredients: 'pisco, limón, jarabe, clara de huevo', price: 5800, category: 'bebidas', allergens: 'huevo', is_recommended: true, icon: '🍸' },
];

(async () => {
  const { query } = await import('../lib/db');

  // 1. Upsert the QA user (no password → not loginable via form).
  const existing = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [EMAIL]);
  let userId: number;
  if (existing.rows.length) {
    userId = existing.rows[0].id;
    await query('UPDATE users SET role = $1, approved = true, password_hash = NULL WHERE id = $2', ['owner', userId]);
  } else {
    const r = await query<{ id: number }>(
      "INSERT INTO users (name, email, role, approved) VALUES ($1, $2, 'owner', true) RETURNING id",
      ['Claude QA', EMAIL]
    );
    userId = r.rows[0].id;
  }

  // 2. Upsert the QA business.
  const socials = { instagram: 'https://instagram.com/qatest', whatsapp: 'https://wa.me/56900000000', tripadvisor: 'https://tripadvisor.com/qatest' };
  const bizExisting = await query<{ id: number }>('SELECT id FROM businesses WHERE slug = $1', [SLUG]);
  let bizId: number;
  const profile = {
    description: 'Restaurante de prueba para QA — cocina chilena y peruana.',
    address: 'Av. Demo 123, Providencia, Santiago',
    maps_url: 'https://maps.app.goo.gl/qatestdemo',
    phone: '+56 2 2345 6789',
    hours: 'Lun–Jue 12:00–23:00 · Vie 12:00–00:00 · Sáb 13:00–16:00, 19:00–00:00 · Dom cerrado',
    hours_json: JSON.stringify(WEEK),
  };
  if (bizExisting.rows.length) {
    bizId = bizExisting.rows[0].id;
    await query(
      `UPDATE businesses SET user_id=$1, name=$2, status='active', business_type='restaurant',
         description=$3, address=$4, maps_url=$5, phone=$6, hours=$7, hours_json=$8,
         instagram=$9, whatsapp=$10, tripadvisor=$11 WHERE id=$12`,
      [userId, 'QA Test', profile.description, profile.address, profile.maps_url, profile.phone, profile.hours, profile.hours_json, socials.instagram, socials.whatsapp, socials.tripadvisor, bizId]
    );
  } else {
    const r = await query<{ id: number }>(
      `INSERT INTO businesses (user_id, name, slug, status, business_type, description, address, maps_url, phone, hours, hours_json, instagram, whatsapp, tripadvisor, menu_completeness)
       VALUES ($1,'QA Test',$2,'active','restaurant',$3,$4,$5,$6,$7,$8,$9,$10,$11,90) RETURNING id`,
      [userId, SLUG, profile.description, profile.address, profile.maps_url, profile.phone, profile.hours, profile.hours_json, socials.instagram, socials.whatsapp, socials.tripadvisor]
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

  console.log(JSON.stringify({ userId, bizId, email: EMAIL, slug: SLUG, dishes: DISHES.length }, null, 2));
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
