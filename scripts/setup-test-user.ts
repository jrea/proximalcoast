import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.TEST_USER_EMAIL || 'test-bot-user@example.com';
  const name = 'Test Bot User';

  console.log(`Setting up test user: ${email}...`);

  try {
    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: crypto.randomUUID(),
        email,
        name,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log(`User ID: ${user.id}`);

    // 2. Ensure Subscription (Trial at least)
    await prisma.user_subscription.upsert({
      where: {
        userId_siteSlug: {
          userId: user.id,
          siteSlug: 'jerkstore'
        }
      },
      update: {
        status: 'active',
        plan: 'savage',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      create: {
        userId: user.id,
        siteSlug: 'jerkstore',
        stripeSubscriptionId: `sub_test_${Date.now()}`,
        status: 'active',
        plan: 'savage',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });

    console.log("Subscription: Active (Savage Tier)");

    // 3. Generate API Key
    const rawKey = `jk_test_${crypto.randomBytes(16).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    await prisma.apiKey.create({
      data: {
        key: hashedKey,
        name: "Test Script Key",
        userId: user.id
      }
    });

    console.log("\n✅ API Key Created Successfully!");
    console.log("------------------------------------------------");
    console.log(`Key: ${rawKey}`);
    console.log("------------------------------------------------");
    console.log("Use this key in scripts/test-api.sh or your .env file.");
    console.log(`\nExample:\n./scripts/test-api.sh ${rawKey}`);

  } catch (error) {
    console.error("Setup Error:", error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
