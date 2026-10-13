import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { CREDIT_FULFILLMENT_VERSION, grantPurchasedCredits } from "@/app/sites/jerkstore/_lib/credit-purchases";
import { capturePurchaseConversion } from "@/app/sites/jerkstore/_lib/analytics-server";
import { getPlanFromPriceId } from "@/lib/billing/plans";

/**
 * Plan resolution never silently defaults. An unknown price ID is logged
 * as an error (it means a price is being sold that the server has no plan
 * mapping for) and only then falls back so a required column can be
 * written; subscription.updated writes no plan at all for unknown prices.
 */
/**
 * grantPurchasedCredits throws exactly one permanent error — a malformed
 * receipt ("Invalid credit purchase receipt", thrown before any DB work).
 * That one is safe to swallow: no retry will ever fix it. EVERY other error
 * (DB down, transaction failure, P2025 for a deleted user, ...) must
 * propagate to the route's outer handler, which acks permanent Prisma codes
 * and returns 500 for transient failures so Stripe retries. Swallowing a
 * transient failure here would return 200 and permanently lose a paid
 * customer's credits.
 */
const isInvalidReceiptError = (error: unknown): boolean =>
  error instanceof Error && error.message === "Invalid credit purchase receipt";

const planForPriceId = (priceId: string): string => {
  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error(`[Webhook] Unknown Stripe price ID ${priceId} — no plan mapping configured; recording as "standard". Configure its NEXT_PUBLIC_STRIPE_PRICE_ID_* env var.`);
    return "standard";
  }
  return plan;
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    console.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`🔔 Webhook received! Type: ${event.type}`);

  try {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const piUserId = paymentIntent.metadata?.userId;
      const piPhone = paymentIntent.shipping?.phone;

      if (piPhone && piUserId) {
        await prisma.user.update({
          where: { id: piUserId },
          data: { phone: piPhone }
        });
        // Never log the phone number itself — the user ID is enough to debug.
        console.log(`[User] Updated phone for user ${piUserId}`);
      }

      const paymentMethodId = typeof paymentIntent.payment_method === "string"
        ? paymentIntent.payment_method
        : paymentIntent.payment_method?.id;
      const customerId = typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id;

      // Saving the card as the default lets future credit purchases charge it securely off-session.
      if (paymentIntent.metadata?.type === "credits_purchase" && customerId && paymentMethodId) {
        try {
          await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });
        } catch {
          console.error("Payment method default could not be saved; continuing credit fulfillment.");
        }
      }

      // Every credit grant goes through the idempotent ledger, keyed by
      // PaymentIntent ID — including legacy purchases created before the
      // ledger existed. The previous legacy branch incremented credits
      // directly, so every Stripe redelivery of this event granted the
      // credits again. Ledger-version purchases are granted here even
      // with source "immediate" (webhook recovery if the synchronous
      // fulfillment was missed) — the ledger key makes a second grant
      // impossible. Legacy "immediate" purchases were fulfilled by a
      // direct increment in the checkout route and are skipped.
      const isLedgerPurchase = paymentIntent.metadata?.fulfillmentVersion === CREDIT_FULFILLMENT_VERSION;
      if (paymentIntent.metadata?.type === "credits_purchase" && piUserId && (isLedgerPurchase || paymentIntent.metadata?.source !== "immediate")) {
        const creditsAmount = Number(paymentIntent.metadata.creditsAmount ?? 50);
        try {
          const granted = await grantPurchasedCredits(paymentIntent.id, piUserId, creditsAmount);
          if (granted) {
            console.log(`[Credits] Added ${creditsAmount} credits to user ${piUserId} via PaymentIntent webhook`);
          } else {
            console.log(`[Credits] Duplicate fulfillment skipped for PaymentIntent ${paymentIntent.id}`);
          }
        } catch (grantError) {
          // Only the malformed-receipt validation error is permanent —
          // log it and acknowledge. Anything else is rethrown so the
          // outer handler can ack/500 appropriately and Stripe retries
          // transient failures instead of the credits being lost.
          if (!isInvalidReceiptError(grantError)) throw grantError;
          console.error(`[Credits] Invalid credit purchase receipt on ${paymentIntent.id}:`, grantError);
        }
        if (isLedgerPurchase) {
          capturePurchaseConversion(paymentIntent, event.created);
        }
      }
      break;
    }


    case "checkout.session.completed": {
      // Initial subscription setup
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment" && session.payment_status === "paid") {
        // One-time payment. Credits are granted ONLY when the session is
        // verifiably a credit purchase (metadata type set by our own
        // checkout routes) and always through the idempotent ledger keyed
        // by the PaymentIntent — the previous code granted a flat 50
        // credits for ANY paid payment-mode session, on every redelivery.
        const userId = session.metadata?.userId;
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
        if (userId && paymentIntentId && session.metadata?.type === "credits_purchase") {
          const creditsAmount = Number(session.metadata.creditsAmount ?? 50);
          try {
            const granted = await grantPurchasedCredits(paymentIntentId, userId, creditsAmount);
            console.log(granted
              ? `[Credits] Added ${creditsAmount} credits to user ${userId}`
              : `[Credits] Duplicate fulfillment skipped for PaymentIntent ${paymentIntentId}`);
          } catch (grantError) {
            // Same rule as the PaymentIntent branch: swallow only the
            // permanent malformed-receipt error; rethrow everything else
            // for the outer handler so Stripe retries transient failures.
            if (!isInvalidReceiptError(grantError)) throw grantError;
            console.error(`[Credits] Invalid credit purchase receipt on ${paymentIntentId}:`, grantError);
          }
        } else if (userId) {
          console.log(`[Webhook] Ignoring paid payment-mode checkout session ${session.id}: not a verified credit purchase`);
        }
      } else if (session.mode === "subscription") {
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
        if (!subscriptionId) break;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan = planForPriceId(priceId);

        const userId = session.metadata?.userId || subscription.metadata?.userId;
        const siteSlug = session.metadata?.siteSlug || subscription.metadata?.siteSlug || "jerkstore";

        if (userId) {
          const periodEnd = subscription.items.data[0]?.current_period_end;
          const expiresAt = periodEnd
            ? new Date(periodEnd * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

          const existingByComposite = await prisma.user_subscription.findUnique({
            where: {
              userId_siteSlug: {
                userId,
                siteSlug,
              },
            },
          });

          const price = subscription.items.data[0].price;

          if (existingByComposite) {
            // Update the existing record for this user/site with the NEW subscription ID
            await prisma.user_subscription.update({
              where: {
                userId_siteSlug: {
                  userId,
                  siteSlug,
                },
              },
              data: {
                stripeSubscriptionId: subscriptionId, // IMPORTANT: Update to the new ID
                status: subscription.status,
                plan: plan,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                expiresAt,
                priceAmount: price.unit_amount,
                priceCurrency: price.currency,
              },
            });
          } else {
            await prisma.user_subscription.upsert({
              where: { stripeSubscriptionId: subscriptionId },
              update: {
                status: subscription.status,
                plan: plan,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                expiresAt,
                priceAmount: price.unit_amount,
                priceCurrency: price.currency,
              },
              create: {
                userId: userId,
                siteSlug: siteSlug,
                stripeSubscriptionId: subscriptionId,
                status: subscription.status,
                plan: plan,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                expiresAt,
                priceAmount: price.unit_amount,
                priceCurrency: price.currency,
              },
            });
          }

          const stripeCustomerId = typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId,
              phone: session.customer_details?.phone || undefined
            },
          });

          // Also update the customer in Stripe so the dashboard looks good
          const userLookup = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true, phone: true }
          });
          if (userLookup && stripeCustomerId) {
            await stripe.customers.update(stripeCustomerId, {
              name: userLookup.name,
              email: userLookup.email || undefined,
              phone: userLookup.phone || undefined,
              metadata: { userId },
            });
          }
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const legacyInvoice = invoice as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription;
      };
      const invoiceSubscription = invoice.parent?.subscription_details?.subscription
        ?? legacyInvoice.subscription;
      if (invoiceSubscription) {
        const subscriptionId = typeof invoiceSubscription === "string"
          ? invoiceSubscription
          : invoiceSubscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan = planForPriceId(priceId);

        const userId = subscription.metadata?.userId || invoice.metadata?.userId;
        const siteSlug = subscription.metadata?.siteSlug || invoice.metadata?.siteSlug || "jerkstore";

        if (userId) {
          const periodEnd = subscription.items.data[0]?.current_period_end;
          const expiresAt = periodEnd
            ? new Date(periodEnd * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          // Capture phone from invoice if present
          const invoicePhone = invoice.customer_phone;
          if (invoicePhone) {
            await prisma.user.update({
              where: { id: userId },
              data: { phone: invoicePhone }
            });
            console.log(`[User] Updated phone from invoice for user ${userId}`);
          }

          const price = subscription.items.data[0].price;

          await prisma.user_subscription.upsert({
            where: { stripeSubscriptionId: subscriptionId },
            update: {
              status: subscription.status,
              plan: plan,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              expiresAt,
              priceAmount: price.unit_amount,
              priceCurrency: price.currency,
            },
            create: {
              userId,
              siteSlug,
              stripeSubscriptionId: subscriptionId,
              status: subscription.status,
              plan: plan,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              expiresAt,
              priceAmount: price.unit_amount,
              priceCurrency: price.currency,
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      // The session object for subscription events is the subscription itself
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user_subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: "canceled",
        },
      });
      console.log(`[Subscription] Marked subscription ${subscription.id} as canceled`);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const updatedId = subscription.id;

      const userId = subscription.metadata?.userId;
      const siteSlug = subscription.metadata?.siteSlug || "jerkstore";
      const updatedPriceId = subscription.items.data[0]?.price?.id;
      // Unknown price: leave the stored plan untouched (and say so loudly)
      // instead of silently overwriting it with a default.
      const updatedPlan = updatedPriceId ? getPlanFromPriceId(updatedPriceId) : undefined;
      if (updatedPriceId && !updatedPlan) {
        console.error(`[Webhook] Unknown Stripe price ID ${updatedPriceId} on subscription ${updatedId} — stored plan left unchanged. Configure its NEXT_PUBLIC_STRIPE_PRICE_ID_* env var.`);
      }

      const periodEnd = subscription.items.data[0]?.current_period_end;
      const expiresAt = periodEnd
        ? new Date(periodEnd * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Fetch existing DB record to check for upcomingPlan match
      const existingSub = await prisma.user_subscription.findUnique({
        where: { stripeSubscriptionId: updatedId },
        select: { upcomingPlan: true, plan: true }
      });

      const price = subscription.items.data[0]?.price;

      const updateData: Prisma.user_subscriptionUncheckedUpdateInput = {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        expiresAt,
        updatedAt: new Date(), // Force update timestamp for cache busting
      };

      if (price) {
        updateData.priceAmount = price.unit_amount;
        updateData.priceCurrency = price.currency;
      }

      if (updatedPlan) {
        updateData.plan = updatedPlan;

        // If the new plan matches the upcoming plan, the switch has happened.
        if (existingSub?.upcomingPlan === updatedPlan) {
          updateData.upcomingPlan = null;
        }
      }

      const createData: Prisma.user_subscriptionUncheckedCreateInput = {
        userId: userId || "",
        siteSlug,
        stripeSubscriptionId: updatedId,
        status: subscription.status,
        plan: updatedPlan || "standard",
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        expiresAt,
        priceAmount: price?.unit_amount,
        priceCurrency: price?.currency,
      };

      if (userId) {
        // First try to find by composite key to avoid unique constraint violations
        const existingByComposite = await prisma.user_subscription.findUnique({
          where: {
            userId_siteSlug: {
              userId,
              siteSlug,
            },
          },
        });

        if (existingByComposite) {
          // If found by user+slug, update it specifically
          await prisma.user_subscription.update({
            where: {
              userId_siteSlug: {
                userId,
                siteSlug,
              },
            },
            data: {
              ...updateData,
              stripeSubscriptionId: updatedId, // Take over if different
            },
          });
          console.log(`[Subscription] Updated existing sub for user ${userId} site ${siteSlug}`);
        } else {
          // Otherwise, traditional upsert by stripe ID
          await prisma.user_subscription.upsert({
            where: { stripeSubscriptionId: updatedId },
            update: updateData,
            create: createData,
          });
          console.log(`[Subscription] Upserted sub ${updatedId} for user ${userId}`);
        }
      } else {
        // Fallback if userId is missing from metadata (rare, but possible)
        await prisma.user_subscription.updateMany({
          where: { stripeSubscriptionId: updatedId },
          data: updateData,
        });
      }
      break;
    }

    case "customer.created":
    case "customer.updated": {
      const customer = event.data.object as Stripe.Customer;
      const customerUserId = customer.metadata?.userId;
      if (customerUserId) {
        await prisma.user.update({
          where: { id: customerUserId },
          data: { stripeCustomerId: customer.id },
        });
      }
      break;
    }

    case "subscription_schedule.updated":
    case "subscription_schedule.created":
    case "subscription_schedule.released":
    case "invoiceitem.created":
    case "invoice.created":
    case "invoice.finalized":
    case "payment_intent.created":
      // These are expected during normal Stripe operations.
      // We rely on 'customer.subscription.updated' or 'invoice.payment_succeeded' to sync state.
      console.log(`ℹ️ Expected event ${event.type} received`);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  } catch (err) {
    // Permanent failures (the referenced user is gone, or the Stripe
    // customer is already linked to a different user) can never succeed on
    // retry — acknowledge them so one bad event does not become a Stripe
    // retry storm, and log loudly with the event ID for reconciliation.
    // Everything else is treated as transient: 500, Stripe retries.
    const code = (err as { code?: unknown })?.code;
    if (code === "P2025" || code === "P2002") {
      console.error(`[Webhook] Permanent failure processing event ${event.id} (${event.type}), code ${code} — acknowledging without retry:`, err);
      return NextResponse.json({ received: true });
    }
    console.error(`[Webhook] Transient failure processing event ${event.id} (${event.type}) — returning 500 for retry:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
