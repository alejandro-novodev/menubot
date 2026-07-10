import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { isAdminApiConfigured } from '@/lib/anthropic-admin';

export const runtime = 'nodejs';

interface KeyRow {
  business_id: number;
  business_name: string;
  slug: string;
  plan: string;
  workspace_id: string | null;
  workspace_name: string | null;
  api_key_hint: string | null;
  status: string | null;
  provisioned_at: string | null;
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // Every business with an active PAID subscription, joined to its Anthropic
  // account. "needsProvisioning" is derived — a Flow webhook activation makes
  // the business appear here automatically.
  const rows = await query<KeyRow>(
    `SELECT b.id AS business_id, b.name AS business_name, b.slug, s.plan,
            a.workspace_id, a.workspace_name, a.api_key_hint, a.status, a.provisioned_at
     FROM subscriptions s
     JOIN businesses b ON b.id = s.business_id
     LEFT JOIN anthropic_accounts a ON a.business_id = b.id
     WHERE s.status = 'active' AND s.plan IN ('starter', 'pro', 'multi', 'enterprise')
     ORDER BY (a.status IS NOT DISTINCT FROM 'active'), b.name`
  );

  return NextResponse.json({
    adminApiConfigured: isAdminApiConfigured(),
    keys: rows.rows.map((r) => ({
      businessId: r.business_id,
      businessName: r.business_name,
      slug: r.slug,
      plan: r.plan,
      workspaceId: r.workspace_id,
      workspaceName: r.workspace_name,
      apiKeyHint: r.api_key_hint,
      status: r.status ?? 'none',
      provisionedAt: r.provisioned_at,
      needsProvisioning: r.status !== 'active',
    })),
  });
}
