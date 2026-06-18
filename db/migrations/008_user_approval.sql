-- Invite-only phase: new accounts start un-approved and cannot log in until an
-- admin enables them. Going public = set INVITE_ONLY=false (env), no schema change.
-- Additive + safe to re-run (the runner replays every migration each deploy, so
-- we must NOT flip already-pending users back to approved here).

ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

-- Admins are always allowed in (idempotent, never un-approves a pending owner).
UPDATE users SET approved = true WHERE role = 'admin' AND approved = false;
