import OpenAI from 'openai';

export async function moderateText(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 10000, maxRetries: 1 });
    const moderation = await openai.moderations.create({ input: text });
    return moderation.results[0].flagged;
  } catch (error) {
    console.error("Jerkstore moderation unavailable", { name: (error as Error).name });
    throw new Error("Moderation unavailable");
  }
}
