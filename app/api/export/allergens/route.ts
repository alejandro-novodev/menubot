import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
// pdfkit ships a CommonJS bundle; we use a dynamic require so Next.js
// doesn't try to statically analyse the binary dependency at build time.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

interface DishRow {
  name: string;
  description: string | null;
  allergens: string | null;
}

const KNOWN_ALLERGENS = [
  'gluten', 'lacteos', 'huevo', 'mariscos', 'frutos_secos',
  'soja', 'pescado', 'mostaza', 'apio', 'sesamo',
];

const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten',
  lacteos: 'Lácteos',
  huevo: 'Huevo',
  mariscos: 'Mariscos',
  frutos_secos: 'Frutos secos',
  soja: 'Soja',
  pescado: 'Pescado',
  mostaza: 'Mostaza',
  apio: 'Apio',
  sesamo: 'Sésamo',
};

function parseAllergens(raw: string | null): string[] {
  if (!raw || raw.trim() === '' || raw.trim().toLowerCase() === 'ninguno') return [];
  return raw
    .toLowerCase()
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => KNOWN_ALLERGENS.includes(s))
    .map((s) => ALLERGEN_LABELS[s] ?? s);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const businessId = parseInt(req.nextUrl.searchParams.get('businessId') ?? '0');
  if (!businessId) return NextResponse.json({ error: 'businessId requerido' }, { status: 400 });

  const bizResult = await query<{ id: number; name: string }>(
    'SELECT id, name FROM businesses WHERE id = $1 AND user_id = $2',
    [businessId, parseInt(session.user.id)]
  );
  if (bizResult.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const biz = bizResult.rows[0];
  const dishResult = await query<DishRow>(
    'SELECT name, description, allergens FROM dishes WHERE business_id = $1 ORDER BY category, name',
    [businessId]
  );
  const dishes = dishResult.rows;

  // Build PDF in memory
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const accent = '#C76B43';
  const ink = '#1A1208';
  const subtle = '#8A7A66';
  const lineGray = '#E3DBD0';
  const pageW = doc.page.width - 100; // usable width

  // ── Header ──────────────────────────────────────────────────────────────────
  doc
    .fontSize(18).fillColor(accent).font('Helvetica-Bold')
    .text('Declaración de Alérgenos', 50, 50);

  doc
    .fontSize(10).fillColor(subtle).font('Helvetica')
    .text(biz.name, 50, doc.y + 4)
    .text(`Generado el ${new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, doc.y + 2);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).strokeColor(lineGray).lineWidth(1).stroke();
  doc.moveDown(0.8);

  // ── Regulatory note ─────────────────────────────────────────────────────────
  doc
    .fontSize(8).fillColor(subtle).font('Helvetica-Oblique')
    .text(
      'Documento elaborado en conformidad con la Resolución N° 20 del Ministerio de Salud de Chile (Reglamento de Rotulación de Alimentos). ' +
      'Se recomienda revisar y validar la información con su equipo antes de presentar en inspecciones sanitarias.',
      50, doc.y, { width: pageW }
    );

  doc.moveDown(1);

  // ── Table header ────────────────────────────────────────────────────────────
  const colX = [50, 220, 430];
  const colW = [165, 205, pageW - 380];

  doc.fontSize(9).fillColor(ink).font('Helvetica-Bold');
  doc.text('Plato', colX[0], doc.y, { width: colW[0] });
  const headerY = doc.y - doc.currentLineHeight();
  doc.text('Descripción', colX[1], headerY, { width: colW[1] });
  doc.text('Alérgenos', colX[2], headerY, { width: colW[2] });

  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).strokeColor(accent).lineWidth(0.8).stroke();
  doc.moveDown(0.4);

  // ── Table rows ──────────────────────────────────────────────────────────────
  doc.font('Helvetica').fontSize(9);

  for (const dish of dishes) {
    const allergenList = parseAllergens(dish.allergens);
    const allergenText = allergenList.length > 0 ? allergenList.join(', ') : 'Sin alérgenos declarados';
    const desc = dish.description?.trim() || '—';

    const rowY = doc.y;
    // Measure each cell's height; use the tallest
    const h1 = doc.heightOfString(dish.name, { width: colW[0] });
    const h2 = doc.heightOfString(desc, { width: colW[1] });
    const h3 = doc.heightOfString(allergenText, { width: colW[2] });
    const rowH = Math.max(h1, h2, h3) + 8;

    // Page break if needed
    if (rowY + rowH > doc.page.height - 80) {
      doc.addPage();
    }

    const y = doc.y;
    doc.fillColor(ink).text(dish.name, colX[0], y, { width: colW[0] });
    doc.fillColor(subtle).text(desc, colX[1], y, { width: colW[1] });
    doc.fillColor(allergenList.length > 0 ? '#B45309' : subtle)
      .text(allergenText, colX[2], y, { width: colW[2] });

    doc.y = y + rowH;
    doc.moveTo(50, doc.y - 2).lineTo(50 + pageW, doc.y - 2).strokeColor(lineGray).lineWidth(0.5).stroke();
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  doc.moveDown(1.5);
  doc
    .fontSize(7.5).fillColor(subtle).font('Helvetica')
    .text('Generado por MenuBot · menubot.cl · Resolución 20 del Minsal', 50, doc.y, {
      width: pageW, align: 'center',
    });

  doc.end();

  const pdf = await new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const filename = `alergenos-${biz.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  return new NextResponse(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.byteLength),
    },
  });
}
