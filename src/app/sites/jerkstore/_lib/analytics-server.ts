import "server-only";
import { after } from "next/server";
import { PostHog } from "posthog-node";
import { v5 as uuidv5 } from "uuid";
import type Stripe from "stripe";
import { CREDIT_PACKAGES_MAP } from "../constants";

export function capturePurchaseConversion(intent: Stripe.PaymentIntent, paidAt: number) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID;
  const gaApiSecret = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET;
  const hasPostHog = Boolean(posthogKey);
  const hasGa4 = Boolean(gaMeasurementId && gaApiSecret);

  if ((!hasPostHog && !hasGa4) || !intent.livemode || intent.status !== "succeeded" || intent.metadata.siteSlug !== "jerkstore" || intent.metadata.type !== "credits_purchase") return;
  const userId = intent.metadata.userId;
  if (!userId || !Number.isSafeInteger(intent.amount_received) || intent.amount_received < 1 || !Number.isFinite(paidAt)) return;

  const value = intent.amount_received / 100;
  const currency = intent.currency.toUpperCase();
  const packageId = intent.metadata.packageId;
  const pack = packageId && Object.hasOwn(CREDIT_PACKAGES_MAP, packageId)
    ? CREDIT_PACKAGES_MAP[packageId as keyof typeof CREDIT_PACKAGES_MAP]
    : undefined;

  try {
    after(async () => {
      if (hasPostHog && posthogKey) {
        const client = new PostHog(posthogKey, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com", flushAt: 1, flushInterval: 0, requestTimeout: 3000, fetchRetryCount: 1 });
        try {
          client.capture({
            distinctId: userId,
            event: "credit_purchase_completed",
            uuid: uuidv5(`jerkstore-purchase:${intent.id}`, uuidv5.URL),
            timestamp: new Date(paidAt * 1000),
            disableGeoip: true,
            properties: { site: "jerkstore", currency, $revenue: value, value, credits: Number(intent.metadata.creditsAmount), packageId, source: "stripe_webhook" },
          });
          await client.shutdown();
        } catch {
          console.error("Jerkstore purchase analytics unavailable; payment remains fulfilled.");
        }
      }

      if (hasGa4 && gaMeasurementId && gaApiSecret) {
        try {
          const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(gaMeasurementId)}&api_secret=${encodeURIComponent(gaApiSecret)}`;
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: uuidv5(`ga4-client:${userId}`, uuidv5.URL),
              user_id: userId,
              timestamp_micros: Math.trunc(paidAt * 1_000_000),
              events: [
                {
                  name: "purchase",
                  params: {
                    transaction_id: intent.id,
                    value,
                    currency,
                    site: "jerkstore",
                    items: [
                      {
                        item_id: pack?.id ?? packageId ?? "credits",
                        item_name: pack?.name ?? "Jerkstore credits",
                        price: value,
                        quantity: 1,
                      },
                    ],
                  },
                },
              ],
            }),
            signal: AbortSignal.timeout(3000),
          });
        } catch {
          console.error("Jerkstore GA4 purchase analytics unavailable; payment remains fulfilled.");
        }
      }
    });
  } catch { /* Analytics is optional, including unsupported request runtimes. */ }
}
