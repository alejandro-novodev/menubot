import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db';
import { resolveMenuSource, type MenuProfile } from '@/lib/menuSource';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Dish {
  id: number;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: string;
  allergens: string;
  is_recommended: boolean;
}

/** Build a human-readable restaurant-info block for the chat context. */
function profileBlock(name: string, description: string, profile: MenuProfile | null): string {
  const lines = [`- Nombre: ${name}`];
  if (description) lines.push(`- Descripción: ${description}`);
  if (profile?.address) lines.push(`- Dirección: ${profile.address}`);
  if (profile?.maps_url) lines.push(`- Ubicación en Google Maps: ${profile.maps_url}`);
  if (profile?.phone) lines.push(`- Teléfono: ${profile.phone}`);
  if (profile?.hours) lines.push(`- Horario: ${profile.hours}`);
  if (profile?.notes) lines.push(`- Información adicional: ${profile.notes}`);
  return lines.join('\n');
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Log one Q&A turn (the diner's new question + the assistant's answer) to the
 * chat capture tables, so owners can later study what customers ask. Only runs
 * for real businesses; never throws into the chat path. Returns the sessionId.
 */
async function logChatTurn(
  businessId: number,
  sessionId: number | null,
  userText: string,
  assistantText: string
): Promise<number | null> {
  try {
    let sid = sessionId;
    // Validate the incoming session belongs to this business; otherwise start fresh.
    if (sid) {
      const ok = await query('SELECT 1 FROM chat_sessions WHERE id = $1 AND business_id = $2', [sid, businessId]);
      if (ok.rows.length === 0) sid = null;
    }
    if (!sid) {
      const created = await query<{ id: number }>(
        'INSERT INTO chat_sessions (business_id) VALUES ($1) RETURNING id',
        [businessId]
      );
      sid = created.rows[0].id;
    }
    await query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
      [sid, userText, assistantText]
    );
    // New content invalidates any prior summary so insights regenerate lazily.
    await query(
      'UPDATE chat_sessions SET message_count = message_count + 2, updated_at = NOW(), summarized_at = NULL WHERE id = $1',
      [sid]
    );
    return sid;
  } catch (err) {
    console.error('Chat capture failed (non-fatal):', err);
    return sessionId;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, restaurantSlug, sessionId } = await req.json() as {
      messages: ChatMessage[];
      restaurantSlug: string;
      sessionId?: number | null;
    };

    const source = await resolveMenuSource(restaurantSlug);

    if (!source) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const dishesResult = await query<Dish>(
      // Exclude image/icon — never send dish photos into the AI context.
      `SELECT id, name, description, ingredients, price, category, allergens, is_recommended FROM dishes WHERE ${source.dishColumn} = $1 ORDER BY category, name`,
      [source.id]
    );

    const menuJson = JSON.stringify(
      dishesResult.rows.map((d) => ({
        nombre: d.name,
        descripcion: d.description,
        ingredientes: d.ingredients,
        precio: d.price,
        categoria: d.category,
        alergenos: d.allergens,
        recomendado_del_chef: d.is_recommended,
      })),
      null,
      2
    );

    const systemPrompt = `Eres el asistente de carta de ${source.name}. Ayudas a los clientes a entender los platos, ingredientes, alérgenos y sabores del menú, a elegir qué pedir según sus gustos o restricciones, y a responder dudas sobre el local (ubicación, horario, contacto).

Información del restaurante:
${profileBlock(source.name, source.description, source.profile)}

Reglas:
- Responde SIEMPRE en español chileno, con tono cercano y usando "tú". Sé conciso y útil.
- Habla ÚNICAMENTE sobre este restaurante: su carta (platos, bebidas, ingredientes, alérgenos, recomendaciones) y la información del local de arriba (ubicación, horario, contacto). Si te preguntan por la ubicación y hay un enlace de Google Maps, compártelo.
- Si te preguntan algo NO relacionado con el restaurante (política, programación, clima, temas personales, cálculos, etc.), declina amablemente en UNA frase y reconduce a la carta. Ejemplo: "Solo te puedo ayudar con la carta de ${source.name} 😊 ¿Quieres que te recomiende algo?".
- No inventes platos, precios, ingredientes ni datos del local que no estén arriba. Si no sabes algo, dilo.
- Cuando el cliente pida recomendaciones, prioriza y destaca los platos con "recomendado_del_chef": true (son las sugerencias del chef) y explica brevemente por qué le podrían gustar.
- Los precios están en pesos chilenos (CLP).

Menú completo (JSON):
${menuJson}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage = response.content[0];
    if (assistantMessage.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    // Capture this turn for owner insights (businesses only; never blocks on failure).
    let newSessionId: number | null = sessionId ?? null;
    if (source.dishColumn === 'business_id') {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUser) {
        newSessionId = await logChatTurn(source.id, sessionId ?? null, lastUser.content, assistantMessage.text);
      }
    }

    return NextResponse.json({ message: assistantMessage.text, sessionId: newSessionId });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
