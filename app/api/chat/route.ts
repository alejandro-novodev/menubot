import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db';
import { resolveMenuSource } from '@/lib/menuSource';

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
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, restaurantSlug } = await req.json() as {
      messages: ChatMessage[];
      restaurantSlug: string;
    };

    const source = await resolveMenuSource(restaurantSlug);

    if (!source) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const dishesResult = await query<Dish>(
      `SELECT * FROM dishes WHERE ${source.dishColumn} = $1 ORDER BY category, name`,
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
      })),
      null,
      2
    );

    const systemPrompt = `Eres un asistente de carta amigable para ${source.name}. Tu trabajo es ayudar a los clientes a entender los platos, ingredientes y sabores del menú, y ayudarles a elegir qué pedir según sus preferencias o restricciones alimentarias. Responde siempre en español chileno, con tono cercano y usando tú. Sé conciso y útil. Solo responde preguntas relacionadas con el menú y la comida. Los precios están en pesos chilenos (CLP). Aquí está el menú completo en JSON: ${menuJson}`;

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

    return NextResponse.json({ message: assistantMessage.text });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
