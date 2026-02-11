import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PLANS, getPlanPriceId } from "../../config";
import { createCheckoutSession } from "@/lib/billing/checkout";

export async function POST(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  // If sessionUser is missing, we proceed as guest checkout
  const checkoutUser = sessionUser ? {
    id: sessionUser.user.id,
    email: sessionUser.user.email,
    name: sessionUser.user.name,
  } : null;

  try {
    const planId = PLANS.BKD_SUBSCRIPTION.id;
    const priceId = getPlanPriceId(planId);

    if (!priceId) {
      console.error(`Price ID not found for BKD subscription`);
      return NextResponse.json(
        { error: "Configuration error: Price ID not found" },
        { status: 400 }
      );
    }

    const result = await createCheckoutSession({
      user: checkoutUser,
      siteSlug: "bkd",
      priceId: priceId,
      returnUrl: `${req.headers.get("origin")}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        planId: planId
      }
    });

    if ('type' in result) {
      if (result.type === 'restored' || result.type === 'active') {
        return NextResponse.json({ restored: true });
      }
    }

    // It's a session
    return NextResponse.json({ clientSecret: (result as any).client_secret });
  } catch (error) {
    console.error("BKD Checkout Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
