import "server-only";

/**
 * Single source of truth for the plan <-> Stripe price mapping.
 *
 * Prices are configured per plan through NEXT_PUBLIC_STRIPE_PRICE_ID_* env
 * vars (the same vars the per-site config modules use). Everything that
 * needs to resolve a plan from a price — or a price from a plan — goes
 * through here, and an unknown price resolves to `null`, never to a
 * defaulted plan name: silently recording a paid subscription as
 * "standard" hid real plan data (see the audit issue on plan resolution).
 *
 * Env is read lazily on each call so configuration is always current and
 * tests can set the vars they exercise.
 */

const PRICE_ENV_BY_PLAN: Record<string, string> = {
  savage: "NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE",
  elite: "NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE",
  // Jerkstore's free tier: the config id is "free", the stored plan name
  // has always been "trial" — accept both as input, emit "trial".
  free: "NEXT_PUBLIC_STRIPE_PRICE_ID_FREE",
  trial: "NEXT_PUBLIC_STRIPE_PRICE_ID_FREE",
  standard: "NEXT_PUBLIC_STRIPE_PRICE_ID_BKD",
  bushfix: "NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_BUSHFIX",
  diyer: "NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_DIYER",
  succession: "NEXT_PUBLIC_STRIPE_PRICE_ID_OVERMAKE_SUCCESSION",
};

const CANONICAL_PLAN: Record<string, string> = { free: "trial" };

export function getPriceIdForPlan(plan: string): string | undefined {
  const envName = PRICE_ENV_BY_PLAN[plan];
  const value = envName ? process.env[envName] : undefined;
  return value ? value : undefined;
}

export function getPlanFromPriceId(priceId: string): string | null {
  for (const [plan, envName] of Object.entries(PRICE_ENV_BY_PLAN)) {
    const configured = process.env[envName];
    if (configured && configured === priceId) {
      return CANONICAL_PLAN[plan] ?? plan;
    }
  }
  return null;
}

/** Every price ID the server is configured to sell, across all sites. */
export function getAllowedPriceIds(): Set<string> {
  const ids = new Set<string>();
  for (const envName of Object.values(PRICE_ENV_BY_PLAN)) {
    const value = process.env[envName];
    if (value) ids.add(value);
  }
  return ids;
}

/**
 * Resolve a client plan-change request to a server-trusted price + plan.
 * Accepts a plan name (preferred) or a bare priceId for backward
 * compatibility, but a priceId is only honored if it is one of the
 * configured plan prices — arbitrary Stripe prices are rejected.
 */
export function resolvePlanChange(input: {
  planId?: unknown;
  priceId?: unknown;
  newPlanName?: unknown;
}): { priceId: string; plan: string } | null {
  if (typeof input.planId === "string" && input.planId) {
    const priceId = getPriceIdForPlan(input.planId);
    if (!priceId) return null;
    return { priceId, plan: CANONICAL_PLAN[input.planId] ?? input.planId };
  }
  if (typeof input.priceId === "string" && input.priceId) {
    if (!getAllowedPriceIds().has(input.priceId)) return null;
    const plan = getPlanFromPriceId(input.priceId);
    if (!plan) return null;
    // The stored plan name is always derived server-side; a caller-supplied
    // name is only tolerated when it agrees with the resolved plan.
    if (
      typeof input.newPlanName === "string" &&
      input.newPlanName &&
      (CANONICAL_PLAN[input.newPlanName] ?? input.newPlanName) !== plan
    ) {
      return null;
    }
    return { priceId: input.priceId, plan };
  }
  return null;
}
