import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

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

    const checkoutOptions: any = {
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

    const session = await stripe.checkout.sessions.create(checkoutOptions);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
