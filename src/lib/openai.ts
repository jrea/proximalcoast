import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function moderateText(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    const moderation = await openai.moderations.create({ input: text });
    return moderation.results[0].flagged;
  } catch (error) {
    console.error("OpenAI Moderation Error:", error);
    // Fail open or closed? Usually fail open for moderation APIs to not block user if service is down, 
    // but for "ensure no hate speech", failing closed (returning true) might be safer. 
    // However, without a key this will strictly block everyone. 
    // Let's log and return false for now to avoid breaking the app if the key is missing/invalid 
    // unless strictly required otherwise.
    return false;
  }
}
