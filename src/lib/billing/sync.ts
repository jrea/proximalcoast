import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * Syncs a user's subscription from Stripe to our database if they are out of sync.
 * This is useful for recovering from failed webhooks or manual Stripe modifications.
 */
export async function syncUserSubscription(userId: string, siteSlug: string) {
  try {
    // 1. Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true },
    });

    if (!user) return null;

    let customerId = user.stripeCustomerId;

    // 2. If no customer ID locally, try to find one on Stripe by email
    if (!customerId && user.email) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        // Save it for next time
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    if (!customerId) return null;

    // 3. List all subscriptions for this customer to find the one for this site
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 20,
      expand: ['data.items.data.price'],
    });

    const allSubs = subscriptions.data;

    // 4. Find the best match for this site
    // Priority: 1. Matches siteSlug in metadata, 2. Matches a Price ID associated with BKD
    const bkdPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BKD;

    // Find all potential matches
    const potentialMatches = allSubs.filter(s =>
      s.metadata.siteSlug === siteSlug || s.items.data.some(item => item.price.id === bkdPriceId)
    );

    // Prioritize by status
    const matchedSub = potentialMatches.find(s => s.status === "active" || s.status === "trialing")
      || potentialMatches.find(s => s.status === "incomplete" || s.status === "past_due" || s.status === "unpaid")
      || potentialMatches[0];

    if (!matchedSub) {
      // If no active/trialing sub found in Stripe, but we have one locally, mark it as canceled
      // This ensures Stripe is the source of truth if we missed a deletion webhook
      const localSub = await prisma.user_subscription.findUnique({
        where: { userId_siteSlug: { userId, siteSlug } }
      });

      if (localSub && localSub.status !== "canceled") {
        console.log(`[Sync] No active sub in Stripe for ${siteSlug}, marking local sub ${localSub.id} as canceled`);
        return await prisma.user_subscription.update({
          where: { id: localSub.id },
          data: { status: "canceled" }
        });
      }
      return null;
    }

    // 5. Update the database
    const expiresAt = (matchedSub as any).current_period_end
      ? new Date((matchedSub as any).current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const price = matchedSub.items.data[0].price;

    console.log(`[Sync] Found sub in Stripe for ${siteSlug}: ${matchedSub.id} (${matchedSub.status}), price: ${price.unit_amount}${price.currency}`);

    const updated = await prisma.user_subscription.upsert({
      where: { userId_siteSlug: { userId, siteSlug } }, // Use composite key for stability
      update: {
        stripeSubscriptionId: matchedSub.id,
        status: matchedSub.status,
        expiresAt,
        cancelAtPeriodEnd: matchedSub.cancel_at_period_end,
        priceAmount: price.unit_amount,
        priceCurrency: price.currency,
      },
      create: {
        userId: userId,
        siteSlug: siteSlug,
        stripeSubscriptionId: matchedSub.id,
        status: matchedSub.status,
        plan: "standard",
        expiresAt,
        cancelAtPeriodEnd: matchedSub.cancel_at_period_end,
        priceAmount: price.unit_amount,
        priceCurrency: price.currency,
      },
    });

    return updated;
  } catch (error) {
    console.error(`[Sync] Failed to sync subscription for user ${userId}:`, error);
    return null;
  }
}
