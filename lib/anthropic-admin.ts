// Anthropic Admin API client (organization management). Note: the Admin API
// can CREATE WORKSPACES but NOT API keys — keys are minted manually in the
// Console inside the workspace, then pasted into the admin panel.

const BASE = 'https://api.anthropic.com/v1/organizations';

export function isAdminApiConfigured(): boolean {
  return !!process.env.ANTHROPIC_ADMIN_KEY;
}

function headers(): Record<string, string> {
  return {
    'x-api-key': process.env.ANTHROPIC_ADMIN_KEY ?? '',
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  };
}

export interface AnthropicWorkspace {
  id: string;
  name: string;
}

export async function createWorkspace(name: string): Promise<AnthropicWorkspace> {
  if (!isAdminApiConfigured()) {
    throw new Error('ANTHROPIC_ADMIN_KEY no está configurada');
  }
  const res = await fetch(`${BASE}/workspaces`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Admin API ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id: string; name: string };
  return { id: data.id, name: data.name };
}
