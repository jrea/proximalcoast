import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { SubscribeButton } from "./_components/subscribe-button";
import { CompleteAccountForm } from "./_components/complete-account-form";
import { ManageMembership } from "./_components/dashboard";
import { syncUserSubscription } from "@/lib/billing/sync";

export default async function BKDPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const success = params.success === "true";
  const sessionId = params.session_id as string | undefined;

  // 1. Get session server-side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. If session, get subscription status directly
  let subscription = null;
  let hasSubscription = false;

  if (session?.user) {
    subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: session.user.id,
          siteSlug: "bkd",
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

    // RECOVERY LOGIC: If no sub found in DB, double check Stripe
    if (!subscription) {
      console.log(`[BKD] No sub found for ${session.user.email}, attempting recovery...`);
      const synced = await syncUserSubscription(session.user.id, "bkd");
      if (synced) {
        subscription = {
          status: synced.status,
          cancelAtPeriodEnd: synced.cancelAtPeriodEnd,
          expiresAt: synced.expiresAt as any,
          plan: synced.plan,
          priceAmount: synced.priceAmount as any,
          priceCurrency: synced.priceCurrency as any,
        };
      }
    }

    hasSubscription = !!subscription && (subscription.status === "active" || subscription.status === "trialing");
  }
  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-12">
        {/* Persistent Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight uppercase">DNBK Karatedo</h1>
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">
            Monday & Wednesday • 7pm - 8pm
          </p>
        </div>

        {/* Dynamic Body Content - Instant SSR */}
        <div className="min-h-[200px] flex flex-col justify-center">
          {success && sessionId ? (
            <CompleteAccountForm sessionId={sessionId} />
          ) : session && hasSubscription ? (
            <ManageMembership initialSubscription={subscription as any} />
          ) : (
            <SubscribeButton user={session?.user} />
          )}
        </div>

        {/* Persistent Footer */}
        <p className="text-center text-[10px] text-neutral-300 uppercase tracking-[0.3em] font-black">
          Dai Nippon Butoku Kai
        </p>
      </div>
    </div>
  );
}
