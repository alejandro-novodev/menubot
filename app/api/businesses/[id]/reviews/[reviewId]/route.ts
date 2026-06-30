import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getBusinessPlan } from '@/lib/subscription';
import { getFeatures } from '@/lib/plan-features';

/** Owner responds to (or clears) a review. Pro+ only. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id, reviewId } = await params;
  const businessId = parseInt(id);

  const owner = await query('SELECT id FROM businesses WHERE id = $1 AND user_id = $2', [businessId, parseInt(session.user.id)]);
  if (owner.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  if (!getFeatures(await getBusinessPlan(businessId)).ownerResponseToReviews) {
    return NextResponse.json({ error: 'Responder reseñas requiere el plan Pro' }, { status: 403 });
  }

  const { response } = await req.json() as { response: string };
  const text = (response ?? '').toString().trim();

  try {
    // Scope the update to a review that belongs to this business. Clearing the
    // response (empty text) also clears responded_at. Casts give pg the param
    // types it can't infer from `$1 IS NULL` alone.
    const res = await query(
      `UPDATE reviews
       SET owner_response = $1::text,
           responded_at = CASE WHEN $1::text IS NULL THEN NULL ELSE NOW() END
       WHERE id = $2::uuid AND business_id = $3`,
      [text || null, reviewId, businessId]
    );
    if (res.rowCount === 0) return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review respond error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
