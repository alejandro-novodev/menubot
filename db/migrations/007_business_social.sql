-- Social + review links for each business, so the menu app can reference them
-- and the assistant can answer "¿tienen Instagram?" / "¿dónde dejo una reseña?".
-- Additive + idempotent.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram   VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS facebook    VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tiktok      VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp    VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tripadvisor VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website     VARCHAR(255);
