import Stripe from "stripe";

/**
 * The Stripe client is created lazily on first use.
 *
 * Previously this module threw at import time when STRIPE_SECRET_KEY was
 * missing, so any module that transitively imported it (builds, tests,
 * unrelated pages) crashed instead of only failing when a billing
 * operation was actually attempted.
 *
 * No apiVersion is pinned here: the installed `stripe` SDK version (see
 * package.json) determines the API version, so response types always
 * match runtime behavior. Bump the SDK deliberately when the account's
 * API version changes — do not reintroduce a hand-written version string
 * cast through `Stripe.LatestApiVersion`, which made the compiler lie
 * about the shapes this client returns.
 */
let cached: Stripe | null = null;

function loadStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing");
  }
  cached ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return cached;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const real = loadStripe();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export const getStripeSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};
