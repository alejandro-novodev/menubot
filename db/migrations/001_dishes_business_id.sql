-- Link owner-managed dishes to their business account.
-- The dishes table predated the businesses table and only had restaurant_id,
-- so importer/editor INSERTs targeting business_id were failing at runtime.
-- Additive + idempotent: safe to run multiple times.

ALTER TABLE dishes ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id);
CREATE INDEX IF NOT EXISTS idx_dishes_business_id ON dishes(business_id);
