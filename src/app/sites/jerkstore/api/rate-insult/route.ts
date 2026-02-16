
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const RateSchema = z.object({
  content: z.string(),
  weight: z.number().int().min(-1).max(2),
  topic: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, weight, topic } = RateSchema.parse(body);

    let userId: string | null = null;
    let isGuest = false;

    // 1. Check Auth Session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      userId = session.user.id;
    } else {
      // 2. Check Guest Cookie
      const cookieStore = await cookies();
      const guestIdCookie = cookieStore.get("x-jerkstore-guest-id");

      if (guestIdCookie) {
        // Verify this guest ID exists
        const guestUser = await prisma.user.findUnique({
          where: { id: guestIdCookie.value },
        });

        if (guestUser) {
          userId = guestUser.id;
          isGuest = true;
        }
      }
    }

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 3. Find the insult
    // We match by content and userId to ensure ownership.
    // Topic is optional but helpful for precision if same content generated for different topics (unlikely but possible)
    const insult = await prisma.jerkstore_insult.findFirst({
      where: {
        userId: userId,
        content: content,
        ...(topic ? { topic: topic } : {}),
      },
      orderBy: { createdAt: "desc" }, // Get the most recent one if duplicates exist
    });

    if (!insult) {
      return new Response("Insult not found or access denied.", { status: 404 });
    }

    // 4. Update the weight
    await prisma.jerkstore_insult.update({
      where: { id: insult.id },
      data: { weight: weight },
    });

    return new Response(JSON.stringify({ success: true, newWeight: weight }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid input", { status: 400 });
    }
    console.error("[Rate Insult Error]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
