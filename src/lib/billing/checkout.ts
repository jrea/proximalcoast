import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export type CheckoutSessionParams = {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
  siteSlug: string;
  priceId: string;
  returnUrl: string;
  metadata?: Record<string, string>;
};

async function getOrCreateStripeCustomer({
  user: sessionUser,
  siteSlug,
}: {
  user: { id: string; email: string; name?: string | null };
  siteSlug: string;
}) {
  // 1. Check local DB first
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { stripeCustomerId: true, name: true, email: true },
  });

  if (user?.stripeCustomerId) {
    try {
      // Verify customer still exists in Stripe
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!(customer as any).deleted) {
        return user.stripeCustomerId;
      }
    } catch (e) {
      console.warn(`[Stripe] Customer ${user.stripeCustomerId} found in DB but missing in Stripe. Clearing.`);
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { stripeCustomerId: null },
      });
    }
  }

  // 2. Search Stripe by email
  const existingCustomers = await stripe.customers.list({
    email: sessionUser.email,
    limit: 5,
  });

  // 3. Try to match by metadata userId
  let customerToUse = existingCustomers.data.find(c => c.metadata?.userId === sessionUser.id);

  if (!customerToUse) {
    // 4. Fallback: Claim an "orphan" customer (same email, no userId metadata)
    const orphan = existingCustomers.data.find(c => !c.metadata?.userId);
    if (orphan) {
      customerToUse = await stripe.customers.update(orphan.id, {
        metadata: { userId: sessionUser.id, siteSlug },
        name: user?.name || orphan.name || undefined,
      });
    }
  }

  if (customerToUse) {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { stripeCustomerId: customerToUse.id },
    });
    return customerToUse.id;
  }

  // 5. Create new Customer
  const newCustomer = await stripe.customers.create({
    email: sessionUser.email,
    name: sessionUser.name ?? undefined,
    metadata: { userId: sessionUser.id, siteSlug },
  });

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { stripeCustomerId: newCustomer.id },
  });

  return newCustomer.id;
}

export async function createCheckoutSession({
  user: sessionUser,
  siteSlug,
  priceId,
  returnUrl,
  metadata = {},
}: CheckoutSessionParams) {
  if (!sessionUser) {
    throw new Error("Session required for subscription checkout");
  }

  const customerId = await getOrCreateStripeCustomer({ user: sessionUser, siteSlug });

  const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    ui_mode: "embedded",
    customer: customerId,
    metadata: {
      siteSlug,
      userId: sessionUser.id,
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

  // Add Metered Price if configured
  if (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_METERED) {
    checkoutOptions.line_items?.push({
      price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_METERED,
    });
  }

  // Check for existing active subscriptions
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 5,
  });

  const activeSub = subscriptions.data.find(
    (sub) => sub.metadata?.siteSlug === siteSlug || sub.items.data.some(item => item.price.id === priceId)
  );

  if (activeSub) {
    if (activeSub.cancel_at_period_end) {
      await stripe.subscriptions.update(activeSub.id, { cancel_at_period_end: false });
      return { type: "restored", subscription: activeSub };
    }
    return { type: "active", subscription: activeSub };
  }

  return await stripe.checkout.sessions.create(checkoutOptions);
}

