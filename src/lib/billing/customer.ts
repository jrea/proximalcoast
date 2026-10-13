import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * Resolve the Stripe customer ID for a user, healing the stored ID when it
 * no longer points at a live customer.
 *
 * A stored ID can go stale — most notably when it was created while the
 * Stripe account ran in the opposite mode (test vs live): retrieve then
 * throws resource_missing and every billing call for that user fails. When
 * the stored customer is missing or deleted, create a fresh customer and
 * persist its ID so subsequent calls take the fast path. Any other Stripe
 * error is real (auth, network, rate limit) and propagates unchanged.
 */
export async function resolveStripeCustomerId(user: {
  id: string;
  email: string | null;
  name: string | null;
  stripeCustomerId: string | null;
}): Promise<string> {
  if (user.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!("deleted" in customer && customer.deleted)) {
        return user.stripeCustomerId;
      }
      // Deleted customer — fall through and create a replacement.
    } catch (error) {
      if ((error as { code?: string }).code !== "resource_missing") {
        throw error;
      }
      // Stored ID does not exist in this Stripe account — fall through
      // and create a replacement.
    }
  }

  const customer = await stripe.customers.create(
    {
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: { userId: user.id },
    },
    { idempotencyKey: `jerkstore-customer:${user.id}` }
  );
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
