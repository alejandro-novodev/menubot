import { NextRequest, NextResponse } from 'next/server';
import { resolveMenuSource } from '@/lib/menuSource';
import { getBusinessPlan } from '@/lib/subscription';
import { getFeatures } from '@/lib/plan-features';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const source = await resolveMenuSource(slug);

    if (!source) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Reviews are only offered to diners when the business is on a plan that
    // includes them (Pro+). Legacy demo restaurants (no plan) never show them.
    const reviewsEnabled = source.dishColumn === 'business_id'
      ? getFeatures(await getBusinessPlan(source.id)).hasReviews
      : false;

    const p = source.profile;
    return NextResponse.json({
      id: source.id,
      name: source.name,
      slug,
      description: source.description,
      reviewsEnabled,
      address: p?.address ?? null,
      phone: p?.phone ?? null,
      hours: p?.hours ?? null,
      maps_url: p?.maps_url ?? null,
      socials: {
        instagram: p?.instagram ?? null,
        facebook: p?.facebook ?? null,
        tiktok: p?.tiktok ?? null,
        whatsapp: p?.whatsapp ?? null,
        tripadvisor: p?.tripadvisor ?? null,
        website: p?.website ?? null,
      },
    });
  } catch (error) {
    console.error('Restaurant fetch error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
