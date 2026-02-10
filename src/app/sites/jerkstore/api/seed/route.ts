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
  try {
    // 1. Migrate existing ones
    const existing = await prisma.jerkstore_insult.findMany();
    for (const burn of existing) {
      await prisma.jerkstore_insult_safe.create({
        data: {
          topic: burn.topic,
          content: burn.content,
          language: burn.language,
        }
      });
    }

    // 2. Add curated ones
    for (const burn of CURATED_SAFE_URNS) {
      await prisma.jerkstore_insult_safe.create({
        data: {
          topic: burn.topic,
          content: burn.content,
          language: "English",
        }
      });
    }

    return NextResponse.json({
      message: "Migration and seeding successful",
      migrated: existing.length,
      curated: CURATED_SAFE_URNS.length
    });
  } catch (error) {
    console.error("Migration/Seed failed:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
