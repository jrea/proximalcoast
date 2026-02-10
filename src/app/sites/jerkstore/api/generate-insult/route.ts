
import { streamText } from 'ai';
import { insultModel } from '../../_lib/ai';

import { IDENTITY } from "../../prompts/identity";
import { STYLE } from "../../prompts/style";
import { CONSTRAINTS } from "../../prompts/constraints";

export const maxDuration = 30;

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

  const body = await req.json();
  const { language, paid, topic: bodyTopic, prompt } = body;
  const topic = bodyTopic || prompt;
  // Rate Limiting: Check usage in last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todaysUsageCount = await prisma.jerkstore_insult.count({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: twentyFourHoursAgo
      }
    }
  });

  const plan = subscription?.plan || (paid ? "savage" : "standard");
  const LIMIT = plan === "savage" ? 1000 : plan === "elite" ? 200 : 50;

  console.log(`[Jerkstore] Plan: ${plan}, Topic: ${topic}, Usage: ${todaysUsageCount}/${LIMIT}`);

  const isActive = (subscription &&
    subscription.status === "active" &&
    new Date(subscription.expiresAt) > new Date()) || paid === true;

  if (!isActive) {
    return new Response("Subscription required", { status: 403 });
  }

  const isFlagged = await moderateText(topic);
  if (isFlagged) {
    return new Response("That topic is pathetic and we won't roast it. Also, it violates our 'actual lawyer' content policy, you coward.", { status: 400 });
  }

  if (todaysUsageCount >= LIMIT) {
    return new Response(`Daily roast limit reached (${LIMIT}). Go touch some grass.`, { status: 429 });
  }

  const systemPrompt = `
${IDENTITY}

${STYLE}

${CONSTRAINTS}

Language: ${language || 'English'}.
`;

  const result = await streamText({
    model: insultModel,
    system: systemPrompt,
    prompt: `Roast this topic: ${topic}`,
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
