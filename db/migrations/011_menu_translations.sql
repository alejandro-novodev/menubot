-- Cached menu translations per language (Pro+). Dish names stay in the original
-- (Spanish); we translate description/ingredients/allergens/category. source_hash
-- invalidates a cached translation when the dish content changes. Also record the
-- diner's language on each chat session for language analytics. Additive.

CREATE TABLE IF NOT EXISTS dish_translations (
  dish_id      INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  lang         VARCHAR(8) NOT NULL,
  description  TEXT,
  ingredients  TEXT,
  allergens    TEXT,
  category     TEXT,
  source_hash  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (dish_id, lang)
);

ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS lang VARCHAR(8);
