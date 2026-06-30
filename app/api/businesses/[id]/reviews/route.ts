import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getBusinessPlan } from '@/lib/subscription';
import { getFeatures } from '@/lib/plan-features';

interface ReviewRow {
  id: string;
  diner_rating: number;
  diner_comment: string | null;
  share_consent: boolean;
  owner_response: string | null;
  responded_at: string | null;
  created_at: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const businessId = parseInt(id);

  const owner = await query('SELECT id FROM businesses WHERE id = $1 AND user_id = $2', [businessId, parseInt(session.user.id)]);
  if (owner.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const plan = await getBusinessPlan(businessId);
  const result = await query<ReviewRow>(
    `SELECT id, diner_rating, diner_comment, share_consent, owner_response, responded_at, created_at
     FROM reviews WHERE business_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [businessId]
  );

  const rows = result.rows;
  const count = rows.length;
  const average = count > 0 ? rows.reduce((s, r) => s + r.diner_rating, 0) / count : 0;

  return NextResponse.json({
    plan,
    reviewsEnabled: getFeatures(plan).reviewsCollection,
    canRespond: getFeatures(plan).ownerResponseToReviews,
    count,
    average: Math.round(average * 10) / 10,
    reviews: rows.map((r) => ({
      id: r.id,
      rating: r.diner_rating,
      comment: r.diner_comment,
      shareConsent: r.share_consent,
      ownerResponse: r.owner_response,
      respondedAt: r.responded_at,
      createdAt: r.created_at,
    })),
  });
}
