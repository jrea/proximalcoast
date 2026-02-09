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

  const { siteSlug } = await req.json();

  try {
    const subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: session.user.id,
          siteSlug: siteSlug || "jerkstore",
        },
      },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return new NextResponse("No active subscription found", { status: 404 });
    }

    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    if (stripeSub.schedule) {
      // Release the schedule: This keeps the current subscription active as-is, 
      // but cancels the future phases (the downgrade).
      // Note: "release" creates a loose subscription. If we want to ensure it renews indefinitely,
      // releasing is correct because the underlying sub defaults to renew unless cancel_at_period_end is set.
      // But wait, the schedule might have modified the sub.
      // Actually, releasing preserves the *current* phase settings on the subscription.
      // So if we are in Savage, and schedule says "Savage -> Elite", releasing it leaves us in Savage.

      await stripe.subscriptionSchedules.release(stripeSub.schedule as string);

      // We should also ensure the subscription itself isn't set to cancel if the schedule was doing something weird,
      // but usually releasing is enough to "keep current plan".
    }

    // Update local DB
    await prisma.user_subscription.update({
      where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
      data: {
        upcomingPlan: null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel downgrade:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
