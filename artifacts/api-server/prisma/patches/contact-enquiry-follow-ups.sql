-- Development-only additive schema patch for the contact enquiry workflow.
-- Apply to the development database, then use Replit Publish for the managed
-- production schema diff. This patch preserves legacy contacted/resolved flags.
BEGIN;

ALTER TABLE "ContactEnquiry"
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "type" TEXT,
  ADD COLUMN IF NOT EXISTS "nextAction" TEXT,
  ADD COLUMN IF NOT EXISTS "nextActionDueAt" TIMESTAMP(3);

UPDATE "ContactEnquiry"
SET "status" = CASE
  WHEN "resolved" THEN 'completed'
  WHEN "contacted" THEN 'follow-up-needed'
  ELSE 'new'
END
WHERE "status" IS NULL;

UPDATE "ContactEnquiry"
SET "type" = CASE
  WHEN "source" = 'callback-request' THEN 'call-back-requested'
  ELSE 'other'
END
WHERE "type" IS NULL;

ALTER TABLE "ContactEnquiry"
  ALTER COLUMN "status" SET DEFAULT 'new',
  ALTER COLUMN "status" SET NOT NULL,
  ALTER COLUMN "type" SET DEFAULT 'other',
  ALTER COLUMN "type" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "ContactEnquiry_status_nextActionDueAt_idx"
  ON "ContactEnquiry"("status", "nextActionDueAt");

CREATE TABLE IF NOT EXISTS "ContactEnquiryNote" (
  "id" TEXT NOT NULL,
  "enquiryId" TEXT NOT NULL,
  "authorAdminId" TEXT,
  "authorName" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactEnquiryNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactEnquiryNote_enquiryId_fkey"
    FOREIGN KEY ("enquiryId") REFERENCES "ContactEnquiry"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ContactEnquiryNote_authorAdminId_fkey"
    FOREIGN KEY ("authorAdminId") REFERENCES "Admin"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ContactEnquiryNote_enquiryId_createdAt_idx"
  ON "ContactEnquiryNote"("enquiryId", "createdAt");

COMMIT;