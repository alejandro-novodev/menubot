import { query } from '@/lib/db';

/**
 * Resolves a public slug to the menu's data source.
 *
 * The app has two parallel tables: `businesses` (real owner accounts, written by
 * onboarding/editor/importer) and the legacy `restaurants` table (seeded demo,
 * historically read by the public chat). This helper unifies the read path:
 * a real business wins; otherwise we fall back to the demo restaurants table.
 * `dishColumn` tells callers which foreign key to read dishes from.
 */
export interface MenuSource {
  id: number;
  name: string;
  description: string;
  dishColumn: 'business_id' | 'restaurant_id';
}

interface Row {
  id: number;
  name: string;
  description: string | null;
}

export async function resolveMenuSource(slug: string): Promise<MenuSource | null> {
  // Prefer a real business account (exclude suspended ones from the public).
  const biz = await query<Row>(
    `SELECT id, name, description FROM businesses WHERE slug = $1 AND status <> 'suspended' LIMIT 1`,
    [slug]
  );
  if (biz.rows.length > 0) {
    const b = biz.rows[0];
    return { id: b.id, name: b.name, description: b.description ?? '', dishColumn: 'business_id' };
  }

  // Fall back to the legacy/demo restaurants table.
  const rest = await query<Row>(
    `SELECT id, name, description FROM restaurants WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  if (rest.rows.length > 0) {
    const r = rest.rows[0];
    return { id: r.id, name: r.name, description: r.description ?? '', dishColumn: 'restaurant_id' };
  }

  return null;
}
