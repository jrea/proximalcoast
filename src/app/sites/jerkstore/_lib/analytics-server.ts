import "server-only";
import { after } from "next/server";
import { PostHog } from "posthog-node";
import { v5 as uuidv5 } from "uuid";
import type Stripe from "stripe";

export function capturePurchaseConversion(intent: Stripe.PaymentIntent, paidAt: number) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || !intent.livemode || intent.status !== "succeeded" || intent.metadata.siteSlug !== "jerkstore" || intent.metadata.type !== "credits_purchase") return;
  const userId = intent.metadata.userId;
  if (!userId || !Number.isSafeInteger(intent.amount_received) || intent.amount_received < 1 || !Number.isFinite(paidAt)) return;
  try {
    after(async () => {
      const client = new PostHog(key, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com", flushAt: 1, flushInterval: 0, requestTimeout: 3000, fetchRetryCount: 1 });
      try {
        client.capture({
          distinctId: userId,
          event: "credit_purchase_completed",
          uuid: uuidv5(`jerkstore-purchase:${intent.id}`, uuidv5.URL),
          timestamp: new Date(paidAt * 1000),
          disableGeoip: true,
          properties: { site: "jerkstore", currency: intent.currency.toUpperCase(), $revenue: intent.amount_received / 100, value: intent.amount_received / 100, credits: Number(intent.metadata.creditsAmount), packageId: intent.metadata.packageId, source: "stripe_webhook" },
        });
        await client.shutdown();
      } catch { console.error("Jerkstore purchase analytics unavailable; payment remains fulfilled."); }
    });
  } catch { /* Analytics is optional, including unsupported request runtimes. */ }
}
