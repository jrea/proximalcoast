
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const subscriptions = await prisma.user_subscription.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5
  })
  console.log('--- Last 5 Subscriptions ---')
  console.log(JSON.stringify(subscriptions, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
