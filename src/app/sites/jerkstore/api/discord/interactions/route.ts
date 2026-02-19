
import { NextRequest, NextResponse } from 'next/server';
import { InteractionType, InteractionResponseType, verifyKey } from 'discord-interactions';
import { prisma } from '@/lib/db';


// Helper for consistency if not imported
function jsonResponseHelper(obj: any) {
  return new NextResponse(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('X-Signature-Ed25519');
  const timestamp = req.headers.get('X-Signature-Timestamp');
  const body = await req.text();

  if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) {
    return new NextResponse('Bad Request Signature', { status: 401 });
  }

  const isValidRequest = verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY);
  if (!isValidRequest) {
    return new NextResponse('Bad Request Signature', { status: 401 });
  }

  const interaction = JSON.parse(body);

  if (interaction.type === InteractionType.PING) {
    return jsonResponseHelper({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;

    // --- /link Command
    if (name === 'link') {
      const apiKey = options?.find((o: any) => o.name === 'api_key')?.value;
      if (!apiKey) {
        return jsonResponseHelper({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "Please provide your API Key." }
        });
      }

      // Hash key to find user
      const hashedKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey)).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

      const keyRecord = await prisma.apiKey.findUnique({
        where: { key: hashedKey },
        include: { user: true }
      });

      if (!keyRecord || !keyRecord.user) {
        return jsonResponseHelper({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "Invalid API Key." }
        });
      }

      // Link Discord ID to User
      const discordUserId = interaction.member?.user?.id || interaction.user?.id;
      // Username is not stored in account, but we can use it for response if desired
      const discordUsername = interaction.member?.user?.username || interaction.user?.username;

      await prisma.account.upsert({
        where: {
          providerId_accountId: {
            providerId: 'discord-bot',
            accountId: discordUserId
          }
        },
        create: {
          id: `discord-bot-${discordUserId}`,
          userId: keyRecord.userId,
          providerId: 'discord-bot',
          accountId: discordUserId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        update: {
          userId: keyRecord.userId,
          updatedAt: new Date()
        }
      });

      return jsonResponseHelper({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Successfully linked to **${keyRecord.user.username ?? 'User'}**! You can now use \`/roast\`.` }
      });
    }

    // --- /status Command
    if (name === 'status') {
      const discordUserId = interaction.member?.user?.id || interaction.user?.id;
      const account = await prisma.account.findUnique({
        where: {
          providerId_accountId: {
            providerId: 'discord-bot',
            accountId: discordUserId
          }
        },
        include: { user: true }
      });

      if (!account) {
        return jsonResponseHelper({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "You aren't linked. Use `/link <api_key>` to connect your Jerkstore account." }
        });
      }

      return jsonResponseHelper({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `**User**: ${account.user.username}\n**Credits**: ${account.user.credits ?? 0}\n**Daily Limit**: 3 Free / Day (Then use credits)`
        }
      });
    }

    // --- /roast Command
    if (name === 'roast') {
      const discordUserId = interaction.member?.user?.id || interaction.user?.id;
      const target = options?.find((o: any) => o.name === 'target')?.value;
      let style = options?.find((o: any) => o.name === 'style')?.value;

      if (!target) return jsonResponseHelper({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: "Roast who? Your imaginary friend?" } });

      // 1. Authenticate via Link
      const account = await prisma.account.findUnique({
        where: {
          providerId_accountId: {
            providerId: 'discord-bot',
            accountId: discordUserId
          }
        },
        include: { user: true }
      });

      if (!account) {
        return jsonResponseHelper({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "Link your account first with `/link`." }
        });
      }

      const userId = account.userId;

      // If no style provided, check preferences
      if (!style) {
        const prefs = (account.user.preferences as any) || {};
        style = prefs.default_roast_style || 'spicy';
      }

      // 2. Check Limits & Credits
      const LIMIT = 3;

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const count = await prisma.jerkstore_insult.count({
        where: {
          userId: userId,
          createdAt: { gte: twentyFourHoursAgo }
        }
      });

      if (count >= LIMIT) {
        // Check credits
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
        if ((user?.credits ?? 0) <= 0) {
          return jsonResponseHelper({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `🚫 Daily limit reached (${LIMIT}) and no credits! Buy more at the site.` }
          });
        }
        // If credits > 0, we allow it and deduct below
      }

      // 3. Generate Roast
      // Dynamic import to avoid build issues if these are server-only
      const { generateText } = await import('ai');
      const { deepseekV3 } = await import('@/app/sites/jerkstore/_lib/ai');

      const prompt = `Roast this target: "${target}". Style: ${style}. 1 single roast. Short, punchy.`;

      try {
        const result = await generateText({
          model: deepseekV3,
          system: "You are the Jerkstore AI. You roast people. Be mean.",
          prompt: prompt,
          maxOutputTokens: 150
        });

        const roast = result.text;
        const tokensIn = result.usage.inputTokens ?? 0;
        const tokensOut = result.usage.outputTokens ?? 0;

        // Save to DB
        await prisma.jerkstore_insult.create({
          data: {
            content: roast,
            topic: target,
            userId: userId,
            heatLevel: style,
            promptTokens: tokensIn,
            completionTokens: tokensOut
          }
        });

        // Deduct Credit if over daily limit
        if (count >= LIMIT) {
          await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 1 } }
          });
        }

        return jsonResponseHelper({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `<@${discordUserId}> requested a roast of **${target}**:\n\n${roast}` }
        });

      } catch (e) {
        console.error("AI Error", e);
        return jsonResponseHelper({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "Brain freeze. Try again." }
        });
      }
    }
  }

  return new NextResponse('Unknown Command', { status: 400 });
}
