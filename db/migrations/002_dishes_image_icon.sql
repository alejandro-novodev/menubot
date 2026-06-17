-- Per-dish visuals: an optional photo (base64 data URL stored in the row) and
-- an optional chosen emoji icon. Display priority: image > icon > auto-emoji.
-- Additive + idempotent.

ALTER TABLE dishes ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS icon VARCHAR(16);
