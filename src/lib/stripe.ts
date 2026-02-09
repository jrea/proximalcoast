import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getStripeSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};
