-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "main";

-- CreateTable
CREATE TABLE "main"."account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(6),
    "refreshTokenExpiresAt" TIMESTAMP(6),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "inviterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "stripeCustomerId" TEXT,
    "username" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "preferences" JSONB,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "phone" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."user_subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteSlug" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'standard',
    "upcomingPlan" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "priceAmount" INTEGER,
    "priceCurrency" TEXT,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6),
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "lastUsedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."jerkstore_insult" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topic" TEXT,
    "language" TEXT,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "isEmail" BOOLEAN NOT NULL DEFAULT false,
    "heatLevel" TEXT NOT NULL DEFAULT 'spicy',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "jerkstore_insult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."jerkstore_credit_purchase" (
    "paymentIntentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jerkstore_credit_purchase_pkey" PRIMARY KEY ("paymentIntentId")
);

-- CreateTable
CREATE TABLE "main"."jerkstore_insult_safe" (
    "id" TEXT NOT NULL,
    "insultId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jerkstore_insult_safe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."overmake_estimate" (
    "id" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "proposal" TEXT NOT NULL,
    "bom" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "overmake_estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."jerkstore_ip_tracking" (
    "ip" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "jerkstore_ip_tracking_pkey" PRIMARY KEY ("ip")
);

-- CreateTable
CREATE TABLE "main"."bkd_document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "hash" TEXT,
    "auditLog" JSONB,
    "signerEmail" TEXT,
    "signerName" TEXT,
    "signatureFont" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "bkd_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "main"."account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "main"."organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "main"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "main"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_stripeCustomerId_key" ON "main"."user"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "main"."user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscription_stripeSubscriptionId_key" ON "main"."user_subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscription_userId_siteSlug_key" ON "main"."user_subscription"("userId", "siteSlug");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "main"."verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "main"."ApiKey"("key");

-- AddForeignKey
ALTER TABLE "main"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "main"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "main"."organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "main"."organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "main"."user_subscription" ADD CONSTRAINT "user_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "main"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."jerkstore_insult" ADD CONSTRAINT "jerkstore_insult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."jerkstore_credit_purchase" ADD CONSTRAINT "jerkstore_credit_purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."jerkstore_insult_safe" ADD CONSTRAINT "jerkstore_insult_safe_insultId_fkey" FOREIGN KEY ("insultId") REFERENCES "main"."jerkstore_insult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."overmake_estimate" ADD CONSTRAINT "overmake_estimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."bkd_document" ADD CONSTRAINT "bkd_document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."bkd_document" ADD CONSTRAINT "bkd_document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "main"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

