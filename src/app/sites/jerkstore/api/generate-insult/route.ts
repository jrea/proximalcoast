import { streamText, Output } from 'ai';
import { z } from 'zod';
import { deepseekV3, deepseekR1 } from '../../_lib/ai';

import { NUCLEAR_IDENTITY, SPICY_IDENTITY, MILD_IDENTITY } from "../../prompts/identity";
import { NUCLEAR_STYLE, SPICY_STYLE, MILD_STYLE } from "../../prompts/style";
import { NUCLEAR_CONSTRAINTS, SPICY_CONSTRAINTS, MILD_CONSTRAINTS } from "../../prompts/constraints";
import { EMAIL_CONSTRAINTS } from "../../prompts/email";

export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { moderateText } from "../../_lib/openai";
import { generateJerkName } from "../../_lib/username-generator";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const fullBody = await req.json();
  const body = fullBody.object || fullBody;
  const { language, topic: bodyTopic, prompt, isEmail, heatLevel: requestedHeatLevel, username: requestedUsername } = body;
  const topic = bodyTopic || prompt;

  let userId = session?.user.id;
  let userPlan = "trial"; // Default to trial
  let isGuest = false;
  let newGuestId: string | null = null;
  let finalUsername: string | null = null;

  if (session) {
    userId = session.user.id;
    // Check for subscription
    const subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: session.user.id,
          siteSlug: "jerkstore",
        },
      },
    });

    const isActive = !!(subscription &&
      (subscription.status === "active" || subscription.status === "trialing") &&
      new Date(subscription.expiresAt) > new Date());

    if (isActive) {
      userPlan = subscription?.plan || "trial";
    }
  } else {
    // Guest / Zero Sign-up Flow
    const cookieStore = await cookies();
    const guestIdCookie = cookieStore.get("x-jerkstore-guest-id");

    if (guestIdCookie) {
      // Allow for "claiming" a user by this cookie ID
      const guestUser = await prisma.user.findUnique({
        where: { id: guestIdCookie.value }
      });

      if (guestUser) {
        userId = guestUser.id;
        isGuest = true;
        finalUsername = guestUser.username;
      }
    }

    if (!userId) {
      // Create new Guest User
      const newUsername = requestedUsername || generateJerkName();

      try {
        const newUser = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            name: newUsername,
            // email: null, // implied
            username: newUsername,
            isGuest: true,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });

        userId = newUser.id;
        newGuestId = newUser.id;
        isGuest = true;
        finalUsername = newUsername;
      } catch (e: any) {
        if (e.code === 'P2002') {
          return new Response("That handle is already taken. Be more original.", { status: 409 });
        }
        console.error("Failed to create guest user", e);
        return new Response("Failed to initialize your pathetic existence.", { status: 500 });
      }
    }
  }

  // Double check we have a userId
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Enforce Heat Level for Trial Plan (Guests are enforced as Trial)
  // Trial users are locked to 'mild'
  let heatLevel = requestedHeatLevel;
  if (userPlan === "trial") {
    heatLevel = "mild";
  }

  // Rate Limiting: Check usage
  let currentUsage = 0;
  let LIMIT = 0;

  if (userPlan === "trial") {
    // Trial is 3 TOTAL roasts ever
    // Note: guest users are persistent now via DB + Cookie
    currentUsage = await prisma.jerkstore_insult.count({
      where: { userId: userId }
    });
    LIMIT = 3;
  } else {
    // Other plans are daily roasts
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    currentUsage = await prisma.jerkstore_insult.count({
      where: {
        userId: userId,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    if (userPlan === "savage") LIMIT = 1000;
    else if (userPlan === "elite") LIMIT = 200;
    else LIMIT = 3; // standard
  }

  console.log(`[Jerkstore] Plan: ${userPlan}, User: ${userId} (${isGuest ? 'Guest' : 'User'}), Topic: ${topic}, Usage: ${currentUsage}/${LIMIT}, Email: ${isEmail}, Heat: ${heatLevel}`);

  if (currentUsage >= LIMIT) {
    const errorMsg = userPlan === "trial"
      ? "Trial limit reached (3 total). Time to pay up if you want to keep roasting."
      : `Daily roast limit reached (${LIMIT}). Go touch some grass.`;
    return new Response(errorMsg, { status: 429 });
  }

  // We are generating a pack of roasts/emails.
  // Dynamic Count: 1 for Email Mode, 5 for standard roasts
  const ROAST_COUNT = isEmail ? 1 : 5;

  const isFlagged = await moderateText(topic);
  if (isFlagged) {
    return new Response("That topic is pathetic and we won't roast it. Also, it violates our 'actual lawyer' content policy, you coward.", { status: 400 });
  }

  if (isEmail && userPlan !== "savage") {
    return new Response("Maximum effort (Email Mode) requires Savage status. Upgrade to unlock deific-level vitriol.", { status: 403 });
  }

  // Determine Identity, Style, and Base Constraints based on Heat Level
  let identity = NUCLEAR_IDENTITY;
  let style = NUCLEAR_STYLE;
  let constraints = NUCLEAR_CONSTRAINTS;

  if (heatLevel === "mild") {
    identity = MILD_IDENTITY;
    style = MILD_STYLE;
    constraints = MILD_CONSTRAINTS;
  } else if (heatLevel === "spicy") {
    identity = SPICY_IDENTITY;
    style = SPICY_STYLE;
    constraints = SPICY_CONSTRAINTS;
  }
  // Default to Nuclear if unknown or explicit

  // Handle constraints override for Email Mode or lower tiers
  let finalConstraints = constraints;

  if (isEmail) {
    // Email mode always uses the email constraints structure
    // We append a note if Mild to ensure tone consistency despite the email constraint's default "profanity required"
    finalConstraints = EMAIL_CONSTRAINTS;
  } else if (userPlan === "standard" || userPlan === "trial") {
    // Force strict 240 char limit for standard/trial based on the active constraint set
    // We need to find the length constraint and replace it
    // Or just append the stricter limit
    finalConstraints += "\nSTRICT LENGTH LIMIT: 240 CHARACTERS MAXIMUM. If you go over, you will be terminated.";
  }

  const recentRoasts = await prisma.jerkstore_insult.findMany({
    where: {
      userId: userId,
      isEmail: isEmail || false
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { content: true }
  });

  const historyString = recentRoasts.length > 0
    ? `\n\n**Recent History (AVOID THESE STRUCTURES AND ALL UNIQUE WORDS FROM THESE)**:\n${recentRoasts.map((r, i) => `Roast ${i + 1}: ${r.content}`).join('\n')}`
    : '';

  const systemPrompt = `
${identity}

${style}

${finalConstraints}

Language: ${language || 'English'}.

STRICT REQUIREMENT: You MUST generate exactly ${ROAST_COUNT} distinct roasts. 
Each roast should use a different Attack Style from the Jerkstore Code.
Ensure variety in structure and metaphor. 
If in Response Mode, provide 5 different ways to respond to the provided input.

${historyString}
`.trim();

  // The "Rider" Logic
  // Short input -> V3 (fast, cheap, witty)
  // Long/Technical input -> R1 (context-heavy, better niche understanding)
  // User examples: 
  // - "someone was mean to me" (short) -> V3
  // - "a specific job, a niche hobby, or a complex social dynamic" (complex) -> R1
  const isComplex = topic.length > 50 || (topic.match(/,/g) || []).length >= 2;
  const selectedModel = isComplex ? deepseekR1 : deepseekV3;

  const v3Params = !isComplex ? {
    temperature: 1.15,
    topP: 0.9,
    frequencyPenalty: 0.6,
    presencePenalty: 0.6,
  } : {};


  // Prepare response headers for cookies
  const responseHeaders = new Headers();

  if (newGuestId) {
    responseHeaders.append('Set-Cookie', `x-jerkstore-guest-id=${newGuestId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 365}`);
  }

  if (finalUsername) {
    // Readable cookie for frontend
    responseHeaders.append('Set-Cookie', `x-jerkstore-handle=${finalUsername}; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 365}`);
  }

  const result = await streamText({
    model: selectedModel,
    output: Output.object({
      schema: z.object({
        roasts: z.array(z.string()).length(ROAST_COUNT),
      }),
    }),
    system: systemPrompt,
    prompt: isEmail ? `Write 1 devastating email roasting this topic: ${topic}` : `Generate a pack of 5 roasts for this topic: ${topic}`,
    maxOutputTokens: 2048,
    ...v3Params,
  });

  // Handle saving to DB when stream finishes
  // Note: userId is captured in closure
  (async () => {
    try {
      const output = await result.output; // await the promise
      const roasts = output.roasts;
      const usage = await result.totalUsage;

      if (roasts && roasts.length > 0) {
        // Flatten the usage across 5 records for simplicity
        const perRoastInput = Math.ceil((usage.inputTokens ?? 0) / ROAST_COUNT);
        const perRoastOutput = Math.ceil((usage.outputTokens ?? 0) / ROAST_COUNT);

        await Promise.all(roasts.map((text: string) =>
          prisma.jerkstore_insult.create({
            data: {
              content: text,
              topic: topic,
              language: language || 'English',
              promptTokens: perRoastInput,
              completionTokens: perRoastOutput,
              userId: userId as string, // Safe cast as we checked it
              isEmail: isEmail || false,
              heatLevel: heatLevel || 'spicy'
            },
          })
        ));
      }
    } catch (error) {
      console.error("[Jerkstore DB Error]", error);
    }
  })();

  return result.toTextStreamResponse({
    headers: responseHeaders
  });
}

