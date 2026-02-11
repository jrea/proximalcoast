import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { priceId, siteSlug = "jerkstore" } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // 1. Fetch full user to check for existing Stripe Customer ID
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.user.id },
      select: { stripeCustomerId: true, name: true, email: true }
    });

    const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      ui_mode: "embedded",
      metadata: {
        userId: sessionUser.user.id,
        siteSlug: siteSlug,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      return_url: `${req.headers.get("origin")}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    };

    // 2. Use existing customer or create new one with details
    if (user?.stripeCustomerId) {
      checkoutOptions.customer = user.stripeCustomerId;
    } else {
      // Check if a customer with this email already exists in Stripe
      const email = user?.email || sessionUser.user.email;

      if (email) {
        let customerIdToUse = null;

        // Search for existing customers by email
        const existingCustomers = await stripe.customers.list({
          email: email,
          limit: 5, // Check a few recent ones
        });

        // 1. Prefer exact match on metadata.userId
        // This ensures we pick the customer specifically linked to this user, if one exists.
        const exactMatch = existingCustomers.data.find(
          (c) => c.metadata?.userId === sessionUser.user.id
        );

        if (exactMatch) {
          customerIdToUse = exactMatch.id;
        } else {
          // 2. Fallback to claiming an "orphaned" customer (no userId in metadata)
          // This handles legacy customers created before we started adding metadata,
          // allowing us to link them to the current user.
          const orphan = existingCustomers.data.find(
            (c) => !c.metadata?.userId
          );
          if (orphan) {
            customerIdToUse = orphan.id;
            // Update the orphan with our metadata so it's claimed by this user
            await stripe.customers.update(orphan.id, {
              metadata: {
                userId: sessionUser.user.id,
                siteSlug: siteSlug,
              },
            });
          }
        }

        if (customerIdToUse) {
          checkoutOptions.customer = customerIdToUse;

          // Update local user record with the found/claimed Stripe Customer ID
          await prisma.user.update({
            where: { id: sessionUser.user.id },
            data: { stripeCustomerId: customerIdToUse }
          });
        } else {
          // 3. No suitable existing customer found, create a new one
          const newCustomer = await stripe.customers.create({
            email: email,
            name: user?.name ?? undefined,
            metadata: {
              userId: sessionUser.user.id,
              siteSlug: siteSlug,
            },
          });

          checkoutOptions.customer = newCustomer.id;

          // Update local user record with the newly created Stripe Customer ID
          await prisma.user.update({
            where: { id: sessionUser.user.id },
            data: { stripeCustomerId: newCustomer.id }
          });
        }
      }
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create(checkoutOptions);
    } catch (error) {
      const stripeError = error as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      // Handle "No such customer" error by clearing the invalid ID and retrying
      if (stripeError.code === 'resource_missing' && stripeError.param === 'customer') {
        console.warn(`Stripe customer ${user?.stripeCustomerId} missing for user ${sessionUser.user.id}. Clearing and retrying...`);

        // Clear invalid ID from DB
        await prisma.user.update({
          where: { id: sessionUser.user.id },
          data: { stripeCustomerId: null }
        });

        // Update options to create new customer instead
        delete checkoutOptions.customer;
        checkoutOptions.customer_email = sessionUser.user.email;

        // Retry creation
        session = await stripe.checkout.sessions.create(checkoutOptions);
      } else {
        throw error; // Re-throw other errors
      }
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
