import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import { calcMenuCompleteness } from '@/lib/completeness';
import { getAnthropicClient, recordUsage } from '@/lib/anthropic';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';

const EXTRACT_MODEL = 'claude-sonnet-4-6';

interface ExtractedDish {
  name: string;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
}

const EXTRACT_PROMPT = `Eres un asistente que digitaliza cartas de restaurantes. Extrae TODOS los platos que aparezcan en el contenido entregado.

Reglas:
- "price" es un entero en pesos chilenos (8.990 → 8990). null si no está visible.
- "category" en minúsculas: entradas, principales, postres, bebidas, cócteles, u otra categoría visible en la carta.
- Si un campo no está disponible, usa null. No inventes datos.
- Extrae el máximo número de platos posible, en el orden en que aparecen.`;

/** Structured-output schema — guarantees the model returns valid dish JSON. */
const DISH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    dishes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          description: { type: ['string', 'null'] },
          price: { type: ['integer', 'null'] },
          category: { type: ['string', 'null'] },
          ingredients: { type: ['string', 'null'] },
          allergens: { type: ['string', 'null'] },
        },
        required: ['name', 'description', 'price', 'category', 'ingredients', 'allergens'],
      },
    },
  },
  required: ['dishes'],
} as const;

type SourceKind = 'image' | 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'text' | 'url' | 'unknown';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

function detectKind(file: File): SourceKind {
  const t = file.type;
  const name = file.name.toLowerCase();
  if (t.startsWith('image/')) return 'image';
  if (t === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx') || t.includes('wordprocessingml')) return 'docx';
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || t.includes('spreadsheetml') || t.includes('ms-excel')) return 'xlsx';
  if (name.endsWith('.csv') || t === 'text/csv') return 'csv';
  if (name.endsWith('.txt') || t.startsWith('text/')) return 'txt';
  return 'unknown';
}

/** Flatten an .xlsx workbook to a pipe-delimited text representation. */
async function xlsxToText(buffer: Buffer): Promise<string> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const lines: string[] = [];
  wb.eachSheet((sheet) => {
    if (wb.worksheets.length > 1) lines.push(`# ${sheet.name}`);
    sheet.eachRow((row) => {
      const values = (row.values as unknown[]).slice(1).map((v) => {
        if (v == null) return '';
        if (typeof v === 'object') {
          const o = v as { text?: string; result?: unknown };
          return String(o.text ?? o.result ?? '');
        }
        return String(v);
      });
      if (values.some((c) => c.trim() !== '')) lines.push(values.join(' | '));
    });
  });
  return lines.join('\n');
}

