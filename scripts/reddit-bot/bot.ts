import Snoowrap from 'snoowrap';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Configuration
const SUBREDDIT = 'RoastMe';
const POLL_INTERVAL = 60000; // 1 minute
const COOLDOWN_MINUTES = 5;
const BOT_START_TIME = Date.now() / 1000;
const HUMAN_IN_LOOP_COUNT = 10;

// Env validation
const {
  REDDIT_USER_AGENT,
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  JERKSTORE_API_KEY,
  JERKSTORE_API_URL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID
} = process.env;

if (!REDDIT_USER_AGENT || !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD || !JERKSTORE_API_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("Missing environment variables.");
  process.exit(1);
}

// Initialize Clients
const r = new Snoowrap({
  userAgent: REDDIT_USER_AGENT,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  username: REDDIT_USERNAME,
  password: REDDIT_PASSWORD,
});

const telegram = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// State Management
let lastRoastTime = 0;
const processedPosts = new Set<string>();

interface PendingPost {
  redditPostId: string;
  redditPostTitle: string;
  redditPostUrl: string;
  roastOptions: string[];
  timestamp: number;
}

// Map chatId -> PendingPost
const pendingApprovals = new Map<number, PendingPost>();

async function getInsultCandidates(context: string): Promise<string[] | null> {
  try {
    const apiUrl = JERKSTORE_API_URL || 'https://jerkstore.proximalcoast.com/api/generate-insult';
    // Append ?stream=false to force JSON mode
    const fetchUrl = `${apiUrl}?stream=false`;

    console.log(`Generating insults for: "${context.substring(0, 50)}..."`);

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JERKSTORE_API_KEY}`
      },
      body: JSON.stringify({
        topic: context,
        heatLevel: 'spicy',
        language: 'English'
      })
    });

    if (!response.ok) {
      console.error(`API Error (${response.status}):`, await response.text());
      return null;
    }

    const data = await response.json() as { roasts: string[] };
    return data.roasts || null;
  } catch (e) {
    console.error("Fetch Error:", e);
    return null;
  }
}

async function notifyTelegram(post: any, roasts: string[]) {
  const chatId = parseInt(TELEGRAM_CHAT_ID!);

  // Store in pending
  pendingApprovals.set(chatId, {
    redditPostId: post.id,
    redditPostTitle: post.title,
    redditPostUrl: post.permalink,
    roastOptions: roasts,
    timestamp: Date.now()
  });

  let msg = `🔥 *New Roast Candidate*\n`;
  msg += `**Post**: ${post.title}\n`;
  msg += `**Link**: https://reddit.com${post.permalink}\n\n`;
  msg += `Reply with the number (1-${roasts.length}) to post:\n\n`;

  roasts.forEach((roast, index) => {
    msg += `*Option ${index + 1}*:\n${roast}\n\n`;
  });

  await telegram.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
}

// Telegram Message Handler
telegram.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const pending = pendingApprovals.get(chatId);

  if (!pending) {
    if (msg.text === '/ping') telegram.sendMessage(chatId, 'Pong');
    return;
  }

  const selection = parseInt(msg.text || '');
  if (isNaN(selection) || selection < 1 || selection > pending.roastOptions.length) {
    // Only reply if it looks like they are trying to select
    // telegram.sendMessage(chatId, "Invalid selection. Reply 1-5.");
    return;
  }

  const selectedRoast = pending.roastOptions[selection - 1];

  try {
    // Post to Reddit
    console.log(`Posting roast to ${pending.redditPostId}: ${selectedRoast}`);

    // Check cooldown again just in case
    const now = Date.now() / 1000;
    if (now - lastRoastTime < COOLDOWN_MINUTES * 60) {
      telegram.sendMessage(chatId, "⚠️ Cooldown active. Post ignored/delayed (Not fully implemented queue).");
      return;
    }

    // Actual Reddit Posting (Commended out for safety until confirmed)
    /*
    const submission = r.getSubmission(pending.redditPostId);
    await submission.reply(selectedRoast + "\n\n[Roasted by Jerkstore](https://jerkstore.proximalcoast.com)");
    */

    // Simulation
    await telegram.sendMessage(chatId, `✅ **Posted to Reddit!**\n\n${selectedRoast}`, { parse_mode: 'Markdown' });

    lastRoastTime = Date.now() / 1000;
    pendingApprovals.delete(chatId);

  } catch (e) {
    console.error("Reddit Post Error:", e);
    telegram.sendMessage(chatId, `❌ Error posting to Reddit: ${e}`);
  }
});

async function checkNewPosts() {
  try {
    // Only check if we aren't already waiting for user input? 
    // Or allow multiple pending? For simplicity: one pending at a time per chat.
    if (pendingApprovals.has(parseInt(TELEGRAM_CHAT_ID!))) return;

    const now = Date.now() / 1000;
    if (now - lastRoastTime < COOLDOWN_MINUTES * 60) return;

    const submissions = await r.getNew(SUBREDDIT, { limit: 5 });

    for (const post of submissions) {
      if (post.created_utc < BOT_START_TIME) continue;
      if (processedPosts.has(post.id)) continue;
      if (post.likes === true) { processedPosts.add(post.id); continue; }

      console.log(`Found candidate: ${post.title}`);
      processedPosts.add(post.id);

      const context = `${post.title} ${post.selftext}`;
      const roasts = await getInsultCandidates(context);

      if (roasts && roasts.length > 0) {
        await notifyTelegram(post, roasts);
        // Break to handle this one
        break;
      }
    }
  } catch (e) {
    console.error("Loop Error:", e);
  }
}

console.log("🔥 Interactive Jerkstore Bot Started...");
setInterval(checkNewPosts, POLL_INTERVAL);
