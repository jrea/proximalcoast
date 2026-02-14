import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const getPlanFromPriceId = (priceId: string) => {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE) return "savage";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE) return "elite";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE) return "trial";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BKD) return "standard";
  return "standard";
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
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = event.data.object as any;
  console.log(`🔔 Webhook received! Type: ${event.type}, Mode: ${session.mode}`);

  switch (event.type) {
    case "checkout.session.completed":
      // Initial subscription setup
      if (session.mode === "subscription") {
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlanFromPriceId(priceId);

        const userId = session.metadata?.userId || subscription.metadata?.userId;
        const siteSlug = session.metadata?.siteSlug || subscription.metadata?.siteSlug || "jerkstore";

        if (userId) {
          const expiresAt = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000)
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

          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: session.customer as string },
          });

          // Also update the customer in Stripe so the dashboard looks good
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true }
          });
          if (user) {
            await stripe.customers.update(session.customer as string, {
              name: user.name,
              email: user.email || undefined,
              metadata: { userId },
            });
          }
        }
      }
      break;

    case "invoice.payment_succeeded":
      if (session.subscription) {
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlanFromPriceId(priceId);

        const userId = subscription.metadata?.userId || (session as any).metadata?.userId;
        const siteSlug = subscription.metadata?.siteSlug || (session as any).metadata?.siteSlug || "jerkstore";

        if (userId) {
          const expiresAt = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

    case "customer.subscription.deleted":
      await prisma.user_subscription.updateMany({
        where: { stripeSubscriptionId: session.id as string },
        data: {
          status: "canceled",
        },
      });
      break;

    case "customer.subscription.updated":
      const updatedId = session.id as string;
      const subUpdated = session as any;

      const userId = subUpdated.metadata?.userId;
      const siteSlug = subUpdated.metadata?.siteSlug || "jerkstore";
      const updatedPriceId = subUpdated.items?.data[0]?.price?.id;
      const updatedPlan = updatedPriceId ? getPlanFromPriceId(updatedPriceId) : undefined;

      const expiresAt = subUpdated.current_period_end
        ? new Date(subUpdated.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Fetch existing DB record to check for upcomingPlan match
      const existingSub = await prisma.user_subscription.findUnique({
        where: { stripeSubscriptionId: updatedId },
        select: { upcomingPlan: true, plan: true }
      });

      const price = subUpdated.items?.data[0]?.price;

      const updateData: any = {
        status: subUpdated.status,
        cancelAtPeriodEnd: subUpdated.cancel_at_period_end,
        expiresAt,
      };

      if (price) {
        updateData.priceAmount = price.unit_amount;
        updateData.priceCurrency = price.currency;
      }

      if (updatedPlan) {
        updateData.plan = updatedPlan;

        // If the new plan matches the upcoming plan, the switch has happened.
        // Or if the plan matches what we already have, maybe we shouldn't clear?
        // Actually, if existingSub.upcomingPlan === updatedPlan, we are done.
        if (existingSub?.upcomingPlan === updatedPlan) {
          updateData.upcomingPlan = null;
        }
      }

      const createData: any = {
        userId: userId || "", // This might be problematic if userId is missing on create, but standard flow avoids this
        siteSlug,
        stripeSubscriptionId: updatedId,
        status: subUpdated.status,
        plan: updatedPlan || "standard",
        cancelAtPeriodEnd: subUpdated.cancel_at_period_end,
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
            data: updateData,
          });
        } else {
          // Otherwise, traditional upsert by stripe ID
          await prisma.user_subscription.upsert({
            where: { stripeSubscriptionId: updatedId },
            update: updateData,
            create: createData,
          });
        }
      } else {
        // Fallback if userId is missing from metadata (rare, but possible)
        // We only update if we can find it by ID
        await prisma.user_subscription.updateMany({
          where: { stripeSubscriptionId: updatedId },
          data: updateData,
        });
      }
      break;

    case "customer.created":
    case "customer.updated":
      const customer = session as any;
      const customerUserId = customer.metadata?.userId;
      if (customerUserId) {
        await prisma.user.update({
          where: { id: customerUserId },
          data: { stripeCustomerId: customer.id },
        });
      }
      break;

    case "subscription_schedule.updated":
    case "subscription_schedule.created":
    case "subscription_schedule.released":
    case "invoiceitem.created":
      // These are expected during normal Stripe operations.
      // We rely on 'customer.subscription.updated' or 'invoice.payment_succeeded' to sync state.
      console.log(`ℹ️ Expected event ${event.type} received`);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
