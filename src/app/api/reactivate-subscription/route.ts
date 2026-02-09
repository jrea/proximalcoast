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

    // Set cancel_at_period_end to false to reactivate
    const stripeSub = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    if (stripeSub.cancel_at_period_end) {
      throw new Error("Stripe failed to reactivate subscription");
    }

    // Update our DB immediately
    const dbUpdate = await prisma.user_subscription.update({
      where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
      data: { cancelAtPeriodEnd: false },
    });

    if (!dbUpdate || dbUpdate.cancelAtPeriodEnd) {
      throw new Error("Local database failed to update subscription status");
    }

    return NextResponse.json({
      success: true,
      message: "Subscription reactivated successfully",
      status: dbUpdate.status
    });
  } catch (error) {
    console.error("Stripe Reactivation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
