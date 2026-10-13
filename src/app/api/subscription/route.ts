import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function GET(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteSlug = searchParams.get("siteSlug") || "jerkstore";

  try {
    let subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: sessionUser.user.id,
          siteSlug,
        },
      },
      // Never serialize the whole user row: it carries phone,
      // stripeCustomerId, preferences and credits, and this route is
      // reachable from every subsite via the cross-subdomain session.
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      }
    });

    // SYNC WITH STRIPE
    if (subscription?.stripeSubscriptionId && subscription.status !== 'canceled') {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

        // Map Stripe status to our status
        // We use the same status strings mostly.
        const stripeStatus = stripeSub.status;
        const cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
        // Stripe exposes the period end on the subscription item. Keep the
        // top-level fallback for older API responses and lightweight fixtures.
        const legacyStripeSub = stripeSub as Stripe.Subscription & { current_period_end?: number };
        const currentPeriodEndUnix = stripeSub.items?.data?.[0]?.current_period_end
          ?? legacyStripeSub.current_period_end;
        const currentPeriodEnd = currentPeriodEndUnix
          ? new Date(currentPeriodEndUnix * 1000)
          : new Date(Date.now() + 86400000); // Default to +1 day if missing

        // Check for mismatch
        if (
          subscription.status !== stripeStatus ||
          subscription.cancelAtPeriodEnd !== cancelAtPeriodEnd ||
          subscription.expiresAt.getTime() !== currentPeriodEnd.getTime()
        ) {
          console.log(`[Subscription Sync] Updating subscription for user ${sessionUser.user.id}: Status ${subscription.status}->${stripeStatus}, Cancel ${subscription.cancelAtPeriodEnd}->${cancelAtPeriodEnd}`);

          subscription = await prisma.user_subscription.update({
            where: { id: subscription.id },
            data: {
              status: stripeStatus,
              cancelAtPeriodEnd: cancelAtPeriodEnd,
              expiresAt: currentPeriodEnd,
              // We might want to update the plan too if it changed externally, but that's harder to map back without metadata or price lookups
            },
            include: {
              user: { select: { id: true, name: true, email: true, image: true } }
            }
          });
        }
      } catch (stripeError) {
        console.error("Failed to sync with Stripe:", stripeError);
        // If 404, maybe we should mark as switched to free/canceled? 
        // For now, just log and return what we have.
      }
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Subscription Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
