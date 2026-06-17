-- Restaurant profile fields used to enrich the chat context (location, hours,
-- contact, free notes). `description` already exists. Additive + idempotent.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address  TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS maps_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone    VARCHAR(50);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS hours    TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notes    TEXT;
