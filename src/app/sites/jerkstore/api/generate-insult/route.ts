
import { streamText } from 'ai';
import { insultModel } from '../../_lib/ai';

import { IDENTITY } from "../../prompts/identity";
import { STYLE } from "../../prompts/style";
import { CONSTRAINTS } from "../../prompts/constraints";
import { EMAIL_CONSTRAINTS } from "../../prompts/email";

export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { moderateText } from "../../_lib/openai";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

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

  if (!isActive) {
    return new Response("Verification Required: Add a card to prove you're an adult and not a middle school bully.", { status: 403 });
  }

  const plan = subscription?.plan || "trial";

  const body = await req.json();
  const { language, topic: bodyTopic, prompt, isEmail } = body;
  const topic = bodyTopic || prompt;

  // Rate Limiting: Check usage
  let currentUsage = 0;
  let LIMIT = 0;

  if (plan === "trial") {
    // Trial is 3 TOTAL roasts ever
    currentUsage = await prisma.jerkstore_insult.count({
      where: { userId: session.user.id }
    });
    LIMIT = 3;
  } else {
    // Other plans are daily roasts
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    currentUsage = await prisma.jerkstore_insult.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    if (plan === "savage") LIMIT = 1000;
    else if (plan === "elite") LIMIT = 200;
    else LIMIT = 3; // standard
  }

  console.log(`[Jerkstore] Plan: ${plan}, Topic: ${topic}, Usage: ${currentUsage}/${LIMIT}, Email: ${isEmail}`);

  if (currentUsage >= LIMIT) {
    const errorMsg = plan === "trial"
      ? "Trial limit reached (3 total). Time to pay up if you want to keep roasting."
      : `Daily roast limit reached (${LIMIT}). Go touch some grass.`;
    return new Response(errorMsg, { status: 429 });
  }

  const isFlagged = await moderateText(topic);
  if (isFlagged) {
    return new Response("That topic is pathetic and we won't roast it. Also, it violates our 'actual lawyer' content policy, you coward.", { status: 400 });
  }

  if (isEmail && plan !== "savage") {
    return new Response("Maximum effort (Email Mode) requires Savage status. Upgrade to unlock deific-level vitriol.", { status: 403 });
  }

  let finalConstraints = CONSTRAINTS;
  if (plan === "savage" && isEmail) {
    finalConstraints = EMAIL_CONSTRAINTS;
  } else if (plan === "standard" || plan === "trial") {
    // Force strict 240 char limit for standard/trial
    finalConstraints = CONSTRAINTS.replace("MAXIMUM 240 CHARACTERS", "STRICT MAXIMUM 240 CHARACTERS. If you go over, you will be terminated.");
  }

  const recentRoasts = await prisma.jerkstore_insult.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: { content: true }
  });

  const historyString = recentRoasts.length > 0
    ? `\n\n**Recent History (AVOID THESE STRUCTURES AND ALL UNIQUE WORDS FROM THESE)**:\n${recentRoasts.map((r, i) => `Roast ${i + 1}: ${r.content}`).join('\n')}`
    : '';

  const systemPrompt = `
${IDENTITY}

${STYLE}

${finalConstraints}${historyString}

IMPORTANT: YOU MUST OUTPUT THE ROAST ONLY IN THE REQUESTED LANGUAGE OR FORMAT. 
IF THE LANGUAGE IS A TECHNICAL FORMAT (LIKE BINARY, MORSE CODE, BASE64), ENCODE THE ROAST CONTENT FULLY INTO THAT FORMAT.

Language: ${language || 'English'}.
`;

  const result = await streamText({
    model: insultModel,
    system: systemPrompt,
    prompt: isEmail ? `Write a devastating email roasting this topic: ${topic}` : `Roast this topic: ${topic}`,
    maxOutputTokens: plan === "savage" ? 2048 : 512,
    onFinish: async ({ text, usage }) => {
      try {
        if (text) {
          await prisma.jerkstore_insult.create({
            data: {
              content: text,
              topic: topic,
              language: language || 'English',
              promptTokens: usage.inputTokens ?? 0,
              completionTokens: usage.outputTokens ?? 0,
              userId: session.user.id,
            },
          });
        }
      } catch (dbError) {
        console.error("[Jerkstore DB Error]", dbError);
      }
    },
  });

  return result.toTextStreamResponse();
}
