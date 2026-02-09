import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: sessionUser.user.email,
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
      return_url: `${req.headers.get("origin")}/?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
