import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicClient, recordUsage } from './anthropic';

const INSIGHTS_MODEL = 'claude-haiku-4-5-20251001';

export interface SessionSummary {
  /** One short Spanish sentence describing what the diner asked about. */
  summary: string;
  /** 1–5 normalized question topics, lowercase, e.g. "opciones sin gluten". */
  topics: string[];
}

const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    topics: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'topics'],
} as const;

const SUMMARY_PROMPT = `Eres un analista que resume conversaciones entre clientes y el asistente de carta de un restaurante. Te entrego una conversación. Devuelve:
- "summary": UNA frase corta en español que describa qué buscó o preguntó el cliente (sin datos personales).
- "topics": entre 1 y 5 temas/preguntas normalizados, en minúsculas y breves (2–4 palabras), enfocados en lo que el cliente quería. Usa frases reutilizables y consistentes para poder agruparlas después. Ejemplos: "recomendaciones", "opciones sin gluten", "opciones vegetarianas", "precios", "ubicación", "horario", "ingredientes de un plato", "opciones picantes", "postres".
No inventes temas que no aparezcan. Responde sólo sobre el contenido de la conversación.`;

/**
 * Generate a short summary + normalized topics for one captured chat session.
 * Uses Haiku (cheap) with structured output. Throws on failure — callers
 * should catch and leave the session unsummarized to retry later.
 */
export async function summarizeSession(
  messages: { role: string; content: string }[],
  businessId: number | null = null
): Promise<SessionSummary> {
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.content}`)
    .join('\n');

  const { client: anthropic, keySource } = await getAnthropicClient(businessId);
  const response = await anthropic.messages.create({
    model: INSIGHTS_MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: `${SUMMARY_PROMPT}\n\n--- Conversación ---\n${transcript}` }],
    output_config: { format: { type: 'json_schema', schema: SUMMARY_SCHEMA } },
  } as Anthropic.MessageCreateParamsNonStreaming);
  recordUsage({ businessId, feature: 'insights', model: INSIGHTS_MODEL, keySource, usage: response.usage });

  const textBlock = response.content.find((b) => b.type === 'text');
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  const parsed = JSON.parse(raw) as SessionSummary;
  return {
    summary: (parsed.summary ?? '').trim(),
    topics: (parsed.topics ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5),
  };
}
