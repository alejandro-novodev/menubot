-- Per-business Anthropic workspace + encrypted customer API key (paid plans).
-- Free/trial/demo traffic stays on the platform key (ANTHROPIC_API_KEY).
CREATE TABLE IF NOT EXISTS anthropic_accounts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  workspace_id VARCHAR(100),           -- wrkspc_... from the Anthropic Admin API
  workspace_name VARCHAR(255),
  api_key_encrypted TEXT,              -- AES-256-GCM blob 'v1:<ivB64>:<tagB64>:<ctB64>'
  api_key_hint VARCHAR(12),            -- last 4 chars for masked display
  status VARCHAR(20) NOT NULL DEFAULT 'none',  -- none | workspace_created | active | revoked
  provisioned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