export async function createSubscriptionIntent({
  user: sessionUser,
  siteSlug,
  priceId,
  metadata = {},
}: {
  user: { id: string; email: string; name?: string | null };
  siteSlug: string;
  priceId: string;
  metadata?: Record<string, string>;
}) {
  const customerId = await getOrCreateStripeCustomer({ user: sessionUser, siteSlug });

  const getSecretFromSub = async (sub: any) => {
    console.log(`[Checkout] getSecretFromSub for ${sub.id}, status: ${sub.status}`);

    // 1. Check sub object directly (should be there if expanded)
    let invoice = sub.latest_invoice;
    let pi: any = null;
    let si: any = null;

    if (invoice) {
      if (typeof invoice === "string") {
        console.log(`[Checkout] Invoice is ID string ${invoice}, fetching expanded...`);
        invoice = await stripe.invoices.retrieve(invoice, { expand: ["payment_intent"] });
      }
      pi = invoice.payment_intent;
      console.log(`[Checkout] Found PI on sub.latest_invoice: ${typeof pi === 'string' ? pi : pi?.id || 'null'}`);
    }

    si = sub.pending_setup_intent;
    if (si) {
      console.log(`[Checkout] Found SI on sub.pending_setup_intent: ${typeof si === 'string' ? si : si?.id || 'null'}`);
    }

    // 2. If nothing found on sub object, try searching invoices list (Aggressive Fallback)
    if (!pi && !si) {
      console.log(`[Checkout] No PI/SI on sub object, searching invoices list for ${sub.id}...`);
      const invoices = await stripe.invoices.list({
        subscription: sub.id,
        limit: 1,
        expand: ["data.payment_intent"],
      });
      if (invoices.data.length > 0) {
        invoice = invoices.data[0];
        pi = invoice.payment_intent;
        console.log(`[Checkout] Found PI via invoices.list: ${typeof pi === 'string' ? pi : pi?.id || 'null'}`);
      }
    }

    // 3. Last Resort Fallback: List PaymentIntents for the customer and match by invoice ID
    if (!pi && !si && invoice) {
      const invoiceId = typeof invoice === "string" ? invoice : invoice.id;
      console.log(`[Checkout] ULTIMATE FALLBACK: Listing PIs for customer ${sub.customer} to find link to ${invoiceId}...`);
      const customerPIs = await stripe.paymentIntents.list({
        customer: sub.customer as string,
        limit: 10,
      });

      const matchedPI = customerPIs.data.find(p =>
        (p as any).invoice === invoiceId ||
        (p as any).metadata?.invoice === invoiceId ||
        (p as any).metadata?.order_reference === invoiceId ||
        (p as any).payment_details?.order_reference === invoiceId
      );

      if (matchedPI) {
        pi = matchedPI;
        console.log(`[Checkout] Found matched PI via customer PI list: ${pi.id}`);
      }
    }

    // 4. Resolve IDs to objects if needed
    if (typeof pi === "string") {
      console.log(`[Checkout] Resolving PI ID ${pi}...`);
      pi = await stripe.paymentIntents.retrieve(pi);
    }
    if (typeof si === "string") {
      console.log(`[Checkout] Resolving SI ID ${si}...`);
      si = await stripe.setupIntents.retrieve(si);
    }

    const secret = pi?.client_secret || si?.client_secret;
    console.log(`[Checkout] Final secret status: ${secret ? 'Found' : 'MISSING'}`);

    if (!secret && (pi || si)) {
      console.log(`[Checkout] Found PI/SI but NO client_secret. PI status: ${pi?.status}, SI status: ${si?.status}`);
    }

    return secret;
  };

  // 1. Fetch subscriptions list
  console.log(`[Checkout] Listing subscriptions for customer ${customerId} (site: ${siteSlug})`);
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
    expand: ["data.latest_invoice.payment_intent", "data.pending_setup_intent"],
  });

  // 2. Priority Lookup: Active/Trialing > Incomplete/Past Due
  const activeSub = subscriptions.data.find(
    (s) => (s.status === "active" || s.status === "trialing") &&
      (s.metadata.siteSlug === siteSlug || s.items.data.some(i => i.price.id === priceId))
  );

  if (activeSub) {
    console.log(`[Checkout] Found active subscription: ${activeSub.id}`);
    return { type: "active" as const, subscriptionId: activeSub.id };
  }

  const incompleteSub = subscriptions.data.find(
    (s) => (s.status === "incomplete" || s.status === "past_due" || s.status === "unpaid") &&
      (s.metadata.siteSlug === siteSlug || s.items.data.some(i => i.price.id === priceId))
  );

  if (incompleteSub) {
    console.log(`[Checkout] Found incomplete sub: ${incompleteSub.id}, status: ${incompleteSub.status}`);
    const clientSecret = await getSecretFromSub(incompleteSub);

    if (clientSecret) {
      console.log(`[Checkout] Resuming incomplete sub ${incompleteSub.id}`);
      return {
        type: "new" as const,
        subscriptionId: incompleteSub.id,
        clientSecret: clientSecret,
      };
    }

    // Cleanup un-resumable sub
    console.log(`[Checkout] Cannot resume incomplete sub ${incompleteSub.id}, canceling`);
    try { await stripe.subscriptions.cancel(incompleteSub.id); } catch (e) { }
  }

  // 3. Create Subscription
  console.log(`[Checkout] Creating NEW subscription for ${customerId}, price: ${priceId}`);
  let subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription"
    },
    expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
    metadata: {
      userId: sessionUser.id,
      siteSlug,
      ...metadata,
    },
  });

  console.log(`[Checkout] Created sub: ${subscription.id}`);
  let clientSecret = await getSecretFromSub(subscription);

  // 4. Retry loop if missing (Stripe can be slightly async)
  let retries = 0;
  while (!clientSecret && retries < 3 && subscription.status === "incomplete") {
    retries++;
    console.log(`[Checkout] Secret missing after creation, retry ${retries}/3 in 1.5s...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    subscription = await stripe.subscriptions.retrieve(subscription.id, {
      expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
    });
    clientSecret = await getSecretFromSub(subscription);
  }

  if (!clientSecret) {
    console.error(`[Checkout] STILL no client_secret for sub ${subscription.id}`, {
      status: subscription.status,
      hasInvoice: !!subscription.latest_invoice,
    });
  }

  return {
    type: "new" as const,
    subscriptionId: subscription.id,
    clientSecret: clientSecret ?? null,
  };
}
