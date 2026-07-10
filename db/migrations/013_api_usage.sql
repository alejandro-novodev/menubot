-- Per-call AI usage ledger. Every Anthropic API call records one row here so
-- owners can see consumption and admins can account cost per business.
CREATE TABLE IF NOT EXISTS api_usage (
  id BIGSERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL, -- NULL = platform-level call
  feature VARCHAR(30) NOT NULL,        -- chat | menu_extract | dish_generate | translate | insights
  model VARCHAR(80) NOT NULL,
  key_source VARCHAR(10) NOT NULL DEFAULT 'platform',  -- platform | customer
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  cache_creation_tokens INTEGER NOT NULL DEFAULT 0,
  cost_microusd BIGINT NOT NULL DEFAULT 0,             -- estimated cost in integer micro-USD
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_business_created ON api_usage(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at);
