-- Chef's suggestion flag — highlighted in the menu and prioritized by the chat
-- for "what do you recommend?" questions. Additive + idempotent.

ALTER TABLE dishes ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN NOT NULL DEFAULT false;
