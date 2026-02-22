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
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const piUserId = paymentIntent.metadata?.userId;
      const piPhone = (paymentIntent as any).shipping?.phone || (paymentIntent as any).billing_details?.phone;

      if (piPhone && piUserId) {
        await (prisma.user as any).update({
          where: { id: piUserId },
          data: { phone: piPhone }
        });
        console.log(`[User] Updated phone for user ${piUserId}: ${piPhone}`);
      }

      if (paymentIntent.metadata?.type === "credits_purchase" && paymentIntent.metadata?.source !== "immediate") {
        if (piUserId) {
          const creditsToAdd = paymentIntent.metadata.creditsAmount ? parseInt(paymentIntent.metadata.creditsAmount) : 50;
          await prisma.user.update({
            where: { id: piUserId },
            data: {
              credits: {
                increment: creditsToAdd
              }
            }
          });
          console.log(`[Credits] Added ${creditsToAdd} credits to user ${piUserId} via PaymentIntent webhook`);
        }
      }
      break;


    case "checkout.session.completed":
      // Initial subscription setup
      if (session.mode === "payment" && session.payment_status === "paid") {
        // One-time payment (Credits)
        const userId = session.metadata?.userId;
        if (userId) {
          // Verify it's the credits pack (optional but good practice)
          // For now, we assume any one-time payment is for credits
          // Or check line_items if needed.

          await prisma.user.update({
            where: { id: userId },
            data: {
              credits: {
                increment: 50
              }
            }
          });
          console.log(`[Credits] Added 50 credits to user ${userId}`);
        }
      } else if (session.mode === "subscription") {
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

          await (prisma.user as any).update({
            where: { id: userId },
            data: {
              stripeCustomerId: session.customer as string,
              phone: session.customer_details?.phone || undefined
            },
          });

          // Also update the customer in Stripe so the dashboard looks good
          const userLookup = await (prisma.user as any).findUnique({
            where: { id: userId },
            select: { name: true, email: true, phone: true }
          });
          if (userLookup) {
            await stripe.customers.update(session.customer as string, {
              name: userLookup.name,
              email: userLookup.email || undefined,
              phone: (userLookup as any).phone || undefined,
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

          // Capture phone from invoice if present
          const invoicePhone = (session as any).customer_phone || (session as any).customer_details?.phone;
          if (invoicePhone) {
            await (prisma.user as any).update({
              where: { id: userId },
              data: { phone: invoicePhone }
            });
            console.log(`[User] Updated phone from invoice for user ${userId}: ${invoicePhone}`);
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

    case "customer.subscription.deleted":
      // The session object for subscription events is the subscription itself
      await prisma.user_subscription.updateMany({
        where: { stripeSubscriptionId: session.id as string },
        data: {
          status: "canceled",
        },
      });
      console.log(`[Subscription] Marked subscription ${session.id} as canceled`);
      break;

    case "customer.subscription.created":
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

      const createData: any = {
        userId: userId || "",
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

  return NextResponse.json({ received: true });
}
