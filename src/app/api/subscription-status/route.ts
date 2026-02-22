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
  const forceSync = searchParams.get("sync") === "true";

  try {
    let subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: sessionUser.user.id,
          siteSlug,
        },
      },
      select: {
        id: true,
        status: true,
        cancelAtPeriodEnd: true,
        expiresAt: true,
        plan: true,
        priceAmount: true,
        priceCurrency: true,
        updatedAt: true,
      }
    });

    const isStale = subscription && (Date.now() - new Date(subscription.updatedAt).getTime() > 10 * 60 * 1000); // 10 mins

    // AUTO-SYNC: If missing, forced, or stale, try to recover from Stripe
    if (!subscription || forceSync || isStale) {
      if (forceSync) console.log(`[Status API] Force sync requested for ${sessionUser.user.email}`);
      else if (isStale) console.log(`[Status API] Sub for ${sessionUser.user.email} is stale (>10m), syncing...`);

      const synced = await syncUserSubscription(sessionUser.user.id, siteSlug);
      if (synced) {
        subscription = {
          id: synced.id,
          status: synced.status,
          cancelAtPeriodEnd: synced.cancelAtPeriodEnd,
          expiresAt: synced.expiresAt as any,
          plan: synced.plan,
          priceAmount: synced.priceAmount,
          priceCurrency: synced.priceCurrency,
          updatedAt: synced.updatedAt,
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
