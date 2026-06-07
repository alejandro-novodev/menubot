import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import { calcMenuCompleteness } from '@/lib/completeness';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ExtractedDish {
  name: string;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
}

const EXTRACT_PROMPT = `Analiza este menú y extrae TODOS los platos que puedas ver.
Devuelve SOLO un JSON válido con este formato exacto, sin texto adicional:
{
  "dishes": [
    {
      "name": "Nombre del plato",
      "description": "Descripción o null",
      "price": 8500,
      "category": "entradas",
      "ingredients": "ingrediente1, ingrediente2 o null",
      "allergens": "gluten, lácteos o null"
    }
  ]
}

Reglas:
- price debe ser un entero en pesos chilenos (8.990 → 8990). null si no está visible.
- category debe ser: entradas, principales, postres, bebidas, cócteles, u otra categoría visible.
- Si un campo no está disponible, usa null. No inventes datos.
- Extrae el máximo número de platos posible.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const businessId = parseInt(formData.get('businessId') as string);
    // clearExisting=true on first file, false on subsequent files
    const clearExisting = formData.get('clearExisting') !== 'false';

    if (!file || !businessId) {
      return NextResponse.json({ error: 'Archivo y businessId requeridos.' }, { status: 400 });
    }

    const bizCheck = await query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, parseInt(session.user.id)]
    );
    if (bizCheck.rows.length === 0) {
      return NextResponse.json({ error: 'No autorizado para este negocio.' }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const isPdf = file.type === 'application/pdf';

    const uploadResult = await query<{ id: number }>(
      `INSERT INTO menu_uploads (business_id, file_name, file_type, status)
       VALUES ($1, $2, $3, 'processing') RETURNING id`,
      [businessId, file.name, isPdf ? 'pdf' : 'image']
    );
    const uploadId = uploadResult.rows[0].id;

    const content: Anthropic.MessageParam['content'] = isPdf
      ? [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: EXTRACT_PROMPT },
        ]
      : [
          { type: 'image', source: { type: 'base64', media_type: file.type as 'image/jpeg' | 'image/png' | 'image/webp', data: base64 } },
          { type: 'text', text: EXTRACT_PROMPT },
        ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content }],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '';

    let parsed: { dishes: ExtractedDish[] };
    try {
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]+?)```/) ?? [null, raw];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      await query(`UPDATE menu_uploads SET status = 'failed', error_message = $1 WHERE id = $2`, ['JSON parse error', uploadId]);
      return NextResponse.json({ error: 'No se pudo procesar el archivo. Intenta con otro.' }, { status: 422 });
    }

    const dishes = parsed.dishes ?? [];

    // Only clear existing dishes on the FIRST file of a batch
    if (clearExisting) {
      await query('DELETE FROM dishes WHERE business_id = $1', [businessId]);
    }

    for (const dish of dishes) {
      await query(
        `INSERT INTO dishes (business_id, name, description, price, category, ingredients, allergens)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [businessId, dish.name, dish.description ?? null, dish.price ?? null, dish.category ?? null, dish.ingredients ?? null, dish.allergens ?? null]
      );
    }

    const allDishes = await query(
      'SELECT description, price, category, ingredients, allergens FROM dishes WHERE business_id = $1',
      [businessId]
    );
    const completeness = calcMenuCompleteness(allDishes.rows);
    await query('UPDATE businesses SET menu_completeness = $1 WHERE id = $2', [completeness, businessId]);
    await query(
      `UPDATE menu_uploads SET status = 'done', extracted_dishes = $1 WHERE id = $2`,
      [dishes.length, uploadId]
    );

    return NextResponse.json({
      success: true,
      extractedCount: dishes.length,
      completeness,
      totalDishes: allDishes.rows.length,
    });
  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
