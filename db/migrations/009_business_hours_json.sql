-- Structured weekly schedule for the Horario editor. The human-readable string
-- still lives in businesses.hours (used by the chat); hours_json stores the
-- per-day structure so the editor reloads exactly as configured. Additive.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS hours_json TEXT;
