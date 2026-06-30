import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getBusinessPlan } from '@/lib/subscription';
import { getFeatures } from '@/lib/plan-features';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { businessId, dishName } = await req.json() as { businessId: number; dishName: string };

  if (!businessId || !dishName?.trim()) {
    return NextResponse.json({ error: 'businessId y dishName son requeridos.' }, { status: 400 });
  }

  const owner = await query(
    'SELECT id, name, description FROM businesses WHERE id = $1 AND user_id = $2',
    [businessId, parseInt(session.user.id)]
  );
  if (owner.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const plan = await getBusinessPlan(businessId);
  if (!getFeatures(plan).aiMenuDescriptionGenerator) {
    return NextResponse.json({
      error: 'El generador de descripciones con IA está disponible en el plan Pro. Actualiza tu plan en Facturación.',
      upgradeRequired: true,
    }, { status: 403 });
  }

  const biz = owner.rows[0] as { id: number; name: string; description: string | null };
  const restaurantContext = [biz.name, biz.description].filter(Boolean).join(' — ');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Eres un redactor profesional de cartas de restaurantes chilenos.
Dado el nombre de un plato, genera en formato JSON:
1. Una descripción apetitosa de 1 a 2 oraciones en español chileno natural (no rimbombante).
2. Una lista de los ingredientes principales probables (strings simples, sin cantidades).
3. Las etiquetas de alérgenos presentes, usando SOLO estos valores: gluten, lacteos, huevo, mariscos, frutos_secos, soja, pescado, mostaza, apio, sesamo

Responde ÚNICAMENTE con JSON válido, sin explicaciones:
{ "description": "...", "ingredients": ["...", "..."], "allergens": ["...", "..."] }

Contexto del restaurante: ${restaurantContext}
Nombre del plato: ${dishName.trim()}`,
      }],
    });

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : '';
    // Extract JSON even if the model wraps it in markdown fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const generated = JSON.parse(jsonMatch[0]) as {
      description: string;
      ingredients: string[];
      allergens: string[];
    };

    return NextResponse.json({
      description: generated.description ?? '',
      ingredients: Array.isArray(generated.ingredients) ? generated.ingredients.join(', ') : '',
      allergens: Array.isArray(generated.allergens) ? generated.allergens.join(', ') : '',
    });
  } catch (error) {
    console.error('AI generate error:', error);
    return NextResponse.json({ error: 'Error al generar con IA. Intenta de nuevo.' }, { status: 500 });
  }
}
