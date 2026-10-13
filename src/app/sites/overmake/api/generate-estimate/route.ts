
import { streamText } from 'ai';
import { insultModel } from '../../../../sites/jerkstore/_lib/ai'; // Reuse model config

import { GET_IDENTITY } from "@overmake/prompts/identity";
import { GET_STYLE } from "@overmake/prompts/style";
import { CONSTRAINTS } from "@overmake/prompts/constraints";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";

import { SITE_SLUG, getPlanFromId } from "@overmake/constants";

export const maxDuration = 60;

// Per-user daily generation caps by plan. This endpoint previously had
// NO quota of any kind: any authenticated account — including free
// trial accounts — could make unlimited 60s / 2048-token paid-model
// calls. Cost control belongs server-side, like Jerkstore's quota.
const DAILY_LIMITS: Record<string, number> = {
  trial: 5,
  bushfix: 50,
  diyer: 200,
  succession: 500,
};
const DEFAULT_DAILY_LIMIT = 50;
const MAX_TASK_LENGTH = 2000;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { task, level } = body ?? {};

  // Validate BEFORE anything else: task must be a bounded string and
  // level a real integer in range — previously `task` was unbounded and
  // unvalidated and was interpolated straight into the SYSTEM prompt.
  if (
    typeof task !== 'string' ||
    task.trim().length === 0 ||
    task.length > MAX_TASK_LENGTH ||
    typeof level !== 'number' ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > 10
  ) {
    return new Response("Invalid task or level", { status: 400 });
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

  // Daily quota, counted from persisted estimates (rolling 24h).
  const dailyLimit = DAILY_LIMITS[planId] ?? DEFAULT_DAILY_LIMIT;
  const usedToday = await prisma.overmake_estimate.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (usedToday >= dailyLimit) {
    return new Response(
      `Daily estimate limit reached (${dailyLimit} per day on your plan). Try again tomorrow or upgrade.`,
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const identity = GET_IDENTITY(level);
  const style = GET_STYLE(level);

  // The system prompt contains ONLY server-controlled identity, style
  // and constraints. The user's task text goes in the user prompt, where
  // it cannot rewrite the system's instructions.
  const systemPrompt = `
${identity}

${style}

${CONSTRAINTS}
`;

  const result = await streamText({
    model: insultModel, // Reusing the same model configuration as jerkstore for consistency
    system: systemPrompt,
    prompt: `Generate a detailed estimate/proposal for the task: "${task}" with an engineering complexity level of ${level}/10.`,
    maxOutputTokens: 2048,
    onFinish: async ({ text }) => {
      try {
        // Extract and parse FIRST, then persist exactly ONE row with the
        // best representation. The old callback created a raw row, then
        // a second parsed row (or a third fallback row) — every estimate
        // was stored two or three times.
        let cleanText = text || "";
        const jsonStart = cleanText.indexOf('{');
        const jsonEnd = cleanText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
        }

        let proposal = cleanText;
        let bom = "[]";
        try {
          const parsed = JSON.parse(cleanText);
          proposal = parsed.proposal || cleanText;
          bom = JSON.stringify(parsed.bom) || "[]";
        } catch {
          // Not valid JSON — keep the raw text as the proposal.
        }

        await prisma.overmake_estimate.create({
          data: {
            task,
            level,
            proposal,
            bom,
            userId: session.user.id
          }
        });
      } catch (dbError) {
        console.error("[Overmake DB Error]", dbError);
      }
    }
  });

  return result.toTextStreamResponse();
}
