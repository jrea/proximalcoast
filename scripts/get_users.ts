
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { assertLocalDatabase } from './_env-guard';
assertLocalDatabase('get_users');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Safe fields only — this script used to dump entire user rows
  // (phone, stripeCustomerId, preferences, credits) to stdout.
  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, name: true, email: true, isGuest: true, createdAt: true }
  })
  console.log('--- Users (safe fields) ---')
  console.log(JSON.stringify(users, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
