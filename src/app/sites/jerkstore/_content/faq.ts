import { CREDIT_COSTS, FREE_ROAST_LIMIT, CREDIT_PACKAGES } from "../constants";

// The same factual answers appear on the page and in its structured data.
export const jerkstoreFaqs = [
  { question: "What is Jerkstore?", answer: "Jerkstore is a free AI insult and roast generator by Proximal Coast. Enter a target or topic, pick Mild, Spicy or Nuclear, and generate insults you can copy or share. It also generates brutal roasts and comebacks." },
  { question: "Is the AI insult generator free?", answer: `Yes. Try ${FREE_ROAST_LIMIT} individual roast results per 24-hour window without signing up. Guest usage is limited by browser and network. Optional credits let you keep roasting after the free allowance.` },
  { question: "Can it generate savage and brutal roasts?", answer: "Yes. Nuclear is the strongest heat setting: profanity-laden, savage and brutal. Sign in to unlock it. Spicy is open to guests and can also include profanity; Mild turns the heat down. Give it a specific detail for a more personal roast." },
  { question: "How many roasts do I get?", answer: `Standard mode returns up to five variations. Free requests use the individual results left in your allowance. Credits cover the rest when you have enough for a full pack. Max Effort returns one extended roast for ${CREDIT_COSTS.LONG_ROAST} credits.` },
  { question: "What do paid credits cost?", answer: `${CREDIT_PACKAGES.map(pack => `$${pack.amount / 100} for ${pack.credits} credits`).join(", ")}. A full standard pack costs ${CREDIT_COSTS.STANDARD_PACK} credits after the free allowance. No subscription required.` },
  { question: "Can I generate comebacks?", answer: "Yes. Put the line you want to respond to in the topic field and ask for a comeback. Add context and pick the heat. Copy the result or use it as the start of your own reply." },
  { question: "Where can I view all my roasts?", answer: "View all your roasts opens your own history. Signed-in users see their account's results; guests see this browser's guest history. Clearing your guest cookie can disconnect you from that history." },
] as const;
