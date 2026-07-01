-- Item availability: owners can mark a dish as temporarily unavailable
-- ("Agotado") so diners see it before ordering and the assistant won't
-- recommend it. Additive + idempotent; existing dishes stay available.

ALTER TABLE dishes ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT true;
