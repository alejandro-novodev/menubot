import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { createWorkspace } from '@/lib/anthropic-admin';
import { encryptSecret } from '@/lib/crypto';

export const runtime = 'nodejs';

/**
 * Live-check a pasted key with a minimal request so invalid keys are rejected
 * at paste time instead of breaking diner chats later. Only a definitive auth
 * rejection (401/403) fails validation — transient errors pass with a warning.
 */
async function validateKey(apiKey: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const probe = new Anthropic({ apiKey });
    await probe.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    });
    return { valid: true };
  } catch (err) {
    if (err instanceof Anthropic.APIError && (err.status === 401 || err.status === 403)) {
      return { valid: false, reason: 'Anthropic rechazó la key (no autorizada).' };
    }
    console.warn('Key validation probe inconclusive (accepting key):', err);
    return { valid: true };
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { businessId: rawId } = await params;
  const businessId = parseInt(rawId);
  const body = (await req.json()) as { action: string; apiKey?: string };

  const biz = await query<{ id: number; name: string; slug: string }>(
    'SELECT id, name, slug FROM businesses WHERE id = $1',
    [businessId]
  );
  if (biz.rows.length === 0) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
  }

  try {
    switch (body.action) {
      case 'create_workspace': {
        const ws = await createWorkspace(`menubot-${biz.rows[0].slug}`);
        await query(
          `INSERT INTO anthropic_accounts (business_id, workspace_id, workspace_name, status, updated_at)
           VALUES ($1, $2, $3, 'workspace_created', NOW())
           ON CONFLICT (business_id) DO UPDATE SET
             workspace_id = EXCLUDED.workspace_id,
             workspace_name = EXCLUDED.workspace_name,
             status = 'workspace_created',
             updated_at = NOW()`,
          [businessId, ws.id, ws.name]
        );
        return NextResponse.json({ ok: true, workspaceId: ws.id, workspaceName: ws.name });
      }

      case 'save_key': {
        const apiKey = body.apiKey?.trim();
        if (!apiKey || !apiKey.startsWith('sk-ant-')) {
          return NextResponse.json({ error: 'La key debe comenzar con sk-ant-' }, { status: 400 });
        }
        const check = await validateKey(apiKey);
        if (!check.valid) {
          return NextResponse.json({ error: check.reason ?? 'La key no es válida.' }, { status: 400 });
        }
        const encrypted = encryptSecret(apiKey);
        const hint = apiKey.slice(-4);
        await query(
          `INSERT INTO anthropic_accounts (business_id, api_key_encrypted, api_key_hint, status, provisioned_at, updated_at)
           VALUES ($1, $2, $3, 'active', NOW(), NOW())
           ON CONFLICT (business_id) DO UPDATE SET
             api_key_encrypted = EXCLUDED.api_key_encrypted,
             api_key_hint = EXCLUDED.api_key_hint,
             status = 'active',
             provisioned_at = NOW(),
             updated_at = NOW()`,
          [businessId, encrypted, hint]
        );
        return NextResponse.json({ ok: true, apiKeyHint: hint });
      }

      case 'revoke': {
        await query(
          `UPDATE anthropic_accounts
           SET api_key_encrypted = NULL, api_key_hint = NULL, status = 'revoked', updated_at = NOW()
           WHERE business_id = $1`,
          [businessId]
        );
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
    }
  } catch (err) {
    console.error(`Admin keys action "${body.action}" failed for business ${businessId}:`, err);
    return NextResponse.json({ error: 'La operación falló. Revisa la configuración e intenta de nuevo.' }, { status: 500 });
  }
}
