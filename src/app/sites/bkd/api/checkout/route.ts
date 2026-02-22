import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PLANS, getPlanPriceId } from "../../config";
import { createSubscriptionIntent } from "@/lib/billing/checkout";

export async function POST(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Session required" }, { status: 401 });
  }

  const checkoutUser = {
    id: sessionUser.user.id,
    email: sessionUser.user.email,
    name: sessionUser.user.name,
  };

  try {
    const planId = PLANS.BKD_SUBSCRIPTION.id;
    const priceId = getPlanPriceId(planId);

    console.log(`[BKD Checkout] User: ${checkoutUser.email}, Plan: ${planId}, Price ID: ${priceId}`);

    if (!priceId) {
      console.error(`Price ID not found for BKD subscription`);
      return NextResponse.json(
        { error: "Configuration error: Price ID not found" },
        { status: 400 }
      );
    }

    const result = await createSubscriptionIntent({
      user: checkoutUser,
      siteSlug: "bkd",
      priceId: priceId,
      metadata: { planId }
    });

    console.log(`[BKD Checkout] Result:`, {
      type: result.type,
      subscriptionId: result.subscriptionId,
      hasSecret: !!result.clientSecret
    });

    if (result.type === 'active') {
      return NextResponse.json({ restored: true });
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      subscriptionId: result.subscriptionId
    });
  } catch (error) {
    console.error("BKD Checkout Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
