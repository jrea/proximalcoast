import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Count all insults to pick a random one
    const count = await prisma.jerkstore_insult.count();

    if (count === 0) {
      return NextResponse.json({
        topic: "Nothingness",
        content: "The database is as empty as your personality. Add some data, you absolute void."
      });
    }

    const randomIndex = Math.floor(Math.random() * count);

    const randomInsult = await prisma.jerkstore_insult.findFirst({
      skip: randomIndex,
    });

    return NextResponse.json(randomInsult);
  } catch (error) {
    console.error("Failed to fetch random insult:", error);
    return NextResponse.json({ error: "Failed to grab a burn" }, { status: 500 });
  }
}
