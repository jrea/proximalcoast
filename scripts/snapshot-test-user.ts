/**
 * One-time snapshot script.
 * Run: npx ts-node -e "require('dotenv').config({ path: '.env.local' })" scripts/snapshot-test-user.ts
 * Prints the real DB state for bkd@bkd.com so we can bake it into the central mock.
 * READ-ONLY. No mutations.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = 'bkd@bkd.com';

  const user = await (prisma.user as any).findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      isGuest: true,
      credits: true,
      stripeCustomerId: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    console.error(`User ${email} not found`);
    process.exit(1);
  }

  console.log('\n=== USER ===');
  console.log(JSON.stringify(user, null, 2));

  const subscriptions = await prisma.user_subscription.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      siteSlug: true,
      stripeSubscriptionId: true,
      status: true,
      plan: true,
      upcomingPlan: true,
      cancelAtPeriodEnd: true,
      priceAmount: true,
      priceCurrency: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log('\n=== SUBSCRIPTIONS ===');
  console.log(JSON.stringify(subscriptions, null, 2));

  const insults = await prisma.jerkstore_insult.findMany({
    where: { userId: user.id },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: { id: true, content: true, topic: true, weight: true, isEmail: true, heatLevel: true },
  });

  console.log('\n=== RECENT INSULTS (last 3) ===');
  console.log(JSON.stringify(insults, null, 2));

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, lastUsedAt: true },
  });

  console.log('\n=== API KEYS ===');
  console.log(JSON.stringify(apiKeys, null, 2));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
