import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { syncUserSubscription } from "@/lib/billing/sync";

export async function GET(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteSlug = searchParams.get("siteSlug") || "jerkstore";

  try {
    let subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: sessionUser.user.id,
          siteSlug,
        },
      },
      select: {
        status: true,
        cancelAtPeriodEnd: true,
        expiresAt: true,
        plan: true,
        priceAmount: true,
        priceCurrency: true,
      }
    });

    // AUTO-SYNC: If missing, try to recover from Stripe per user request
    if (!subscription) {
      console.log(`[Status API] No sub found for ${sessionUser.user.email}, attempting recovery...`);
      const synced = await syncUserSubscription(sessionUser.user.id, siteSlug);
      if (synced) {
        subscription = {
          status: synced.status,
          cancelAtPeriodEnd: synced.cancelAtPeriodEnd,
          expiresAt: synced.expiresAt as any,
          plan: synced.plan,
          priceAmount: synced.priceAmount,
          priceCurrency: synced.priceCurrency,
        };
      }
    }

    return NextResponse.json({
      subscription: subscription || null
    });
  } catch (error) {
    console.error("Subscription Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
