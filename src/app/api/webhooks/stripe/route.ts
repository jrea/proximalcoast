import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

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

  switch (event.type) {
    case "checkout.session.completed":
      // Initial subscription setup
      if (session.mode === "subscription") {
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const userId = session.metadata?.userId;
        const siteSlug = session.metadata?.siteSlug || "jerkstore";

        if (userId) {
          await prisma.user_subscription.upsert({
            where: { stripeSubscriptionId: subscriptionId },
            update: {
              status: subscription.status,
              expiresAt: new Date((subscription as any).current_period_end * 1000),
            },
            create: {
              userId: userId,
              siteSlug: siteSlug,
              stripeSubscriptionId: subscriptionId,
              status: subscription.status,
              expiresAt: new Date((subscription as any).current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: session.customer as string },
          });
        }
      }
      break;

    case "invoice.payment_succeeded":
      // Renewed subscription
      if (session.subscription) {
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await prisma.user_subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: (subscription as any).status,
            expiresAt: new Date((subscription as any).current_period_end * 1000),
          },
        });
      }
      break;

    case "customer.subscription.deleted":
      const subscriptionId = session.id as string;
      await prisma.user_subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: "canceled",
          // We can keep the expiresAt if they still have access until end of period
        },
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
