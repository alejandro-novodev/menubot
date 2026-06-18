import { NextRequest, NextResponse } from 'next/server';
import { resolveMenuSource } from '@/lib/menuSource';

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

    const p = source.profile;
    return NextResponse.json({
      id: source.id,
      name: source.name,
      slug,
      description: source.description,
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
