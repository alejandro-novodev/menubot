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

    return NextResponse.json({ id: source.id, name: source.name, slug, description: source.description });
  } catch (error) {
    console.error('Restaurant fetch error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
