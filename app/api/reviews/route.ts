import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resolveMenuSource } from '@/lib/menuSource';
import { getBusinessPlan } from '@/lib/subscription';
import { getFeatures } from '@/lib/plan-features';

/**
 * Diner submits a post-visit review. Public endpoint. Only available for
 * businesses whose plan includes reviews (Pro+); stored in MenuBot only.
 */
export async function POST(req: NextRequest) {
  try {
    const { slug, rating, comment, shareConsent, sessionId } = await req.json() as {
      slug: string;
      rating: number;
      comment?: string | null;
      shareConsent?: boolean;
      sessionId?: number | null;
    };

    const source = await resolveMenuSource(slug);
    if (!source || source.dishColumn !== 'business_id') {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    // Reviews are a Pro+ feature.
    if (!getFeatures(await getBusinessPlan(source.id)).reviewsCollection) {
      return NextResponse.json({ error: 'Las reseñas no están habilitadas para este restaurante' }, { status: 403 });
    }

    const r = Math.round(Number(rating));
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: 'La calificación debe ser de 1 a 5' }, { status: 400 });
    }

    // Only link the conversation if it belongs to this business.
    let conversationId: number | null = null;
    if (sessionId) {
      const ok = await query('SELECT 1 FROM chat_sessions WHERE id = $1 AND business_id = $2', [sessionId, source.id]);
      if (ok.rows.length > 0) conversationId = sessionId;
    }

    await query(
      `INSERT INTO reviews (business_id, conversation_id, diner_rating, diner_comment, share_consent)
       VALUES ($1, $2, $3, $4, $5)`,
      [source.id, conversationId, r, (comment ?? '').toString().trim() || null, !!shareConsent]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
