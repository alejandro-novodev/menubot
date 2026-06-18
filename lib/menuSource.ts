import { query } from '@/lib/db';

/**
 * Resolves a public slug to the menu's data source.
 *
 * The app has two parallel tables: `businesses` (real owner accounts, written by
 * onboarding/editor/importer) and the legacy `restaurants` table (seeded demo).
 * A real business wins; otherwise we fall back to the demo restaurants table.
 * `dishColumn` tells callers which foreign key to read dishes from. `profile`
 * carries the restaurant info used to enrich the chat (businesses only).
 */
export interface MenuProfile {
  address: string | null;
  maps_url: string | null;
  phone: string | null;
  hours: string | null;
  notes: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  tripadvisor: string | null;
  website: string | null;
}

export interface MenuSource {
  id: number;
  name: string;
  description: string;
  dishColumn: 'business_id' | 'restaurant_id';
  profile: MenuProfile | null;
}

interface BizRow {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  maps_url: string | null;
  phone: string | null;
  hours: string | null;
  notes: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  tripadvisor: string | null;
  website: string | null;
}

export async function resolveMenuSource(slug: string): Promise<MenuSource | null> {
  const biz = await query<BizRow>(
    `SELECT id, name, description, address, maps_url, phone, hours, notes,
            instagram, facebook, tiktok, whatsapp, tripadvisor, website
     FROM businesses WHERE slug = $1 AND status <> 'suspended' LIMIT 1`,
    [slug]
  );
  if (biz.rows.length > 0) {
    const b = biz.rows[0];
    return {
      id: b.id,
      name: b.name,
      description: b.description ?? '',
      dishColumn: 'business_id',
      profile: {
        address: b.address, maps_url: b.maps_url, phone: b.phone, hours: b.hours, notes: b.notes,
        instagram: b.instagram, facebook: b.facebook, tiktok: b.tiktok,
        whatsapp: b.whatsapp, tripadvisor: b.tripadvisor, website: b.website,
      },
    };
  }

  const rest = await query<{ id: number; name: string; description: string | null }>(
    `SELECT id, name, description FROM restaurants WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  if (rest.rows.length > 0) {
    const r = rest.rows[0];
    return { id: r.id, name: r.name, description: r.description ?? '', dishColumn: 'restaurant_id', profile: null };
  }

  return null;
}
