import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { resolvePlanChange } from "@/lib/billing/plans";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { siteSlug = "jerkstore" } = body;

  // The target plan is resolved server-side: clients may name a plan
  // (preferred) or a priceId, but a priceId is only honored when it is
  // one of the configured plan prices, and the stored plan name is always
  // derived from it — never trusted from the request. Previously any
  // Stripe price in the account (archived, $0, another product's) and any
  // plan string could be written here.
  const resolved = resolvePlanChange(body);
  if (!resolved) {
    return NextResponse.json({ error: "Unknown or unconfigured plan" }, { status: 400 });
  }
  const { priceId, plan: newPlanName } = resolved;

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

    // Get the subscription from Stripe to find the subscription item ID
    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    // We assume single item subscription for now
    const currentItem = stripeSub.items.data[0];
    const itemId = currentItem.id;
    const currentPrice = currentItem.price.unit_amount || 0;

    // Fetch new price details to compare
    const newPriceObj = await stripe.prices.retrieve(priceId);
    const newPrice = newPriceObj.unit_amount || 0;

    const isUpgrade = newPrice > currentPrice;

    if (isUpgrade) {
      // UPGRADE: Immediate change, charge difference
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: itemId,
          price: priceId,
        }],
        proration_behavior: 'always_invoice',
        payment_behavior: 'error_if_incomplete',
      });

      // Update local DB plan immediately
      await prisma.user_subscription.update({
        where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
        data: {
          plan: newPlanName,
          upcomingPlan: null, // Clear any pending downgrade
          cancelAtPeriodEnd: false
        }
      });
    } else {
      // DOWNGRADE: Schedule for end of period

      const scheduleId = typeof stripeSub.schedule === 'string' ? stripeSub.schedule : null;
      let schedule;

      if (scheduleId) {
        schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
      } else {
        schedule = await stripe.subscriptionSchedules.create({
          from_subscription: subscription.stripeSubscriptionId,
        });
      }

      // Use Stripe's official period end for precise alignment
      const periodEnd = stripeSub.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      console.log(`Scheduling downgrade to ${newPlanName} (${priceId}) at ${new Date(periodEnd * 1000)}`);

      // Debug logging
      console.log('Current Schedule:', JSON.stringify(schedule, null, 2));

      // We need to preserve the start date of the current phase
      const currentPhase = schedule.phases[0];
      const phaseStart = currentPhase.start_date;
      const phaseEnd = currentPhase.end_date || periodEnd; // Use existing end or periodEnd

      console.log(`Phase 0: ${phaseStart} -> ${phaseEnd}`);
      console.log(`Phase 1: Starts at ${phaseEnd}`);

      try {
        // Update the schedule with the new phases
        await stripe.subscriptionSchedules.update(schedule.id, {
          end_behavior: 'release', // Release to the new plan after the phases complete
          phases: [
            {
              start_date: phaseStart,
              end_date: phaseEnd,
              items: currentPhase.items.map((item) => ({
                price: typeof item.price === 'string' ? item.price : item.price.id,
                quantity: item.quantity
              })),
            },
            {
              start_date: phaseEnd,
              items: [{ price: priceId, quantity: 1 }],
            },
          ],
        });
      } catch (err: unknown) {
        console.error("Error updating schedule phases:", err);
        throw err;
      }

      // Update local DB to reflect PENDING change
      await prisma.user_subscription.update({
        where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
        data: {
          upcomingPlan: newPlanName,
          cancelAtPeriodEnd: false
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to update subscription:", error);

    const stripeError = error as {
      code?: unknown;
      raw?: { code?: unknown };
      statusCode?: unknown;
    };

    // If Stripe says the subscription doesn't exist, we should sync our DB
    if (stripeError.code === 'resource_missing' || stripeError.raw?.code === 'resource_missing') {
      try {
        await prisma.user_subscription.update({
          where: {
            userId_siteSlug: {
              userId: session.user.id,
              siteSlug,
            }
          },
          data: { status: 'canceled', cancelAtPeriodEnd: true }
        });
      } catch (dbErr) {
        console.error("Failed to sync DB after missing Stripe subscription (update):", dbErr);
      }

      return NextResponse.json(
        { error: "This subscription no longer exists in Stripe. We've updated your status." },
        { status: 404 }
      );
    }

    // Never reflect raw Stripe error text or Stripe's HTTP status to the
    // client: details stay in the server log above, and statuses come from
    // a fixed map.
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: stripeError.statusCode === 404 ? 404 : 500 }
    );
  }
}
