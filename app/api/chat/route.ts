import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db';

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

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
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

    const restaurantResult = await query<Restaurant>(
      'SELECT * FROM restaurants WHERE slug = $1',
      [restaurantSlug]
    );

    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const restaurant = restaurantResult.rows[0];

    const dishesResult = await query<Dish>(
      // Exclude image/icon — never send dish photos into the AI context.
      'SELECT id, name, description, ingredients, price, category, allergens FROM dishes WHERE restaurant_id = $1 ORDER BY category, name',
      [restaurant.id]
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

    const systemPrompt = `Eres el asistente de carta de ${restaurant.name}. Ayudas a los clientes a entender los platos, ingredientes, alérgenos y sabores del menú, y a elegir qué pedir según sus gustos o restricciones alimentarias.

Reglas:
- Responde SIEMPRE en español chileno, con tono cercano y usando "tú". Sé conciso y útil.
- Habla ÚNICAMENTE sobre la carta de este restaurante: sus platos, bebidas, ingredientes, alérgenos, recomendaciones y la experiencia gastronómica del local.
- Si te preguntan algo NO relacionado con la carta o el restaurante (política, programación, clima, temas personales, cálculos, etc.), declina amablemente en UNA frase y reconduce a la carta. Ejemplo: "Solo te puedo ayudar con la carta de ${restaurant.name} 😊 ¿Quieres que te recomiende algo?".
- No inventes platos, precios ni ingredientes que no estén en el menú. Si no sabes algo, dilo.
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

    return NextResponse.json({ message: assistantMessage.text });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
