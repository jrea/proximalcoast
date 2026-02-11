import 'server-only';

export const PLANS = {
  SAVAGE: {
    id: "savage",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE!,
  },
  ELITE: {
    id: "elite",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE!,
  },
  FREE: {
    id: "free",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE!,
  }
} as const;

export function getPlanPriceId(planId: string): string | undefined {
  const plan = Object.values(PLANS).find(p => p.id === planId);
  return plan?.priceId;
}
