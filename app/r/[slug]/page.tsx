import { redirect } from 'next/navigation';

export default async function ShortLink({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/chat/${slug}`);
}
