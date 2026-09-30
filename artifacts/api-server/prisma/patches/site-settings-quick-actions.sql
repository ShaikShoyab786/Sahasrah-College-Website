-- Development-only additive columns for administrator-managed public quick actions.
-- Production schema changes are applied through Replit Publish.
BEGIN;

ALTER TABLE "SiteSettings"
  ADD COLUMN IF NOT EXISTS "showCallQuickAction" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "showWhatsappQuickAction" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "showApplyQuickAction" BOOLEAN NOT NULL DEFAULT TRUE;

COMMIT;