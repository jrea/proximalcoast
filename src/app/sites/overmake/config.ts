import 'server-only';
import { PLANS as PUBLIC_PLANS } from './constants';

export const PLANS = {
  BUSHFIX: {
    ...PUBLIC_PLANS.BUSHFIX,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_BUSHFIX!,
  },
  DIYER: {
    ...PUBLIC_PLANS.DIYER,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_DIYER!,
  },
  SUCCESSION: {
    ...PUBLIC_PLANS.SUCCESSION,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_SUCCESSION!,
  },
  TRIAL: {
    ...PUBLIC_PLANS.TRIAL,
    // No priceId for trial
  }
} as const;

export function getPlanPriceId(planId: string): string | undefined {
  const plan = Object.values(PLANS).find(p => p.id === planId);
  return (plan && 'priceId' in plan) ? plan.priceId : undefined;
}
