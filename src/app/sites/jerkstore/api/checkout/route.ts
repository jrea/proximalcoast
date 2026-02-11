import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPlanPriceId } from "../../config";
import { createCheckoutSession } from "@/lib/billing/checkout";

export async function POST(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Resolve priceId from server-only config
    const priceId = getPlanPriceId(planId);

    if (!priceId) {
      console.error(`Price ID not found for plan ${planId}`);
      return NextResponse.json(
        { error: "Invalid plan or configuration error" },
        { status: 400 }
      );
    }

    const result = await createCheckoutSession({
      user: {
        id: sessionUser.user.id,
        email: sessionUser.user.email,
        name: sessionUser.user.name,
      },
      siteSlug: "jerkstore",
      priceId: priceId,
      returnUrl: `${req.headers.get("origin")}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
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
    console.error("Jerkstore Checkout Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
