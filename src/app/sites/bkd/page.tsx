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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let subscription = null;
  let hasSubscription = false;
  let pendingDocuments: any[] = [];

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

    pendingDocuments = await prisma.bkd_document.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null }
        ],
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="bg-[#050505] min-h-screen text-slate-100 flex flex-col items-center justify-between p-6 md:p-12 font-sans selection:bg-emerald-900/50 selection:text-white relative overflow-hidden">

      {/* Background Organic/Bonsai Atmosphere (Soft, deep, flowing) */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-emerald-950/20 rounded-full blur-[150px] pointer-events-none -translate-x-1/3 -translate-y-1/3 mix-blend-screen mix-blend-lighten"></div>
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-stone-900/40 rounded-full blur-[180px] pointer-events-none translate-x-1/3 translate-y-1/3 mix-blend-lighten"></div>

      {/* Central focus glow */}
      <div className="fixed top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-900/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>

      {/* Subtle grain overlay for organic texture */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay z-0"></div>

      <div className="w-full max-w-xl space-y-12 z-10 flex flex-col flex-1 relative">

        {/* Persistent Header */}
        <div className="text-center space-y-8 pt-4 md:pt-12 relative z-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" style={{ textShadow: "0 0 40px rgba(52,211,153,0.1), 0 0 10px rgba(255,255,255,0.2)" }}>
              Bushin Kan<br />Dojo
            </h1>
            <p className="text-emerald-500/60 text-xs md:text-sm font-bold uppercase tracking-[0.4em]">
              Monday & Wednesday • 7pm - 8pm
            </p>
          </div>
          <div className="relative">
            {/* Katana Line - Sharp contrast */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-12 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent"></div>
            <p className="text-stone-300 text-sm max-w-sm mx-auto leading-relaxed pt-8 font-light tracking-wide">
              Dedicated to the preservation and promotion of traditional Japanese Budo. Founded in the spirit of "the hall of martial spirit," we focus on classical arts including Jujutsu, Kobudo, and Goshinjutsu to foster discipline, character, and spiritual enlightenment.
            </p>
          </div>
        </div>

        {/* Dynamic Body Content */}
        <div className="min-h-[200px] flex flex-col justify-center space-y-8 mt-12">
          {pendingDocuments.length > 0 && (
            <div className="bg-stone-900/30 border border-white/5 rounded-2xl p-8 space-y-6 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden group transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

              <h2 className="text-emerald-500/90 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                Action Required
              </h2>
              <div className="space-y-3 relative z-10">
                {pendingDocuments.map((doc) => (
                  <a
                    key={doc.id}
                    href={`/sign/${doc.id}`}
                    className="flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-xl hover:border-emerald-900/50 hover:bg-black/60 transition-all group/item shadow-sm backdrop-blur-md"
                  >
                    <span className="text-sm font-bold text-stone-300 group-hover/item:text-white transition-colors">{doc.filename}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-200 bg-stone-800/60 border border-white/5 px-4 py-2 rounded-full group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all shadow-sm">
                      Sign Now
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {success && sessionId ? (
            <CompleteAccountForm sessionId={sessionId} />
          ) : session && hasSubscription ? (
            <ManageMembership initialSubscription={subscription as any} />
          ) : (
            <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
              <SubscribeButton user={session?.user} />
            </div>
          )}
        </div>
      </div>

      {/* Persistent Footer */}
      <div className="relative text-center z-10 w-full pt-16 pb-4 opacity-50">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black border-t border-white/10 inline-block pt-8 px-12 mix-blend-screen">
          Dai Nippon Butoku Kai
        </p>
      </div>
    </div>
  );
}
