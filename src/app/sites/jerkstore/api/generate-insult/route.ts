
import { streamText } from 'ai';
import { insultModel } from '@/lib/ai';

import { IDENTITY } from "../../prompts/identity";
import { STYLE } from "../../prompts/style";
import { CONSTRAINTS } from "../../prompts/constraints";

export const maxDuration = 30;

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { moderateText } from "@/lib/openai";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { topic, language } = await req.json();

  const isFlagged = await moderateText(topic);
  if (isFlagged) {
    return new Response("Topic violates content policy", { status: 400 });
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
    onFinish: async ({ text }) => {
      if (text) {
        await prisma.jerkstore_insult.create({
          data: {
            content: text,
            topic: topic,
            language: language || 'English',
            userId: session.user.id,
          },
        });
      }
    },
  });

  return result.toTextStreamResponse();
}
