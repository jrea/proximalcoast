import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export type CheckoutSessionParams = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  siteSlug: string;
  priceId: string;
  returnUrl: string;
  metadata?: Record<string, string>;
};

export async function createCheckoutSession({
  user: sessionUser,
  siteSlug,
  priceId,
  returnUrl,
  metadata = {},
}: CheckoutSessionParams) {
  // 1. Fetch full user to check for existing Stripe Customer ID
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { stripeCustomerId: true, name: true, email: true },
  });

  const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    ui_mode: "embedded",
    metadata: {
      userId: sessionUser.id,
      siteSlug: siteSlug,
      ...metadata,
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    return_url: returnUrl,
  };

  // 2. Use existing customer or create new one with details
  if (user?.stripeCustomerId) {
    checkoutOptions.customer = user.stripeCustomerId;
  } else {
    // Check if a customer with this email already exists in Stripe
    const email = user?.email || sessionUser.email;

    if (email) {
      let customerIdToUse = null;

      // Search for existing customers by email
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 5, // Check a few recent ones
      });

      // 1. Prefer exact match on metadata.userId
      const exactMatch = existingCustomers.data.find(
        (c) => c.metadata?.userId === sessionUser.id
      );

      if (exactMatch) {
        customerIdToUse = exactMatch.id;
      } else {
        // 2. Fallback to claiming an "orphaned" customer
        const orphan = existingCustomers.data.find(
          (c) => !c.metadata?.userId
        );
        if (orphan) {
          customerIdToUse = orphan.id;
          // Update the orphan with our metadata so it's claimed by this user
          await stripe.customers.update(orphan.id, {
            metadata: {
              userId: sessionUser.id,
              siteSlug: siteSlug,
            },
          });
        }
      }

      if (customerIdToUse) {
        checkoutOptions.customer = customerIdToUse;

        // Update local user record
        await prisma.user.update({
          where: { id: sessionUser.id },
          data: { stripeCustomerId: customerIdToUse },
        });
      } else {
        // 3. Create a new customer
        const newCustomer = await stripe.customers.create({
          email: email,
          name: user?.name ?? undefined,
          metadata: {
            userId: sessionUser.id,
            siteSlug: siteSlug,
          },
        });

        checkoutOptions.customer = newCustomer.id;

        // Update local user record
        await prisma.user.update({
          where: { id: sessionUser.id },
          data: { stripeCustomerId: newCustomer.id },
        });
      }
    }
  }

  // 3. Check for existing active subscriptions
  if (checkoutOptions.customer) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: checkoutOptions.customer as string,
        status: "all", // We need to see 'active' and 'trialing', potentially 'past_due'
        limit: 5,
      });

      const activeSub = subscriptions.data.find(
        (sub) =>
          (sub.status === "active" || sub.status === "trialing") &&
          sub.metadata?.siteSlug === siteSlug // valid if we stored siteSlug, otherwise check items
      ) || subscriptions.data.find(
        // Fallback: check if the price matches, assuming one sub per site per user concept
        (sub) => (sub.status === "active" || sub.status === "trialing") && sub.items.data.some(item => item.price.id === priceId)
      );

      if (activeSub) {
        // Check if it matches the requested price
        const hasMatchingPrice = activeSub.items.data.some(
          (item) => item.price.id === priceId
        );

        if (hasMatchingPrice) {
          // Scenario: User cancelled but is still in active period, and wants to "re-add" (reactivate)
          if (activeSub.cancel_at_period_end) {
            await stripe.subscriptions.update(activeSub.id, {
              cancel_at_period_end: false,
            });
            return { type: "restored", subscription: activeSub };
          } else {
            // Already active and running.
            return { type: "active", subscription: activeSub };
          }
        }
      }
    } catch (error: any) {
      // If the customer doesn't exist, we should clear it and proceed as a new user
      if (error.code === 'resource_missing' && error.param === 'customer') {
        console.warn(`[Checkout] Customer ${checkoutOptions.customer} not found in Stripe during sub check. Cleaning up.`);

        await prisma.user.update({
          where: { id: sessionUser.id },
          data: { stripeCustomerId: null },
        });

        // Remove customer from options so we create a new one later
        delete checkoutOptions.customer;
        // Ensure email is set for new customer creation (though it should already be handled by create logic if customer is missing)
        checkoutOptions.customer_email = sessionUser.email;
      } else {
        throw error;
      }
    }
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create(checkoutOptions);
  } catch (error) {
    const stripeError = error as any;
    // Handle "No such customer" error by clearing the invalid ID and retrying
    if (
      stripeError.code === "resource_missing" &&
      stripeError.param === "customer"
    ) {
      console.warn(
        `Stripe customer ${user?.stripeCustomerId} missing for user ${sessionUser.id}. Clearing and retrying...`
      );

      // Clear invalid ID from DB
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { stripeCustomerId: null },
      });

      // Update options to create new customer instead
      delete checkoutOptions.customer;
      checkoutOptions.customer_email = sessionUser.email;

      // Retry creation
      session = await stripe.checkout.sessions.create(checkoutOptions);
    } else {
      throw error;
    }
  }

  return session;
}

