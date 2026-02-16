import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const MILD_INSULTS = [
  { topic: "Your Face", content: "Your face looks like a topographical map of a failure." },
  { topic: "Your Code", content: "Your codebase is a sprawling monument to incompetence." },
  { topic: "Your Life", content: "You're a genetic cul-de-sac." },
  { topic: "Your Vibes", content: "You have the charisma of a damp sponge." },
  { topic: "Your Future", content: "Your future is so dim you should probably stay in bed." },
  { topic: "Your Intellect", content: "You're living proof that evolution can go in reverse." },
  { topic: "Your Fashion", content: "You dress like a laundry basket exploded." },
  { topic: "Your Cooking", content: "Your cooking tastes like sadness and despair." },
  { topic: "Your Singing", content: "You sound like a cat in a blender." },
  { topic: "Your Driving", content: "You drive like you're trying to escape your own bad decisions." },
  { topic: "Your jokes", content: "Your humor is as dry as a desert and twice as boring." },
  { topic: "Your Personality", content: "You have the personality of a wet napkin." },
  { topic: "Your Hair", content: "Your hair looks like it's trying to escape your head." },
  { topic: "Your Dance Moves", content: "You dance like a scarecrow in a hurricane." },
  { topic: "Your Texting", content: "Your texts are so boring they put my phone to sleep." },
  { topic: "Your Art", content: "Your art looks like a cry for help from a toddler." },
  { topic: "Your Gaming Skills", content: "You play like you're controlling the game with your elbows." },
  { topic: "Your Cleanliness", content: "Your room looks like a tornado hit a landfill." },
  { topic: "Your Punctuality", content: "You're so late you might as well be early for the next event." },
  { topic: "Your Memory", content: "Your memory is shorter than a goldfish with amnesia." },
  { topic: "Your social skills", content: "You make awkward silences feel like a warm hug." },
  { topic: "Your confidence", content: "Your confidence is unearned and confusing." },
  { topic: "Your laziness", content: "You make sloths look like Olympic athletes." },
  { topic: "Your complaining", content: "If complaining was a sport, you'd be a gold medalist." },
  { topic: "Your excuses", content: "Your excuses are more creative than your actual work." },
  { topic: "Your listening skills", content: "Talking to you is like talking to a brick wall with a hearing problem." },
  { topic: "Your indecisiveness", content: "You couldn't decide on a pizza topping if your life depended on it." },
  { topic: "Your forgetfulness", content: "I'd roast you but you'd probably forget it in 5 minutes." },
  { topic: "Your clumsiness", content: "You trip over wireless networks." },
  { topic: "Your luck", content: "If it was raining soup, you'd have a fork." },
  { topic: "Your singing", content: "Your singing voice is considered a war crime in 3 countries." },
  { topic: "Your fashion sense", content: "You dress like you got dressed in the dark... during a power outage." },
  { topic: "Your handwriting", content: "A chicken with ink on its feet writes better than you." },
  { topic: "Your posture", content: "You stand like a question mark." },
  { topic: "Your diet", content: "You eat like a raccoon in a dumpster behind a candy store." },
  { topic: "Your sleep schedule", content: "Your sleep schedule helps vampires feel normal." },
  { topic: "Your focus", content: "You have the attention span of a squirrel on espresso." },
  { topic: "Your organization", content: "Your desktop looks like an icon explosion." },
  { topic: "Your tech skills", content: "You use a computer like a caveman using a spaceship." },
  { topic: "Your plants", content: "Even plastic plants die under your care." },
  { topic: "Your DIY skills", content: "Your DIY projects usually end with calling a professional." },
  { topic: "Your pets", content: "Your cat is judging you right now. And it's right." },
  { topic: "Your coffee order", content: "Your coffee order is just a milkshake with an identity crisis." },
  { topic: "Your patience", content: "You have as much patience as a toddler in a toy store." },
  { topic: "Your selfies", content: "Your phone camera asks for a break every time you open it." },
  { topic: "Your laugh", content: "Your laugh sounds like a hyena choking on a squeaky toy." },
  { topic: "Your secrets", content: "You keep secrets like a sieve holds water." },
  { topic: "Your directions", content: "Asking you for directions is the fastest way to get lost." },
  { topic: "Your morning routine", content: "You wake up looking like you fought a bear and lost." },
  { topic: "Your evening routine", content: "Your bedtime routine is just procrastination in pajamas." }
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

    // 1. Seed Mild Insults
    let seededCount = 0;
    for (const burn of MILD_INSULTS) {
      // Check if this content already exists in jerkstore_insult for System User
      let existingInsult = await prisma.jerkstore_insult.findFirst({
        where: {
          content: burn.content,
          heatLevel: 'mild'
        }
      });

      if (!existingInsult) {
        await prisma.jerkstore_insult.create({
          data: {
            topic: burn.topic,
            content: burn.content,
            language: "English",
            userId: SYSTEM_USER_ID,
            heatLevel: 'mild' // Explicitly set heatLevel
          }
        });
        seededCount++;
      }
    }

    // 2. Update legacy safe insults to be mild
    const updateResult = await prisma.jerkstore_insult.updateMany({
      where: {
        safe_insult: {
          some: {}
        }
      },
      data: {
        heatLevel: 'mild'
      }
    });


    return NextResponse.json({
      message: "Seeding successful",
      seeded: seededCount,
      updatedLegacy: updateResult.count
    });
  } catch (error: any) {
    console.error("Migration/Seed failed:", error);
    return NextResponse.json({ error: "Operation failed", details: error.message }, { status: 500 });
  }
}
