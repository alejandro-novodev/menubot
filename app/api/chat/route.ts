import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db';
import { resolveMenuSource, type MenuProfile } from '@/lib/menuSource';
import { computeBillFromNames } from '@/lib/bill';
import { resolveLang, aiNameFor } from '@/lib/languages';
import { getAnthropicClient, recordUsage } from '@/lib/anthropic';
import { getChatQuota } from '@/lib/quota';

const CHAT_MODEL = 'claude-sonnet-4-6';

const QUOTA_MESSAGE =
  'Este restaurante alcanzó su límite de conversaciones del mes 😔. El menú sigue disponible arriba — ¡vuelve pronto para chatear!';

interface Dish {
  id: number;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: string;
  allergens: string;
  is_recommended: boolean;
  available: boolean;
}

/** Build a human-readable restaurant-info block for the chat context. */
function profileBlock(name: string, description: string, profile: MenuProfile | null): string {
  const lines = [`- Nombre: ${name}`];
  if (description) lines.push(`- Descripción: ${description}`);
  if (profile?.address) lines.push(`- Dirección: ${profile.address}`);
  if (profile?.maps_url) lines.push(`- Ubicación en Google Maps: ${profile.maps_url}`);
  if (profile?.phone) lines.push(`- Teléfono: ${profile.phone}`);
  if (profile?.hours) lines.push(`- Horario: ${profile.hours}`);
  if (profile?.whatsapp) lines.push(`- WhatsApp: ${profile.whatsapp}`);
  if (profile?.website) lines.push(`- Sitio web: ${profile.website}`);
  if (profile?.instagram) lines.push(`- Instagram: ${profile.instagram}`);
  if (profile?.facebook) lines.push(`- Facebook: ${profile.facebook}`);
  if (profile?.tiktok) lines.push(`- TikTok: ${profile.tiktok}`);
  if (profile?.tripadvisor) lines.push(`- TripAdvisor (reseñas): ${profile.tripadvisor}`);
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
  assistantText: string,
  lang: string
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
        'INSERT INTO chat_sessions (business_id, lang) VALUES ($1, $2) RETURNING id',
        [businessId, lang]
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
    const { messages, restaurantSlug, sessionId, lang: rawLang } = await req.json() as {
      messages: ChatMessage[];
      restaurantSlug: string;
      sessionId?: number | null;
      lang?: string;
    };
    const lang = resolveLang(rawLang);

    const source = await resolveMenuSource(restaurantSlug);

    if (!source) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Monthly quota: only real businesses, and only when a NEW conversation
    // starts (in-flight sessions always finish). Free tier blocks at 100%;
    // paid plans and trial are never blocked here.
    if (source.dishColumn === 'business_id') {
      let isNewSession = true;
      if (sessionId) {
        const ok = await query('SELECT 1 FROM chat_sessions WHERE id = $1 AND business_id = $2', [sessionId, source.id]);
        isNewSession = ok.rows.length === 0;
      }
      if (isNewSession) {
        try {
          const quota = await getChatQuota(source.id);
          if (quota.blocked) {
            return NextResponse.json({ message: QUOTA_MESSAGE, sessionId: null, quotaExceeded: true });
          }
        } catch (err) {
          console.error('Quota check failed (allowing chat):', err);
        }
      }
    }

    const dishesResult = await query<Dish>(
      // Exclude image/icon — never send dish photos into the AI context.
      `SELECT id, name, description, ingredients, price, category, allergens, is_recommended, available FROM dishes WHERE ${source.dishColumn} = $1 ORDER BY category, name`,
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
        disponible: d.available,
      })),
      null,
      2
    );

    const systemPrompt = `Eres el asistente de carta de ${source.name}. Ayudas a los clientes a entender los platos, ingredientes, alérgenos y sabores del menú, a elegir qué pedir según sus gustos o restricciones, y a responder dudas sobre el local (ubicación, horario, contacto).

Información del restaurante:
${profileBlock(source.name, source.description, source.profile)}

Reglas:
${lang === 'es'
  ? '- Responde SIEMPRE en español chileno, con tono cercano y usando "tú". Sé conciso y útil.'
  : `- IMPORTANTE: el cliente eligió ${aiNameFor(lang)} como idioma. Responde en ${aiNameFor(lang)}, con tono cercano y útil — PERO si el cliente escribe claramente en otro idioma (por ejemplo español), responde en el idioma en que escribió. El menú está en español; traduce la información de los platos al responder, pero MANTÉN los nombres de los platos en su español original (puedes añadir una breve traducción entre paréntesis la primera vez). Sé conciso.`}
- Formato: texto conversacional. Puedes usar **negrita** y emojis, pero NUNCA uses encabezados Markdown (#, ## o ###), tablas ni bloques de código — se muestran como texto plano y se ven mal en el chat.
- Habla ÚNICAMENTE sobre este restaurante: su carta (platos, bebidas, ingredientes, alérgenos, recomendaciones) y la información del local de arriba (ubicación, horario, contacto, redes sociales y reseñas). Si te preguntan por la ubicación y hay un enlace de Google Maps, compártelo. Si preguntan por redes sociales o dónde dejar una reseña, comparte el enlace correspondiente si está disponible.
- Si te preguntan algo NO relacionado con el restaurante (política, programación, clima, temas personales, etc.), declina amablemente en UNA frase y reconduce a la carta. Ejemplo: "Solo te puedo ayudar con la carta de ${source.name} 😊 ¿Quieres que te recomiende algo?".
- No inventes platos, precios, ingredientes ni datos del local que no estén arriba. Si no sabes algo, dilo.
- Cuando el cliente pida recomendaciones, prioriza y destaca los platos con "recomendado_del_chef": true (son las sugerencias del chef) y explica brevemente por qué le podrían gustar.
- IMPORTANTE: NUNCA recomiendes ni sugieras platos con "disponible": false (están agotados hoy). Si el cliente pregunta específicamente por uno, dile con amabilidad que hoy no está disponible y ofrécele una alternativa parecida que sí lo esté.
- Los precios están en pesos chilenos (CLP).
- Si el cliente quiere sumar platos, calcular cuánto pagar, agregar propina o DIVIDIR la cuenta, usa SIEMPRE la herramienta "calcular_cuenta". NUNCA hagas la aritmética tú mismo. Si algún plato no se encuentra (campo "unmatched"), pídele al cliente que lo aclare. En Chile la propina sugerida es 10%; si no la mencionan, asume 10% y dilo. Presenta el total y, si hay varias personas, cuánto paga cada una.

Menú completo (JSON):
${menuJson}`;

    const tools: Anthropic.Tool[] = [
      {
        name: 'calcular_cuenta',
        description:
          'Calcula el total de una cuenta (con propina opcional) y la divide entre comensales, usando los precios reales del menú. Úsala siempre que el cliente quiera sumar platos, saber cuánto pagar, agregar propina o dividir la cuenta.',
        input_schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              description: 'Platos a sumar, con su cantidad.',
              items: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', description: 'Nombre del plato tal como aparece en la carta.' },
                  cantidad: { type: 'integer', description: 'Cuántas unidades. Por defecto 1.' },
                },
                required: ['nombre'],
              },
            },
            propina_pct: { type: 'number', description: 'Porcentaje de propina. En Chile, 10% por defecto.' },
            personas: { type: 'integer', description: 'Entre cuántas personas dividir. Por defecto 1.' },
          },
          required: ['items'],
        },
      },
    ];

    const menuPrices = dishesResult.rows.map((d) => ({ name: d.name, price: d.price }));

    const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));

    const bizId = source.dishColumn === 'business_id' ? source.id : null;
    const { client: anthropic, keySource } = await getAnthropicClient(bizId);

    let response = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages: convo,
    });
    recordUsage({ businessId: bizId, feature: 'chat', model: CHAT_MODEL, keySource, usage: response.usage });

    // Tool-use loop: execute calcular_cuenta deterministically and feed results back.
    let guard = 0;
    while (response.stop_reason === 'tool_use' && guard++ < 4) {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use' && block.name === 'calcular_cuenta') {
          const input = block.input as { items?: { nombre: string; cantidad?: number }[]; propina_pct?: number; personas?: number };
          const result = computeBillFromNames(input.items ?? [], menuPrices, input.propina_pct ?? 10, input.personas ?? 1);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
        }
      }
      convo.push({ role: 'assistant', content: response.content });
      convo.push({ role: 'user', content: toolResults });
      response = await anthropic.messages.create({
        model: CHAT_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages: convo,
      });
      recordUsage({ businessId: bizId, feature: 'chat', model: CHAT_MODEL, keySource, usage: response.usage });
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    const replyText = textBlock && textBlock.type === 'text' ? textBlock.text : '';
    if (!replyText) {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    // Capture this turn for owner insights (businesses only; never blocks on failure).
    let newSessionId: number | null = sessionId ?? null;
    if (source.dishColumn === 'business_id') {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUser) {
        newSessionId = await logChatTurn(source.id, sessionId ?? null, lastUser.content, replyText, lang);
      }
    }

    return NextResponse.json({ message: replyText, sessionId: newSessionId });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
