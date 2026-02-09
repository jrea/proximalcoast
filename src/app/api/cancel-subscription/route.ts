import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { siteSlug = "jerkstore" } = await req.json();

    const subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: sessionUser.user.id,
          siteSlug,
        },
      },
      select: { stripeSubscriptionId: true },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found for this site" },
        { status: 400 }
      );
    }

    // Request cancellation at end of period
    const stripeSub = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    if (!stripeSub.cancel_at_period_end) {
      throw new Error("Stripe failed to set cancel_at_period_end");
    }

    // Update our DB immediately so the next fetch shows the new state
    const dbUpdate = await prisma.user_subscription.update({
      where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
      data: { cancelAtPeriodEnd: true },
    });

    if (!dbUpdate || !dbUpdate.cancelAtPeriodEnd) {
      throw new Error("Local database failed to update subscription status");
    }

    return NextResponse.json({
      success: true,
      message: "Subscription successfully marked for cancellation",
      status: dbUpdate.status
    });
  } catch (error) {
    console.error("Stripe Cancellation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
