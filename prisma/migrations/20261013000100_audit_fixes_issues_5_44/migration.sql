-- DropForeignKey
ALTER TABLE "main"."account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "main"."invitation" DROP CONSTRAINT "invitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "main"."invitation" DROP CONSTRAINT "invitation_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "main"."member" DROP CONSTRAINT "member_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "main"."member" DROP CONSTRAINT "member_userId_fkey";

-- DropForeignKey
ALTER TABLE "main"."session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "main"."bkd_document" DROP CONSTRAINT "bkd_document_userId_fkey";

-- DropForeignKey
ALTER TABLE "main"."bkd_document" DROP CONSTRAINT "bkd_document_organizationId_fkey";

-- AlterTable
ALTER TABLE "main"."ApiKey" ADD COLUMN     "expiresAt" TIMESTAMP(6),
ADD COLUMN     "revokedAt" TIMESTAMP(6);

-- CreateTable
CREATE TABLE "main"."stripe_session_claim" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_session_claim_pkey" PRIMARY KEY ("sessionId")
);

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "main"."account"("userId");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "main"."invitation"("organizationId");

-- CreateIndex
CREATE INDEX "invitation_inviterId_idx" ON "main"."invitation"("inviterId");

-- CreateIndex
CREATE INDEX "member_organizationId_idx" ON "main"."member"("organizationId");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "main"."member"("userId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "main"."session"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "main"."ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "main"."ApiKey"("organizationId");

-- CreateIndex
CREATE INDEX "jerkstore_insult_userId_idx" ON "main"."jerkstore_insult"("userId");

-- CreateIndex
CREATE INDEX "jerkstore_credit_purchase_userId_idx" ON "main"."jerkstore_credit_purchase"("userId");

-- CreateIndex
CREATE INDEX "jerkstore_insult_safe_insultId_idx" ON "main"."jerkstore_insult_safe"("insultId");

-- CreateIndex
CREATE INDEX "overmake_estimate_userId_idx" ON "main"."overmake_estimate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bkd_document_s3Key_key" ON "main"."bkd_document"("s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "bkd_document_hash_key" ON "main"."bkd_document"("hash");

-- CreateIndex
CREATE INDEX "bkd_document_userId_idx" ON "main"."bkd_document"("userId");

-- CreateIndex
CREATE INDEX "bkd_document_organizationId_idx" ON "main"."bkd_document"("organizationId");

-- AddForeignKey
ALTER TABLE "main"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "main"."organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "main"."organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."session" ADD CONSTRAINT "session_activeOrganizationId_fkey" FOREIGN KEY ("activeOrganizationId") REFERENCES "main"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."bkd_document" ADD CONSTRAINT "bkd_document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."bkd_document" ADD CONSTRAINT "bkd_document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "main"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."stripe_session_claim" ADD CONSTRAINT "stripe_session_claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Hand-added CHECK constraints (Prisma cannot express these; the fixed
-- schema.prisma comments describe them as enforced "in migrations").
-- NOTE: the schema comment writes the guest rule with a snake_case
-- "is_guest" column, but the actual Prisma-mapped column is "isGuest"
-- (no @map in the schema), so the constraint uses "isGuest".

-- A user's credit balance can never go negative.
ALTER TABLE "main"."user" ADD CONSTRAINT "user_credits_nonnegative" CHECK ("credits" >= 0);

-- Email is nullable BY DESIGN for guest accounts only.
ALTER TABLE "main"."user" ADD CONSTRAINT "user_email_or_guest" CHECK ("email" IS NOT NULL OR "isGuest" = true);

-- user_subscription vocabulary: every status Stripe can deliver.
ALTER TABLE "main"."user_subscription" ADD CONSTRAINT "user_subscription_status_vocabulary" CHECK ("status" IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'unpaid', 'paused'));

-- user_subscription vocabulary: plan names from src/lib/billing/plans.ts.
ALTER TABLE "main"."user_subscription" ADD CONSTRAINT "user_subscription_plan_vocabulary" CHECK ("plan" IN ('standard', 'elite', 'savage', 'trial', 'bushfix', 'diyer', 'succession'));
ALTER TABLE "main"."user_subscription" ADD CONSTRAINT "user_subscription_upcoming_plan_vocabulary" CHECK ("upcomingPlan" IS NULL OR "upcomingPlan" IN ('standard', 'elite', 'savage', 'trial', 'bushfix', 'diyer', 'succession'));

-- bkd_document vocabulary.
ALTER TABLE "main"."bkd_document" ADD CONSTRAINT "bkd_document_status_vocabulary" CHECK ("status" IN ('PENDING', 'SIGNED'));

-- Review follow-up: index jerkstore_ip_tracking.updatedAt (matches the
-- @@index([updatedAt]) added to the schema) so the retention prune that
-- filters on it does not seq-scan the table.
CREATE INDEX "jerkstore_ip_tracking_updatedAt_idx" ON "main"."jerkstore_ip_tracking"("updatedAt");
