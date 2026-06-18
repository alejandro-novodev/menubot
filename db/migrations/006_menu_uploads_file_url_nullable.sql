-- The import flow no longer stores files at a URL — it extracts dishes inline
-- and discards the upload. The legacy file_url NOT NULL constraint breaks the
-- extract INSERT, so make it nullable. Idempotent (safe to re-run).

ALTER TABLE menu_uploads ALTER COLUMN file_url DROP NOT NULL;
