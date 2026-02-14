import { config } from "dotenv";
config({ path: ".env.local" });
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace("localhost", "127.0.0.1");
}
import { prisma } from "./src/lib/db";

async function main() {
  const count = await prisma.jerkstore_insult.count({
    where: { heatLevel: 'mild' }
  });
  console.log(`Mild insults count: ${count}`);

  const total = await prisma.jerkstore_insult.count();
  console.log(`Total insults count: ${total}`);

  const sample = await prisma.jerkstore_insult.findFirst();
  console.log("Sample insult heatLevel:", sample?.heatLevel);
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
