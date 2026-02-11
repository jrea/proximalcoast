
import { streamText } from 'ai';
import { insultModel } from '../../../../sites/jerkstore/_lib/ai'; // Reuse model config

import { GET_IDENTITY } from "@overmake/prompts/identity";
import { GET_STYLE } from "@overmake/prompts/style";
import { CONSTRAINTS } from "@overmake/prompts/constraints";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { moderateText } from "../../../../sites/jerkstore/_lib/openai"; // Reuse moderation

import { SITE_SLUG, getPlanFromId } from "@overmake/constants";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { task, level } = body;

  if (!task || typeof level !== 'number') {
    return new Response("Missing task or level", { status: 400 });
  }

  // Check for subscription
  const subscription = await prisma.user_subscription.findUnique({
    where: {
      userId_siteSlug: {
        userId: session.user.id,
        siteSlug: SITE_SLUG,
      },
    },
  });

  const isActive = !!(subscription &&
    (subscription.status === "active" || subscription.status === "trialing") &&
    new Date(subscription.expiresAt) > new Date());

  // Default to trial logic if no subscription or expired
  const planId = isActive ? subscription.plan : "trial";
  const currentPlan = getPlanFromId(planId);

  const maxLevel = currentPlan.maxLevel;

  // Enforce Max Level
  if (level > maxLevel) {
    // If no plan, prompt to upgrade
    if (!isActive) {
      return new Response(`Upgrade required to access Level ${level}. You are currently on the "Broke" plan (Max Level ${maxLevel}).`, { status: 403 });
    }
    return new Response(`Your plan (${currentPlan.name}) limits you to Level ${maxLevel}. Upgrade to unlock Level ${level}.`, { status: 403 });
  }

  const identity = GET_IDENTITY(level);
  const style = GET_STYLE(level);

  const systemPrompt = `
${identity}

${style}

${CONSTRAINTS}

Task to Estimate: "${task}"
`;

  const result = await streamText({
    model: insultModel, // Reusing the same model configuration as jerkstore for consistency
    system: systemPrompt,
    prompt: `Generate a detailed estimate/proposal for the task: "${task}" with an engineering complexity level of ${level}/10.`,
    maxOutputTokens: 2048,
    onFinish: async ({ text }) => {
      try {
        // Attempt to parse JSON to ensure it's valid before saving? 
        // Or just save raw text. Given the constraints, we expect JSON.
        // We'll save as string for now, parsing happen on frontend for display.

        // We need to extract the JSON part if there is any extra text (though we instructed not to)
        let cleanText = text || "";
        const jsonStart = cleanText.indexOf('{');
        const jsonEnd = cleanText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
        }

        await prisma.overmake_estimate.create({
          data: {
            task,
            level,
            proposal: cleanText, // Storing the whole JSON blob in proposal for now, or we could split it.
            // The schema has 'proposal' and 'bom'. 
            // Let's rely on the frontend or a separate parsing step to split it if we want distinct columns,
            // BUT the schema has 'bom' as a separate column.
            // To fill the DB correctly, we should parse it here.
            bom: "[]", // Default if parse fails
            userId: session.user.id
          }
        });

        // Re-update with parsed data if valid
        if (jsonStart !== -1 && jsonEnd !== -1) {
          try {
            const parsed = JSON.parse(cleanText);
            // Find the just created record? Or create it now?
            // Better to create it now.
            await prisma.overmake_estimate.create({
              data: {
                task,
                level,
                proposal: parsed.proposal || cleanText,
                bom: JSON.stringify(parsed.bom) || "[]",
                userId: session.user.id
              }
            });
          } catch (e) {
            console.error("Failed to parse AI response for DB save", e);
            // Fallback save
            await prisma.overmake_estimate.create({
              data: {
                task,
                level,
                proposal: text,
                bom: "[]",
                userId: session.user.id
              }
            });
          }
        }

      } catch (dbError) {
        console.error("[Overmake DB Error]", dbError);
      }
    }
  });

  return result.toTextStreamResponse();
}
