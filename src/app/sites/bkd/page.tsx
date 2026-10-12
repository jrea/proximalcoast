import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { SubscribeButton } from "./_components/subscribe-button";
import { CompleteAccountForm } from "./_components/complete-account-form";
import { ManageMembership } from "./_components/dashboard";
import { SignupForm } from "./_components/signup-form";
import { syncUserSubscription } from "@/lib/billing/sync";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { PLANS } from "./config";

interface MembershipSubscription {
  status: string;
  cancelAtPeriodEnd: boolean;
  expiresAt: Date;
  plan: string;
  priceAmount: number | null;
  priceCurrency: string | null;
  updatedAt: Date;
}

/**
 * BKD Page — The Hall of Martial Spirit
 * Focused on action at the top, with Budo philosophy as the foundation in the footer.
 */
export default async function BKDPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const success = params.success === "true";
  const sessionId = params.session_id as string | undefined;

  const session = await auth.api.getSession({ headers: await headers() });

  let subscription: MembershipSubscription | null = null;
  let hasSubscription = false;

  if (session?.user) {
    subscription = await prisma.user_subscription.findUnique({
      where: { userId_siteSlug: { userId: session.user.id, siteSlug: "bkd" } },
      select: {
        status: true,
        cancelAtPeriodEnd: true,
        expiresAt: true,
        plan: true,
        priceAmount: true,
        priceCurrency: true,
        updatedAt: true,
      },
    });

    const isStale = subscription && (new Date().getTime() - new Date(subscription.updatedAt).getTime() > 10 * 60 * 1000);

    if (!subscription || isStale) {
      const synced = await syncUserSubscription(session.user.id, "bkd");
      if (synced) {
        subscription = {
          status: synced.status,
          cancelAtPeriodEnd: synced.cancelAtPeriodEnd,
          expiresAt: synced.expiresAt,
          plan: synced.plan,
          priceAmount: synced.priceAmount,
          priceCurrency: synced.priceCurrency,
          updatedAt: synced.updatedAt,
        };
      }
    }

    hasSubscription =
      !!subscription &&
      (subscription.status === "active" || subscription.status === "trialing");
  }

  // Fetch BKD dynamic price for the card
  let bkdPrice = { amount: 15000, currency: 'usd' };
  try {
    const priceId = PLANS.BKD_SUBSCRIPTION.priceId;
    if (priceId && !priceId.includes('placeholder')) {
      const price = await stripe.prices.retrieve(priceId);
      if (price.unit_amount) {
        bkdPrice = { amount: price.unit_amount, currency: price.currency };
      }
    }
  } catch (e) {
    console.error("Failed to fetch Stripe price for BKD:", e);
  }

  const spirits = [
    { kanji: "初心", name: "Shoshin", meaning: "Beginner's Mind", desc: "Openness, eagerness, and absence of preconception." },
    { kanji: "残心", name: "Zanshin", meaning: "Lingering Mind", desc: "Total awareness and continuous focus." },
    { kanji: "無心", name: "Mushin", meaning: "No Mind", desc: "Acting instinctively without ego or hesitation." },
    { kanji: "不動心", name: "Fudoshin", meaning: "Immovable Mind", desc: "A calm spirit unaffected by surprise." },
    { kanji: "洗心", name: "Senshin", meaning: "Purified Mind", desc: "A spirit seeking to protect and harmonize." }
  ];

  return (
    <div className="flex flex-col items-center px-4 py-8 md:py-24 md:px-12 relative overflow-x-hidden min-h-screen bkd-shoji-enter bg-[var(--bkd-surface)]">

      {/* Background Watermarks - Refined positioning */}
      <div className="hidden xl:block fixed left-12 top-1/4 bkd-vertical-text text-5xl select-none opacity-[0.03] pointer-events-none">
        武道精神
      </div>
      <div className="hidden xl:block fixed right-12 top-1/3 bkd-vertical-text text-5xl select-none opacity-[0.03] pointer-events-none">
        礼に始まり礼に終わる
      </div>

      <div className="w-full max-w-5xl space-y-12 md:space-y-32 z-10 flex flex-col items-center">

        {/* Hero Section */}
        <header className="text-center space-y-4 w-full">
          <div className="space-y-4">
            <h1 className="bkd-h2 md:bkd-h1 uppercase tracking-[0.1em] md:tracking-[0.2em] text-3xl sm:text-4xl md:text-[72px] font-black leading-tight text-balance">
              Bushin Kan Dojo
            </h1>
            <p className="bkd-mono text-[10px] opacity-40 uppercase tracking-[0.5em] font-bold">Member Portal</p>
          </div>

        </header>

        {/* Action / Primary Section */}
        <section className="w-full max-w-4xl px-0 md:px-4 space-y-12 md:space-y-24">

          {/* Membership States */}
          <div className="w-full">
            {success ? (
              <div className="p-6 md:p-12 bg-white border border-[var(--bkd-border)] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {sessionId ? (
                  <CompleteAccountForm sessionId={sessionId} />
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-full border border-[#BC241C] flex items-center justify-center mx-auto mb-6 bg-white shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-[#BC241C]" />
                    </div>
                    <h2 className="bkd-h2 uppercase tracking-[0.2em]">Payment Successful</h2>
                    <p className="bkd-body italic opacity-60">Welcome to the dojo. Your membership is now active.</p>
                    <Link
                      href="/"
                      className="bkd-btn-primary px-8 py-3 mt-4"
                    >
                      Enter Dashboard
                    </Link>
                  </div>
                )}
              </div>
            ) : !session ? (
              <div className="w-full">
                <SignupForm />
              </div>
            ) : hasSubscription ? (
              <div className="w-full">
                <ManageMembership initialSubscription={subscription} />
              </div>
            ) : (
              <div className="space-y-8">
                <SubscribeButton
                  user={session.user}
                  initialStatus={subscription?.status}
                  priceAmount={bkdPrice.amount}
                  priceCurrency={bkdPrice.currency}
                />
              </div>
            )}
          </div>
        </section>

        {/* Foundation Section */}
        <section className="w-full pt-16 md:pt-32 space-y-12 md:space-y-20">
          <div className="flex items-center gap-4 opacity-20">
            <div className="h-px bg-[var(--bkd-ink)] flex-1" />
            <h2 className="bkd-h2 uppercase tracking-[0.3em] md:tracking-[0.6em] text-base md:text-lg font-bold whitespace-nowrap">Go-no-shin</h2>
            <div className="h-px bg-[var(--bkd-ink)] flex-1" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 max-w-5xl mx-auto w-full">
            {spirits.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-20 h-20 rounded-full border border-[var(--bkd-border)] flex items-center justify-center relative group transition-all hover:border-[#BC241C] duration-700 bg-white shadow-sm">
                  <span className="bkd-vertical-text text-xl absolute opacity-[0.03] group-hover:opacity-[0.1] transition-opacity top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">{s.kanji}</span>
                  <span className="bkd-mono text-[11px] font-bold z-10 group-hover:text-[#BC241C] transition-colors">{s.name}</span>
                </div>
                <div className="space-y-3">
                  <p className="bkd-mono text-[9px] font-bold tracking-[0.3em] text-[#BC241C] opacity-80">{s.meaning}</p>
                  <p className="bkd-body text-[11px] opacity-40 leading-relaxed px-2 font-serif italic">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-8 md:pt-16 space-y-8 md:space-y-10 border-t border-[var(--bkd-border)] border-dashed">
            <p className="bkd-body text-base max-w-2xl mx-auto opacity-50 leading-relaxed italic font-serif">
              &ldquo;The ultimate aim of Budo lies not in winning or losing, but in the perfection of the character of its participants.&rdquo;
            </p>
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center justify-center gap-6 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-[#BC241C]" />
                <p className="bkd-mono text-[10px] tracking-[0.8em] uppercase font-bold">Dai Nippon Butoku Kai</p>
                <div className="w-1.5 h-1.5 rounded-full bg-[#BC241C]" />
              </div>
              <p className="bkd-mono text-[8px] opacity-20 tracking-widest">Est. 1988 · Kitty Hawk, NC</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
