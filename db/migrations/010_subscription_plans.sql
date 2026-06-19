-- Subscription model: add the Enterprise plan, multi-branch + billing fields,
-- and the reviews table. Additive + idempotent (safe on the runner's replay).
-- `plan` is already VARCHAR(50) so 'enterprise' needs no schema change.

-- ── Billing / multi-branch fields on subscriptions ─────────────────────────
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS branch_count           INTEGER NOT NULL DEFAULT 1;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS extra_branches         INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle          VARCHAR(20) NOT NULL DEFAULT 'monthly'; -- monthly | annual
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS annual_discount_active BOOLEAN NOT NULL DEFAULT false;

-- ── Reviews (stored in MenuBot only; no external integrations yet) ──────────
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES chat_sessions(id) ON DELETE SET NULL,
  diner_rating    INTEGER NOT NULL CHECK (diner_rating BETWEEN 1 AND 5),
  diner_comment   TEXT,
  share_consent   BOOLEAN NOT NULL DEFAULT false,
  owner_response  TEXT,
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
