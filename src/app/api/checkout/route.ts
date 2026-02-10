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
      checkoutOptions.customer_email = sessionUser.user.email;
      // You can't pass 'name' directly to Checkout, but you can use customer_data if needed
      // Actually, customer_email + completion usually handles it.
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