/** Basic SSRF guard for the URL-import path. */
function isSafeUrl(raw: string): URL | null {
  let url: URL;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) return null;
  return url;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const pastedText = (formData.get('text') as string | null)?.trim() || null;
    const url = (formData.get('url') as string | null)?.trim() || null;
    const businessId = parseInt(formData.get('businessId') as string);
    // clearExisting=true on first source of a batch, false on subsequent ones
    const clearExisting = formData.get('clearExisting') !== 'false';

    if (!businessId || (!file && !pastedText && !url)) {
      return NextResponse.json({ error: 'Falta un archivo, texto o enlace, y el businessId.' }, { status: 400 });
    }

    const bizCheck = await query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, parseInt(session.user.id)]
    );
    if (bizCheck.rows.length === 0) {
      return NextResponse.json({ error: 'No autorizado para este negocio.' }, { status: 403 });
    }

    // ── Build the Claude message content + a label for logging ──────────────
    let content: Anthropic.MessageParam['content'];
    let kind: SourceKind;
    let sourceName: string;

    if (file) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'El archivo supera el máximo de 20 MB.' }, { status: 413 });
      }
      kind = detectKind(file);
      sourceName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (kind === 'image') {
        const mediaType = (IMAGE_TYPES as readonly string[]).includes(file.type)
          ? (file.type as (typeof IMAGE_TYPES)[number])
          : null;
        if (!mediaType) {
          return NextResponse.json({ error: 'Formato de imagen no soportado. Usa JPG, PNG, WEBP o GIF.' }, { status: 415 });
        }
        content = [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: buffer.toString('base64') } },
          { type: 'text', text: EXTRACT_PROMPT },
        ];
      } else if (kind === 'pdf') {
        content = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') } },
          { type: 'text', text: EXTRACT_PROMPT },
        ];
      } else {
        // Text-extractable documents → pull plain text, then send as text.
        let text = '';
        if (kind === 'docx') {
          text = (await mammoth.extractRawText({ buffer })).value;
        } else if (kind === 'xlsx') {
          text = await xlsxToText(buffer);
        } else if (kind === 'csv' || kind === 'txt') {
          text = buffer.toString('utf-8');
        } else {
          return NextResponse.json({ error: 'Formato no soportado. Usa imagen, PDF, Word (.docx), Excel (.xlsx), CSV o TXT.' }, { status: 415 });
        }
        if (!text.trim()) {
          return NextResponse.json({ error: 'No se encontró texto en el archivo.' }, { status: 422 });
        }
        content = [{ type: 'text', text: `${EXTRACT_PROMPT}\n\n--- Contenido del menú ---\n${text}` }];
      }
    } else if (url) {
      const safe = isSafeUrl(url);
      if (!safe) return NextResponse.json({ error: 'Enlace inválido o no permitido.' }, { status: 400 });
      kind = 'url';
      sourceName = safe.href;
      let pageText: string;
      try {
        const res = await fetch(safe.href, {
          redirect: 'follow',
          headers: { 'User-Agent': 'menubot-import/1.0' },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        pageText = stripHtml(await res.text()).slice(0, 60000);
      } catch {
        return NextResponse.json({ error: 'No se pudo leer el enlace.' }, { status: 422 });
      }
      if (!pageText.trim()) return NextResponse.json({ error: 'El enlace no contiene texto legible.' }, { status: 422 });
      content = [{ type: 'text', text: `${EXTRACT_PROMPT}\n\n--- Contenido del menú (desde ${safe.href}) ---\n${pageText}` }];
    } else {
      // Pasted text
      kind = 'text';
      sourceName = 'Texto pegado';
      content = [{ type: 'text', text: `${EXTRACT_PROMPT}\n\n--- Contenido del menú ---\n${pastedText}` }];
    }

    // ── Log the upload ──────────────────────────────────────────────────────
    const uploadResult = await query<{ id: number }>(
      `INSERT INTO menu_uploads (business_id, file_name, file_type, status)
       VALUES ($1, $2, $3, 'processing') RETURNING id`,
      [businessId, sourceName, kind]
    );
    const uploadId = uploadResult.rows[0].id;

    // ── Extract via Claude with structured outputs ──────────────────────────
    let parsed: { dishes: ExtractedDish[] };
    try {
      const { client: anthropic, keySource } = await getAnthropicClient(businessId);
      const response = await anthropic.messages.create({
        model: EXTRACT_MODEL,
        max_tokens: 8192,
        messages: [{ role: 'user', content }],
        output_config: { format: { type: 'json_schema', schema: DISH_SCHEMA } },
      } as Anthropic.MessageCreateParamsNonStreaming);
      recordUsage({ businessId, feature: 'menu_extract', model: EXTRACT_MODEL, keySource, usage: response.usage });

      if (response.stop_reason === 'refusal') {
        throw new Error('refusal');
      }
      const textBlock = response.content.find((b) => b.type === 'text');
      const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';
      parsed = JSON.parse(raw) as { dishes: ExtractedDish[] };
    } catch (e) {
      await query(`UPDATE menu_uploads SET status = 'failed', error_message = $1 WHERE id = $2`, [String(e).slice(0, 250), uploadId]);
      return NextResponse.json({ error: 'No se pudo procesar el contenido. Intenta con otro archivo o pega el texto.' }, { status: 422 });
    }

    const dishes = (parsed.dishes ?? []).filter((d) => d.name?.trim());

    // Only clear existing dishes on the FIRST source of a batch
    if (clearExisting) {
      await query('DELETE FROM dishes WHERE business_id = $1', [businessId]);
    }

    for (const dish of dishes) {
      await query(
        `INSERT INTO dishes (business_id, name, description, price, category, ingredients, allergens)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [businessId, dish.name.trim(), dish.description ?? null, dish.price ?? null, dish.category ?? null, dish.ingredients ?? null, dish.allergens ?? null]
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
