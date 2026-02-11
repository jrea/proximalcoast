import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const CURATED_SAFE_URNS = [
  { topic: "Your Face", content: "Your face looks like a topographical map of a failure." },
  { topic: "Your Code", content: "Your codebase is a sprawling monument to incompetence." },
  { topic: "Your Life", content: "You're a genetic cul-de-sac." },
  { topic: "Your Vibes", content: "You have the charisma of a damp sponge." },
  { topic: "Your Future", content: "Your future is so dim you should probably stay in bed." },
  { topic: "Your Intellect", content: "You're living proof that evolution can go in reverse." }
];

export async function GET() {
  const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

  try {
    // 0. Ensure System User exists
    await prisma.user.upsert({
      where: { id: SYSTEM_USER_ID },
      update: {},
      create: {
        id: SYSTEM_USER_ID,
        name: "System",
        email: "system@jerkstore.com",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // 1. Migrate existing ones (if any were missed or for re-seeding)
    const existing = await prisma.jerkstore_insult.findMany();
    let migratedCount = 0;
    for (const burn of existing) {
      // Check if already in safe
      const isSafe = await prisma.jerkstore_insult_safe.findFirst({
        where: { insultId: burn.id }
      });

      if (!isSafe) {
        await prisma.jerkstore_insult_safe.create({
          data: {
            insultId: burn.id,
          }
        });
        migratedCount++;
      }
    }

    // 2. Add curated ones
    let curatedCount = 0;
    for (const burn of CURATED_SAFE_URNS) {
      // Check if this content already exists in jerkstore_insult for System User
      let existingInsult = await prisma.jerkstore_insult.findFirst({
        where: {
          content: burn.content,
          userId: SYSTEM_USER_ID
        }
      });

      if (!existingInsult) {
        existingInsult = await prisma.jerkstore_insult.create({
          data: {
            topic: burn.topic,
            content: burn.content,
            language: "English",
            userId: SYSTEM_USER_ID,
          }
        });
      }

      // Check if reference exists
      const isSafe = await prisma.jerkstore_insult_safe.findFirst({
        where: { insultId: existingInsult.id }
      });

      if (!isSafe) {
        await prisma.jerkstore_insult_safe.create({
          data: {
            insultId: existingInsult.id,
          }
        });
        curatedCount++;
      }
    }

    return NextResponse.json({
      message: "Seeding successful",
      migrated: migratedCount,
      curated: curatedCount
    });
  } catch (error) {
    console.error("Migration/Seed failed:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
