import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Keep the account's configured API version while the SDK only types its latest version.
  apiVersion: "2026-01-28.clover" as Stripe.LatestApiVersion,
});

export const getStripeSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};
