export const SITE_SLUG = "overmake";

export const THEMES = {
  TRASH: "trash",
  STANDARD: "standard",
  LUXURY: "luxury",
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

export const PLANS = {
  BUSHFIX: {
    id: "bushfix",
    name: "Bushfix",
    price: "$5/mo",
    description: "Good enough for government work.",
    features: ["Access to Level 1-3", "Dumpster Logic", "No Refunds", "Smells like gasoline"],
    theme: THEMES.TRASH,
    maxLevel: 3,
    priceIdEnvVar: "NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_BUSHFIX"
  },
  DIYER: {
    id: "diyer",
    name: "DIYer",
    price: "$20/mo",
    description: "Solid, dependable, unremarkable.",
    features: ["Access to Level 1-6", "Standard Logic", "Customer Support (Email)", "Tax Deductible?"],
    theme: THEMES.STANDARD,
    maxLevel: 6,
    priceIdEnvVar: "NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_DIYER"
  },
  SUCCESSION: {
    id: "succession",
    name: "Succession",
    price: "$500/mo",
    description: "If you have to ask, you can't afford it.",
    features: ["Access to Level 1-10", "Galactic Logic", "Concierge Abuse", "Titanium Card (Digital)"],
    theme: THEMES.LUXURY,
    maxLevel: 10,
    priceIdEnvVar: "NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_SUCCESSION"
  },
  // Free tier
  TRIAL: {
    id: "trial",
    name: "TRIAL",
    maxLevel: 2,
    theme: THEMES.STANDARD // Default theme for trial
  }
} as const;

export type PlanId = keyof typeof PLANS;

export const getPlanFromId = (id: string | undefined | null) => {
  switch (id) {
    case PLANS.BUSHFIX.id: return PLANS.BUSHFIX;
    case PLANS.DIYER.id: return PLANS.DIYER;
    case PLANS.SUCCESSION.id: return PLANS.SUCCESSION;
    default: return PLANS.TRIAL;
  }
};

export const getLevelDescription = (level: number): string => {
  if (level <= PLANS.BUSHFIX.maxLevel) return "Dumpster Diva";
  if (level <= PLANS.DIYER.maxLevel) return "Suburban Contractor";
  return "Galactic Overlord";
}
