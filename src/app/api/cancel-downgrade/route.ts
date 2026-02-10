import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { siteSlug = "jerkstore" } = await req.json().catch(() => ({}));

  try {
    const subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: session.user.id,
          siteSlug,
        },
      },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    if (stripeSub.schedule) {
      // Release the schedule: This keeps the current subscription active as-is, 
      // but cancels the future phases (the downgrade).
      await stripe.subscriptionSchedules.release(stripeSub.schedule as string);
    }

    // Update local DB
    await prisma.user_subscription.update({
      where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
      data: {
        upcomingPlan: null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to cancel downgrade:", error);

    // If Stripe says the subscription doesn't exist, we should sync our DB
    if (error.code === 'resource_missing' || (error.raw && error.raw.code === 'resource_missing')) {
      try {
        await prisma.user_subscription.update({
          where: {
            userId_siteSlug: {
              userId: session.user.id,
              siteSlug,
            }
          },
          data: { status: 'canceled', cancelAtPeriodEnd: true, upcomingPlan: null }
        });
      } catch (dbErr) {
        console.error("Failed to sync DB after missing Stripe subscription (cancel downgrade):", dbErr);
      }

      return NextResponse.json(
        { error: "This subscription no longer exists in Stripe. We've updated your status." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Error" },
      { status: error.statusCode || 500 }
    );
  }
}
