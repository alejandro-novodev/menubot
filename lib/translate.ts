import { createHash } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { query } from './db';
import { aiNameFor, type LangCode } from './languages';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TranslatableDish {
  id: number;
  name: string;
  description: string | null;
  ingredients: string | null;
  allergens: string | null;
  category: string | null;
}

export interface DishTranslation {
  description: string | null;
  ingredients: string | null;
  allergens: string | null;
  category: string | null;
}

function hashDish(d: TranslatableDish): string {
  return createHash('sha1')
    .update(`${d.name}|${d.description}|${d.ingredients}|${d.allergens}|${d.category}`)
    .digest('hex');
}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'integer' },
          description: { type: ['string', 'null'] },
          ingredients: { type: ['string', 'null'] },
          allergens: { type: ['string', 'null'] },
          category: { type: ['string', 'null'] },
        },
        required: ['id', 'description', 'ingredients', 'allergens', 'category'],
      },
    },
  },
  required: ['items'],
} as const;

async function callModel(dishes: TranslatableDish[], lang: LangCode): Promise<Map<number, DishTranslation>> {
  const payload = dishes.map((d) => ({
    id: d.id, nombre: d.name, description: d.description, ingredients: d.ingredients, allergens: d.allergens, category: d.category,
  }));
  const prompt = `Traduce los campos de estos platos de un menú al ${aiNameFor(lang)}. Reglas:
- Traduce "description", "ingredients", "allergens" y "category". NO traduzcas el plato en sí (el campo "nombre" es solo contexto, no lo devuelvas).
- "allergens" debe quedar preciso (ej: "gluten, mariscos" → términos correctos del idioma destino).
- Mantén el mismo "id". Si un campo viene null, devuélvelo null.
- Para "category" usa la traducción natural de la categoría gastronómica.

Platos (JSON):
${JSON.stringify(payload, null, 2)}`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  } as Anthropic.MessageCreateParamsNonStreaming);

  const block = response.content.find((b) => b.type === 'text');
  const raw = block && block.type === 'text' ? block.text : '';
  const parsed = JSON.parse(raw) as { items: Array<{ id: number } & DishTranslation> };
  return new Map(parsed.items.map((i) => [i.id, { description: i.description, ingredients: i.ingredients, allergens: i.allergens, category: i.category }]));
}

/**
 * Returns translated fields per dish for a language, using the dish_translations
 * cache and (re)translating only dishes whose content changed. Never throws —
 * falls back to source text on failure so the menu always renders.
 */
export async function translateMenu(dishes: TranslatableDish[], lang: LangCode): Promise<Map<number, DishTranslation>> {
  const result = new Map<number, DishTranslation>();
  if (dishes.length === 0) return result;

  const hashes = new Map(dishes.map((d) => [d.id, hashDish(d)]));
  const ids = dishes.map((d) => d.id);

  const cached = await query<{ dish_id: number } & DishTranslation & { source_hash: string }>(
    `SELECT dish_id, description, ingredients, allergens, category, source_hash
     FROM dish_translations WHERE lang = $1 AND dish_id = ANY($2)`,
    [lang, ids]
  );
  const cachedMap = new Map(cached.rows.map((r) => [r.dish_id, r]));

  const stale: TranslatableDish[] = [];
  for (const d of dishes) {
    const c = cachedMap.get(d.id);
    if (c && c.source_hash === hashes.get(d.id)) {
      result.set(d.id, { description: c.description, ingredients: c.ingredients, allergens: c.allergens, category: c.category });
    } else {
      stale.push(d);
    }
  }

  if (stale.length > 0) {
    try {
      const translated = await callModel(stale, lang);
      for (const d of stale) {
        const tr = translated.get(d.id) ?? { description: d.description, ingredients: d.ingredients, allergens: d.allergens, category: d.category };
        result.set(d.id, tr);
        await query(
          `INSERT INTO dish_translations (dish_id, lang, description, ingredients, allergens, category, source_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (dish_id, lang) DO UPDATE SET
             description = EXCLUDED.description, ingredients = EXCLUDED.ingredients,
             allergens = EXCLUDED.allergens, category = EXCLUDED.category,
             source_hash = EXCLUDED.source_hash, created_at = NOW()`,
          [d.id, lang, tr.description, tr.ingredients, tr.allergens, tr.category, hashes.get(d.id)]
        );
      }
    } catch (e) {
      console.error('Menu translation failed (serving source):', e);
      for (const d of stale) {
        if (!result.has(d.id)) result.set(d.id, { description: d.description, ingredients: d.ingredients, allergens: d.allergens, category: d.category });
      }
    }
  }

  return result;
}
