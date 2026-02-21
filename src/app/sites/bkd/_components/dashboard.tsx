"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Settings2, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Subscription {
  status: string;
  cancelAtPeriodEnd: boolean;
  expiresAt: string;
  plan: string;
  priceAmount?: number | null;
  priceCurrency?: string | null;
}

export function ManageMembership({ initialSubscription }: { initialSubscription?: Subscription | null }) {
  const { data: session } = authClient.useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription || null);
  const [loading, setLoading] = useState(!initialSubscription);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (initialSubscription && subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
      setLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription-status?siteSlug=bkd");
        const data = await res.json();

        if (!data.subscription || (data.subscription.status !== 'active' && data.subscription.status !== 'trialing')) {
          console.log("[Dashboard] Status looks bad, trying to sync...");
        }

        if (data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, [initialSubscription]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your membership? You will keep access until the end of your billing period.")) return;

    setCancelling(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "bkd" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({ type: 'success', text: "Your membership has been set to cancel." });
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-20">
      {/* Premium Membership Card - Katana Outer / Bonsai Inner */}
      <div className="bg-stone-900/40 border border-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_10px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] text-stone-200 relative group transition-all duration-700 hover:border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

        {/* Diagonal Blade Glare */}
        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-[25deg] group-hover:animate-[blade-glint_2s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>

        {/* Belt Color Decorative Strip - Earthy/Resinated Look */}
        <div className="h-1 w-full flex relative z-20 opacity-80 saturate-50 brightness-110">
          <div className="h-full flex-1 bg-stone-200" title="White Belt" />
          <div className="h-full flex-1 bg-yellow-500" title="Yellow Belt" />
          <div className="h-full flex-1 bg-emerald-600" title="Green Belt" />
          <div className="h-full flex-1 bg-cyan-700" title="Blue Belt" />
          <div className="h-full flex-1 bg-amber-800" title="Brown Belt" />
          <div className="h-full flex-1 bg-black border-l border-white/10" title="Black Belt" />
        </div>

        <div className="p-8 sm:p-10 space-y-10 relative z-10 bg-transparent h-full">
          {/* Header & Status */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-emerald-500/20 blur-xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative px-6 py-2 bg-black/40 text-stone-200 rounded-full flex items-center gap-3 border border-white/5 backdrop-blur-md shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-sm">Active Status</span>
              </div>
            </div>

            <div className="text-center space-y-2 mt-2">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest leading-none text-white drop-shadow-sm">
                {subscription?.plan || 'Standard'} Tier
              </h2>
              <p className="text-emerald-500/80 text-[10px] font-black uppercase tracking-[0.5em] pt-2">
                Verified Student Access
              </p>
            </div>
          </div>

          {/* Pricing & Features Grid - Bonsai Curves */}
          <div className="grid grid-cols-1 gap-4 bg-black/20 rounded-2xl p-8 border border-white/5 shadow-inner relative overflow-hidden group/pricing">
            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-[25deg] group-hover/pricing:animate-[blade-glint_2s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>
            <div className="text-center">
              <span className="text-5xl font-black tracking-widest text-white font-mono drop-shadow-sm">
                {subscription?.priceAmount
                  ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: subscription.priceCurrency || 'USD',
                    maximumFractionDigits: 0
                  }).format(subscription.priceAmount / 100)
                  : '$150'}
              </span>
              <span className="text-stone-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 align-top">/ Month</span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-2" />

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3 text-stone-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-sm">All Sessions</span>
              </div>
              <div className="flex items-center gap-3 text-stone-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-sm">Promotion Testing</span>
              </div>
            </div>
          </div>

          {/* Renewal Info / Management */}
          <div className="space-y-4 pt-4">
            {subscription?.expiresAt && !subscription.cancelAtPeriodEnd && (
              <div className="flex items-center justify-between text-stone-400 border-b border-white/5 pb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Billing Cycle Ends</span>
                <span className="text-[10px] font-black font-mono tracking-[0.2em] text-stone-200 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                  {new Date(subscription.expiresAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </span>
              </div>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <div className="w-full py-5 px-6 bg-red-950/20 rounded-xl flex items-center gap-5 text-red-200 border border-red-500/30 backdrop-blur-sm shadow-inner relative overflow-hidden">
                <span className="absolute left-0 top-0 w-1 h-full bg-red-500 opacity-50"></span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-none mb-1">Access Expiring</p>
                  <p className="text-[10px] font-mono tracking-widest text-red-400/80">Valid until {new Date(subscription.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-5 relative rounded-xl backdrop-blur-sm animate-in zoom-in-95 duration-300 font-mono text-xs uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-200' : 'bg-red-950/40 border border-red-500/30 text-red-200'}`}>
                <span className={`absolute left-0 top-0 w-1 h-full opacity-50 rounded-l-xl ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                &gt;_ {message.text}
              </div>
            )}

            {!subscription?.cancelAtPeriodEnd && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full py-5 bg-transparent border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-stone-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 relative overflow-hidden group/cancel"
              >
                {cancelling ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Executing...
                  </div>
                ) : "Revoke Membership"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-8 pt-6">
        <div className="flex flex-col items-center gap-3 opacity-80 relative">
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.5em] font-black">Authorized Record</p>
          <p className="text-[10px] font-black font-mono tracking-widest text-stone-300 bg-stone-900/40 border border-white/5 py-2 px-6 rounded-full shadow-inner">
            {session?.user.email}
          </p>
        </div>

        <button
          onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-stone-900/40 border border-white/5 rounded-full hover:border-white/10 text-stone-400 hover:text-white transition-all duration-300 shadow-sm relative overflow-hidden hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-[25deg] group-hover:animate-[blade-glint_1.5s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform relative z-10" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] relative z-10">Secure Logout</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blade-glint {
          0% { left: -100%; }
          50%, 100% { left: 200%; }
        }
      `}} />
    </div>
  );
}
