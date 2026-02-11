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

    // 3. List active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active", // Also handle trialing maybe?
      limit: 10,
      expand: ['data.items.data.price'],
    });

    // We'll also check "trialing" subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 10,
    });

    const allSubs = [...subscriptions.data, ...trialingSubscriptions.data];

    // 4. Find the best match for this site
    // Priority: 1. Matches siteSlug in metadata, 2. Matches a Price ID associated with BKD
    const bkdPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BKD;

    const matchedSub = allSubs.find(s => s.metadata.siteSlug === siteSlug)
      || allSubs.find(s => s.items.data.some(item => item.price.id === bkdPriceId));

    if (!matchedSub) return null;

    // 5. Update the database
    const expiresAt = (matchedSub as any).current_period_end
      ? new Date((matchedSub as any).current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const price = matchedSub.items.data[0].price;

    const updated = await prisma.user_subscription.upsert({
      where: { stripeSubscriptionId: matchedSub.id },
      update: {
        userId: userId,
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
        plan: "standard", // Default to standard for BKD
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
