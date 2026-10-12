-- Additive release prerequisite for new Jerkstore credit fulfillment.
-- Review and apply to the verified application DB before deploying the code.
-- This file does not synchronize the rest of schema.prisma or remove tables.
CREATE TABLE IF NOT EXISTS "main"."jerkstore_credit_purchase" (
  "paymentIntentId" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "main"."user"("id") ON DELETE NO ACTION,
  "credits" INTEGER NOT NULL CHECK ("credits" > 0),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
