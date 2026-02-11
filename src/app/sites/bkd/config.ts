import 'server-only';

export const PLANS = {
  BKD_SUBSCRIPTION: {
    id: "bkd_subscription",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BKD || "price_placeholder_bkd",
  }
} as const;

export function getPlanPriceId(planId: string): string | undefined {
  const plan = Object.values(PLANS).find(p => p.id === planId);
  return plan?.priceId;
}
